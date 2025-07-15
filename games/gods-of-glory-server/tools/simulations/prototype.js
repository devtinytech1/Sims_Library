/**
 * Gods of Glory - Prototype Mode Launcher
 * 
 * Simple launcher script for Gods of Glory prototype mode.
 * Run this script to start interactive prototype gameplay.
 * 
 * Usage: node prototype.js
 */

const { startPrototypeModeForGodsOfGlory } = require('./prototype_mode.js');

// Mock client configuration for prototype mode
const prototypeClient = {
  gameId: 'gods-of-glory',
  spinBet: 1.00,
  roundBet: 1.00,
  betMultiplier: 1,
  winCap: 10000,
  node: {
    spinBet: 1.00,
    spinTotal: 0,
    context: {}
  },
  context: {},
  prototypeMode: true
};

// Start prototype mode
console.log('Starting Gods of Glory Prototype Mode...\n');

startPrototypeModeForGodsOfGlory(prototypeClient)
  .then(() => {
    console.log('Prototype mode ended.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in prototype mode:', error);
    process.exit(1);
  });