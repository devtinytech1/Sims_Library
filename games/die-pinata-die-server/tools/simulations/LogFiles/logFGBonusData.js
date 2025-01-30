const fs = require('fs');

let totalStats = {
    totalNoWinFGBonusFeatureSpins: 0,
    totalFGBonusWin: Array(21).fill(0), 
    totalWinFGBonusFeatureSpins: Array(21).fill(0)
};

async function handleFGBonusWinsData(fgBonusWin) {
    let index = 0;
    switch (true) {
        case (fgBonusWin === 0):
            index = 0;
            break;
        case (fgBonusWin < 1):
            index = 1;
            break;
        case (fgBonusWin < 2):
            index = 2;
            break;
        case (fgBonusWin < 3):
            index = 3;
            break;
        case (fgBonusWin < 4):
            index = 4;
            break;
        case (fgBonusWin < 5):
            index = 5;
            break;
        case (fgBonusWin < 10):
            index = 6;
            break;
        case (fgBonusWin < 15):
            index = 7;
            break;
        case (fgBonusWin < 20):
            index = 8;
            break;
        case (fgBonusWin < 25):
            index = 9;
            break;
        case (fgBonusWin < 50):
            index = 10;
            break;
        case (fgBonusWin < 75):
            index = 11;
            break;
        case (fgBonusWin < 100):
            index = 12;
            break;
        case (fgBonusWin < 150):
            index = 13;
            break;
        case (fgBonusWin < 250):
            index = 14;
            break;
        case (fgBonusWin < 500):
            index = 15;
            break;
        case (fgBonusWin < 1000):
            index = 16;
            break;
        case (fgBonusWin < 2500):
            index = 17;
            break;
        case (fgBonusWin < 5000):
            index = 18;
            break;
        case (fgBonusWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalFGBonusWin[index] += fgBonusWin;
    totalStats.totalWinFGBonusFeatureSpins[index]++;
    if (fgBonusWin === 0) totalStats.totalNoWinFGBonusFeatureSpins++;
}

function logNoWinFGBonusFeatureFrequency(fgBonusSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalFGBonusWin.map((total, index) => {
        const frequency = (totalStats.totalWinFGBonusFeatureSpins[index] / fgBonusSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, FG BONUS Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logFGBonusFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleFGBonusWinsData, logNoWinFGBonusFeatureFrequency };
