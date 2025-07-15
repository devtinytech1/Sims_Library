/**
 * Gods of Glory - Prototype Mode Controller
 * 
 * Interactive prototype mode for game designers to validate mechanics and player experience.
 * Features colorized console display, detailed payout breakdown, and step-by-step gameplay.
 * 
 * Designer Features:
 * - Visual matrix display with colorized symbols
 * - Detailed anyway pay and payout information
 * - Cascade step-by-step visualization
 * - Interactive gameplay (press Enter for next spin)
 * - Comprehensive game state information
 * - Feature trigger tracking and display
 */

const readline = require('readline');
const baseSettings = require('../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const anywayPay = require('../../src/game/runner/controllers/anyway_pay_controller');
const features = require('./features/features.js');

// Cascade mechanics
const { handleGodsOfGloryCascade, createCascadeEndForGodsOfGlory } = require('./cascade.js');

// Feature checks
const { checkForScatterBonusTrigger } = require('./features/scatters_feature.js');
const { checkForMultiplierSymbolsAndApply } = require('./features/multiplier_feature.js');

// Enhanced statistics tracking
const { PrototypeStatisticsTracker } = require('./prototype_stats.js');

// ANSI color codes for console styling
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  
  // Symbol colors
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  
  // Background colors
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',
  
  // Special formatting
  UNDERLINE: '\x1b[4m',
  BLINK: '\x1b[5m'
};

// Symbol display configuration with colors and short names
const SYMBOL_DISPLAY = {
  // High paying symbols
  'ZEUS': { name: 'ZEU', color: COLORS.YELLOW + COLORS.BRIGHT, bg: '' },
  'CHALICE': { name: 'CHL', color: COLORS.BLUE + COLORS.BRIGHT, bg: '' },
  'RING': { name: 'RNG', color: COLORS.MAGENTA + COLORS.BRIGHT, bg: '' },
  'COIN': { name: 'CON', color: COLORS.CYAN + COLORS.BRIGHT, bg: '' },
  // Low paying symbols (gems)
  'BLUE_GEM': { name: 'BGM', color: COLORS.BLUE, bg: '' },
  'GREEN_GEM': { name: 'GGM', color: COLORS.GREEN, bg: '' },
  'RED_GEM': { name: 'RGM', color: COLORS.RED, bg: '' },
  'PURPLE_GEM': { name: 'PGM', color: COLORS.MAGENTA, bg: '' },
  'YELLOW_GEM': { name: 'YGM', color: COLORS.YELLOW, bg: '' },
  // Special symbols
  'SCATTER': { name: 'SCT', color: COLORS.GREEN + COLORS.BRIGHT, bg: COLORS.BG_GREEN },
  'MULTIPLIER': { name: 'MUL', color: COLORS.RED + COLORS.BRIGHT, bg: COLORS.BG_RED },
  'WILD': { name: 'WLD', color: COLORS.YELLOW + COLORS.BRIGHT, bg: COLORS.BG_YELLOW },
  // Legacy support for H1-H4, L1-L5 format (in case used elsewhere)
  'H1': { name: 'ZEU', color: COLORS.YELLOW + COLORS.BRIGHT, bg: '' },
  'H2': { name: 'CHL', color: COLORS.BLUE + COLORS.BRIGHT, bg: '' },
  'H3': { name: 'RNG', color: COLORS.MAGENTA + COLORS.BRIGHT, bg: '' },
  'H4': { name: 'CON', color: COLORS.CYAN + COLORS.BRIGHT, bg: '' },
  'L1': { name: 'BGM', color: COLORS.BLUE, bg: '' },
  'L2': { name: 'GGM', color: COLORS.GREEN, bg: '' },
  'L3': { name: 'RGM', color: COLORS.RED, bg: '' },
  'L4': { name: 'PGM', color: COLORS.MAGENTA, bg: '' },
  'L5': { name: 'YGM', color: COLORS.YELLOW, bg: '' }
};

// Global prototype state and statistics tracker
let prototypeState = {
  totalSpins: 0,
  totalWin: 0,
  totalBet: 0,
  featuresTriggered: {
    freeSpins: 0,
    cascades: 0,
    multipliers: 0
  },
  bigWins: [],
  lastSpinDetails: null
};

