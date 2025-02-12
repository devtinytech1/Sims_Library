
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const hfStats = require('./hfStats')

function getModel() {
  return {
    collect: Object.assign({
      total: 0,
      avg: 0,
      triggersMap: {},
      symbolsMap: {},
      valuesMap: {},
    }, hfStats.getModel()),
  }
}

function check(statsBase) {
  if (context.call.context?.features?.collect) {
    const data = context.call.context.features.collect
    if (data.total) {
      statsBase.collect.total += data.total
      statsBase.collect.triggered++
      statsBase.collect.avg = mathUtils.round(statsBase.collect.total / statsBase.collect.triggered)
      mathUtils.increaseStat(statsBase.collect.triggersMap, data.triggers.length)
      mathUtils.increaseStat(statsBase.collect.symbolsMap, data.mask.length)
      data.values.forEach(value => mathUtils.increaseStat(statsBase.collect.valuesMap, value))
    }
  }
}

function update(statsBase, spinCount) {
  hfStats.update(statsBase.collect, spinCount)
}

module.exports = { getModel, check, update }
