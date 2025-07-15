const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../..', 'logGOGFGFile.txt');

let fgWinData = [];
let totalFGWin = 0;

async function handleFGWinsData(winAmount) {
  if (winAmount > 0) {
    fgWinData.push(winAmount);
    totalFGWin += winAmount;
  }
}

function logNoWinFSFeatureFrequency(freeSpinTriggerCount, spinBet, totalSpins) {
  const fsFrequency = freeSpinTriggerCount > 0 ? (totalSpins / freeSpinTriggerCount) : 0;
  const fsHitRate = totalSpins > 0 ? (freeSpinTriggerCount / totalSpins) * 100 : 0;
  const avgFSWin = fgWinData.length > 0 ? (totalFGWin / fgWinData.length) : 0;
  const totalBet = totalSpins * spinBet;
  const fsRtp = totalBet > 0 ? (totalFGWin / totalBet) * 100 : 0;
  
  const logEntry = `TotalSpins: ${totalSpins}, FSTriggered: ${freeSpinTriggerCount}, ` +
                  `FSFreq: ${fsFrequency.toFixed(2)}, FSHitRate: ${fsHitRate.toFixed(4)}%, ` +
                  `AvgFSWin: ${avgFSWin.toFixed(2)}, TotalFSWin: ${totalFGWin.toFixed(2)}, ` +
                  `FS_RTP: ${fsRtp.toFixed(4)}%\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to FG log file:', err);
    }
  });
}

function getFGStats() {
  return {
    totalWins: fgWinData.length,
    totalWinAmount: totalFGWin,
    avgWin: fgWinData.length > 0 ? totalFGWin / fgWinData.length : 0,
    winData: [...fgWinData]
  };
}

module.exports = { handleFGWinsData, logNoWinFSFeatureFrequency, getFGStats };