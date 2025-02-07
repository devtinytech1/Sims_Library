const baseSettings = require('../../src/game/runner/configs/settings.js')
const { generateHoldnSpinMatrix, getMatrixForHNS, getMatrixForHNSRegular, generateHoldnSpinInitialMatrix } = require('../../src/game/runner/controllers/matrix_controller')
const { getRandomItemByArrayWeights } = require('../../../../src/game/runner/math/main_random_controller.cjs')
const { round } = require('../../../../src/utils/math.cjs')
const baseSequences = require('../../src/game/runner/configs/sequences.js')

function setHoldnspinModel(currentContext, count, hns_triggering_matrix, triggerWin, isHnsBGTriggered, isHnsFGTriggered) {

  currentContext.holdnspin = {
    isHnsBGTriggered: isHnsBGTriggered,
    isHnsFGTriggered: isHnsFGTriggered,
    currentLandedTRIGPositions: [],
    currentLandedCORPositions: [],
    totalWin: 0,
    triggerWin: triggerWin,
    spinsRemaining: count,
    spinsReset: false,
    spinResetValue: 0,
    trigActivations: [],
    totalCorCount: [],
    currentCORValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    preUpgradeCORValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    holdnspin_matrix: [['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B'], ['B']],
    hns_triggering_matrix: JSON.parse(JSON.stringify(hns_triggering_matrix)),
    special_trig: [],
    specialTrigMultipliers: [],
  }
}

async function initHoldnspin(client, settings, triggerWin, isHnsBGTriggered, isHnsFGTriggered) {
  setHoldnspinModel(client.node.context, settings.spincount, client.node.context.matrix, triggerWin, isHnsBGTriggered, isHnsFGTriggered)
  await execute(client)
}

async function populateTrigActivations(client, holdnspin_matrix) {
  const postion_map = new Map();
  postion_map.set(0, [1, 3, 4, 5]);
  postion_map.set(1, [0, 2, 4, 5, 6]);
  postion_map.set(2, [1, 5, 6]);
  postion_map.set(3, [0, 4, 7, 8]);
  postion_map.set(4, [0, 1, 3, 5, 7, 8, 9]);
  postion_map.set(5, [0, 1, 2, 4, 6, 8, 9, 10]);
  postion_map.set(6, [1, 2, 5, 9, 10]);
  postion_map.set(7, [3, 4, 8, 11, 12]);
  postion_map.set(8, [3, 4, 5, 7, 9, 11, 12, 13]);
  postion_map.set(9, [4, 5, 6, 8, 10, 12, 13, 14]);
  postion_map.set(10, [5, 6, 9, 13, 14]);
  postion_map.set(11, [7, 8, 12, 15]);
  postion_map.set(12, [7, 8, 9, 11, 13, 15, 16]);
  postion_map.set(13, [8, 9, 10, 12, 14, 15, 16, 17]);
  postion_map.set(14, [9, 10, 13, 16, 17]);
  postion_map.set(15, [11, 12, 13, 16]);
  postion_map.set(16, [12, 13, 14, 15, 17]);
  postion_map.set(17, [13, 14, 16]);

  const settings = baseSettings.get(client.gameId);

  const trigUpgradeMultipliers_weights = settings.features.holdnspin.TRIG_Upgrade_Multipliers_prob;
  const trigUpgradeMultipliers_values = settings.features.holdnspin.TRIG_Upgrade_Multipliers_set;

  const TRIG_Jumping_weights = settings.features.holdnspin.TRIG_Jump_prob;
  const TRIG_Jumping_values = settings.features.holdnspin.TRIG_Jump_set;

  const trigActivations = [];

  for (let i = 0; i < holdnspin_matrix.length; i++) {
    const special_trigs = []
    if (holdnspin_matrix[i] && holdnspin_matrix[i][0] === 'TRIG') {
      const _trigActivations = []
      const surroundingCors = postion_map.get(i);
      const corPositions = []
      let totalCount = 0
      for (const cor of surroundingCors) {
        if (holdnspin_matrix[cor][0] === 'COR') {
          const currentLevel = client.node.context.holdnspin.currentCORValues[cor];
          const option = await getRandomItemByArrayWeights(client, trigUpgradeMultipliers_weights, trigUpgradeMultipliers_values);
          client.node.context.holdnspin.currentCORValues[cor] = currentLevel + option;
          totalCount += option
          corPositions.push(cor);

          var data = {
            trigPos: i,
            corPos: cor,
            currVal: currentLevel,
            finalVal: client.node.context.holdnspin.currentCORValues[cor],
            isSpecialTrig: false,
          }
          _trigActivations.push(data)
        }
      }

      if (totalCount > 0) {
        client.node.context.holdnspin.totalCorCount.push({
          trigPos: i,
          totalCount: totalCount,
        });
      }
      if (corPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * corPositions.length);
        const selectedCorPos = corPositions[randomIndex];
        const isSpecialTrig = await getRandomItemByArrayWeights(client, TRIG_Jumping_weights, TRIG_Jumping_values);

        if (isSpecialTrig) {
          client.node.context.holdnspin.special_trig.push(selectedCorPos);
          holdnspin_matrix[selectedCorPos][0] = 'ST';
          special_trigs.push(selectedCorPos)
          _trigActivations.forEach(data => {
            if (data.corPos === selectedCorPos) {
              data.isSpecialTrig = true;
            }
          });
        }
      }

      if (_trigActivations.length > 0) {
        const trigData = {
          trigPosition: i,
          corUpgrades: _trigActivations
        };
        trigActivations.push(trigData);
      }

      holdnspin_matrix[i][0] = 'B';
    }
    if (special_trigs.length > 0) {
      await populateSpecialTrigMultipliers(client, holdnspin_matrix, special_trigs, trigActivations)
    }
  }
  return trigActivations;
}



