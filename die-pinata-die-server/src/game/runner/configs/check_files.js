const start = '/app'

module.exports.get = () => {
  return {
    'bishop.js': start + '/src/game/runner/bishop/bishop.js',
    'config.js': start + '/src/rng/config.js',
    'sequences.js': start + '/src/game/runner/configs/sequences.js',
    'settings.js': start + '/src/game/runner/configs/settings.js',
    'action_init.js': start + '/src/game/runner/controllers/actions/action_init.js',
    'action_spin.js': start + '/src/game/runner/controllers/actions/action_spin.js',
    'matrix_controller.js': start + '/src/game/runner/controllers/matrix_controller.js',
    'lines_controller.js': start + '/src/game/runner/controllers/lines_controller.js',
    'expanding_controller.js': start + '/src/game/runner/controllers/expanding_controller.js',
    'actions_controller.js': start + '/src/game/runner/controllers/actions_controller.js',
    'found_symbols.js': start + '/src/game/runner/math/found_symbols.js',
    'random_controller.js': start + '/src/game/runner/math/random_controller.js',
    'play.js': start + '/src/game/play.js',
  }
}
