
 /**  The objective of this function is to replace the symbols in a reel with wild symbols 
   * if an expanding wild symbol exists for that specific reel
  **/
function transformReelToWildSymbols(client, settings, expandingWildPosition) {
    let wildPos = expandingWildPosition;  
    let matrix = client.matrix      
    let wildSym = settings.base.wilds[0]
    if (wildPos.length > 0) {
      for (let iterate = 0; iterate < wildPos.length; iterate++) {
        let col = wildPos[iterate][0]  
        for (let row = 0; row < settings.base.rows; row++) {
          matrix[col][row] = wildSym  
        }
      }
    }
  }

module.exports = { transformReelToWildSymbols }