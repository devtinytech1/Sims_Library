const { round } = require('../utils/math')
const { init } = require('./runner')

function make() {
  return async function ({ body, headers }) {
    const sessionId = headers['x-session-id']
    const request = body.data
    const winCap = body.maximumWinCap  // Maximum win amount per round, without the currencyMultiplier applied to it
    const betMultiplier = body.currencyMultiplier || 1 // Number to which the bet levels must be multiplied before sending it to the game client
    const { state, regulation } = body

    const requestData = { sessionId, request, winCap, betMultiplier, state, regulation }
    const { data, gameState, gameRoundOver } = await init(requestData, body.config)

    data.settings.bets = data.settings.bets.map(bet => round(bet * betMultiplier))
    data.settings.betMultiplier = betMultiplier
    if (gameState.stash) {
      gameState.stash.bets = data.settings.bets.map(bet => bet)
    }

    if (body.config && body.config.info) {
      data.settings.info = body.config.info
    }

    return {
      gameState,
      data,
      gameRoundOver,
    }
  }
}

module.exports = { make }
