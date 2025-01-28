
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const saveLinesStats = require('../../stats/lines')
const { saveMainStats, addUpdateMainStatsListener, gliStats } = require('../../stats/mainStats')
const { getRTP, updateSymbolsSum } = require('../../utils/math')
const call = require('../call')
const { checkSaveDeviation } = require('../deviation')

const reset = () => {
  context.hnsStats = {
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
    totalMultiplier: 0,
    totalTriggerWin: 0,
  }
}
context.addResetListener(reset)
reset()

addUpdateMainStatsListener(() => {
  updateSymbolsSum(context.fsStats)

  context.hnsStats.paidSpinHF = context.stats.iteration / context.hnsStats.paidSpins
  context.hnsStats.HF = context.stats.iteration / context.hnsStats.triggered
  context.hnsStats.HFper = context.hnsStats.triggered / context.hnsStats.iteration

  context.hnsStats.rtp = getRTP(context.hnsStats.win)
  console.log("Hold & Spin RTP Custom[31.980] : " + (context.hnsStats.win / context.stats.totalBet ) * 100)

  context.hnsStats.avrPay = context.hnsStats.rtp / (context.hnsStats.HFper * 100)
})

module.exports = async function holdnspinAction(trigger) {
  await call(baseCallBody(settings.actions[trigger]))
  context.win = context.call.context?.holdnspin?.totalWin ? context.call.context.holdnspin.totalWin : undefined
  
  checkSaveDeviation()

  const isEnd = context.call.trigger === settings.keys.holdnspin_end

  if (context.win) {
  }

  saveMainStats()

  if (isEnd) {
    context.win = context.call.context.holdnspin.totalWin
    context.hnsStats.win += context.win
    context.stats.totalPayOut += context.win
    context.stats.totalHSPayOut += context.win
    context.hnsStats.triggered++
    context.hnsStats.totalMultiplier += context.call.context.holdnspin.totalWin / context.call.context.holdnspin.triggerWin
    context.hnsStats.totalTriggerWin += context.call.context.holdnspin.triggerWin
    
    /*context.stats.iteration++
    var objData = {
      Cost: context.call.spinBet,
      Won: context.win,
      Type: 'HoldnSpin'
    }
    context.stats.rtpData.push(objData)
    if( context.stats.rtpData.length % 100 == 0)
      gliStats()*/
  }

  return context.call.trigger
}
