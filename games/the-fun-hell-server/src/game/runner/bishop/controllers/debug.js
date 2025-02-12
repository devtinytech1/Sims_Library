
const { TRIGGER } = require('../../configs/static')
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')

const { BISHOP_DEBUG_ON } = process.env

let model
const name = 'debug'
if (BISHOP_DEBUG_ON === 'true') {
  const reset = () => {
    context[name] = { states: {}, triggers: {} }
    model = context[name]
    context.getDebug = () => model
    context.outputFields.includes(name) || context.outputFields.push(name)
  }
  context.addResetListener(reset)
  reset()
}

function save() {
  if (context.win) {
    mathUtils.increaseStat(model.triggers, `${context.currentState}_${context.currentTrigger}`, context.win)
    mathUtils.increaseStat(model.states, context.currentTrigger === TRIGGER.BONUS ||
      context.currentTrigger === TRIGGER.FREESPINS ?
      context.currentTrigger :
      context.currentState, context.win)
  }
}

function update() {
  model.statesSum = 0
  Object.values(model.triggers).forEach(value => model.statesSum += value)
  model.statesSum = mathUtils.round(model.statesSum)
  model.rgs.out = mathUtils.round(model.rgs.out)
  model.diffStatesAndRgs = model.statesSum - model.rgs.out
}

module.exports = BISHOP_DEBUG_ON !== 'true' ? { save: () => {}, update: () => {} } : { save, update }
