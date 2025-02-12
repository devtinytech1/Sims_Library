
const foundMatrix = require('../../src/game/runner/controllers/matrix_controller')
const baseSequences = require('../../src/game/runner/configs/sequences')
const baseSettings = require('../../src/game/runner/configs/settings');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../tools/simulations/round_win_controller');
const features = require('../../src/game/runner/controllers/features/features');
const respinData = require('../../tools/simulations/respin');


// function initializeFreespins(client) {
//   client.node.context.freespins.roundFsRespinWin = 0;
//   client.node.context.freespins.fsWin = 0;
// }


//To initialize freespins feature with the number of freespins triggered.
async function initWheel(client, fs_triggering_matrix, mask, isFsDiceTriggered) {
//   const add = mask.length
//   const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
//   setFreespinsModel(client.context, add, add, add, default_freespins_position, fs_triggering_matrix)
  client.context.freespins.scatters = mask
  await execute(client)
}

//Starting point of the action freespins
async function execute(client) {
  const settings = baseSettings.get(client.gameId);
//   initializeFreespins(client);
//   while (client.context.freespins.left) {
    await processFreespin(client, settings, isFsDiceTriggered);
//   }
}


module.exports = { execute, initWheel }