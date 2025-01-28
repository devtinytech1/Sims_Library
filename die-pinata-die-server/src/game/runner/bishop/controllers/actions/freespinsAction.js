
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const { TRIGGER } = require('../../../configs/static')
const mainStats = require('../../stats/mainStats')
const winStats = require('../../stats/winStats')
const mathUtils = require('../../utils/math')
const call = require('../call')
const respinAction = require('./respinAction')
const hfStats = require('../../stats/hfStats')

let model
const reset = () => {
  context.fsStats = Object.assign({
      win: 0,
      rtp: 0,
      avgPay: 0,

      G: 0,
      G_Wild: 0,
      G_Bonus: 0,
      G_Respin: 0,
    },
    hfStats.getModel(),
    {
      freespinsCount: 0,
      avgFreespinsCount: 0,
      base: Object.assign(winStats.getModel()),
    }, respinAction.getModel())
  context.outputFields.includes('fsStats') || context.outputFields.push('fsStats')
  model = context.fsStats
  context.states || (context.states = {})
  context.states[TRIGGER.FREESPINS] = model
}
context.addResetListener(reset)
reset()

mainStats.addUpdateListener(() => {
  const spinCount = model.freespinsCount
  respinAction.updateStats(model, spinCount)
  mathUtils.updateSymbolsSum(model.base)
  hfStats.update(model, context.fsStats.freespinsCount) 
  winStats.update(model.base, spinCount)
  model.avgPay = model.win / model.triggered

  model.win = model.base.win
  model.rtp = model.base.rtp
})

function checkFSendStats() {
  if (context.nextTrigger === TRIGGER.FREESPINS_END) {
    const fs = context.call.context.freespins
    model.triggered++
    model.freespinsCount += fs.all
    model.avgFreespinsCount = model.freespinsCount / model.triggered
    //model.base.win += fs.total
  }
}

module.exports = async function freespinsAction() {
  await call(baseCallBody())
  context.win = context.call.context?.win?.total ? context.call.context.win.total : 0
  checkFSendStats()
  winStats.check(model.base, model)
  mainStats.update()
}
