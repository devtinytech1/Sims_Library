import DiePinataDie from './games/index.cjs';
import WildSquadQuad from './games/wild-quad-squad-server/tools/simulations/index.js'

const SimulationLibrary = {
  DiePinataDie,
  WildSquadQuad,
};

// Run both at the same time, assuming the functions return promises:
async function runSimulations() {
  try {
    const [diePinataResult, WildSquadQuadResult] = await Promise.all([
      SimulationLibrary.DiePinataDie(), // Call the function from DiePinataDie
      SimulationLibrary.wild()          // Call the function from WildSquadQuad
    ]);

    console.log('DiePinataDie result:', diePinataResult);
    console.log('WildSquadQuad result:', WildSquadQuadResult);
  } catch (error) {
    console.error('Error running simulations:', error);
  }
}

export default runSimulations;