async function populateSpecialTrigMultipliers(client, holdnspin_matrix, special_trigs, trigActivations) {

  const postion_map = new Map();
  postion_map.set(0, [1, 3, 4, 5]);
  postion_map.set(1, [0, 2, 4, 5, 6]);
  postion_map.set(2, [1, 5, 6]);
  postion_map.set(3, [0, 4, 7, 8]);
  postion_map.set(4, [0, 1, 3, 5, 7, 8, 9]);
  postion_map.set(5, [0, 1, 2, 4, 6, 8, 9, 10]);
  postion_map.set(6, [1, 2, 5, 9, 10]);
  postion_map.set(7, [3, 4, 8, 11, 12]);
  postion_map.set(8, [3, 4, 5, 7, 9, 11, 12, 13]);
  postion_map.set(9, [4, 5, 6, 8, 10, 12, 13, 14]);
  postion_map.set(10, [5, 6, 9, 13, 14]);
  postion_map.set(11, [7, 8, 12, 15]);
  postion_map.set(12, [7, 8, 9, 11, 13, 15, 16]);
  postion_map.set(13, [8, 9, 10, 12, 14, 15, 16, 17]);
  postion_map.set(14, [9, 10, 13, 16, 17]);
  postion_map.set(15, [11, 12, 13, 16]);
  postion_map.set(16, [12, 13, 14, 15, 17]);
  postion_map.set(17, [13, 14, 16]);


  const settings = baseSettings.get(client.gameId);

  const trigUpgradeMultipliers_weights = settings.features.holdnspin.TRIG_Upgrade_Multipliers_prob;
  const trigUpgradeMultipliers_values = settings.features.holdnspin.TRIG_Upgrade_Multipliers_set;

  const TRIG_Jumping_weights = settings.features.holdnspin.TRIG_Jump_prob;
  const TRIG_Jumping_values = settings.features.holdnspin.TRIG_Jump_set;


  if (holdnspin_matrix[special_trigs][0] === 'ST') {
    const _special_trigs = []
    let _specialTrigActivations = []
    const corPositions = []
    const surroundingCors = postion_map.get(special_trigs[0]);
    let totalCount = 0
    for (const cor of surroundingCors) {
      if (holdnspin_matrix[cor][0] === 'COR') {
        const currentLevel = client.node.context.holdnspin.currentCORValues[cor];
        const option = await getRandomItemByArrayWeights(client, trigUpgradeMultipliers_weights, trigUpgradeMultipliers_values);
        client.node.context.holdnspin.currentCORValues[cor] = currentLevel + option;
        totalCount += option
        corPositions.push(cor);

        var data = {
          specialTrigPos: special_trigs[0],
          corPos: cor,
          currVal: currentLevel,
          finalVal: client.node.context.holdnspin.currentCORValues[cor],
          isSpecialTrig: false,
        }
        _specialTrigActivations.push(data)
      }
    }

    if (totalCount > 0) {
      client.node.context.holdnspin.totalCorCount.push({
        trigPos: special_trigs[0],
        totalCount: totalCount,
      });
    }

    let isSpecialTrigAgain = false
    if (corPositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * corPositions.length);
      const selectedCorPos = corPositions[randomIndex];
      isSpecialTrigAgain = await getRandomItemByArrayWeights(client, TRIG_Jumping_weights, TRIG_Jumping_values);

      if (isSpecialTrigAgain) {
        client.node.context.holdnspin.special_trig.push(selectedCorPos);
        holdnspin_matrix[selectedCorPos][0] = 'ST';
        _special_trigs.push(selectedCorPos)

        _specialTrigActivations.forEach(data => {
          if (data.corPos === selectedCorPos) {
            data.isSpecialTrig = true;
          }
        });

      }
    }
    holdnspin_matrix[special_trigs][0] = 'COR';

    if (_specialTrigActivations.length > 0) {

      const currentSpecialTrigPos = _specialTrigActivations[0].specialTrigPos;
      let corUpgrades = trigActivations.flatMap(item =>
        item.corUpgrades
          .filter(upgrade =>
            upgrade.corPos === special_trigs[0]
          )
          .map(upgrade => {
            const { trigPos, ...rest } = upgrade;
            // Update isSpecialTrig to false
            return {
              specialTrigPos: trigPos,
              specialTrigPos: currentSpecialTrigPos,
              ...rest,
              isSpecialTrig: false
            };
          })
      );

      corUpgrades.forEach(upgrade => _specialTrigActivations.push(upgrade));

      var specialTrigObj = {
        specialTrigPosition: currentSpecialTrigPos,
        corUpgrades: _specialTrigActivations
      }
      client.node.context.holdnspin.specialTrigMultipliers.push(specialTrigObj)
    }

    if (!corPositions.length) {
      let corUpgrades = trigActivations.flatMap(item =>
        item.corUpgrades
          .filter(upgrade =>
            upgrade.corPos === special_trigs[0]
          )
          .map(upgrade => {
            // Update isSpecialTrig to false
            return {
              ...upgrade,
              isSpecialTrig: false
            };
          })
      );

      //to push data inside specialTrigMultipliers
      client.node.context.holdnspin.specialTrigMultipliers.push({
        specialTrigPosition: special_trigs[0],
        corUpgrades: corUpgrades
      });
    }

    if (_special_trigs.length > 0) {
      await populateSpecialTrigMultipliers(client, holdnspin_matrix, _special_trigs, client.node.context.holdnspin.specialTrigMultipliers)
    }
  }
}

