/**
 * Gods of Glory - Tumble Feature Controller
 * 
 * Handles tumbling/cascading reel mechanics for Gods of Glory game.
 * When clusters form wins, winning symbols are removed and remaining symbols
 * tumble down, with new symbols falling from above.
 * 
 * Tumble Mechanics:
 * - Winning symbols are removed from matrix after payout calculation
 * - Remaining symbols drop down to fill gaps (gravity effect)
 * - New symbols fall from top to fill empty spaces
 * - Process repeats until no new cluster wins form
 * - Each tumble step is tracked and can add additional wins
 */

const { removeSymbolsFromMatrix, dropSymbolsDown } = require('../../../src/game/runner/controllers/matrix_controller.js');
const cluster = require('../../../src/game/runner/controllers/cluster_controller.js');

/**
 * Check for tumble feature activation and process tumbling sequence
 * Main entry point for tumble feature evaluation and processing
 * 
 * @param {Object} client - Game client object
 * @param {Array} winningSymbols - Array of winning symbol positions to remove
 * @param {Object} settings - Game configuration settings
 * @return {Object} Tumble processing results with additional wins and new matrix
 */
async function checkForTumbleActivationAndProcessTumblingSequence(client, winningSymbols, settings) {
  // Validate if tumble should activate
  if (!shouldTumbleFeatureActivate(winningSymbols)) {
    return createEmptyTumbleResult(client.matrix);
  }
  
  // Process the tumbling sequence
  const tumbleResults = await processSingleTumbleStep(client, winningSymbols, settings);
  
  // Update client with tumble tracking data
  updateClientTumbleTrackingData(client, tumbleResults);
  
  return createTumbleFeatureResults(tumbleResults);
}

/**
 * Check if tumble feature should activate
 * Determines if there are winning symbols to trigger tumbling
 * 
 * @param {Array} winningSymbols - Array of winning symbol positions
 * @return {boolean} True if tumble feature should activate
 */
function shouldTumbleFeatureActivate(winningSymbols) {
  return winningSymbols && winningSymbols.length > 0;
}

/**
 * Create empty tumble result for when no tumble occurs
 * Returns default result when tumble feature doesn't activate
 * 
 * @param {Array} currentMatrix - Current game matrix
 * @return {Object} Empty tumble result object
 */
function createEmptyTumbleResult(currentMatrix) {
  return {
    hasMoreWins: false,
    additionalWin: 0,
    newMatrix: currentMatrix,
    newWinningSymbols: [],
    tumbleOccurred: false
  };
}

/**
 * Process a single tumble step with symbol removal and dropping
 * Handles one complete tumble cycle: remove, drop, fill, check wins
 * 
 * @param {Object} client - Game client object
 * @param {Array} winningSymbols - Positions of symbols to remove
 * @param {Object} settings - Game configuration
 * @return {Object} Results of this tumble step
 */
async function processSingleTumbleStep(client, winningSymbols, settings) {
  // Remove winning symbols from matrix
  const matrixAfterSymbolRemoval = removeWinningSymbolsFromGameMatrix(client.matrix, winningSymbols);
  
  // Drop remaining symbols down to fill gaps
  const matrixAfterSymbolsDropped = dropRemainingSymbolsDownToFillGaps(matrixAfterSymbolRemoval, settings);
  
  // Fill empty positions with new symbols
  const completeMatrixWithNewSymbols = await fillEmptyPositionsWithNewSymbols(matrixAfterSymbolsDropped, settings);
  
  // Update client matrix with new state
  client.matrix = completeMatrixWithNewSymbols;
  
  // Check for new cluster wins after tumble
  const newClusterWinResults = await checkForNewClusterWinsAfterTumble(client);
  
  return {
    hasMoreWins: newClusterWinResults.totalWin > 0,
    additionalWin: newClusterWinResults.totalWin,
    newMatrix: completeMatrixWithNewSymbols,
    newWinningSymbols: newClusterWinResults.winningSymbols || [],
    clusterResults: newClusterWinResults,
    tumbleOccurred: true
  };
}

/**
 * Remove winning symbols from game matrix
 * Clears winning symbol positions to prepare for tumbling
 * 
 * @param {Array} matrix - Current game matrix
 * @param {Array} winningPositions - Positions of symbols to remove
 * @return {Array} Matrix with winning symbols removed (null placeholders)
 */
function removeWinningSymbolsFromGameMatrix(matrix, winningPositions) {
  return removeSymbolsFromMatrix(matrix, winningPositions);
}

/**
 * Drop remaining symbols down to fill gaps
 * Simulates gravity effect on symbols after winning symbols removed
 * 
 * @param {Array} matrix - Matrix with gaps from removed symbols
 * @param {Object} settings - Game configuration
 * @return {Array} Matrix after symbols have dropped down
 */
function dropRemainingSymbolsDownToFillGaps(matrix, settings) {
  return dropSymbolsDown(matrix, settings);
}

