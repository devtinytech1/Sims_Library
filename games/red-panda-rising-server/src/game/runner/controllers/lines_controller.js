const mathUtils = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../configs/settings.js')
const { getLineModel, makeWinModel, setLineMulti } = require('../../../../../../src/game/runner/controllers/main_lines_controller.cjs'),

  wilds = baseSettings.base.wilds,
  scatters = baseSettings.base.scatters,
  itsWildSymbol = id => wilds.includes(id),
  itsScatterSymbol = id => scatters.includes(id)

const settingsLinesCount = 1

// function setLineMulti(winModel, line, multi) {
//   winModel.total -= line.win
//   line.win /= line.multi
//   line.multi *= multi
//   line.win = mathUtils.round(line.win * line.multi)
//   winModel.total = mathUtils.round(winModel.total + line.win)
// }

function checkWays(client, matrix) {
  const settings = baseSettings.get(client.gameId),
    symbols = matrix.reduce((acc, reel) => {
      acc.push(reel.reduce((ac, sym) => {
        itsScatterSymbol(sym) || (ac[sym] = ac[sym] ? ac[sym] + 1 : 1)
        return ac
      }, {}))
      return acc
    }, []),
    winModel = makeWinModel(client, client.context)

  const setLinesWin = function (symbol, length, count) {
    if (settings.paytable[symbol] && settings.paytable[symbol][length]) {
      const win = mathUtils.round(count * settings.paytable[symbol][length] * client.spinBet)
      winModel.total = mathUtils.round(winModel.total + win)
      const mask = []
      for (let col = 0; col < length; col++) {
        matrix[col].forEach((sym, ix) => (sym === symbol || itsWildSymbol(sym)) && mask.push([col, ix]))
      }
      winModel.lines.push(getLineModel(undefined, win, mask, symbol, null, length, count))
      symbols.forEach(reel => reel[symbol] && delete reel[symbol])
    }
  }

  const nextWay = function (symbol, symbols, col, lineSymbol, value) {
    const wildsCount = symbols[col][settings.WI] || 0
    if (itsWildSymbol(lineSymbol)) {
      Object.entries(symbols[col]).forEach(([sym, count]) => itsWildSymbol(sym) || (col + 1 < symbols.length ?
        nextWay(sym, symbols, col + 1, sym, value * (count + wildsCount)) :
        setLinesWin(sym, symbols.length, value * (count + wildsCount))))

      wildsCount && (col + 1 < symbols.length ?
        nextWay(settings.WI, symbols, col + 1, settings.WI, value * wildsCount) :
        setLinesWin(settings.WI, symbols.length, value * wildsCount))
    }
    else {
      const symbolCount = symbols[col][symbol]
      if (symbolCount || wildsCount) {
        const cnt = symbolCount && wildsCount ? symbolCount + wildsCount : symbolCount ? symbolCount : wildsCount
        col < symbols.length - 1 ?
          nextWay(symbol, symbols, col + 1, symbol, value * cnt) :
          setLinesWin(symbol, symbols.length, value * cnt)
      }
      else {
        setLinesWin(symbol, col, value)
      }
    }
  }

  const wildsStartCount = symbols[0][settings.WI] || 0
  Object.entries(symbols[0]).forEach(([sym, count]) =>
    itsWildSymbol(sym) || nextWay(sym, symbols, 1, sym, count + wildsStartCount))

  wildsStartCount && nextWay(settings.WI, symbols, 1, settings.WI, wildsStartCount)
}

function checkDefaultLines(client, matrix) {

  const winModel = makeWinModel(client, client.node.context)
  const settingsGame = baseSettings.get(client.gameId)

  let firstSK, nextSK, lineSK, lineMask, wildLine, nextWild

  function winLineNode(lineNumber) {
    const lineWin = mathUtils.round(settingsGame.paytable[lineSK][lineMask.length] * client.spinBet / settingsLinesCount)
    winModel.lines.push(getLineModel(lineNumber, lineWin, lineMask, lineSK))
    winModel.total = mathUtils.round(winModel.total + lineWin)
  }

  for (let lineID = 0; lineID < baseSettings.base.lines.length; lineID++) {
    firstSK = matrix[0][baseSettings.base.lines[lineID][0]]
    if (!itsScatterSymbol(firstSK) || itsWildSymbol(firstSK)) {
      lineMask = [[0, baseSettings.base.lines[lineID][0]]]
      wildLine = itsWildSymbol(firstSK)
      lineSK = firstSK
      nextWild = false
      for (let column = 1; column < baseSettings.base.cols; column++) {

        nextSK = matrix[column][baseSettings.base.lines[lineID][column]]
        nextWild = itsWildSymbol(nextSK)
        if (wildLine && !itsScatterSymbol(nextSK) || nextWild || !wildLine && lineSK === nextSK) {
          lineMask.push([column, baseSettings.base.lines[lineID][column]])
          if (wildLine && !nextWild) {
            wildLine = false
            lineSK = nextSK
          }
          if (lineMask.length === baseSettings.base.cols) {
            winLineNode(lineID + 1)
          }
        }
        else {
          if (settingsGame.paytable[lineSK] && settingsGame.paytable[lineSK][lineMask.length]) {
            winLineNode(lineID + 1)
          }
          column = baseSettings.base.cols
        }
      }
    }
  }
}

function getScatterWin(client, mask) {
  const winModel = client.getWinModel()
  const settingsGame = baseSettings.get(client.gameId)
  const win = settingsGame.paytable.S[mask.length]
  client.getFeatures().scatterWin = mathUtils.round(win * client.spinBet)
  const scatterWinAmount = mathUtils.round(win * client.spinBet)
  winModel.total = mathUtils.round(winModel.total + scatterWinAmount)
}

module.exports = { checkWays, setLineMulti, makeWinModel, checkDefaultLines, getScatterWin }
