
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
    Spin RTP (BG): ${bgrtp.toFixed(3)} [Expected: 54.109]
    Free Spin RTP (FG): ${fgrtp.toFixed(3)} [Expected: 38.534]
    Jackpot RTP (JP): ${jprtp.toFixed(3)} [Expected: 3.533]
    Game RTP (Total): ${gameRtp.toFixed(3)} [Expected: 96.176]`;

    logToFile(logData);
}

function logFeatureRTP(roundNumber, client, logParams) {
    const spinBet = client.node.spinBet

    const diceWildRtp = (logParams.totalDiceWild / (spinBet * roundNumber)) * 100;
    const diceBonusRtp = (logParams.totalDiceBonus / (spinBet * roundNumber)) * 100;
    const respinRTP = (logParams.totalRespinWin / (spinBet * roundNumber)) * 100;
    const basegameRTP = (logParams.totalBasegameWin / (spinBet * roundNumber)) * 100;

    const fsdiceWildRtp = (logParams.totalFsDiceWild / (spinBet * roundNumber)) * 100;
    const fsdiceBonusRtp = (logParams.totalFsDiceBonus / (spinBet * roundNumber)) * 100;
    const fsrespinRTP = (logParams.totalFsRespinWin / (spinBet * roundNumber)) * 100;
    const freespinsRTP = (logParams.totalFSgameWin / (spinBet * roundNumber)) * 100;

    const mini = (logParams.Mini / (spinBet * roundNumber)) * 100;
    const minor = (logParams.Minor / (spinBet * roundNumber)) * 100;
    const major = (logParams.Major / (spinBet * roundNumber)) * 100;
    const grand = (logParams.Grand / (spinBet * roundNumber)) * 100;

    const logData = `
    ----------------BASE GAME---------------
    BG RTP: ${basegameRTP.toFixed(3)} [Expected: 13.032]
    BG Wild RTP: ${diceWildRtp.toFixed(3)} [Expected: 23.828]
    BG Bonus RTP: ${diceBonusRtp.toFixed(3)} [Expected: 0.407]
    BG Respin RTP: ${respinRTP.toFixed(3)} [Expected: 16.842]
    
    ----------------FREE GAME---------------
    FG RTP: ${freespinsRTP.toFixed(3)} [Expected: 2.880]
    FG Wild RTP: ${fsdiceWildRtp.toFixed(3)} [Expected: 22.208]
    FG Bonus RTP: ${fsdiceBonusRtp.toFixed(3)} [Expected: 0.156]
    FG Respin RTP: ${fsrespinRTP.toFixed(3)} [Expected: 13.290]
    
    ----------------JACKPOT---------------
    Mini RTP: ${mini.toFixed(3)} [Expected: 1.521]
    Minor RTP: ${minor.toFixed(3)} [Expected: 0.871]
    Major RTP: ${major.toFixed(3)} [Expected: 0.610]
    Grand RTP: ${grand.toFixed(3)} [Expected: 0.531]

    ------------------------------------END ROUND------------------------------------`;
    logToFile(logData);
}

function logToFile(logData) {
    const filePath = './logRTPFile04.txt';
    fs.writeFileSync(filePath, logData + '\n', 'utf8');
    // fs.appendFileSync(filePath, logData + '\n', 'utf8');
}

module.exports = { logRoundStats, logFeatureRTP }