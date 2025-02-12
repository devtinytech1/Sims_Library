
const context = require('../models/context')
const settings = require('../settings/bishopSettings')

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
