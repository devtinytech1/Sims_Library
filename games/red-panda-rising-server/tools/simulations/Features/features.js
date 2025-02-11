
const EXP = {
  collect: require('../../../../red-panda-rising-server/tools/simulations/features/collect_feature'),
  winType: require('../../../../red-panda-rising-server/tools/simulations/features/win_type_feature'),
  mode: require('../../../../red-panda-rising-server/tools/simulations/features/mode_feature'),
  randomWild: require('../../../../red-panda-rising-server/tools/simulations/features/random_wild'),
}

function init(client) {
  client.context.features = { total: 0 }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
