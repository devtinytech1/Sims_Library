const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../../..', 'logGOGRTPFile.txt');

function logRoundStats(round, spinBet, totalBGWin, totalFGWin, totalFeatureWin) {
  const totalWin = totalBGWin + totalFGWin + totalFeatureWin;
  const totalBet = round * spinBet;
  const rtp = totalBet > 0 ? (totalWin / totalBet) * 100 : 0;
  
  const logEntry = `Round: ${round}, Bet: ${spinBet}, TotalBet: ${totalBet}, ` +
                  `BGWin: ${totalBGWin.toFixed(2)}, FGWin: ${totalFGWin.toFixed(2)}, ` +
                  `FeatureWin: ${totalFeatureWin.toFixed(2)}, TotalWin: ${totalWin.toFixed(2)}, ` +
                  `RTP: ${rtp.toFixed(4)}%\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing to RTP log file:', err);
    }
  });
}

function logFeatureRTP(round, client, params) {
  const {
    totalTumbleWin,
    totalMultiplierWin,
    totalClusterWin,
    totalFreeSpinsWin
  } = params;
  
  const totalFeatureWin = totalTumbleWin + totalMultiplierWin + totalClusterWin;
  const totalBet = round * client.node.spinBet;
  const featureRTP = totalBet > 0 ? (totalFeatureWin / totalBet) * 100 : 0;
  
  const logEntry = `Round: ${round}, FeatureRTP: ${featureRTP.toFixed(4)}%, ` +
                  `TumbleWin: ${totalTumbleWin.toFixed(2)}, ` +
                  `MultiplierWin: ${totalMultiplierWin.toFixed(2)}, ` +
                  `ClusterWin: ${totalClusterWin.toFixed(2)}, ` +
                  `FreeSpinsWin: ${totalFreeSpinsWin.toFixed(2)}\n`;
  
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error writing feature RTP to log file:', err);
    }
  });
}

module.exports = { logRoundStats, logFeatureRTP };