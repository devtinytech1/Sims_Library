
const { TRIGGER } = require('../../configs/static')
const filesController = require('../controllers/csv_controller')
const context = require('../models/context')

let value = 0
let round_contexts = []
const result = {
  value: 0,
  contexts: [],
}

function clear() {
  value =  0
}

function check() {
  round_contexts.push(context.call)
  context.win && (value += context.win)
  if (context.call.trigger === TRIGGER.SPIN || context.call.trigger === TRIGGER.FREESPINS_END) {
    if (value > result.value) {
      result.contexts = round_contexts
      result.value = value
    }
    round_contexts = []
  }
}

function finalize() {
  filesController.saveFile(
    './out',
    `./out/maxWin_${process.env.GAME}.json`,
    JSON.stringify(result),
  )
}

function getValue() {
  return result.value
}

module.exports = { clear, check, finalize, getValue }
