function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandom(min = 0, max = 100) {
  return getRandomInt(min, max);
}

function generateRandomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function getWeightedRandom(items, weights) {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

function generateMultiplierValue(multiplierWeights) {
  const weightedPool = [];
  
  multiplierWeights.forEach(item => {
    const weight = Math.round(item.weight * 100);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(item.value);
    }
  });
  
  if (weightedPool.length === 0) {
    return 2;
  }
  
  const randomIndex = getRandomInt(0, weightedPool.length - 1);
  return weightedPool[randomIndex];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomFromArray(array) {
  if (array.length === 0) {
    return null;
  }
  const randomIndex = getRandomInt(0, array.length - 1);
  return array[randomIndex];
}

module.exports = {
  generateRandom,
  generateRandomFloat,
  getWeightedRandom,
  generateMultiplierValue,
  shuffleArray,
  getRandomFromArray
};