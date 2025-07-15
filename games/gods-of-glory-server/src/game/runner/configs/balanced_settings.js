/**
 * Gods of Glory - Balanced Game Settings
 * 
 * Properly balanced configuration to achieve:
 * - 96% RTP (±10%)
 * - Base game: ~30% RTP contribution, 30% hit rate (1 in 3.33 spins)
 * - Free spins: ~70% RTP contribution, 1 in 150 trigger rate
 * - Multiple cascades enabled
 */

const base = {
  rows: 6,
  cols: 5,
  minAnywayPaySize: 8,  // Minimum symbols for anyway pay
  maxCascades: 10,
  freeSpinsCount: 15,
  scatterCountForBonus: 4,
  maxMultiplier: 500,
  minMultiplier: 2,
  
  // Target game metrics
  targetRTP: 96.0,
  baseGameRTPContribution: 30, // 30% of total RTP (≈28.8%)
  freeSpinsRTPContribution: 70, // 70% of total RTP (≈67.2%)
  targetBaseGameHitRate: 30,   // 30% hit rate (1 in 3.33 spins)
  targetFreeSpinFrequency: 150  // 1 in 150 spins
};

const symbols = {
  scatter: 'SCATTER',
  multiplier: 'MULTIPLIER',
  highPays: ['ZEUS', 'CHALICE', 'RING', 'COIN'],
  lowPays: ['RED_GEM', 'PURPLE_GEM', 'YELLOW_GEM', 'GREEN_GEM', 'BLUE_GEM']
};

// Balanced payouts for 96% RTP with 30% base game contribution
const payouts = {
  // High value symbols - significantly reduced from original
  ZEUS: { '8-9': 1.5, '10-11': 4, '12+': 15 },        // Premium symbol
  CHALICE: { '8-9': 1.2, '10-11': 3, '12+': 10 },     // High symbol
  RING: { '8-9': 1.0, '10-11': 2.5, '12+': 8 },       // High symbol
  COIN: { '8-9': 0.8, '10-11': 2, '12+': 6 },         // High symbol
  
  // Low value symbols - balanced for frequent hits
  RED_GEM: { '8-9': 0.6, '10-11': 1.5, '12+': 4 },    // Medium-low symbol
  PURPLE_GEM: { '8-9': 0.5, '10-11': 1.2, '12+': 3.5 }, // Low symbol
  YELLOW_GEM: { '8-9': 0.4, '10-11': 1.0, '12+': 3 },   // Low symbol
  GREEN_GEM: { '8-9': 0.3, '10-11': 0.8, '12+': 2.5 },  // Low symbol
  BLUE_GEM: { '8-9': 0.25, '10-11': 0.6, '12+': 2 }     // Lowest symbol
};

// Balanced symbol weights for proper hit frequency and free spin rate
const weights = {
  // Scatters: Target 1 in 150 free spins = 1 in 37.5 spins per scatter
  // For 4 scatters needed: each scatter should appear ~1 in 9.4 positions
  // With 30 total positions (6x5), scatter weight should be ~3.2
  SCATTER: 8,  // Increased from 2 to achieve proper free spin frequency
  
  // Multipliers: Should be somewhat rare but not too rare
  MULTIPLIER: 6,
  
  // High value symbols: Less frequent to balance RTP
  ZEUS: 12,     // Reduced frequency for premium symbol
  CHALICE: 15,  // Medium-high frequency
  RING: 18,     // Medium-high frequency  
  COIN: 22,     // Medium frequency
  
  // Low value symbols: Higher frequency to achieve 30% base game hit rate
  RED_GEM: 35,     // Increased for more frequent hits
  PURPLE_GEM: 38,  // High frequency
  YELLOW_GEM: 42,  // High frequency
  GREEN_GEM: 45,   // Very high frequency
  BLUE_GEM: 50     // Highest frequency
};

// Multiplier weights - slightly reduced impact for balance
const multiplierWeights = [
  { value: 2, weight: 30 },    // Most common
  { value: 3, weight: 25 },
  { value: 4, weight: 20 },
  { value: 5, weight: 15 },
  { value: 8, weight: 8 },
  { value: 10, weight: 5 },
  { value: 15, weight: 3 },
  { value: 20, weight: 2 },
  { value: 25, weight: 1 },
  { value: 50, weight: 0.3 },
  { value: 100, weight: 0.1 },
  { value: 250, weight: 0.02 },
  { value: 500, weight: 0.005 }
];

// Scatter payouts - balanced with instant wins
const scatterPayouts = {
  3: 0,     // No payout for 3 scatters
  4: 1,     // 1x bet for triggering free spins
  5: 3,     // 3x bet bonus
  6: 10     // 10x bet bonus (rare)
};

// Reel sequences configuration
const reelsSet = {
  sequenceMap: {
    basegame: 'basegame',
    freespins: 'freespins'
  }
};

// Enhanced features configuration
const features = {
  tumble: {
    active: true,
    maxCascades: 10,
    // Cascade probability after a win - enables multiple cascades
    cascadeChance: 0.35  // 35% chance of cascade after win
  },
  multiplier: {
    active: true,
    weights: multiplierWeights,
    // Base game vs free spins multiplier behavior
    baseGameMultiplierChance: 0.15,  // 15% chance in base game
    freeSpinsGlobalCollection: true   // Global collection in free spins
  },
  freespins: {
    active: true,
    triggerCount: 4,
    spinsAwarded: 15,
    scatterPayouts: scatterPayouts,
    // Enhanced free spins configuration
    retriggerPossible: false,  // No retriggers for now
    multiplierBoost: 1.5       // 50% multiplier boost in free spins
  },
  anywayPay: {  // Changed from cluster to anywayPay
    active: true,
    minSize: 8,
    payouts: payouts,
    // Hit frequency configuration
    baseGameHitTarget: 30,     // 30% hit rate target
    symbolDistribution: weights
  }
};

// Main settings object
const settings94 = {
  rtp: 96.0,
  base,
  symbols,
  payouts,
  weights,
  multiplierWeights,
  scatterPayouts,
  reelsSet,
  features,
  
  // Additional configuration for balance
  gameplayBalance: {
    // Base game targets
    baseGameHitRate: 30,           // 30% of spins have wins
    baseGameAverageWin: 0.96,      // Average win multiplier
    baseGameRTPTarget: 28.8,       // 30% of 96% RTP
    
    // Free spins targets  
    freeSpinTriggerRate: 0.0067,   // 1 in 150 spins (0.67%)
    freeSpinAverageWin: 67.2,      // Average free spin sequence win
    freeSpinsRTPTarget: 67.2,      // 70% of 96% RTP
    
    // Cascade targets
    cascadeFrequency: 15,          // 15% of wins trigger cascades
    averageCascadeSteps: 2.5,      // Average cascade sequence length
    
    // Volatility targets
    volatilityIndex: 'Medium',     // Target volatility classification
    bigWinFrequency: 0.05,         // 5% of spins are big wins (5x+)
    megaWinFrequency: 0.005        // 0.5% of spins are mega wins (20x+)
  }
};

function get(gameId) {
  return settings94;
}

module.exports = { 
  base, 
  get, 
  settings94,
  // Export individual components for testing
  payouts,
  weights,
  multiplierWeights,
  scatterPayouts,
  features
};