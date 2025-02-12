
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs')
const matrixController = require('../matrix_controller')

async function scatterFeatureCheck(client, settings) 
{
  const scatter = settings.scatters.symbol
  const mask = matrixController.foundSymbols(client.matrix, scatter)

  if (mask.length >= settings.scatters.symbol_length) {
    client.getFeatures().isScatter = true
    client.nextTrigger = TRIGGER.BONUS
  }
}

module.exports = { scatterFeatureCheck }
