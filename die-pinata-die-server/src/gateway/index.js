const { shutdown } = require('../status')
const { start, expose } = require('./server')

let server

function open(...modules) {
  modules.forEach(expose)
  server = start()
}

async function close() {
  server.close()
  return await shutdown()
}

module.exports = { open, close }
