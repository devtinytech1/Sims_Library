const start = '/app'

module.exports.get = () => {
  return {
    'config.js': start + '/src/rng/config.js',
    'sequences.js': start + 'configs/sequences.js',
    'settings.js': start + '/src/game/runner/configs/settings.js',
    'action_init.js': start + '/src/game/runner/controllers/actions/action_init.js',
    'matrix_controller.js': start + '/src/game/runner/controllers/matrix_controller.js',
    'lines_controller.js': start + '/src/game/runner/controllers/lines_controller.js',
    'expanding_controller.js': start + '/src/game/runner/controllers/expanding_controller.js',
    'actions_controller.js': start + '/src/game/runner/controllers/actions_controller.js',
    'found_symbols.js': start + '/src/game/runner/math/found_symbols.js',
    'play.js': start + '/src/game/play.js',
  }
}
