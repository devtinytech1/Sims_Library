
const { getNode } = require('../../controllers/node_controller')
const { getClient } = require('../../../../../../../src/models/client.cjs')
const context = require('../models/context')

let lastResponse = {}

module.exports = async function (body, init) {
  const client = await getClient({
    sessionId: context.bishopID,
    request: body,
    state: lastResponse,
    winCap: 1000000000,
    betMultiplier: 1,
  }, init)
  const res = await getNode(client)
  const { data, totalBet, gameRoundOver, totalWin, roundRestore } = res
  lastResponse = data.stash
  context.call = Object.assign(data.stash, { totalBet })
  return { data, gameState: lastResponse, totalBet, gameRoundOver, totalWin, roundRestore }
}
