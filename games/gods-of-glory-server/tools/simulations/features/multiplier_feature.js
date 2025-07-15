/**
 * Gods of Glory - Multiplier Feature Controller
 * 
 * Handles multiplier symbol detection, value generation, and win enhancement.
 * Multiplier symbols enhance wins by multiplying the base win amount.
 * 
 * Multiplier Mechanics:
 * - Base Game: Multipliers add together, then multiply total win
 * - Free Spins: Multipliers collected globally throughout bonus
 * - Values: 2x, 3x, 4x, 5x, 8x, 10x, 15x, 20x, 25x, 50x, 100x, 250x, 500x
 * - Weighted distribution: Lower values more common than higher ones
 */

const { generateMultiplierValue } = require('../../../src/game/runner/math/random_controller');

/**
 * Check for multiplier symbols and apply their effects
 * Scans matrix for multiplier symbols and calculates their impact on wins
 * 
 * @param {Object} client - Game client object
 * @param {Array} matrixToScan - 6x5 matrix to scan for multiplier symbols
 * @param {Object} gameSettings - Game configuration settings
 * @return {Object} Multiplier data with enhancement information
 */
async function checkForMultiplierSymbolsAndApply(client, matrixToScan, gameSettings) {
  // Find all multiplier symbols in the matrix
  const multiplierPositions = findAllMultiplierSymbolPositions(matrixToScan, gameSettings.symbols.multiplier);
  
  if (multiplierPositions.length === 0) {
    return createEmptyMultiplierResult();
  }
  
  // Generate values for each multiplier symbol found
  const multiplierValues = generateValuesForAllMultiplierSymbols(multiplierPositions, gameSettings.multiplierWeights);
  
  // Calculate total multiplier effect
  const totalMultiplierEffect = calculateTotalMultiplierEffect(multiplierValues);
  
  // Apply multiplier to current wins
  const enhancementData = applyMultiplierToCurrentWins(client, totalMultiplierEffect);
  
  // Update client context with multiplier information
  updateClientContextWithMultiplierData(client, multiplierPositions, multiplierValues, totalMultiplierEffect);
  
  // Return comprehensive multiplier data
  return createMultiplierResultData(multiplierPositions, multiplierValues, totalMultiplierEffect, enhancementData);
}

/**
 * Check for multiplier symbols specifically in free spins
 * Free spins have different multiplier mechanics (global collection)
 * 
 * @param {Object} client - Game client object
 * @param {Array} matrixToScan - Matrix to scan for multipliers
 * @param {Object} gameSettings - Game configuration
 * @return {Object} Free spins multiplier data
 */
async function checkForMultiplierSymbolsInFreeSpins(client, matrixToScan, gameSettings) {
  const multiplierPositions = findAllMultiplierSymbolPositions(matrixToScan, gameSettings.symbols.multiplier);
  
  if (multiplierPositions.length === 0) {
    return createEmptyFreeSpinsMultiplierResult();
  }
  
  // Generate multiplier values
  const multiplierValues = generateValuesForAllMultiplierSymbols(multiplierPositions, gameSettings.multiplierWeights);
  
  // In free spins, collect multipliers globally
  collectMultipliersGloballyInFreeSpins(client, multiplierValues);
  
  // Calculate session-wide multiplier (all collected)
  const sessionMultiplier = calculateSessionWideMultiplierEffect(client);
  
  // Apply session multiplier to wins
  const enhancementData = applySessionMultiplierToWins(client, sessionMultiplier);
  
  // Update context for free spins
  updateFreeSpinsContextWithMultiplierData(client, multiplierPositions, multiplierValues, sessionMultiplier);
  
  return createFreeSpinsMultiplierResultData(multiplierPositions, multiplierValues, sessionMultiplier, enhancementData);
}

/**
 * Find all multiplier symbol positions in matrix
 * Scans every position for multiplier symbols
 * 
 * @param {Array} matrix - 6x5 game matrix
 * @param {string} multiplierSymbol - Multiplier symbol identifier
 * @return {Array} Array of positions where multipliers were found
 */
function findAllMultiplierSymbolPositions(matrix, multiplierSymbol) {
  const multiplierPositions = [];
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === multiplierSymbol) {
        multiplierPositions.push({ row, col });
      }
    }
  }
  
  return multiplierPositions;
}

/**
 * Generate values for all multiplier symbols found
 * Creates random multiplier values based on weighted distribution
 * 
 * @param {Array} multiplierPositions - Array of multiplier positions
 * @param {Array} multiplierWeights - Weight configuration for values
 * @return {Array} Array of generated multiplier values
 */
function generateValuesForAllMultiplierSymbols(multiplierPositions, multiplierWeights) {
  return multiplierPositions.map(() => {
    return generateMultiplierValue(multiplierWeights);
  });
}

/**
 * Calculate total multiplier effect from individual values
 * In base game: adds all multiplier values together, then applies
 * 
 * @param {Array} multiplierValues - Array of individual multiplier values
 * @return {number} Total multiplier effect
 */
