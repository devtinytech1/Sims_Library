/* eslint-disable no-console */

const fs = require('fs')
const context = require('../models/context')
const settings = require('../settings/bishopSettings')

const gameSettings = require(`../../configs/${settings.settingsKey}`)

const setUserStats = process.env.BISHOP_USER_ON === 'true' ? execute : () => { }
const stats = []

let currentUser = getUser()

function execute(currentTrigger, data) {
  currentUser.setStats(currentTrigger, data)
}

function toggleUser(reason) {
  currentUser.status = reason
  stats.push(currentUser.getShortModel())
  currentUser = getUser()
}

function getUser() {
  return {
    balance: settings.userStats.balance,
    spin: { cnt: 0 },
    win: {
      spin: 0,
      total: 0,
      max: 0,
      maxSpin: 0,
    },
    limits: settings.userStats.limits || {},
    triggers: [],
    status: 'created',
    setStats: function () {
      this.triggers.push(context.currentTrigger)
      if (context.currentTrigger === 'spin' || context.currentTrigger === 'buy_bonus') {
        this.spin.cnt++
        this.balance -= context.currentTrigger === 'buy_bonus' ?
          settings.bet * gameSettings.buyBonusBetMultiplier :
          settings.bet * settings.goldenBet
      }
      if (context.win) {
        this.balance += context.win
        if (context.win > this.win.max) {
          this.win.max = context.win
        }
        this.win.total += context.win
        this.win.spin += context.win
      }
      if (context.call.trigger === 'spin') {
        if (this.win.maxSpin < this.win.spin) {
          this.win.maxSpin = this.win.spin
        }

        if (this.balance < settings.bet * settings.goldenBet) {
          toggleUser('balance')
        }
        else if (this.checkLimits()) {
          this.win.spin = 0
          this.triggers = []
        }
      }
    },
    checkLimits: function () {
      Object.keys(this.limits).forEach(limitType =>
        Object.keys(this.limits[limitType]).forEach(limitName => {
          if (currentUser === this && this[limitType][limitName] >= this.limits[limitType][limitName]) {
            toggleUser(`${limitType}_${limitName}`)
          }
        }))
      return currentUser === this
    },
    getShortModel: function () {
      return {
        balance: this.balance,
        spin: this.spin,
        win: this.win,
        triggers: this.triggers,
        status: this.status,
      }
    },
  }
}

function saveUserStats() {
  if (stats.length) {
    const all = Object.assign(getBaseModel(stats.length), { status: {} })
    function getBaseModel(cnt = 0) {
      return {
        cnt,
        sum: getStatsModel(),
        avg: getStatsModel(),
      }
    }
    function getStatsModel() {
      return {
        balance: 0,
        total: 0,
        max: 0,
        spins: 0,
      }
    }
    function setSum(user, to = all) {
      to.sum.balance += user.balance
      to.sum.total += user.win.total
      to.sum.max += user.win.max
      to.sum.spins += user.spin.cnt
      if (to === all) {
        // eslint-disable-next-line no-unused-expressions
        !all.status[user.status] ? all.status[user.status] = getBaseModel(1) : all.status[user.status].cnt++
        setSum(user, all.status[user.status])
      }
    }
    stats.forEach(user => setSum(user))
    function setAvg(baseModel) {
      baseModel.avg.balance = baseModel.sum.balance / baseModel.cnt
      baseModel.avg.total = baseModel.sum.total / baseModel.cnt
      baseModel.avg.max = baseModel.sum.max / baseModel.cnt
      baseModel.avg.spins = baseModel.sum.spins / baseModel.cnt
    }
    setAvg(all)
    Object.values(all.status).forEach(setAvg)
    fs.writeFileSync(`./out/users_${Date.now()}.json`,
      JSON.stringify({ all, stats }), err => {
        if (err) {
          return console.log(err)
        }
      })
  }
}

module.exports = { setUserStats, saveUserStats }
