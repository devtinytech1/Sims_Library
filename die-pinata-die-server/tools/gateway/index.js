const { start, expose } = require('./server')

function open(...modules) {
  modules.forEach(expose)
  start()
}

module.exports = { open }
