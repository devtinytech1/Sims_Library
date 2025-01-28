const fs = require('fs');

let totalStats = {
    totalNoWinFSFeatureSpins: 0,
    totalFgWin: Array(21).fill(0), 
    totalWinFSFeatureSpins: Array(21).fill(0)
};

async function handleFGWinsData(freeGameWin) {
    let index = 0;
    switch (true) {
        case (freeGameWin === 0):
            index = 0;
            break;
        case (freeGameWin < 1):
            index = 1;
            break;
        case (freeGameWin < 2):
            index = 2;
            break;
        case (freeGameWin < 3):
            index = 3;
            break;
        case (freeGameWin < 4):
            index = 4;
            break;
        case (freeGameWin < 5):
            index = 5;
            break;
        case (freeGameWin < 10):
            index = 6;
            break;
        case (freeGameWin < 15):
            index = 7;
            break;
        case (freeGameWin < 20):
            index = 8;
            break;
        case (freeGameWin < 25):
            index = 9;
            break;
        case (freeGameWin < 50):
            index = 10;
            break;
        case (freeGameWin < 75):
            index = 11;
            break;
        case (freeGameWin < 100):
            index = 12;
            break;
        case (freeGameWin < 150):
            index = 13;
            break;
        case (freeGameWin < 250):
            index = 14;
            break;
        case (freeGameWin < 500):
            index = 15;
            break;
        case (freeGameWin < 1000):
            index = 16;
            break;
        case (freeGameWin < 2500):
            index = 17;
            break;
        case (freeGameWin < 5000):
            index = 18;
            break;
        case (freeGameWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalFgWin[index] += freeGameWin;
    totalStats.totalWinFSFeatureSpins[index]++;
    if (freeGameWin === 0) totalStats.totalNoWinFSFeatureSpins++;
}

function logNoWinFSFeatureFrequency(freeSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalFgWin.map((total, index) => {
        const frequency = (totalStats.totalWinFSFeatureSpins[index] / freeSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, FS Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logFSFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleFGWinsData, logNoWinFSFeatureFrequency };
