const baseSettings = require('../../../../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs');
const features = require('../../../../../../../src/sims_data/features/features.cjs');
const linesController = require('../lines_controller');
const matrix = require('../matrix_controller');
const { configureSettings, runBoardGeneration } = require('../../../../../../../src/game/runner/controllers/actions/main_action_init.cjs');

module.exports.execute = async function (client) {
  try {
    const settings = baseSettings.get(client.gameId);

    // Configure client settings
    configureSettings(client, settings, baseSettings);

    if (client.lastResponse && client.lastResponse.context) {
      client.node.context = client.lastResponse.context;
      if (!client.matrix) {
        await runBoardGeneration(client, client.prevState, client.prevTrigger, matrix, linesController, features, baseSettings);
      } else {
        client.nextTrigger = client.prevTrigger;
        client.nextState = client.prevState;
        if (client.nextState !== TRIGGER.SPIN) {
          client.roundRestore = true;
        }
        client.getWinModel = () => client.context?.win || {};
        client.getFeatures = () => client.context?.features || {};
      }
    } else {
      await runBoardGeneration(client, TRIGGER.SPIN, null, matrix, linesController, features, baseSettings);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
