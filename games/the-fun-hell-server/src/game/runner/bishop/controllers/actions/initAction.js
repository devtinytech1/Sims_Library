
const { TRIGGER } = require('../../../configs/static')
const context = require('../../models/context')
const settings = require('../../settings/bishopSettings')
const call = require('../call')

async function initAction() {
  await call({ action: TRIGGER.INIT },
    { settingsKey: settings.settingsKey, bets: [settings.bet], goldenBets: [settings.goldenBet] })
  const mainStats = context.getMainStats()
  mainStats.TestDate = new Date().toString()
  if (mainStats.TestDate.includes('GMT+')) {
    mainStats.TestDate = mainStats.TestDate.substring(0, mainStats.TestDate.indexOf('GMT+'))
  }
}

module.exports = initAction
