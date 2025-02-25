function foundSymbols(matrix, symbol) {
    return matrix.reduce((acc, reel, col) => {
      reel.forEach((sym, row) => sym === symbol && acc.push([col, row]))
      return acc
    }, [])
  }

  
//find Jackpot symbol consecutively
function foundSymbolsforJ(matrix, symbol) {
  let positionsOfJ = [];
  for (let i = 0; i < matrix.length; i++) {
    let row = matrix[i];
    let positionsInRow = [];
    if (row.includes(symbol)) {
      // Iterate through the row to find positions of 'J' symbols
      for (let j = 0; j < row.length; j++) {
        if (row[j] === symbol) {
          positionsInRow.push([i, j]);
        }
      }
      positionsOfJ.push(...positionsInRow);
    } else {
      break;
    }
  }

  return positionsOfJ;
}
  
  module.exports = { foundSymbols, foundSymbolsforJ }
  