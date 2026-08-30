'use strict'
const helper = require('./test-helper')
const assert = require('assert')

const pool = new helper.pg.Pool()
new helper.Suite().test(
  'using async functions works with promises',
  async function () {
    const client = await pool.connect()
    const res = await client.query('SELECT $1::text as name', ['foo'])
    assert.equal(res.rows[0].name, 'foo')

    let threw = false
    try {
      await client.query('SELECT LKDSJDSLKFJ')
    } catch (e) {
      threw = true
    }
    assert(threw)
    client.release()
    await pool.end()
  }
)