// Enhanced statistics tracker
let statsTracker = new PrototypeStatisticsTracker();

/**
 * Start prototype mode for Gods of Glory
 * Main entry point for interactive prototype gameplay
 * 
 * @param {Object} client - Game client object
 */
async function startPrototypeModeForGodsOfGlory(client) {
  console.clear();
  displayPrototypeModeWelcome();
  
  initializePrototypeModeClient(client);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n' + COLORS.CYAN + 'Press ENTER to start your first spin...' + COLORS.RESET);
  
  // Interactive gameplay loop
  await startInteractiveGameplayLoop(client, rl);
}

/**
 * Display prototype mode welcome screen
 * Shows designer instructions and controls
 */
function displayPrototypeModeWelcome() {
  console.log(COLORS.YELLOW + COLORS.BRIGHT + '╔══════════════════════════════════════════════════════════╗');
  console.log('║              GODS OF GLORY - PROTOTYPE MODE              ║');
  console.log('╚══════════════════════════════════════════════════════════╝' + COLORS.RESET);
  console.log(COLORS.CYAN + '\nDesigner Controls:');
  console.log('• Press ENTER: Next spin');
  console.log('• Type "stats": View session statistics');
  console.log('• Type "help": Show commands');
  console.log('• Type "quit": Exit prototype mode' + COLORS.RESET);
  
  console.log(COLORS.YELLOW + '\nSymbol Legend:');
  Object.entries(SYMBOL_DISPLAY).forEach(([symbol, config]) => {
    console.log(`${config.color}${config.bg} ${config.name} ${COLORS.RESET} = ${symbol}`);
  });
}

/**
 * Initialize client for prototype mode
 * Sets up client with prototype-specific configuration
 * 
 * @param {Object} client - Game client object
 */
