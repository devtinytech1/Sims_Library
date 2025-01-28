
const { round } = require('../../../utils/math')
const { bigWinCheck } = require('./features/big_win_feature')

function checkRoundWin(client) {
  bigWinCheck(client, client.node.context.win)
  let win = client.node.context.win?.total || 0
  if (client.node.context.features && client.node.context.features.total) {
    win = round(win + client.node.context.features.total)
  }
  client.addSpinTotal(win || 0)
  return win
}

module.exports = { checkRoundWin }
