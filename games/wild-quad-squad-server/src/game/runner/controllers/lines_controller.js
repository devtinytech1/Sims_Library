
const { round } = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../configs/settings.js')

let multipierSymbols = ['H1', 'H2', 'H3', 'H4'];

function getLineModel(lineId, win, position, symbolId, trigger, len, count, multiplier=1) {
  return {
    id: lineId,
    win: win,
    len: len,
    count: count,
    trigger: trigger,
    mask: position,
    symbol: symbolId,
    multi: multiplier,
  }
}

function setWinModel(currentContext) {
  currentContext.win = {
    type: 'regular',
    lines: [],
    total: 0,
  }
  return currentContext.win
}

function UserDefinedMatrix(row, col) {
  this.row = row;
  this.col = col
}

function ResultMatrix(matrix, symbol) {
  this.matrix = matrix
  this.symbol = symbol
}
function printAdjacent(matrix, prow, pcol, symbol, newSymbol) {
  //console.log("Printing Adjacent symbols for position : " + pcol + prow + " symbol is : " + symbol)

  let matchedmatrix = [];
  for (var row = prow + 1; row >= 0 && row >= prow - 1; row--) {
    if (row > baseSettings.base.rows - 1)
      continue;
    let delta = 0
    if (row == prow) {
      delta = 1
    }
    for (var col = pcol + delta; col >= 0 && col >= pcol - delta; col--) {
      if (col > baseSettings.base.cols - 1)
        continue;
      if (!(prow === row && pcol === col)) {
        if (symbol === matrix[col][row] || matrix[col][row] === 'W' || newSymbol === matrix[col][row]) {
          let temp = new UserDefinedMatrix(row, col);
          matchedmatrix.push(temp);
        }
      }
    }
  }
  matchedmatrix.forEach(myPrintFunction);
  function myPrintFunction(value) {
    //console.log(value)
  }
  //console.log("--------------------------------------------------------------------------------------------------")
  return matchedmatrix;
}

function find_recursive(myvec, matchedmatrix1, symbol, currPositions, newSymbol) {
  let countedSymbols = []
  for (var index1 = 0; index1 < currPositions.length; index1++) {
    for (var i = 0; i < matchedmatrix1.length; i++) {
      if (matchedmatrix1[i].row === currPositions[index1].row && matchedmatrix1[i].col === currPositions[index1].col) {
        matchedmatrix1.splice(i, 1);
        i--;
      }
    }
  }

  currPositions.forEach(myFunction);
  function myFunction(value) {
    countedSymbols.push(value)
  }
  let nextSubSet = [];
  for (var index = 0; index < matchedmatrix1.length; index++) {
    let nextMatrix = printAdjacent(myvec, matchedmatrix1[index].row, matchedmatrix1[index].col, symbol, newSymbol);
    let temp = new UserDefinedMatrix(matchedmatrix1[index].row, matchedmatrix1[index].col);
    currPositions.push(temp)
    for (var index1 = 0; index1 < countedSymbols.length; index1++) {
      let col = countedSymbols[index1].col
      let row = countedSymbols[index1].row
      var symbol = myvec[col][row]
      //console.log(symbol);
      if (symbol === 'W')
        continue;
      for (var i = 0; i < nextMatrix.length; i++) {
        if (nextMatrix[i].row === countedSymbols[index1].row && nextMatrix[i].col === countedSymbols[index1].col) {
          nextMatrix.splice(i, 1);
          i--;
        }
      }
    }
    if (!nextMatrix.length)
      continue;
    else {
      nextMatrix.forEach(myInsertFunction)
      function myInsertFunction(value) {
        nextSubSet.push(value);
        countedSymbols.push(value)
      }
    }
  }

  if (!nextSubSet.length) {
    //console.log(currPositions)
    return currPositions;

  }
  else {
    return find_recursive(myvec, nextSubSet, symbol, currPositions, newSymbol);
  }
}

