const matrix_controller = require('../../../../games/wild-quad-squad-server/tools/simulations/matrix_controller');
const { initFreespins } = require('../../../../games/die-pinata-die-server/tools/simulations/freespins');

//To check the freespin triggered or not based on the condition
async function scatterFeatureCheck1(client, matrix, settings, isFsDiceTriggered = false) {
  const scatterSymbol = settings.scatters.triggerSymbol;
  const mask = matrix_controller.foundSymbols(matrix, scatterSymbol);
  const trigger = settings.scatters;
  let isFSTriggered = false
  //If the scatter symbols found is greater than or equal to 5 then the freespin is triggered
  if (mask.length >= trigger.minTriggerCount) {
    await initFreespins(client, mask, isFsDiceTriggered);
    isFSTriggered = true;
  }
  return isFSTriggered
}

//To check the freespin triggered or not based on the condition
async function scatterFeatureCheck2(client, matrix, settings) {
  const scatterSymbol = settings.scatters.triggerSymbol;
  const mask = matrix_controller.foundSymbols(matrix, scatterSymbol);
  const trigger = settings.scatters;
  let isFSTriggered = false
  //If the scatter symbols found is greater than or equal to 3 then the freespin is triggered
  for (let i = trigger.triggers.length - 1; i >= 0; i--) {
    const triggerSetting = trigger.triggers[i];
    if (mask.length >= triggerSetting.found) {
      await initFreespins(client, triggerSetting.count);
      isFSTriggered = true;
      break; // Exit the loop once the condition is met
    }
  }
  return isFSTriggered
}

module.exports = { scatterFeatureCheck1, scatterFeatureCheck2 };