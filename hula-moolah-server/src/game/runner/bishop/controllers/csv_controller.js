/* eslint-disable import/order */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */

const fs = require('fs')

const settings = require('../settings/bishopSettings')

const reelsets = require('../../configs/sequences').get(settings.settingsKey)
const gameConfig = require('../../configs/settings').get(settings.settingsKey)
const context = require('../models/context')
const { round } = require('../utils/math')
const { updateDeviation } = require('./deviation')

const { BISHOP_CSV_OFF, BISHOP_DEBUG_ON, BISHOP_JSON_ON, BISHOP_SAVE_DEVIATION_STATS_ON } = process.env

const arrayToCSV = arr => {
  if (!arr) {
    return ''
  }
  let res = ''
  for (let i = 0; i < arr.length; i++) {
    res += '' + arr[i] + ','
  }
  return res
}

const arrOfArrToCsv = (rowLabels, arr) => {
  let res = ''
  for (let i = 0; i < arr.length; i++) {
    res += rowLabels[i]
    for (let j = 0; j < arr[i].length; j++) {
      res += arr[i][j] + ','
    }
    res += '\n'

  }
  res += '\n'
  return res
}

const exportVarianceToCsv = () => {
  if (BISHOP_CSV_OFF === 'true' || BISHOP_SAVE_DEVIATION_STATS_ON !== 'true') {
    return
  }

  const fs = require('fs')
  const dir = './out'

  let content = ''
  content += 'Wins Variance:\n\n'
  content += `Round Bet:,${settings.bet || 20},RoundsCount,${context.stats.iteration}\n\n`
  content += `Variance:,${context.deviation.variance}\n\n`
  content += `Standard Deviation:,${round(context.deviation.stdDeviation, 10000)}\n\n`
  content += `Game RTP:${context.stats.rtp}\n\n`

  content += 'Win,xBet,Prob,ProbX*(X-M)^2\n'
  Object.keys(context.deviation.pool).forEach(k => {
    content += `${k},${context.deviation.pool[k].xbet},${round(context.deviation.pool[k].prob, 100000000000)},${round(context.deviation.pool[k].probx, 10000000000000)}\n`
  })

  const strategy = settings.goldenBet > 1 ? 'GoldenBet' : 'RegularBet'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(`./out/${strategy}_Variance.csv`)) {
    fs.unlinkSync(`./out/${strategy}_Variance.csv`)
  }
  fs.writeFileSync(`./out/${strategy}_Variance.csv`, content, err => {
    if (err) {
      return console.log(err)
    }
  })
}

const exportSettingToCsv = () => {
  if (BISHOP_CSV_OFF === 'true') {
    return
  }

  const fs = require('fs')
  const dir = './out'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync('./out/settings.csv')) {
    fs.unlinkSync('./out/settings.csv')
  }
  let content = ''
  content += 'Math Settings:\n\n'
  content += 'PayTable:,x3,x4,x5\n'
  const symbolsCount = Object.keys(gameConfig.paytable).length - 3
  for (let s = 0; s <= symbolsCount; s++) {
    if (gameConfig.paytable[s]) {
      content += `Symbol ${s}:,${gameConfig.paytable[s][3]},${gameConfig.paytable[s][4]},${gameConfig.paytable[s][5]}\n`
    }
  }

  content += '\n\nReel Sets:\n\n'
  content += 'Base Game:\n'

  let length = reelsets.spin.length

  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.spin_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.spin_Set) + '\n\n'

  for (let count = 0; count < length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.spin[count]) + '\n'
  }

  content += '\n\nFree Game Reel Sets:\n\n'
  content += '\n'
  content += 'Free Spins 1:\n'
  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.freespins_0_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.freespins_0_Set) + '\n\n'
  length = reelsets.freespins_0.length
  for (let count = 0; count < length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.freespins_0[count]) + '\n'
  }

  content += '\n'
  content += 'Free Spins Spins Count \n'

  fs.writeFileSync('./out/settings.csv', content, err => {
    if (err) {
      return console.log(err)
    }
  })
}

