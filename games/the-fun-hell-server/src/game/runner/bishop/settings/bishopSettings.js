
const  { SETTINGS_KEY, BISHOP_ITERATIONS, BISHOP_DEBUG_FILE_UPDATE, BISHOP_FILE_UPDATE, BISHOP_CONSOLE_UPDATE } = process.env
module.exports = {
  settingsKey: SETTINGS_KEY ? SETTINGS_KEY : 'settings94',
  iterationsCount: BISHOP_ITERATIONS ? parseInt(BISHOP_ITERATIONS) : 10000000000,
  bet: 1,
  goldenBet: 1,
  consoleUpdate: BISHOP_CONSOLE_UPDATE ? parseInt(BISHOP_CONSOLE_UPDATE) : 10000,
  fileUpdate: BISHOP_FILE_UPDATE ? parseInt(BISHOP_FILE_UPDATE) : 10000,
  debugFileUpdate: BISHOP_DEBUG_FILE_UPDATE && parseInt(BISHOP_DEBUG_FILE_UPDATE) ? parseInt(BISHOP_DEBUG_FILE_UPDATE) : 0,
  choice: {
    weights: [10, 10, 10],
    values: [0, 1, 2],
  },
}
