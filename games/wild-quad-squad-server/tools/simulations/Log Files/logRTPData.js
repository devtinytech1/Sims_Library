const fs = require('fs');

function logRoundStats(noOfIterations, spinBet, totalBaseGameWin, totalBGCascadeWin, totalFreeGameWin, totalFGCascadeWin) {
    const bgrtp = (totalBaseGameWin / (spinBet * noOfIterations)) * 100;
    const bgCascadetrRtp = (totalBGCascadeWin / (spinBet * noOfIterations)) * 100;
    const fgrtp = (totalFreeGameWin / (spinBet * noOfIterations)) * 100;
    const fgCascadetrRtp = (totalFGCascadeWin / (spinBet * noOfIterations)) * 100;
    const gameRtp = (bgrtp + bgCascadetrRtp + fgrtp + fgCascadetrRtp)
    const logData = `
    ----------------GLOBAL---------------
    Iteration: ${noOfIterations}
    MaxRoundTotalWin: ${totalBaseGameWin.toFixed(3)}
    BaseGame RTP: ${bgrtp.toFixed(3)} [Expected: 20.7608]
    BG_Cascade RTP: ${bgCascadetrRtp.toFixed(3)} [Expected: 27.3443]
    FreeGame RTP: ${fgrtp.toFixed(3)} [Expected: 21.9758]
    FG_Cascade RTP: ${fgCascadetrRtp.toFixed(3)} [Expected: 26.0730]
    Game RTP (Total): ${gameRtp.toFixed(3)} [Expected: 96.1539]`;
    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logRTPFile.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
    // fs.appendFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { logRoundStats }