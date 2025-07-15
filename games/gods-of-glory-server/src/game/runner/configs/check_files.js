const path = require('path');

const filesToCheck = {
  settings: path.join(__dirname, 'settings.js'),
  sequences: path.join(__dirname, 'sequences.js'),
  matrix_controller: path.join(__dirname, '../controllers/matrix_controller.js'),
  cluster_controller: path.join(__dirname, '../controllers/cluster_controller.js'),
  actions_controller: path.join(__dirname, '../controllers/actions_controller.js'),
  random_controller: path.join(__dirname, '../math/random_controller.js')
};

function get() {
  return filesToCheck;
}

module.exports = { get };