const fs = require('fs');

let totalStats = {
    totalNoWinMajorFeature: 0,
    totalWinMajorFeature: Array(21).fill(0),
    totalWinMajorFeatureSpins: Array(21).fill(0)
};

async function handleJPMajorWinsData(majorWin) {
    let index = 0;
    switch (true) {
        case (majorWin === 0):
            index = 0;
            break;
        case (majorWin < 1):
            index = 1;
            break;
        case (majorWin < 2):
            index = 2;
            break;
        case (majorWin < 3):
            index = 3;
            break;
        case (majorWin < 4):
            index = 4;
            break;
        case (majorWin < 5):
            index = 5;
            break;
        case (majorWin < 10):
            index = 6;
            break;
        case (majorWin < 15):
            index = 7;
            break;
        case (majorWin < 20):
            index = 8;
            break;
        case (majorWin < 25):
            index = 9;
            break;
        case (majorWin < 50):
            index = 10;
            break;
        case (majorWin < 75):
            index = 11;
            break;
        case (majorWin < 100):
            index = 12;
            break;
        case (majorWin < 150):
            index = 13;
            break;
        case (majorWin < 250):
            index = 14;
            break;
        case (majorWin < 500):
            index = 15;
            break;
        case (majorWin < 1000):
            index = 16;
            break;
        case (majorWin < 2500):
            index = 17;
            break;
        case (majorWin < 5000):
            index = 18;
            break;
        case (majorWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalWinMajorFeature[index] += majorWin;
    totalStats.totalWinMajorFeatureSpins[index]++;
    if (majorWin === 0) totalStats.totalNoWinMajorFeature++;
}

function logMajorFeatureFrequency(roundNumber, spinBet, totalSpins, totalMajorSpinsTriggered) {
    const logData = totalStats.totalWinMajorFeature.map((total, index) => {
        let frequency
        if (index === 14) {
            frequency = (totalMajorSpinsTriggered / totalSpins) * 100;
        } else {
            frequency = (totalStats.totalWinMajorFeatureSpins[index] / totalSpins) * 100;
        }
        const rtp = (total / (spinBet * roundNumber)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Major Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logJPMajorToFile(logData);
}

function logJPMajorToFile(logData) {
    const filePath = './logJPMajorFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleJPMajorWinsData, logMajorFeatureFrequency };
