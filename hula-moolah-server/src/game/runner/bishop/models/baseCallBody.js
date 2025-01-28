
const settings = require('../settings/bishopSettings')

const baseCallBody = (action, ix) => {
  const body = {
    action,
    params: {
      bet: settings.bet,
      goldenBet: settings.goldenBet,
    },
  }
  if (ix != null) {
    Object.assign(body.params, { index: ix })
  }
  return body
}
module.exports = baseCallBody
