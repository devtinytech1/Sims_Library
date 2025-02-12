/* eslint-disable import/order */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable import/order */
/* eslint-disable no-unused-vars */

const fs = require('fs')
const settings = require('../settings/bishopSettings')
const deviation = require('./deviation')
const reelsets = require('../../configs/sequences').get(settings.settingsKey)
const gameConfig = require('../../configs/settings').get(settings.settingsKey)
// const baseGameConfig = require('../../configs/settings').base
const debug = require('./debug')
const context = require('../models/context')
const mathUtils = require('../../../../../../../src/utils/math.cjs')

const { GAME, BISHOP_CSV_ON, BISHOP_JSON_ON } = process.env,
  dir = './out'

const arrayToCSV = arr => arr ? arr.reduce((acc, item) => `${acc}${item},`, '') : ''
const arrOfArrToCsvLables = (labels, arr) => arr.reduce((acc, item) => `${item.reduce((ac, it) => `${ac}${it},`, acc)}\n`,
    Object.values(labels).reduce((acc, label) => `${acc}${label},`, '') + '\n') + '\n'
const arrOfArrToCsv = (rowLabels, arr) =>
  arr.reduce((acc, item, ix) => item.reduce((ac, subItem) => `${ac}${subItem},`, rowLabels[ix]) + '\n', '') + '\n'
const arrOfArrColToCsv = (arr, col) => arr.reduce((acc, item) => `${acc}${item[col]},`, '')
const reelSetsToCsv = (reelsets, key, cols) => {
  const title = Array(reelsets[key].length).fill('').map((el, ix) => `reel${ix},`)
  return reelsets[key].reduce((acc, item, ix) => `${acc}set ${(ix + 1)}:\n${arrOfArrToCsv(title, item)}\n`, '') + '\n'
}

const exportVarianceToCsv = () => {
  if (BISHOP_CSV_ON === 'true') {
    const strategy = settings.goldenBet > 1 ? 'GoldenBet' : 'RegularBet',
      mainStatsModel = context.getMainStats(),
      devStats = context.getDeviation()

    let content = `${GAME} Wins Variance:\n\n`
    content += `Round Bet:,${settings.bet || 20},RoundsCount,${mainStatsModel.iteration}\n\n`
    content += `Variance:,${devStats.variance}\n\n`
    content += `Standard Deviation:,${mathUtils.round(devStats.stdDeviation, 10000)}\n\n`
    content += `Game RTP:${mainStatsModel.rtp}\n\n`
    content += 'Win,xBet,Prob,ProbX*(X-M)^2\n'
    Object.entries(devStats.pool).forEach(([win, obj]) =>
      content += `${win},${win*settings.bet},${mathUtils.round(obj.p, 100000000000)},${mathUtils.round(obj.px, 10000000000000)}\n`)

    saveFile(dir, `${dir}/${GAME}_${strategy}_Variance.csv`, content)
  }
}

const exportSettingToCsv = () => {
  if (BISHOP_CSV_ON !== 'true') {
    return
  }

  let content = `${GAME} Math Settings:\n\n`
  content += 'PayTable:,x3,x4,x5\n'
  const symbolsCount = Object.keys(gameConfig.paytable).length - 3
  for (let s = 0; s <= symbolsCount; s++) {
    if (gameConfig.paytable[s] != null) {
      content += `Symbol ${s}:,${gameConfig.paytable[s][3]},${gameConfig.paytable[s][4]},${gameConfig.paytable[s][5]}\n`
    }
  }

  content += '\n\nReel Sets:\n\n'
  content += 'Base Game:\n'

  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.spin_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.spin_Set) + '\n\n'

  for (let count = 0; count < reelsets.spin.length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.spin[count]) + '\n'
  }

  content += '\n\nFree Game Reel Sets:\n\n'
  content += '\n'
  content += 'Free Spins 1:\n'
  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.freespins_0_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.freespins_0_Set) + '\n\n'
  for (let count = 0; count < reelsets.freespins_0.length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.freespins_0[count]) + '\n'
  }
  content += 'Free Spins 2:\n'
  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.freespins_1_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.freespins_1_Set) + '\n\n'
  for (let count = 0; count < reelsets.freespins_1.length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.freespins_1[count]) + '\n'
  }
  content += 'Free Spins 3:\n'
  content += 'sets weights:,' + arrayToCSV(gameConfig.reelsSet.freespins_2_Prob) + '\n'
  content += 'sets index:,' + arrayToCSV(gameConfig.reelsSet.freespins_2_Set) + '\n\n'
  for (let count = 0; count < reelsets.freespins_2.length; count++) {
    content += 'set' + count + ':\n' + arrOfArrToCsv(['reel1,', 'reel2,', 'reel3,', 'reel4,', 'reel5,'], reelsets.freespins_2[count]) + '\n'
  }

  saveFile(dir, `${dir}/${settings.settingsKey}_${GAME}.csv`, content)
}