function calculateTotalMultiplierEffect(multiplierValues) {
  if (multiplierValues.length === 0) {
    return 1; // No multiplier effect
  }
  
  // Add all multiplier values together, then add 1 for base
  const additionalMultiplier = multiplierValues.reduce((sum, value) => sum + value, 0);
  return 1 + additionalMultiplier;
}

/**
 * Apply multiplier to current wins in client
 * Enhances existing wins with multiplier effect
 * 
 * @param {Object} client - Game client object
 * @param {number} totalMultiplier - Total multiplier to apply
 * @return {Object} Enhancement data with before/after amounts
 */
function applyMultiplierToCurrentWins(client, totalMultiplier) {
  const originalWin = client.node.context.win ? client.node.context.win.total : 0;
  
  if (originalWin === 0 || totalMultiplier === 1) {
    return { originalWin, enhancedWin: originalWin, additionalWin: 0 };
  }
  
  const enhancedWin = originalWin * totalMultiplier;
  const additionalWin = enhancedWin - originalWin;
  
  // Update client win total
  if (client.node.context.win) {
    client.node.context.win.total = enhancedWin;
  }
  
  return { originalWin, enhancedWin, additionalWin };
}

/**
 * Collect multipliers globally in free spins
 * Adds multiplier values to the free spins collection
 * 
 * @param {Object} client - Game client object
 * @param {Array} multiplierValues - New multiplier values to collect
 */
function collectMultipliersGloballyInFreeSpins(client, multiplierValues) {
  // Initialize collection if not exists
  if (!client.node.context.freespins.collectedMultipliers) {
    client.node.context.freespins.collectedMultipliers = [];
  }
  
  // Add new multipliers to collection
  client.node.context.freespins.collectedMultipliers.push(...multiplierValues);
}

/**
 * Calculate session-wide multiplier effect
 * Uses all collected multipliers throughout free spins bonus
 * 
 * @param {Object} client - Game client object
 * @return {number} Session multiplier effect
 */
function calculateSessionWideMultiplierEffect(client) {
  const collectedMultipliers = client.node.context.freespins.collectedMultipliers || [];
  
  if (collectedMultipliers.length === 0) {
    return 1;
  }
  
  // Add all collected multipliers together
  const totalAdditionalMultiplier = collectedMultipliers.reduce((sum, value) => sum + value, 0);
  return 1 + totalAdditionalMultiplier;
}

/**
 * Apply session multiplier to wins
 * Uses accumulated multiplier effect from entire free spins session
 * 
 * @param {Object} client - Game client object
 * @param {number} sessionMultiplier - Total session multiplier
 * @return {Object} Enhancement data
 */
function applySessionMultiplierToWins(client, sessionMultiplier) {
  return applyMultiplierToCurrentWins(client, sessionMultiplier);
}

/**
 * Update client context with multiplier data
 * Records multiplier information for current spin
 * 
 * @param {Object} client - Game client object
 * @param {Array} positions - Multiplier positions
 * @param {Array} values - Multiplier values
 * @param {number} totalEffect - Total multiplier effect
 */
function updateClientContextWithMultiplierData(client, positions, values, totalEffect) {
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  client.node.context.features.multiplier = {
    active: values.length > 0,
    positions: positions,
    values: values,
    totalMultiplier: totalEffect,
    count: values.length,
    timestamp: Date.now()
  };
}

/**
 * Update free spins context with multiplier data
 * Records multiplier information specifically for free spins
 * 
 * @param {Object} client - Game client object
 * @param {Array} positions - Multiplier positions
 * @param {Array} values - Multiplier values  
 * @param {number} sessionMultiplier - Session-wide multiplier
 */
function updateFreeSpinsContextWithMultiplierData(client, positions, values, sessionMultiplier) {
  updateClientContextWithMultiplierData(client, positions, values, sessionMultiplier);
  
  // Add free spins specific data
  client.node.context.features.multiplier.isFreeSpins = true;
  client.node.context.features.multiplier.sessionMultiplier = sessionMultiplier;
  client.node.context.features.multiplier.collectedCount = client.node.context.freespins.collectedMultipliers ? 
    client.node.context.freespins.collectedMultipliers.length : 0;
}

/**
 * Create empty multiplier result
 * Returns default result when no multipliers found
 * 
 * @return {Object} Empty multiplier result
 */
function createEmptyMultiplierResult() {
  return {
    hasMultipliers: false,
    positions: [],
    values: [],
    totalMultiplier: 1,
    additionalWin: 0,
    count: 0
  };
}

/**
 * Create empty free spins multiplier result
 * Returns default result for free spins when no multipliers found
 * 
 * @return {Object} Empty free spins multiplier result
 */
function createEmptyFreeSpinsMultiplierResult() {
  const result = createEmptyMultiplierResult();
  result.isFreeSpins = true;
  result.sessionMultiplier = 1;
  return result;
}

