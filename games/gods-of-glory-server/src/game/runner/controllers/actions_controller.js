const matrixController = require('./matrix_controller');
const anywayPayController = require('./anyway_pay_controller');
const settings = require('../configs/settings');

async function execute(client) {
  try {
    // Initialize client context if not exists
    if (!client.node.context) {
      client.node.context = {
        win: { total: 0, lines: [] },
        features: {}
      };
    }

    // Reset win data for this round
    client.node.context.win = { total: 0, lines: [] };

    // Create matrix for the spin
    client.matrix = await matrixController.make(client, 'basegame');

    // Check for anyway pay wins (8+ symbols anywhere on grid)
    const anywayPayResult = await anywayPayController.check(client);

    // Handle tumbling/cascading after anyway pay wins
    let cascadeCount = 0;
    let currentWinningSymbols = anywayPayResult.winningSymbols;
    
    while (currentWinningSymbols.length > 0 && cascadeCount < 10) {
      // Remove winning symbols and drop new ones
      client.matrix = matrixController.removeSymbolsFromMatrix(client.matrix, currentWinningSymbols);
      client.matrix = matrixController.dropSymbolsDown(client.matrix, settings.get(client.gameId));
      
      // Check for new anyway pay wins after cascade
      const newAnywayPayResult = await anywayPayController.check(client);
      
      if (newAnywayPayResult.totalWin > 0) {
        cascadeCount++;
        currentWinningSymbols = newAnywayPayResult.winningSymbols;
      } else {
        break;
      }
    }

    // Apply multipliers if present
    await applyMultipliers(client);

    // Check for scatter features
    await checkScatterFeatures(client);

    const totalBet = client.spinBet || client.roundBet || 1;
    const totalWin = client.node.context.win.total;
    const gameRoundOver = true;

    return {
      data: {
        clientData: {
          matrix: client.matrix,
          wins: client.node.context.win,
          features: client.node.context.features,
          totalWin: totalWin
        },
        serverData: client.node.context
      },
      totalBet: totalBet,
      gameRoundOver: gameRoundOver,
      totalWin: totalWin,
      roundRestore: false
    };

  } catch (error) {
    console.error('Error in actions controller:', error);
    return {
      data: {
        clientData: { error: error.message },
        serverData: client.node.context || {}
      },
      totalBet: client.spinBet || 0,
      gameRoundOver: false,
      totalWin: 0,
      roundRestore: false
    };
  }
}

async function applyMultipliers(client) {
  const matrix = client.matrix;
  const gameSettings = settings.get(client.gameId);
  const multiplierValues = [];
  
  // Find multiplier symbols
  for (let row = 0; row < gameSettings.base.rows; row++) {
    for (let col = 0; col < gameSettings.base.cols; col++) {
      if (matrix[row][col] === gameSettings.symbols.multiplier) {
        const multiplierValue = generateMultiplierValue(gameSettings);
        multiplierValues.push(multiplierValue);
      }
    }
  }
  
  // Apply multipliers to total win
  if (multiplierValues.length > 0) {
    const totalMultiplier = 1 + multiplierValues.reduce((sum, val) => sum + val, 0);
    client.node.context.win.total *= totalMultiplier;
    
    if (!client.node.context.features.multiplier) {
      client.node.context.features.multiplier = {};
    }
    client.node.context.features.multiplier.values = multiplierValues;
    client.node.context.features.multiplier.totalMultiplier = totalMultiplier;
  }
}

async function checkScatterFeatures(client) {
  const matrix = client.matrix;
  const gameSettings = settings.get(client.gameId);
  let scatterCount = 0;
  
  // Count scatter symbols
  for (let row = 0; row < gameSettings.base.rows; row++) {
    for (let col = 0; col < gameSettings.base.cols; col++) {
      if (matrix[row][col] === gameSettings.symbols.scatter) {
        scatterCount++;
      }
    }
  }
  
  // Check for free spins trigger
  if (scatterCount >= gameSettings.features.freespins.triggerCount) {
    const scatterPayout = gameSettings.scatterPayouts[scatterCount] || 0;
    const spinBet = client.spinBet || client.roundBet || 1;
    const scatterWin = scatterPayout * spinBet;
    
    client.node.context.win.total += scatterWin;
    
    if (!client.node.context.features.freespins) {
      client.node.context.features.freespins = {};
    }
    client.node.context.features.freespins.triggered = true;
    client.node.context.features.freespins.scatterCount = scatterCount;
    client.node.context.features.freespins.scatterWin = scatterWin;
    client.node.context.features.freespins.spinsAwarded = gameSettings.features.freespins.spinsAwarded;
  }
}

function generateMultiplierValue(gameSettings) {
  const weights = gameSettings.multiplierWeights;
  const weightedPool = [];
  
  weights.forEach(item => {
    const weight = Math.round(item.weight * 100);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(item.value);
    }
  });
  
  if (weightedPool.length === 0) {
    return 2;
  }
  
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}

module.exports = { execute };