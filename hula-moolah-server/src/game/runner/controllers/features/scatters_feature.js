
const { triggers } = require('../../configs/triggers')
const { foundSymbols } = require('../../math/found_symbols')
const { initFreespins } = require('../actions/action_freespin_node')

const triggersMap = new Map()
triggersMap.set(triggers.freespins, initFreespins)

function scatterFeatureCheck(client, matrix, settings, state, trigger, isHoldnspinTriggered) {
  var isfrtriggered = false
  const sym = settings.scatters.symbol
  client.node.context.matrix = matrix;
  const mask = foundSymbols(client, matrix, sym)
  if (mask.length >= settings.scatters.triggers[0].found) {
    for (let i = settings.scatters.triggers.length - 1; i >= 0; i--) {
      if (mask.length >= settings.scatters.triggers[i].found) {
        triggersMap.get(settings.scatters.trigger)(client, mask, settings.scatters.triggers[i], state, trigger, isHoldnspinTriggered)
        isfrtriggered = true
        break
      }
    }
  } 
  return isfrtriggered
}

module.exports = { scatterFeatureCheck }
