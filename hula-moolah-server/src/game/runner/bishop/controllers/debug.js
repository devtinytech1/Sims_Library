const context = require('../models/context')

const { BISHOP_DEBUG_ON } = process.env

if (BISHOP_DEBUG_ON === 'true') {
  const reset = () => {
    context.debug = {
      wins: {},
      warnings: [],
      stats: {},
    }
  }
  context.addResetListener(reset)
  reset()
}

function saveDebug() {
  if (context.win) {
    const state = context.call.state
    const key = context.currentTrigger
    if (!context.debug.stats[state]) {
      context.debug.stats[state] = {}
    }
    if (!context.debug.stats[state][key]) {
      context.debug.stats[state][key] = 0
    }
    context.debug.stats[state][key] += context.win
  }
}

function saveDebugStats() {
  context.debug.finalTotal = 0
  Object.keys(context.debug.stats).forEach(state => Object.keys(context.debug.stats[state]).forEach(trigger =>
    context.debug.finalTotal += context.debug.stats[state][trigger]))
}

module.exports = BISHOP_DEBUG_ON !== 'true' ?
  { saveDebug: () => { }, saveDebugStats: () => { } } :
  { saveDebug, saveDebugStats }
