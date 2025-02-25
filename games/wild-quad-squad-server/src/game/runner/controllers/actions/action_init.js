const baseSettings = require('../../configs/settings.js');
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs');
const { configureSettings } = require('..//../../../../../../src/game/runner/controllers/actions/main_action_init.cjs');
const matrix = require('../../../../../../../games/wild-quad-squad-server/tools/simulations/matrix_controller.js');

module.exports.execute = async function (client) {
  const settings = baseSettings.get(client.gameId);

  // Configure client settings
  configureSettings(client, settings, baseSettings);

  async function runBoardGeneration(state, trigger) {
    client.node.context = { matrix: await matrix.make(client, TRIGGER.SPIN, baseSettings.base.rows) };
    client.node.state = state;
    client.node.trigger = trigger || state;
  }

  if (client.lastResponse && client.lastResponse.context) {
    client.node.context = client.lastResponse.context;
    if (!client.node.context.matrix) {
      await runBoardGeneration(client.lastResponse.state, client.lastResponse.trigger);
    } else {
      client.node.trigger = client.lastResponse.trigger;
      client.node.state = client.lastResponse.state;
      if (client.node.state !== TRIGGER.SPIN) {
        client.roundRestore = true;
      }
    }
  } else {
    await runBoardGeneration(TRIGGER.SPIN);
  }
};
