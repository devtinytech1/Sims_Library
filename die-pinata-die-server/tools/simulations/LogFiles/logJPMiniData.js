const fs = require('fs');

let totalStats = {
    totalNoWinMiniFeature: 0,
    totalWinMiniFeature: Array(21).fill(0),
    totalWinMiniFeatureSpins: Array(21).fill(0)
};

async function handleJPMiniWinsData(miniWin) {
    let index = 0;
    switch (true) {
        case (miniWin === 0):
            index = 0;
            break;
        case (miniWin < 1):
            index = 1;
            break;
        case (miniWin < 2):
            index = 2;
            break;
        case (miniWin < 3):
            index = 3;
            break;
        case (miniWin < 4):
            index = 4;
            break;
        case (miniWin < 5):
            index = 5;
            break;
        case (miniWin < 10):
            index = 6;
            break;
        case (miniWin < 15):
            index = 7;
            break;
        case (miniWin < 20):
            index = 8;
            break;
        case (miniWin < 25):
            index = 9;
            break;
        case (miniWin < 50):
            index = 10;
            break;
        case (miniWin < 75):
            index = 11;
            break;
        case (miniWin < 100):
            index = 12;
            break;
        case (miniWin < 150):
            index = 13;
            break;
        case (miniWin < 250):
            index = 14;
            break;
        case (miniWin < 500):
            index = 15;
            break;
        case (miniWin < 1000):
            index = 16;
            break;
        case (miniWin < 2500):
            index = 17;
            break;
        case (miniWin < 5000):
            index = 18;
            break;
        case (miniWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalWinMiniFeature[index] += miniWin;
    totalStats.totalWinMiniFeatureSpins[index]++;
    if (miniWin === 0) totalStats.totalNoWinMiniFeature++;
}

function logMiniFeatureFrequency(roundNumber, spinBet, totalSpins, totalMiniSpinsTriggered) {
    const logData = totalStats.totalWinMiniFeature.map((total, index) => {
        let frequency
        if (index === 7) {
            frequency = (totalMiniSpinsTriggered / totalSpins) * 100;
        } else {
            frequency = (totalStats.totalWinMiniFeatureSpins[index] / totalSpins) * 100;
        }
        const rtp = (total / (spinBet * roundNumber)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Mini Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logJPMiniToFile(logData);
}

function logJPMiniToFile(logData) {
    const filePath = './logJPMiniFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleJPMiniWinsData, logMiniFeatureFrequency };
