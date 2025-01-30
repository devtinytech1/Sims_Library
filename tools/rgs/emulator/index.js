
const init = require('./init')
const open = require('./open')
const play = require('./play')

const endpoints = {}

endpoints[`post|/${process.env.GAME}/open`] = open
endpoints[`post|/${process.env.GAME}/init`] = init
endpoints[`post|/${process.env.GAME}/play`] = play

module.exports = { endpoints }
