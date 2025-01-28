
const { foundSymbols } = require('../../../src/game/runner/math/found_symbols')
const { initFreespins } = require('../freespins')

async function scatterFeatureCheck(client, matrix, settings) {
  let isfrtriggered = false
  const sym = settings.scatters.symbol
  client.node.context.matrix = matrix;
  const mask = foundSymbols(client, matrix, sym)
  if (mask.length >= settings.scatters.triggers[0].found) {
    for (let i = settings.scatters.triggers.length - 1; i >= 0; i--) {
      if (mask.length >= settings.scatters.triggers[i].found) {
        isfrtriggered = true
        await initFreespins(client, mask, settings.scatters.triggers[i])
        break
      }
    }
  }
  return isfrtriggered
}

module.exports = { scatterFeatureCheck }