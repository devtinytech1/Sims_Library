# Gods of Glory - Slot Simulation

A comprehensive simulation of the **Gods of Glory** slot game, based on Pragmatic Play's **Gates of Olympus** mechanics.

## Game Overview

Gods of Glory is a 6x5 cluster-paying slot game featuring:
- **Tumbling/Cascading Reels**: Winning symbols disappear and new ones fall down
- **Multiplier Symbols**: Random multipliers from 2x to 500x
- **Free Spins Bonus**: Triggered by 4+ scatter symbols
- **Cluster Pays**: Minimum 8 connecting symbols for wins
- **RTP Target**: 96.5%

## Game Features

### 1. Cluster Pay System
- **Grid Size**: 6 rows × 5 columns (30 positions)
- **Win Condition**: 8+ adjacent symbols (horizontally/vertically connected)
- **Symbol Hierarchy**: Zeus (highest) > Chalice > Ring > Coin > Gems

### 2. Tumbling Reels
- After each win, winning symbols are removed
- New symbols fall down to fill empty spaces
- Process continues until no new wins occur
- Up to 10 cascades per spin (infinite loop protection)

### 3. Multiplier Feature
- **Values**: 2x, 3x, 4x, 5x, 8x, 10x, 15x, 20x, 25x, 50x, 100x, 250x, 500x
- **Base Game**: Multipliers add together, then multiply total win
- **Free Spins**: All multipliers collected globally and applied to all wins

### 4. Free Spins Bonus
- **Trigger**: 4+ scatter symbols anywhere
- **Award**: 15 free spins
- **Scatter Payouts**: 
  - 4 scatters = 3x bet
  - 5 scatters = 5x bet  
  - 6 scatters = 100x bet
- **Enhanced Multipliers**: Collected globally throughout bonus

## Symbol Payouts

### High-Value Symbols
| Symbol | 8+ | 12+ | 15+ | 20+ | 25+ | 30 |
|--------|----|----|----|----|----|----|
| Zeus   | 0.25x | 2x | 5x | 50x | 200x | 1000x |
| Chalice | 0.2x | 1x | 3x | 25x | 100x | 500x |
| Ring   | 0.15x | 0.8x | 2x | 15x | 75x | 250x |
| Coin   | 0.1x | 0.6x | 1.5x | 10x | 50x | 150x |

### Low-Value Symbols (Gems)
| Symbol | 8+ | 12+ | 15+ | 20+ | 25+ | 30 |
|--------|----|----|----|----|----|----|
| Blue Gem | 0.05x | 0.25x | 0.5x | 2.5x | 10x | 50x |
| Green Gem | 0.05x | 0.25x | 0.5x | 2x | 7.5x | 40x |
| Red Gem | 0.05x | 0.2x | 0.4x | 1.5x | 6x | 30x |
| Purple Gem | 0.05x | 0.2x | 0.4x | 1.25x | 5x | 25x |
| Yellow Gem | 0.05x | 0.15x | 0.3x | 1x | 4x | 20x |

## Simulation Structure

### Core Files
- `sims.js` - Main simulation engine
- `matrix_controller.js` - Grid and symbol management
- `index.js` - Simulation entry point

### Feature Modules
- `cluster_win_feature.js` - Cluster win detection and payouts
- `tumble_feature.js` - Cascading reels logic
- `multiplier_feature.js` - Multiplier symbol handling
- `scatter_feature.js` - Free spins trigger logic

### Logging System
- `logRTPData.js` - Overall RTP and win tracking
- `logBGData.js` - Base game statistics
- `logFGData.js` - Free spins statistics  
- `logTumbleData.js` - Tumble feature analytics
- `logMultiplierData.js` - Multiplier feature analytics

## Running the Simulation

### Individual Game Simulation
```bash
cd games/gods-of-glory-server/tools/simulations
node index.js
```

### Full Library Simulation
```bash
# From root directory
node main.js
```

## Output Files

The simulation generates detailed log files:
- `logGOGRTPFile.txt` - Round-by-round RTP analysis
- `logGOGBGFile.txt` - Base game win frequency and amounts
- `logGOGFGFile.txt` - Free spins trigger frequency and wins
- `logGOGTumbleFile.txt` - Tumble feature statistics
- `logGOGMultiplierFile.txt` - Multiplier values and frequency

## Configuration

### Game Settings
```javascript
const GAME_CONFIG = {
  GRID_SIZE: { rows: 6, cols: 5 },
  MIN_CLUSTER_SIZE: 8,
  MAX_MULTIPLIER: 500,
  MIN_MULTIPLIER: 2,
  FREE_SPINS_COUNT: 15,
  SCATTER_COUNT_FOR_BONUS: 4,
  RTP_TARGET: 96.5
};
```

### Symbol Weights
Symbols are weighted for realistic distribution:
- **Scatter**: 2 (rarest)
- **Multiplier**: 3
- **Zeus**: 8 
- **High-value symbols**: 12-18
- **Low-value gems**: 20-28 (most common)

## Mathematical Model

The simulation implements accurate mathematical modeling of:
- **Cluster formation algorithms** using flood-fill
- **Weighted random symbol generation**
- **Cascading win calculations**
- **Multiplier accumulation and application**
- **Free spins bonus mechanics**
- **RTP calculation and analysis**

## Performance

- **Simulation Size**: 1,000,000 spins
- **Logging Frequency**: Every 1,000 rounds
- **Memory Management**: Efficient symbol pooling and matrix operations
- **Expected Runtime**: ~2-5 minutes depending on hardware

## Integration

The Gods of Glory simulation integrates seamlessly with the existing Sims_Library architecture, following the same patterns as other games while implementing the unique cluster-pay and tumbling mechanics of the Gates of Olympus style gameplay.