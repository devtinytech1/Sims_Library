const baseSettings = require('../../src/game/runner/configs/settings.js')
const { triggers } = require('../../src/game/runner/configs/triggers')
const { scatterFeatureCheck } = require('../../tools/simulations/features/scatters_feature')
const { holdnspinFeatureCheck } = require('../../tools/simulations/features/holdnspin_feature.js')
const { check576Lines } = require('../../src/game/runner/controllers/lines_controller')
const { getMatrix } = require('../../src/game/runner/controllers/matrix_controller')
const { checkRoundWin } = require('../../tools/simulations/round_win_controller.js')
const { logRoundStats } = require('../../tools/simulations/Log Files/logRTPData.js')
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('../../tools/simulations/Log Files/logBGData.js')
const { handleFGWinsData, logNoWinFSFeatureFrequency } = require('../../tools/simulations/Log Files/logFGData.js')
const { handleHNSWinsData, logNoWinHNSFeatureFrequency } = require('../../tools/simulations/Log Files/logHNSData.js')

let totalFreeGameWin = 0, totalBaseGameWin = 0, totalHnSWin = 0;
let totalSpins = 0;
let freeSpinTriggerCount = 0;
module.exports.execute = async function (client) {
    console.log("Execute function started");
    initializeClient(client);
    for (let i = 0; i < 100000; i++) {
        totalSpins++;
        await playRound(client);
        // Log round information and RTP for every 1000 rounds
        if ((i + 1) % 1000 === 0) {
            logRoundStats(i + 1, client.node.spinBet, totalBaseGameWin, totalFreeGameWin, totalHnSWin);
            logNoWinNoFeatureFrequency(i + 1, client.node.spinBet, totalSpins)
        }
    }
    console.log('FREESPINS TRIGGERED COUNT', freeSpinTriggerCount);
    console.log('HNS TRIGGERED COUNT', client.node.context.hnsSpinTriggerCount);
    logNoWinFSFeatureFrequency(freeSpinTriggerCount, client.node.spinBet, totalSpins)
    logNoWinHNSFeatureFrequency(client.node.context.hnsSpinTriggerCount, client.node.spinBet, totalSpins)
    console.log("Execute function ended");
}

function initializeClient(client) {
    client.node.state = triggers.spin
    client.node.trigger = triggers.spin
    client.node.spinTotal = 0
    client.node.context.hnsSpinTriggerCount = 0
}

async function playRound(client) {
    let basegameWin = 0
    await createMatrix(client)
    let isWildPresent = await isWildPresentInMatrix(client)
    check576Lines(client)
    await checkRoundWin(client)
    basegameWin = client.node.context.win.total
    //Calulate BG Hit Frequency with RTP
    await handleBGWinsData(basegameWin)
    let triggerWin = await updateTotals(client)
    await toCheckFeature(client, isWildPresent, triggerWin)
    await handleHNSWin(client)
    await handleFSWin(client);
}

async function createMatrix(client) {
    client.node.context.matrix = await getMatrix(client, triggers.spin, baseSettings.base.rows)
    client.node.context.matrix[0][0] = 'X'
    client.node.context.matrix[4][0] = 'X'
}

async function isWildPresentInMatrix(client) {
    const flattenedMatrix = client.node.context.matrix.flat();
    let isWildPresent = flattenedMatrix.includes('W');
    return isWildPresent
}

async function updateTotals(client, triggerWin) {
    if (client.node.context.win) {
        totalBaseGameWin += client.node.context.win.total
        triggerWin = client.node.context.win.total
    }
    if (client.node.context.win !== undefined) {
        delete client.node.context.win;
    }
    return triggerWin
}

async function toCheckFeature(client, isWildPresent, triggerWin) {
    const settings = baseSettings.get(client.gameId)
    let hnsTriggeredInBG = false
    if (isWildPresent) {
        hnsTriggeredInBG = true
        let isHNSTriggered = await holdnspinFeatureCheck(client, settings.features.holdnspin, triggerWin, hnsTriggeredInBG, false)
        if (isHNSTriggered) {
            client.node.context.hnsSpinTriggerCount++
        }
    }
    let isFSTriggered = await scatterFeatureCheck(client, client.node.context.matrix, settings.features.spin)
    if (isFSTriggered) {
        freeSpinTriggerCount++
    }
}

async function handleHNSWin(client) {
    if (client.node.context.holdnspin) {
        let hnsGameWin = 0
        const hnsWin = client.node.context.holdnspin.totalWin
        if (hnsWin) {
            totalHnSWin += hnsWin
            client.node.context.holdnspin.totalWin = 0;
            hnsGameWin = hnsWin
            //Calulate HNS Hit Frequency with RTP
            await handleHNSWinsData(hnsGameWin)
        }
    }
}

async function handleFSWin(client) {
    if (client.node.context.freespins) {
        let freeGameWin = 0
        const fsWin = client.node.context.freespins.fsWin
        if (fsWin) {
            totalFreeGameWin += fsWin
            client.node.context.freespins.fsWin = 0;
            freeGameWin = fsWin
            //Calulate FG Hit Frequency with RTP
            await handleFGWinsData(freeGameWin)
        }
    }
}