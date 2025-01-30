const fs = require('fs');

let totalStats = {
    totalNoWinBGWildFeatureSpins: 0,
    totalBGWildWin: Array(21).fill(0), 
    totalWinBGWildFeatureSpins: Array(21).fill(0)
};

async function handleBGWildWinsData(bgWildWin) {
    let index = 0;
    switch (true) {
        case (bgWildWin === 0):
            index = 0;
            break;
        case (bgWildWin < 1):
            index = 1;
            break;
        case (bgWildWin < 2):
            index = 2;
            break;
        case (bgWildWin < 3):
            index = 3;
            break;
        case (bgWildWin < 4):
            index = 4;
            break;
        case (bgWildWin < 5):
            index = 5;
            break;
        case (bgWildWin < 10):
            index = 6;
            break;
        case (bgWildWin < 15):
            index = 7;
            break;
        case (bgWildWin < 20):
            index = 8;
            break;
        case (bgWildWin < 25):
            index = 9;
            break;
        case (bgWildWin < 50):
            index = 10;
            break;
        case (bgWildWin < 75):
            index = 11;
            break;
        case (bgWildWin < 100):
            index = 12;
            break;
        case (bgWildWin < 150):
            index = 13;
            break;
        case (bgWildWin < 250):
            index = 14;
            break;
        case (bgWildWin < 500):
            index = 15;
            break;
        case (bgWildWin < 1000):
            index = 16;
            break;
        case (bgWildWin < 2500):
            index = 17;
            break;
        case (bgWildWin < 5000):
            index = 18;
            break;
        case (bgWildWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBGWildWin[index] += bgWildWin;
    totalStats.totalWinBGWildFeatureSpins[index]++;
    if (bgWildWin === 0) totalStats.totalNoWinBGWildFeatureSpins++;
}

function logNoWinBGWildFeatureFrequency(bgWildSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalBGWildWin.map((total, index) => {
        const frequency = (totalStats.totalWinBGWildFeatureSpins[index] / bgWildSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, BG WILD Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logBGWildFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGWildWinsData, logNoWinBGWildFeatureFrequency };
