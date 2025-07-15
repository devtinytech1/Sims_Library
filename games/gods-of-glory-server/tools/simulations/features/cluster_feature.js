/**
 * Gods of Glory - Anyway Pay Feature Controller
 * 
 * Handles "anyway pay" (scatter pay) mechanics for Gods of Glory game.
 * Anyway pay means symbols pay out when 8+ matching symbols appear anywhere on the grid.
 * 
 * Anyway Pay Rules:
 * - Minimum 8 matching symbols required for win (anywhere on grid)
 * - Symbols don't need to be adjacent - can be scattered anywhere
 * - Pays in tiers: 8-9 symbols, 10-11 symbols, 12+ symbols
 * - Scatter and multiplier symbols don't participate in anyway pays
 * - Based on Gates of Olympus scatter pay mechanics
 */

const { getAdjacentPositions } = require('../../../src/game/runner/controllers/matrix_controller.js');

/**
 * Check matrix for anyway pay wins and calculate payouts
 * Main entry point for anyway pay (scatter pay) evaluation
 * 
 * @param {Object} client - Game client object
 * @param {Array} matrix - 6x5 game matrix to analyze
 * @param {Object} settings - Game configuration settings
 * @return {Object} Anyway pay analysis results with wins and positions
 */
async function checkMatrixForAnywayPayWinsAndCalculatePayouts(client, matrix, settings) {
  // Count all symbols anywhere on the grid (no adjacency required)
  const symbolCounts = countAllSymbolsAnywhereOnGrid(matrix, settings);
  
  // Find all qualifying anyway pays (8+ symbols)
  const allAnywayPaysFound = findAllQualifyingAnywayPaysFromCounts(matrix, symbolCounts, settings);
  
  // Calculate total payouts from all anyway pays
  const anywayPayResults = calculateTotalPayoutsFromAllAnywayPays(allAnywayPaysFound, settings);
  
  // Update client context with anyway pay information
  updateClientContextWithAnywayPayData(client, allAnywayPaysFound, anywayPayResults);
  
  return createAnywayPayAnalysisResults(anywayPayResults, allAnywayPaysFound);
}

/**
 * Count all symbols anywhere on the grid
 * Counts occurrences of each symbol across the entire matrix (no adjacency required)
 * 
 * @param {Array} matrix - Game matrix to analyze
 * @param {Object} settings - Game configuration
 * @return {Object} Object with symbol counts and positions
 */
function countAllSymbolsAnywhereOnGrid(matrix, settings) {
  const symbolCounts = {};
  const symbolPositions = {};
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const symbol = matrix[row][col];
      
      // Skip special symbols that don't participate in anyway pays
      if (isSpecialNonAnywayPaySymbol(symbol, settings)) {
        continue;
      }
      
      // Initialize symbol tracking
      if (!symbolCounts[symbol]) {
        symbolCounts[symbol] = 0;
        symbolPositions[symbol] = [];
      }
      
      // Count symbol and track position
      symbolCounts[symbol]++;
      symbolPositions[symbol].push({ row, col });
    }
  }
  
  return { counts: symbolCounts, positions: symbolPositions };
}

/**
 * Find all qualifying anyway pays from symbol counts
 * Identifies symbols with 8+ occurrences anywhere on grid
 * 
 * @param {Array} matrix - Game matrix
 * @param {Object} symbolData - Symbol counts and positions
 * @param {Object} settings - Game configuration
 * @return {Array} Array of qualifying anyway pays
 */
function findAllQualifyingAnywayPaysFromCounts(matrix, symbolData, settings) {
  const qualifyingAnywayPays = [];
  
  for (const [symbol, count] of Object.entries(symbolData.counts)) {
    if (count >= settings.base.minAnywayPaySize || count >= 8) { // Default to 8 if not configured
      const anywayPayData = createAnywayPayDataObject(
        symbol, 
        count, 
        symbolData.positions[symbol]
      );
      qualifyingAnywayPays.push(anywayPayData);
    }
  }
  
  return qualifyingAnywayPays;
}

/**
 * Check if position should be evaluated for cluster formation
 * Determines if a position is eligible for cluster evaluation
 * 
 * @param {Array} matrix - Game matrix
 * @param {Array} visitedTracker - Visited position tracker
 * @param {number} row - Row position to check
 * @param {number} col - Column position to check
 * @param {Object} settings - Game configuration
 * @return {boolean} True if position should be checked for clusters
 */
