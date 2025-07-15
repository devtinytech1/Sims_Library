/**
 * Gods of Glory - Anyway Pay Controller
 * 
 * Handles "anyway pay" (scatter pay) mechanics where symbols pay when 8+ matching 
 * symbols appear ANYWHERE on the grid (no adjacency required).
 * 
 * This is different from cluster pay which requires adjacent symbols.
 * Based on Gates of Olympus scatter pay mechanics.
 */

const settings = require('../configs/settings.js');

/**
 * Main entry point to check matrix for anyway pay wins
 * Counts all symbols anywhere on the grid and calculates payouts
 * 
 * @param {Object} client - Game client object with matrix and context
 * @returns {Object} Anyway pay results with wins and positions
 */
async function check(client) {
  // Get the current game matrix (6x5 grid)
  const matrix = client.matrix;
  const gameSettings = settings.get(client.gameId);
  
  // Count all symbols anywhere on the grid (no adjacency needed)
  const symbolCounts = countAllSymbolsOnGrid(matrix, gameSettings);
  
  // Find symbols that qualify for anyway pay (8+ symbols)
  const anywayPays = findQualifyingAnywayPays(symbolCounts, gameSettings);
  
  // Calculate total wins from all anyway pays
  const { totalWin, winningPositions, payoutDetails } = calculateAnywayPayWins(anywayPays, gameSettings);
  
  // Update client context with anyway pay results
  updateClientContextWithResults(client, totalWin, winningPositions, anywayPays, payoutDetails);
  
  // Return results for further processing
  return {
    totalWin: totalWin,
    winningSymbols: winningPositions,
    anywayPays: anywayPays,
    // Keep clusters for backward compatibility
    clusters: anywayPays
  };
}

/**
 * Count all symbols anywhere on the 6x5 grid
 * This is the core difference from cluster pay - we don't care about adjacency
 * 
 * @param {Array} matrix - 6x5 game matrix
 * @param {Object} gameSettings - Game configuration
 * @returns {Object} Symbol counts and their positions
 */
function countAllSymbolsOnGrid(matrix, gameSettings) {
  const symbolCounts = {};
  const symbolPositions = {};
  
  // Loop through every position on the 6x5 grid
  for (let row = 0; row < gameSettings.base.rows; row++) {
    for (let col = 0; col < gameSettings.base.cols; col++) {
      const symbol = matrix[row][col];
      
      // Skip special symbols that don't participate in anyway pays
      if (isSpecialSymbol(symbol, gameSettings)) {
        continue;
      }
      
      // Initialize tracking for this symbol if first occurrence
      if (!symbolCounts[symbol]) {
        symbolCounts[symbol] = 0;
        symbolPositions[symbol] = [];
      }
      
      // Count the symbol and remember its position
      symbolCounts[symbol]++;
      symbolPositions[symbol].push({ row, col });
    }
  }
  
  return { counts: symbolCounts, positions: symbolPositions };
}

/**
 * Check if symbol is special (scatter/multiplier) and doesn't participate in anyway pays
 * 
 * @param {string} symbol - Symbol to check
 * @param {Object} gameSettings - Game configuration
 * @returns {boolean} True if symbol is special
 */
function isSpecialSymbol(symbol, gameSettings) {
  return symbol === gameSettings.symbols.scatter || 
         symbol === gameSettings.symbols.multiplier;
}

/**
 * Find symbols that qualify for anyway pay (8+ symbols anywhere on grid)
 * 
 * @param {Object} symbolData - Symbol counts and positions
 * @param {Object} gameSettings - Game configuration
 * @returns {Array} Array of qualifying anyway pays
 */
function findQualifyingAnywayPays(symbolData, gameSettings) {
  const qualifyingPays = [];
  
  // Check each symbol to see if it has enough occurrences for anyway pay
  for (const [symbol, count] of Object.entries(symbolData.counts)) {
    // Get minimum required symbols (default 8 for Gates of Olympus style)
    const minRequired = gameSettings.base.minAnywayPaySize || gameSettings.base.minClusterSize || 8;
    
    if (count >= minRequired) {
      // This symbol qualifies for anyway pay
      qualifyingPays.push({
        symbol: symbol,
        count: count,
        positions: symbolData.positions[symbol],
        payTier: getPayTierForCount(count) // Gates of Olympus tier: 8-9, 10-11, 12+
      });
    }
  }
  
  return qualifyingPays;
}

