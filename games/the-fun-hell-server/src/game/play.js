
const { play } = require('./runner')

function make() {
  return async function ({ body, headers }) {
    const sessionId = headers['x-session-id']
    const request = body.data
    const winCap = body.maximumWinCap  // Maximum win amount per round, without the currencyMultiplier applied to it
    const betMultiplier = body.currencyMultiplier // Number to which the bet levels must be multiplied before sending it to the game client
    const { state, roundStart } = body

    const requestData = { sessionId, request, winCap, betMultiplier, state, roundStart }
    const { data, gameState, totalBet, gameRoundOver, totalWin } = await play(requestData)



    return {
      gameState,
      data,
      platformPromoAllowed: false,
      totalBet,
      gameRoundOver,
      totalWin,
    }
  }
}

module.exports = { make }
