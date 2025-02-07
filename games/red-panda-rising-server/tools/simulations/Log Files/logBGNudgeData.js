const fs = require('fs');

let totalStats = {
    totalNoWinNudgeFeatureSpins: 0,
    totalBgWinNudgeFeature: Array(21).fill(0),
    totalWinNudgeFeatureSpins: Array(21).fill(0)
};

async function handleBGNudgeWinsData(bgNudgeWin) {
    let index = 0;
    switch (true) {
        case (bgNudgeWin === 0):
            index = 0;
            break;
        case (bgNudgeWin < 1):
            index = 1;
            break;
        case (bgNudgeWin < 2):
            index = 2;
            break;
        case (bgNudgeWin < 3):
            index = 3;
            break;
        case (bgNudgeWin < 4):
            index = 4;
            break;
        case (bgNudgeWin < 5):
            index = 5;
            break;
        case (bgNudgeWin < 10):
            index = 6;
            break;
        case (bgNudgeWin < 15):
            index = 7;
            break;
        case (bgNudgeWin < 20):
            index = 8;
            break;
        case (bgNudgeWin < 25):
            index = 9;
            break;
        case (bgNudgeWin < 50):
            index = 10;
            break;
        case (bgNudgeWin < 75):
            index = 11;
            break;
        case (bgNudgeWin < 100):
            index = 12;
            break;
        case (bgNudgeWin < 150):
            index = 13;
            break;
        case (bgNudgeWin < 250):
            index = 14;
            break;
        case (bgNudgeWin < 500):
            index = 15;
            break;
        case (bgNudgeWin < 1000):
            index = 16;
            break;
        case (bgNudgeWin < 2500):
            index = 17;
            break;
        case (bgNudgeWin < 5000):
            index = 18;
            break;
        case (bgNudgeWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalBgWinNudgeFeature[index] += bgNudgeWin;
    totalStats.totalWinNudgeFeatureSpins[index]++;
    if (bgNudgeWin === 0) totalStats.totalNoWinNudgeFeatureSpins++;
}

function logNoWinNudgeFeatureFrequency(nudgeSpins, spinBet, totalSpins) {
    const logData = totalStats.totalBgWinNudgeFeature.map((total, index) => {
        const frequency = (totalStats.totalWinNudgeFeatureSpins[index] / nudgeSpins) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Nudge Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logBGNudgeFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleBGNudgeWinsData, logNoWinNudgeFeatureFrequency };
