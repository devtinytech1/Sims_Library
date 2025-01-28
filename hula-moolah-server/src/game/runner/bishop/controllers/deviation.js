
const context = require('../models/context')
const settings = require('../settings/bishopSettings')
const { round } = require('../utils/math')

const { BISHOP_SAVE_DEVIATION_STATS_ON } = process.env

const reset = () => {
  context.deviation = {
    current: 0,
    currentTriggers: [],
    sumWin: 0,
    variance: 0,
    stdDeviation: 0,
    pool: {},
  }
}
context.addResetListener(reset)
reset()

function add() {
  if (context.win) {
    context.deviation.current = round(context.deviation.current + context.win, 1000)
    if (!context.deviation.currentTriggers.includes(context.currentTrigger)) {
      context.deviation.currentTriggers.push(context.currentTrigger)
    }
  }
}

function checkSaveDeviation() {
  if (BISHOP_SAVE_DEVIATION_STATS_ON !== 'true') {
    return
  }
  if (context.call.trigger === settings.keys.spin) {
    add()
    if (context.deviation.pool[context.deviation.current] == null) {
      context.deviation.pool[context.deviation.current] = {
        count: 0,
        triggers: [],
      }
    }
    context.deviation.pool[context.deviation.current].count++
    context.deviation.pool[context.deviation.current].triggers = [...context.deviation.currentTriggers]
    context.deviation.currentTriggers = []
    context.deviation.current = 0
  }
  else {
    add()
  }
}

function updateDeviation() {
  if (BISHOP_SAVE_DEVIATION_STATS_ON !== 'true') {
    return
  }
  context.deviation.variance = 0
  context.deviation.sumWin = 0

  Object.keys(context.deviation.pool).forEach(win => {
    setProbxParams(context.deviation.pool[win], win)

    context.deviation.variance += context.deviation.pool[win].probx
    context.deviation.sumWin = round(parseFloat(win) * context.deviation.pool[win].count + context.deviation.sumWin, 1000)
  })

  context.deviation.stdDeviation = Math.sqrt(context.deviation.variance)

  function setProbxParams(obj, win) {
    obj.xbet = win
    obj.prob = obj.count / context.stats.iteration
    obj.probx = ((obj.xbet - context.stats.rtp / 100) * (obj.xbet - context.stats.rtp / 100)) * obj.prob
  }
}

module.exports = { checkSaveDeviation, updateDeviation }
