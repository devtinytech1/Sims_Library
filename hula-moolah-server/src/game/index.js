
const audit = require('./audit')
const init = require('./init')
const play = require('./play')

const endpoints = {
  'post|/game/init': init.make(),
  'post|/game/play': play.make(),
  'get|/actuator/info': audit.make(),
}

module.exports = { endpoints }
