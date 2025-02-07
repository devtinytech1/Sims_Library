
const { round } = require('../../../../../../src/utils/math.cjs')
const { bigWinCheck } = require('../../../../../../games/hula-moolah-server/tools/simulations/features/big_win_feature.cjs')

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
