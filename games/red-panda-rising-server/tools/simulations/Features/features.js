
const EXP = {
  collect: require('../../../../src/game/runner/controllers/features/collect_feature'),
  winType: require('../../../../src/game/runner/controllers/features/win_type_feature'),
  mode: require('../../../../src/game/runner/controllers/features/mode_feature'),
  bonusBoard: require('../../../../src/game/runner/controllers/features/bonus_board'),
  randomWild: require('../../../../src/game/runner/controllers/features/random_wild'),
}

function init(client) {
  client.context.features = { total: 0 }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