const exportStatsToCsv = () => {
  if (BISHOP_CSV_OFF === 'true') {
    return
  }
  exportVarianceToCsv()

  const fs = require('fs')
  const dir = './out'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(`./out/stats_results_A_${context.stats.forcedAnimalSel}.csv`)) {
    fs.unlinkSync(`./out/stats_results_A_${context.stats.forcedAnimalSel}.csv`)
  }
  let content = ''
  content += `Test Date:,${context.stats.TestDate}\n\n`
  content += 'Game Title:, \n'
  content += `Iterations:,${context.stats.iteration}\n\n`

  content += `Bet:,${settings.bet}\n`
  content += `Total Bet:,${context.stats.totalBet}\n`
  content += `Total Payout:,${context.stats.totalPayOut}\n\n`

  content += `Variance:,${context.deviation.variance}\n`
  content += `Standard Deviation:,${context.deviation.stdDeviation}\n\n`

  content += `Game RTP:,${context.stats.rtp}\n`
  content += `Base Game RTP:,${context.bgStats.rtp}\n`
  content += `Free Spins RTP:,${context.fsStats.rtp},,Free Spins Hfq:,${context.fsStats.HF}\n\n`

  content += `Max Win Amount by Round:,${context.stats.MaxRoundTotalWin}\n\n`

  content += 'Base Game Reelset Stats \n'
  content += `Base Game Hit Frq:,${context.bgStats.paidSpinHF}\n\n`

  content += 'Base Game Symbols Stats:\n\n'
  content += 'Base Game Symbols Hits \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.bgStats.symbols, 'sym', 0, 10, 'Count')
  content += '\n'
  content += 'Base Game Symbols Wins \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.bgStats.symbols, 'sym', 0, 10, 'Wins')
  content += '\n'
  content += 'Base Game Symbols RTP \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.bgStats.symbols, 'sym', 0, 10, 'RTP')
  content += '\n'
  content += 'Base Game Symbols HitFrq \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.bgStats.symbols, 'sym', 0, 10, 'HF')
  content += '\n'

  content += 'Free Spins Overall Stats\n'
  content += `Free Spins Triggered:,${context.fsStats.triggered}\n`

  content += 'Free Spins Stats:\n\n'

  content += 'Free Spins Summary All Types \n'

  content += 'Free Spins Symbols Hits  \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.fsStats.symbols, 'sym', 0, 10, 'Count')
  content += '\n'
  content += 'Free Spins Symbols Wins  \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.fsStats.symbols, 'sym', 0, 10, 'Wins')
  content += '\n'
  content += 'Free Spins Symbols RTP \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.fsStats.symbols, 'sym', 0, 10, 'RTP')
  content += '\n'
  content += 'Free Spins Symbols HitFrq \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(context.fsStats.symbols, 'sym', 0, 10, 'HF')
  content += '\n'

  content += 'Free Spins Multi Boost Stats \n\n'

  function toStastStr(source, pref, from, to, tabl) {
    const pref_a = { Wins: 'w', Count: 'c', RTP: 'r', HF: 'h' }
    for (let i = from; i <= to; i++) {
      let resStr = ''
      if (source[i]) {
        for (let comb = 3; comb <= 5; comb++) {
          resStr += source[i][comb + ''] ? source[i][comb + ''][pref_a[tabl]] + ',' : ','
        }
        content += `${pref}${i},` + resStr + '\n'
      }
    }
  }

  fs.writeFileSync('./out/stats_results.csv', content, err => {
    if (err) {
      return console.log(err)
    }
  })
}

function checkSaveFileStatsOrCallBack(full) {
  if (context.stats.iteration % settings.fileUpdateOnEveryStep === 0 ||
    context.stats.iteration === settings.iterationsCount) {
    updateDeviation()
    exportStatsToCsv()
    let pathFile
    if (BISHOP_JSON_ON === 'true' && (full || context.stats.iteration === settings.iterationsCount)) {
      pathFile = `./out/results_${context.now}_${settings.settingsKey}.json`
      const dir = './out'
      !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true })
      fs.existsSync(pathFile) && fs.unlinkSync(pathFile)
      let content = '{"stats":' + JSON.stringify(context.stats)
      if (BISHOP_DEBUG_ON === 'true' && context.debug) {
        content += ',\n\r "debug":' + JSON.stringify(context.debug)
      }
      content += ',\n\r "deviation":' + JSON.stringify(context.deviation)
      content += ',\n\r "bgStats":' + JSON.stringify(context.bgStats)
      content += ',\n\r "fsStats":' + JSON.stringify(context.fsStats)
      content += '}'
      fs.writeFileSync(pathFile, content, err => console.log(err))
    }
    return pathFile
  }
}

module.exports = { exportSettingToCsv, checkSaveFileStatsOrCallBack }
