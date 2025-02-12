
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const hfStats = require('./hfStats')

function getModel() {
  return {
    mode: Object.assign({
      total: 0,
      avg: 0,
      rtp: 0,
      all: 0,
      avgAll: 0,
    }, hfStats.getModel()),
  }
}

function check(statsBase) {
  if (context.call.context?.features?.mode) {
    const data = context.call.context.features.mode
    if (data.all === data.left) {
      statsBase.mode.triggered++
    }
    if (data.left === 0) {
      statsBase.mode.total += data.total
      statsBase.mode.all += data.all
    }
  }
}

function update(statsBase, spinCount) {
  statsBase.mode.avg = mathUtils.round(statsBase.mode.total / statsBase.mode.triggered)
  statsBase.mode.rtp = mathUtils.getRTP(statsBase.mode.total)
  statsBase.mode.avgAll = statsBase.mode.all / statsBase.mode.triggered
  hfStats.update(statsBase.mode, spinCount)
}

module.exports = { getModel, check, update }
