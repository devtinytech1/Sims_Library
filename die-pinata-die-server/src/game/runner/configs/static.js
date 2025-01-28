
// eslint-disable-next-line import/group-exports
module.exports.KEY = Object.freeze({
  INVALID_ACTION: 'invalid_action',
  TRY_LIMIT: 'try_limit',
  INVALID_BET: 'invalid_bet',
  INVALID_INDEX: 'invalid_index',
  INVALID_LEFT_COUNT : 'invalid_left_count'
})

// eslint-disable-next-line import/group-exports
module.exports.TRIGGER = Object.freeze({
  INIT: 'init',
  SPIN: 'spin',
  CHOICE: 'choice',
  FREESPINS: 'freespins',
  FREESPINS_END: 'freespins_end',
  BONUS: 'bonus',
  BONUS_END: 'bonus_end',
  BUY_BONUS: 'buy_bonus',
  RESPIN: 'respin',
  DESTROY: 'destroy',
})

// eslint-disable-next-line import/group-exports
module.exports.WIN = Object.freeze({
  TYPE_BIG: 'big',
  TYPE_MEGA: 'mega',
  TYPE_EPIC: 'epic',
  TYPE_SUPER: 'super',
})
