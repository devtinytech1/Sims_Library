
const { getRandomItemByArrayWeights } = require('../../../../src/game/runner/math/random_controller.js')
const baseSettings = require('../../../../src/game/runner/configs/settings')

async function executeFreegameWildReelMultiplierFeature(client) {
  const settings = baseSettings.get(client.gameId)
  let multiplierReel = client.getFreespins().reelMultiplier

  if (multiplierReel) {
    return await getRandomItemByArrayWeights(client,
      settings.features[`FREEGAME_WILD_REEL_MULTIPLIER_${multiplierReel}`].weights, settings.features[`FREEGAME_WILD_REEL_MULTIPLIER_${multiplierReel}`].values)
  }
}

async function getWildReelMultiplier(client) {
  const settings = baseSettings.get(client.gameId)
  let reelMultiplier = await getRandomItemByArrayWeights(client, settings.features.FREEGAME_WILD_REEL_MULTIPLIER_WEIGHT,
    settings.features.FREEGAME_WILD_REEL_MULTIPLIER_VALUE)
  return reelMultiplier;
}

module.exports = { executeFreegameWildReelMultiplierFeature, getWildReelMultiplier }
