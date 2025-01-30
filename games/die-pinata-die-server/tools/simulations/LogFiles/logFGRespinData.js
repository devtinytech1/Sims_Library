const fs = require('fs');

let totalStats = {
    totalNoWinFGRespinFeatureSpins: 0,
    totalFGRespinWin: Array(21).fill(0), 
    totalWinFGRespinFeatureSpins: Array(21).fill(0)
};

async function handleFGRespinWinsData(fgRespinWin) {
    let index = 0;
    switch (true) {
        case (fgRespinWin === 0):
            index = 0;
            break;
        case (fgRespinWin < 1):
            index = 1;
            break;
        case (fgRespinWin < 2):
            index = 2;
            break;
        case (fgRespinWin < 3):
            index = 3;
            break;
        case (fgRespinWin < 4):
            index = 4;
            break;
        case (fgRespinWin < 5):
            index = 5;
            break;
        case (fgRespinWin < 10):
            index = 6;
            break;
        case (fgRespinWin < 15):
            index = 7;
            break;
        case (fgRespinWin < 20):
            index = 8;
            break;
        case (fgRespinWin < 25):
            index = 9;
            break;
        case (fgRespinWin < 50):
            index = 10;
            break;
        case (fgRespinWin < 75):
            index = 11;
            break;
        case (fgRespinWin < 100):
            index = 12;
            break;
        case (fgRespinWin < 150):
            index = 13;
            break;
        case (fgRespinWin < 250):
            index = 14;
            break;
        case (fgRespinWin < 500):
            index = 15;
            break;
        case (fgRespinWin < 1000):
            index = 16;
            break;
        case (fgRespinWin < 2500):
            index = 17;
            break;
        case (fgRespinWin < 5000):
            index = 18;
            break;
        case (fgRespinWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalFGRespinWin[index] += fgRespinWin;
    totalStats.totalWinFGRespinFeatureSpins[index]++;
    if (fgRespinWin === 0) totalStats.totalNoWinFGRespinFeatureSpins++;
}

function logNoWinFGRespinFeatureFrequency(fgRespinSpinTriggerCount, spinBet, totalSpins) {
    const logData = totalStats.totalFGRespinWin.map((total, index) => {
        const frequency = (totalStats.totalWinFGRespinFeatureSpins[index] / fgRespinSpinTriggerCount) * 100;
        const rtp = (total / (spinBet * totalSpins)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, FG RESPIN Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logToFile(logData); 
}

function logToFile(logData) {
    const filePath = './logFGRespinFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleFGRespinWinsData, logNoWinFGRespinFeatureFrequency };
