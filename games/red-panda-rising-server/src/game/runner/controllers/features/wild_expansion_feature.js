const { getRandomItemByArrayWeights } = require('../../math/random_controller')
const { doesSymbolExist } = require('../../math/found_symbols')

async function wildFeatureCheck(client, matrix, settings) {
  const sym = settings.wild.symbol

  // detect nudged wild check here
  let storeNudgeWildPos = []
  for (let col = 1; col <= 3; col++) {
    for (let row = 0; row < 3; row++) {
      if (matrix[col][row] === sym) {
        if (await detectNudgedWild(client, settings, col)) {
          storeNudgeWildPos.push([col, row])
          break;
        }
      }
    }
  }
  return storeNudgeWildPos;
}

async function detectNudgedWild(client, settings, reel_id) {
  let isExist = await getRandomItemByArrayWeights(client, settings.wild[`WILD_number_weights_reel_${reel_id}`],
    settings.wild[`WILD_number_value_reel_${reel_id}`])
  return isExist;
}

// This function will check if there is any new wild symbol in reel except already expanded wild reel
function isWildSymbolOnMatrix(client, settings) {
  let matrix = client.matrix
  let sym = settings.wild.symbol
  let wildPos = []
  for (let col = 1; col <= 3; col++) {
    if (!hasExistingWildReel(client, col)) {
      let wildSymbolExist = doesSymbolExist(matrix, sym, col)
      if (wildSymbolExist[0]) {
        wildPos.push(wildSymbolExist[1])
      }
    }
  }

  if (wildPos.length > 0) {
    client.getFeatures().expandingWildPosition=wildPos
    client.getFreespins().expandingWildPos = (client.getFreespins().expandingWildPos).concat(wildPos)
  }
}

/** The function performs a check to identify if a wild symbol is present,
 *  and upon finding one, it immediately returns a value of true
 * */
function hasExistingWildReel(client, reelId) {
  let wildPos = client.getFreespins().expandingWildPos;
  for (let index = 0; index < wildPos.length; index++) {
    if (wildPos[index][0] === reelId) {
      return true
    }
  }
  return false
}


module.exports = { wildFeatureCheck, isWildSymbolOnMatrix }
