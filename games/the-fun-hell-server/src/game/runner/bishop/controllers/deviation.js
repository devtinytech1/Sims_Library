
const { TRIGGER } = require('../../configs/static')
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')

const { BISHOP_SAVE_DEVIATION_STATS_ON } = process.env

let model
const name = 'deviation'
const reset = () => {
  context[name] = {
    current: 0,
    currentTriggers: [],
    sumWin: 0,
    variance: 0,
    stdDeviation: 0,
    pool: {},
    debug: {
      probSum: 0,
      map: {},
    },
  }
  context.outputFields.includes(name) || context.outputFields.push(name)
  model = context[name]
  context.getDeviation = () => model
}
context.addResetListener(reset)
reset()

function save() {
  if (BISHOP_SAVE_DEVIATION_STATS_ON === 'true') {

    model.current = mathUtils.round(model.current + context.win)
    model.currentTriggers.includes(context.currentTrigger) || model.currentTriggers.push(context.currentTrigger)

    model.debug.map[context.currentAction] || (model.debug.map[context.currentAction] = 0)
    model.debug.map[context.currentAction]++
    if (context.nextTrigger === TRIGGER.SPIN) { // || context.currentAction === TRIGGER.BUY_BONUS
      const dp = model.pool, dc = model.current
      dp[dc] || (dp[dc] = { c: 0, t: [] })
      dp[dc].c++
      dp[dc].t = [...model.currentTriggers]
      model.currentTriggers = []
      model.current = 0
    }
  }
}

function update() {
  if (BISHOP_SAVE_DEVIATION_STATS_ON === 'true') {
    model.variance = 0
    model.sumWin = 0
    model.debug.probSum = 0
    const mainStatsModel = context.getMainStats()
    Object.entries(model.pool).forEach(([win, obj]) => {
      const floatWin = parseFloat(win)
      obj.p = obj.c / mainStatsModel.iteration
      const mth = floatWin - mainStatsModel.rtp / 100
      obj.px = mth * mth * obj.p
      model.variance += obj.px
      model.sumWin += floatWin * obj.c
      model.debug.probSum += obj.p
    })
    model.sumWin = mathUtils.round(model.sumWin)
    model.debug.probSum = mathUtils.round(model.debug.probSum)
    model.stdDeviation = Math.sqrt(model.variance)
  }
}

module.exports = { save, update }
