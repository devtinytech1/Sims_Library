const { getRandomItemByArrayWeights } = require('../../math/random_controller');
const baseSettings = require('../../configs/settings.js');

const METAMORPHIC_PROB = 'metamorphic_prob';
const METAMORPHIC_SET = 'metamorphic_set';

async function checkMetamorphicMatrix(client, matrix) {
  let isMetamorphic = false;

  const settings = baseSettings.get(client.gameId);
  isMetamorphic = await getRandomItemByArrayWeights(client, settings.features.metamorphic[METAMORPHIC_PROB], settings.features.metamorphic[METAMORPHIC_SET]);
  if (isMetamorphic) {

    client.node.previousGameMetaMorphicLevel = client.lastResponse.currentGameMetaMorphicLevel
    if (client.node.currentGameMetaMorphicLevel < 4) {
      client.node.currentGameMetaMorphicLevel++;
    }
  }
  return isMetamorphic;
}

module.exports = { checkMetamorphicMatrix };
