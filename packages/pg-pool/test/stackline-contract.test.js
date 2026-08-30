'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const packageJson = require('../package.json')
const Pool = require('../index.js')

class TestClient {
  constructor(options) {
    this.options = options
  }
}

test('preserves the pg-pool constructor export', () => {
  assert.equal(typeof Pool, 'function')
  assert.equal(Pool.name, 'Pool')
})

test('accepts an injected Client without resolving an external driver', () => {
  const pool = new Pool({ Client: TestClient, max: 3 })
  assert.equal(pool.Client, TestClient)
  assert.equal(pool.options.max, 3)
  assert.equal(pool.totalCount, 0)
})

test('does not auto-install the historical pg dependency chain', () => {
  assert.deepEqual(packageJson.dependencies, undefined)
  assert.deepEqual(packageJson.peerDependencies, { pg: '>=8.0' })
  assert.deepEqual(packageJson.peerDependenciesMeta, { pg: { optional: true } })
})
