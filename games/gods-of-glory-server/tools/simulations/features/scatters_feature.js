/**
 * Gods of Glory - Scatter Feature Controller
 * 
 * Handles scatter symbol detection and free spins bonus triggering.
 * Scatter symbols are special symbols that don't need to be adjacent to form wins.
 * 
 * Free Spins Trigger Rules:
 * - 4+ scatter symbols anywhere on the grid = 15 free spins
 * - Scatter symbols also pay instant wins based on count
 * - Free spins have enhanced multiplier collection mechanics
 */

/**
 * Check if scatter symbols trigger free spins bonus
 * Scans the entire matrix for scatter symbols and determines if bonus is triggered
 * 
 * @param {Object} client - Game client object
 * @param {Array} matrixToScan - 6x5 matrix to scan for scatter symbols
 * @param {Object} freeSpinsSettings - Free spins configuration settings
 * @return {boolean} True if free spins bonus is triggered
 */
async function checkForScatterBonusTrigger(client, matrixToScan, freeSpinsSettings) {
  const gameSettings = require('../../../src/game/runner/configs/settings').get(client.gameId);
  
  // Find all scatter symbol positions in the matrix
  const scatterPositions = findAllScatterSymbolPositions(matrixToScan, gameSettings.symbols.scatter);
  const scatterCount = scatterPositions.length;
  
  // Check if enough scatters for bonus trigger
  const isBonusTriggered = isScatterCountSufficientForBonus(scatterCount, freeSpinsSettings.triggerCount);
  
  if (isBonusTriggered) {
    // Calculate instant scatter payout
    const instantScatterPayout = calculateInstantScatterPayout(scatterCount, client.node.spinBet, gameSettings);
    
    // Award free spins and record trigger
    awardFreeSpinsBonusToClient(client, freeSpinsSettings, scatterCount, instantScatterPayout);
    
    // Add scatter payout to current win total
    addScatterPayoutToClientWins(client, instantScatterPayout);
    
    // Log scatter feature trigger for tracking
    logScatterFeatureTrigger(client, scatterCount, instantScatterPayout);
  }
  
  // Update client context with scatter information
  updateClientContextWithScatterData(client, scatterCount, scatterPositions, isBonusTriggered);
  
  return isBonusTriggered;
}

/**
 * Find all scatter symbol positions in the matrix
 * Scans every position in the 6x5 grid for scatter symbols
 * 
 * @param {Array} matrix - 6x5 game matrix to scan
 * @param {string} scatterSymbol - Symbol identifier for scatters
 * @return {Array} Array of position objects {row, col} where scatters were found
 */
function findAllScatterSymbolPositions(matrix, scatterSymbol) {
  const scatterPositions = [];
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === scatterSymbol) {
        scatterPositions.push({ row, col });
      }
    }
  }
  
  return scatterPositions;
}

/**
 * Check if scatter count is sufficient to trigger bonus
 * Compares found scatter count against minimum required
 * 
 * @param {number} scatterCount - Number of scatter symbols found
 * @param {number} minimumRequired - Minimum scatters needed for bonus
 * @return {boolean} True if scatter count meets or exceeds requirement
 */
function isScatterCountSufficientForBonus(scatterCount, minimumRequired) {
  return scatterCount >= minimumRequired;
}

/**
 * Calculate instant payout from scatter symbols
 * Scatter symbols pay immediate wins based on count before free spins
 * 
 * @param {number} scatterCount - Number of scatter symbols
 * @param {number} currentBet - Current spin bet amount
 * @param {Object} gameSettings - Game configuration with payout table
 * @return {number} Instant scatter payout amount
 */
function calculateInstantScatterPayout(scatterCount, currentBet, gameSettings) {
  const scatterPayoutMultiplier = gameSettings.scatterPayouts[scatterCount] || 0;
  return currentBet * scatterPayoutMultiplier;
}