/**
 * Fill empty positions with new symbols
 * Generates new symbols to fill remaining empty spaces at top of reels
 * 
 * @param {Array} matrix - Matrix after symbols dropped
 * @param {Object} settings - Game configuration
 * @return {Array} Complete matrix with all positions filled
 */
async function fillEmptyPositionsWithNewSymbols(matrix, settings) {
  // This would typically use the matrix controller to generate new symbols
  // For now, we'll assume the dropSymbolsDown function handles this
  return matrix;
}

/**
 * Check for new cluster wins after tumble
 * Evaluates tumbled matrix for new cluster formations
 * 
 * @param {Object} client - Game client object with updated matrix
 * @return {Object} Cluster win results from tumbled matrix
 */
async function checkForNewClusterWinsAfterTumble(client) {
  return await cluster.check(client);
}

/**
 * Update client tumble tracking data
 * Records tumble activity and statistics in client context
 * 
 * @param {Object} client - Game client object
 * @param {Object} tumbleResults - Results from tumble processing
 */
function updateClientTumbleTrackingData(client, tumbleResults) {
  initializeTumbleFeatureContextIfNeeded(client);
  
  if (tumbleResults.hasMoreWins) {
    activateTumbleFeatureAndUpdateCounters(client, tumbleResults.additionalWin);
  }
}

/**
 * Initialize tumble feature context if needed
 * Sets up tumble tracking structure in client context
 * 
 * @param {Object} client - Game client object
 */
function initializeTumbleFeatureContextIfNeeded(client) {
  if (!client.node.context.features) {
    client.node.context.features = {};
  }
  
  if (!client.node.context.features.tumble) {
    client.node.context.features.tumble = createDefaultTumbleContextData();
  }
}

/**
 * Create default tumble context data
 * Returns initial tumble tracking structure
 * 
 * @return {Object} Default tumble context data
 */
function createDefaultTumbleContextData() {
  return {
    active: false,
    count: 0,
    totalWin: 0,
    timestamp: Date.now()
  };
}

/**
 * Activate tumble feature and update counters
 * Marks tumble as active and updates win tracking
 * 
 * @param {Object} client - Game client object
 * @param {number} additionalWin - Win amount from this tumble
 */
function activateTumbleFeatureAndUpdateCounters(client, additionalWin) {
  client.node.context.features.tumble.active = true;
  client.node.context.features.tumble.count++;
  client.node.context.features.tumble.totalWin += additionalWin;
  client.node.context.features.tumble.lastWin = additionalWin;
  client.node.context.features.tumble.timestamp = Date.now();
}

/**
 * Create tumble feature results object
 * Builds comprehensive results object for tumble processing
 * 
 * @param {Object} tumbleResults - Raw tumble processing results
 * @return {Object} Formatted tumble feature results
 */
function createTumbleFeatureResults(tumbleResults) {
  return {
    hasMoreWins: tumbleResults.hasMoreWins,
    additionalWin: tumbleResults.additionalWin,
    newMatrix: tumbleResults.newMatrix,
    newWinningSymbols: tumbleResults.newWinningSymbols,
    tumbleActivated: tumbleResults.tumbleOccurred,
    clusterData: tumbleResults.clusterResults
  };
}

/**
 * Reset tumble data for new spin
 * Clears tumble tracking data to prepare for next spin
 * 
 * @param {Object} client - Game client object
 */
function resetTumbleDataForNewSpin(client) {
  initializeTumbleFeatureContextIfNeeded(client);
  client.node.context.features.tumble = createDefaultTumbleContextData();
}

/**
 * Process complete tumbling sequence until no more wins
 * Handles recursive tumbling until no new cluster wins form
 * 
 * @param {Object} client - Game client object
 * @param {Array} initialWinningSymbols - Initial winning symbols that trigger tumbling
 * @param {Object} settings - Game configuration
 * @return {Object} Complete tumbling sequence results
 */
async function processCompleteTumblingSequenceUntilNoMoreWins(client, initialWinningSymbols, settings) {
  let totalTumbleWin = 0;
  let tumbleCount = 0;
  let currentWinningSymbols = initialWinningSymbols;
  const tumbleSteps = [];
  
  // Reset tumble data for this sequence
  resetTumbleDataForNewSpin(client);
  
  while (currentWinningSymbols && currentWinningSymbols.length > 0) {
    tumbleCount++;
    
    // Process one tumble step
    const tumbleStepResult = await checkForTumbleActivationAndProcessTumblingSequence(client, currentWinningSymbols, settings);
    
    if (!tumbleStepResult.hasMoreWins) {
      break; // No more wins, end tumbling sequence
    }
    
    // Accumulate results
    totalTumbleWin += tumbleStepResult.additionalWin;
    tumbleSteps.push({
      stepNumber: tumbleCount,
      additionalWin: tumbleStepResult.additionalWin,
      newWinningSymbols: tumbleStepResult.newWinningSymbols,
      matrix: JSON.parse(JSON.stringify(tumbleStepResult.newMatrix))
    });
    
    // Prepare for next tumble iteration
    currentWinningSymbols = tumbleStepResult.newWinningSymbols;
  }
  
  return createCompleteTumblingSequenceResults(totalTumbleWin, tumbleCount, tumbleSteps, client.matrix);
}

