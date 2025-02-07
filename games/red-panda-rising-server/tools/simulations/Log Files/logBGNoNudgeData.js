const fs = require('fs');

let totalStats = {
    totalNoWinNoNudgeFeatureSpins: 0,
    totalBgWinNoNudgeFeature: Array(21).fill(0),
    totalWinNoNudgeFeatureSpins: Array(21).fill(0)
};

async function handleBGNoNudgeWinsData(bgNoNudgeWin) {
    let index = 0;
    switch (true) {
        case (bgNoNudgeWin === 0):
            index = 0;
            break;
        case (bgNoNudgeWin < 1):
            index = 1;
            break;
        case (bgNoNudgeWin < 2):
            index = 2;
            break;
        case (bgNoNudgeWin < 3):
            index = 3;
            break;
        case (bgNoNudgeWin < 4):
            index = 4;
            break;
        case (bgNoNudgeWin < 5):
            index = 5;
            break;
        case (bgNoNudgeWin < 10):
            index = 6;
            break;
        case (bgNoNudgeWin < 15):
            index = 7;
            break;
        case (bgNoNudgeWin < 20):
            index = 8;
            break;
        case (bgNoNudgeWin < 25):
            index = 9;
            break;
        case (bgNoNudgeWin < 50):
            index = 10;
            break;
        case (bgNoNudgeWin < 75):
            index = 11;
            break;
        case (bgNoNudgeWin < 100):
            index = 12;
            break;
        case (bgNoNudgeWin < 150):
            index = 13;
            break;
        case (bgNoNudgeWin < 250):
            index = 14;
            break;
        case (bgNoNudgeWin < 500):
            index = 15;
            break;
        case (bgNoNudgeWin < 1000):
            index = 16;
            break;
        case (bgNoNudgeWin < 2500):
            index = 17;
            break;
        case (bgNoNudgeWin < 5000):
            index = 18;
            break;
        case (bgNoNudgeWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBgWinNoNudgeFeature[index] += bgNoNudgeWin;
    totalStats.totalWinNoNudgeFeatureSpins[index]++;
    if (bgNoNudgeWin === 0) totalStats.totalNoWinNoNudgeFeatureSpins++;
}

function logNoWinNoNudgeFeatureFrequency(noNudgeSpins, spinBet, totalSpins) {
    const logData = totalStats.totalBgWinNoNudgeFeature.map((total, index) => {
        const frequency = (totalStats.totalWinNoNudgeFeatureSpins[index] / noNudgeSpins) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, No Nudge Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logBGNoNudgeFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGNoNudgeWinsData, logNoWinNoNudgeFeatureFrequency };
