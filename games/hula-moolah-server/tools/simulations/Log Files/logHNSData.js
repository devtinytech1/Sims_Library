const fs = require('fs');

let totalStats = {
    totalNoWinHNSFeatureSpins: 0,
    totalHNSWin: Array(21).fill(0), 
    totalWinHNSFeatureSpins: Array(21).fill(0)
};

async function handleHNSWinsData(hnsGameWin) {
    let index = 0;
    switch (true) {
        case (hnsGameWin === 0):
            index = 0;
            break;
        case (hnsGameWin < 1):
            index = 1;
            break;
        case (hnsGameWin < 2):
            index = 2;
            break;
        case (hnsGameWin < 3):
            index = 3;
            break;
        case (hnsGameWin < 4):
            index = 4;
            break;
        case (hnsGameWin < 5):
            index = 5;
            break;
        case (hnsGameWin < 10):
            index = 6;
            break;
        case (hnsGameWin < 15):
            index = 7;
            break;
        case (hnsGameWin < 20):
            index = 8;
            break;
        case (hnsGameWin < 25):
            index = 9;
            break;
        case (hnsGameWin < 50):
            index = 10;
            break;
        case (hnsGameWin < 75):
            index = 11;
            break;
        case (hnsGameWin < 100):
            index = 12;
            break;
        case (hnsGameWin < 150):
            index = 13;
            break;
        case (hnsGameWin < 250):
            index = 14;
            break;
        case (hnsGameWin < 500):
            index = 15;
            break;
        case (hnsGameWin < 1000):
            index = 16;
            break;
        case (hnsGameWin < 2500):
            index = 17;
            break;
        case (hnsGameWin < 5000):
            index = 18;
            break;
        case (hnsGameWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalHNSWin[index] += hnsGameWin;
    totalStats.totalWinHNSFeatureSpins[index]++;
    if (hnsGameWin === 0) totalStats.totalNoWinHNSFeatureSpins++;
}

function logNoWinHNSFeatureFrequency(hnsSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalHNSWin.map((total, index) => {
        const frequency = (totalStats.totalWinHNSFeatureSpins[index] / hnsSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, No Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logHNSFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleHNSWinsData, logNoWinHNSFeatureFrequency };
