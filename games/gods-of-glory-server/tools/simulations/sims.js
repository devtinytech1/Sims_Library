/**
 * Gods of Glory - Main Simulation Engine
 * 
 * This file orchestrates the high-level simulation flow for the Gods of Glory game,
 * which is a Gates of Olympus style slot with anyway pay and cascading reels.
 * 
 * Main Features:
 * - 6x5 grid with anyway pay mechanics (8+ symbols anywhere on grid)
 * - Cascading/Tumbling reels after wins
 * - Multiplier symbols (2x to 500x)
 * - Free spins bonus (4+ scatters = 15 free spins)
 * - Comprehensive RTP tracking and logging
 */

const baseSettings = require('../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const anywayPay = require('../../src/game/runner/controllers/anyway_pay_controller');
const { round } = require('../../../../src/utils/math.cjs');
const features = require('./features/features.js');

// Cascade mechanics - following Wild Quad Squad pattern
const { handleGodsOfGloryCascade, createCascadeEndForGodsOfGlory } = require('./cascade.js');

// Feature checks
const { checkForScatterBonusTrigger } = require('./features/scatters_feature.js');
const { checkForMultiplierSymbolsAndApply } = require('./features/multiplier_feature.js');

// Logging system
const { logRoundStats } = require('./Log Files/logRTPData.js');
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('./Log Files/logBGData.js');
const { handleFGWinsData, logNoWinFSFeatureFrequency } = require('./Log Files/logFGData.js');
const { handleTumbleWinsData, logNoWinTumbleFeatureFrequency } = require('./Log Files/logTumbleData.js');
const { handleMultiplierWinsData, logNoWinMultiplierFeatureFrequency } = require('./Log Files/logMultiplierData.js');

// Prototype mode
const { startPrototypeModeForGodsOfGlory } = require('./prototype_mode.js');

// Global counters for tracking simulation statistics
let totalBaseGameWin = 0;
let totalFreeSpinsWin = 0; 
let totalCascadeWin = 0;
let totalMultiplierWin = 0;
let totalSpins = 0;

// Feature trigger counters
let freeSpinTriggerCount = 0;
let cascadeTriggerCount = 0;
let multiplierTriggerCount = 0;

/**
 * Main simulation execution function
 * Runs 1 million spins and tracks all game statistics
 * 
 * @param {Object} client - Mock client object containing game state
 */
async function execute(client) {
  console.log("Gods of Glory simulation started");
  
  initializeClientForSimulation(client);
  const gameSettings = baseSettings.get(client.gameId);
  
  // Run main simulation loop
  for (let spinNumber = 0; spinNumber < 1000000; spinNumber++) {
    totalSpins++;
    await playCompleteSpin(client, gameSettings);
    
    // Log progress and statistics every 1000 spins
    if ((spinNumber + 1) % 1000 === 0) {
      logProgressAndStatistics(spinNumber + 1, client);
    }
  }
  
  // Log final simulation results
  logFinalSimulationResults(client);
  console.log("Gods of Glory simulation completed");
}

/**
 * Initialize client object with proper state for simulation
 * Sets up all necessary counters and context objects
 * 
 * @param {Object} client - Client object to initialize
 */
function initializeClientForSimulation(client) {
  client.roundBet = client.node.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
  
  // Initialize simulation tracking context
  client.context = {
    totalBaseGameWin: 0,
    totalCascadeWin: 0,
    totalFreeGameWin: 0,
    totalMultiplierWin: 0,
    isCascade: false,
    cascadeCount: 0
  };
  
  features.init(client);
}

/**
 * Play a complete spin including all cascades and features
 * This is the main game round function that handles the entire spin lifecycle
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration settings
 */
async function playCompleteSpin(client, gameSettings) {
  // Reset state for new spin
  resetClientStateForNewSpin(client);
  
  // Generate initial matrix and check for immediate features
  await generateInitialMatrixAndCheckFeatures(client, gameSettings);
  
  // Handle cascading mechanics if triggered
  if (client.nextTrigger === TRIGGER.CASCADE) {
    await handleCascadingSequence(client, gameSettings);
  }
  
  // Check for bonus features (free spins)
  await checkForBonusFeatureTriggers(client, gameSettings);
  
  // Calculate and apply multipliers
  await calculateAndApplyMultipliers(client, gameSettings);
  
  // Handle free spins if triggered
  await handleFreeSpinsIfTriggered(client, gameSettings);
  
  // Finalize round and update totals
  finalizeSpinAndUpdateTotals(client);
}

/**
 * Reset client state for a new spin
 * Clears previous spin data while maintaining session totals
 * 
 * @param {Object} client - Client object to reset
 */
function resetClientStateForNewSpin(client) {
  client.context.isCascade = false;
  client.context.cascadeCount = 0;
  client.cascade = [];
  client.cascade_end_matrix = [];
  
  // Clear previous spin context
  if (client.node.context.win !== undefined) {
    delete client.node.context.win;
  }
  if (client.node.context.destroy !== undefined) {
    delete client.node.context.destroy;
  }
  
  // Reset round-specific features
  features.init(client);
}

/**
 * Generate initial 6x5 matrix and check for cluster wins
 * This creates the starting position for each spin
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function generateInitialMatrixAndCheckFeatures(client, gameSettings) {
  // Create 6x5 matrix using base game sequences
  client.matrix = await matrix.make(client, gameSettings.reelsSet.sequenceMap.basegame, gameSettings.base.rows);
  
  // Check for anyway pay wins (8+ symbols anywhere)
  await anywayPay.check(client);
  
  // Track base game wins
  if (client.node.context.win && client.node.context.win.total > 0) {
    const baseWin = client.node.context.win.total;
    totalBaseGameWin += baseWin;
    client.context.totalBaseGameWin += baseWin;
    await handleBGWinsData(baseWin);
  }
}

/**
 * Handle the complete cascading sequence
 * Continues cascading until no more wins occur
 * 
 * @param {Object} client - Game client object  
 * @param {Object} gameSettings - Game configuration
 */
async function handleCascadingSequence(client, gameSettings) {
  client.context.isCascade = true;
  cascadeTriggerCount++;
  
  // Create deep copies for cascade processing
  const originalMatrix = JSON.parse(JSON.stringify(client.matrix));
  const destroyPositions = JSON.parse(JSON.stringify(client.node.context.destroy));
  const clientCloneForCascade = createClientCloneForCascadeProcessing(client);
  
  // Process cascades using Wild Quad Squad pattern
  await handleGodsOfGloryCascade(clientCloneForCascade, originalMatrix, destroyPositions, 'gods_of_glory_cascade');
  
  // Apply cascade results back to main client
  applyCascadeResultsToMainClient(client, clientCloneForCascade);
  
  // Create final cascade state
  createCascadeEndForGodsOfGlory(clientCloneForCascade);
  client.cascade_end_matrix = JSON.parse(JSON.stringify(clientCloneForCascade.matrix));
}

/**
 * Check for bonus feature triggers (scatter symbols for free spins)
 * Scans final matrix state for feature activation
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function checkForBonusFeatureTriggers(client, gameSettings) {
  const matrixToCheck = client.context.isCascade ? client.cascade_end_matrix : client.matrix;
  
  // Check for free spins trigger (4+ scatter symbols)
  const freeSpinsTriggered = await checkForScatterBonusTrigger(client, matrixToCheck, gameSettings.features.freespins);
  
  if (freeSpinsTriggered) {
    freeSpinTriggerCount++;
    // Free spins will be processed in separate function
  }
}

/**
 * Calculate and apply multiplier effects
 * Handles multiplier symbols found in the matrix
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function calculateAndApplyMultipliers(client, gameSettings) {
  const matrixToCheck = client.context.isCascade ? client.cascade_end_matrix : client.matrix;
  
  const multiplierData = await checkForMultiplierSymbolsAndApply(client, matrixToCheck, gameSettings);
  
  if (multiplierData.hasMultipliers) {
    multiplierTriggerCount++;
    const multiplierWin = multiplierData.additionalWin;
    totalMultiplierWin += multiplierWin;
    client.context.totalMultiplierWin += multiplierWin;
    await handleMultiplierWinsData(multiplierWin);
  }
}

/**
 * Handle free spins bonus round if triggered
 * Processes the complete free spins sequence
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration  
 */
async function handleFreeSpinsIfTriggered(client, gameSettings) {
  if (client.node.context.freespins && client.node.context.freespins.triggered) {
    await processFreeSpinsBonus(client, gameSettings);
  }
}

/**
 * Process the complete free spins bonus
 * Handles all 15 free spins with enhanced multiplier behavior
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function processFreeSpinsBonus(client, gameSettings) {
  const freeSpinsCount = gameSettings.features.freespins.spinsAwarded;
  let totalFreeSpinWin = 0;
  
  // Initialize free spins context
  initializeFreeSpinsContext(client, freeSpinsCount);
  
  // Play each free spin
  for (let freeSpinNumber = 0; freeSpinNumber < freeSpinsCount; freeSpinNumber++) {
    const freeSpinWin = await playOneFreeSpinWithCascades(client, gameSettings);
    totalFreeSpinWin += freeSpinWin;
  }
  
  // Record free spins results
  recordFreeSpinsResults(client, totalFreeSpinWin);
}

/**
 * Play one free spin with cascading mechanics
 * Similar to base game but with enhanced multiplier collection
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 * @return {number} Total win for this free spin
 */
async function playOneFreeSpinWithCascades(client, gameSettings) {
  // Generate matrix for free spin
  const freeSpinMatrix = await matrix.make(client, gameSettings.reelsSet.sequenceMap.freespins || gameSettings.reelsSet.sequenceMap.basegame, gameSettings.base.rows);
  
  // Check for wins
  const tempClient = createTempClientForFreeSpinCalculation(client, freeSpinMatrix);
  await anywayPay.check(tempClient);
  
  let freeSpinWin = tempClient.node.context.win ? tempClient.node.context.win.total : 0;
  
  // Handle cascades in free spins if wins occurred
  if (tempClient.nextTrigger === TRIGGER.CASCADE) {
    freeSpinWin += await handleFreeSpinCascades(tempClient, gameSettings);
  }
  
  // Apply collected multipliers in free spins (global application)
  freeSpinWin = applyGlobalMultipliersInFreeSpins(tempClient, freeSpinWin, gameSettings);
  
  return freeSpinWin;
}

/**
 * Finalize the spin and update all totals
 * Updates session statistics and prepares for next spin
 * 
 * @param {Object} client - Game client object
 */
function finalizeSpinAndUpdateTotals(client) {
  // Apply win cap if necessary
  applyWinCapLimits(client);
  
  // Update cascade totals if cascades occurred
  if (client.context.isCascade && client.cascade && client.cascade.length > 0) {
    updateCascadeWinTotals(client);
  }
  
  // Reset client state for next spin
  client.nextTrigger = TRIGGER.SPIN;
}

/**
 * Log progress and statistics every 1000 spins
 * Provides regular updates on simulation progress
 * 
 * @param {number} currentSpin - Current spin number
 * @param {Object} client - Game client object
 */
function logProgressAndStatistics(currentSpin, client) {
  const totalFeatureWin = totalCascadeWin + totalMultiplierWin;
  
  logRoundStats(currentSpin, client.node.spinBet, totalBaseGameWin, totalFreeSpinsWin, totalFeatureWin);
  logNoWinNoFeatureFrequency(currentSpin, client.node.spinBet, totalSpins);
}

/**
 * Log final simulation results and feature frequencies
 * Outputs comprehensive statistics at simulation end
 * 
 * @param {Object} client - Game client object
 */
function logFinalSimulationResults(client) {
  console.log('=== FINAL SIMULATION RESULTS ===');
  console.log('FREE SPINS TRIGGERED COUNT:', freeSpinTriggerCount);
  console.log('CASCADE TRIGGERED COUNT:', cascadeTriggerCount);
  console.log('MULTIPLIER TRIGGERED COUNT:', multiplierTriggerCount);
  
  // Log feature frequencies
  logNoWinFSFeatureFrequency(freeSpinTriggerCount, client.node.spinBet, totalSpins);
  logNoWinTumbleFeatureFrequency(cascadeTriggerCount, client.node.spinBet, totalSpins);
  logNoWinMultiplierFeatureFrequency(multiplierTriggerCount, client.node.spinBet, totalSpins);
}

// Utility functions for client management and calculations

/**
 * Create a deep clone of client for cascade processing
 * Similar to Wild Quad Squad createClientClone pattern
 * 
 * @param {Object} client - Original client object
 * @return {Object} Cloned client for cascade processing
 */
function createClientCloneForCascadeProcessing(client) {
  const clientClone = JSON.parse(JSON.stringify(client));
  
  clientClone.nextTrigger = TRIGGER.SPIN;
  clientClone.cascade = [];
  
  // Add utility functions for cascade processing
  clientClone.addSpinTotal = (value) => {
    if (value) {
      const finalValue = clientClone.node.spinTotal + value;
      clientClone.node.spinTotal = round(finalValue);
      clientClone.totalWin = value;
    }
    return value;
  };
  
  clientClone.setGameRoundOver = () => clientClone.gameRoundOver = true;
  
  // Clean up context for cascade processing
  delete clientClone.context.destroy;
  delete clientClone.context.matrix;
  delete clientClone.context.win;
  delete clientClone.matrix;
  clientClone.node.context = {};
  
  return clientClone;
}

/**
 * Apply cascade results back to main client
 * Transfers cascade processing results to main game state
 * 
 * @param {Object} mainClient - Main game client
 * @param {Object} cascadeClient - Client used for cascade processing
 */
function applyCascadeResultsToMainClient(mainClient, cascadeClient) {
  mainClient.node.spinTotal = cascadeClient.node.spinTotal;
  mainClient.totalWin = cascadeClient.node.spinTotal;
  mainClient.cascade = cascadeClient.cascade;
  
  // Update cascade win tracking
  if (cascadeClient.node.spinTotal > 0) {
    totalCascadeWin += cascadeClient.node.spinTotal;
    mainClient.context.totalCascadeWin += cascadeClient.node.spinTotal;
  }
}

/**
 * Apply win cap limits to prevent excessive payouts
 * Ensures wins don't exceed maximum allowed amounts
 * 
 * @param {Object} client - Game client object
 */
function applyWinCapLimits(client) {
  const winCapLimit = round(client.winCap * client.betMultiplier);
  
  if (client.node.spinTotal >= winCapLimit) {
    client.node.spinTotal = winCapLimit;
  }
  
  if (client.node.context.win && client.node.context.win.total >= winCapLimit) {
    client.node.context.win.total = winCapLimit;
  }
}

/**
 * Update cascade win totals from cascade array
 * Processes all cascade wins and adds to totals
 * 
 * @param {Object} client - Game client object
 */
function updateCascadeWinTotals(client) {
  if (client.cascade && client.cascade.length > 0) {
    client.cascade.forEach(cascadeStep => {
      if (cascadeStep.lines && cascadeStep.lines.totalWin > 0) {
        // Cascade wins are already included in totalCascadeWin from applyCascadeResultsToMainClient
        // This is just for additional tracking if needed
      }
    });
  }
}

/**
 * Initialize free spins context
 * Sets up tracking for free spins bonus
 * 
 * @param {Object} client - Game client object  
 * @param {number} freeSpinsCount - Number of free spins awarded
 */
function initializeFreeSpinsContext(client, freeSpinsCount) {
  if (!client.node.context.freespins) {
    client.node.context.freespins = {};
  }
  
  client.node.context.freespins.remaining = freeSpinsCount;
  client.node.context.freespins.totalWin = 0;
  client.node.context.freespins.collectedMultipliers = [];
}

/**
 * Record free spins results
 * Updates totals and logs free spins completion
 * 
 * @param {Object} client - Game client object
 * @param {number} totalFreeSpinWin - Total win from free spins
 */
async function recordFreeSpinsResults(client, totalFreeSpinWin) {
  if (totalFreeSpinWin > 0) {
    totalFreeSpinsWin += totalFreeSpinWin;
    client.context.totalFreeGameWin += totalFreeSpinWin;
    await handleFGWinsData(totalFreeSpinWin);
  }
  
  // Reset free spins context
  client.node.context.freespins = { triggered: false, totalWin: 0 };
}

/**
 * Create temporary client for free spin calculation
 * Used to calculate wins without affecting main client
 * 
 * @param {Object} mainClient - Main game client
 * @param {Array} freeSpinMatrix - Matrix for the free spin
 * @return {Object} Temporary client for calculations
 */
function createTempClientForFreeSpinCalculation(mainClient, freeSpinMatrix) {
  const tempClient = JSON.parse(JSON.stringify(mainClient));
  tempClient.matrix = freeSpinMatrix;
  tempClient.node.context = {};
  return tempClient;
}

/**
 * Handle cascades in free spins
 * Process cascading wins during free spins bonus
 * 
 * @param {Object} tempClient - Temporary client for free spin
 * @param {Object} gameSettings - Game configuration
 * @return {number} Additional win from cascades
 */
async function handleFreeSpinCascades(tempClient, gameSettings) {
  // Similar to base game cascades but in free spins context
  // This would follow the same pattern as handleCascadingSequence
  // but with free spins specific rules
  
  let additionalWin = 0;
  // Implementation would go here following cascade pattern
  return additionalWin;
}

/**
 * Apply global multipliers in free spins
 * In Gates of Olympus, free spins collect multipliers globally
 * 
 * @param {Object} tempClient - Temporary client
 * @param {number} baseWin - Base win amount
 * @param {Object} gameSettings - Game configuration
 * @return {number} Win amount after multiplier application
 */
function applyGlobalMultipliersInFreeSpins(tempClient, baseWin, gameSettings) {
  // In free spins, multipliers are collected and applied globally
  // This is a key difference from base game behavior
  
  // Check for multiplier symbols in current matrix
  const multipliers = findMultiplierSymbolsInMatrix(tempClient.matrix, gameSettings);
  
  if (multipliers.length > 0) {
    // Add to collected multipliers for the session
    const totalMultiplier = 1 + multipliers.reduce((sum, mult) => sum + mult, 0);
    return baseWin * totalMultiplier;
  }
  
  return baseWin;
}

/**
 * Find multiplier symbols in matrix
 * Scans matrix for multiplier symbols and returns their values
 * 
 * @param {Array} matrix - Game matrix to scan
 * @param {Object} gameSettings - Game configuration
 * @return {Array} Array of multiplier values found
 */
function findMultiplierSymbolsInMatrix(matrix, gameSettings) {
  const multipliers = [];
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === gameSettings.symbols.multiplier) {
        // Generate multiplier value
        const multiplierValue = generateRandomMultiplierValue(gameSettings.multiplierWeights);
        multipliers.push(multiplierValue);
      }
    }
  }
  
  return multipliers;
}

/**
 * Generate random multiplier value based on weights
 * Creates weighted random multiplier values
 * 
 * @param {Array} multiplierWeights - Weight configuration for multipliers
 * @return {number} Generated multiplier value
 */
function generateRandomMultiplierValue(multiplierWeights) {
  const weightedPool = [];
  
  multiplierWeights.forEach(item => {
    const weight = Math.round(item.weight * 100);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(item.value);
    }
  });
  
  if (weightedPool.length === 0) {
    return 2; // Default minimum multiplier
  }
  
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}

module.exports = { execute };