// for cluster win
async function checkClusterPays(client, matrix) {
  let finalResultMatrix = []
  let allPositions = []
  for (var col = 0; col < matrix.length; col++) {
    var rowElements = matrix[col];
    for (var row = 0; row < rowElements.length; row++) {

      let alreadyPartOf = false;
      if (allPositions.length != 0) {
        for (var index = 0; index < allPositions.length; index++) {
          if (row === allPositions[index].row && col === allPositions[index].col) {
            alreadyPartOf = true;
            break;
          }
        }
      }
      if (Boolean(alreadyPartOf)) {
        continue;
      }

      let symbol = matrix[col][row]

      if (symbol != 'S' && symbol != 'W') {
        let newSymbol = symbol
        let temp = new UserDefinedMatrix(row, col);
        var tempMatrix = [temp]
        var matchedmatrix = find_recursive(matrix, printAdjacent(matrix, row, col, symbol, null), symbol, tempMatrix, newSymbol);
        // To remove the duplicate object from array of object to a particular symbol
        var updateMatchedmatrix = matchedmatrix.filter(
          (object, index, self) =>
            index === self.findIndex((obj) => obj.row === object.row && obj.col === object.col)
        );

        updateMatchedmatrix.forEach(myInsertFunction)
        function myInsertFunction(value) {
          allPositions.push(value)
        }
        if (updateMatchedmatrix.length >= baseSettings.base.minCluster) {
          let temp = new ResultMatrix(updateMatchedmatrix, symbol)
          finalResultMatrix.push(temp, symbol)
        }
      }
    }
  }

  function setLineWin(mLineLength, mSymbol, mMask) {
    let finalMask = []
    for (index = 0; index < mMask.length; index++) {
      lineMask = [mMask[index].col, mMask[index].row]
      finalMask.push(lineMask)
    }
    var lineCount = 1
    const settings = baseSettings.get(client.gameId)
    const winModel = !client.node.context.win ? setWinModel(client.node.context) : client.node.context.win
    var win = round(lineCount * settings.paytable[mSymbol][mLineLength] * client.spinBet)

    var multiplier = 1
    //Apply multiplier to win value of H1,H2,H3,H4
    if (multipierSymbols.includes(mSymbol) && client.context.multiplierForSymbols[mSymbol] > 1) {
      multiplier = client.context.multiplierForSymbols[mSymbol]
      win = round(win * client.context.multiplierForSymbols[mSymbol])
      //console.log('multiplier applied to clusered win.')
    }
    //console.log('CLUSTER WIN - mSymbol:'+ mSymbol + '  ' + 'mLineLength:'+ mLineLength + '  win:' + win )
    winModel.total = round(winModel.total + win)
    winModel.lines.push(getLineModel(undefined, win, finalMask, mSymbol, null, mLineLength, lineCount, multiplier))
  }

  for (var winningLines = 0; winningLines < finalResultMatrix.length / 2; winningLines++) {
    setLineWin(finalResultMatrix[winningLines * 2].matrix.length, finalResultMatrix[winningLines * 2].symbol, finalResultMatrix[winningLines * 2].matrix)
  }
}

// for scatterPayWin
function scatterPayWin(client, mLineLength, mSymbol, mMask, multipier) {
  let finalMask = []
  for (index = 0; index < mMask.length; index++) {
    lineMask = [mMask[index][0], mMask[index][1]]
    finalMask.push(lineMask)
  }
  var lineCount = 1
  const settings = baseSettings.get(client.gameId)
  const winModel = !client.node.context.win ? setWinModel(client.node.context) : client.node.context.win
  var win = round(lineCount * settings.paytable[mSymbol][mLineLength] * client.spinBet)

  var multi = 1
  //Apply multiplier to win value
  if (multipier[mSymbol] > 1)
  {
    multi = multipier[mSymbol]
    win = round(win * multipier[mSymbol])
  }
  //console.log('SCATTER WIN: mSymbol:'+ mSymbol + '  ' + 'mLineLength:'+ mLineLength + '  win:' + win + ' ' + 'MULTIPLIER: '+ multipier[mSymbol])
  winModel.total = round(winModel.total + win)
  winModel.lines.push(getLineModel(undefined, win, finalMask, mSymbol, null, mLineLength, lineCount, multi))
}

function getClusters(matrix, symbol, minClusterSize) {
  const clusters = [];
  const visited = new Array(matrix.length).fill(null).map(() => new Array(matrix[0].length).fill(false));

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[0].length; col++) {
      if (!visited[row][col] && matrix[row][col] === symbol) {
        const cluster = findCluster(matrix, symbol, row, col, visited);
        if (cluster.length >= minClusterSize) {
          clusters.push(cluster);
        }
      }
    }
  }

  return clusters;
}

function findCluster(matrix, symbol, row, col, visited) {
  if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
    return [];
  }

  if (visited[row][col] || matrix[row][col] !== symbol) {
    return [];
  }

  visited[row][col] = true;
  const clusterPositions = [[row, col]];

  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    clusterPositions.push(...findCluster(matrix, symbol, newRow, newCol, visited));
  }

  return clusterPositions;
}
function payWildClusterWin(client, wildClusters) {
  var lineCount = 1
  const settings = baseSettings.get(client.gameId)
  const winModel = !client.node.context.win ? setWinModel(client.node.context) : client.node.context.win
  var maxMultiplier = findMaxMultiplier(client.context.multiplierForSymbols)
  for (var i = 0; i < wildClusters.length; i++) {
    var wCluster = wildClusters[i]
    var win = round(lineCount * settings.paytable['W'][wCluster.length] * client.spinBet)
    //Apply max multiplier to win value
    if (maxMultiplier > 1) {
      win = round(win * maxMultiplier)
    }
    winModel.total = round(winModel.total + win)
    winModel.lines.push(getLineModel(undefined, win, wCluster, 'W', null, wCluster.length, lineCount, maxMultiplier))
  }
}
function findMaxMultiplier(multiplierForSymbols) {
  let maxMultiplier = 1;

  for (const symbol in multiplierForSymbols) {
    if (multiplierForSymbols.hasOwnProperty(symbol)) {
      const multiplier = multiplierForSymbols[symbol];
      if (multiplier > maxMultiplier) {
        maxMultiplier = multiplier;
      }
    }
  }

  return maxMultiplier;
}

module.exports = { checkClusterPays, scatterPayWin, getClusters, payWildClusterWin, setWinModel }
