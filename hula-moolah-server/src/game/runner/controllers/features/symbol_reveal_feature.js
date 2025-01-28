const baseSettings = require('../../configs/settings.js')
const { getRandomItemByArrayWeights } = require('../../math/random_controller')

function setRevealModel(currentContext, matrix, symbol, mask, settings) {
  if (!currentContext.features) {
    currentContext.features = { total: 0 }
  }
  currentContext.features.symbolReveal = { symbol, mask }
  mask.forEach(msk => matrix[msk[0]][msk[1]] = settings.features.symbolReveal.revealSymbol)
}

async function executeSymbolRevealFeature(client, matrix) {
  const settings = baseSettings.get(client.gameId)
  if (await getRandomItemByArrayWeights(client, settings.features.symbolReveal.weights, [false, true])) {
    const map = {}
    matrix.forEach((reel, reelId) => {
      reel.forEach((sym, ix) => {
        if (settings.features.symbolReveal.symbols.includes(sym)) {
          if (!map[sym]) {
            map[sym] = []
          }
          map[sym].push([reelId, ix])
        }
      })
    })
    const symbols = Object.keys(map)
    if (symbols.length) {
      const sym = await getRandomItemByArrayWeights(client, symbols.map(() => 10), symbols)
      setRevealModel(client.node.context, matrix, sym, map[sym], settings)
    }
  }
}

module.exports = { executeSymbolRevealFeature }