/**
 * Award free spins bonus to client
 * Sets up free spins context with awarded spins and bonus information
 * 
 * @param {Object} client - Game client object
 * @param {Object} freeSpinsSettings - Free spins configuration
 * @param {number} scatterCount - Number of triggering scatters
 * @param {number} instantPayout - Immediate scatter payout
 */
function awardFreeSpinsBonusToClient(client, freeSpinsSettings, scatterCount, instantPayout) {
  // Initialize free spins context if not exists
  if (!client.node.context.freespins) {
    client.node.context.freespins = {};
  }
  
  // Set up free spins bonus
  client.node.context.freespins = {
    triggered: true,
    spinsAwarded: freeSpinsSettings.spinsAwarded,
    triggeringScatterCount: scatterCount,
    instantScatterPayout: instantPayout,
    totalWin: 0,
    collectedMultipliers: [], // For enhanced multiplier mechanics
    isActive: true
  };
}

/**
 * Add scatter payout to client's current wins
 * Ensures scatter payout is included in round total
 * 
 * @param {Object} client - Game client object
 * @param {number} scatterPayout - Amount to add to wins
 */
function addScatterPayoutToClientWins(client, scatterPayout) {
  // Initialize win context if not exists
  if (!client.node.context.win) {
    client.node.context.win = { total: 0, lines: [] };
  }
  
  // Add scatter payout to total win
  client.node.context.win.total += scatterPayout;
}

/**
 * Log scatter feature trigger for analytics
 * Records scatter bonus trigger for simulation tracking
 * 
 * @param {Object} client - Game client object
 * @param {number} scatterCount - Number of triggering scatters
 * @param {number} instantPayout - Immediate scatter payout
 */
function logScatterFeatureTrigger(client, scatterCount, instantPayout) {
  // This could be extended to log to specific scatter analytics files
  // For now, the main simulation tracks free spin triggers
  
  // console.log(`Scatter Bonus Triggered: ${scatterCount} scatters, instant payout: ${instantPayout}`);
}

/**
 * Update client context with scatter data
 * Records scatter information for this spin regardless of bonus trigger
 * 
 * @param {Object} client - Game client object
 * @param {number} scatterCount - Total scatter symbols found
 * @param {Array} scatterPositions - Array of scatter positions
 * @param {boolean} bonusTriggered - Whether bonus was triggered
 */
function updateClientContextWithScatterData(client, scatterCount, scatterPositions, bonusTriggered) {
  // Initialize features context if not exists
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  // Record scatter data for this spin
  client.node.context.features.scatter = {
    count: scatterCount,
    positions: scatterPositions,
    bonusTriggered: bonusTriggered,
    timestamp: Date.now() // For debugging/analysis
  };
}

/**
 * Check for scatter wins in specific matrix positions
 * Utility function for checking scatter presence at specific coordinates
 * 
 * @param {Array} matrix - Game matrix
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @param {string} scatterSymbol - Scatter symbol identifier
 * @return {boolean} True if scatter symbol found at position
 */
function checkForScatterAtPosition(matrix, row, col, scatterSymbol) {
  return matrix[row] && matrix[row][col] === scatterSymbol;
}

/**
 * Get scatter distribution analysis
 * Provides detailed breakdown of scatter placement for analysis
 * 
 * @param {Array} matrix - Game matrix
 * @param {string} scatterSymbol - Scatter symbol identifier
 * @return {Object} Distribution analysis object
 */
function getScatterDistributionAnalysis(matrix, scatterSymbol) {
  const distribution = {
    byRow: Array(matrix.length).fill(0),
    byCol: Array(matrix[0].length).fill(0),
    totalCount: 0,
    positions: []
  };
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === scatterSymbol) {
        distribution.byRow[row]++;
        distribution.byCol[col]++;
        distribution.totalCount++;
        distribution.positions.push({ row, col });
      }
    }
  }
  
  return distribution;
}

/**
 * Check if scatter pattern forms special formation
 * Analyzes if scatters form any special patterns (future feature)
 * 
 * @param {Array} scatterPositions - Array of scatter positions
 * @param {Object} gridSize - Grid dimensions {rows, cols}
 * @return {Object} Pattern analysis result
 */
