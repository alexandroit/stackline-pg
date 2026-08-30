'use strict'

exports.times = (count, iteratee) => Array.from({ length: count }, (_, index) => iteratee(index))
