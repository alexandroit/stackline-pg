import assert from 'node:assert/strict'
import {EventEmitter} from 'node:events'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const ConnectionParameters = require('../lib/connection-parameters.js')
const Connection = require('../lib/connection.js')
const stream = require('../lib/stream.js')
const crypto = require('../lib/crypto/utils.js')
const previousMode = process.env.PGSSLMODE
const getSecureStream = stream.getSecureStream
const observed = []
stream.getSecureStream = (options) => {
  observed.push(options)
  return new EventEmitter()
}
function tlsOptions(ssl) {
  const connection = new Connection({ssl, stream: new EventEmitter()})
  connection.upgradeToSSL('database.example', (error) => {throw error})
  return observed.at(-1)
}
try {
  delete process.env.PGSSLMODE
  // TLS itself is opt-in for compatibility. When enabled normally, validation
  // is left at Node's secure default, not replaced with rejectUnauthorized=false.
  assert.equal(new ConnectionParameters({}).ssl, false)
  for (const ssl of [true, {}, {ca: 'test-only-ca', rejectUnauthorized: true}]) {
    const options = tlsOptions(new ConnectionParameters({ssl}).ssl)
    assert.notEqual(options.rejectUnauthorized, false)
    assert.equal(options.servername, 'database.example')
  }
  for (const mode of ['prefer', 'require', 'verify-ca', 'verify-full']) {
    process.env.PGSSLMODE = mode
    const parameters = new ConnectionParameters({})
    assert.equal(parameters.ssl, true)
    assert.notEqual(tlsOptions(parameters.ssl).rejectUnauthorized, false)
  }
  process.env.PGSSLMODE = 'no-verify'
  assert.equal(tlsOptions(new ConnectionParameters({}).ssl).rejectUnauthorized, false)
  // Explicit application configuration takes precedence over the environment.
  assert.notEqual(tlsOptions(new ConnectionParameters({ssl: true}).ssl).rejectUnauthorized, false)
  delete process.env.PGSSLMODE
  assert.equal(tlsOptions(new ConnectionParameters({ssl: 'no-verify'}).ssl).rejectUnauthorized, false)
  assert.equal(tlsOptions(new ConnectionParameters('postgres://localhost/db?ssl=no-verify').ssl).rejectUnauthorized, false)
  assert.equal(await crypto.postgresMd5PasswordHash('wire-contract', 'test-only-password', Buffer.from([1, 2, 3, 4])), 'md5ea0564899a9eeb28ed3389e76b558d48')
  console.log('TLS validation defaults, explicit no-verify boundaries, and PostgreSQL MD5 wire vector passed.')
} finally {
  stream.getSecureStream = getSecureStream
  if (previousMode === undefined) delete process.env.PGSSLMODE
  else process.env.PGSSLMODE = previousMode
}
