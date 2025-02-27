
const { round } = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../configs/settings.js')
const { getLineModel, setLineMulti } = require('../../../../../../src/game/runner/controllers/main_lines_controller.cjs')

const settingsLinesCount = 1

function setWinModel(currentContext) {
  currentContext.win = {
    type: 'regular',
    lines: [],
    total: 0,
  }
  return currentContext.win
}

function applyAllLinesMultiplier(currentContext, multi) {
  currentContext.win.lines.forEach(line => setLineMulti(currentContext.win, line, multi))
}

function checkWinAny(client) {

  const searchForPairInList = (a, b) =>
    baseSettings.base.reelitemstoignore.findIndex(([first, second]) =>
      (first === a && second === b) || (first === b && second === a)
    );
  const winModel = !client.node.context.win ? setWinModel(client.node.context) : client.node.context.win
  const settingsGame = baseSettings.get(client.gameId)


  for (let index = 0; index < baseSettings.base.winany.length; index++) {
    var mask = [];
    const symbol = baseSettings.base.winany[index];

    for (let col = 0; col < baseSettings.base.cols; col++) {
      for (let row = 0; row < client.node.context.matrix[col].length; row++) {
        sym = client.node.context.matrix[col][row]
        if (sym == symbol && (searchForPairInList(col, row) == -1)) {
          mask.push([col, row])
        }

      }
    }
    const symbolKey = symbol
    const lineLength = mask.length
    if (settingsGame.paytable[symbolKey] && settingsGame.paytable[symbolKey][lineLength]) {
      const win = round(settingsGame.paytable[symbolKey][lineLength] * client.spinBet)
      winModel.total = round(winModel.total + win)
      winModel.lines.push(getLineModel(undefined, win, mask, symbolKey, null, mask.length, 1))
    }
  }
}

function checkDefaultLines(client, matrix) {
  const winModel = setWinModel(client.node.context)
  const settingsGame = baseSettings.get(client.gameId)

  let firstSK, nextSK, lineSK, lineMask, wildLine, nextWild

  function winLineNode(lineNumber) {
    const lineWin = round(settingsGame.paytable[lineSK][lineMask.length] * client.spinBet / settingsLinesCount)
    winModel.lines.push(getLineModel(lineNumber, lineWin, lineMask, lineSK))
    winModel.total = round(winModel.total + lineWin)
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

function check576Lines(client) {
  const settings = baseSettings.get(client.gameId), symbols = []
  let name = '', sym = ''
  const winModel = !client.node.context.win ? setWinModel(client.node.context) : client.node.context.win

  const searchForPairInList = (a, b) =>
    baseSettings.base.reelitemstoignore.findIndex(([first, second]) =>
      (first === a && second === b) || (first === b && second === a)
    );

  const setLinesWin = function (symbolKey, lineLength, lineCount) {
    if (settings.paytable[symbolKey] && settings.paytable[symbolKey][lineLength]) {
      const win = round(lineCount * settings.paytable[symbolKey][lineLength] * client.spinBet)
      winModel.total = round(winModel.total + win)
      const mask = []
      for (let col = 0; col < lineLength; col++) {
        for (let row = 0; row < baseSettings.base.rows; row++) {
          if ('' + client.node.context.matrix[col][row] === '' + symbolKey || itsWildSymbol(client.node.context.matrix[col][row]) ||
            (symbolKey.slice(0, 2) == 'H1' && client.node.context.matrix[col][row].slice(0, 2) == 'H1')) {
            if ((searchForPairInList(col, row) == -1)) {
              mask.push([col, row])
            }
          }
        }
      }
      winModel.lines.push(getLineModel(undefined, win, mask, symbolKey, null, lineLength, lineCount))
    }
  }

  const checkNext243 = function (symbol, symbols, col, lineSymbol, value) {
    if (lineSymbol === 'wild') {
      if (symbols[col].wild && col + 1 === symbols.length) {
        setLinesWin(settings.WI, symbols.length, value * symbols[col].wild)
      }
      else {
        for (const s in symbols[col]) {
          // eslint-disable-next-line no-unused-expressions
          col + 1 < symbols.length ?
            checkNext243(s, symbols, col + 1, s, value * symbols[col][s]) :
            setLinesWin(s, symbols.length, value * symbols[col][s])
        }
      }
    }
    else {
      if (symbols[col][symbol]) {
        if (col + 1 < symbols.length) {
          // eslint-disable-next-line no-unused-expressions
          symbols[col].wild ?
            checkNext243(symbol, symbols, col + 1, symbol, value * (symbols[col][symbol] + symbols[col].wild)) :
            checkNext243(symbol, symbols, col + 1, symbol, value * symbols[col][symbol])
        }
        else {
          // eslint-disable-next-line no-unused-expressions
          symbols[col].wild ?
            setLinesWin(symbol, symbols.length, value * (symbols[col][symbol] + symbols[col].wild)) :
            setLinesWin(symbol, symbols.length, value * symbols[col][symbol])
        }
      }
      else if (symbols[col].wild) {
        // eslint-disable-next-line no-unused-expressions
        col + 1 < symbols.length ?
          checkNext243(symbol, symbols, col + 1, symbol, value * symbols[col].wild) :
          setLinesWin(symbol, symbols.length, value * symbols[col].wild)
      }
      else if (settings.paytable[symbol] && settings.paytable[symbol][col]) {
        setLinesWin(symbol, col, value)
      }
    }
  }

  for (let col = 0; col < baseSettings.base.cols; col++) {
    symbols.push({})
    for (let row = 0; row < client.node.context.matrix[col].length; row++) {
      sym = client.node.context.matrix[col][row]
      if (sym.slice(0, 2) == 'H1') {
        sym = 'H1'
      }
      if (!itsScatterSymbol(sym) && (!itsWinAnySymbol(sym)) && (searchForPairInList(col, row) == -1)) {
        name = itsWildSymbol(sym) ? 'wild' : sym
        symbols[col][name] = symbols[col][name] + 1 || 1
      }
    }
  }

  for (const symbol in symbols[0]) {
    checkNext243(symbol, symbols, 1, symbol, symbols[0][symbol])
  }
}

const itsWildSymbol = function (id) {
  return baseSettings.base.wilds.includes(id)
}

const itsScatterSymbol = function (id) {
  return baseSettings.base.scatters.includes(id)
}

const itsWinAnySymbol = function (id) {
  return baseSettings.base.winany.includes(id)
}

module.exports = { checkDefaultLines, check576Lines, setLineMulti, applyAllLinesMultiplier, checkWinAny }
