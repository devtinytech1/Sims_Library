const start = '/app'

module.exports.get = () => {
  return {
    'bishop.js': start + '/src/game/runner/bishop/bishop.js',
    'config.js': start + '/src/rng/config.js',
    'sequences.js': start + '/src/game/runner/configs/sequences.js',
    'settings.js': start + '/src/game/runner/configs/settings.js',
    'action_bonus_end.js': start + '/src/game/runner/controllers/actions/action_bonus_end.js',
    'action_freespin_node.js': start + '/src/game/runner/controllers/actions/action_freespin_node.js',
    'action_init_node.js': start + '/src/game/runner/controllers/actions/action_init_node.js',
    'action_spin_node.js': start + '/src/game/runner/controllers/actions/action_spin_node.js',
    'matrix_controller.js': start + '/src/game/runner/controllers/matrix_controller.js',
    'lines_controller.js': start + '/src/game/runner/controllers/lines_controller.js',
    'expanding_controller.js': start + '/src/game/runner/controllers/expanding_controller.js',
    'node_controller.js': start + '/src/game/runner/controllers/node_controller.js',
    'found_scatters.js': start + '/src/game/runner/math/found_scatters.js',
    'found_symbols.js': start + '/src/game/runner/math/found_symbols.js',
    'random_controller.js': start + '/src/game/runner/math/random_controller.js',
    'base_freespins_model.js': start + '/src/game/runner/models/base_freespins_model.js',
    'bonus_model.js': start + '/src/game/runner/models/bonus_model.js',
    'play.js': start + '/src/game/play.js',
  }
}
