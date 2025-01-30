const fs = require('fs');

let totalStats = {
    totalNoWinBGBonusFeatureSpins: 0,
    totalBGBonusWin: Array(21).fill(0), 
    totalWinBGBonusFeatureSpins: Array(21).fill(0)
};

async function handleBGBonusWinsData(bgBonusWin) {
    let index = 0;
    switch (true) {
        case (bgBonusWin === 0):
            index = 0;
            break;
        case (bgBonusWin < 1):
            index = 1;
            break;
        case (bgBonusWin < 2):
            index = 2;
            break;
        case (bgBonusWin < 3):
            index = 3;
            break;
        case (bgBonusWin < 4):
            index = 4;
            break;
        case (bgBonusWin < 5):
            index = 5;
            break;
        case (bgBonusWin < 10):
            index = 6;
            break;
        case (bgBonusWin < 15):
            index = 7;
            break;
        case (bgBonusWin < 20):
            index = 8;
            break;
        case (bgBonusWin < 25):
            index = 9;
            break;
        case (bgBonusWin < 50):
            index = 10;
            break;
        case (bgBonusWin < 75):
            index = 11;
            break;
        case (bgBonusWin < 100):
            index = 12;
            break;
        case (bgBonusWin < 150):
            index = 13;
            break;
        case (bgBonusWin < 250):
            index = 14;
            break;
        case (bgBonusWin < 500):
            index = 15;
            break;
        case (bgBonusWin < 1000):
            index = 16;
            break;
        case (bgBonusWin < 2500):
            index = 17;
            break;
        case (bgBonusWin < 5000):
            index = 18;
            break;
        case (bgBonusWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBGBonusWin[index] += bgBonusWin;
    totalStats.totalWinBGBonusFeatureSpins[index]++;
    if (bgBonusWin === 0) totalStats.totalNoWinBGBonusFeatureSpins++;
}

function logNoWinBGBonusFeatureFrequency(bgBonusSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalBGBonusWin.map((total, index) => {
        const frequency = (totalStats.totalWinBGBonusFeatureSpins[index] / bgBonusSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, BG BONUS Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logBGBonusFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGBonusWinsData, logNoWinBGBonusFeatureFrequency };
