const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings')
const random = require('../math/random_controller')

async function make(client, spinMod, rows) {
  if (baseSequences.get(client.gameId)['default_basegame_position'] && client.node.state == undefined) {
    return baseSequences.get(client.gameId)['default_basegame_position'];
  }

  const settings = baseSettings.get(client.gameId)
  if (settings.reelsSet[`${spinMod}Prob`]) {
    const option = await random.getRandomItemByArrayWeights(client, settings.reelsSet[`${spinMod}Prob`],
      settings.reelsSet[`${spinMod}Set`])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await random.getRandomItems(client, sequences[ix], { count: rows, ix })
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
