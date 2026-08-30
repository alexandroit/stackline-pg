import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const repository = path.resolve(root, '../..')
const destination = path.join(root, 'release-candidate')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function command(executable, arguments_, cwd = root) {
  return execFileSync(executable, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function digest(algorithm, bytes, encoding = 'hex') {
  return createHash(algorithm).update(bytes).digest(encoding)
}

try {
  await access(destination)
  throw new Error(`release candidate already exists: ${destination}`)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

execFileSync(npm, ['run', 'verify'], {
  cwd: root,
  env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
  stdio: 'inherit'
})

assert.equal(
  command('git', ['status', '--porcelain', '--untracked-files=normal'], repository),
  '',
  'release source must be committed and clean'
)

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const expectedTag = `stackline-pg-pool-v${packageJson.version}`
const tagsAtHead = command('git', ['tag', '--points-at', 'HEAD'], repository).split('\n')
assert(tagsAtHead.includes(expectedTag), `${expectedTag} must point at HEAD`)

let staging = await mkdtemp(path.join(root, '.release-candidate-staging-'))

try {
  const packedJson = command(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', staging
  ])
  const packed = JSON.parse(packedJson)
  assert.equal(packed.length, 1)
  const details = packed[0]
  const archive = path.join(staging, details.filename)
  const bytes = await readFile(archive)
  const sha1 = digest('sha1', bytes)
  const sha256 = digest('sha256', bytes)
  const sha512 = digest('sha512', bytes)
  const integrity = `sha512-${digest('sha512', bytes, 'base64')}`

  assert.equal(details.shasum, sha1)
  assert.equal(details.integrity, integrity)

  const sourceCommit = command('git', ['rev-parse', 'HEAD'], repository)
  const manifest = {
    schema: 'stackline-release-artifact-v1',
    package: `${details.name}@${details.version}`,
    filename: details.filename,
    sha1,
    sha256,
    sha512,
    integrity,
    packedSize: details.size,
    unpackedSize: details.unpackedSize,
    entryCount: details.entryCount,
    sourceCommit,
    sourceTag: expectedTag,
    files: details.files.map(({ path: file, size, mode }) => ({ file, size, mode }))
  }

  await writeFile(
    path.join(staging, 'artifact-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  )
  await writeFile(
    path.join(staging, 'inventory.json'),
    JSON.stringify({ package: manifest.package, files: manifest.files }, null, 2) + '\n'
  )
  await writeFile(path.join(staging, 'SHA1SUMS'), `${sha1}  ${details.filename}\n`)
  await writeFile(path.join(staging, 'SHA256SUMS'), `${sha256}  ${details.filename}\n`)
  await writeFile(path.join(staging, 'SHA512SUMS'), `${sha512}  ${details.filename}\n`)

  const upstreamDist = JSON.parse(command(npm, ['view', 'pg-pool@3.14.0', 'dist', '--json']))
  await writeFile(path.join(staging, 'source-provenance.json'), JSON.stringify({
    compatibilityBaseline: {
      package: 'pg-pool@3.14.0',
      repository: 'https://github.com/brianc/node-postgres',
      sourceCommit: 'c9e57617bc92c2ded23a75345f50eadc527bd131',
      shasum: upstreamDist.shasum,
      integrity: upstreamDist.integrity
    },
    releaseSource: { commit: sourceCommit, tag: expectedTag }
  }, null, 2) + '\n')
  await writeFile(path.join(staging, 'licenses.json'), JSON.stringify({
    package: { name: packageJson.name, license: 'MIT', file: 'LICENSE' },
    productionDependencies: [],
    maintainedUpstreamSource: {
      package: 'pg-pool@3.14.0',
      license: 'MIT',
      notice: 'NOTICE'
    }
  }, null, 2) + '\n')
  await copyFile(path.join(root, 'CHANGELOG.md'), path.join(staging, 'RELEASE_NOTES.md'))

  const sbomConsumer = await mkdtemp(path.join(staging, '.sbom-consumer-'))
  await writeFile(path.join(sbomConsumer, 'package.json'), JSON.stringify({
    name: 'stackline-pg-pool-sbom-consumer',
    private: true,
    version: '1.0.0'
  }, null, 2) + '\n')
  command(npm, [
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', archive
  ], sbomConsumer)
  const sbom = command(npm, ['sbom', '--omit=dev', '--sbom-format', 'cyclonedx'], sbomConsumer)
  await writeFile(path.join(staging, 'sbom.cdx.json'), sbom + '\n')
  await rm(sbomConsumer, { recursive: true, force: true })

  await rename(staging, destination)
  staging = null
  console.log(`Prepared immutable ${details.filename} (${sha256}).`)
} finally {
  if (staging) await rm(staging, { recursive: true, force: true })
}
