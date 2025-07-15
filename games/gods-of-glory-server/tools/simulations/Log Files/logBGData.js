const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../..', 'logGOGBGFile.txt');

let bgWinData = [];
let noWinSpins = 0;
let totalBGWin = 0;

async function handleBGWinsData(winAmount) {
  if (winAmount > 0) {
    bgWinData.push(winAmount);
    totalBGWin += winAmount;
  } else {
    noWinSpins++;
  }
}

function logNoWinNoFeatureFrequency(round, spinBet, totalSpins) {
  const winFrequency = bgWinData.length > 0 ? (totalSpins / bgWinData.length) : 0;
  const hitRate = totalSpins > 0 ? (bgWinData.length / totalSpins) * 100 : 0;
  const avgWin = bgWinData.length > 0 ? (totalBGWin / bgWinData.length) : 0;
  const totalBet = round * spinBet;
  const rtp = totalBet > 0 ? (totalBGWin / totalBet) * 100 : 0;
  
  const logEntry = `Round: ${round}, BGWins: ${bgWinData.length}, NoWinSpins: ${noWinSpins}, ` +
                  `WinFreq: ${winFrequency.toFixed(2)}, HitRate: ${hitRate.toFixed(2)}%, ` +
                  `AvgWin: ${avgWin.toFixed(2)}, TotalBGWin: ${totalBGWin.toFixed(2)}, ` +
                  `BG_RTP: ${rtp.toFixed(4)}%\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to BG log file:', err);
    }
  });
}

function getBGStats() {
  return {
    totalWins: bgWinData.length,
    totalWinAmount: totalBGWin,
    noWinSpins: noWinSpins,
    avgWin: bgWinData.length > 0 ? totalBGWin / bgWinData.length : 0,
    winData: [...bgWinData]
  };
}

module.exports = { handleBGWinsData, logNoWinNoFeatureFrequency, getBGStats };