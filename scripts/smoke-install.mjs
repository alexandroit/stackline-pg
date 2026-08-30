import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-pg-smoke-'))

function run(executable, arguments_, cwd = root) {
  const result = spawnSync(executable, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' }
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${executable} ${arguments_.join(' ')} failed\n${result.stdout}\n${result.stderr}`)
  }
  return { stdout: result.stdout, stderr: result.stderr }
}

async function packedArchive() {
  const packed = JSON.parse(run(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary
  ]).stdout)
  assert.equal(packed.length, 1)
  let archive = path.join(temporary, packed[0].filename)
  try {
    await access(archive)
  } catch {
    archive = path.join(temporary, packed[0].filename.replace(/^@([^/]+)\//, '$1-'))
    await access(archive)
  }
  return archive
}

async function verifyConsumer(name, dependencyName, archive) {
  const consumer = path.join(temporary, name)
  await mkdir(consumer)
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name,
    private: true,
    version: '1.0.0',
    dependencies: { [dependencyName]: `file:${archive}` }
  }, null, 2) + '\n')

  const install = run(npm, [
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', '--loglevel=notice'
  ], consumer)
  const installLog = `${install.stdout}\n${install.stderr}`
  assert.doesNotMatch(installLog, /npm\s+(?:warn|error)/i)
  assert.doesNotMatch(installLog, /deprecated/i)

  await writeFile(path.join(consumer, 'verify.cjs'), `
const assert = require('node:assert/strict')
const pg = require(${JSON.stringify(dependencyName)})
assert.equal(typeof pg.Client, 'function')
assert.equal(typeof pg.Pool, 'function')
assert.equal(pg.escapeIdentifier('a"b'), '"a""b"')
const pool = new pg.Pool({ max: 2 })
assert.equal(pool.options.max, 2)
assert.equal(pool.totalCount, 0)
pool.end().catch((error) => { throw error })
`)
  run(process.execPath, ['verify.cjs'], consumer)

  await writeFile(path.join(consumer, 'verify.mjs'), `
import assert from 'node:assert/strict'
import pg, { Client, Pool } from ${JSON.stringify(dependencyName)}
assert.equal(Client, pg.Client)
assert.equal(Pool, pg.Pool)
`)
  run(process.execPath, ['verify.mjs'], consumer)

  const tree = JSON.parse(run(npm, ['ls', '--omit=dev', '--all', '--json'], consumer).stdout)
  assert.equal(tree.problems, undefined)
  assert.ok(tree.dependencies[dependencyName])

  const serializedTree = JSON.stringify(tree)
  for (const forbidden of ['graceful-fs', 'inflight', 'postgres-interval', 'split2', 'xtend']) {
    assert.doesNotMatch(serializedTree, new RegExp(`"${forbidden}"`), `${forbidden} entered the production closure`)
  }

  const audit = JSON.parse(run(npm, ['audit', '--omit=dev', '--json'], consumer).stdout)
  assert.equal(audit.metadata.vulnerabilities.total, 0)

  const installedManifest = JSON.parse(await readFile(
    path.join(consumer, 'node_modules', ...dependencyName.split('/'), 'package.json'),
    'utf8'
  ))
  assert.equal(installedManifest.name, '@stackline/pg')
  assert.equal(installedManifest.version, '1.0.0')
}

try {
  const archive = await packedArchive()
  await verifyConsumer('scoped-consumer', '@stackline/pg', archive)
  await verifyConsumer('legacy-name-consumer', 'pg', archive)
  console.log('Packed scoped and legacy-name consumers passed with a clean production closure.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
