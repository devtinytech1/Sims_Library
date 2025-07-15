/**
 * Gods of Glory - Cascade Mechanics Controller
 * 
 * This file handles the cascading/tumbling reel mechanics for Gods of Glory.
 * Based on Wild Quad Squad cascade pattern but adapted for anyway pay mechanics.
 * 
 * Cascade Flow:
 * 1. Winning symbols are removed from matrix
 * 2. Remaining symbols drop down to fill gaps  
 * 3. New symbols fall from top to fill empty spaces
 * 4. Check for new anyway pay wins (8+ symbols anywhere)
 * 5. Repeat until no more wins occur
 * 
 * Key Differences from Wild Quad Squad:
 * - Uses anyway pay instead of paylines (8+ symbols anywhere on grid)
 * - Handles multiplier symbols differently  
 * - No wild reveal mechanics (Gods of Glory specific)
 */

const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs');
const matrix_controller = require('../../src/game/runner/controllers/matrix_controller');
const anywayPayController = require('../../src/game/runner/controllers/anyway_pay_controller');

/**
 * Handle cascading sequence for Gods of Glory base game
 * Recursively processes cascades until no more wins occur
 * 
 * @param {Object} clientClone - Cloned client for cascade processing
 * @param {Array} winningMatrix - Matrix containing winning symbols
 * @param {Array} destroyPositions - Positions of symbols to remove
 * @param {string} cascadeType - Type of cascade ('gods_of_glory_cascade' or 'gods_of_glory_freespins_cascade')
 */
async function handleGodsOfGloryCascade(clientClone, winningMatrix, destroyPositions, cascadeType) {
  // Reset trigger state for cascade processing
  clientClone.nextTrigger = TRIGGER.SPIN;
  
  // Generate new matrix after removing winning symbols
  clientClone.matrix = await generateCascadeMatrix(clientClone, winningMatrix, destroyPositions, cascadeType);
  
  // Handle multiplier symbol replacement if needed (Gods of Glory specific)
  await handleMultiplierSymbolsInCascade(clientClone, cascadeType);
  
  // Check for new anyway pay wins in cascaded matrix
  await anywayPayController.check(clientClone);
  
  // Continue cascading if new wins found
  if (clientClone.nextTrigger === TRIGGER.CASCADE) {
    // Create cascade object to track this cascade step
    const cascadeStepData = createCascadeStepObject(clientClone, 'cluster');
    clientClone.cascade.push(cascadeStepData);
    
    // Recursively handle next cascade
    await handleGodsOfGloryCascade(clientClone, cascadeStepData.matrix, cascadeStepData.destroy, cascadeType);
  }
  else {
    // No more cascades - check for any remaining special symbols
    await handleEndOfCascadeSpecialSymbols(clientClone, cascadeType);
  }
}

/**
 * Handle cascading sequence specifically for free spins
 * Similar to base game but with enhanced multiplier mechanics
 * 
 * @param {Object} clientClone - Cloned client for cascade processing  
 * @param {Array} winningMatrix - Matrix containing winning symbols
 * @param {Array} destroyPositions - Positions of symbols to remove
 * @param {string} cascadeType - Should be 'gods_of_glory_freespins_cascade'
 */
async function handleGodsOfGloryFreeSpinsCascade(clientClone, winningMatrix, destroyPositions, cascadeType) {
  // Reset trigger state
  clientClone.nextTrigger = TRIGGER.SPIN;
  
  // Generate cascade matrix for free spins
  clientClone.matrix = await generateCascadeMatrix(clientClone, winningMatrix, destroyPositions, cascadeType);
  
  // Handle free spins specific multiplier collection
  await handleFreeSpinsMultiplierCollection(clientClone);
  
  // Check for cluster wins
  await cluster_controller.check(clientClone);
  
  // Continue cascading if new wins found
  if (clientClone.nextTrigger === TRIGGER.CASCADE) {
    const cascadeStepData = createCascadeStepObject(clientClone, 'cluster');
    clientClone.cascade.push(cascadeStepData);
    
    // Recursively handle next cascade in free spins
    await handleGodsOfGloryFreeSpinsCascade(clientClone, cascadeStepData.matrix, cascadeStepData.destroy, cascadeType);
  }
}

/**
 * Generate matrix after cascade (remove symbols and drop down)
 * Core cascade mechanic - removes winning symbols and fills gaps
 * 
 * @param {Object} clientClone - Client for processing
 * @param {Array} winningMatrix - Original matrix with winning symbols
 * @param {Array} destroyPositions - Positions to clear
 * @param {string} cascadeType - Type of cascade being processed
 * @return {Array} New matrix after cascade
 */
