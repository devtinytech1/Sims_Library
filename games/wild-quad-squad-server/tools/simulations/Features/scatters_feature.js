const { foundSymbols } = require('../matrix_controller')
const { initFreespins } = require('../../../tools/simulations/freespins')

async function scatterFeatureCheck(client, matrix, settings) {
  const sym = settings.scatters.symbol
  const mask = foundSymbols(matrix, sym)
  if (mask.length >= settings.scatters.triggers[0].found) {
    for (let i = settings.scatters.triggers.length - 1; i >= 0; i--) {
      if (mask.length >= settings.scatters.triggers[i].found) {
        await initFreespins(client, settings.scatters.triggers[i])
        break
      }
    }
  }
}

module.exports = { scatterFeatureCheck }
