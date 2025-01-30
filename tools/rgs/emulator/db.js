const isFun = true
const country = 'ua'
const balance = 10000

const store = {}

const defaultRound = { open: false, balance: 0 }

function save(id, value) {
  const { state, params } = value
  const data = store[id]
  data.state = state
  if (params) {
    const { gameRoundOver, totalBet, totalWin } = params
    const { round } = data
    if (!round.open) {
      data.balance -= totalBet
    }
    data.round.balance += totalWin
    data.round.open = true
    if (gameRoundOver) {
      data.balance += round.balance
      data.round = JSON.parse(JSON.stringify(defaultRound))
    }
  }
  return data
}

function load(id) {
  store[id] = store[id] ? store[id] : common()
  return store[id]
}

function common() {
  return {
    round: JSON.parse(JSON.stringify(defaultRound)),
    isFun,
    country,
    balance,
    state: {},
  }
}

module.exports = { save, load }