function shouldCheckPositionForCluster(matrix, visitedTracker, row, col, settings) {
  return !visitedTracker[row][col] && 
         !isSpecialNonClusterSymbol(matrix[row][col], settings);
}

/**
 * Check if symbol is special and doesn't participate in anyway pays
 * Identifies symbols that don't form anyway pays
 * 
 * @param {string} symbol - Symbol to check
 * @param {Object} settings - Game configuration
 * @return {boolean} True if symbol doesn't participate in anyway pays
 */
function isSpecialNonAnywayPaySymbol(symbol, settings) {
  return symbol === settings.symbols.scatter || 
         symbol === settings.symbols.multiplier;
}

/**
 * Create anyway pay data object
 * Builds comprehensive anyway pay information object
 * 
 * @param {string} symbol - Symbol forming the anyway pay
 * @param {number} count - Number of symbols found
 * @param {Array} positions - Array of positions for this symbol
 * @return {Object} Anyway pay data object
 */
function createAnywayPayDataObject(symbol, count, positions) {
  return {
    symbol: symbol,
    count: count,
    positions: positions,
    payTier: determinePayTierFromCount(count),
    timestamp: Date.now()
  };
}

/**
 * Determine pay tier from symbol count
 * Gates of Olympus style pay tiers: 8-9, 10-11, 12+
 * 
 * @param {number} count - Number of symbols
 * @return {string} Pay tier identifier
 */
function determinePayTierFromCount(count) {
  if (count >= 12) return '12+';
  if (count >= 10) return '10-11';
  if (count >= 8) return '8-9';
  return 'none';
}

/**
 * Find adjacent symbol cluster from starting position
 * Uses breadth-first search to find all connected matching symbols
 * 
 * @param {Array} matrix - Game matrix
 * @param {number} startRow - Starting row position
 * @param {number} startCol - Starting column position
 * @param {Array} visitedTracker - Visited position tracker
 * @param {Object} settings - Game configuration
 * @return {Array} Array of positions forming the cluster
 */
function findAdjacentSymbolClusterFromPosition(matrix, startRow, startCol, visitedTracker, settings) {
  const targetSymbol = matrix[startRow][startCol];
  const clusterPositions = [];
  const positionsToProcess = [{ row: startRow, col: startCol }];
  
  while (positionsToProcess.length > 0) {
    const currentPosition = positionsToProcess.shift();
    const { row, col } = currentPosition;
    
    if (shouldSkipPositionInClusterSearch(visitedTracker, matrix, row, col, targetSymbol)) {
      continue;
    }
    
    // Mark position as processed and add to cluster
    visitedTracker[row][col] = true;
    clusterPositions.push({ row, col });
    
    // Add adjacent matching positions to processing queue
    const adjacentMatchingPositions = findAdjacentMatchingPositions(matrix, row, col, targetSymbol, visitedTracker, settings);
    positionsToProcess.push(...adjacentMatchingPositions);
  }
  
  return clusterPositions;
}

/**
 * Check if position should be skipped in cluster search
 * Determines if position is already processed or doesn't match target
 * 
 * @param {Array} visitedTracker - Visited position tracker
 * @param {Array} matrix - Game matrix
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @param {string} targetSymbol - Symbol we're clustering
 * @return {boolean} True if position should be skipped
 */
function shouldSkipPositionInClusterSearch(visitedTracker, matrix, row, col, targetSymbol) {
  return visitedTracker[row][col] || matrix[row][col] !== targetSymbol;
}

/**
 * Find adjacent matching positions for cluster expansion
 * Gets positions adjacent to current position that match target symbol
 * 
 * @param {Array} matrix - Game matrix
 * @param {number} row - Current row position
 * @param {number} col - Current column position
 * @param {string} targetSymbol - Symbol we're clustering
 * @param {Array} visitedTracker - Visited position tracker
 * @param {Object} settings - Game configuration
 * @return {Array} Array of adjacent positions with matching symbols
 */
function findAdjacentMatchingPositions(matrix, row, col, targetSymbol, visitedTracker, settings) {
  const allAdjacentPositions = getAdjacentPositions(row, col, settings.base);
  
  return allAdjacentPositions.filter(position => {
    return !visitedTracker[position.row][position.col] && 
           matrix[position.row][position.col] === targetSymbol;
  });
}

/**
 * Check if cluster meets minimum size requirement
 * Validates cluster size against minimum required for wins
 * 
 * @param {Array} cluster - Array of cluster positions
 * @param {number} minimumSize - Minimum cluster size required
 * @return {boolean} True if cluster meets minimum size requirement
 */
