import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-pg-pool-smoke-'))

function run(arguments_, cwd = root) {
  return execFileSync(npm, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
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

  const install = run([
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund',
    '--loglevel=notice'
  ], consumer)
  assert.doesNotMatch(install, /npm (?:warn|error)/i)

  await writeFile(path.join(consumer, 'verify.cjs'), `
const assert = require('node:assert/strict')
const Pool = require(${JSON.stringify(dependencyName)})
class Client {}
const pool = new Pool({ Client, max: 2 })
assert.equal(pool.Client, Client)
assert.equal(pool.options.max, 2)
assert.equal(pool.totalCount, 0)
`)
  execFileSync(process.execPath, ['verify.cjs'], { cwd: consumer, stdio: 'inherit' })

  const tree = JSON.parse(run(['ls', '--omit=dev', '--all', '--json'], consumer))
  assert.equal(tree.problems, undefined)
  const installed = tree.dependencies[dependencyName]
  assert(installed)
  assert.deepEqual(Object.keys(installed.dependencies || {}), ['pg'])
  assert.deepEqual(installed.dependencies.pg, {})

  const audit = JSON.parse(run(['audit', '--omit=dev', '--json'], consumer))
  assert.equal(audit.metadata.vulnerabilities.total, 0)

  const installedPackage = JSON.parse(await readFile(
    path.join(consumer, 'node_modules', ...dependencyName.split('/'), 'package.json'),
    'utf8'
  ))
  assert.equal(installedPackage.name, '@stackline/pg-pool')
}

try {
  const packed = JSON.parse(run([
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary
  ]))
  assert.equal(packed.length, 1)
  const archive = path.join(temporary, packed[0].filename)
  await verifyConsumer('scoped-consumer', '@stackline/pg-pool', archive)
  await verifyConsumer('legacy-alias-consumer', 'pg-pool', archive)
  console.log('Packed direct and legacy-alias installs have an empty production closure.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
