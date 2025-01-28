
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const saveLinesStats = require('../../stats/lines')
const { saveMainStats, addUpdateMainStatsListener, gliStats } = require('../../stats/mainStats')
const { getRTP, updateSymbolsSum } = require('../../utils/math')
const call = require('../call')
const { checkSaveDeviation } = require('../deviation')

const reset = () => {
  context.fsStats = {
    triggered: 0,
    win: 0,
    rtp: 0,
    HF: 0,
    HFper: 0,
    avrPay: 0,
    paidSpins: 0,
    paidSpinHF: 0,
    symbolsSum: 0,
    symbols: {},
  }
}
context.addResetListener(reset)
reset()

addUpdateMainStatsListener(() => {
  updateSymbolsSum(context.fsStats)

  context.fsStats.paidSpinHF = context.stats.iteration / context.fsStats.paidSpins
  context.fsStats.HF = context.stats.iteration / context.fsStats.triggered
  context.fsStats.HFper = context.fsStats.triggered / context.stats.iteration

  context.fsStats.rtp = getRTP(context.fsStats.win)
  console.log("Custom Free Spin RTP [18.735] : " + 100 * (context.fsStats.win / context.stats.totalBet))
  context.fsStats.avrPay = context.fsStats.rtp / (context.fsStats.HFper * 100)
})

module.exports = async function freespinsAction(trigger) {
  await call(baseCallBody(settings.actions[trigger]))
  context.win = context.call.context?.win?.total ? context.call.context.win.total : undefined
  if (context.call.context.collect && context.call.context.collect.total) {
    context.win = context.win ? context.win + context.call.context.collect.total : context.call.context.collect.total
    context.fsStats.collect.triggered++
    context.fsStats.collect.prize += context.call.context.collect.total
  }

  checkSaveDeviation()

  const isEnd = context.call.context.freespins.left === 0

  if (context.win) {
    context.fsStats.paidSpins++
    saveLinesStats(context.call.context.win.lines || [], [context.fsStats.symbols])
  }

  saveMainStats()

  if (isEnd) {
    context.win = context.call.context.freespins.total - context.call.context.freespins.hnsWinInFS
    context.fsStats.win += context.win
    context.stats.totalPayOut += context.win
    context.stats.totalFRPayOut += context.win
    context.fsStats.triggered++

    /*context.stats.iteration++
    var objData = {
      Cost: context.call.spinBet,
      Won: context.win,
      Type: 'FreeSpins'
    }
    context.stats.rtpData.push(objData)
    if( context.stats.rtpData.length % 100 == 0)
      gliStats()*/
  }

  return context.call.trigger
}
