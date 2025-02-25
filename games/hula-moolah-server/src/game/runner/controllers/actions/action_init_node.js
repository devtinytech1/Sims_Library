const baseSettings = require('../../configs/settings.js');
const { triggers } = require('../../configs/triggers');
const { getMatrix } = require('../matrix_controller.js');
const { configureSettings, runBoardGeneration10 } = require('../../../../../../../src/game/runner/controllers/actions/main_action_init.cjs');

module.exports.execute = async function (client) {
  const settings = baseSettings.get(client.gameId);

  // Configure client settings
  configureSettings(client, settings, baseSettings);

  if (client.lastResponse && client.lastResponse.context) {
    client.node.context = client.lastResponse.context;
    if (!client.node.context.matrix) {
      await runBoardGeneration10(client, client.lastResponse.state, client.lastResponse.trigger, getMatrix, triggers, baseSettings);
    } else {
      client.node.trigger = client.lastResponse.trigger;
      client.node.state = client.lastResponse.state;
      if (client.node.state !== triggers.spin) {
        client.roundRestore = true;
      }
    }
  } else {
    await runBoardGeneration10(client, triggers.spin, null, getMatrix, triggers, baseSettings);
  }
};
