
const baseSettings = require('../../../games/wild-quad-squad-server/src/game/runner/configs/settings.js')

function bigWinCheck(client, model) {
  if (model?.total) {
    for (let i = 0; i < baseSettings.base.bigWin.length; i++) {
      if (model.total >= baseSettings.base.bigWin[i].value * client.spinBet) {
        model.type = baseSettings.base.bigWin[i].key
      }
    }
  }
}

module.exports = { bigWinCheck }
