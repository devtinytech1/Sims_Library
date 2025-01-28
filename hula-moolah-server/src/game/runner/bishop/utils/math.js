
const context = require('../models/context')

function getRTP(val) {
  return ((val * 10000 / context.stats.totalBet) / 100)
}

function round(val, params = 1000) {
  return Math.round(val * params) / params
}

function updateSymbolsSum(stats) {
  stats.symbolsSum = 0
  Object.values(stats.symbols).forEach(symbolStats => Object.values(symbolStats).forEach(countStats =>
    stats.symbolsSum += countStats.w))
}

module.exports = { getRTP, round, updateSymbolsSum }
