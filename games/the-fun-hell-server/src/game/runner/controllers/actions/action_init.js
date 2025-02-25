const baseSettings = require('../../configs/settings.js');
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs');
const { configureSettings } = require('../../../../../../../src/game/runner/controllers/actions/main_action_init.cjs');
const linesController = require('../lines_controller');
const matrix = require('../matrix_controller');
const features = require('../features/features');

// Generic function to handle board generation
async function runBoardGeneration(client, { state, trigger, matrix, linesController, features, baseSettings }) {
  client.node.context = { matrix: await matrix.make(client, 'MainBoard', baseSettings.base.rows) };
  linesController.makeWinModel(client, client.context);
  client.nextState = state;
  client.nextTrigger = trigger || state;
  features.init(client);
}

module.exports.execute = async function (client) {
  try {
    const settings = baseSettings.get(client.gameId);

    // Configure client settings
    configureSettings(client, settings, baseSettings);

    if (client.lastResponse && client.lastResponse.context) {
      client.node.context = client.lastResponse.context;

      if (!client.matrix) {
        await runBoardGeneration(client, { state: client.prevState, trigger: client.prevTrigger, matrix, linesController, features, baseSettings });
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
      await runBoardGeneration(client, { state: TRIGGER.SPIN, trigger: TRIGGER.SPIN, matrix, linesController, features, baseSettings });
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
