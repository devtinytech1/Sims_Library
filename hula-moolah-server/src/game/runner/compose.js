
function response(client) {
  const data = {
    stash: client.node,
    context: {
      matrix: client.node.context.matrix,
      spinTotal: client.node.spinTotal,
      spinBet: client.spinBet,
      state: client.node.state,
      trigger: client.node.trigger,
      winCap: client.node.context.winCap,
      currentGameMetaMorphicLevel: client.node.currentGameMetaMorphicLevel,
      previousGameMetaMorphicLevel: client.node.previousGameMetaMorphicLevel,
      WildMatrix: client.node.context.WildPresent,
    },
  }
  if (client.node.context.win) {
    data.lines = {
      map: client.node.context.win.lines,
      totalWin: client.node.context.win.total,
      winType: client.node.context.win.type,
    }
  }
  if (client.node.context.features) {
    data.features = client.node.context.features
  }
  if (client.node.context.freespins) {
    data.freespins = client.node.context.freespins
  }
  if (client.node.context.holdnspin) {
    data.holdnspin = client.node.context.holdnspin
  }
  if (client.node.settings) {
    data.settings = client.node.settings
  }
  if (client.node.settingsKey) {
    data.settingsKey = client.node.settingsKey
  }
  return {
    data, totalBet: client.roundBet, gameRoundOver: client.gameRoundOver,
    totalWin: client.totalWin, roundRestore: client.roundRestore,
  }
}

module.exports = { response }
