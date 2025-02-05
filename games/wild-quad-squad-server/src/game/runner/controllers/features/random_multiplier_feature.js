const baseSettings = require('../../configs/settings')
function setMultiplierModel(currentContext, settings, sym) {
  (currentContext.multiplierForSymbols[sym]) === 1 ? (currentContext.multiplierForSymbols[sym] += 1) : (currentContext.multiplierForSymbols[sym] += settings.features.multiplier_upgrade)
  return currentContext.multiplierForSymbols
}

function executeMultiplierFeature(client, symbol) {
  const settings = baseSettings.get(client.gameId)
  let multi = setMultiplierModel(client.context, settings, symbol)
  return multi
}


module.exports = { executeMultiplierFeature }
