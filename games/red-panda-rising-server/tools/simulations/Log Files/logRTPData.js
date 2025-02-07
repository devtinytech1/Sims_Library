const fs = require('fs');

function logRoundStats(noOfIterations, spinBet, totalBaseGameWin, totalScatterWin, totalFreeGameWin) {
    const bgrtp = (totalBaseGameWin / (spinBet * noOfIterations)) * 100;
    const sctrRtp = (totalScatterWin / (spinBet * noOfIterations)) * 100;
    const fgrtp = (totalFreeGameWin / (spinBet * noOfIterations)) * 100;
    const gameRtp = (bgrtp + sctrRtp + fgrtp)
    const logData = `
    ----------------GLOBAL---------------
    Iteration: ${noOfIterations}
    MaxRoundTotalWin: ${totalBaseGameWin.toFixed(3)}
    BaseGame RTP (BG): ${bgrtp.toFixed(3)} [Expected: 38.8736]
    ScatterWin RTP: ${sctrRtp.toFixed(3)} [Expected: 1.0367]
    FreeGame RTP (FG): ${fgrtp.toFixed(3)} [Expected: 56.3812]
    Game RTP (Total): ${gameRtp.toFixed(3)} [Expected: 96.2915]`;
    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logRTPFile03.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
    // fs.appendFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { logRoundStats }