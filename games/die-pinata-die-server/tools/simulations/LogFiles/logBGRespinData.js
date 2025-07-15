// const fs = require('fs');

// let totalStats = {
//     totalNoWinBGRespinFeatureSpins: 0,
//     totalBGRespinWin: Array(21).fill(0), 
//     totalWinBGRespinFeatureSpins: Array(21).fill(0)
// };

// // async function handleBGRespinWinsData(bgRespinWin) {
// //     let index = 0;
// //     switch (true) {
// //         case (bgRespinWin === 0):
// //             index = 0;
// //             break;
// //         case (bgRespinWin < 1):
// //             index = 1;
// //             break;
// //         case (bgRespinWin < 2):
// //             index = 2;
// //             break;
// //         case (bgRespinWin < 3):
// //             index = 3;
// //             break;
// //         case (bgRespinWin < 4):
// //             index = 4;
// //             break;
// //         case (bgRespinWin < 5):
// //             index = 5;
// //             break;
// //         case (bgRespinWin < 10):
// //             index = 6;
// //             break;
// //         case (bgRespinWin < 15):
// //             index = 7;
// //             break;
// //         case (bgRespinWin < 20):
// //             index = 8;
// //             break;
// //         case (bgRespinWin < 25):
// //             index = 9;
// //             break;
// //         case (bgRespinWin < 50):
// //             index = 10;
// //             break;
// //         case (bgRespinWin < 75):
// //             index = 11;
// //             break;
// //         case (bgRespinWin < 100):
// //             index = 12;
// //             break;
// //         case (bgRespinWin < 150):
// //             index = 13;
// //             break;
// //         case (bgRespinWin < 250):
// //             index = 14;
// //             break;
// //         case (bgRespinWin < 500):
// //             index = 15;
// //             break;
// //         case (bgRespinWin < 1000):
// //             index = 16;
// //             break;
// //         case (bgRespinWin < 2500):
// //             index = 17;
// //             break;
// //         case (bgRespinWin < 5000):
// //             index = 18;
// //             break;
// //         case (bgRespinWin < 10000):
// //             index = 19;
// //             break;
// //         default:
// //             index = 20;
// //             break;
// //     }

// //     totalStats.totalBGRespinWin[index] += bgRespinWin;
// //     totalStats.totalWinBGRespinFeatureSpins[index]++;
// //     if (bgRespinWin === 0) totalStats.totalNoWinBGRespinFeatureSpins++;
// // }

// // function logNoWinBGRespinFeatureFrequency(bgRespinSpinTriggerCount, spinBet, totalSpins) {
// //     const logData = totalStats.totalBGRespinWin.map((total, index) => {
// //         const frequency = (totalStats.totalWinBGRespinFeatureSpins[index] / bgRespinSpinTriggerCount) * 100;
// //         const rtp = (total / (spinBet * totalSpins)) * 100;
// //         return `Less than ${[0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 150, 250, 500, 1000, 2500, 5000, 10000, 10000][index]} Win, BG RESPIN Feature Frequency: ${frequency.toFixed(2)}% and RTP: ${rtp.toFixed(2)}%`;
// //     }).join('\n');

// //     logToFile(logData); 
// // }

// function logToFile(logData) {
//     const filePath = './logBGRespinFile.txt';
//     fs.writeFileSync(filePath, logData + '\n', 'utf8');
// }

// module.exports = {  };
