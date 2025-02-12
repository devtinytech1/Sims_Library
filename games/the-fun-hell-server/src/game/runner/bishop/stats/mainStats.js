
const output = require('../controllers/console_controller')
const debug = require('../controllers/debug')
const deviation = require('../controllers/deviation')
const context = require('../models/context')
const settings = require('../settings/bishopSettings')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
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
    wheelBonusWin: 0,
    wheel1Win: 0,
    wheel2Win: 0,
    wheel3Win: 0,
    wheel1RTP: 0,
    wheel2RTP: 0,
    wheel3RTP: 0,
    maxWheelBonusWin: 0,
    wheelBonusRTP: 0,
    bgRTP: 0,
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
    model.rtp = mathUtils.round(context.getSpinStats().rtp, 10000)
    model.bgRTP = mathUtils.round(context.getSpinStats().rtp + mathUtils.getRTP(model.wheelBonusWin), 10000)
    model.wheelBonusRTP = mathUtils.round(mathUtils.getRTP(model.wheelBonusWin), 10000)
    model.wheel1RTP = mathUtils.round(mathUtils.getRTP(model.wheel1Win), 10000)
    model.wheel2RTP = mathUtils.round(mathUtils.getRTP(model.wheel2Win), 10000)
    model.wheel3RTP = mathUtils.round(mathUtils.getRTP(model.wheel3Win), 10000)
    model.totalWin = mathUtils.round(context.getSpinStats().win, 10000)
    debug.update()

    model.iteration % settings.consoleUpdate === 0 && output.clear().update()
   

    if (settings.debugFileUpdate && model.iteration % settings.debugFileUpdate === 0) {
      deviation.update()
    }
  }

}

function addUpdateListener(listener) {
  listeners.push(listener)
}

module.exports = { update, addUpdateListener }
