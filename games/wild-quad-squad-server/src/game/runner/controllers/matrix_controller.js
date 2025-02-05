const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings')
const randomController = require('../math/random_controller')
const { checkClusterPays, getClusters, scatterPayWin, payWildClusterWin } = require('./lines_controller')
const { checkRoundWin } = require('./round_win_controller')
const { cascadeFeatureCheck } = require('./features/cascade_feature')
const { TRIGGER } = require('../../../../../../src/game/runner/configs/static.cjs')
const { symbolRevealFeatureCheck } = require('./features/reveal_feature')
const { willTheWildFlip, willTheWildFlipInFS, } = require('./features/wild_scatter_replace_feature')
const { executeMultiplierFeature } = require('./features/random_multiplier_feature')


const symbolToFind = 'W';
const minClusterSize = 5;

async function make(client, spinMod, rows) {
  // for recovery 
  // if (baseSequences.get(client.gameId)['default_spin_position'] && !client.node.state) {
  //   return baseSequences.get(client.gameId)['default_spin_position'];
  // }
  const settings = baseSettings.get(client.gameId)
  if (settings.reelsSet[spinMod + '_Prob']) {
    const option = await randomController.getRandomItemByArrayWeights(client, settings.reelsSet[spinMod + '_Prob'],
      settings.reelsSet[spinMod + '_Set'])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await randomController.getRandomItems(client, sequences[ix], { count: rows, ix })
      result.push(body.result)
      let condition = ix === baseSettings.base.cols - 1
      return condition ? result : await getReel(ix + 1)
    }
    return await getReel(0)
  }
  else {
    return Promise.reject(`spin mode: ${spinMod}`)
  }
}

async function getCascade(client, beforeMatrix, destroyArray, spinMod) {
  const settings = baseSettings.get(client.gameId),
    weight = settings.reelsSet[spinMod + '_cascade_Prob']
  if (weight) {
    let matrix = [],
      option = await randomController.getRandomItemByArrayWeights(client, weight, settings.reelsSet[spinMod + '_cascade_Set']),
      sequences = baseSequences.get(client.gameId)[spinMod][option],
      destroyMap = destroyArray.map(mask => `${mask[0]}_${mask[1]}`)

    for (let i = 0; i < baseSettings.base.cols; i++) {
      const reel = []
      for (let j = 0; j < baseSettings.base.rows; j++) {
        if (!destroyMap.includes(`${i}_${j}`)) {
          reel.push(beforeMatrix[i][j])
        }
      }
      if (reel.length < baseSettings.base.rows) {
        const diffCount = baseSettings.base.rows - reel.length,
          sequenceNew = sequences[i].map(el => el)
        for (let c = 0; c < diffCount; c++) {
          sequenceNew.push(sequences[i][c])
        }
        let pos = await randomController.getRandomInt(client, sequences[i].length) + diffCount
        while (reel.length < baseSettings.base.rows) {
          reel.unshift(sequenceNew[pos])
          pos--
        }
      }
      matrix.push(reel)
    }
    return matrix
  }
  return Promise.reject('wrong cascade reels probability settings')
}

function foundSymbols(matrix, symbol) {
  return matrix.reduce((acc, reel, col) => {
    reel.forEach((sym, row) => sym === symbol && acc.push([col, row]))
    return acc
  }, [])
}

//checking for wild flip in base game
async function wildFlippingProbInBaseGame(client, matrix) {
  let canFlip = false
  let revealWildPositions = []
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === 'W') {
        // flip prob for basegame
        canFlip = await willTheWildFlip(client)
        if (canFlip) {
          await revealSymbolAndSetPositions(client, matrix, row, col, 'basegame')
          revealWildPositions.push([row, col])
        } else {
          var index = [row, col]
          //console.log('No-Flip Wild: (' + index + ')' )
        }
      }
    }
  }

  let willItpaySymbol = []
  let multi
  let positionOfWildRevealdSymbol = []
  let revealedSymbolsAndItsPositions = {
    symbols: willItpaySymbol,
    positions: positionOfWildRevealdSymbol
  }

  /* For each Wild Position, check if there is a revealed symbol, 
      if yes, then check the count of revealed symbol, 
        if count is >= 5, then revealed symbol stays as is
        if count is <5, then revealed symbol changes back to Wild
  */

  revealWildPositions.forEach(wildPos => {
    let revelSymbol = matrix[wildPos[0]][wildPos[1]]
    if (matrix.flat().filter(symbol => symbol === revelSymbol).length >= 5) {
      //putting the paying WildRevealed Symbol into array
      willItpaySymbol.push(revelSymbol)
      // just to show on client side
      positionOfWildRevealdSymbol.push(wildPos)

      //Multiplier of that symbol
      multi = executeMultiplierFeature(client, revelSymbol);
    }
    else {
      // Change  back revealed symbol to Wild again
      matrix[wildPos[0]][wildPos[1]] = 'W'
    }
  })
  // to show on client side
  client.node.context.wildRevealSymbol = willItpaySymbol
  revealedSymbolsAndItsPositions = {
    symbols: willItpaySymbol,
    positions: positionOfWildRevealdSymbol
  }
  client.node.context.revealedSymbolsAndItsPositions = revealedSymbolsAndItsPositions

  let revealSymbolsArray = willItpaySymbol
  revealSymbolsArray = [...new Set(revealSymbolsArray)];

  if (revealSymbolsArray.length != 0) {
    client.node.context.revealSymbol = revealSymbolsArray
    toGetThePositionOfRevealSymbol(client, matrix, revealSymbolsArray, multi)
  }
}

