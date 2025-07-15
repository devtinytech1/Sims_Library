const settings = require('../configs/settings.js');
const sequences = require('../configs/sequences.js');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function make(client, sequenceType = 'basegame', rows = 6) {
  const gameSettings = settings.get(client.gameId);
  const reelSequences = sequences.get(sequenceType);
  const matrix = [];
  
  // Create matrix based on grid size
  for (let row = 0; row < rows; row++) {
    matrix[row] = [];
    for (let col = 0; col < gameSettings.base.cols; col++) {
      const reelKey = `reel${col + 1}`;
      const reel = reelSequences[reelKey] || reelSequences.reel1;
      const randomIndex = getRandomInt(0, reel.length - 1);
      matrix[row][col] = reel[randomIndex];
    }
  }
  
  return matrix;
}

function getSymbolsInMatrix(matrix) {
  const symbols = [];
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      symbols.push({
        symbol: matrix[row][col],
        position: { row, col }
      });
    }
  }
  return symbols;
}

function removeSymbolsFromMatrix(matrix, positions) {
  const newMatrix = matrix.map(row => [...row]);
  
  // Remove symbols by setting them to null
  positions.forEach(pos => {
    newMatrix[pos.row][pos.col] = null;
  });
  
  return newMatrix;
}

function dropSymbolsDown(matrix, gameSettings) {
  const newMatrix = matrix.map(row => [...row]);
  const reelSequences = sequences.get('basegame');
  
  for (let col = 0; col < gameSettings.base.cols; col++) {
    // Collect non-null symbols from bottom to top
    const nonNullSymbols = [];
    for (let row = gameSettings.base.rows - 1; row >= 0; row--) {
      if (newMatrix[row][col] !== null) {
        nonNullSymbols.push(newMatrix[row][col]);
      }
    }
    
    // Fill column from bottom up
    for (let row = gameSettings.base.rows - 1; row >= 0; row--) {
      if (nonNullSymbols.length > 0) {
        newMatrix[row][col] = nonNullSymbols.shift();
      } else {
        // Generate new symbol for empty spaces
        const reelKey = `reel${col + 1}`;
        const reel = reelSequences[reelKey] || reelSequences.reel1;
        const randomIndex = getRandomInt(0, reel.length - 1);
        newMatrix[row][col] = reel[randomIndex];
      }
    }
  }
  
  return newMatrix;
}

function getAdjacentPositions(row, col, gridSize) {
  const positions = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1] // Up, Down, Left, Right
  ];
  
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < gridSize.rows && newCol >= 0 && newCol < gridSize.cols) {
      positions.push({ row: newRow, col: newCol });
    }
  });
  
  return positions;
}

module.exports = {
  make,
  getSymbolsInMatrix,
  removeSymbolsFromMatrix,
  dropSymbolsDown,
  getAdjacentPositions
};