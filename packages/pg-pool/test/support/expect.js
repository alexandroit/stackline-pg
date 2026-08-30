'use strict'

const assert = require('node:assert/strict')

function expectation(actual, negated = false) {
  const chain = {}

  const compare = (positive, message) => {
    if (negated ? positive : !positive) {
      throw new assert.AssertionError({
        message,
        actual,
        operator: negated ? 'not' : 'expected'
      })
    }
  }

  const be = (expected) => {
    if (negated) assert.notStrictEqual(actual, expected)
    else assert.strictEqual(actual, expected)
  }

  be.ok = () => compare(Boolean(actual), 'expected value to be truthy')
  be.an = (Type) => compare(actual instanceof Type, `expected value to be a ${Type.name}`)
  be.a = be.an
  be.greaterThan = (expected) => compare(actual > expected, `expected ${actual} to be greater than ${expected}`)

  chain.be = be
  chain.equal = be
  chain.eql = (expected) => {
    if (negated) assert.notDeepStrictEqual(actual, expected)
    else assert.deepStrictEqual(actual, expected)
  }
  chain.contain = (expected) => {
    const contains = actual != null && typeof actual.includes === 'function' && actual.includes(expected)
    compare(contains, `expected value to contain ${expected}`)
  }
  chain.length = (expected) => {
    const hasLength = actual != null && actual.length === expected
    compare(hasLength, `expected length ${expected}, received ${actual && actual.length}`)
  }
  chain.throwError = () => {
    if (negated) assert.doesNotThrow(actual)
    else assert.throws(actual)
  }

  Object.defineProperties(chain, {
    to: { get: () => chain },
    have: { get: () => chain },
    not: { get: () => expectation(actual, !negated) }
  })

  return chain
}

module.exports = expectation
