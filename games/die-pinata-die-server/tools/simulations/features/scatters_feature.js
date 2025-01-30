const matrix_controller = require('../../../src/game/runner/controllers/matrix_controller');
const { initFreespins } = require('../../../tools/simulations/freespins')

//To check the freespin triggered or not based on the condition
async function scatterFeatureCheck(client, matrix, settings, isFsDiceTriggered) {
  let isfrtriggered = false
  const scatterSymbol = settings.scatters.triggerSymbol
  const mask = matrix_controller.foundSymbols(matrix, scatterSymbol);
  const minScatterSymbols = settings.scatters.minTriggerCount;
  //If the scatter symbols found is greater than or equal to 5 then the freespin is triggered
  if (mask.length >= minScatterSymbols) {
    isfrtriggered = true
    await initFreespins(client, matrix, mask, isFsDiceTriggered)
  }

  return isfrtriggered
}
module.exports = { scatterFeatureCheck }
