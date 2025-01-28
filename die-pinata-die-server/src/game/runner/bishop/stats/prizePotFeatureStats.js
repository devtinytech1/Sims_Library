
const hfStats = require('./hfStats')
const context = require('../models/context')
const mathUtils = require('../utils/math')

function getModel() {
  return {
    prizePot: Object.assign({
      win: 0,
      rtp: 0,
      map: {},
      mapSum: 0,

      Mini: 0,
      Minor: 0,
      Major: 0,
      Grand: 0,
    }, hfStats.getModel()),
  }
}

function getStats(statsBase) {
  return statsBase.prizePot
}

function check(statsBase) {
  if (context.call.context?.features?.prizePot && context.call.context?.features?.prizePot.win) {
    const model = statsBase.prizePot,
      win = context.call.context.features.prizePot.win
      model.win += win
    mathUtils.increaseStat(model.map, win)
    model.triggered ++

    if(context.call.context.features.prizePot.level == 0)
    {
      model.Mini += context.call.context.features.prizePot.win
    }
    if(context.call.context.features.prizePot.level == 1)
    {
      model.Minor += context.call.context.features.prizePot.win
    }
    if(context.call.context.features.prizePot.level == 2)
    {
      model.Major += context.call.context.features.prizePot.win
    }
    if(context.call.context.features.prizePot.level == 3)
    {
      model.Grand += context.call.context.features.prizePot.win
    }
  }
}

function update(statsBase, spinCount) {
  const model = statsBase.prizePot
  model.rtp = mathUtils.getRTP(model.win)
 
  model.mapSum = Object.entries(model.map)
    .reduce((acc, [win, count]) => acc + Number(win) * count, 0)
  hfStats.update(model, spinCount)
  
}

module.exports = { getModel, check, update, getStats }
