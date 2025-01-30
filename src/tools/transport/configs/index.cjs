const rng = require('./rng.cjs')

const configs = { rng }

function get(name) {
  return configs[name]
}

module.exports = { get }