/**
 * Create comprehensive multiplier result data
 * Returns complete information about multiplier effects
 * 
 * @param {Array} positions - Multiplier positions
 * @param {Array} values - Multiplier values
 * @param {number} totalEffect - Total multiplier effect
 * @param {Object} enhancementData - Win enhancement information
 * @return {Object} Complete multiplier result
 */
function createMultiplierResultData(positions, values, totalEffect, enhancementData) {
  return {
    hasMultipliers: values.length > 0,
    positions: positions,
    values: values,
    totalMultiplier: totalEffect,
    additionalWin: enhancementData.additionalWin,
    count: values.length,
    enhancement: enhancementData,
    averageValue: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
    maxValue: values.length > 0 ? Math.max(...values) : 0,
    minValue: values.length > 0 ? Math.min(...values) : 0
  };
}

/**
 * Create free spins multiplier result data
 * Returns complete information for free spins multiplier effects
 * 
 * @param {Array} positions - Multiplier positions
 * @param {Array} values - Multiplier values
 * @param {number} sessionEffect - Session multiplier effect
 * @param {Object} enhancementData - Win enhancement information
 * @return {Object} Complete free spins multiplier result
 */
function createFreeSpinsMultiplierResultData(positions, values, sessionEffect, enhancementData) {
  const result = createMultiplierResultData(positions, values, sessionEffect, enhancementData);
  result.isFreeSpins = true;
  result.sessionMultiplier = sessionEffect;
  return result;
}

/**
 * Get multiplier statistics for analysis
 * Provides detailed analytics on multiplier performance
 * 
 * @param {Array} multiplierValues - Array of multiplier values
 * @return {Object} Statistical analysis of multipliers
 */
function getMultiplierStatisticalAnalysis(multiplierValues) {
  if (multiplierValues.length === 0) {
    return {
      count: 0,
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      median: 0,
      distribution: {}
    };
  }
  
  const sortedValues = [...multiplierValues].sort((a, b) => a - b);
  const total = multiplierValues.reduce((sum, val) => sum + val, 0);
  const average = total / multiplierValues.length;
  const median = calculateMedianValue(sortedValues);
  const distribution = calculateValueDistribution(multiplierValues);
  
  return {
    count: multiplierValues.length,
    total: total,
    average: average,
    min: Math.min(...multiplierValues),
    max: Math.max(...multiplierValues),
    median: median,
    distribution: distribution
  };
}

/**
 * Calculate median value from sorted array
 * Finds the middle value in a sorted array
 * 
 * @param {Array} sortedValues - Pre-sorted array of values
 * @return {number} Median value
 */
function calculateMedianValue(sortedValues) {
  const length = sortedValues.length;
  if (length === 0) return 0;
  
  if (length % 2 === 0) {
    // Even number of values - average of two middle values
    return (sortedValues[length / 2 - 1] + sortedValues[length / 2]) / 2;
  } else {
    // Odd number of values - middle value
    return sortedValues[Math.floor(length / 2)];
  }
}

/**
 * Calculate value distribution
 * Counts frequency of each multiplier value
 * 
 * @param {Array} multiplierValues - Array of multiplier values
 * @return {Object} Distribution object with value counts
 */
function calculateValueDistribution(multiplierValues) {
  const distribution = {};
  
  multiplierValues.forEach(value => {
    distribution[value] = (distribution[value] || 0) + 1;
  });
  
  return distribution;
}

/**
 * Calculate multiplier feature frequency statistics
 * Provides analytics on multiplier feature occurrence
 * 
 * @param {number} totalSpins - Total spins in simulation
 * @param {number} multiplierTriggers - Number of multiplier triggers
 * @param {Array} allMultiplierValues - All multiplier values seen
 * @return {Object} Frequency and value statistics
 */
function calculateMultiplierFeatureFrequencyStats(totalSpins, multiplierTriggers, allMultiplierValues) {
  const basicFrequency = {
    triggerCount: multiplierTriggers,
    hitRate: totalSpins > 0 ? (multiplierTriggers / totalSpins) * 100 : 0,
    averageSpinsBetween: multiplierTriggers > 0 ? totalSpins / multiplierTriggers : 0
  };
  
  const valueStatistics = getMultiplierStatisticalAnalysis(allMultiplierValues);
  
  return {
    frequency: basicFrequency,
    values: valueStatistics,
    totalMultiplierSymbols: allMultiplierValues.length,
    averageMultipliersPerTrigger: multiplierTriggers > 0 ? allMultiplierValues.length / multiplierTriggers : 0
  };
}

module.exports = {
  checkForMultiplierSymbolsAndApply,
  checkForMultiplierSymbolsInFreeSpins,
  findAllMultiplierSymbolPositions,
  generateValuesForAllMultiplierSymbols,
  calculateTotalMultiplierEffect,
  getMultiplierStatisticalAnalysis,
  calculateMultiplierFeatureFrequencyStats
};