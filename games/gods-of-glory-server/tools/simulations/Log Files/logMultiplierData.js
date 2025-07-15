const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../..', 'logGOGMultiplierFile.txt');

let multiplierWinData = [];
let totalMultiplierWin = 0;
let multiplierValues = [];

async function handleMultiplierWinsData(winAmount, multiplierValue = 1) {
  if (winAmount > 0) {
    multiplierWinData.push(winAmount);
    totalMultiplierWin += winAmount;
    if (multiplierValue > 1) {
      multiplierValues.push(multiplierValue);
    }
  }
}

function logNoWinMultiplierFeatureFrequency(multiplierTriggerCount, spinBet, totalSpins) {
  const multiplierFrequency = multiplierTriggerCount > 0 ? (totalSpins / multiplierTriggerCount) : 0;
  const multiplierHitRate = totalSpins > 0 ? (multiplierTriggerCount / totalSpins) * 100 : 0;
  const avgMultiplierWin = multiplierWinData.length > 0 ? (totalMultiplierWin / multiplierWinData.length) : 0;
  const avgMultiplierValue = multiplierValues.length > 0 ? (multiplierValues.reduce((a, b) => a + b, 0) / multiplierValues.length) : 1;
  const totalBet = totalSpins * spinBet;
  const multiplierRtp = totalBet > 0 ? (totalMultiplierWin / totalBet) * 100 : 0;
  
  const logEntry = `TotalSpins: ${totalSpins}, MultiplierTriggered: ${multiplierTriggerCount}, ` +
                  `MultiplierFreq: ${multiplierFrequency.toFixed(2)}, MultiplierHitRate: ${multiplierHitRate.toFixed(4)}%, ` +
                  `AvgMultiplierWin: ${avgMultiplierWin.toFixed(2)}, AvgMultiplierValue: ${avgMultiplierValue.toFixed(2)}, ` +
                  `TotalMultiplierWin: ${totalMultiplierWin.toFixed(2)}, Multiplier_RTP: ${multiplierRtp.toFixed(4)}%\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to Multiplier log file:', err);
    }
  });
}

function getMultiplierStats() {
  return {
    totalWins: multiplierWinData.length,
    totalWinAmount: totalMultiplierWin,
    avgWin: multiplierWinData.length > 0 ? totalMultiplierWin / multiplierWinData.length : 0,
    avgMultiplierValue: multiplierValues.length > 0 ? multiplierValues.reduce((a, b) => a + b, 0) / multiplierValues.length : 1,
    winData: [...multiplierWinData],
    multiplierValues: [...multiplierValues]
  };
}

module.exports = { handleMultiplierWinsData, logNoWinMultiplierFeatureFrequency, getMultiplierStats };