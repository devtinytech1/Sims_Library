
const EXP = {
  collect: require('../features/collect_feature'),
  winType: require('../features/win_type_feature'),
  mode: require('../features/mode_feature'),
  bonusBoard: require('../features/bonus_board'),
  randomWild: require('../features/random_wild'),
  wheel: require('../features/wheel_feature'),
}

function init(client) {
  client.context.features = { total: 0 }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
