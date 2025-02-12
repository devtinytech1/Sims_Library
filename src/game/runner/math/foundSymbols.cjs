function foundSymbols(matrix, symbol) {
    return matrix.reduce((acc, reel, col) => {
      reel.forEach((sym, row) => sym === symbol && acc.push([col, row]))
      return acc
    }, [])
  }
  
  module.exports = { foundSymbols }
  