/**
 * Get pay tier based on symbol count (Gates of Olympus style)
 * 
 * @param {number} count - Number of symbols found
 * @returns {string} Pay tier identifier
 */
function getPayTierForCount(count) {
  if (count >= 12) return '12+';  // Highest tier
  if (count >= 10) return '10-11'; // Medium tier
  if (count >= 8) return '8-9';   // Lowest tier
  return 'none'; // Less than 8 symbols
}

/**
 * Calculate total wins from all anyway pays
 * 
 * @param {Array} anywayPays - Array of qualifying anyway pays
 * @param {Object} gameSettings - Game configuration with payouts
 * @returns {Object} Win calculation results
 */
function calculateAnywayPayWins(anywayPays, gameSettings) {
  let totalWin = 0;
  const allWinningPositions = [];
  const payoutDetails = [];
  
  // Process each anyway pay to calculate its payout
  anywayPays.forEach(anywayPay => {
    const payout = calculateAnywayPayPayout(anywayPay.symbol, anywayPay.count, gameSettings);
    
    // Add to totals
    totalWin += payout;
    allWinningPositions.push(...anywayPay.positions);
    
    // Track payout details for debugging/display
    if (payout > 0) {
      payoutDetails.push({
        symbol: anywayPay.symbol,
        count: anywayPay.count,
        tier: anywayPay.payTier,
        payout: payout,
        positions: anywayPay.positions
      });
    }
  });
  
  return {
    totalWin: totalWin,
    winningPositions: allWinningPositions,
    payoutDetails: payoutDetails
  };
}

/**
 * Calculate payout for individual anyway pay using Gates of Olympus tier structure
 * 
 * @param {string} symbol - Symbol that formed the anyway pay
 * @param {number} symbolCount - How many of this symbol were found
 * @param {Object} gameSettings - Game configuration with payout table
 * @returns {number} Payout amount for this anyway pay
 */
function calculateAnywayPayPayout(symbol, symbolCount, gameSettings) {
  const symbolPayouts = gameSettings.payouts[symbol];
  
  // No payout table defined for this symbol
  if (!symbolPayouts) {
    return 0;
  }
  
  // Get the pay tier based on symbol count
  const payTier = getPayTierForCount(symbolCount);
  
  // Find payout for this tier (Gates of Olympus style tiers)
  if (payTier === '12+') {
    return symbolPayouts['12+'] || symbolPayouts[12] || symbolPayouts[15] || 0;
  } else if (payTier === '10-11') {
    return symbolPayouts['10-11'] || symbolPayouts[10] || symbolPayouts[11] || 0;
  } else if (payTier === '8-9') {
    return symbolPayouts['8-9'] || symbolPayouts[8] || symbolPayouts[9] || 0;
  }
  
  return 0;
}

/**
 * Update client context with anyway pay results
 * This stores the results for use by other game systems
 * 
 * @param {Object} client - Game client object
 * @param {number} totalWin - Total win amount from anyway pays
 * @param {Array} winningPositions - All positions that contributed to wins
 * @param {Array} anywayPays - Array of anyway pay data
 * @param {Array} payoutDetails - Detailed payout breakdown
 */
function updateClientContextWithResults(client, totalWin, winningPositions, anywayPays, payoutDetails) {
  // Initialize features context if it doesn't exist
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  // Store anyway pay results
  client.node.context.features.anywayPay = {
    hasWins: totalWin > 0,
    totalWin: totalWin,
    winningSymbols: winningPositions,
    anywayPays: anywayPays,
    payoutDetails: payoutDetails,
    count: anywayPays.length
  };
  
  // Keep cluster reference for backward compatibility
  client.node.context.features.cluster = client.node.context.features.anywayPay;
  
  // Store clusters for backward compatibility
  client.node.context.clusters = anywayPays;
  
  // Initialize win context if it doesn't exist
  if (!client.node.context.win) {
    client.node.context.win = { total: 0, lines: [] };
  }
  
  // Add anyway pay wins to total win amount
  client.node.context.win.total += totalWin;
  
  // Mark positions for destruction if there are wins (for cascades)
  if (totalWin > 0 && winningPositions.length > 0) {
    client.node.context.destroy = winningPositions;
  }
}

// Export the main check function and payout calculator
// Keep old names for backward compatibility
module.exports = { 
  check, 
  calculateAnywayPayPayout,
  // Legacy function names for backward compatibility
  calculateClusterPayout: calculateAnywayPayPayout
};