
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const hfStats = require('./hfStats')

function getModel() {
  return {
    wheelFeature: Object.assign({
      total: 0,
      wheelCountMap: {}
    }, hfStats.getModel()),
  }
}

function check(statsBase) {
  const data = context.call.context?.features?.wheel
  if (data && data.wheel.length) {
    statsBase.wheelFeature.triggered++
    statsBase.wheelFeature.total += context.call.context.features.total
    mathUtils.increaseStat(statsBase.wheelFeature.wheelCountMap, data.wheel.length)
  }
}

function update(statsBase, spinCount) {
  statsBase.wheelFeature.avg = mathUtils.round(statsBase.wheelFeature.total / statsBase.wheelFeature.triggered)
  hfStats.update(statsBase.wheelFeature, spinCount)
}

module.exports = { getModel, check, update }
