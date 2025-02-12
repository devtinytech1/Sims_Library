
const baseSettings = require('../configs/settings.js')

function foundSymbols(matrix, symbolKey) {
  const result = []
  for (let col = 0; col < baseSettings.base.cols; col++) {
    let scatterSymbolCheck = doesSymbolExist(matrix,  symbolKey[0], col)

    let wildSymbolCheck = doesSymbolExist(matrix, symbolKey[1], col)
    
    if (scatterSymbolCheck[0]) {
      result.push(scatterSymbolCheck[1])
    } 
     else if (wildSymbolCheck[0]) {
      result.push(wildSymbolCheck[1])
    }  
    
    else {
      break;
    }
  }
  return result
}

/**
 * determine whether a given item or set of items includes a scatter or wild symbol
 */
function doesSymbolExist(matrix, symbolKey, col) {
  let isExist = false
  let pos = []
  for (let row = 0; row < baseSettings.base.rows; row++) {
    if (matrix[col][row] === symbolKey) {  // check for S or W symbol in matrix
      pos = [col, row]
      isExist = true
      break   // break as soon as S or W found in a reel
    }
  }
  return [isExist, pos]
}


module.exports = { foundSymbols,doesSymbolExist }
