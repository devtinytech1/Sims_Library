const fs = require('fs')
const output = require('../controllers/console_controller')
const filesController = require('../controllers/csv_controller')
const debug = require('../controllers/debug')
const deviation = require('../controllers/deviation')
const context = require('../models/context')
const settings = require('../settings/bishopSettings')
const mathUtils = require('../utils/math')
const maxWin = require('./maxWin')

let model
const name = 'main'
const reset = () => {
  context[name] = {
    TestDate: '',
    iteration: 0,
    goldenBet: settings.goldenBet,
    totalBet: 0,
    totalPayOut: 0,
    rtp: 0,
    totalWin: 0,
    gameHF: 0,
    MaxRoundTotalWin: 0,
  }
  model = context[name]
  context.getMainStats = () => model
  context.outputFields.includes(name) || context.outputFields.push(name)
}
context.addResetListener(reset)
reset()

const listeners = [],
  min = Math.min(...[settings.consoleUpdate, settings.fileUpdate, settings.debugFileUpdate].filter(val => val))

let lastUpdateIteration = 0
function update() {
  if (lastUpdateIteration !== model.iteration && model.iteration % min === 0) {
    lastUpdateIteration = model.iteration
    model.MaxRoundTotalWin = maxWin.getValue()
    process.env.BISHOP_SAVE_DEVIATION_STATS_ON === 'true' && context.getDeviation().pool[0] &&
      (model.gameHF = ((1 - context.getDeviation().pool[0].prob) * 100) + '%')

    listeners.forEach(listener => listener())
    model.totalPayOut = mathUtils.round(model.totalPayOut)
    model.PayInOut = `-----: ${mathUtils.round(model.totalPayOut / model.totalBet * 100, 100)}%`
    //RTP for Basegame and Freespin
    model.rtp = mathUtils.round(context.getSpinStats().rtp + context.fsStats.rtp, 10000)
    model.totalWin = mathUtils.round(context.getSpinStats().win + context.fsStats.win, 10000)
    debug.update()

    model.iteration % settings.consoleUpdate === 0 && output.clear().update()
    settings.fileUpdate && model.iteration % settings.fileUpdate === 0 && filesController.saveFilesStats()

    //log base game and free games RTP distribution
    if(model.iteration % settings.consoleUpdate === 0)
    {
      console.log('__________BASE GAME___________________')
      console.log ('BG[13.032]:'+ mathUtils.round(context.getSpinStats().G / model.totalBet * 100, 100))
      console.log ('BG_Wild[23.828]:'+ mathUtils.round(context.getSpinStats().G_Wild / model.totalBet * 100, 100))
      console.log ('BG_Respin[16.842]:'+ mathUtils.round(context.getSpinStats().G_Respin / model.totalBet * 100, 100))
      console.log ('BG_Bonus[0.407]:'+ mathUtils.round(context.getSpinStats().G_Bonus / model.totalBet * 100, 100))
      console.log ('__________FREE GAME___________________')
      console.log ('FG[2.880]:'+ mathUtils.round(context.fsStats.G / model.totalBet * 100, 100))
      console.log ('FG_Wild[22.208]:'+ mathUtils.round(context.fsStats.G_Wild / model.totalBet * 100, 100))
      console.log ('FG_Respin[13.290]:'+ mathUtils.round(context.fsStats.G_Respin / model.totalBet * 100, 100))
      console.log ('FG_Bonus[0.156]:'+ mathUtils.round(context.fsStats.G_Bonus / model.totalBet * 100, 100))
      console.log ('__________JACKPOT___________________')
      console.log ('Mini[1.521]:'+ mathUtils.round(context.getSpinStats().base.prizePot.Mini / model.totalBet * 100, 100))
      console.log ('Minor[0.871]:'+ mathUtils.round(context.getSpinStats().base.prizePot.Minor / model.totalBet * 100, 100))
      console.log ('Major[0.610]:'+ mathUtils.round(context.getSpinStats().base.prizePot.Major / model.totalBet * 100, 100))
      console.log ('Grand[0.531]:'+ mathUtils.round(context.getSpinStats().base.prizePot.Grand / model.totalBet * 100, 100))
    }
    //write to file after every 100000 iteration
    if(model.iteration % settings.fileUpdate === 0)
    {
      var fileName = "./out/rtp_96.176.json"
      var objectData = {
        Rounds_Played: context.getMainStats().iteration,
        Total_Bet: context.getMainStats().totalBet,
        Total_Payout: context.getMainStats().totalPayOut,
        RTP: ((context.getMainStats().totalPayOut * 10000 / context.getMainStats().totalBet) / 100).toFixed(3)
      }
      fs.writeFileSync(fileName, JSON.stringify(objectData) + '\n', {flag: 'a'});
    }
    if (settings.debugFileUpdate && model.iteration % settings.debugFileUpdate === 0) {
      deviation.update()
      filesController.debugSave()
    }
  }

}

function addUpdateListener(listener) {
  listeners.push(listener)
}

module.exports = { update, addUpdateListener }
