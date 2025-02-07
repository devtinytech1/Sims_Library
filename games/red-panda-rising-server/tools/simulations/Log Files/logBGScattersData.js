const fs = require('fs');

let totalStats = {
    totalNoWinScatterFeatureSpins: 0,
    totalBgWinScatterFeature: Array(21).fill(0),
    totalWinScatterFeatureSpins: Array(21).fill(0)
};

async function handleBGScatterWinsData(bgScatterWin) {
    let index = 0;
    switch (true) {
        case (bgScatterWin === 0):
            index = 0;
            break;
        case (bgScatterWin < 1):
            index = 1;
            break;
        case (bgScatterWin < 2):
            index = 2;
            break;
        case (bgScatterWin < 3):
            index = 3;
            break;
        case (bgScatterWin < 4):
            index = 4;
            break;
        case (bgScatterWin < 5):
            index = 5;
            break;
        case (bgScatterWin < 10):
            index = 6;
            break;
        case (bgScatterWin < 15):
            index = 7;
            break;
        case (bgScatterWin < 20):
            index = 8;
            break;
        case (bgScatterWin < 25):
            index = 9;
            break;
        case (bgScatterWin < 50):
            index = 10;
            break;
        case (bgScatterWin < 75):
            index = 11;
            break;
        case (bgScatterWin < 100):
            index = 12;
            break;
        case (bgScatterWin < 150):
            index = 13;
            break;
        case (bgScatterWin < 250):
            index = 14;
            break;
        case (bgScatterWin < 500):
            index = 15;
            break;
        case (bgScatterWin < 1000):
            index = 16;
            break;
        case (bgScatterWin < 2500):
            index = 17;
            break;
        case (bgScatterWin < 5000):
            index = 18;
            break;
        case (bgScatterWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBgWinScatterFeature[index] += bgScatterWin;
    totalStats.totalWinScatterFeatureSpins[index]++;
    if (bgScatterWin === 0) totalStats.totalNoWinScatterFeatureSpins++;
}

function logNoWinScatterFeatureFrequency(scatterSpins, spinBet, totalSpins) {
    const logData = totalStats.totalBgWinScatterFeature.map((total, index) => {
        const frequency = (totalStats.totalWinScatterFeatureSpins[index] / scatterSpins) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Scatter Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logBGScatterFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGScatterWinsData, logNoWinScatterFeatureFrequency };
