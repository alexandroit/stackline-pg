'use strict'

class Test {
  constructor(name, action) {
    this.name = name
    this.action = action
    this.timeout = Number.parseInt(process.env.TEST_TIMEOUT, 10) || 5000
  }

  run(callback) {
    let completed = false
    const done = (error) => {
      if (completed) return
      completed = true
      callback(error)
    }

    try {
      if (!this.action) return done()
      if (this.action.length > 0) return this.action(done)

      const result = this.action.call(this)
      if (!result || typeof result.then !== 'function') return done()
      result.then(() => done(), (error) => done(error || new Error('Unhandled promise rejection')))
    } catch (error) {
      done(error)
    }
  }
}

class Suite {
  constructor() {
    this.tests = []
    this.running = false
    this.scheduled = false
  }

  test(name, action) {
    this.tests.push(new Test(name, action))
    this.schedule()
  }

  schedule() {
    if (this.running || this.scheduled) return
    this.scheduled = true
    setImmediate(() => {
      this.scheduled = false
      this.drain()
    })
  }

  drain() {
    if (this.running) return
    const test = this.tests.shift()
    if (!test) return
    this.running = true
    this.run(test, (error) => {
      this.running = false
      if (error) {
        process.stdout.write(`FAILED!\n\n${error.stack || error}\n`)
        process.exitCode = 1
        this.tests.length = 0
        return
      }
      process.stdout.write('OK\n')
      this.drain()
    })
  }

  run(test, callback) {
    process.stdout.write(`  ${test.name} `)
    if (!test.action) {
      process.stdout.write('SKIPPED\n')
      return callback()
    }

    const timeout = setTimeout(() => {
      callback(new Error(`test: ${test.name} did not complete within ${test.timeout}ms`))
    }, test.timeout)

    test.run((error) => {
      clearTimeout(timeout)
      callback(error)
    })
  }
}

module.exports = Suite
