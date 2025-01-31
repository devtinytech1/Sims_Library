
const EXP = {
  winType: require('./win_type_feature.cjs'),
  diceRoll: require('./basegame/dice_feature.cjs'),
  fs_diceRoll: require('./freespins/fs_diceRoll.cjs'),
  prizePot: require('./basegame/prize_pot_feature.cjs')
}

function init(client) {
  client.context.features = { total: 0, respins: 0, }
  client.getFeatures = () => client.context.features
  return EXP
}

module.exports = Object.assign({ init }, EXP)