function initializePrototypeModeClient(client) {
  client.roundBet = client.spinBet || 1.00;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
  
  // Initialize prototype context
  client.prototypeMode = true;
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
 * Start interactive gameplay loop
 * Handles user input and spin processing
 * 
 * @param {Object} client - Game client object
 * @param {Object} rl - Readline interface
 */
async function startInteractiveGameplayLoop(client, rl) {
  let gameRunning = true;
  
  while (gameRunning) {
    const userInput = await waitForUserInput(rl);
    
    switch (userInput.toLowerCase().trim()) {
      case '':
      case 'spin':
        await processPrototypeSpinWithDetailedDisplay(client);
        break;
        
      case 'stats':
        displayDetailedPrototypeStatistics();
        break;
        
      case 'help':
        displayPrototypeHelpInformation();
        break;
        
      case 'quit':
      case 'exit':
        gameRunning = false;
        displayPrototypeSessionSummary();
        break;
        
      default:
        console.log(COLORS.RED + 'Unknown command. Type "help" for available commands.' + COLORS.RESET);
    }
    
    if (gameRunning) {
      console.log('\n' + COLORS.CYAN + 'Press ENTER for next spin (or type command)...' + COLORS.RESET);
    }
  }
  
  rl.close();
}

/**
 * Wait for user input with promise
 * Promisified readline for async/await usage
 * 
 * @param {Object} rl - Readline interface
 * @return {Promise<string>} User input
 */
function waitForUserInput(rl) {
  return new Promise((resolve) => {
    rl.question('> ', (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Process prototype spin with detailed display
 * Main spin processing with comprehensive visualization
 * 
 * @param {Object} client - Game client object
 */
async function processPrototypeSpinWithDetailedDisplay(client) {
  console.clear();
  
  prototypeState.totalSpins++;
  prototypeState.totalBet += client.roundBet;
  
  displaySpinHeader(prototypeState.totalSpins, client.roundBet);
  
  // Reset client state for new spin
  resetClientStateForPrototypeSpin(client);
  
  const gameSettings = baseSettings.get(client.gameId);
  
  // Generate and display initial matrix
  await generateAndDisplayInitialMatrix(client, gameSettings);
  
  // Check for wins and display results
  const initialWinResults = await checkInitialWinsAndDisplayResults(client, gameSettings);
  
  // Handle cascades if triggered
  if (client.nextTrigger === TRIGGER.CASCADE) {
    await handleAndDisplayCascadeSequence(client, gameSettings);
  }
  
  // Check for bonus features
  await checkAndDisplayBonusFeatures(client, gameSettings);
  
  // Calculate and display final results
  calculateAndDisplayFinalSpinResults(client, initialWinResults);
  
  // Store spin details for statistics
  storeSpinDetailsForStatistics(client);
}

/**
 * Display spin header with spin number and bet
 * Shows current spin information
 * 
 * @param {number} spinNumber - Current spin number
 * @param {number} betAmount - Bet amount for this spin
 */
function displaySpinHeader(spinNumber, betAmount) {
  console.log(COLORS.YELLOW + COLORS.BRIGHT + '═══════════════════════════════════════════════════════════');
  console.log(`                    SPIN #${spinNumber} - BET: $${betAmount.toFixed(2)}`);
  console.log('═══════════════════════════════════════════════════════════' + COLORS.RESET);
}

/**
 * Reset client state for prototype spin
 * Clears previous spin data
 * 
 * @param {Object} client - Game client object
 */
function resetClientStateForPrototypeSpin(client) {
  client.context.isCascade = false;
  client.context.cascadeCount = 0;
  client.cascade = [];
  client.cascade_end_matrix = [];
  
  if (client.node.context.win !== undefined) {
    delete client.node.context.win;
  }
  if (client.node.context.destroy !== undefined) {
    delete client.node.context.destroy;
  }
  
  features.init(client);
}

/**
 * Generate and display initial matrix
 * Creates and shows the starting 6x5 matrix
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function generateAndDisplayInitialMatrix(client, gameSettings) {
  console.log(COLORS.CYAN + COLORS.BRIGHT + '\n🎰 INITIAL MATRIX:' + COLORS.RESET);
  
  client.matrix = await matrix.make(client, gameSettings.reelsSet.sequenceMap.basegame, gameSettings.base.rows);
  
  displayColorizedMatrix(client.matrix, 'Initial Spin');
}

/**
 * Check initial wins and display results
 * Evaluates cluster wins and shows detailed breakdown
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 * @return {Object} Initial win results
 */
async function checkInitialWinsAndDisplayResults(client, gameSettings) {
  await anywayPay.check(client);
  
  const winResults = {
    hasWins: client.node.context.win && client.node.context.win.total > 0,
    totalWin: client.node.context.win ? client.node.context.win.total : 0,
    clusters: client.node.context.clusters || []
  };
  
  if (winResults.hasWins) {
    displayWinInformation(winResults, 'Base Game Win');
    displayClusterBreakdown(winResults.clusters, client.roundBet);
  } else {
    console.log(COLORS.DIM + '\n❌ No anyway pay wins found' + COLORS.RESET);
  }
  
  return winResults;
}

/**
 * Handle and display cascade sequence
 * Processes cascades with step-by-step visualization
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function handleAndDisplayCascadeSequence(client, gameSettings) {
  console.log(COLORS.MAGENTA + COLORS.BRIGHT + '\n🌊 CASCADING REELS TRIGGERED!' + COLORS.RESET);
  
  prototypeState.featuresTriggered.cascades++;
  client.context.isCascade = true;
  
  const originalMatrix = JSON.parse(JSON.stringify(client.matrix));
  const destroyPositions = JSON.parse(JSON.stringify(client.node.context.destroy));
  const clientCloneForCascade = createClientCloneForCascadeProcessing(client);
  
  await handleGodsOfGloryCascade(clientCloneForCascade, originalMatrix, destroyPositions, 'gods_of_glory_cascade');
  
  // Display each cascade step
  displayCascadeSequenceSteps(clientCloneForCascade.cascade);
  
  // Apply results back to main client
  applyCascadeResultsToMainClient(client, clientCloneForCascade);
  
  createCascadeEndForGodsOfGlory(clientCloneForCascade);
  client.cascade_end_matrix = JSON.parse(JSON.stringify(clientCloneForCascade.matrix));
}

/**
 * Display cascade sequence steps
 * Shows each cascade step with matrix and wins
 * 
 * @param {Array} cascadeSteps - Array of cascade step data
 */
function displayCascadeSequenceSteps(cascadeSteps) {
  cascadeSteps.forEach((step, index) => {
    if (step.winType === 'cluster') {
      console.log(COLORS.YELLOW + `\n🎯 CASCADE STEP ${index + 1}:` + COLORS.RESET);
      displayColorizedMatrix(step.matrix, `Cascade ${index + 1}`);
      
      if (step.lines && step.lines.totalWin > 0) {
        console.log(COLORS.GREEN + `💰 Cascade Win: $${step.lines.totalWin.toFixed(2)}` + COLORS.RESET);
      }
    }
  });
}

/**
 * Check and display bonus features
 * Evaluates scatter and multiplier features
 * 
 * @param {Object} client - Game client object
 * @param {Object} gameSettings - Game configuration
 */
async function checkAndDisplayBonusFeatures(client, gameSettings) {
  const matrixToCheck = client.context.isCascade ? client.cascade_end_matrix : client.matrix;
  
  // Check for free spins trigger
  const freeSpinsTriggered = await checkForScatterBonusTrigger(client, matrixToCheck, gameSettings.features.freespins);
  
  if (freeSpinsTriggered) {
    prototypeState.featuresTriggered.freeSpins++;
    displayFreeSpinsTriggerInfo(client);
  }
  
  // Check for multipliers
  const multiplierData = await checkForMultiplierSymbolsAndApply(client, matrixToCheck, gameSettings);
  
  if (multiplierData.hasMultipliers) {
    prototypeState.featuresTriggered.multipliers++;
    displayMultiplierInfo(multiplierData);
  }
}

/**
 * Display win information
 * Shows detailed win breakdown
 * 
 * @param {Object} winResults - Win results data
 * @param {string} winType - Type of win (e.g., "Base Game Win")
 */
function displayWinInformation(winResults, winType) {
  console.log(COLORS.GREEN + COLORS.BRIGHT + `\n💰 ${winType.toUpperCase()}:` + COLORS.RESET);
  console.log(COLORS.GREEN + `Total Win: $${winResults.totalWin.toFixed(2)}` + COLORS.RESET);
  console.log(COLORS.CYAN + `Anyway Pays Found: ${winResults.clusters.length}` + COLORS.RESET);
}

/**
 * Display anyway pay breakdown
 * Shows detailed information for each anyway pay
 * 
 * @param {Array} anywayPays - Array of anyway pay data
 * @param {number} betAmount - Current bet amount
 */
function displayAnywayPayBreakdown(anywayPays, betAmount) {
  console.log(COLORS.CYAN + '\n📊 ANYWAY PAY BREAKDOWN:' + COLORS.RESET);
  
  anywayPays.forEach((anywayPay, index) => {
    const symbol = anywayPay.symbol;
    const count = anywayPay.symbolCount || anywayPay.count;
    const tier = anywayPay.payTier;
    const payout = anywayPay.payout || 0;
    const symbolDisplay = SYMBOL_DISPLAY[symbol] || { name: symbol, color: COLORS.WHITE, bg: '' };
    
    console.log(
      `${index + 1}. ${symbolDisplay.color}${symbolDisplay.bg}${symbolDisplay.name}${COLORS.RESET} ` +
      `× ${count} symbols (${tier}) = $${payout.toFixed(2)} ` +
      `(${(payout / betAmount).toFixed(1)}x bet)`
    );
  });
}

/**
 * Display cluster breakdown (legacy compatibility)
 * Shows detailed information for each cluster - maps to anyway pay
 * 
 * @param {Array} clusters - Array of cluster data (treated as anyway pays)
 * @param {number} betAmount - Current bet amount
 */
function displayClusterBreakdown(clusters, betAmount) {
  return displayAnywayPayBreakdown(clusters, betAmount);
}

/**
 * Display colorized matrix
 * Shows matrix with colored symbols and borders
 * 
 * @param {Array} matrix - 6x5 game matrix
 * @param {string} title - Title for the matrix display
 */
function displayColorizedMatrix(matrix, title) {
  console.log(COLORS.WHITE + COLORS.BRIGHT + `\n┌─ ${title} ─┐` + COLORS.RESET);
  
  matrix.forEach((row, rowIndex) => {
    let displayRow = COLORS.WHITE + '│ ' + COLORS.RESET;
    
    row.forEach((symbol, colIndex) => {
      const symbolDisplay = SYMBOL_DISPLAY[symbol] || { 
        name: symbol.substring(0, 3), 
        color: COLORS.WHITE, 
        bg: '' 
      };
      
      displayRow += `${symbolDisplay.color}${symbolDisplay.bg} ${symbolDisplay.name} ${COLORS.RESET}`;
      
      if (colIndex < row.length - 1) {
        displayRow += COLORS.DIM + '│' + COLORS.RESET;
      }
    });
    
    displayRow += COLORS.WHITE + ' │' + COLORS.RESET;
    console.log(displayRow);
    
    if (rowIndex < matrix.length - 1) {
      console.log(COLORS.DIM + '├─────┼─────┼─────┼─────┼─────┼─────┤' + COLORS.RESET);
    }
  });
  
  console.log(COLORS.WHITE + COLORS.BRIGHT + '└─────────────────────────────────────┘' + COLORS.RESET);
}

/**
 * Display free spins trigger information
 * Shows scatter trigger details
 * 
 * @param {Object} client - Game client object
 */
function displayFreeSpinsTriggerInfo(client) {
  const freeSpinsData = client.node.context.freespins;
  
  console.log(COLORS.GREEN + COLORS.BRIGHT + '\n🎉 FREE SPINS TRIGGERED!' + COLORS.RESET);
  console.log(COLORS.YELLOW + `Scatters Found: ${freeSpinsData.triggeringScatterCount}` + COLORS.RESET);
  console.log(COLORS.YELLOW + `Free Spins Awarded: ${freeSpinsData.spinsAwarded}` + COLORS.RESET);
  
  if (freeSpinsData.instantScatterPayout > 0) {
    console.log(COLORS.GREEN + `Instant Scatter Win: $${freeSpinsData.instantScatterPayout.toFixed(2)}` + COLORS.RESET);
  }
  
  // Start detailed free spins display
  displayDetailedFreeSpinsSequence(client, freeSpinsData);
}

/**
 * Display detailed free spins sequence
 * Shows each free spin with matrix, wins, and features
 * 
 * @param {Object} client - Game client object
 * @param {Object} freeSpinsData - Free spins information
 */
async function displayDetailedFreeSpinsSequence(client, freeSpinsData) {
  console.log(COLORS.MAGENTA + COLORS.BRIGHT + '\n🎰 FREE SPINS SEQUENCE:' + COLORS.RESET);
  console.log(COLORS.WHITE + '═══════════════════════════════════════' + COLORS.RESET);
  
  const gameSettings = require('../../src/game/runner/configs/settings').get(client.gameId);
  let totalFreeSpinWin = 0;
  let freeSpinNumber = 1;
  const spinsToPlay = freeSpinsData.spinsAwarded || 15;
  
  for (let i = 0; i < spinsToPlay; i++) {
    console.log(COLORS.CYAN + `\n🎮 FREE SPIN ${freeSpinNumber}/${spinsToPlay}:` + COLORS.RESET);
    
    // Generate free spin matrix
    const freeSpinMatrix = await matrix.make(client, gameSettings.reelsSet.sequenceMap.freespins || gameSettings.reelsSet.sequenceMap.basegame, gameSettings.base.rows);
    
    // Display free spin matrix
    displayColorizedMatrix(freeSpinMatrix, `Free Spin ${freeSpinNumber}`);
    
    // Create temporary client for free spin calculation
    const tempClient = createTempClientForFreeSpinCalculation(client, freeSpinMatrix);
    await anywayPay.check(tempClient);
    
    let freeSpinWin = tempClient.node.context.win ? tempClient.node.context.win.total : 0;
    
    // Check for cascades in free spins
    if (tempClient.nextTrigger === TRIGGER.CASCADE) {
      console.log(COLORS.YELLOW + '🌊 Cascades triggered in free spin!' + COLORS.RESET);
      // Handle cascades (simplified for prototype)
    }
    
    // Check for multipliers
    const multiplierData = await checkForMultiplierSymbolsAndApply(tempClient, freeSpinMatrix, gameSettings);
    
    if (multiplierData.hasMultipliers) {
      displayMultiplierInfo(multiplierData);
      freeSpinWin = multiplierData.enhancedWin || freeSpinWin;
    }
    
    // Display free spin results
    if (freeSpinWin > 0) {
      console.log(COLORS.GREEN + `💰 Free Spin Win: $${freeSpinWin.toFixed(2)} (${(freeSpinWin / client.roundBet).toFixed(2)}x)` + COLORS.RESET);
    } else {
      console.log(COLORS.DIM + '❌ No win this free spin' + COLORS.RESET);
    }
    
    totalFreeSpinWin += freeSpinWin;
    freeSpinNumber++;
  }
  
  // Display free spins summary
  console.log(COLORS.GREEN + COLORS.BRIGHT + `\n🏆 FREE SPINS TOTAL: $${totalFreeSpinWin.toFixed(2)} (${(totalFreeSpinWin / client.roundBet).toFixed(2)}x bet)` + COLORS.RESET);
  
  return totalFreeSpinWin;
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
 * Display multiplier information
 * Shows multiplier trigger details
 * 
 * @param {Object} multiplierData - Multiplier feature data
 */
function displayMultiplierInfo(multiplierData) {
  console.log(COLORS.RED + COLORS.BRIGHT + '\n⚡ MULTIPLIERS ACTIVE!' + COLORS.RESET);
  console.log(COLORS.YELLOW + `Multipliers Found: ${multiplierData.count}` + COLORS.RESET);
  console.log(COLORS.YELLOW + `Total Multiplier: ${multiplierData.totalMultiplier}x` + COLORS.RESET);
  
  if (multiplierData.additionalWin > 0) {
    console.log(COLORS.GREEN + `Additional Win: $${multiplierData.additionalWin.toFixed(2)}` + COLORS.RESET);
  }
}

/**
 * Calculate and display final spin results
 * Shows comprehensive spin summary
 * 
 * @param {Object} client - Game client object
 * @param {Object} initialWinResults - Initial win results
 */
function calculateAndDisplayFinalSpinResults(client, initialWinResults) {
  const totalSpinWin = client.node.spinTotal || 0;
  const baseWin = initialWinResults.totalWin;
  const cascadeWin = client.cascade && client.cascade.length > 0 ? 
    client.cascade.reduce((sum, step) => sum + (step.lines?.totalWin || 0), 0) : 0;
  
  console.log(COLORS.YELLOW + COLORS.BRIGHT + '\n📈 SPIN SUMMARY:' + COLORS.RESET);
  console.log(COLORS.WHITE + `Base Game Win: $${baseWin.toFixed(2)}` + COLORS.RESET);
  
  if (cascadeWin > 0) {
    console.log(COLORS.MAGENTA + `Cascade Win: $${cascadeWin.toFixed(2)}` + COLORS.RESET);
  }
  
  console.log(COLORS.GREEN + COLORS.BRIGHT + `TOTAL WIN: $${totalSpinWin.toFixed(2)}` + COLORS.RESET);
  console.log(COLORS.CYAN + `Win Multiplier: ${(totalSpinWin / client.roundBet).toFixed(2)}x bet` + COLORS.RESET);
  
  // Update global statistics
  prototypeState.totalWin += totalSpinWin;
  
  if (totalSpinWin >= client.roundBet * 5) {
    prototypeState.bigWins.push({
      spin: prototypeState.totalSpins,
      win: totalSpinWin,
      multiplier: totalSpinWin / client.roundBet
    });
    
    console.log(COLORS.YELLOW + COLORS.BLINK + '🌟 BIG WIN! 🌟' + COLORS.RESET);
  }
}

/**
 * Store spin details for statistics
 * Records detailed spin information using enhanced tracker
 * 
 * @param {Object} client - Game client object
 */
function storeSpinDetailsForStatistics(client) {
  const spinData = {
    bet: client.roundBet,
    totalWin: client.node.spinTotal || 0,
    baseWin: client.node.context.win ? client.node.context.win.total : 0,
    hadCascade: client.context.isCascade,
    hadMultiplier: client.node.context.features?.multiplier?.active || false,
    hadAnywayPay: client.node.context.features?.anywayPay?.hasWins || false,
    freeSpinsTriggered: client.node.context.freespins?.triggered || false,
    freeSpinsAwarded: client.node.context.freespins?.spinsAwarded || 0,
    freeSpinsWin: client.node.context.freespins?.totalWin || 0,
    cascadeSteps: client.cascade ? client.cascade.length : 0
  };
  
  // Record in enhanced statistics tracker
  statsTracker.recordSpin(spinData);
  
  // Keep legacy tracking for compatibility
  prototypeState.lastSpinDetails = {
    spinNumber: prototypeState.totalSpins,
    bet: client.roundBet,
    totalWin: client.node.spinTotal || 0,
    hasWin: (client.node.spinTotal || 0) > 0,
    hadCascade: client.context.isCascade,
    cascadeSteps: client.cascade ? client.cascade.length : 0,
    features: {
      freeSpins: client.node.context.freespins?.triggered || false,
      multiplier: client.node.context.features?.multiplier?.active || false,
      scatter: client.node.context.features?.scatter?.bonusTriggered || false
    }
  };
}

/**
 * Display detailed prototype statistics
 * Shows comprehensive session statistics using enhanced tracker
 */
function displayDetailedPrototypeStatistics() {
  // Use the enhanced statistics tracker for comprehensive display
  const formattedStats = statsTracker.formatForConsole();
  console.log(COLORS.CYAN + COLORS.BRIGHT + formattedStats + COLORS.RESET);
}

/**
 * Display prototype help information
 * Shows available commands and instructions
 */
function displayPrototypeHelpInformation() {
  console.log(COLORS.CYAN + COLORS.BRIGHT + '\n🔧 PROTOTYPE MODE HELP:' + COLORS.RESET);
  console.log(COLORS.WHITE + '═══════════════════════════════════' + COLORS.RESET);
  console.log('ENTER / "spin" - Play next spin');
  console.log('"stats" - View session statistics');
  console.log('"help" - Show this help');
  console.log('"quit" / "exit" - Exit prototype mode');
  
  console.log(COLORS.YELLOW + '\nSymbol Information:' + COLORS.RESET);
  console.log('• Anyway pays require 8+ symbols anywhere on grid');
  console.log('• 4+ scatters trigger 15 free spins');
  console.log('• Multipliers enhance wins (2x to 500x)');
  console.log('• Cascades continue until no new wins');
}

/**
 * Display prototype session summary
 * Shows final session overview when exiting
 */
function displayPrototypeSessionSummary() {
  console.log(COLORS.YELLOW + COLORS.BRIGHT + '\n🎮 PROTOTYPE SESSION COMPLETE!' + COLORS.RESET);
  displayDetailedPrototypeStatistics();
  console.log(COLORS.GREEN + '\nThank you for testing Gods of Glory! 🎰' + COLORS.RESET);
}

// Helper functions from main simulation
function createClientCloneForCascadeProcessing(client) {
  const clientClone = JSON.parse(JSON.stringify(client));
  clientClone.nextTrigger = TRIGGER.SPIN;
  clientClone.cascade = [];
  
  clientClone.addSpinTotal = (value) => {
    if (value) {
      const finalValue = clientClone.node.spinTotal + value;
      clientClone.node.spinTotal = Math.round(finalValue * 1000000) / 1000000;
      clientClone.totalWin = value;
    }
    return value;
  };
  
  clientClone.setGameRoundOver = () => clientClone.gameRoundOver = true;
  
  delete clientClone.context.destroy;
  delete clientClone.context.matrix;
  delete clientClone.context.win;
  delete clientClone.matrix;
  clientClone.node.context = {};
  
  return clientClone;
}

function applyCascadeResultsToMainClient(mainClient, cascadeClient) {
  mainClient.node.spinTotal = cascadeClient.node.spinTotal;
  mainClient.totalWin = cascadeClient.node.spinTotal;
  mainClient.cascade = cascadeClient.cascade;
}

module.exports = {
  startPrototypeModeForGodsOfGlory
};