
const baseSettings = require('../../src/game/runner/configs/settings')

function init(client, mode) {
  const settings = baseSettings.get(client.gameId).freespins,
    { count, multiplier } = settings.choice[mode]
  client.node.context.freespins = {
    all: count || 0,
    add: count || 0,
    left: count || 0,
    total: 0,
    scatters: [],
    expandingWildPos: [],
    reelMultiplier: '',
    multiplier,
    mode,
    basegameWin:{},
    fs_matrix:[],
    scatterWin:0
  }
  client.node.context.isFSTriggered = true
  client.getFreespins = () => client.node.context.freespins
}

function copy(client) {
  // client.context.freespins = { ...client.prevContext.freespins }
  client.context.freespins.add = 0
  client.getFreespins = () => client.context.freespins
  return client.context.freespins
}

module.exports = { init, copy }