
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const mainStats = require('../../stats/mainStats')
const winStats = require('../../stats/winStats')
const call = require('../call')
const hfStats = require('../../stats/hfStats')
const { TRIGGER } = require('../../../configs/static')
const mathUtils = require('../../utils/math')
const prizePotStats = require('../../stats/prizePotFeatureStats')

function getModel() {
  return { respin: Object.assign({ count: {} }, hfStats.getModel()) }
}

function getStats(statsBase) {
  return statsBase.respin
}

function updateStats(statsBase, spinCount) {
  hfStats.update(statsBase.respin, spinCount)
}

async function respinAction() {
  await call(baseCallBody())
  context.win = context.call.context?.win?.total ? context.call.context.win.total : 0
  const model = context.states[context.call.state]
  if(context.nextState === TRIGGER.FREESPINS){
    model.respin.triggered++
  }
  else{
    model.base.respin.triggered++
  }
 if(context.nextTrigger !== TRIGGER.RESPIN) {
  if(context.nextState === TRIGGER.FREESPINS){
    mathUtils.increaseStat(model.respin.count, context.call.context.features.respins)
  }
  else{
    mathUtils.increaseStat(model.base.respin.count, context.call.context.features.respins)
  }
}
  prizePotStats.check(model.base)
  winStats.check(model.base, model)
  mainStats.update()
}

module.exports = { respinAction, getModel, updateStats, getStats }