function doesClusterMeetMinimumSizeRequirement(cluster, minimumSize) {
  return cluster.length >= minimumSize;
}

/**
 * Create cluster data object
 * Builds comprehensive cluster information object
 * 
 * @param {string} symbol - Symbol forming the cluster
 * @param {Array} positions - Array of positions in cluster
 * @return {Object} Cluster data object with symbol, positions, and size
 */
function createClusterDataObject(symbol, positions) {
  return {
    symbol: symbol,
    positions: positions,
    size: positions.length,
    timestamp: Date.now()
  };
}

/**
 * Calculate total payouts from all anyway pays
 * Processes all found anyway pays and calculates combined payouts
 * 
 * @param {Array} anywayPays - Array of all anyway pays found
 * @param {Object} settings - Game configuration with payout tables
 * @return {Object} Payout calculation results
 */
function calculateTotalPayoutsFromAllAnywayPays(anywayPays, settings) {
  let totalWinAmount = 0;
  const allWinningPositions = [];
  const payoutBreakdown = [];
  
  anywayPays.forEach(anywayPay => {
    const anywayPayPayout = calculateIndividualAnywayPayPayout(anywayPay.symbol, anywayPay.count, settings);
    totalWinAmount += anywayPayPayout;
    allWinningPositions.push(...anywayPay.positions);
    
    if (anywayPayPayout > 0) {
      payoutBreakdown.push({
        symbol: anywayPay.symbol,
        symbolCount: anywayPay.count,
        payTier: anywayPay.payTier,
        positions: anywayPay.positions,
        payout: anywayPayPayout
      });
    }
  });
  
  return {
    totalWin: totalWinAmount,
    winningPositions: allWinningPositions,
    payoutBreakdown: payoutBreakdown,
    anywayPayCount: anywayPays.length
  };
}

/**
 * Calculate payout for individual anyway pay
 * Determines payout amount based on symbol and count using Gates of Olympus tier structure
 * 
 * @param {string} symbol - Symbol in the anyway pay
 * @param {number} symbolCount - Number of symbols found anywhere on grid
 * @param {Object} settings - Game configuration with payout tables
 * @return {number} Payout amount for this anyway pay
 */
function calculateIndividualAnywayPayPayout(symbol, symbolCount, settings) {
  const symbolPayoutTable = settings.payouts[symbol];
  
  if (!symbolPayoutTable) {
    return 0; // Symbol has no payouts defined
  }
  
  // Determine pay tier based on Gates of Olympus structure
  const payTier = determinePayTierFromCount(symbolCount);
  const tierPayout = getPayoutForTier(symbolPayoutTable, payTier);
  
  return tierPayout || 0;
}

/**
 * Get payout for specific tier from symbol payout table
 * Maps Gates of Olympus tier structure to configured payouts
 * 
 * @param {Object} symbolPayoutTable - Payout table for specific symbol
 * @param {string} tier - Pay tier ('8-9', '10-11', '12+')
 * @return {number} Payout amount for tier
 */
function getPayoutForTier(symbolPayoutTable, tier) {
  // Map tier to payout table structure
  switch (tier) {
    case '8-9':
      return symbolPayoutTable['8-9'] || symbolPayoutTable[8] || symbolPayoutTable[9] || 0;
    case '10-11':
      return symbolPayoutTable['10-11'] || symbolPayoutTable[10] || symbolPayoutTable[11] || 0;
    case '12+':
      return symbolPayoutTable['12+'] || symbolPayoutTable[12] || symbolPayoutTable[15] || symbolPayoutTable[20] || 0;
    default:
      return 0;
  }
}

/**
 * Find highest applicable payout tier for cluster size
 * Determines which payout tier applies to the given cluster size
 * 
 * @param {Object} symbolPayoutTable - Payout table for specific symbol
 * @param {number} clusterSize - Size of cluster to evaluate
 * @return {number|null} Highest applicable payout tier or null if none
 */
function findHighestApplicablePayoutTierForClusterSize(symbolPayoutTable, clusterSize) {
  const availablePayoutTiers = Object.keys(symbolPayoutTable)
    .map(Number)
    .sort((a, b) => b - a); // Sort in descending order for highest first
  
  for (const payoutTier of availablePayoutTiers) {
    if (clusterSize >= payoutTier) {
      return payoutTier;
    }
  }
  
  return null; // No applicable payout tier found
}

