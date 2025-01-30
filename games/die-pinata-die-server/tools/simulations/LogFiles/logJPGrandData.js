const fs = require('fs');

let totalStats = {
    totalNoWinGrandFeature: 0,
    totalWinGrandFeature: Array(21).fill(0),
    totalWinGrandFeatureSpins: Array(21).fill(0)
};

async function handleJPGrandWinsData(grandWin) {
    let index = 0;
    switch (true) {
        case (grandWin === 0):
            index = 0;
            break;
        case (grandWin < 1):
            index = 1;
            break;
        case (grandWin < 2):
            index = 2;
            break;
        case (grandWin < 3):
            index = 3;
            break;
        case (grandWin < 4):
            index = 4;
            break;
        case (grandWin < 5):
            index = 5;
            break;
        case (grandWin < 10):
            index = 6;
            break;
        case (grandWin < 15):
            index = 7;
            break;
        case (grandWin < 20):
            index = 8;
            break;
        case (grandWin < 25):
            index = 9;
            break;
        case (grandWin < 50):
            index = 10;
            break;
        case (grandWin < 75):
            index = 11;
            break;
        case (grandWin < 100):
            index = 12;
            break;
        case (grandWin < 150):
            index = 13;
            break;
        case (grandWin < 250):
            index = 14;
            break;
        case (grandWin < 500):
            index = 15;
            break;
        case (grandWin < 1000):
            index = 16;
            break;
        case (grandWin < 2500):
            index = 17;
            break;
        case (grandWin < 5000):
            index = 18;
            break;
        case (grandWin < 10000):
            index = 19;
            break;
        default:
            index = 20;
            break;
    }

    totalStats.totalWinGrandFeature[index] += grandWin;
    totalStats.totalWinGrandFeatureSpins[index]++;
    if (grandWin === 0) totalStats.totalNoWinGrandFeature++;
}

function logGrandFeatureFrequency(roundNumber, spinBet, totalSpins, totalGrandSpinsTriggered) {
    const logData = totalStats.totalWinGrandFeature.map((total, index) => {
        let frequency
        if (index === 17) {
            frequency = (totalGrandSpinsTriggered / totalSpins) * 100;
        } else {
            frequency = (totalStats.totalWinGrandFeatureSpins[index] / totalSpins) * 100;
        }
        const rtp = (total / (spinBet * roundNumber)) * 100;
        return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, Grand Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
    }).join('\n');

    logJPGrandToFile(logData);
}

function logJPGrandToFile(logData) {
    const filePath = './logJPGrandFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { handleJPGrandWinsData, logGrandFeatureFrequency };
