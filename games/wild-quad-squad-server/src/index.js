require('dotenv').config()
const game = require('./game')
const gateway = require('./gateway')
const health = require('./health')

const { LOGS_URL, LOGS_PORT, LOGS_PROTOCOL, RNG_URL, SHUFFLE_URL, BUFFERED_RNG_SUPPORT } = process.env
const rgs = { LOGS_URL, LOGS_PORT, LOGS_PROTOCOL, RNG_URL, SHUFFLE_URL, BUFFERED_RNG_SUPPORT }

async function start() {
  gateway.open(health, game)


  Object.entries(rgs).forEach(([k, v]) => log.info(`${k}: ${v}`))

  process.on('SIGTERM', async () => {
    const active = await gateway.close()
    process.exit(active ? 1 : 0)
  })
}

start()