/**
 * Update client context with cluster data
 * Records cluster information in client for tracking and debugging
 * 
 * @param {Object} client - Game client object
 * @param {Array} clusters - All clusters found
 * @param {Object} payoutResults - Payout calculation results
 */
function updateClientContextWithClusterData(client, clusters, payoutResults) {
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  client.node.context.features.cluster = {
    hasWins: payoutResults.totalWin > 0,
    clusters: clusters,
    totalWin: payoutResults.totalWin,
    winningPositions: payoutResults.winningPositions,
    clusterCount: clusters.length,
    payoutBreakdown: payoutResults.payoutBreakdown,
    timestamp: Date.now()
  };
}

/**
 * Create cluster analysis results object
 * Builds final results object for cluster pay evaluation
 * 
 * @param {Object} payoutResults - Calculated payout information
 * @param {Array} clusters - All clusters found in matrix
 * @return {Object} Comprehensive cluster analysis results
 */
function createClusterAnalysisResults(payoutResults, clusters) {
  return {
    totalWin: payoutResults.totalWin,
    winningSymbols: payoutResults.winningPositions,
    clusters: clusters,
    hasWins: payoutResults.totalWin > 0,
    clusterCount: clusters.length,
    payoutBreakdown: payoutResults.payoutBreakdown
  };
}

/**
 * Calculate cluster feature frequency statistics
 * Provides analytics on cluster feature occurrence rates
 * 
 * @param {number} totalSpins - Total spins in simulation
 * @param {number} clusterWins - Number of spins with cluster wins
 * @param {Array} allClusterSizes - All cluster sizes encountered
 * @return {Object} Cluster frequency statistics
 */
function calculateClusterFeatureFrequencyStats(totalSpins, clusterWins, allClusterSizes) {
  if (totalSpins === 0) {
    return createEmptyClusterFrequencyStats();
  }
  
  const hitRate = (clusterWins / totalSpins) * 100;
  const averageSpinsBetween = clusterWins > 0 ? totalSpins / clusterWins : 0;
  const averageClusterSize = allClusterSizes.length > 0 ? 
    allClusterSizes.reduce((sum, size) => sum + size, 0) / allClusterSizes.length : 0;
  
  return {
    clusterWinFrequency: clusterWins,
    hitRate: hitRate,
    averageSpinsBetweenWins: averageSpinsBetween,
    oneInXChance: clusterWins > 0 ? Math.round(totalSpins / clusterWins) : 0,
    averageClusterSize: averageClusterSize,
    maxClusterSize: allClusterSizes.length > 0 ? Math.max(...allClusterSizes) : 0,
    minClusterSize: allClusterSizes.length > 0 ? Math.min(...allClusterSizes) : 0,
    totalClusters: allClusterSizes.length
  };
}

/**
 * Create empty cluster frequency statistics
 * Returns default statistics when no data available
 * 
 * @return {Object} Empty cluster frequency statistics
 */
function createEmptyClusterFrequencyStats() {
  return {
    clusterWinFrequency: 0,
    hitRate: 0,
    averageSpinsBetweenWins: 0,
    oneInXChance: 0,
    averageClusterSize: 0,
    maxClusterSize: 0,
    minClusterSize: 0,
    totalClusters: 0
  };
}

/**
 * Update client context with anyway pay data
 * Records anyway pay information in client for tracking and debugging
 * 
 * @param {Object} client - Game client object
 * @param {Array} anywayPays - All anyway pays found
 * @param {Object} payoutResults - Payout calculation results
 */
function updateClientContextWithAnywayPayData(client, anywayPays, payoutResults) {
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  client.node.context.features.anywayPay = {
    hasWins: payoutResults.totalWin > 0,
    anywayPays: anywayPays,
    totalWin: payoutResults.totalWin,
    winningPositions: payoutResults.winningPositions,
    anywayPayCount: anywayPays.length,
    payoutBreakdown: payoutResults.payoutBreakdown,
    timestamp: Date.now()
  };
  
  // Keep legacy cluster context for backward compatibility
  client.node.context.features.cluster = client.node.context.features.anywayPay;
}

/**
 * Create anyway pay analysis results object
 * Builds final results object for anyway pay evaluation
 * 
 * @param {Object} payoutResults - Calculated payout information
 * @param {Array} anywayPays - All anyway pays found in matrix
 * @return {Object} Comprehensive anyway pay analysis results
 */
