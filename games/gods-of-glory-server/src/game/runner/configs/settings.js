/**
 * Gods of Glory - Balanced Game Settings
 * 
 * Properly balanced configuration with anyway pay mechanics to achieve:
 * - 96% RTP (±10%)
 * - Base game: ~30% RTP contribution, 30% hit rate (1 in 3.33 spins)
 * - Free spins: ~70% RTP contribution, 1 in 150 trigger rate
 * - Multiple cascades enabled
 * - Anyway pay (scatter pay) mechanics - 8+ symbols anywhere on grid
 */

const base = {
  rows: 6,
  cols: 5,
  minAnywayPaySize: 8,  // Minimum symbols for anyway pay (Gates of Olympus style)
  maxCascades: 10,      // Maximum cascade sequences allowed
  freeSpinsCount: 15,   // Number of free spins awarded
  scatterCountForBonus: 4, // Scatters needed to trigger free spins
  maxMultiplier: 500,   // Maximum multiplier value
  minMultiplier: 2,     // Minimum multiplier value
  
  // Target game metrics for balanced gameplay
  targetRTP: 96.0,                     // Target return to player percentage
  baseGameRTPContribution: 30,         // 30% of total RTP from base game
  freeSpinsRTPContribution: 70,        // 70% of total RTP from free spins
  targetBaseGameHitRate: 30,           // 30% hit rate (1 in 3.33 spins)
  targetFreeSpinFrequency: 150         // 1 in 150 spins triggers free spins
};

const symbols = {
  scatter: 'SCATTER',     // Scatter symbol for triggering free spins
  multiplier: 'MULTIPLIER', // Multiplier symbol for enhancing wins
  highPays: ['ZEUS', 'CHALICE', 'RING', 'COIN'],  // High value symbols
  lowPays: ['RED_GEM', 'PURPLE_GEM', 'YELLOW_GEM', 'GREEN_GEM', 'BLUE_GEM'] // Low value symbols
};

// Balanced payouts for 96% RTP with proper anyway pay structure
// Uses Gates of Olympus tier system: 8-9 symbols, 10-11 symbols, 12+ symbols
const payouts = {
  // High value symbols - balanced for proper RTP contribution
  ZEUS: { '8-9': 1.5, '10-11': 4, '12+': 15 },        // Premium symbol (crown equivalent)
  CHALICE: { '8-9': 1.2, '10-11': 3, '12+': 10 },     // High symbol (hourglass equivalent)
  RING: { '8-9': 1.0, '10-11': 2.5, '12+': 8 },       // High symbol (ring equivalent)
  COIN: { '8-9': 0.8, '10-11': 2, '12+': 6 },         // High symbol (chalice equivalent)
  
  // Low value symbols - balanced for frequent hits to achieve 30% base game hit rate
  RED_GEM: { '8-9': 0.6, '10-11': 1.5, '12+': 4 },    // Medium-low gem symbol
  PURPLE_GEM: { '8-9': 0.5, '10-11': 1.2, '12+': 3.5 }, // Low gem symbol
  YELLOW_GEM: { '8-9': 0.4, '10-11': 1.0, '12+': 3 },   // Low gem symbol
  GREEN_GEM: { '8-9': 0.3, '10-11': 0.8, '12+': 2.5 },  // Low gem symbol
  BLUE_GEM: { '8-9': 0.25, '10-11': 0.6, '12+': 2 }     // Lowest gem symbol
};

// Balanced symbol weights for proper hit frequency and free spin rate
const weights = {
  // Scatters: Calculated for 1 in 150 free spins trigger rate
  // With 4 scatters needed and 30 positions (6x5), weight of 8 gives proper frequency
  SCATTER: 8,      // Increased from 2 to achieve 1 in 150 free spins
  
  // Multipliers: Somewhat rare but not too rare for good gameplay
  MULTIPLIER: 6,   // Appears occasionally to enhance wins
  
  // High value symbols: Less frequent to balance RTP and maintain excitement
  ZEUS: 12,        // Rarest high symbol (premium)
  CHALICE: 15,     // Medium-high frequency
  RING: 18,        // Medium-high frequency  
  COIN: 22,        // Medium frequency
  
  // Low value symbols: Higher frequency to achieve 30% base game hit rate
  RED_GEM: 35,     // Higher frequency for more regular wins
  PURPLE_GEM: 38,  // High frequency gem
  YELLOW_GEM: 42,  // High frequency gem
  GREEN_GEM: 45,   // Very high frequency gem
  BLUE_GEM: 50     // Highest frequency gem (most common symbol)
};

