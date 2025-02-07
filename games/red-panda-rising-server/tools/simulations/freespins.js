const baseSettings = require('../../src/game/runner/configs/settings')
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs')
const freespinsModel = require('../../tools/simulations/freespinsModel.js')
const features = require('../../src/game/runner/controllers/features/features')
const { transformReelToWildSymbols } = require('../../src/game/runner/controllers/features/symbol_replace')
const { isWildSymbolOnMatrix } = require('../../src/game/runner/controllers/features/wild_expansion_feature.js')
const { executeFreegameWildReelMultiplierFeature } = require('../../src/game/runner/controllers/features/wild_reel_multiplier_feature')
const { checkDefaultLines } = require('../../src/game/runner/controllers/lines_controller')
const matrixController = require('../../src/game/runner/controllers/matrix_controller')
const roundWin = require('../../tools/simulations/round_win_controller.js')

const mathUtils = require('../../../../src/utils/math.cjs')

async function processRoundWin(client, expandingWildPosition) {
    let winFromRound = await roundWin.check(client)
    client.getFreespins().total = winFromRound
}

function decreaseFSSpins(client) {
    const fs = freespinsModel.copy(client)
    fs.left--
    fs.add = 0
    return fs
}

async function toCheckWildFeatureCalc(client) {
    client.getFeatures().wildMultiplier = {}
    const wildReel = client.getFreespins().expandingWildPos
    let totalMultiplierVal = 0
    for (let i = 0; i < wildReel.length; i++) {
        const multiplierVal = await executeFreegameWildReelMultiplierFeature(client)
        if (multiplierVal > 0) {
            if (client.getFeatures().wildMultiplier) {
                client.getFeatures().wildMultiplier[wildReel[i][0]] = multiplierVal
            }
        }
        totalMultiplierVal += multiplierVal
    }
    if (totalMultiplierVal > 0 && client.getWinModel().lines.length > 0) {
        // apply multiplier on winning
        client.node.context.win.total = mathUtils.round(client.node.context.win.total * totalMultiplierVal)
    }
}

async function createMatrix(client, fs) {
    client.matrix = await matrixController.make(client, `${TRIGGER.FREESPINS}_${fs.mode}`)
}

async function execute(client) {
    client.getFreespins().total = 0
    while (client.context.freespins.left) {
        client.getFreespins().expandingWildPos = []
        const settings = baseSettings.get(client.gameId)
        let fs = decreaseFSSpins(client)
        await createMatrix(client, fs)
        features.init(client)

        isWildSymbolOnMatrix(client, settings.features.spin)
        transformReelToWildSymbols(client, baseSettings, client.getFreespins().expandingWildPos)
        checkDefaultLines(client, client.matrix)
        await toCheckWildFeatureCalc(client)
        await processRoundWin(client)
    }
    console.log('End Freespin Round')
}

module.exports = { execute }
