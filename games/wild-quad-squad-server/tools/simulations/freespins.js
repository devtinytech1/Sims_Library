const baseSettings = require('../../src/game/runner/configs/settings.js')
const { KEY, TRIGGER } = require('../../../../src/game/runner/configs/static.cjs')
const matrix = require('../simulations/matrix_controller')
const { check_to_replace_wild_FS, replace_Wild_FS } = require('../../../../src/sims_data/features/wild_scatter_replace_feature.cjs')
const baseSequences = require('../../src/game/runner/configs/sequences')
const { handleFreeSpinsCascade, createCascadeEndFS } = require('../../tools/simulations/cascade.js')
const mathUtils = require('../../../../src/utils/math.cjs')

function setFreespinsModel(currentContext, allCount, addCount, leftCount) {
    currentContext.freespins = {
        all: allCount || 0,
        add: addCount || 0,
        left: leftCount || 0,
        total: 0,
        scatters: [],
        ind: 0,
    }
}

async function initFreespins(client, settings) {
    const add = settings.count
    setFreespinsModel(client.context, add, add, add)
    await execute(client)
}

function freespinsDataTransit(client, decrease = false) {
    if (decrease) {
        client.context.freespins.left--
    }
    client.context.freespins.add = 0
}

function findPositionsOfValue(matrix, value) {
    const positions = [];
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] == value) {
                positions.push([row, col]);
            }
        }
    }
    return positions;
}

function resetClientState(client) {
    client.cascade = []
    client.context.unMatchedWild = false
    client.context.isCascade = false
    // client.context.stickyWildPosition = []
}

async function handleCascade(client) {
    client.context.isCascade = true
    const winMatrix = JSON.parse(JSON.stringify(client.matrix))
    const destroyArray = JSON.parse(JSON.stringify(client.node.context.destroy))
    const clientClone = createClientClone(client)
    await handleFreeSpinsCascade(clientClone, winMatrix, destroyArray, 'freegames_cascade')
    createCascadeEndFS(clientClone)
    client.nextTrigger = TRIGGER.SPIN
    client.context.multiplierForSymbols = clientClone.context.multiplierForSymbols
    client.node.context.freespins.total = clientClone.node.context.freespins.total
    client.context.stickyWildPosition = clientClone.node.context.stickyWildPosition
    client.cascade = clientClone.cascade
}

async function processMatrix(client) {
    client.matrix = await matrix.make(client, 'freespins', baseSettings.base.rows)

    if (await check_to_replace_wild_FS(client)) {
        client.matrix = await replace_Wild_FS(client, client.matrix)
    }

    if (client.context.stickyWildPosition) {
        const positions = client.context.stickyWildPosition
        for (const position of positions) {
            const row = position[0];
            const col = position[1];
            client.matrix[row][col] = 'W';
        }
    }
    await matrix.check(client, client.matrix)
}

async function handleWildReveal(client) {
    const hasWild = client.matrix.some(row => row.includes('W'));
    if (hasWild) {
        client.context.unMatchedWild = true
        client.matrix = await matrix.checkReavealedWild(client, client.matrix)
    }
}

async function execute(client) {
    while (client.context.freespins.left) {
        resetClientState(client)
        await processMatrix(client);

        if (client.nextTrigger === TRIGGER.CASCADE) {
            handleCascade(client);
        } else if (client.nextTrigger === TRIGGER.SPIN) {
            handleWildReveal(client);
        }
        if (client.nextTrigger === TRIGGER.CASCADE) {
            handleCascade(client);
        }
        if (client.nextTrigger === TRIGGER.SPIN && !client.context.isCascade) {
            let positionsOfW = findPositionsOfValue(client.context.matrix, 'W');
            if (positionsOfW.length > 0)
                client.context.stickyWildPosition = positionsOfW
        }
        handleCumulativeWin(client);
        freespinsDataTransit(client, true)
    }
    if (client.context.stickyWildPosition !== undefined) {
        delete client.context.stickyWildPosition
    }
    if (client.context.freespins !== undefined) {
        delete client.context.freespins
    }
}

async function handleCumulativeWin(client) {
    if (client.node.context.win) {
        for (const line of client.node.context.win.lines) {
            client.context.totalFreeGameWin += line.win
        }
    }
    if (client.cascade.length > 1) {
        for (const cascade of client.cascade) {
            if (cascade.winType === 'cluster' || cascade.winType === 'scatter') {
                for (const line of cascade.lines.map) {
                    client.context.totalFGCascadeWin += line.win;
                }
            }
        }
    }
}

function createClientClone(client) {
    let clientClone = JSON.parse(JSON.stringify(client))
    // clientClone.nextTrigger = TRIGGER.SPIN
    clientClone.addSpinTotal = value => {
        if (value) {
            let final_value = clientClone.node.spinTotal + value
            clientClone.node.spinTotal = Math.round(final_value * 1000000) / 1000000
            clientClone.totalWin = value
        }
        return value
    }
    clientClone.setGameRoundOver = () => clientClone.gameRoundOver = true

    delete clientClone.context.destroy
    delete clientClone.context.matrix
    delete clientClone.context.win
    delete clientClone.matrix
    clientClone.node.context = {}
    clientClone.node.context.freespins = client.node.context.freespins
    return clientClone
}

module.exports = { initFreespins }
