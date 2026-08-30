import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const pg = require(path.join(root, 'lib/index.js'))
const esm = await import(pathToFileURL(path.join(root, 'esm/index.mjs')).href)

for (const key of [
  'Client',
  'Connection',
  'DatabaseError',
  'Pool',
  'Query',
  'Result',
  'TypeOverrides',
  'defaults',
  'escapeIdentifier',
  'escapeLiteral',
  'types'
]) {
  assert.ok(pg[key], `CommonJS export ${key} is missing`)
  assert.equal(esm[key], pg[key], `ESM export ${key} differs from CommonJS`)
}

assert.equal(esm.default, pg)
assert.equal(pg.escapeIdentifier('a"b'), '"a""b"')
assert.equal(pg.escapeLiteral("a'b"), "'a''b'")

const client = new pg.Client({ user: 'contract', database: 'contract' })
assert.equal(client.user, 'contract')
assert.equal(client.database, 'contract')

const pool = new pg.Pool({ max: 3 })
assert.equal(pool.options.max, 3)
assert.equal(pool.Client, pg.Client)
assert.equal(pool.totalCount, 0)
await pool.end()

assert.doesNotThrow(() => require(path.join(root, 'lib/client.js')))
assert.doesNotThrow(() => require(path.join(root, 'lib/query.js')))
assert.equal(pg.native, null)

console.log('CommonJS, ESM, Client, Pool, deep import, and optional-native contracts passed.')
