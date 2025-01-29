const fs = require('fs')
const { checkCheats } = require('../controllers/cheat_controller')
const context = require('../models/context')
const settings = require('../settings/bishopSettings')
const { getRTP, round } = require('../utils/math')
const { maxWinCheck } = require('./maxWin')

const reset = () => {
  context.stats = {
    TestDate: '',
    iteration: 0,
    goldenBet: settings.goldenBet,

    totalBet: 0,
    totalPayOut: 0,
    totalFRPayOut: 0,
    totalHSPayOut: 0,

    rtp: 0,
    gameHF: 0,
    MaxRoundTotalWin: 0,
    rtpData: [],
  }
}
context.addResetListener(reset)
reset()

const updateMainStatsListenersPool = []

function gliStats() {
  const json = JSON.stringify(context.stats.rtpData, null, 2);
  var fileName = "./out/RTP/rounds" + '_' + context.stats.iteration + '.json'
  fs.writeFileSync(fileName, json);
  context.stats.rtpData = []
}

function updateMainStats() {
  if (context.stats.iteration % settings.consoleUpdateOnEveryStep === 0 ||
    context.stats.iteration === settings.iterationsCount) {

    if (process.env.BISHOP_SAVE_DEVIATION_STATS_ON === 'true') {
      context.stats.gameHF = ((1 - context.deviation.pool[0].prob) * 100) + '%'
    }
    context.stats.PayInOut = `-----: ${round(context.stats.totalPayOut / context.stats.totalBet * 100, 100)}%`
    context.stats.rtp = round(context.bgStats.rtp + context.fsStats.rtp + context.hnsStats.rtp, 10000)
    updateMainStatsListenersPool.forEach(listener => listener())

    //write to file after every 100000 iteration
    var fileName = settings.bishopLogsFiles
    var objectData = {
      Rounds_Played: context.stats.iteration,
      Total_Bet: context.stats.totalBet,
      Total_Payout: context.stats.totalPayOut,
      RTP: ((context.stats.totalPayOut * 10000 / context.stats.totalBet) / 100).toFixed(3)
    }
    fs.writeFileSync(fileName, JSON.stringify(objectData) + '\n', { flag: 'a' });
  }
  if (context.stats.iteration !== settings.iterationsCount) {
  }
}

function saveMainStats() {
  checkCheats()
  maxWinCheck()
}

function addUpdateMainStatsListener(listener) {
  updateMainStatsListenersPool.push(listener)
}

module.exports = { updateMainStats, saveMainStats, addUpdateMainStatsListener, gliStats }
