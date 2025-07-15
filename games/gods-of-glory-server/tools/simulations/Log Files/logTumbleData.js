const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../..', 'logGOGTumbleFile.txt');

let tumbleWinData = [];
let totalTumbleWin = 0;

async function handleTumbleWinsData(winAmount) {
  if (winAmount > 0) {
    tumbleWinData.push(winAmount);
    totalTumbleWin += winAmount;
  }
}

function logNoWinTumbleFeatureFrequency(tumbleTriggerCount, spinBet, totalSpins) {
  const tumbleFrequency = tumbleTriggerCount > 0 ? (totalSpins / tumbleTriggerCount) : 0;
  const tumbleHitRate = totalSpins > 0 ? (tumbleTriggerCount / totalSpins) * 100 : 0;
  const avgTumbleWin = tumbleWinData.length > 0 ? (totalTumbleWin / tumbleWinData.length) : 0;
  const totalBet = totalSpins * spinBet;
  const tumbleRtp = totalBet > 0 ? (totalTumbleWin / totalBet) * 100 : 0;
  
  const logEntry = `TotalSpins: ${totalSpins}, TumbleTriggered: ${tumbleTriggerCount}, ` +
                  `TumbleFreq: ${tumbleFrequency.toFixed(2)}, TumbleHitRate: ${tumbleHitRate.toFixed(4)}%, ` +
                  `AvgTumbleWin: ${avgTumbleWin.toFixed(2)}, TotalTumbleWin: ${totalTumbleWin.toFixed(2)}, ` +
                  `Tumble_RTP: ${tumbleRtp.toFixed(4)}%\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to Tumble log file:', err);
    }
  });
}

function getTumbleStats() {
  return {
    totalWins: tumbleWinData.length,
    totalWinAmount: totalTumbleWin,
    avgWin: tumbleWinData.length > 0 ? totalTumbleWin / tumbleWinData.length : 0,
    winData: [...tumbleWinData]
  };
}

module.exports = { handleTumbleWinsData, logNoWinTumbleFeatureFrequency, getTumbleStats };