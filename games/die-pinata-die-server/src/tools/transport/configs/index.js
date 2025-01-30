const rng = require('./rng')

const configs = { rng }

function get(name) {
  return configs[name]
}

module.exports = { get }
