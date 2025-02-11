
const EXP = {
  collect: require('../../../../red-panda-rising-server/src/game/runner/controllers/features/collect_feature'),
  winType: require('../../../../red-panda-rising-server/src/game/runner/controllers/features/win_type_feature'),
  mode: require('../../../../red-panda-rising-server/src/game/runner/controllers/features/mode_feature'),
  randomWild: require('../../../../red-panda-rising-server/src/game/runner/controllers/features/random_wild'),
}

function init(client) {
  client.context.features = { total: 0 }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
