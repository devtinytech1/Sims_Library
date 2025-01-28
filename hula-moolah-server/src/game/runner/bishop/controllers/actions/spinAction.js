
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const saveLinesStats = require('../../stats/lines')
const { updateMainStats, saveMainStats, addUpdateMainStatsListener, gliStats } = require('../../stats/mainStats')
const { maxWinSet } = require('../../stats/maxWin')
const { getRTP, updateSymbolsSum } = require('../../utils/math')
const call = require('../call')
const { checkSaveDeviation } = require('../deviation')

const time = {
  start: Date.now(),
  end: 0,
  diff: 'h:0 s:0 ms:0',
}

const reset = () => {
  context.bgStats = {
    rtp: 0,
    win: 0,
    paidSpins: 0,
    paidSpinHF: 0,
    symbolsSum: 0,
    symbols: {},
  }
}
context.addResetListener(reset)
reset()

addUpdateMainStatsListener(() => {
  updateSymbolsSum(context.bgStats)
  context.bgStats.paidSpinHF = context.stats.iteration / context.bgStats.paidSpins
  console.log("Base Game RTP[43.718]: " + context.bgStats.rtp)
  context.bgStats.rtp = getRTP(context.bgStats.win)
})

async function spinAction(trigger, error) {
  if (context.stats.iteration >= settings.iterationsCount) {
    context.stats.time = time
    time.end = Date.now()
    const diff = time.end - time.start
    const s = diff / 1000
    const m = s / 60
    const h = m / 60
    time.diff = `h:${Math.floor(h * 100) / 100} m:${Math.floor(m * 100) / 100} s:${Math.floor(s * 100) / 100}`
    return 'doneAction'
  }

  context.currentTrigger = trigger
  if (context.currentTrigger === settings.keys.spin && settings.buyBonusEnabled) {
    const mode = settings.buyBonusSelectOption
    context.currentTrigger = settings.keys.buy_bonus
    await call(baseCallBody(settings.actions[context.currentTrigger], mode))
  }
  else {
    await call(baseCallBody(settings.actions[context.currentTrigger]))
  }

  if (context.call.error) {
    // eslint-disable-next-line no-console
    return console.error(context.call.error)
  }
  context.win = 0
  if (context.call.context.win && context.call.context.win.total >= 0) {
    context.win = context.call.context.win.total
  }

  if (context.currentTrigger === settings.keys.spin || context.currentTrigger === settings.keys.buy_bonus) {
    checkSaveDeviation()
    context.stats.iteration++
    context.stats.totalBet += context.call.totalBet

    maxWinSet()

    if (context.win) {
      context.bgStats.win += context.win
      context.stats.totalPayOut += context.win
      if (context.win != 75) {
        let x = 0;
      }
      context.bgStats.paidSpins++
      saveLinesStats(context.call.context.win.lines || [], [context.bgStats.symbols])
    }
    else {
      let x = 0
    }
  }

  /*var objData = {
    Cost: context.call.totalBet,
    Won: context.win
  }

  if(context.currentTrigger === settings.keys.spin)
    context.stats.rtpData.push(objData)
  if( context.stats.rtpData.length % 100 == 0)
    gliStats()*/

  saveMainStats()
  updateMainStats()

  return context.call.trigger
}

module.exports = spinAction
