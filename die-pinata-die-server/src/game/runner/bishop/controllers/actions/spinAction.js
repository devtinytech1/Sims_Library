
const { TRIGGER } = require('../../../configs/static')
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const mainStats = require('../../stats/mainStats')
const maxWin = require('../../stats/maxWin')
const winStats = require('../../stats/winStats')
const mathUtils = require('../../utils/math')
const call = require('../call')
const deviation = require('../deviation')
const time = require('../time_controller')
const prizePotStats = require('../../stats/prizePotFeatureStats')
const respinAction = require('./respinAction')

let model
const name = 'spins'
const reset = () => {
  context[name] = {
    win: 0,
    rtp: 0,

    G: 0,
    G_Wild: 0,
    G_Bonus: 0,
    G_Respin: 0,

    base: Object.assign(
      winStats.getModel(),
      prizePotStats.getModel(),
      respinAction.getModel()
    ),
  }
  context.outputFields.includes(name) || context.outputFields.push(name)
  model = context[name]
  context.getSpinStats = () => model
  context.states || (context.states = {})
  context.states[TRIGGER.SPIN] = model
}
context.addResetListener(reset)
reset()

mainStats.addUpdateListener(() => {
  const spinCount = context.getMainStats().iteration
  mathUtils.updateSymbolsSum(model.base)
  winStats.update(model.base, spinCount)
  respinAction.updateStats(model.base, spinCount)
  // prizePotStats.update(model.base, spinCount)

  model.base.symRTP = mathUtils.getRTP(model.base.symbolsSum)
  model.win = model.base.win
  model.rtp = model.base.rtp
  // model.symbolsAndFeaturesSum = model.base.symbolsSum + prizePotStats.getStats(model.base).win
})

async function spinAction() {
  const mainStatsModel = context.getMainStats()
  if (context.nextTrigger === TRIGGER.SPIN && mainStatsModel.iteration >= settings.iterationsCount) {
    time.update()
    mainStats.update()
    context.nextTrigger = 'doneAction'
    return
  }

  //To run buy a bonus RTP uncomment the following code block and comment the line number 80 (await call(baseCallBody()))
  //mode = 0 or 1 or 2 based on how many buy a bonus options we have in game. Run a different instances of bishop by updating the mode and rename the log file name [fileName = "./out/rtp_96.176.json"]  in mainStats.js to desired output filename . e.g rtp_buyabmou_0_option.json
  /*
  if (context.nextTrigger === TRIGGER.SPIN) 
  {
    context.nextTrigger = TRIGGER.BUY_BONUS
    mathUtils.increaseStat(context.getMainStats(), TRIGGER.BUY_BONUS)
    const mode = 1
    await call(baseCallBody(mode))
  }
  else
  {
    await call(baseCallBody())
  }
  */

  await call(baseCallBody())

  if (context.call.error) {
    // eslint-disable-next-line no-console
    return console.error(context.call.error)
  }
  context.win = context.call.context?.win?.total ? context.call.context.win.total : 0
  if (context.currentTrigger === TRIGGER.SPIN || context.currentTrigger === TRIGGER.BUY_BONUS) {
    mainStatsModel.iteration++
    mainStatsModel.totalBet += context.call.totalBet
    prizePotStats.check(model.base)
    maxWin.clear()
    winStats.check(model.base, model)
    mainStats.update()
  }
  else {
    maxWin.check()
    deviation.save()
  }
}



module.exports = spinAction
