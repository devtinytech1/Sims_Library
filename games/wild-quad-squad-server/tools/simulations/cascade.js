const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs')
const matrix_controller = require('../simulations/matrix_controller')
const { check_to_replace_scatter_basegame_cascade, replace_scatter_cascade,
  check_to_replace_wild_basegame_cascade, replace_Wild_cascade, check_to_replace_wild_FS_cascade, replace_Wild_FS_cascade
} = require('../../../../src/sims_data/features/wild_scatter_replace_feature.cjs')
const { setWinModel } = require('../../src/game/runner/controllers/lines_controller.js')

async function handleFreeSpinsCascade(clientClone, winMatrix, destroyArray, reelsSet) {
  clientClone.nextTrigger = TRIGGER.SPIN

  clientClone.matrix = await matrix_controller.getCascade(clientClone, winMatrix, destroyArray, reelsSet)
  if (reelsSet === 'freegames_cascade') {
    var wildReplace = await check_to_replace_wild_FS_cascade(clientClone)
    if (wildReplace) {
      clientClone.matrix = await replace_Wild_FS_cascade(clientClone, clientClone.matrix, destroyArray)
    }
  }

  clientClone.matrix = await matrix_controller.check(clientClone, clientClone.matrix)

  if (clientClone.nextTrigger === TRIGGER.CASCADE) {
    var cascadeObj = createCascadeObject(clientClone, 'cluster')
    clientClone.cascade.push(cascadeObj)
    await handleFreeSpinsCascade(clientClone, cascadeObj.matrix, cascadeObj.destroy, 'freegames_cascade')
  }
  else if (clientClone.nextTrigger === TRIGGER.SPIN) {
    const hasWild = clientClone.matrix.some(row => row.includes('W'));
    if (hasWild) {
      clientClone.context.unMatchedWild = true
      clientClone.matrix = await matrix_controller.checkReavealedWild(clientClone, clientClone.matrix)
      if (clientClone.nextTrigger === TRIGGER.CASCADE) {
        var cascadeObj = createCascadeObject(clientClone, 'scatter')
        clientClone.cascade.push(cascadeObj)
        await handleFreeSpinsCascade(clientClone, cascadeObj.matrix, cascadeObj.destroy, 'freegames_cascade')
      }
    }
  }
}

function createCascadeEndFS(clientClone) {
  if (clientClone.nextTrigger === TRIGGER.SPIN) {
    var cascadeObj = createCascadeObject(clientClone, 'cascade_end')
    clientClone.cascade.push(cascadeObj)
    var positionsOfW = findPositionsOfValue(cascadeObj.matrix, 'W');
    if (positionsOfW.length > 0) {
      clientClone.node.context.stickyWildPosition = positionsOfW
    }
    else {
      clientClone.node.context.stickyWildPosition = []
    }
  }
}

async function handleBaseGameCascade(clientClone, winMatrix, destroyArray, reelsSet) {
  clientClone.nextTrigger = TRIGGER.SPIN
  // to get the matrix for cascade
  clientClone.matrix = await matrix_controller.getCascade(clientClone, winMatrix, destroyArray, reelsSet)

  if (reelsSet === 'basegame_cascade') {
    var scatterReplace = await check_to_replace_scatter_basegame_cascade(clientClone)
    if (scatterReplace) {
      clientClone.matrix = await replace_scatter_cascade(clientClone, clientClone.matrix, destroyArray)
    }
    var wildReplace = await check_to_replace_wild_basegame_cascade(clientClone)
    if (wildReplace) {
      clientClone.matrix = await replace_Wild_cascade(clientClone, clientClone.matrix, destroyArray)
    }
  }

  //clientClone.matrix = [['K', 'H1', 'H2', 'K', 'W', 'J'], ['H1', 'K', 'H1', 'H3', 'A', 'H3'], ['A', 'K', 'W', 'K', 'H1', 'A'],['M1', 'M2', 'A', 'J', 'A', 'W'], ['H1', 'J', 'H4', 'Q', 'H1', 'H2'], ['H1', 'H4', 'W', 'H3', 'H1', 'J'],]

  //clientClone.matrix = [['H1', 'H1', 'H2', 'K', 'H1', 'A'], ['H1', 'J', 'S', 'H3', 'H1', 'J'], ['A', 'K', 'H2', 'A', 'H4', 'H3'],
  //['M1', 'M2', 'S', 'H3', 'A', 'Q'], ['H1', 'S', 'A', 'H4', 'H1', 'H2'], ['H1', 'H1', 'H2', 'H3', 'H1', 'H2'],]

  clientClone.matrix = await matrix_controller.check(clientClone, clientClone.matrix)

  if (clientClone.nextTrigger === TRIGGER.CASCADE) {
    //create a cascade object and reset client clone object
    var cascadeObj = createCascadeObject(clientClone, 'cluster')
    clientClone.cascade.push(cascadeObj)
    await handleBaseGameCascade(clientClone, cascadeObj.matrix, cascadeObj.destroy, 'basegame_cascade')
  }
  else if (clientClone.nextTrigger === TRIGGER.SPIN) {
    // To check if there is wild 
    const hasWild = clientClone.matrix.some(row => row.includes('W'));
    if (hasWild) {
      clientClone.context.unMatchedWild = true
      clientClone.matrix = await matrix_controller.checkReavealedWild(clientClone, clientClone.matrix)
      if (clientClone.nextTrigger === TRIGGER.CASCADE) {
        //create a cascade object and reset client clone object
        var cascadeObj = createCascadeObject(clientClone, 'scatter')
        clientClone.cascade.push(cascadeObj)
        await handleBaseGameCascade(clientClone, cascadeObj.matrix, cascadeObj.destroy, 'basegame_cascade')
      }
    }
  }
}

