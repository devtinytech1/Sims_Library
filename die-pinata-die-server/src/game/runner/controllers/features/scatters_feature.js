
const { TRIGGER } = require('../../configs/static');
const matrix_controller = require('../matrix_controller')
const { initFreespins } = require('../actions/action_freespins')

// Create a map to associate freespins triggers with their respective initFreespins functions.
const triggersMap = new Map()
triggersMap.set(TRIGGER.FREESPINS, initFreespins)

//To check the freespin triggered or not based on the condition
function scatterFeatureCheck(client, matrix, settings) {
  const scatterSymbol  = settings.scatters.triggerSymbol
  const mask = matrix_controller.foundSymbols(matrix, scatterSymbol);
  const minScatterSymbols  = settings.scatters.minTriggerCount; 

  //If the scatter symbols found is greater than or equal to 5 then the freespin is triggered
  if (mask.length >= minScatterSymbols ){
        triggersMap.get(settings.scatters.trigger)(client,matrix, mask) 
        client.nextTrigger = TRIGGER.FREESPINS // Set the next trigger for the client to FREESPINS.
      }
}

module.exports = { scatterFeatureCheck }
