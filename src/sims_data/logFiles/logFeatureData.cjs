const fs = require('fs');

let totalStats = {
    totalNoWinBaseGameFeatureSpins: 0,
    totalBaseGameWin: Array(21).fill(0), 
    totalWinBaseGameFeatureSpins: Array(21).fill(0)
};

async function handleBaseGameWinsData(baseGameWin) {
    let index = 0;
    switch (true) {
        case (baseGameWin === 0):
            index = 0;
            break;
        case (baseGameWin < 1):
            index = 1;
            break;
        case (baseGameWin < 2):
            index = 2;
            break;
        case (baseGameWin < 3):
            index = 3;
            break;
        case (baseGameWin < 4):
            index = 4;
            break;
        case (baseGameWin < 5):
            index = 5;
            break;
        case (baseGameWin < 10):
            index = 6;
            break;
        case (baseGameWin < 15):
            index = 7;
            break;
        case (baseGameWin < 20):
            index = 8;
            break;
        case (baseGameWin < 25):
            index = 9;
            break;
        case (baseGameWin < 50):
            index = 10;
            break;
        case (baseGameWin < 75):
            index = 11;
            break;
        case (baseGameWin < 100):
            index = 12;
            break;
        case (baseGameWin < 150):
            index = 13;
            break;
        case (baseGameWin < 250):
            index = 14;
            break;
        case (baseGameWin < 500):
            index = 15;
            break;
        case (baseGameWin < 1000):
            index = 16;
            break;
        case (baseGameWin < 2500):
            index = 17;
            break;
        case (baseGameWin < 5000):
            index = 18;
            break;
        case (baseGameWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBaseGameWin[index] += baseGameWin;
    totalStats.totalWinBaseGameFeatureSpins[index]++;
    if (baseGameWin === 0) totalStats.totalNoWinBaseGameFeatureSpins++;
}

function logNoWinBaseGameFeatureFrequency(bgFeatureSpinTriggerCount, spinBet, totalSpins, featureName) {
    const logData = totalStats.totalBaseGameWin.map((total, index) => {
        const frequency = (totalStats.totalWinBaseGameFeatureSpins[index] / bgFeatureSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, ${featureName} Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData, featureName); 
}

function logToFile(logData, featureName) {
    const filePath = `./logBaseGame${featureName}File.txt`;
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBaseGameWinsData, logNoWinBaseGameFeatureFrequency };
