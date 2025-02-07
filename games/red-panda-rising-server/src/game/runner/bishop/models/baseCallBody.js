
const context = require('../models/context')
const settings = require('../../../../../../../src/game/runner/bishop/settings/bishopSettings.cjs')

const baseCallBody = index => {
  if (!context.nextTrigger) {
    // eslint-disable-next-line no-console
    return console.error('undefined nextTrigger')
  }
  const body = {
    action: context.nextTrigger,
    params: {
      bet: settings.bet,
      goldenBet: settings.goldenBet,
    },
  }
  if (index != null) {
    Object.assign(body.params, { index })
  }
  return body
}
module.exports = baseCallBody
