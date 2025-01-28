
const mathUtils = require('../../../utils/math')
const { TRIGGER } = require('../configs/static')
const features = require('./features/features')
const ways = require('./lines_controller')

function check(client) {
  const clientFeatures = client.getFeatures()
  ways.checkWays(client, client.matrix)
  let win = client.getWinModel().total || 0

  clientFeatures.total && (win = mathUtils.round(win + clientFeatures.total))

  if(client.node.state === TRIGGER.FREESPINS){
    client.node.context.freespins.total += win
  }
 
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
