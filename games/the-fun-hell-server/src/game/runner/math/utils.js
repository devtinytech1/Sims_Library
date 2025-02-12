
const baseSettings = require('../configs/settings')

function round(value) {
  return Math.round(value * baseSettings.base.currency) / baseSettings.base.currency
}

module.exports = { round }
