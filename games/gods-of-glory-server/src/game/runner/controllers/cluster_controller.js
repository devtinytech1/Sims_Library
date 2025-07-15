const { getAdjacentPositions } = require('./matrix_controller.js');
const settings = require('../configs/settings.js');

async function check(client) {
  const matrix = client.matrix;
  const gameSettings = settings.get(client.gameId);
  const visited = Array(gameSettings.base.rows).fill(null).map(() => Array(gameSettings.base.cols).fill(false));
  const clusters = [];
  
  // Find all clusters
  for (let row = 0; row < gameSettings.base.rows; row++) {
    for (let col = 0; col < gameSettings.base.cols; col++) {
      if (!visited[row][col] && 
          matrix[row][col] !== gameSettings.symbols.scatter && 
          matrix[row][col] !== gameSettings.symbols.multiplier) {
        const cluster = findCluster(matrix, row, col, visited, gameSettings);
        if (cluster.length >= gameSettings.base.minClusterSize) {
          clusters.push({
            symbol: matrix[row][col],
            positions: cluster,
            size: cluster.length
          });
        }
      }
    }
  }
  
  // Calculate wins
  let totalWin = 0;
  const winningSymbols = [];
  
  clusters.forEach(cluster => {
    const payout = calculateClusterPayout(cluster.symbol, cluster.size, gameSettings);
    totalWin += payout;
    winningSymbols.push(...cluster.positions);
  });
  
  // Update client context
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  client.node.context.features.cluster = {
    winningSymbols: winningSymbols,
    totalWin: totalWin,
    clusters: clusters
  };
  
  if (!client.node.context.win) {
    client.node.context.win = { total: 0, lines: [] };
  }
  
  client.node.context.win.total += totalWin;
  
  return {
    totalWin: totalWin,
    winningSymbols: winningSymbols,
    clusters: clusters
  };
}

function findCluster(matrix, startRow, startCol, visited, gameSettings) {
  const symbol = matrix[startRow][startCol];
  const cluster = [];
  const queue = [{ row: startRow, col: startCol }];
  
  while (queue.length > 0) {
    const { row, col } = queue.shift();
    
    if (visited[row][col] || matrix[row][col] !== symbol) {
      continue;
    }
    
    visited[row][col] = true;
    cluster.push({ row, col });
    
    // Add adjacent positions to queue
    const adjacentPositions = getAdjacentPositions(row, col, gameSettings.base);
    adjacentPositions.forEach(pos => {
      if (!visited[pos.row][pos.col] && matrix[pos.row][pos.col] === symbol) {
        queue.push(pos);
      }
    });
  }
  
  return cluster;
}

function calculateClusterPayout(symbol, clusterSize, gameSettings) {
  const symbolPayouts = gameSettings.payouts[symbol];
  if (!symbolPayouts) {
    return 0;
  }
  
  // Find the highest applicable payout tier
  const payoutTiers = Object.keys(symbolPayouts)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending
  
  for (const tier of payoutTiers) {
    if (clusterSize >= tier) {
      return symbolPayouts[tier];
    }
  }
  
  return 0;
}

module.exports = { check, calculateClusterPayout };