function createAnywayPayAnalysisResults(payoutResults, anywayPays) {
  return {
    totalWin: payoutResults.totalWin,
    winningSymbols: payoutResults.winningPositions,
    anywayPays: anywayPays,
    hasWins: payoutResults.totalWin > 0,
    anywayPayCount: anywayPays.length,
    payoutBreakdown: payoutResults.payoutBreakdown,
    // Legacy cluster properties for backward compatibility
    clusters: anywayPays,
    clusterCount: anywayPays.length
  };
}

/**
 * Calculate anyway pay feature frequency statistics
 * Provides analytics on anyway pay feature occurrence rates
 * 
 * @param {number} totalSpins - Total spins in simulation
 * @param {number} anywayPayWins - Number of spins with anyway pay wins
 * @param {Array} allSymbolCounts - All symbol counts encountered
 * @return {Object} Anyway pay frequency statistics
 */
function calculateAnywayPayFeatureFrequencyStats(totalSpins, anywayPayWins, allSymbolCounts) {
  if (totalSpins === 0) {
    return createEmptyAnywayPayFrequencyStats();
  }
  
  const hitRate = (anywayPayWins / totalSpins) * 100;
  const averageSpinsBetween = anywayPayWins > 0 ? totalSpins / anywayPayWins : 0;
  const averageSymbolCount = allSymbolCounts.length > 0 ? 
    allSymbolCounts.reduce((sum, count) => sum + count, 0) / allSymbolCounts.length : 0;
  
  return {
    anywayPayWinFrequency: anywayPayWins,
    hitRate: hitRate,
    averageSpinsBetweenWins: averageSpinsBetween,
    oneInXChance: anywayPayWins > 0 ? Math.round(totalSpins / anywayPayWins) : 0,
    averageSymbolCount: averageSymbolCount,
    maxSymbolCount: allSymbolCounts.length > 0 ? Math.max(...allSymbolCounts) : 0,
    minSymbolCount: allSymbolCounts.length > 0 ? Math.min(...allSymbolCounts) : 0,
    totalAnywayPays: allSymbolCounts.length
  };
}

/**
 * Create empty anyway pay frequency statistics
 * Returns default statistics when no data available
 * 
 * @return {Object} Empty anyway pay frequency statistics
 */
function createEmptyAnywayPayFrequencyStats() {
  return {
    anywayPayWinFrequency: 0,
    hitRate: 0,
    averageSpinsBetweenWins: 0,
    oneInXChance: 0,
    averageSymbolCount: 0,
    maxSymbolCount: 0,
    minSymbolCount: 0,
    totalAnywayPays: 0
  };
}

/**
 * Analyze anyway pay distribution patterns
 * Provides detailed analysis of how anyway pays are distributed across the matrix
 * 
 * @param {Array} anywayPays - All anyway pays found
 * @param {Object} matrixDimensions - Matrix size information
 * @return {Object} Anyway pay distribution analysis
 */
function analyzeAnywayPayDistributionPatterns(anywayPays, matrixDimensions) {
  const distribution = {
    byRow: Array(matrixDimensions.rows).fill(0),
    byCol: Array(matrixDimensions.cols).fill(0),
    bySymbol: {},
    countDistribution: {},
    tierDistribution: {}
  };
  
  anywayPays.forEach(anywayPay => {
    // Count symbol positions by row and column
    anywayPay.positions.forEach(pos => {
      distribution.byRow[pos.row]++;
      distribution.byCol[pos.col]++;
    });
    
    // Count anyway pays by symbol
    distribution.bySymbol[anywayPay.symbol] = (distribution.bySymbol[anywayPay.symbol] || 0) + 1;
    
    // Count anyway pays by symbol count
    distribution.countDistribution[anywayPay.count] = (distribution.countDistribution[anywayPay.count] || 0) + 1;
    
    // Count anyway pays by tier
    distribution.tierDistribution[anywayPay.payTier] = (distribution.tierDistribution[anywayPay.payTier] || 0) + 1;
  });
  
  return distribution;
}

module.exports = {
  checkMatrixForAnywayPayWinsAndCalculatePayouts,
  calculateIndividualAnywayPayPayout,
  calculateAnywayPayFeatureFrequencyStats,
  analyzeAnywayPayDistributionPatterns,
  // Legacy function names for compatibility
  check: checkMatrixForAnywayPayWinsAndCalculatePayouts,
  calculateClusterPayout: calculateIndividualAnywayPayPayout,
  // Keep old cluster names for backward compatibility
  checkMatrixForClusterWinsAndCalculatePayouts: checkMatrixForAnywayPayWinsAndCalculatePayouts,
  calculateIndividualClusterPayout: calculateIndividualAnywayPayPayout
};