require('dotenv').config()
const gateway = require('../gateway')
const emulator = require('./emulator')

async function start() {
  gateway.open(emulator)
}

start()
