
const mathUtils = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../configs/settings.js'),
  wilds = baseSettings.base.wilds,
  empty = baseSettings.base.blank,
  scatters = baseSettings.base.scatters,
  itsWildSymbol = id => wilds.includes(id),
  itsEmptySymbol = id => empty.includes(id),
  itsScatterSymbol = id => scatters.includes(id)

const settingsLinesCount = 1

function getLineModel(lineId, win, position, symbolId, trigger, len, count) {
  return {
    id: lineId,
    win: win,
    len: len,
    count: count,
    trigger: trigger,
    mask: position,
    symbol: symbolId,
    multi: 1,
  }
}

function makeWinModel(client, currentContext) {
  currentContext.win = {
    type: 'regular',
    lines: [],
    total: 0,
  }
  client.getWinModel = () => currentContext.win
  return currentContext.win
}

function setLineMulti(winModel, line, multi) {
  winModel.total -= line.win
  line.win /= line.multi
  line.multi *= multi
  line.win = mathUtils.round(line.win * line.multi)
  winModel.total = mathUtils.round(winModel.total + line.win)
}

function applySymbolLinesMultiplier(currentContext, sym, multi) {
  currentContext.win.lines.forEach(line => sym === line.symbol && setLineMulti(currentContext.win, line, multi))
}

/**
 * Win lines check code below for 9 winlines as per math
 */

