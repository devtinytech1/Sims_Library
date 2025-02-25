const baseSettings = require('../../src/game/runner/configs/settings');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../../../src/sims_data/round_win_controller.cjs');
const { foundSymbols } = require('../../../../src/game/runner/math/foundSymbols.cjs');



// Replace symbols for the base game respin.
function replaceSymbolsBG(client, diceRollFeature) {
    const randomSymbol = diceRollFeature.randomSymbol;

    const randomLocked = diceRollFeature.respinPositions;
    randomLocked.forEach(([col, row]) => {
        client.matrix[col][row] = randomSymbol;
    });

    const scattersReplace = diceRollFeature.scatterPositions;
    scattersReplace.forEach(([col, row]) => {
        client.matrix[col][row] = baseSettings.base.scatters;
    });

    const jackpotReplace = diceRollFeature.jackpotPositions;
    jackpotReplace.forEach(([col, row]) => {
        client.matrix[col][row] = baseSettings.base.Jackpot;
    });

    const special = foundSymbols(client.matrix, baseSettings.base.Special);
    special.forEach(([col, row]) => {
        client.matrix[col][row] = randomSymbol;
    });
}

// Replace symbols for the free spins respin.
function replaceSymbolsFS(client, diceRollFeature) {
    const randomSymbol = diceRollFeature.randomSymbol;
    const randomLocked = diceRollFeature.respinPositions;
    randomLocked.forEach(([col, row]) => {
        client.matrix[col][row] = randomSymbol;
    });
}

async function execute(client, isFsDiceTriggered) {
    client.node.context.isRespin = true
    const settings = baseSettings.get(client.gameId)
    if (!isFsDiceTriggered) {
        client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.basegame_respin, baseSettings.base.rows)
        // Replace symbols
        replaceSymbolsBG(client, client.node.context.features.diceRoll);
    }
    else if (isFsDiceTriggered) {
        client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.freespins_respin, baseSettings.base.fsrows)
        // Replace symbols
        replaceSymbolsFS(client, client.node.context.features.fs_diceRoll);
    }
    // After Dice Feature winning
    await roundWin.check(client)
    client.node.context.features.respinWin = client.node.context.win.total
}

module.exports = { execute }