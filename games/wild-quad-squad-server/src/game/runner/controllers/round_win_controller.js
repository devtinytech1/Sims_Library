
const { bigWinCheck } = require('../../../../../../src/sims_data/features/big_win_feature.cjs')

function checkRoundWin(client) {
  let win = client.node.context.win?.total || 0
  if (win) {
    bigWinCheck(client, client.node.context.win)
  }
  client.addSpinTotal(win || 0)
  return win
}

module.exports = { checkRoundWin }
