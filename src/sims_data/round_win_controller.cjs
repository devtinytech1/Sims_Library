
const mathUtils = require('../../src/utils/math.cjs')
const features = require('./features/features.cjs')
const ways = require('../../games/die-pinata-die-server/src/game/runner/controllers/lines_controller')

async function check(client) {
  const clientFeatures = client.getFeatures()
  ways.checkWays(client, client.matrix)
  let win = client.getWinModel().total || 0
  client.node.context.basegameWin = win
  clientFeatures.total && (win = mathUtils.round(win + clientFeatures.total))

  if (win) {
    features.winType.check(client, win)
    if (client.node.context.win.lines.length > 1) {
      client.node.context.win.lines.sort((a, b) => b.win - a.win)
    }
  }

  client.addSpinTotal(win || 0)
  return win
}

module.exports = { check }

