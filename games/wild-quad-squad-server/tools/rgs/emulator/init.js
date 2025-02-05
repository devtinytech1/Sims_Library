const game = require('../../../src/game/init')
const { maximumWinCap, currencyMultiplier, rtp, currency, configuration, stats } = require('../../../../../tools/rgs/emulator/config')
const db = require('../../../../../tools/rgs/emulator/db')

async function execute(params) {
  const { headers } = params
  const sessionId = headers['x-session-id']
  const { state, balance, country, isFun } = db.load(sessionId)
  const request = {
    body: {
      data: {},
      maximumWinCap,
      currencyMultiplier,
      regulation: {},
      config: { settingsKey: process.env.SETTINGS_KEY },
      state,
    },
    headers: { 'x-session-id': sessionId },
  }
  const { data, gameState } = await game.make()(request)
  db.save(sessionId, { state: gameState })
  return {
    balance,
    country,
    currency,
    game: data,
    isFun,
    maximumWinCap,
    configuration,
    rtp,
    stats,
  }
}

module.exports = execute
