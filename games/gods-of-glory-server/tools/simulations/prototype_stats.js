/**
 * Gods of Glory - Prototype Statistics Module
 * 
 * Provides comprehensive statistical analysis for prototype mode including:
 * - Cost to Capture (CTC)
 * - Volatility measurements
 * - Separate RTP for base game and free spins
 * - Detailed feature frequency tracking
 */

/**
 * Enhanced statistics tracker for prototype mode
 */
class PrototypeStatisticsTracker {
  constructor() {
    this.reset();
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.totalSpins = 0;
    this.totalBet = 0;
    this.totalWin = 0;
    
    // Base game statistics
    this.baseGame = {
      spins: 0,
      totalBet: 0,
      totalWin: 0,
      wins: [],
      hitCount: 0
    };
    
    // Free spins statistics
    this.freeSpins = {
      triggers: 0,
      totalSpins: 0,
      totalWin: 0,
      wins: [],
      averageSpinsAwarded: 0,
      totalSpinsAwarded: 0
    };
    
    // Feature statistics
    this.features = {
      cascades: 0,
      multipliers: 0,
      anywayPays: 0
    };
    
    // Volatility tracking
    this.volatility = {
      wins: [],
      bigWins: [], // 5x+ bet
      megaWins: [], // 20x+ bet
      superWins: [] // 100x+ bet
    };
    
    // Session tracking
    this.session = {
      startTime: Date.now(),
      bigWinThreshold: 5,
      megaWinThreshold: 20,
      superWinThreshold: 100
    };
  }

  /**
   * Record a spin result
   * @param {Object} spinData - Complete spin data
   */
  recordSpin(spinData) {
    this.totalSpins++;
    this.totalBet += spinData.bet;
    this.totalWin += spinData.totalWin;
    
    // Record base game data
    this.baseGame.spins++;
    this.baseGame.totalBet += spinData.bet;
    this.baseGame.totalWin += spinData.baseWin || 0;
    
    if (spinData.baseWin > 0) {
      this.baseGame.hitCount++;
      this.baseGame.wins.push(spinData.baseWin);
    }
    
    // Record free spins data
    if (spinData.freeSpinsTriggered) {
      this.freeSpins.triggers++;
      this.freeSpins.totalSpinsAwarded += spinData.freeSpinsAwarded || 15;
      this.freeSpins.totalWin += spinData.freeSpinsWin || 0;
      
      if (spinData.freeSpinsWin > 0) {
        this.freeSpins.wins.push(spinData.freeSpinsWin);
      }
    }
    
    // Record features
    if (spinData.hadCascade) this.features.cascades++;
    if (spinData.hadMultiplier) this.features.multipliers++;
    if (spinData.hadAnywayPay) this.features.anywayPays++;
    
    // Record volatility data
    if (spinData.totalWin > 0) {
      const winMultiplier = spinData.totalWin / spinData.bet;
      this.volatility.wins.push(winMultiplier);
      
      if (winMultiplier >= this.session.superWinThreshold) {
        this.volatility.superWins.push({ spin: this.totalSpins, multiplier: winMultiplier, win: spinData.totalWin });
      } else if (winMultiplier >= this.session.megaWinThreshold) {
        this.volatility.megaWins.push({ spin: this.totalSpins, multiplier: winMultiplier, win: spinData.totalWin });
      } else if (winMultiplier >= this.session.bigWinThreshold) {
        this.volatility.bigWins.push({ spin: this.totalSpins, multiplier: winMultiplier, win: spinData.totalWin });
      }
    }
  }

  /**
   * Calculate overall RTP
   * @return {number} RTP percentage
   */
  calculateOverallRTP() {
    return this.totalBet > 0 ? (this.totalWin / this.totalBet) * 100 : 0;
  }

  /**
   * Calculate base game RTP
   * @return {number} Base game RTP percentage
   */
  calculateBaseGameRTP() {
    return this.baseGame.totalBet > 0 ? (this.baseGame.totalWin / this.baseGame.totalBet) * 100 : 0;
  }

  /**
   * Calculate free spins RTP
   * @return {number} Free spins RTP percentage
   */
  calculateFreeSpinsRTP() {
    if (this.freeSpins.triggers === 0) return 0;
    
    // Calculate bet equivalent for free spins (triggers * average bet)
    const averageBet = this.totalBet / this.totalSpins;
    const freeSpinsBetEquivalent = this.freeSpins.triggers * averageBet;
    
    return freeSpinsBetEquivalent > 0 ? (this.freeSpins.totalWin / freeSpinsBetEquivalent) * 100 : 0;
  }

  /**
   * Calculate Cost to Capture (CTC) for free spins
   * @return {number} Average cost to trigger free spins
   */
  calculateCTC() {
    if (this.freeSpins.triggers === 0) return 0;
    return this.totalBet / this.freeSpins.triggers;
  }

  /**
   * Calculate volatility index
   * @return {Object} Volatility measurements
   */
  calculateVolatility() {
    if (this.volatility.wins.length === 0) {
      return {
        index: 0,
        standardDeviation: 0,
        variance: 0,
        classification: 'No data'
      };
    }
    
    const wins = this.volatility.wins;
    const mean = wins.reduce((sum, win) => sum + win, 0) / wins.length;
    const variance = wins.reduce((sum, win) => sum + Math.pow(win - mean, 2), 0) / wins.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Classify volatility
    let classification = 'Low';
    if (standardDeviation > 10) classification = 'High';
    else if (standardDeviation > 5) classification = 'Medium';
    
    return {
      index: standardDeviation,
      standardDeviation: standardDeviation,
      variance: variance,
      classification: classification,
      meanWinMultiplier: mean
    };
  }

