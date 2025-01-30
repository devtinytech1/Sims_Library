const fs = require('fs');

let totalStats = {
    totalNoWinFGWildFeatureSpins: 0,
    totalFGWildWin: Array(21).fill(0), 
    totalWinFGWildFeatureSpins: Array(21).fill(0)
};

async function handleFGWildWinsData(fgWildWin) {
    let index = 0;
    switch (true) {
        case (fgWildWin === 0):
            index = 0;
            break;
        case (fgWildWin < 1):
            index = 1;
            break;
        case (fgWildWin < 2):
            index = 2;
            break;
        case (fgWildWin < 3):
            index = 3;
            break;
        case (fgWildWin < 4):
            index = 4;
            break;
        case (fgWildWin < 5):
            index = 5;
            break;
        case (fgWildWin < 10):
            index = 6;
            break;
        case (fgWildWin < 15):
            index = 7;
            break;
        case (fgWildWin < 20):
            index = 8;
            break;
        case (fgWildWin < 25):
            index = 9;
            break;
        case (fgWildWin < 50):
            index = 10;
            break;
        case (fgWildWin < 75):
            index = 11;
            break;
        case (fgWildWin < 100):
            index = 12;
            break;
        case (fgWildWin < 150):
            index = 13;
            break;
        case (fgWildWin < 250):
            index = 14;
            break;
        case (fgWildWin < 500):
            index = 15;
            break;
        case (fgWildWin < 1000):
            index = 16;
            break;
        case (fgWildWin < 2500):
            index = 17;
            break;
        case (fgWildWin < 5000):
            index = 18;
            break;
        case (fgWildWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalFGWildWin[index] += fgWildWin;
    totalStats.totalWinFGWildFeatureSpins[index]++;
    if (fgWildWin === 0) totalStats.totalNoWinFGWildFeatureSpins++;
}

function logNoWinFGWildFeatureFrequency(fgWildSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalFGWildWin.map((total, index) => {
        const frequency = (totalStats.totalWinFGWildFeatureSpins[index] / fgWildSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, FG WILD Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logFGWildFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleFGWildWinsData, logNoWinFGWildFeatureFrequency };
