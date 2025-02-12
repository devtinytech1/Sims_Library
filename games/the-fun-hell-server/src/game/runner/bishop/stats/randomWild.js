
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const hfStats = require('./hfStats')

function getModel() {
  return {
    randomWild: Object.assign({
      total: 0,
      avg: 0,
      wildsCountMap: {},
    }, hfStats.getModel()),
  }
}

function check(statsBase) {
  const data = context.call.context?.features?.randomWild
  if (data && data.mask.length) {
    statsBase.randomWild.triggered++
    statsBase.randomWild.total += context.call.context.win.total
    mathUtils.increaseStat(statsBase.randomWild.wildsCountMap, data.mask.length)
  }
}

function update(statsBase, spinCount) {
  statsBase.randomWild.avg = mathUtils.round(statsBase.randomWild.total / statsBase.randomWild.triggered)
  hfStats.update(statsBase.randomWild, spinCount)
}

module.exports = { getModel, check, update }
