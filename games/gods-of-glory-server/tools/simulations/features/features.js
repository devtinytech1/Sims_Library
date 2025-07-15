/**
 * Gods of Glory - Features Module
 * 
 * Central coordinator for all game features including clusters, multipliers, 
 * scatters, and tumbling mechanics. Provides unified initialization and 
 * access to all feature controllers.
 * 
 * This module acts as the main entry point for feature management,
 * ensuring consistent initialization and providing easy access to 
 * all feature-specific functionality.
 */

const cluster = require('./cluster_feature.js');
const multiplier = require('./multiplier_feature.js');
const scatter = require('./scatters_feature.js');
const tumble = require('./tumble_feature.js');

/**
 * Initialize all game features for client
 * Sets up feature tracking context and provides access to feature modules
 * 
 * @param {Object} client - Game client object to initialize
 * @return {Object} Object containing all feature modules
 */
function initializeAllGameFeaturesForClient(client) {
  // Ensure client context exists
  if (!client.context) {
    client.context = {};
  }
  
  // Initialize comprehensive feature tracking
  client.context.features = createDefaultFeatureTrackingStructure();
  
  // Add convenience methods to client
  addFeatureAccessMethodsToClient(client);
  
  // Return feature modules for external use
  return createFeatureModulesAccessObject();
}

/**
 * Create default feature tracking structure
 * Initializes tracking data for all game features
 * 
 * @return {Object} Default feature tracking structure
 */
function createDefaultFeatureTrackingStructure() {
  return {
    cluster: createDefaultClusterTrackingData(),
    multiplier: createDefaultMultiplierTrackingData(),
    scatter: createDefaultScatterTrackingData(),
    tumble: createDefaultTumbleTrackingData(),
    sessionStats: createDefaultSessionStatsData()
  };
}

/**
 * Create default cluster tracking data
 * Initialize cluster feature tracking
 * 
 * @return {Object} Default cluster tracking data
 */
function createDefaultClusterTrackingData() {
  return {
    hasWins: false,
    winningSymbols: [],
    totalWin: 0,
    clusters: [],
    clusterCount: 0,
    timestamp: Date.now()
  };
}

/**
 * Create default multiplier tracking data
 * Initialize multiplier feature tracking
 * 
 * @return {Object} Default multiplier tracking data
 */
function createDefaultMultiplierTrackingData() {
  return {
    active: false,
    values: [],
    totalMultiplier: 1,
    positions: [],
    count: 0,
    timestamp: Date.now()
  };
}

/**
 * Create default scatter tracking data
 * Initialize scatter feature tracking
 * 
 * @return {Object} Default scatter tracking data
 */
function createDefaultScatterTrackingData() {
  return {
    count: 0,
    positions: [],
    bonusTriggered: false,
    timestamp: Date.now()
  };
}

/**
 * Create default tumble tracking data
 * Initialize tumble feature tracking
 * 
 * @return {Object} Default tumble tracking data
 */
function createDefaultTumbleTrackingData() {
  return {
    active: false,
    count: 0,
    totalWin: 0,
    timestamp: Date.now()
  };
}

/**
 * Create default session statistics data
 * Initialize session-wide feature statistics
 * 
 * @return {Object} Default session statistics
 */
function createDefaultSessionStatsData() {
  return {
    totalSpins: 0,
    featuresTriggered: {
      cluster: 0,
      multiplier: 0,
      scatter: 0,
      tumble: 0
    },
    lastFeatureTime: Date.now()
  };
}

/**
 * Add feature access methods to client
 * Provides convenient methods for accessing feature data
 * 
 * @param {Object} client - Game client object
 */
function addFeatureAccessMethodsToClient(client) {
  // Get all features data
  client.getFeatures = () => client.context.features;
  
  // Get specific feature data
  client.getClusterFeatureData = () => client.context.features.cluster;
  client.getMultiplierFeatureData = () => client.context.features.multiplier;
  client.getScatterFeatureData = () => client.context.features.scatter;
  client.getTumbleFeatureData = () => client.context.features.tumble;
  
  // Check if any features are active
  client.hasActiveFeatures = () => {
    const features = client.context.features;
    return features.cluster.hasWins || 
           features.multiplier.active || 
           features.scatter.bonusTriggered || 
           features.tumble.active;
  };
  
  // Reset all features for new spin
  client.resetAllFeatures = () => {
    client.context.features = createDefaultFeatureTrackingStructure();
  };
}

/**
 * Create feature modules access object
 * Returns object with all feature modules for external access
 * 
 * @return {Object} Feature modules access object
 */
function createFeatureModulesAccessObject() {
  return {
    cluster: cluster,
    multiplier: multiplier,
    scatter: scatter,
    tumble: tumble
  };
}

/**
 * Reset all feature tracking data
 * Clears all feature data to prepare for new game round
 * 
 * @param {Object} client - Game client object
 */
function resetAllFeatureTrackingData(client) {
  initializeAllGameFeaturesForClient(client);
}

/**
 * Get comprehensive feature summary
 * Provides overview of all active features and their status
 * 
 * @param {Object} client - Game client object
 * @return {Object} Comprehensive feature summary
 */
function getComprehensiveFeatureSummary(client) {
  const features = client.context.features;
  
  return {
    hasAnyActiveFeatures: client.hasActiveFeatures(),
    clusterStatus: {
      hasWins: features.cluster.hasWins,
      clusterCount: features.cluster.clusterCount,
      totalWin: features.cluster.totalWin
    },
    multiplierStatus: {
      active: features.multiplier.active,
      count: features.multiplier.count,
      totalMultiplier: features.multiplier.totalMultiplier
    },
    scatterStatus: {
      count: features.scatter.count,
      bonusTriggered: features.scatter.bonusTriggered
    },
    tumbleStatus: {
      active: features.tumble.active,
      count: features.tumble.count,
      totalWin: features.tumble.totalWin
    },
    sessionStats: features.sessionStats
  };
}

/**
 * Update session statistics
 * Tracks overall feature usage statistics
 * 
 * @param {Object} client - Game client object
 * @param {string} featureType - Type of feature that was triggered
 */
function updateSessionStatisticsForFeature(client, featureType) {
  if (!client.context.features.sessionStats.featuresTriggered[featureType]) {
    client.context.features.sessionStats.featuresTriggered[featureType] = 0;
  }
  
  client.context.features.sessionStats.featuresTriggered[featureType]++;
  client.context.features.sessionStats.lastFeatureTime = Date.now();
}

/**
 * Check if features are properly initialized
 * Validates that client has proper feature structure
 * 
 * @param {Object} client - Game client object
 * @return {boolean} True if features are properly initialized
 */
function areFeaturesProperlyInitialized(client) {
  return client.context && 
         client.context.features && 
         client.context.features.cluster && 
         client.context.features.multiplier && 
         client.context.features.scatter && 
         client.context.features.tumble;
}

// Export with both new and legacy function names for compatibility
module.exports = Object.assign(
  { 
    initializeAllGameFeaturesForClient,
    resetAllFeatureTrackingData,
    getComprehensiveFeatureSummary,
    updateSessionStatisticsForFeature,
    areFeaturesProperlyInitialized,
    // Legacy function name for compatibility
    init: initializeAllGameFeaturesForClient
  }, 
  { 
    cluster, 
    multiplier, 
    scatter, 
    tumble 
  }
);