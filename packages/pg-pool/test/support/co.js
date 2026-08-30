'use strict'

function co(generator) {
  const iterator = typeof generator === 'function' ? generator() : generator

  return new Promise((resolve, reject) => {
    const advance = (method, value) => {
      let result
      try {
        result = iterator[method](value)
      } catch (error) {
        reject(error)
        return
      }

      if (result.done) {
        resolve(result.value)
        return
      }

      Promise.resolve(result.value).then(
        (nextValue) => advance('next', nextValue),
        (error) => advance('throw', error)
      )
    }

    advance('next')
  })
}

co.wrap = (generatorFunction) => function wrappedGenerator(...arguments_) {
  return co(generatorFunction.apply(this, arguments_))
}

module.exports = co
