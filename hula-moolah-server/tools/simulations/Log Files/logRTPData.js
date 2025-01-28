const fs = require('fs');

function logRoundStats(noOfIterations, spinBet, totalBaseGameWin, totalFreeGameWin, totalHnSWin) {
    const bgrtp = (totalBaseGameWin / (spinBet * noOfIterations)) * 100;
    const fgrtp = (totalFreeGameWin / (spinBet * noOfIterations)) * 100;
    const hnsrtp = (totalHnSWin/ (spinBet * noOfIterations)) * 100;
    const gameRtp = (bgrtp + fgrtp + hnsrtp)
    const logData = `
    ----------------GLOBAL---------------
    Iteration: ${noOfIterations}
    MaxRoundTotalWin: ${totalBaseGameWin.toFixed(3)}
    BaseGame RTP (BG): ${bgrtp.toFixed(3)} [Expected: 43.718]
    FreeGame RTP (FG): ${fgrtp.toFixed(3)} [Expected: 18.735]
    HoldNSpin RTP (HNS): ${hnsrtp.toFixed(3)} [Expected: 31.980]
    Game RTP (Total): ${gameRtp.toFixed(3)} [Expected: 94.417]`;
    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logRTPFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
    // fs.appendFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { logRoundStats }