function analyzeScatterPatternFormation(scatterPositions, gridSize) {
  if (scatterPositions.length < 4) {
    return { hasSpecialPattern: false, patternType: 'insufficient_scatters' };
  }
  
  // Check for full row coverage
  const rowCoverage = checkForFullRowScatterCoverage(scatterPositions, gridSize);
  if (rowCoverage.hasFullRow) {
    return { hasSpecialPattern: true, patternType: 'full_row', details: rowCoverage };
  }
  
  // Check for full column coverage  
  const colCoverage = checkForFullColumnScatterCoverage(scatterPositions, gridSize);
  if (colCoverage.hasFullColumn) {
    return { hasSpecialPattern: true, patternType: 'full_column', details: colCoverage };
  }
  
  // Check for cross pattern
  if (rowCoverage.hasFullRow && colCoverage.hasFullColumn) {
    return { hasSpecialPattern: true, patternType: 'cross_pattern', details: { rowCoverage, colCoverage } };
  }
  
  return { hasSpecialPattern: false, patternType: 'scattered_random' };
}

/**
 * Check for full row scatter coverage
 * Determines if scatters fill an entire row
 * 
 * @param {Array} scatterPositions - Array of scatter positions
 * @param {Object} gridSize - Grid dimensions
 * @return {Object} Row coverage analysis
 */
function checkForFullRowScatterCoverage(scatterPositions, gridSize) {
  const rowCounts = Array(gridSize.rows).fill(0);
  
  scatterPositions.forEach(pos => {
    rowCounts[pos.row]++;
  });
  
  const fullRows = rowCounts.map((count, index) => ({ row: index, count }))
                           .filter(item => item.count === gridSize.cols);
  
  return {
    hasFullRow: fullRows.length > 0,
    fullRows: fullRows,
    rowCounts: rowCounts
  };
}

/**
 * Check for full column scatter coverage
 * Determines if scatters fill an entire column
 * 
 * @param {Array} scatterPositions - Array of scatter positions  
 * @param {Object} gridSize - Grid dimensions
 * @return {Object} Column coverage analysis
 */
function checkForFullColumnScatterCoverage(scatterPositions, gridSize) {
  const colCounts = Array(gridSize.cols).fill(0);
  
  scatterPositions.forEach(pos => {
    colCounts[pos.col]++;
  });
  
  const fullCols = colCounts.map((count, index) => ({ col: index, count }))
                           .filter(item => item.count === gridSize.rows);
  
  return {
    hasFullColumn: fullCols.length > 0,
    fullColumns: fullCols,
    columnCounts: colCounts
  };
}

/**
 * Calculate scatter feature frequency statistics
 * Provides analytics on scatter feature occurrence rates
 * 
 * @param {number} totalSpins - Total spins in simulation
 * @param {number} scatterTriggers - Number of scatter bonus triggers
 * @return {Object} Frequency statistics
 */
function calculateScatterFeatureFrequencyStats(totalSpins, scatterTriggers) {
  if (totalSpins === 0) {
    return {
      triggerFrequency: 0,
      hitRate: 0,
      averageSpinsBetweenTriggers: 0
    };
  }
  
  const hitRate = (scatterTriggers / totalSpins) * 100;
  const averageSpinsBetween = scatterTriggers > 0 ? totalSpins / scatterTriggers : 0;
  
  return {
    triggerFrequency: scatterTriggers,
    hitRate: hitRate,
    averageSpinsBetweenTriggers: averageSpinsBetween,
    oneInXChance: scatterTriggers > 0 ? Math.round(totalSpins / scatterTriggers) : 0
  };
}

module.exports = {
  checkForScatterBonusTrigger,
  findAllScatterSymbolPositions,
  calculateInstantScatterPayout,
  checkForScatterAtPosition,
  getScatterDistributionAnalysis,
  analyzeScatterPatternFormation,
  calculateScatterFeatureFrequencyStats
};