async function generateCascadeMatrix(clientClone, winningMatrix, destroyPositions, cascadeType) {
  // Remove winning symbols from matrix
  const matrixAfterRemoval = removeWinningSymbolsFromMatrix(winningMatrix, destroyPositions);
  
  // Drop remaining symbols down to fill gaps
  const matrixAfterDrop = dropSymbolsDownToFillGaps(matrixAfterRemoval);
  
  // Fill empty top positions with new symbols
  const finalMatrix = await fillEmptyPositionsWithNewSymbols(clientClone, matrixAfterDrop, cascadeType);
  
  return finalMatrix;
}

/**
 * Remove winning symbols from matrix
 * Replaces winning symbol positions with null placeholders
 * 
 * @param {Array} matrix - Original matrix
 * @param {Array} destroyPositions - Positions to remove
 * @return {Array} Matrix with winning symbols removed (null placeholders)
 */
function removeWinningSymbolsFromMatrix(matrix, destroyPositions) {
  const newMatrix = matrix.map(row => [...row]); // Deep copy
  
  // Replace winning positions with null
  destroyPositions.forEach(position => {
    if (position && position.row !== undefined && position.col !== undefined) {
      newMatrix[position.row][position.col] = null;
    }
  });
  
  return newMatrix;
}

/**
 * Drop symbols down to fill gaps left by removed symbols
 * Simulates gravity effect on remaining symbols
 * 
 * @param {Array} matrix - Matrix with null gaps
 * @return {Array} Matrix after symbols have dropped down
 */
function dropSymbolsDownToFillGaps(matrix) {
  const newMatrix = matrix.map(row => [...row]);
  const rows = newMatrix.length;
  const cols = newMatrix[0].length;
  
  // Process each column independently
  for (let col = 0; col < cols; col++) {
    // Collect non-null symbols from bottom to top
    const symbolsInColumn = [];
    
    for (let row = rows - 1; row >= 0; row--) {
      if (newMatrix[row][col] !== null) {
        symbolsInColumn.push(newMatrix[row][col]);
      }
    }
    
    // Fill column from bottom with existing symbols
    for (let row = rows - 1; row >= 0; row--) {
      if (symbolsInColumn.length > 0) {
        newMatrix[row][col] = symbolsInColumn.shift();
      } else {
        newMatrix[row][col] = null; // Will be filled with new symbols
      }
    }
  }
  
  return newMatrix;
}

/**
 * Fill empty positions with new symbols
 * Generates new symbols for empty positions at top of reels
 * 
 * @param {Object} clientClone - Client for accessing game settings
 * @param {Array} matrix - Matrix after symbols dropped
 * @param {string} cascadeType - Type of cascade for symbol selection
 * @return {Array} Complete matrix with all positions filled
 */
async function fillEmptyPositionsWithNewSymbols(clientClone, matrix, cascadeType) {
  const newMatrix = matrix.map(row => [...row]);
  const rows = newMatrix.length;
  const cols = newMatrix[0].length;
  
  // Determine sequence type based on cascade type
  const sequenceType = cascadeType.includes('freespins') ? 'freespins' : 'basegame';
  
  // Fill null positions with new symbols
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (newMatrix[row][col] === null) {
        // Generate new symbol using matrix controller
        const newSymbol = await generateNewSymbolForPosition(clientClone, row, col, sequenceType);
        newMatrix[row][col] = newSymbol;
      }
    }
  }
  
  return newMatrix;
}

/**
 * Generate new symbol for specific position
 * Uses game sequences to generate appropriate symbols
 * 
 * @param {Object} clientClone - Client for game data
 * @param {number} row - Row position  
 * @param {number} col - Column position
 * @param {string} sequenceType - 'basegame' or 'freespins'
 * @return {string} New symbol for position
 */
async function generateNewSymbolForPosition(clientClone, row, col, sequenceType) {
  // Create temporary single-position matrix to use existing matrix controller
  const tempMatrix = await matrix_controller.make(clientClone, sequenceType, 1);
  
  // Return symbol from corresponding column
  return tempMatrix[0][Math.min(col, tempMatrix[0].length - 1)];
}

/**
 * Handle multiplier symbols during cascade
 * Gods of Glory specific: multipliers can appear during cascades
 * 
 * @param {Object} clientClone - Client for processing
 * @param {string} cascadeType - Type of cascade
 */
async function handleMultiplierSymbolsInCascade(clientClone, cascadeType) {
  // In Gods of Glory, multiplier symbols are handled during win calculation
  // This function could be extended for special cascade-specific multiplier rules
  
  // For now, multipliers are processed in the main simulation flow
  // Future enhancement: Special cascade multiplier mechanics could go here
}

