const { execute } = require('./sims.js');

// Initialize mock client for simulation following the pattern of other games
function createMockClient() {
  return {
    gameId: 'gods-of-glory',
    node: {
      spinBet: 1, // Base bet amount
      spinTotal: 0,
      state: 'spin',
      trigger: 'spin',
      context: {}
    },
    winCap: 5000, // Maximum win cap (5000x bet)
    betMultiplier: 1,
    matrix: []
  };
}

async function runGodsOfGlorySimulation() {
  console.log('Starting Gods of Glory simulation...');
  console.log('Game: Gates of Olympus clone simulation');
  console.log('Features: Cluster pays, Tumbling reels, Multipliers, Free spins');
  console.log('Grid: 6x5, Min cluster: 8 symbols');
  console.log('Simulating 1,000,000 spins...\n');
  
  const client = createMockClient();
  
  try {
    await execute(client);
    console.log('\nSimulation completed successfully!');
    console.log('Check log files for detailed results:');
    console.log('- logGOGRTPFile.txt (RTP data)');
    console.log('- logGOGBGFile.txt (Base game data)');
    console.log('- logGOGFGFile.txt (Free spins data)');
    console.log('- logGOGTumbleFile.txt (Tumble feature data)');
    console.log('- logGOGMultiplierFile.txt (Multiplier feature data)');
  } catch (error) {
    console.error('Simulation failed:', error);
  }
}

// Export for use in main simulation library
module.exports = runGodsOfGlorySimulation;

// Run if called directly
if (require.main === module) {
  runGodsOfGlorySimulation();
} 