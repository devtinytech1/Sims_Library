const { initHoldnspin } = require('../holdnspin')
const { getRandomItemByArrayWeights } = require('../../../../../src/game/runner/math/main_random_controller.cjs');

const HNS_PROB = 'HNS_prob';
const HNS_SET = 'HNS_set';
const FS_HNS_PROB = 'FS_HNS_prob';
const FS_HNS_SET = 'FS_HNS_set';

async function holdnspinFeatureCheck(client, settings, triggerWin, hnsTriggeredInBG, hnsTriggeredInFG) {
  let isHoldnspinTriggered = false;
  let isHnsBGTriggered = false
  let isHnsFGTriggered = false

  if (hnsTriggeredInBG) {
    hnsTriggeredInBG = false
    // Buy bonus condition..
    if (client.request.params.index === 0) {
      isHoldnspinTriggered = true
    } else {
      isHoldnspinTriggered = await getRandomItemByArrayWeights(client, settings[HNS_PROB], settings[HNS_SET]);
    }
    if (isHoldnspinTriggered) {
      isHnsBGTriggered = true
    }
  } else if (hnsTriggeredInFG) {
    hnsTriggeredInFG = false
    isHoldnspinTriggered = await getRandomItemByArrayWeights(client, settings[FS_HNS_PROB], settings[FS_HNS_SET]);
    if (isHoldnspinTriggered) {
      isHnsFGTriggered = true
    }
  }

  if (isHoldnspinTriggered) {
    //trigger hold n spin feature
    let maxOfBetAndTriggeringWin = triggerWin > client.spinBet ? triggerWin : client.spinBet
    await initHoldnspin(client, settings, maxOfBetAndTriggeringWin, isHnsBGTriggered, isHnsFGTriggered)
  }
  return isHoldnspinTriggered
}

module.exports = { holdnspinFeatureCheck }