async function populateHNS_MultipliersActivations(client, holdnspin_matrix) {
  const settings = baseSettings.get(client.gameId);
  const hnsMultipliers_weights = settings.features.holdnspin.HNS_multipliers_prob;
  const hnsMultipliers_values = settings.features.holdnspin.HNS_multipliers_set;

  for (let i = 0; i < holdnspin_matrix.length; i++) {
    if (holdnspin_matrix[i] && holdnspin_matrix[i][0] === 'COR') {
      // Check if preUpgradeCORValues array exists and if it has a value at the index i
      if (!client.node.context.holdnspin.preUpgradeCORValues || !client.node.context.holdnspin.preUpgradeCORValues[i]) {
        const option = await getRandomItemByArrayWeights(client, hnsMultipliers_weights, hnsMultipliers_values);
        client.node.context.holdnspin.currentCORValues[i] = option;
      }
    }
  }
}

function allNonZeroValues(currentCORValues) {
  for (let i = 0; i < currentCORValues.length; i++) {
    if (currentCORValues[i] === 0) {
      return false;
    }
  }
  return true;
}

function intializeHNSData(client) {
  client.node.context.holdnspin.preUpgradeCORValues = [...client.node.context.holdnspin.currentCORValues]
  client.node.context.holdnspin.totalCorCount = []
}

