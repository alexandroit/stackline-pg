'use strict'
const expect = require('./support/expect')

const { describe, it } = require('./support/harness')

const Pool = require('../')

describe('verify', () => {
  it('verifies a client with a callback', (done) => {
    const pool = new Pool({
      verify: (client, cb) => {
        cb(new Error('nope'))
      },
    })

    pool.connect((err, client) => {
      expect(err).to.be.an(Error)
      expect(err.message).to.be('nope')
      pool.end()
      done()
    })
  })
})
