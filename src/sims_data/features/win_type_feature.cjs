
const baseSettings = require('../../../games/die-pinata-die-server/src/game/runner/configs/settings');

function check(client, win) {
  win && baseSettings.base.bigWin.forEach(set => win >= set.value * client.spinBet && (client.getFeatures().bigWin = { type: set.key } ) && ( client.context.win.type = { type: set.key }))
 
}

module.exports = { check }