/**
 * Create complete tumbling sequence results
 * Builds comprehensive results for entire tumbling sequence
 * 
 * @param {number} totalWin - Total win from all tumble steps
 * @param {number} stepCount - Number of tumble steps
 * @param {Array} steps - Array of individual tumble step data
 * @param {Array} finalMatrix - Final matrix state after all tumbles
 * @return {Object} Complete tumbling sequence results
 */
function createCompleteTumblingSequenceResults(totalWin, stepCount, steps, finalMatrix) {
  return {
    totalTumbleWin: totalWin,
    tumbleStepCount: stepCount,
    tumbleSteps: steps,
    finalMatrix: finalMatrix,
    sequenceCompleted: true,
    hadTumbles: stepCount > 0
  };
}

/**
 * Calculate tumble feature frequency statistics
 * Provides analytics on tumble feature occurrence rates
 * 
 * @param {number} totalSpins - Total spins in simulation
 * @param {number} tumbleTriggers - Number of spins with tumbles
 * @param {Array} allTumbleCounts - Array of tumble counts per trigger
 * @return {Object} Tumble frequency statistics
 */
function calculateTumbleFeatureFrequencyStats(totalSpins, tumbleTriggers, allTumbleCounts) {
  if (totalSpins === 0) {
    return createEmptyTumbleFrequencyStats();
  }
  
  const hitRate = (tumbleTriggers / totalSpins) * 100;
  const averageSpinsBetween = tumbleTriggers > 0 ? totalSpins / tumbleTriggers : 0;
  const averageTumblesPerTrigger = allTumbleCounts.length > 0 ? 
    allTumbleCounts.reduce((sum, count) => sum + count, 0) / allTumbleCounts.length : 0;
  
  return {
    tumbleTriggerFrequency: tumbleTriggers,
    hitRate: hitRate,
    averageSpinsBetweenTriggers: averageSpinsBetween,
    oneInXChance: tumbleTriggers > 0 ? Math.round(totalSpins / tumbleTriggers) : 0,
    averageTumblesPerTrigger: averageTumblesPerTrigger,
    maxTumblesInSequence: allTumbleCounts.length > 0 ? Math.max(...allTumbleCounts) : 0,
    totalTumbleSteps: allTumbleCounts.reduce((sum, count) => sum + count, 0)
  };
}

/**
 * Create empty tumble frequency statistics
 * Returns default statistics when no data available
 * 
 * @return {Object} Empty tumble frequency statistics
 */
function createEmptyTumbleFrequencyStats() {
  return {
    tumbleTriggerFrequency: 0,
    hitRate: 0,
    averageSpinsBetweenTriggers: 0,
    oneInXChance: 0,
    averageTumblesPerTrigger: 0,
    maxTumblesInSequence: 0,
    totalTumbleSteps: 0
  };
}

/**
 * Analyze tumble win distribution patterns
 * Provides detailed analysis of wins generated by tumble steps
 * 
 * @param {Array} tumbleWins - Array of win amounts from tumble steps
 * @return {Object} Tumble win distribution analysis
 */
function analyzeTumbleWinDistributionPatterns(tumbleWins) {
  if (tumbleWins.length === 0) {
    return {
      totalTumbleWins: tumbleWins.length,
      totalWinAmount: 0,
      averageWinAmount: 0,
      maxWin: 0,
      minWin: 0,
      distribution: {}
    };
  }
  
  const totalWinAmount = tumbleWins.reduce((sum, win) => sum + win, 0);
  const averageWinAmount = totalWinAmount / tumbleWins.length;
  const maxWin = Math.max(...tumbleWins);
  const minWin = Math.min(...tumbleWins);
  
  // Create win amount distribution
  const distribution = {};
  tumbleWins.forEach(win => {
    distribution[win] = (distribution[win] || 0) + 1;
  });
  
  return {
    totalTumbleWins: tumbleWins.length,
    totalWinAmount: totalWinAmount,
    averageWinAmount: averageWinAmount,
    maxWin: maxWin,
    minWin: minWin,
    distribution: distribution
  };
}

module.exports = {
  checkForTumbleActivationAndProcessTumblingSequence,
  processCompleteTumblingSequenceUntilNoMoreWins,
  resetTumbleDataForNewSpin,
  calculateTumbleFeatureFrequencyStats,
  analyzeTumbleWinDistributionPatterns,
  // Legacy function names for compatibility
  tumbleFeatureCheck: checkForTumbleActivationAndProcessTumblingSequence,
  resetTumbleData: resetTumbleDataForNewSpin
};