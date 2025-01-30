
const baseSettings = require('../../../../../src/game/runner/configs/settings.cjs');

function check(client, win) {
  win && baseSettings.base.bigWin.forEach(set => win >= set.value * client.spinBet && (client.getFeatures().bigWin = { type: set.key } ) && ( client.context.win.type = { type: set.key }))
 
}

module.exports = { check }
