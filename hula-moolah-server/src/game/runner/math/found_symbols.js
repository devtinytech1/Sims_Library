
const baseSettings = require('../configs/settings.js')

function foundSymbols(client,matrix, symbolKey) {
  const result = []
  for (let row = 0; row < baseSettings.base.rows; row++) {
    for (let col = 0; col < baseSettings.base.cols; col++) {
      if (matrix[col][row] === symbolKey) {
        result.push([col, row])
      }
    }
  }
  return result
}

module.exports = { foundSymbols }
