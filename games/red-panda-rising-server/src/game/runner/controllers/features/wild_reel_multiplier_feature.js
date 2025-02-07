
const baseSettings = require('../../configs/settings.js')
const { getRandomItemByArrayWeights } = require('../../math/random_controller.js')

async function executeFreegameWildReelMultiplierFeature(client) {
  const settings = baseSettings.get(client.gameId)
  let multiplierReel = client.getFreespins().reelMultiplier

  return await getRandomItemByArrayWeights(client,
    settings.features[`FREEGAME_WILD_REEL_MULTIPLIER_${multiplierReel}`].weights, settings.features[`FREEGAME_WILD_REEL_MULTIPLIER_${multiplierReel}`].values)

}

async function getWildReelMultiplier(client) {
  const settings = baseSettings.get(client.gameId)
  let reelMultiplier = await getRandomItemByArrayWeights(client, settings.features.FREEGAME_WILD_REEL_MULTIPLIER_WEIGHT,
    settings.features.FREEGAME_WILD_REEL_MULTIPLIER_VALUE)
  return reelMultiplier;
}

module.exports = { executeFreegameWildReelMultiplierFeature, getWildReelMultiplier }
