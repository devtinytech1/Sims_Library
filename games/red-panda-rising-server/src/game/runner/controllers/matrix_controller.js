
const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings')
const randomController = require('../math/random_controller')

async function make(client, spinMod, rows = 3) {
  const settings = baseSettings.get(client.gameId)
  if (settings.reelsSet[spinMod + '_Prob']) {
    const option = await randomController.getRandomItemByArrayWeights(client, settings.reelsSet[spinMod + '_Prob'],
      settings.reelsSet[spinMod + '_Set'])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await randomController.getRandomItems(client, sequences[ix], { count: rows, ix })
      result.push(body.result)
      return ix === sequences.length - 1 ? result : await getReel(ix + 1)
    }
    return await getReel(0)
  }
  else {
    return Promise.reject(`spin mode: ${spinMod}`)
  }
}

module.exports = { make }
