
const mathUtils = require('../../../../../src/utils/math.cjs')

function compose(client) {
  const data = {
    serverData: client.node,
    clientData: {
      context: {
        matrix: client.matrix,
        state: client.nextState,
        trigger: client.nextTrigger,
        spinTotal: client.node.spinTotal,
        spinBet: client.spinBet,
        winCap: client.node.context.winCap,
      },
      win: {
        total: 0,
        type: 'regular',
      },
      features: {},
    },
  }
  if (client.context.win) {
    data.clientData.lines = {
      map: client.context.win.lines,
      totalWin: client.context.win.total,
    }
    data.clientData.win.total = client.context.win.total
  }
  const features = client.getFeatures()
  if (features) {
    data.clientData.features = features
    features.total && (data.clientData.win.total = mathUtils.round(data.clientData.win.total + features.total))
    features.bigWin && (data.clientData.win.type = features.bigWin.type)
  }
  client.context.winCap && (data.clientData.winCap = true)
  client.context.freespins && (data.clientData.freespins = client.context.freespins)
  client.node.settings && (data.clientData.settings = client.node.settings)
  client.node.settingsKey && (data.clientData.settingsKey = client.node.settingsKey)

  return {
    data, totalBet: client.roundBet, gameRoundOver: client.gameRoundOver,
    totalWin: client.totalWin, roundRestore: client.roundRestore,
  }
}

module.exports = { compose }
