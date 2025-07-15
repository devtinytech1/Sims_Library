import DiePinataDie from './games/index.cjs';
import WildSquadQuad from './games/wild-quad-squad-server/tools/simulations/index.js'
import HulaMoolah from './games/hula-moolah-server/tools/simulations/index.js'
import RedPandaRising from './games/red-panda-rising-server/tools/simulations/index.js'
import TheFunHell from './games/the-fun-hell-server/tools/simulations/index.js'
import GodsOfGlory from './games/gods-of-glory-server/tools/simulations/index.js'

const SimulationLibrary = {
  DiePinataDie,
  WildSquadQuad,
  HulaMoolah,
  RedPandaRising,
  TheFunHell,
  GodsOfGlory,
};

// Run both at the same time, assuming the functions return promises:
async function runSimulations() {
  try {
    const [diePinataResult, wildSquadQuadResult, hulaMoolahResult, redPandaRising, theFunHell, godsOfGlory] = await Promise.all([
      SimulationLibrary.DiePinataDie(), // Call the function from DiePinataDie
      SimulationLibrary.WildSquadQuad(),  // Call the function from WildSquadQuad
      SimulationLibrary.HulaMoolah(),  // Call the function from HulaMoolah
      SimulationLibrary.RedPandaRising(), // Call the function from RedPandaRising
      SimulationLibrary.TheFunHell(),   // Call the function from TheFunHell
      SimulationLibrary.GodsOfGlory()   // Call the function from GodsOfGlory
    ]);

    console.log('DiePinataDie result:', diePinataResult);
    console.log('WildSquadQuad result:', wildSquadQuadResult);
    console.log('HulaMoolah result:', hulaMoolahResult);
    console.log('RedPandaRising result:', redPandaRising);
    console.log('TheFunHell result:', theFunHell);
    console.log('GodsOfGlory result:', godsOfGlory);
  } catch (error) {
    console.error('Error running simulations:', error);
  }
}

export default runSimulations;