function checkDefaultLines(client, matrix) {

  const winModel = makeWinModel(client, client.node.context)
  const settingsGame = baseSettings.get(client.gameId)

  let firstSK, nextSK, lineSK, lineMask, wildLine, nextWild, firstLineWild, lineMaskForMSym, lineMaskForHSym, col2Sym, thirdLineWild, firstSym, secondSym, thirdSym

  function winLineNode(lineNumber) {
      const lineWin = mathUtils.round(settingsGame.paytable[lineSK][lineMask.length] * client.spinBet / settingsLinesCount)
      winModel.lines.push(getLineModel(lineNumber, lineWin, lineMask, lineSK, null, lineMask.length))
      winModel.total = mathUtils.round(winModel.total + lineWin)
  }
  function winLineNodeForMsym(lineNumber, payingSym, lineMaskForMSym) {
    const lineWin = mathUtils.round(settingsGame.paytable[payingSym][lineMaskForMSym.length] * client.spinBet / settingsLinesCount)
    winModel.lines.push(getLineModel(lineNumber, lineWin, lineMaskForMSym, payingSym, null,lineMaskForMSym.length))
    winModel.total = mathUtils.round(winModel.total + lineWin)
  }

  for (let lineID = 0; lineID < baseSettings.base.lines.length; lineID++) {
    firstSK = matrix[0][baseSettings.base.lines[lineID][0]]
    col2Sym = undefined
    wildLine = itsWildSymbol(firstSK)
    if (!itsScatterSymbol(firstSK) || itsWildSymbol(firstSK)) {
      lineMask = [[0, baseSettings.base.lines[lineID][0]]]
      lineMaskForHSym = [[0, baseSettings.base.lines[lineID][0]]]
      lineMaskForMSym = [[0, baseSettings.base.lines[lineID][0]]]
      firstSym = matrix[0][baseSettings.base.lines[lineID][0]]
      secondSym = matrix[1][baseSettings.base.lines[lineID][1]]
      thirdSym = matrix[2][baseSettings.base.lines[lineID][2]]

      lineSK = firstSK
      nextWild = false
      for (let column = 1; column < baseSettings.base.cols; column++) {
        nextSK = matrix[column][baseSettings.base.lines[lineID][column]]
        thirdLineWild = matrix[2][baseSettings.base.lines[lineID][2]]
        firstLineWild = matrix[0][baseSettings.base.lines[lineID][0]]
        nextWild = itsWildSymbol(nextSK)
        if (!itsScatterSymbol(nextSK) && !itsEmptySymbol(firstSym) && !itsEmptySymbol(secondSym) && !itsEmptySymbol(thirdSym) && ((firstSym === secondSym && secondSym === thirdSym) || (firstSym === secondSym && (thirdSym === 'W1' || thirdSym === 'W2' || thirdSym === 'W3')) || ((firstSym === 'W1' || firstSym === 'W2' || firstSym === 'W3') && secondSym === thirdSym) || ((firstSym === 'W1' ||firstSym === 'W2' || firstSym === 'W3') && (thirdSym === 'W1' || thirdSym === 'W2' || thirdSym === 'W3')))) {
          lineMask.push([column, baseSettings.base.lines[lineID][column]])
          if (wildLine && !nextWild) {
            wildLine = false
            lineSK = nextSK
          }
          if (lineMask.length === baseSettings.base.cols) {
            winLineNode(lineID + 1)
          }
        } else if (!itsScatterSymbol(nextSK) && !itsEmptySymbol(firstSym) && !itsEmptySymbol(secondSym) && !itsEmptySymbol(thirdSym) && ((firstSym === 'H1' || firstSym === 'W1' || firstSym === 'W2' || firstSym === 'W3') && (thirdSym === 'H1' || thirdSym === 'W1' || thirdSym === 'W2' || thirdSym === 'W3'))) {
          if (wildLine && !nextWild) {
            wildLine = false
            lineSK = nextSK
          }
          if (secondSym === 'H1x2') {
            lineMaskForHSym.push([column, baseSettings.base.lines[lineID][column]])
            if (lineMaskForHSym.length === baseSettings.base.cols) {
              winLineNodeForMsym(lineID + 1, 'H1x2', lineMaskForHSym)
            }
          } else if (secondSym === 'H1x3') {
            lineMaskForHSym.push([column, baseSettings.base.lines[lineID][column]])
            if (lineMaskForHSym.length === baseSettings.base.cols) {
              winLineNodeForMsym(lineID + 1, 'H1x3', lineMaskForHSym)
            }
          } else if (secondSym === 'H1x5') {
            lineMaskForHSym.push([column, baseSettings.base.lines[lineID][column]])
            if (lineMaskForHSym.length === baseSettings.base.cols) {
              winLineNodeForMsym(lineID + 1, 'H1x5', lineMaskForHSym)
            }
          }
        } else if (!itsScatterSymbol(nextSK) && !itsEmptySymbol(firstSym) && !itsEmptySymbol(secondSym) && !itsEmptySymbol(thirdSym) && ((firstSym === secondSym && firstSym !== thirdSym) || (firstSym === thirdSym && secondSym !== firstSym) || (secondSym === thirdSym && firstSym !== secondSym) || ((firstSym === 'W1' || firstSym === 'W2' || firstSym === 'W3') && secondSym !== thirdSym) || (firstSym !== secondSym && (thirdSym === 'W1' || thirdSym === 'W2' || thirdSym === 'W3')) || (firstSym !== secondSym && secondSym !== thirdSym && firstSym !== thirdSym))) {
          if ((firstSym === 'M1' || firstSym === 'M2' || firstSym === 'M3' || firstSym === 'W1' || firstSym === 'W2' || firstSym === 'W3') && (secondSym === 'M1' || secondSym === 'M2' || secondSym === 'M3') && (thirdSym === 'M1' || thirdSym === 'M2' || thirdSym === 'M3' || thirdSym === 'W1' || thirdSym === 'W2' || thirdSym === 'W3')) {
            lineMaskForMSym.push([column, baseSettings.base.lines[lineID][column]])
            if (lineMaskForMSym.length === baseSettings.base.cols) {
              winLineNodeForMsym(lineID + 1, 'MX', lineMaskForMSym)
            }
          }
        } else {
          if (settingsGame.paytable[lineSK] && settingsGame.paytable[lineSK][lineMask.length]) {
            winLineNode(lineID + 1)
          }
          column = baseSettings.base.cols
        }
      }
    }
  }
}

module.exports = { setLineMulti, applySymbolLinesMultiplier, makeWinModel, checkDefaultLines }
