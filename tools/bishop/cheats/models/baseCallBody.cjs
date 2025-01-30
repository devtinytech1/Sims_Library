
const settings = require('../../../../src/game/runner/bishop/settings/bishopSettings.cjs')

const baseCallBody = (action, index) => {
  if (!action) {
    // eslint-disable-next-line no-console
    return console.error('empty action')
  }
  const body = {
    action,
    params: {
      bet: 1, // settings.bet,
      goldenBet: settings.goldenBet || 1,
    },
  }
  if (index != null) {
    Object.assign(body.params, { index })
    Object.assign(body, { index })
  }
  return body
}
module.exports = baseCallBody