function createCascadeEndBG(clientClone) {
  if (clientClone.nextTrigger === TRIGGER.SPIN) {
    var cascadeObj = createCascadeObject(clientClone, 'cascade_end')
    clientClone.cascade.push(cascadeObj)
  }
}

function createCascadeObject(clientClone, winType) {
  var cascadeObj = {}

  var customWin = {}
  if (clientClone.node.context.win) {
    customWin = {
      total: clientClone.node.context.win.total,
      type: clientClone.node.context.win.type,
    };
  }
  //Arrage the win lines as per descending win value.
  if (clientClone.node.context.win) {
    if (clientClone.node.context.win.lines.length > 1) {
      clientClone.node.context.win.lines.sort((a, b) => b.win - a.win)
    }
  }
  switch (winType) {
    case "cluster":
      cascadeObj = {
        winType: winType,
        matrix: clientClone.matrix,
        multiplierForSymbols: JSON.parse(JSON.stringify(clientClone.context.multiplierForSymbols)),
        destroy: clientClone.node.context.destroy,
        win: customWin,
        lines: { map: clientClone.node.context.win.lines.slice(), totalWin: clientClone.node.context.win.total },
        spinTotal: clientClone.node.spinTotal
      }
      break;
    case "scatter":
      cascadeObj = {
        winType: winType,
        matrix: clientClone.matrix,
        multiplierForSymbols: JSON.parse(JSON.stringify(clientClone.context.multiplierForSymbols)),
        unMatchedWild: clientClone.context.unMatchedWild,
        destroy: clientClone.node.context.destroy,
        revealedSymbolsAndItsPositions: clientClone.node.context.revealedSymbolsAndItsPositions,
        revealSymbol: clientClone.node.context.revealSymbol,
        wildRevealSymbol: clientClone.node.context.wildRevealSymbol,
        win: customWin,
        lines: { map: clientClone.node.context.win.lines.slice(), totalWin: clientClone.node.context.win.total },
        spinTotal: clientClone.node.spinTotal
      }
      break;
    case "cascade_end":
      setWinModel(clientClone.context)
      delete clientClone.context.win.lines
      cascadeObj = {
        winType: winType,
        matrix: clientClone.matrix,
        multiplierForSymbols: JSON.parse(JSON.stringify(clientClone.context.multiplierForSymbols)),
        unMatchedWild: clientClone.context.unMatchedWild,
        win: clientClone.context.win,
        spinTotal: clientClone.node.spinTotal
      }
      if (clientClone.node.context.hasOwnProperty('wildRevealSymbol')) {
        cascadeObj.wildRevealSymbol = clientClone.node.context.wildRevealSymbol
      }
      if (clientClone.node.context.hasOwnProperty('revealedSymbolsAndItsPositions')) {
        cascadeObj.revealedSymbolsAndItsPositions = clientClone.node.context.revealedSymbolsAndItsPositions
      }
      break;
  }
  //clear the client object
  delete clientClone.context.destroy
  delete clientClone.context.matrix
  delete clientClone.context.win
  delete clientClone.matrix

  var prevFreeSpins = {}
  if (clientClone.node.context.hasOwnProperty('freespins')) {
    var prevFreeSpins = JSON.parse(JSON.stringify(clientClone.node.context.freespins))
    clientClone.node.context = {}
    clientClone.node.context.freespins = prevFreeSpins
  }
  else {
    clientClone.node.context = {}
  }
  return cascadeObj
}


function findPositionsOfValue(matrix, value) {
  const positions = [];

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === value) {
        positions.push([row, col]);
      }
    }
  }

  return positions;
}

module.exports = { handleBaseGameCascade, handleFreeSpinsCascade, createCascadeEndFS, createCascadeEndBG }
