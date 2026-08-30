const expect = require('./support/expect')

const { describe, it } = require('./support/harness')

const Pool = require('../')

describe('logging', function () {
  it('logs to supplied log function if given', function () {
    const messages = []
    const log = function (msg) {
      messages.push(msg)
    }
    const pool = new Pool({ log: log })
    return pool.query('SELECT NOW()').then(function () {
      expect(messages.length).to.be.greaterThan(0)
      return pool.end()
    })
  })
})