  /**
   * Calculate hit frequency
   * @return {Object} Hit frequency data
   */
  calculateHitFrequency() {
    const baseGameHitRate = this.baseGame.spins > 0 ? (this.baseGame.hitCount / this.baseGame.spins) * 100 : 0;
    const overallWinSpins = this.volatility.wins.length;
    const overallHitRate = this.totalSpins > 0 ? (overallWinSpins / this.totalSpins) * 100 : 0;
    
    return {
      baseGame: baseGameHitRate,
      overall: overallHitRate,
      freeSpinsFrequency: this.totalSpins > 0 ? this.freeSpins.triggers / this.totalSpins * 100 : 0,
      cascadeFrequency: this.totalSpins > 0 ? this.features.cascades / this.totalSpins * 100 : 0
    };
  }

  /**
   * Get comprehensive statistics summary
   * @return {Object} Complete statistics
   */
  getComprehensiveStats() {
    const overallRTP = this.calculateOverallRTP();
    const baseGameRTP = this.calculateBaseGameRTP();
    const freeSpinsRTP = this.calculateFreeSpinsRTP();
    const ctc = this.calculateCTC();
    const volatility = this.calculateVolatility();
    const hitFrequency = this.calculateHitFrequency();
    
    return {
      session: {
        totalSpins: this.totalSpins,
        totalBet: this.totalBet,
        totalWin: this.totalWin,
        sessionLength: Date.now() - this.session.startTime
      },
      rtp: {
        overall: overallRTP,
        baseGame: baseGameRTP,
        freeSpins: freeSpinsRTP
      },
      ctc: ctc,
      volatility: volatility,
      hitFrequency: hitFrequency,
      features: {
        freeSpinsTriggers: this.freeSpins.triggers,
        cascadeTriggers: this.features.cascades,
        multiplierTriggers: this.features.multipliers,
        anywayPayTriggers: this.features.anywayPays
      },
      winAnalysis: {
        bigWins: this.volatility.bigWins.length,
        megaWins: this.volatility.megaWins.length,
        superWins: this.volatility.superWins.length,
        maxWin: this.volatility.wins.length > 0 ? Math.max(...this.volatility.wins) : 0,
        averageWin: this.volatility.wins.length > 0 ? 
          this.volatility.wins.reduce((sum, win) => sum + win, 0) / this.volatility.wins.length : 0
      }
    };
  }

  /**
   * Format statistics for console display
   * @return {string} Formatted statistics
   */
  formatForConsole() {
    const stats = this.getComprehensiveStats();
    
    let output = '\n📊 COMPREHENSIVE PROTOTYPE STATISTICS:\n';
    output += '═════════════════════════════════════════\n';
    
    // Session Info
    output += `Total Spins: ${stats.session.totalSpins}\n`;
    output += `Total Bet: $${stats.session.totalBet.toFixed(2)}\n`;
    output += `Total Win: $${stats.session.totalWin.toFixed(2)}\n`;
    
    // RTP Analysis
    output += '\n🎯 RTP ANALYSIS:\n';
    output += `Overall RTP: ${stats.rtp.overall.toFixed(2)}%\n`;
    output += `Base Game RTP: ${stats.rtp.baseGame.toFixed(2)}%\n`;
    output += `Free Spins RTP: ${stats.rtp.freeSpins.toFixed(2)}%\n`;
    
    // CTC and Volatility
    output += '\n💰 COST & VOLATILITY:\n';
    output += `Cost to Capture (CTC): $${stats.ctc.toFixed(2)}\n`;
    output += `Volatility: ${stats.volatility.classification} (${stats.volatility.index.toFixed(2)})\n`;
    output += `Standard Deviation: ${stats.volatility.standardDeviation.toFixed(2)}\n`;
    
    // Hit Frequency
    output += '\n🎲 HIT FREQUENCY:\n';
    output += `Base Game Hit Rate: ${stats.hitFrequency.baseGame.toFixed(2)}%\n`;
    output += `Overall Hit Rate: ${stats.hitFrequency.overall.toFixed(2)}%\n`;
    output += `Free Spins Frequency: ${stats.hitFrequency.freeSpinsFrequency.toFixed(4)}%\n`;
    output += `Cascade Frequency: ${stats.hitFrequency.cascadeFrequency.toFixed(2)}%\n`;
    
    // Feature Triggers
    output += '\n🎪 FEATURE TRIGGERS:\n';
    output += `Free Spins: ${stats.features.freeSpinsTriggers}\n`;
    output += `Cascades: ${stats.features.cascadeTriggers}\n`;
    output += `Multipliers: ${stats.features.multiplierTriggers}\n`;
    output += `Anyway Pays: ${stats.features.anywayPayTriggers}\n`;
    
    // Win Analysis
    output += '\n🏆 WIN ANALYSIS:\n';
    output += `Big Wins (5x+): ${stats.winAnalysis.bigWins}\n`;
    output += `Mega Wins (20x+): ${stats.winAnalysis.megaWins}\n`;
    output += `Super Wins (100x+): ${stats.winAnalysis.superWins}\n`;
    output += `Max Win: ${stats.winAnalysis.maxWin.toFixed(2)}x\n`;
    output += `Average Win: ${stats.winAnalysis.averageWin.toFixed(2)}x\n`;
    
    return output;
  }
}

module.exports = {
  PrototypeStatisticsTracker
};