// Multiplier weights - balanced distribution for proper RTP
const multiplierWeights = [
  { value: 2, weight: 30 },    // Most common multiplier
  { value: 3, weight: 25 },    // Common multiplier
  { value: 4, weight: 20 },    // Regular multiplier
  { value: 5, weight: 15 },    // Less common multiplier
  { value: 8, weight: 8 },     // Uncommon multiplier
  { value: 10, weight: 5 },    // Rare multiplier
  { value: 15, weight: 3 },    // Very rare multiplier
  { value: 20, weight: 2 },    // Extremely rare multiplier
  { value: 25, weight: 1 },    // Super rare multiplier
  { value: 50, weight: 0.3 },  // Ultra rare multiplier
  { value: 100, weight: 0.1 }, // Mega rare multiplier
  { value: 250, weight: 0.02 }, // Legendary rare multiplier
  { value: 500, weight: 0.005 } // Maximum multiplier (extremely rare)
];

// Scatter payouts - instant wins when triggering free spins
const scatterPayouts = {
  3: 0,     // No instant payout for 3 scatters
  4: 1,     // 1x bet instant win for triggering free spins
  5: 3,     // 3x bet bonus for 5 scatters
  6: 10     // 10x bet bonus for 6 scatters (very rare)
};

// Reel sequences configuration for matrix generation
const reelsSet = {
  sequenceMap: {
    basegame: 'basegame',   // Base game reel sequence
    freespins: 'freespins'  // Free spins reel sequence (can be different)
  }
};

// Enhanced features configuration with anyway pay mechanics
const features = {
  // Cascade/tumble feature for continuing wins
  tumble: {
    active: true,           // Enable cascading reels
    maxCascades: 10,        // Maximum number of cascades per spin
    cascadeChance: 0.35     // 35% chance of additional cascade after win
  },
  
  // Multiplier feature for enhancing wins
  multiplier: {
    active: true,                        // Enable multiplier symbols
    weights: multiplierWeights,          // Distribution of multiplier values
    baseGameMultiplierChance: 0.15,      // 15% chance in base game
    freeSpinsGlobalCollection: true      // Global collection in free spins
  },
  
  // Free spins bonus feature
  freespins: {
    active: true,                    // Enable free spins feature
    triggerCount: 4,                 // 4 scatters needed to trigger
    spinsAwarded: 15,                // 15 free spins awarded
    scatterPayouts: scatterPayouts,  // Instant scatter payouts
    retriggerPossible: false,        // No retriggers for balanced gameplay
    multiplierBoost: 1.5             // 50% multiplier boost in free spins
  },
  
  // Anyway pay feature - this is the main win mechanism
  anywayPay: {
    active: true,                    // Enable anyway pay (scatter pay) mechanics
    minSize: 8,                      // Minimum 8 symbols needed for win
    payouts: payouts,                // Payout table for anyway pays
    baseGameHitTarget: 30,           // Target 30% hit rate in base game
    symbolDistribution: weights      // Symbol weight distribution
  }
};

// Main settings object with all game configuration
const settings94 = {
  rtp: 96.0,                    // Target RTP percentage
  base,                         // Base game configuration
  symbols,                      // Symbol definitions
  payouts,                      // Payout tables
  weights,                      // Symbol weights for reel generation
  multiplierWeights,            // Multiplier value distribution
  scatterPayouts,               // Scatter instant payouts
  reelsSet,                     // Reel sequence configuration
  features,                     // Feature configurations
  
  // Additional configuration for balanced gameplay
  gameplayBalance: {
    // Base game targets for balanced experience
    baseGameHitRate: 30,           // 30% of spins should have wins
    baseGameAverageWin: 0.96,      // Average win should be close to 1x bet
    baseGameRTPTarget: 28.8,       // 30% of 96% total RTP
    
    // Free spins targets for exciting bonus rounds
    freeSpinTriggerRate: 0.0067,   // 1 in 150 spins (0.67%) trigger rate
    freeSpinAverageWin: 67.2,      // Average free spin sequence win
    freeSpinsRTPTarget: 67.2,      // 70% of 96% total RTP
    
    // Cascade targets for extended gameplay
    cascadeFrequency: 15,          // 15% of wins trigger cascades
    averageCascadeSteps: 2.5,      // Average 2.5 cascade steps per sequence
    
    // Volatility targets for player engagement
    volatilityIndex: 'Medium',     // Target medium volatility
    bigWinFrequency: 0.05,         // 5% of spins are big wins (5x+ bet)
    megaWinFrequency: 0.005        // 0.5% of spins are mega wins (20x+ bet)
  }
};

/**
 * Get game settings for specific game ID
 * 
 * @param {string} gameId - Game identifier
 * @returns {Object} Game settings configuration
 */
function get(gameId) {
  return settings94;
}

// Export settings and components for use by other modules
module.exports = { 
  base,                 // Base game configuration
  get,                  // Settings getter function
  settings94,           // Main settings object
  payouts,              // Payout tables
  weights,              // Symbol weights
  multiplierWeights,    // Multiplier distribution
  scatterPayouts,       // Scatter payouts
  features              // Feature configurations
};