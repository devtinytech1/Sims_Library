
const EXP = {
  winType: require('../../../src/game/runner/controllers/features/win_type_feature'),
}

function init(client) {
  client.context.features = { total: 0, respins: 0, }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