const exportStatsToCsv = () => {
  if (BISHOP_CSV_ON !== 'true') {
    return
  }

  exportVarianceToCsv()

  const mainStatsModel = context.getMainStats(),
    devStatsModel = context.getDeviation(),
    spinStatsModel = context.getSpinStats(),
    fsStatsModel = context.getFreespins()

  let content = `Test Date:,${mainStatsModel.TestDate}\n\n`
  content += `Game Title:, ${GAME}\n`
  content += `Iterations:,${mainStatsModel.iteration}\n\n`

  content += `Bet:,${settings.bet}\n`
  content += `Total Bet:,${mainStatsModel.totalBet}\n`
  content += `Total Payout:,${mainStatsModel.totalPayOut}\n\n`

  content += `Game RTP:,${context.main.rtp}\n`
  content += `Base Game RTP:,${spinStatsModel.base.rtp}\n`
  content += `Base game Wilds RTP:,${Math.round(spinStatsModel.base.expanding.HF * 100)/100},,Wilds Hfq:,${
    spinStatsModel.base.expanding.HF}\n`

  content += 'Free Spins:\n'
  content += `Free Spins Hfq:,${fsStatsModel.HF}\n`
  if (fsStatsModel.modes[0] != null)
  content += `FS Mode 1, RTP:,${fsStatsModel.modes[0].rtp}, Avg.Pay:,${fsStatsModel.modes[0].avg}\n`
  if (fsStatsModel.modes[1] != null)
  content += `FS Mode 2, RTP:,${fsStatsModel.modes[1].rtp}, Avg.Pay:,${fsStatsModel.modes[1].avg}\n`
  if (fsStatsModel.modes[2] != null)
  content += `FS Mode 3, RTP:,${fsStatsModel.modes[2].rtp}, Avg.Pay:,${fsStatsModel.modes[2].avg}\n\n`

  content += `Max Win Amount by Round:,${mainStatsModel.MaxRoundTotalWin}\n\n`

  content += 'Base Game Reelset Stats \n'
  content += `Base Game Hit Frq:,${Math.round((1 - devStatsModel.pool[0].p)*1000)/1000}\n\n`

  content += 'Base Game Symbols Stats:\n\n'
  content += 'Base Game Symbols Hits \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(spinStatsModel.base.symbols, 'sym', 0, 10, 'Count')
  content += '\n'
  content += 'Base Game Symbols Wins \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(spinStatsModel.base.symbols, 'sym', 0, 10, 'Wins')
  content += '\n'
  content += 'Base Game Symbols RTP \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(spinStatsModel.base.symbols, 'sym', 0, 10, 'RTP')
  content += '\n'
  content += 'Base Game Symbols HitFrq \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(spinStatsModel.base.symbols, 'sym', 0, 10, 'HF')
  content += '\n'

  content += 'Free Spins Stats:\n\n'

  content += 'Free Spins Symbols Hits  \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(fsStatsModel.base.symbols, 'sym', 0, 10, 'Count')
  content += '\n'
  content += 'Free Spins Symbols Wins  \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(fsStatsModel.base.symbols, 'sym', 0, 10, 'Wins')
  content += '\n'
  content += 'Free Spins Symbols RTP \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(fsStatsModel.base.symbols, 'sym', 0, 10, 'RTP')
  content += '\n'
  content += 'Free Spins Symbols HitFrq \n'
  content += 'Symbols: , x3,x4,x5 \n'
  toStastStr(fsStatsModel.base.symbols, 'sym', 0, 10, 'HF')
  content += '\n'

  function toStastStr(source, pref, from, to, tabl) {
    const pref_a = { Wins: 'w', Count: 'c', RTP: 'r', HF: 'h' }
    const symbolsArr = ['a','c','d','e','f','h','i','j','k','m']

    for (let i of symbolsArr) {
      let resStr = ''
      if (source[i] != null) {
        for (let comb = 3; comb <= 5; comb++) {
          if (source[i][comb] != null)
            resStr += source[i][comb + ''] != null ? source[i][comb + ''][pref_a[tabl]] + ',' : ','
        }
        content += `${pref}_${i},` + resStr + '\n'
      }
    }
  }

  saveFile(dir, `${dir}/stats_${settings.settingsKey}_${GAME}.csv`, content)
}

function saveFilesStats() {
  debug.update()
  deviation.update()
  exportStatsToCsv()
}

function finalize() {
  saveFilesStats()
  return BISHOP_JSON_ON === 'true' ?
    saveFile(dir, `${dir}/results_${GAME}_${context.now}_${settings.settingsKey}.json`,
      `{${context.outputFields.map(field => `\n\r "${field}":${JSON.stringify(context[field])}`).join(',')}}`) :
    null
}

function saveFile(dirName, fileName, data) {
  !fs.existsSync(dirName) && fs.mkdirSync(dirName, { recursive: true })
  fs.existsSync(fileName) && fs.unlinkSync(fileName)
  fs.writeFileSync(fileName, data, err => console.log(err))
  return fileName
}

const debugSave = settings.debugFileUpdate ?
  () => {
    const dir = `${dir}/${GAME}_${settings.settingsKey}`,
      pathFile = `${dir}/${Date.now()}_${context.getMainStats().iteration}.json`,
      content = `{${context.outputFields.map(field => `\n\r "${field}":${JSON.stringify(context[field])}`).join(',')}}`

    saveFile(dir, pathFile, content)
  } :
  () => {}

module.exports = { exportSettingToCsv, saveFilesStats, debugSave, saveFile, finalize }
