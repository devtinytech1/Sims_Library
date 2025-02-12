
const fs = require('fs');

function logRoundStats(roundNumber, spinBet, bgTotalWin, fgTotalWin, jpTotalWin) {
    const bgrtp = (bgTotalWin / (spinBet * roundNumber)) * 100;
    const fgrtp = (fgTotalWin / (spinBet * roundNumber)) * 100;
    const jprtp = (jpTotalWin / (spinBet * roundNumber)) * 100;
    const gameRtp = (bgrtp + fgrtp + jprtp)
    const logData = `
    ----------------GLOBAL---------------
    Iteration: ${roundNumber}
    Round Total Win: ${bgTotalWin.toFixed(3)}
    Spin RTP (BG): ${bgrtp.toFixed(3)} [Expected: 44.64%]
    Wheel Feature RTP: ${fgrtp.toFixed(3)} [Expected: 51.19%]`;

    logToFile(logData);
}

function logFeatureRTP(roundNumber, client, logParams) {
    const spinBet = client.node.spinBet
    const basegameRTP = (logParams.totalBasegameWin / (spinBet * roundNumber)) * 100;
    const freespinsRTP = (logParams.totalFSgameWin / (spinBet * roundNumber)) * 100;
    const logData = `
    ----------------BASE GAME---------------
    BG RTP: ${basegameRTP.toFixed(3)} [Expected: 44.64%]
    ----------------WHEEL---------------
    Wheel RTP: ${freespinsRTP.toFixed(3)} [Expected: 51.19%]
    ------------------------------------END ROUND------------------------------------`;
    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logRTPFile05.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
    // fs.appendFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { logRoundStats, logFeatureRTP }