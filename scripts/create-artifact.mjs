import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, copyFile, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
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

function resolvePackedPath(directory, filename) {
  const reported = path.join(directory, filename)
  const npm8 = path.join(directory, filename.replace(/^@([^/]+)\//, '$1-'))
  return access(reported).then(() => reported, () => access(npm8).then(() => npm8))
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

assert.equal(command('git', ['status', '--porcelain', '--untracked-files=normal']), '', 'release source must be clean')

const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const expectedTag = `stackline-v${manifest.version}`
assert.ok(command('git', ['tag', '--points-at', 'HEAD']).split('\n').includes(expectedTag), `${expectedTag} must point at HEAD`)

let staging = await mkdtemp(path.join(root, '.release-candidate-staging-'))
try {
  const packed = JSON.parse(command(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', staging
  ]))
  assert.equal(packed.length, 1)
  const details = packed[0]
  const archive = await resolvePackedPath(staging, details.filename)
  const canonicalFilename = details.filename.replace(/^@([^/]+)\//, '$1-')
  if (path.basename(archive) !== canonicalFilename) {
    throw new Error(`unexpected packed filename: ${archive}`)
  }

  const bytes = await readFile(archive)
  const sha1 = digest('sha1', bytes)
  const sha256 = digest('sha256', bytes)
  const sha512 = digest('sha512', bytes)
  const integrity = `sha512-${digest('sha512', bytes, 'base64')}`
  assert.equal(details.shasum, sha1)
  assert.equal(details.integrity, integrity)

  const sourceCommit = command('git', ['rev-parse', 'HEAD'])
  const artifactManifest = {
    schema: 'stackline-release-artifact-v1',
    package: `${details.name}@${details.version}`,
    filename: canonicalFilename,
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

  await writeFile(path.join(staging, 'artifact-manifest.json'), JSON.stringify(artifactManifest, null, 2) + '\n')
  await writeFile(path.join(staging, 'inventory.json'), JSON.stringify({
    package: artifactManifest.package,
    files: artifactManifest.files
  }, null, 2) + '\n')
  await writeFile(path.join(staging, 'SHA1SUMS'), `${sha1}  ${canonicalFilename}\n`)
  await writeFile(path.join(staging, 'SHA256SUMS'), `${sha256}  ${canonicalFilename}\n`)
  await writeFile(path.join(staging, 'SHA512SUMS'), `${sha512}  ${canonicalFilename}\n`)
  await writeFile(path.join(staging, 'source-provenance.json'), JSON.stringify({
    compatibilityBaseline: {
      package: 'pg@8.23.0',
      repository: 'https://github.com/brianc/node-postgres',
      sourceCommit: 'c9e57617bc92c2ded23a75345f50eadc527bd131'
    },
    releaseSource: { commit: sourceCommit, tag: expectedTag }
  }, null, 2) + '\n')
  await writeFile(path.join(staging, 'licenses.json'), JSON.stringify({
    package: { name: manifest.name, license: 'MIT', file: 'LICENSE' },
    productionDependencies: Object.entries({ ...manifest.dependencies, ...manifest.optionalDependencies }).map(
      ([name, version]) => ({ name, version, reviewed: true })
    ),
    maintainedUpstreamSource: { package: 'pg@8.23.0', license: 'MIT', notice: 'NOTICE' }
  }, null, 2) + '\n')
  await copyFile(path.join(root, 'CHANGELOG.md'), path.join(staging, 'RELEASE_NOTES.md'))

  const consumer = await mkdtemp(path.join(staging, '.sbom-consumer-'))
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'stackline-pg-sbom-consumer',
    private: true,
    version: '1.0.0'
  }, null, 2) + '\n')
  command(npm, ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', archive], consumer)
  await writeFile(
    path.join(staging, 'sbom.cdx.json'),
    command(npm, ['sbom', '--omit=dev', '--sbom-format', 'cyclonedx'], consumer) + '\n'
  )
  await rm(consumer, { recursive: true, force: true })

  await rename(staging, destination)
  staging = null
  console.log(`Prepared immutable ${canonicalFilename} (${sha256}).`)
} finally {
  if (staging) await rm(staging, { recursive: true, force: true })
}
