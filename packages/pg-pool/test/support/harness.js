'use strict'

const nodeTest = require('node:test')

function callbackCompatible(fn) {
  if (typeof fn !== 'function' || fn.length === 0) return fn

  return function callbackTest() {
    return new Promise((resolve, reject) => {
      let finished = false
      const done = (error) => {
        if (finished) {
          reject(new Error('test callback called more than once'))
          return
        }
        finished = true
        if (error) reject(error)
        else resolve()
      }

      try {
        fn.call(undefined, done)
      } catch (error) {
        reject(error)
      }
    })
  }
}

function test(name, options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = undefined
  }
  if (options === false) return nodeTest.test.skip(name, callbackCompatible(fn))
  return nodeTest.test(name, options, callbackCompatible(fn))
}

test.skip = (name, options, fn) => {
  if (typeof options === 'function') {
    fn = options
    options = undefined
  }
  return nodeTest.test.skip(name, options, callbackCompatible(fn))
}

function hook(register, fn) {
  return register(callbackCompatible(fn))
}

const api = {
  describe: nodeTest.describe,
  it: test,
  before: (fn) => hook(nodeTest.before, fn),
  after: (fn) => hook(nodeTest.after, fn),
  beforeEach: (fn) => hook(nodeTest.beforeEach, fn),
  afterEach: (fn) => hook(nodeTest.afterEach, fn)
}

Object.assign(globalThis, api)

module.exports = api
