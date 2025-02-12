const matrix_controller = require('../../../../../src/game/runner/math/foundSymbols.cjs');
const { check } = require('../../../tools/simulations/features/wheel_feature')

async function scatterFeatureCheck(client, settings) 
{
  const scatter = settings.scatters.symbol
  const mask = matrix_controller.foundSymbols(client.matrix, scatter)

  if (mask.length >= settings.scatters.symbol_length) {
    await check(client, client.matrix)
  }
}
module.exports = { scatterFeatureCheck }
