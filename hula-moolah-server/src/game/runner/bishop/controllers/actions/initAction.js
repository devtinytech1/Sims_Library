
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const call = require('../call')

async function initAction() {
  await call({ action: settings.keys.init },
    { settingsKey: settings.settingsKey, bets: [settings.bet], goldenBets: [settings.goldenBet] })
  context.stats.TestDate = new Date().toString()
  if (context.stats.TestDate.includes('GMT+')) {
    context.stats.TestDate = context.stats.TestDate.substring(0, context.stats.TestDate.indexOf('GMT+'))
  }
  return context.call.trigger
}

module.exports = initAction
