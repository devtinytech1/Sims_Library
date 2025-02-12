
const debug = require('../controllers/debug')
const deviation = require('../controllers/deviation')
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const maxWin = require('./maxWin')
const symbolsStats = require('./symbolsStats')

function getModel() {
  return {
    rtp: 0,
    win: 0,
    symbolsSum: 0,
    symbols: {},
  }
}

function check(statsBase) {
  context.call.context.win?.total && (context.win = context.call.context.win.total)
  if (context.win) {
    statsBase.win += context.win
    context.getMainStats().totalPayOut += context.win
    symbolsStats.check(context.call.context.win.lines, [statsBase.symbols])
  }
  

  deviation.save()
  debug.save()
  maxWin.check()
}

function update(statsBase, spinCount) {
  statsBase.symbols && symbolsStats.update(statsBase.symbols, spinCount)
  statsBase.rtp = mathUtils.getRTP(statsBase.win)
}

module.exports = { getModel, check, update }
