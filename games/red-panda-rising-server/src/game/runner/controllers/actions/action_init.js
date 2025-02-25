const baseSettings = require('../../configs/settings.js');
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs');
const features = require('../../../../../../red-panda-rising-server/tools/simulations/Features/features.js');
const linesController = require('../lines_controller');
const matrix = require('../matrix_controller');
const { configureSettings, runBoardGeneration03 } = require('../../../../../../../src/game/runner/controllers/actions/main_action_init.cjs');

module.exports.execute = async function (client) {
  try {
    const settings = baseSettings.get(client.gameId);

    // Configure client settings
    configureSettings(client, settings, baseSettings);

    async function executeBoardGeneration(state, trigger) {
      await runBoardGeneration03(client, state, trigger, matrix, linesController, baseSettings, TRIGGER, features);
    }

    if (client.lastResponse && client.lastResponse.context) {
      client.node.context = client.lastResponse.context;
      if (!client.node.context.matrix) {
        await executeBoardGeneration(client.prevState, client.prevTrigger);
      } else {
        client.node.trigger = client.lastResponse.trigger;
        client.node.state = client.lastResponse.state;
        if (client.node.state !== TRIGGER.SPIN) {
          client.roundRestore = true;
        }
        client.getWinModel = () => client.context?.win || {};
        client.getFeatures = () => client.context?.features || {};
      }
    } else {
      await executeBoardGeneration(TRIGGER.SPIN);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
