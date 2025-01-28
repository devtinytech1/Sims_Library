
const context = require('../models/context')
const settings = require('../settings/bishopSettings')

let value = 0

function maxWinSet() {
  value = context.win || 0
}

function maxWinCheck() {
  if (context.currentTrigger !== settings.keys.spin) {
    if (context.win) {
      value += context.win
    }
  }
  if (value > context.stats.MaxRoundTotalWin) {
    context.stats.MaxRoundTotalWin = value
  }
}

module.exports = { maxWinSet, maxWinCheck }
