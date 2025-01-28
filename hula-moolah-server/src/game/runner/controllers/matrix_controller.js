const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings.js')
const { getRandomItems, getRandomItem, getRandomItemByArrayWeights } = require('../math/random_controller')

async function getMatrix(client, spinMod, rows) {
  if (baseSequences.get(client.gameId)['default_spin_position'] && !client.node.state) {
    return baseSequences.get(client.gameId)['default_spin_position'];
  }
  const settings = baseSettings.get(client.gameId)

  if (settings.reelsSet[spinMod + '_Prob']) {
    const option = await getRandomItemByArrayWeights(client, settings.reelsSet[spinMod + '_Prob'],
      settings.reelsSet[spinMod + '_Set'])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await getRandomItems(client, sequences[ix], { count: rows, ix })
      result.push(body.result)
      return ix === sequences.length - 1 ? result : await getReel(ix + 1)
    }
    return await getReel(0)
  }
  else {
    return Promise.reject(`spin mode: ${spinMod}`)
  }
}

// Initial matrix for HNS
async function getMatrixForHNS(client, spinMod, rows) {
  const result = [],
    sequences = baseSequences.get(client.gameId)[spinMod];

  // Old implementation
  // const getReel = async function (ix, count) {
  //   if (count <= 0) {
  //     return result;
  //   }
  //   const body = await getRandomItems(client, sequences[ix % sequences.length], { count: rows, ix });
  //   result.push(body.result);
  //   return await getReel(ix + 1, count - 1);
  // };
  // return await getReel(0, 5); // Call getReel 5 times

  for (let ix = 0; result.length < 18; ix++) {
    const body = await getRandomItem(client, sequences[ix % sequences.length], { count: 18 - result.length, ix });
    result.push(...body.result);
  }

  return result;
}

async function generateHoldnSpinInitialMatrix(client, matrix) {
  const settings = baseSettings.get(client.gameId).features.holdnspin
  let isReset = false;
  const hsreels = matrix;
  var TRIG = settings.symbols[0];
  var COR = settings.symbols[1];

  for (let i = 0; i < hsreels.length; i++) {
    if (hsreels[i] === COR) {
      isReset = true;
      client.node.context.holdnspin.holdnspin_matrix[[i]][0] = 'COR'
      client.node.context.holdnspin.currentLandedCORPositions.push(i);
    }
    if (hsreels[i] === TRIG) {
      isReset = true;
      client.node.context.holdnspin.holdnspin_matrix[[i]][0] = 'TRIG'
      client.node.context.holdnspin.currentLandedTRIGPositions.push(i);
    }
  }
  const hnsMatrix = client.node.context.holdnspin.holdnspin_matrix
  return { hnsMatrix, isReset };
}

function convertMatrix(matrix) {
  const result = []
  for (let col = 0; col < baseSettings.base.cols; col++) {
    for (let row = 0; row < baseSettings.base.rows; row++) {
      if (!(row === 0 && col === 0) && !(row === 0 && col === 4)) {
        result.push(matrix[col][row])
      }
    }
  }
  return result
}

// Regular matrix for HNS
async function getMatrixForHNSRegular(client, spinMod) {
  const result = [];
  const sequences = baseSequences.get(client.gameId)[spinMod];

  for (let ix = 0; result.length < 18; ix++) {
    const body = await getRandomItem(client, sequences[ix % sequences.length], { count: 18 - result.length, ix });
    result.push(...body.result);
  }

  return result;
}

async function generateHoldnSpinMatrix(client, holdnspin_matrix, matrixHNS) {
  const hnsMatrix = holdnspin_matrix.map(row => [...row]);
  let isReset = false;
  const settings = baseSettings.get(client.gameId).features.holdnspin
  var TRIG = settings.symbols[0];
  var COR = settings.symbols[1];

  for (let i = 0; i < matrixHNS.length; i++) {
    if (holdnspin_matrix[i][0] === 'B') {
      if (matrixHNS[i] === COR) {
        isReset = true;
        client.node.context.holdnspin.currentLandedCORPositions.push(i);
        hnsMatrix[[i]][0] = 'COR'
      }
      if (matrixHNS[i] === TRIG) {
        isReset = true;
        client.node.context.holdnspin.currentLandedTRIGPositions.push(i);
        hnsMatrix[[i]][0] = 'TRIG'
      }
    }
  }

  return { hnsMatrix, isReset };
}



module.exports = { getMatrix, getMatrixForHNS, getMatrixForHNSRegular, generateHoldnSpinMatrix, generateHoldnSpinInitialMatrix }
