
const { round } = require('../../../../../../src/utils/math.cjs')
const { bigWinCheck } = require('./features/big_win_feature')
const { TRIGGER } = require('../../../../../../src/game/runner/configs/static.cjs')

function checkRoundWin(client) {
  let win = client.node.context.win?.total || 0
  if (win) {
    bigWinCheck(client, client.node.context.win)
  }
  client.addSpinTotal(win || 0)
  return win
}

module.exports = { checkRoundWin }
