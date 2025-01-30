
let lastResponse = {}

const { init, play } = require('../../../../src/game/runner/index')
const context = require('../models/context')

function getRequestData(request) {
context.bishopID = '' + Date.now() + '_' + (Math.floor(Math.random() * 10000))
  return {
    sessionId: context.bishopID,
    request,
    state: lastResponse,
    winCap: 1000000000,
    betMultiplier: 1,
  }
}

const call = async function (body, initData) {
  const res = initData ?
    await init(getRequestData(body), initData) :
    await play(getRequestData(body))
  const { data, totalBet, gameState, gameRoundOver, totalWin, roundRestore } = res
  lastResponse = gameState
  context.call = Object.assign(gameState, { totalBet })
  return { data, gameState, totalBet, gameRoundOver, totalWin, roundRestore }
}

module.exports = call
