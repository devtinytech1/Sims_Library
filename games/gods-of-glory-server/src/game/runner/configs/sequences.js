// Reel sequences for Gods of Glory
// Each reel contains weighted symbol distribution

const symbols = ['SCATTER', 'MULTIPLIER', 'ZEUS', 'CHALICE', 'RING', 'COIN', 'BLUE_GEM', 'GREEN_GEM', 'RED_GEM', 'PURPLE_GEM', 'YELLOW_GEM'];

// Base game reel sequences (weighted distribution)
const basegameSequences = {
  reel1: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'COIN', 'RING', 'RING', 'CHALICE', 'CHALICE', 'ZEUS',
    'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE', 'ZEUS',
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE'
  ],
  reel2: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'COIN', 'RING', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE', 'ZEUS',
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE'
  ],
  reel3: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'COIN', 'RING', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE', 'ZEUS',
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE'
  ],
  reel4: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'COIN', 'RING', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE', 'ZEUS',
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE'
  ],
  reel5: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'COIN', 'RING', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE', 'ZEUS',
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE'
  ]
};

// Free spins sequences (slightly different distribution, more multipliers)
const freespinsSequences = {
  reel1: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM',
    'RED_GEM', 'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE',
    'ZEUS', 'MULTIPLIER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE'
  ],
  reel2: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM',
    'RED_GEM', 'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE',
    'ZEUS', 'MULTIPLIER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE'
  ],
  reel3: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM',
    'RED_GEM', 'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE',
    'ZEUS', 'MULTIPLIER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE'
  ],
  reel4: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM',
    'RED_GEM', 'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE',
    'ZEUS', 'MULTIPLIER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE'
  ],
  reel5: [
    'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM', 'GREEN_GEM', 'BLUE_GEM',
    'COIN', 'RING', 'CHALICE', 'ZEUS', 'ZEUS',
    'MULTIPLIER', 'MULTIPLIER', 'SCATTER', 'YELLOW_GEM', 'PURPLE_GEM',
    'RED_GEM', 'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE',
    'ZEUS', 'MULTIPLIER', 'YELLOW_GEM', 'PURPLE_GEM', 'RED_GEM',
    'GREEN_GEM', 'BLUE_GEM', 'COIN', 'RING', 'CHALICE'
  ]
};

const sequences = {
  basegame: basegameSequences,
  freespins: freespinsSequences
};

function get(gameMode = 'basegame') {
  return sequences[gameMode] || sequences.basegame;
}

module.exports = { get, sequences, basegameSequences, freespinsSequences };