/**
 * Handle free spins specific multiplier collection
 * In free spins, multipliers are collected globally
 * 
 * @param {Object} clientClone - Client for processing
 */
async function handleFreeSpinsMultiplierCollection(clientClone) {
  // Scan matrix for multiplier symbols
  const multiplierSymbols = findMultiplierSymbolsInMatrix(clientClone.matrix);
  
  // In free spins, collect multipliers for global application
  if (multiplierSymbols.length > 0) {
    if (!clientClone.node.context.collectedMultipliers) {
      clientClone.node.context.collectedMultipliers = [];
    }
    
    // Add found multipliers to collection
    clientClone.node.context.collectedMultipliers.push(...multiplierSymbols);
  }
}

/**
 * Handle special symbols at end of cascade sequence
 * Final processing for any remaining special symbols
 * 
 * @param {Object} clientClone - Client for processing
 * @param {string} cascadeType - Type of cascade that just ended
 */
async function handleEndOfCascadeSpecialSymbols(clientClone, cascadeType) {
  // Check if there are any special symbols that need end-of-cascade processing
  // This could include:
  // - Final multiplier collection
  // - Special symbol transformations
  // - Bonus trigger checks
  
  // For Gods of Glory, most special processing happens in main simulation flow
  // This function provides extension point for future features
}

/**
 * Create cascade end object for Gods of Glory
 * Final state object after all cascades complete
 * 
 * @param {Object} clientClone - Client after cascade processing
 */
function createCascadeEndForGodsOfGlory(clientClone) {
  if (clientClone.nextTrigger === TRIGGER.SPIN) {
    const cascadeEndObject = createCascadeStepObject(clientClone, 'cascade_end');
    clientClone.cascade.push(cascadeEndObject);
  }
}

/**
 * Create cascade end object for Gods of Glory free spins
 * Final state for free spins cascade sequence
 * 
 * @param {Object} clientClone - Client after free spins cascade
 */
function createCascadeEndForGodsOfGloryFreeSpins(clientClone) {
  if (clientClone.nextTrigger === TRIGGER.SPIN) {
    const cascadeEndObject = createCascadeStepObject(clientClone, 'freespins_cascade_end');
    clientClone.cascade.push(cascadeEndObject);
    
    // Store any collected multipliers for free spins
    if (clientClone.node.context.collectedMultipliers) {
      cascadeEndObject.collectedMultipliers = [...clientClone.node.context.collectedMultipliers];
    }
  }
}

/**
 * Create cascade step object (follows Wild Quad Squad pattern)
 * Records state and results for each cascade step
 * 
 * @param {Object} clientClone - Client state for this step
 * @param {string} winType - Type of win ('cluster', 'cascade_end', etc.)
 * @return {Object} Cascade step data object
 */
function createCascadeStepObject(clientClone, winType) {
  const cascadeStepData = {};
  
  // Capture win data if present
  let customWin = {};
  if (clientClone.node.context.win) {
    customWin = {
      total: clientClone.node.context.win.total,
      type: clientClone.node.context.win.type,
    };
    
    // Sort win lines by descending win value (following Wild Quad Squad pattern)
    if (clientClone.node.context.win.lines && clientClone.node.context.win.lines.length > 1) {
      clientClone.node.context.win.lines.sort((a, b) => b.win - a.win);
    }
  }
  
  // Build cascade step object based on win type
  switch (winType) {
    case 'cluster':
      cascadeStepData = createClusterCascadeStep(clientClone, customWin);
      break;
      
    case 'cascade_end':
      cascadeStepData = createCascadeEndStep(clientClone, customWin);
      break;
      
    case 'freespins_cascade_end':
      cascadeStepData = createFreeSpinsCascadeEndStep(clientClone, customWin);
      break;
      
    default:
      cascadeStepData = createDefaultCascadeStep(clientClone, customWin, winType);
      break;
  }
  
  // Clean up client clone context after capturing data
  cleanupClientCloneAfterCascadeStep(clientClone);
  
  return cascadeStepData;
}

/**
 * Create cluster cascade step data
 * Records cluster win information for cascade step
 * 
 * @param {Object} clientClone - Client state
 * @param {Object} customWin - Win data
 * @return {Object} Cluster cascade step data
 */
