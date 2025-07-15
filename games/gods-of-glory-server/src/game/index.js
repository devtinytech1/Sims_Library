const { execute } = require('./runner/controllers/actions_controller');
const { init } = require('./runner/controllers/actions/action_init');
const audit = require('./audit');

async function play(requestData) {
  return await execute(requestData);
}

module.exports = { init, play, audit };