const fs = require('fs');

let totalStats = {
    totalNoWinMinorFeature: 0,
    totalWinMinorFeature: Array(21).fill(0),
    totalWinMinorFeatureSpins: Array(21).fill(0)
};

async function handleJPMinorWinsData(minorWin) {
    let index = 0;
    switch (true) {
        case (minorWin === 0):
            index = 0;
            break;
        case (minorWin < 1):
            index = 1;
            break;
        case (minorWin < 2):
            index = 2;
            break;
        case (minorWin < 3):
            index = 3;
            break;
        case (minorWin < 4):
            index = 4;
            break;
        case (minorWin < 5):
            index = 5;
            break;
        case (minorWin < 10):
            index = 6;
            break;
        case (minorWin < 15):
            index = 7;
            break;
        case (minorWin < 20):
            index = 8;
            break;
        case (minorWin < 25):
            index = 9;
            break;
        case (minorWin < 50):
            index = 10;
            break;
        case (minorWin < 75):
            index = 11;
            break;
        case (minorWin < 100):
            index = 12;
            break;
        case (minorWin < 150):
            index = 13;
            break;
        case (minorWin < 250):
            index = 14;
            break;
        case (minorWin < 500):
            index = 15;
            break;
        case (minorWin < 1000):
            index = 16;
            break;
        case (minorWin < 2500):
            index = 17;
            break;
        case (minorWin < 5000):
            index = 18;
            break;
        case (minorWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalWinMinorFeature[index] += minorWin;
    totalStats.totalWinMinorFeatureSpins[index]++;
    if (minorWin === 0) totalStats.totalNoWinMinorFeature++;
}

function logMinorFeatureFrequency(roundNumber, spinBet, totalSpins, totalMinorSpinsTriggered) {
    const logData = totalStats.totalWinMinorFeature.map((total, index) => {
        let frequency
        if (index === 11) {
            frequency = (totalMinorSpinsTriggered / totalSpins) * 100;
        } else {
            frequency = (totalStats.totalWinMinorFeatureSpins[index] / totalSpins) * 100;
        }
        const rtp = (total / (spinBet * roundNumber)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Minor Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logJPMinorToFile(logData);
}

function logJPMinorToFile(logData) {
    const filePath = './logJPMinorFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleJPMinorWinsData, logMinorFeatureFrequency };
