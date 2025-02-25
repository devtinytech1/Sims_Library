// Function to configure client node settings with defaults
function configureSettings(client, settings, baseSettings) {
  const { base } = baseSettings;

  client.node.settings = {
    set: settings.name,
    autoplay: [...base.autoplay],
    autoplay_limits_loss: [...base.autoplay_limits_loss],
    autoplay_limits_win: [...base.autoplay_limits_win],
    paytable: settings.paytable,
    lines: base.lines,
    be: base.version,
    buyBonusMultiplier: settings.buyBonusMultiplier,
  };

  // Handle bets and goldenBets logic with fallback
  client.node.settings.bets = client.init?.bets ? [...client.init.bets] : [...base.bets];
  client.node.settings.goldenBets = client.init?.goldenBets ? [...client.init.goldenBets] : [...base.goldenBets];
  client.node.settings.defaultBet = client.init?.defaultBet ?? base.defaultBet;

  // Store bets and goldenBets in stash for future use
  client.node.stash = {
    bets: [...client.node.settings.bets],
    goldenBets: [...client.node.settings.goldenBets],
    defaultBet: client.node.settings.defaultBet,
  };
}

async function runBoardGeneration03(client, state, trigger, matrix, linesController, baseSettings, TRIGGER, features) {
  client.node.context = { matrix: await matrix.make(client, TRIGGER.SPIN, baseSettings.base.rows) };
  linesController.makeWinModel(client, client.context);
  client.node.state = state;
  client.node.trigger = trigger || state;

  // Initialize features
  features.init(client);
}

// Common function to handle board generation logic
async function runBoardGenerationCommon(client, state, trigger, getMatrix, linesController, baseSettings, features, initHoldnspin = false) {
  const { base } = baseSettings;

  // Generate matrix
  client.node.context = { matrix: await getMatrix(client, trigger, base.rows) };

  // Update state and trigger
  client.node.state = state;
  client.node.trigger = trigger || state;

  // Apply features initialization
  if (features) features.init(client);

  // Apply win model
  if (linesController) linesController.makeWinModel(client, client.context);

  // Optionally initialize holdnspin
  if (initHoldnspin) {
    client.node.context.holdnspin = {
      default_holdnspin_position: Array(18).fill(['B']),
    };
  }
}

// Wrapper functions for specific scenarios
async function runBoardGeneration(client, state, trigger, matrix, linesController, features, baseSettings) {
  await runBoardGenerationCommon(client, state, trigger, matrix.make, linesController, baseSettings, features);
}

async function runBoardGeneration10(client, state, trigger, getMatrix, triggers, baseSettings) {
  await runBoardGenerationCommon(client, state, trigger, getMatrix, null, baseSettings, null, true);
}


module.exports = { configureSettings, runBoardGeneration, runBoardGeneration10, runBoardGeneration03 };
