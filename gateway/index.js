const { start, expose } = require('../gateway/server')

function open(...modules) {
  modules.forEach(expose)
  start()
}

module.exports = { open }
