const matrix_controller = require('../../../src/game/runner/controllers/matrix_controller');
const { initFreespins } = require('../../../tools/simulations/freespins')
const { check } = require('../../../tools/simulations/features/wheel_feature')

//To check the freespin triggered or not based on the condition
// async function scatterFeatureCheck(client, matrix, settings, isFsDiceTriggered) {
  // const scatterSymbol = settings.scatters.triggerSymbol
//   const mask = matrix_controller.foundSymbols(matrix, scatterSymbol);
//   const minScatterSymbols = settings.scatters.minTriggerCount;
//   //If the scatter symbols found is greater than or equal to 5 then the freespin is triggered
//   if (mask.length >= minScatterSymbols) {
    // await initFreespins(client, matrix, mask, isFsDiceTriggered)
//   }
// }

async function scatterFeatureCheck(client, settings) 
{
  const scatter = settings.scatters.symbol
  const mask = matrix_controller.foundSymbols(client.matrix, scatter)

  if (mask.length >= settings.scatters.symbol_length) {
    // client.getFeatures().isScatter = true
    await check(client, client.matrix)
    // client.nextTrigger = TRIGGER.BONUS
  }
}
module.exports = { scatterFeatureCheck }
