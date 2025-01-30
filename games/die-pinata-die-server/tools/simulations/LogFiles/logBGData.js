const fs = require('fs');

let totalStats = {
    totalNoWinNoFeatureSpins: 0,
    totalBgWinNoFeature: Array(21).fill(0), 
    totalWinNoFeatureSpins: Array(21).fill(0)
};

async function handleBGWinsData(basegameWin) {
    let index = 0;
    switch (true) {
        case (basegameWin === 0):
            index = 0;
            break;
        case (basegameWin < 1):
            index = 1;
            break;
        case (basegameWin < 2):
            index = 2;
            break;
        case (basegameWin < 3):
            index = 3;
            break;
        case (basegameWin < 4):
            index = 4;
            break;
        case (basegameWin < 5):
            index = 5;
            break;
        case (basegameWin < 10):
            index = 6;
            break;
        case (basegameWin < 15):
            index = 7;
            break;
        case (basegameWin < 20):
            index = 8;
            break;
        case (basegameWin < 25):
            index = 9;
            break;
        case (basegameWin < 50):
            index = 10;
            break;
        case (basegameWin < 75):
            index = 11;
            break;
        case (basegameWin < 100):
            index = 12;
            break;
        case (basegameWin < 150):
            index = 13;
            break;
        case (basegameWin < 250):
            index = 14;
            break;
        case (basegameWin < 500):
            index = 15;
            break;
        case (basegameWin < 1000):
            index = 16;
            break;
        case (basegameWin < 2500):
            index = 17;
            break;
        case (basegameWin < 5000):
            index = 18;
            break;
        case (basegameWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBgWinNoFeature[index] += basegameWin;
    totalStats.totalWinNoFeatureSpins[index]++;
    if (basegameWin === 0) totalStats.totalNoWinNoFeatureSpins++;
}

function logNoWinNoFeatureFrequency(roundNumber, spinBet, totalSpins) {
    const logData = totalStats.totalBgWinNoFeature.map((total, index) => {
        const frequency = (totalStats.totalWinNoFeatureSpins[index] / totalSpins) * 100;
        const rtp = (total / (spinBet * roundNumber)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, No Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGWinsData, logNoWinNoFeatureFrequency };
