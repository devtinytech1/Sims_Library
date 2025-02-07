import DiePinataDie from './games/index.cjs';
import WildSquadQuad from './games/wild-quad-squad-server/tools/simulations/index.js'
import HulaMoolah from './games/hula-moolah-server/tools/simulations/index.js'

const SimulationLibrary = {
  DiePinataDie,
  WildSquadQuad,
  HulaMoolah,
};

// Run both at the same time, assuming the functions return promises:
async function runSimulations() {
  try {
    const [diePinataResult, wildSquadQuadResult, hulaMoolahResult] = await Promise.all([
      SimulationLibrary.DiePinataDie(), // Call the function from DiePinataDie
      SimulationLibrary.WildSquadQuad(),  // Call the function from WildSquadQuad
      SimulationLibrary.HulaMoolah()  // Call the function from HulaMoolah
    ]);

    console.log('DiePinataDie result:', diePinataResult);
    console.log('WildSquadQuad result:', wildSquadQuadResult);
    console.log('HulaMoolah result:', hulaMoolahResult);
  } catch (error) {
    console.error('Error running simulations:', error);
  }
}

export default runSimulations;
