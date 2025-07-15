const { execute } = require('./controllers/actions_controller');
const { init } = require('./controllers/actions/action_init');

module.exports = { execute, init };