function createClusterCascadeStep(clientClone, customWin) {
  return {
    winType: 'cluster',
    matrix: JSON.parse(JSON.stringify(clientClone.matrix)),
    destroy: clientClone.node.context.destroy ? [...clientClone.node.context.destroy] : [],
    win: customWin,
    lines: clientClone.node.context.win ? {
      map: clientClone.node.context.win.lines ? [...clientClone.node.context.win.lines] : [],
      totalWin: clientClone.node.context.win.total || 0
    } : { map: [], totalWin: 0 },
    spinTotal: clientClone.node.spinTotal || 0,
    clusters: clientClone.node.context.clusters ? [...clientClone.node.context.clusters] : []
  };
}

/**
 * Create cascade end step data
 * Records final state after all cascades complete
 * 
 * @param {Object} clientClone - Client state
 * @param {Object} customWin - Win data  
 * @return {Object} Cascade end step data
 */
function createCascadeEndStep(clientClone, customWin) {
  return {
    winType: 'cascade_end',
    matrix: JSON.parse(JSON.stringify(clientClone.matrix)),
    win: customWin,
    spinTotal: clientClone.node.spinTotal || 0,
    finalMatrix: true // Indicates this is the final matrix state
  };
}

/**
 * Create free spins cascade end step data
 * Records final state for free spins cascade sequence
 * 
 * @param {Object} clientClone - Client state
 * @param {Object} customWin - Win data
 * @return {Object} Free spins cascade end data
 */
function createFreeSpinsCascadeEndStep(clientClone, customWin) {
  const endStep = createCascadeEndStep(clientClone, customWin);
  endStep.winType = 'freespins_cascade_end';
  endStep.isFreeSpins = true;
  
  // Include collected multipliers for free spins
  if (clientClone.node.context.collectedMultipliers) {
    endStep.collectedMultipliers = [...clientClone.node.context.collectedMultipliers];
  }
  
  return endStep;
}

/**
 * Create default cascade step data
 * Fallback for unspecified win types
 * 
 * @param {Object} clientClone - Client state
 * @param {Object} customWin - Win data
 * @param {string} winType - Type of win
 * @return {Object} Default cascade step data
 */
function createDefaultCascadeStep(clientClone, customWin, winType) {
  return {
    winType: winType,
    matrix: JSON.parse(JSON.stringify(clientClone.matrix)),
    win: customWin,
    spinTotal: clientClone.node.spinTotal || 0
  };
}

/**
 * Clean up client clone context after cascade step
 * Removes processed data to prepare for next step
 * 
 * @param {Object} clientClone - Client to clean up
 */
function cleanupClientCloneAfterCascadeStep(clientClone) {
  // Clear processed data (following Wild Quad Squad pattern)
  delete clientClone.context.destroy;
  delete clientClone.context.matrix;
  delete clientClone.context.win;
  delete clientClone.matrix;
  
  // Preserve free spins context if it exists
  const preservedFreeSpins = clientClone.node.context.freespins ? 
    JSON.parse(JSON.stringify(clientClone.node.context.freespins)) : null;
  
  // Reset node context
  clientClone.node.context = {};
  
  // Restore free spins context if it existed
  if (preservedFreeSpins) {
    clientClone.node.context.freespins = preservedFreeSpins;
  }
}

/**
 * Find multiplier symbols in matrix
 * Utility function to locate multiplier symbols
 * 
 * @param {Array} matrix - Matrix to scan
 * @return {Array} Array of multiplier values found
 */
function findMultiplierSymbolsInMatrix(matrix) {
  const multipliers = [];
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === 'MULTIPLIER') {
        // Generate random multiplier value (simplified for cascade)
        const multiplierValue = generateRandomMultiplierValue();
        multipliers.push(multiplierValue);
      }
    }
  }
  
  return multipliers;
}

/**
 * Generate random multiplier value
 * Simplified multiplier generation for cascade processing
 * 
 * @return {number} Random multiplier value
 */
function generateRandomMultiplierValue() {
  const possibleValues = [2, 3, 4, 5, 8, 10, 15, 20, 25, 50, 100, 250, 500];
  const weights = [25, 20, 15, 12, 10, 8, 5, 3, 1.5, 0.4, 0.08, 0.02, 0.005];
  
  const weightedPool = [];
  possibleValues.forEach((value, index) => {
    const weight = Math.round(weights[index] * 100);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(value);
    }
  });
  
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex] || 2;
}

// Export functions following Wild Quad Squad pattern
module.exports = {
  handleGodsOfGloryCascade,
  handleGodsOfGloryFreeSpinsCascade, 
  createCascadeEndForGodsOfGlory,
  createCascadeEndForGodsOfGloryFreeSpins,
  generateCascadeMatrix,
  createCascadeStepObject
};