async function createMatrix(client) {
  let hnsMatrix;
  if (client.node.context.holdnspin.isHnsBGTriggered || client.node.context.holdnspin.isHnsFGTriggered) {
    client.node.context.holdnspin.isHnsBGTriggered = false
    client.node.context.holdnspin.isHnsFGTriggered = false
    let matrix = await getMatrixForHNS(client, 'holdnspin', baseSettings.base.rows);
    ({ hnsMatrix, isReset } = await generateHoldnSpinInitialMatrix(client, matrix));
  } else {
    let getMatrix = await getMatrixForHNSRegular(client, 'holdnspin');
    ({ hnsMatrix, isReset } = await generateHoldnSpinMatrix(client, client.node.context.holdnspin.holdnspin_matrix, getMatrix));
  }
  client.node.context.holdnspin.holdnspin_matrix = hnsMatrix

  return isReset
}

async function toCheckHnsFeatures(client) {
  client.node.context.holdnspin.special_trig = []
  client.node.context.holdnspin.specialTrigMultipliers = []
  await populateHNS_MultipliersActivations(client, client.node.context.holdnspin.holdnspin_matrix)
  client.node.context.holdnspin.trigActivations = await populateTrigActivations(client, client.node.context.holdnspin.holdnspin_matrix)
}

function spinRemainsData(client, isReset) {
  client.node.context.holdnspin.spinsRemaining--
  if (isReset) {
    client.node.context.holdnspin.spinsRemaining = 3
    client.node.context.holdnspin.spinResetValue = 3
    client.node.context.holdnspin.spinsReset = true
  }
  else {
    client.node.context.holdnspin.spinResetValue = 0
    client.node.context.holdnspin.spinsReset = false
  }
}

function isHNSEndState(client, canHoldnspinEnd) {
  if (client.node.context.holdnspin.spinsRemaining < 1 || canHoldnspinEnd) {
    var corCount = 0;
    for (var i = 0; i < client.node.context.holdnspin.currentCORValues.length; i++) {
      corCount = corCount + client.node.context.holdnspin.currentCORValues[i]
    }
    var totalHnSWin = 0
    if (corCount === 0) {
      totalHnSWin = round(2 * client.node.context.holdnspin.triggerWin)
    } else {
      totalHnSWin = round(corCount * client.node.context.holdnspin.triggerWin)
    }
    const diff = (client.node.spinTotal + totalHnSWin) - client.winCap * client.betMultiplier
    if (diff > 0) {
      client.node.context.winCap = true
    }
    //winCap
    if (totalHnSWin > round(client.winCap * client.betMultiplier)) {
      totalHnSWin = round(client.winCap * client.betMultiplier)
    }
    if (canHoldnspinEnd) {
      client.node.context.holdnspin.spinsRemaining = 0
      client.node.context.holdnspin.spinResetValue = 0
      client.node.context.holdnspin.spinsReset = false
    }
    client.node.context.holdnspin.totalWin = totalHnSWin
  }
}

async function execute(client) {
  while (client.node.context.holdnspin.spinsRemaining) {
    intializeHNSData(client)
    let isReset = await createMatrix(client)
    await toCheckHnsFeatures(client)
    spinRemainsData(client, isReset)
    let canHoldnspinEnd = allNonZeroValues(client.node.context.holdnspin.currentCORValues)
    isHNSEndState(client, canHoldnspinEnd)
  }
}

module.exports = { execute, initHoldnspin }