function toGetThePositionOfRevealSymbol(client, matrix, revealSymbolsArray, multi) {
  const symbolAndItsPositions = {};

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const symbol = matrix[i][j];
      if (revealSymbolsArray.includes(symbol)) {
        if (symbolAndItsPositions.hasOwnProperty(symbol)) {
          symbolAndItsPositions[symbol].push([i, j]);
        } else {
          symbolAndItsPositions[symbol] = [[i, j]];
        }
      }
    }
  }
  setWinningForRevealedSymbol(client, symbolAndItsPositions, multi)
}

function setWinningForRevealedSymbol(client, symbolAndItsPositions, multi) {
  for (const symbol in symbolAndItsPositions) {
    const position = symbolAndItsPositions[symbol];
    scatterPayWin(client, position.length, symbol, position, multi)
  }
}

//if wild revealed symbol then its reveled symbol positions is set 
async function revealSymbolAndSetPositions(client, matrix, row, col, gameType) {
  const settings = baseSettings.get(client.gameId)
  // randomly getting any of the Higher Symbol
  var revealSym = ''
  if (gameType === 'basegame') {
    revealSym = await randomController.getRandomItemByArrayWeights(client, settings.features['reveal_symbol_Prob'],
      settings.features['reveal_symbol_Set'])
  }
  else if (gameType === 'freespins') {
    revealSym = await randomController.getRandomItemByArrayWeights(client, settings.features['fs_reveal_symbol_Prob'],
      settings.features['fs_reveal_symbol_Set'])
  }
  matrix[row][col] = revealSym
}

// checking for wild flip in free sipn 
async function wildFlippingProbInFS(client, matrix) {
  let canFlip = false
  let revealWildPositions = []
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === 'W') {
        // flip prob for FreeSpin
        canFlip = await willTheWildFlipInFS(client)
        if (canFlip) {
          revealWildPositions.push([row, col])
          await revealSymbolAndSetPositions(client, matrix, row, col, 'freespins')
        } else {
          var index = [row, col]
          //console.log('No-Flip Wild: (' + index + ')' )
        }
      }
    }
  }

  let willItpaySymbol = []
  let multi
  let positionOfWildRevealdSymbol = []
  let revealedSymbolsAndItsPositions = {
    symbols: willItpaySymbol,
    positions: positionOfWildRevealdSymbol
  }

  /* For each Wild Position, check if there is a revealed symbol, 
      if yes, then check the count of revealed symbol, 
        if count is >= 5, then revealed symbol stays as is
        if count is <5, then revealed symbol changes back to sticky wild 
       ------------------ For Free Spin-------------------------------
  */
  revealWildPositions.forEach(wildPos => {
    let revelSymbol = matrix[wildPos[0]][wildPos[1]]
    if (matrix.flat().filter(symbol => symbol === revelSymbol).length >= 5) {
      // Pushing Pay symbol Revealed By Wilds into an array
      willItpaySymbol.push(revelSymbol)
      positionOfWildRevealdSymbol.push(wildPos)
      //adding multiplier to respective symbols
      multi = executeMultiplierFeature(client, revelSymbol);
    }
    else {
      matrix[wildPos[0]][wildPos[1]] = 'W'
    }
  })
  // to show on client side
  client.node.context.wildRevealSymbol = willItpaySymbol


  let revealSymbolsArray = willItpaySymbol
  revealedSymbolsAndItsPositions = {
    symbols: willItpaySymbol,
    positions: positionOfWildRevealdSymbol
  }
  client.node.context.revealedSymbolsAndItsPositions = revealedSymbolsAndItsPositions

  revealSymbolsArray = [...new Set(revealSymbolsArray)];

  if (revealSymbolsArray.length != 0) {
    client.node.context.revealSymbol = revealSymbolsArray
    toGetThePositionOfRevealSymbol(client, matrix, revealSymbolsArray, multi)
  }
}

async function check(client, matrix) {
  checkClusterPays(client, matrix)
  const wildClusters = getClusters(client.matrix, symbolToFind, minClusterSize)
  if (wildClusters.length > 0) {
    payWildClusterWin(client, wildClusters)
  }
  checkRoundWin(client)
  cascadeFeatureCheck(client)
  return matrix
}


//To check will wild reveal or not and win and destroy matrix of reveal symbols if symbol revelead 
async function checkReavealedWild(client, matrix) {
  //for baseGame wild check 
  if (client.nextState === TRIGGER.SPIN) {
    //to check will wild flip or not
    await wildFlippingProbInBaseGame(client, matrix)
  }
  //for freeSpin Wild check 
  else {
    await wildFlippingProbInFS(client, matrix)
  }
  checkRoundWin(client)
  symbolRevealFeatureCheck(client)
  return matrix
}


module.exports = { make, foundSymbols, check, checkReavealedWild, getCascade }
