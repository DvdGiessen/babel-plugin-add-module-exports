import vm from 'vm'
import util from 'util'
import {transform as babelTransform} from 'babel-core'
import assert from 'assert'

export function createSandbox () {
  const exports = {}
  const sandbox = {
    exports,
    module: { exports },
    require (path) {
      delete require.cache[require.resolve(path)]
      return require(path)
    }
  }

  return sandbox
}

export function testPlugin (code, options, fn) {
  const result = babelTransform(code, options)
  const sandbox = createSandbox()

  vm.runInNewContext(result.code, sandbox)

  fn(sandbox.module.exports)
}

export function inspect (object) {
  const result = util.inspect(object)
  return result.replace('Object {', '{') // HACK the module.export inspect
}

export function equal (actual, expected) {
  if (typeof expected === 'string') {
    assert(actual.toString() === expected)
  } else if (typeof expected === 'function') {
    assert(actual() === expected())
  } else if (Array.isArray(expected)) {
    assert(actual.length === expected.length)
    for (const key in expected) {
      equal(actual[key], expected[key])
    }
  } else if (typeof expected === 'object') {
    equal(Object.keys(actual), Object.keys(expected))
    for (const prop in expected) {
      equal(actual[prop], expected[prop])
    }
  } else {
    assert(inspect(actual) === inspect(expected))
  }
}
