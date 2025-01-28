
const EXP = {
  winType: require('../features/win_type_feature'),
  diceRoll: require('../features/dice_feature'),
  fs_diceRoll: require('../features/fs_diceRoll'),
  prizePot : require('../features/prize_pot_feature')
}

function init(client) {
 client.context.features = { total: 0, respins: 0, }
 client.getFeatures = () => client.context.features
 return EXP
}

module.exports = Object.assign({ init }, EXP)
