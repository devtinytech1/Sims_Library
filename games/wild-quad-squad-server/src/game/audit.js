const { audit } = require('./runner')

function make() {
  return async function () {
    return await audit()
  }
}

module.exports = { make }
