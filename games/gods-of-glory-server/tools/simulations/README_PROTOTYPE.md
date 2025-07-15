# Gods of Glory - Prototype Mode

## Overview

The prototype mode is an interactive game designer tool that allows you to play Gods of Glory step-by-step to validate game mechanics and player experience. This mode provides visual console output with colorized symbols, detailed payout breakdowns, and comprehensive feature tracking.

## How to Use

### Quick Start

1. Navigate to the simulations directory:
   ```bash
   cd /path/to/gods-of-glory-server/tools/simulations/
   ```

2. Run the prototype launcher:
   ```bash
   node prototype.js
   ```

3. Follow the on-screen instructions and press ENTER to play spins

### Features

#### Visual Matrix Display
- **Colorized Symbols**: Each symbol type has its own color and short name
  - `GOD` (Yellow) - High value symbol H1
  - `ZEU` (Blue) - High value symbol H2  
  - `HAD` (Magenta) - High value symbol H3
  - `POS` (Cyan) - High value symbol H4
  - `A♠`, `K♠`, `Q♠`, `J♠`, `10♠` (White) - Low value symbols
  - `SCT` (Green background) - Scatter symbols
  - `MUL` (Red background) - Multiplier symbols

#### Game Information Display
- **Spin Header**: Shows spin number and bet amount
- **Win Breakdown**: Detailed cluster information with payouts
- **Feature Triggers**: Highlights when cascades, free spins, or multipliers activate
- **Cascade Steps**: Step-by-step visualization of tumbling reels
- **Session Statistics**: Comprehensive tracking of RTP, features, and big wins

#### Interactive Controls
- **ENTER**: Play next spin
- **"stats"**: View detailed session statistics
- **"help"**: Show available commands
- **"quit"** or **"exit"**: End prototype session

## Designer Benefits

### Validation Features
1. **Mechanic Verification**: See exactly how cluster pays form and calculate
2. **Feature Flow**: Visualize cascade sequences and feature interactions
3. **Payout Analysis**: Real-time win multiplier and RTP tracking
4. **Player Experience**: Experience the game flow as a player would

### Statistical Tracking
- Total spins played
- RTP calculation
- Feature trigger frequencies
- Big win tracking (5x+ bet wins)
- Average win per spin

### Visual Feedback
- Clear matrix display with symbol positioning
- Color-coded symbols for easy identification
- Highlighted winning clusters
- Step-by-step cascade visualization
- Feature activation notifications

## Example Session

```
═══════════════════════════════════════════════════════════
                    SPIN #1 - BET: $1.00
═══════════════════════════════════════════════════════════

🎰 INITIAL MATRIX:
┌─ Initial Spin ─┐
│  GOD │ ZEU │ HAD │ POS │ A♠  │ K♠  │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  Q♠  │ J♠  │ 10♠ │ GOD │ ZEU │ HAD │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  POS │ A♠  │ K♠  │ Q♠  │ J♠  │ 10♠ │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  GOD │ GOD │ GOD │ GOD │ GOD │ GOD │
├─────┼─────┼─────┼─────┼─────┼─────┤
│  GOD │ GOD │ GOD │ ZEU │ HAD │ POS │
└─────────────────────────────────────┘

💰 BASE GAME WIN:
Total Win: $25.00
Clusters Found: 1

📊 CLUSTER BREAKDOWN:
1. GOD × 9 symbols = $25.00 (25.0x bet)

📈 SPIN SUMMARY:
Base Game Win: $25.00
TOTAL WIN: $25.00
Win Multiplier: 25.00x bet
🌟 BIG WIN! 🌟

Press ENTER for next spin (or type command)...
```

## Configuration

The prototype mode uses the same game settings as the main simulation. You can modify:

- **Bet Amount**: Edit the `spinBet` in `prototype.js`
- **Symbol Display**: Modify `SYMBOL_DISPLAY` in `prototype_mode.js`
- **Colors**: Adjust `COLORS` constants in `prototype_mode.js`

## Technical Notes

- Uses ANSI color codes for console styling
- Implements readline for interactive input
- Deep clones client state for isolated testing
- Compatible with existing game logic and settings
- Provides comprehensive error handling and validation

## Troubleshooting

### Common Issues

1. **Colors not displaying**: Your terminal may not support ANSI colors
2. **Input not working**: Ensure your terminal supports readline
3. **Missing symbols**: Check that all game symbols are defined in settings

### Requirements

- Node.js environment
- Terminal with ANSI color support
- Readline compatible console

This prototype mode provides a powerful tool for game designers to validate mechanics, test player experience, and ensure game balance before deploying to production.