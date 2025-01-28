
const { getWeightResultIndex } = require('../../math/random_controller')
const context = require('../models/context')

function getRTP(val) {
  return Math.round(val * 100000 / context.getMainStats().totalBet) / 1000
}

function round(val, params = 1000) {
  return Math.round(val * params) / params
}

function updateSymbolsSum(stats) {
  stats.symbolsSum = 0
  Object.values(stats.symbols).forEach(symbolStats => Object.values(symbolStats).forEach(countStats =>
    stats.symbolsSum += countStats.w))
}

function increaseStat(body, key, value) {
  try {
    body[key] = body[key] ?
      value ?
        body[key] + value :
        body[key] + 1 :
      value ?
        value :
        1
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

function randomWeight(weight, values) {
  return values[getWeightResultIndex(weight, Math.floor(Math.random() * weight.reduce((acc, val) => acc + val)))]
}

module.exports = { getRTP, round, updateSymbolsSum, increaseStat, randomWeight }
