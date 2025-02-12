
const { TRIGGER } = require('../../../configs/static')
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const collectStats = require('../../stats/collect')
const mainStats = require('../../stats/mainStats')
const maxWin = require('../../stats/maxWin')
const modeStats = require('../../stats/mode')
const randomWildStats = require('../../stats/randomWild')
const winStats = require('../../stats/winStats')
const mathUtils = require('../../../../../../../../src/utils/math.cjs')
const call = require('../call')
const deviation = require('../deviation')
const time = require('../time_controller')

let model
const name = 'spins'
const reset = () => {
  context[name] = {
    win: 0,
    rtp: 0,
    base: Object.assign(
      winStats.getModel(),
      collectStats.getModel(),
      modeStats.getModel(),
      randomWildStats.getModel(),
    ),
  }
  context.outputFields.includes(name) || context.outputFields.push(name)
  model = context[name]
  context.getSpinStats = () => model
}
context.addResetListener(reset)
reset()

mainStats.addUpdateListener(() => {
  const spinCount = context.getMainStats().iteration

  mathUtils.updateSymbolsSum(model.base)
  winStats.update(model.base, spinCount)
  collectStats.update(model.base, spinCount)
  modeStats.update(model.base, spinCount)
  randomWildStats.update(model.base, spinCount)

  model.win = model.base.win
  model.rtp = model.base.rtp
})

async function spinAction() {
  const mainStatsModel = context.getMainStats()
  if (context.nextTrigger === TRIGGER.SPIN && mainStatsModel.iteration >= settings.iterationsCount) {
    time.update()
    mainStats.update()
    context.nextTrigger = 'doneAction'
    return
  }

  // if (context.nextTrigger === TRIGGER.SPIN) {
  //   context.nextTrigger = TRIGGER.BUY_BONUS
  //   mathUtils.increaseStat(context.getMainStats(), TRIGGER.BUY_BONUS)
  //   const mode = 0
  //   await call(baseCallBody(mode))
  // }
  // else {
    await call(baseCallBody())
  // }

  if (context.call.error) {
    // eslint-disable-next-line no-console
    return console.error(context.call.error)
  }

  if (context.currentTrigger === TRIGGER.SPIN || context.currentTrigger === TRIGGER.BUY_BONUS) {
    mainStatsModel.iteration++
    mainStatsModel.totalBet += context.call.totalBet
    maxWin.clear()
    winStats.check(model.base)
    mainStats.update()
  }
  else {
    maxWin.check()
    deviation.save()
  }
}

module.exports = spinAction
