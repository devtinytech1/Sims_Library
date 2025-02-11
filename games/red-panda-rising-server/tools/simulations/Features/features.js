
const EXP = {
  collect: require('../../../../red-panda-rising-server/tools/simulations/features/collect_feature'),
  winType: require('../../../../red-panda-rising-server/tools/simulations/features/win_type_feature'),
}

function init(client) {
  client.context.features = { total: 0 }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
