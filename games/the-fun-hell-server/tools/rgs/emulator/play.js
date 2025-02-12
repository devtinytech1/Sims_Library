const game = require('../../../src/game/play')
const { maximumWinCap, currencyMultiplier, rtp, configuration } = require('./config')
const db = require('./db')

async function execute(params) {
  const { body, headers } = params
  const sessionId = headers['x-session-id']
  const { state, country, currency, isFun } = db.load(sessionId)
  const request = {
    body: {
      data: body,
      maximumWinCap,
      currencyMultiplier,
      regulation: {},
      state,
    },
    headers: { 'x-session-id': sessionId },
  }
  const { gameState, data, totalBet, gameRoundOver, totalWin } = await game.make()(request)
  const { balance } = db.save(sessionId, { state: gameState, params: { gameRoundOver, totalBet, totalWin } })
  return {
    balance,
    country,
    currency,
    game: data,
    isFun,
    maximumWinCap,
    configuration,
    rtp,
  }
}
module.exports = execute
