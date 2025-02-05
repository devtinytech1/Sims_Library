const baseSettings = require('../../configs/settings')
const { getRandomItemByArrayWeights , getRandomInt} = require('../../math/random_controller.js')

// to check will the wild will replace 
async function check_to_replace_wild(client) {
    const settings = baseSettings.get(client.gameId)
    const wildReplace = await getRandomItemByArrayWeights(client, settings.features['wild_prob'],
        settings.features['wild_set'])
    return wildReplace
}

// to check will the scatter will replace in basegame 
async function check_to_replace_scatter(client) {
    const settings = baseSettings.get(client.gameId)
    const scatterReplace = await getRandomItemByArrayWeights(client, settings.features['scatter_prob'],
        settings.features['scatter_set'])
    return scatterReplace
}

// to check will the scatter will replace in buy a bonus  
async function check_to_replace_scatter_buy_bonus(client) {
    const settings = baseSettings.get(client.gameId)
    const scatterReplace = await getRandomItemByArrayWeights(client, settings.features['buy_bonus_scatter_prob'],
        settings.features['buy_bonus_scatter_set'])
    return scatterReplace
}

// for replacement of scatter symbol in buy a bonus 
async function replace_scatter_buy_bonus(client, matrix) {
    const settings = baseSettings.get(client.gameId)
    var numberOfScatters = await getRandomItemByArrayWeights(client, settings.features['buy_bonus_scatters_number_prob'],
        settings.features['buy_bonus_scatters_number_set'])
    //console.log('Scatter replace count:' + numberOfScatters)

    var reelIdsWithoutS = [0,1,2,3,4,5]
    var positionOnReel = [0,1,2,3,4,5]

    for (var i = 0; i < numberOfScatters; i++) 
    {
        const randomIndex = await getRandomInt(client, reelIdsWithoutS.length)
        var  reelId = reelIdsWithoutS.splice(randomIndex, 1)[0];
        const randomPositionOnReel = await getRandomInt(client, positionOnReel.length)
        var randomPosition = positionOnReel[randomPositionOnReel];

        matrix[reelId][randomPosition] = 'S'
        //console.log ('Scatter replace at (' + [reelId,randomPosition] + ')')
    }
    
    return matrix
}

// for replacement of wild symbol in  basegame
async function replace_Wild(client, matrix) {
    const settings = baseSettings.get(client.gameId)
    var numberOfWild = await getRandomItemByArrayWeights(client, settings.features['wilds_number_prob'],
        settings.features['wilds_number_set'])
    //console.log('Wild replace count:' + numberOfWild)
    var reelIdsWithoutW = [0,1,2,3,4,5]
    var positionOnReel = [0,1,2,3,4,5]

    for (var i = 0; i < numberOfWild; i++) 
    {
        const randomIndex = await getRandomInt(client, reelIdsWithoutW.length)
        var reelId = reelIdsWithoutW.splice(randomIndex, 1)[0];
        const randomPositionOnReel = await getRandomInt(client, positionOnReel.length)
        var randomPosition = positionOnReel[randomPositionOnReel];

        matrix[reelId][randomPosition] = 'W'
        //console.log('Wild replace at (' + [reelId,randomPosition] + ')')
    }
    
    return matrix
}

// for replacement of scatter symbol in basegame 
async function replace_scatter(client, matrix) {
    const settings = baseSettings.get(client.gameId)
    var numberOfScatters = await getRandomItemByArrayWeights(client, settings.features['scatters_number_prob'],
        settings.features['scatters_number_set'])
    //console.log('Scatter replace count:' + numberOfScatters)

    var reelIdsWithoutS = [0,1,2,3,4,5]
    var positionOnReel = [0,1,2,3,4,5]

    for (var i = 0; i < numberOfScatters; i++) 
    {
        const randomIndex = await getRandomInt(client, reelIdsWithoutS.length)
        var  reelId = reelIdsWithoutS.splice(randomIndex, 1)[0];
        const randomPositionOnReel = await getRandomInt(client, positionOnReel.length)
        var randomPosition = positionOnReel[randomPositionOnReel];

        matrix[reelId][randomPosition] = 'S'
        //console.log ('Scatter replace at (' + [reelId,randomPosition] + ')')
    }
    
    return matrix
}

// will wild flip in basegame
async function willTheWildFlip(client) {
    const settings = baseSettings.get(client.gameId)
    var wildFlip = await getRandomItemByArrayWeights(client, settings.features['flip_probability'],
        settings.features['flip_set'])
    return wildFlip
}

// will wild flip in freespin
async function willTheWildFlipInFS(client) {
    const settings = baseSettings.get(client.gameId)
    var wildFlipInFS = await getRandomItemByArrayWeights(client, settings.features['FS_flip_probability'],
        settings.features['FS_flip_set'])
    return wildFlipInFS
}
// to check will the wild  replace in fs
async function check_to_replace_wild_FS(client) {
    const settings = baseSettings.get(client.gameId)
    var canWildReplace = await getRandomItemByArrayWeights(client, settings.features['FS_wild_prob'],
        settings.features['FS_wild_set'])
    return canWildReplace
}

// for replacement of wild symbol in FS
async function replace_Wild_FS(client, matrix) {
    const settings = baseSettings.get(client.gameId)
    var numberOfWild = await getRandomItemByArrayWeights(client, settings.features['FS_wilds_number_prob'],
        settings.features['FS_wilds_number_set'])
    //console.log('FreeSpins Wild replace count:' + numberOfWild)
    var reelIdsWithoutW = [0,1,2,3,4,5]
    var positionOnReel = [0,1,2,3,4,5]

    for (var i = 0; i < numberOfWild; i++) 
    {
        const randomIndex = await getRandomInt(client, reelIdsWithoutW.length)
        var reelId = reelIdsWithoutW.splice(randomIndex, 1)[0];
        const randomPositionOnReel = await getRandomInt(client, positionOnReel.length)
        var randomPosition = positionOnReel[randomPositionOnReel];
        //console.log('TotalwildPlacedInFS:' + totalwilds++)
        matrix[reelId][randomPosition] = 'W'
        //console.log('FreeSpins Wild replace at (' + [reelId,randomPosition] + ')')
    }
    return matrix
}

//to check will the wild will replace in fs_cascade
async function check_to_replace_wild_FS_cascade(client) {
    const settings = baseSettings.get(client.gameId)
    var wildReplaceInFs = await getRandomItemByArrayWeights(client, settings.features['FS_cascade_wild_prob'],
        settings.features['FS_cascade_wild_set'])
    return wildReplaceInFs
}

function findReelIdsWithoutS(matrix) {
    const reelIds = [];
    
    for (let i = 0; i < matrix.length; i++) {
      const reel = matrix[i];
      let containsS = false;
      
      for (let j = 0; j < reel.length; j++) {
        if (reel[j] === 'S') {
          containsS = true;
          break;
        }
      }
      if (!containsS) {
        reelIds.push(i);
      }
    }
    return reelIds;
  }
  
  function getUniqueReelIds(positions) {
    const uniqueReelIds = new Set();
    
    for (let i = 0; i < positions.length; i++) {
      const [reelId, _] = positions[i];
      uniqueReelIds.add(reelId);
    }
    return Array.from(uniqueReelIds);
  }

  async function getRandomReelIds(client, reelIds, numberOfReels) {
    const randomReelIds = [];
    const reelIdsCopy = reelIds.slice(); // Create a copy of the original array to avoid modifying it
  
    for (let i = 0; i < numberOfReels; i++) {
        const randomIndex = await getRandomInt(client, reelIdsCopy.length)
        const randomReelId = reelIdsCopy.splice(randomIndex, 1)[0];
        randomReelIds.push(randomReelId);
    }
  
    return randomReelIds;
  }

  function countPositionsOnReels(destroy) {
    const reelPositionMap = new Map();
  
    for (let i = 0; i < destroy.length; i++) {
      const [reelId, _] = destroy[i];
  
      if (reelPositionMap.has(reelId)) {
        reelPositionMap.set(reelId, reelPositionMap.get(reelId) + 1);
      } else {
        reelPositionMap.set(reelId, 1);
      }
    }
  
    return reelPositionMap;
  }
  
    // to check will the scatter will replace in basegame_cascade
    async function check_to_replace_scatter_basegame_cascade(client) {
        const settings = baseSettings.get(client.gameId)
        var scatterReplace = await getRandomItemByArrayWeights(client, settings.features['cascade_scatter_prob'],
            settings.features['cascade_scatter_set'])
        return scatterReplace
    }
    // for replacement of scatter symbol in basegame_cascade 
    async function replace_scatter_cascade(client, matrix, destroy) {
        const settings = baseSettings.get(client.gameId)
        var numberOfScatters = await getRandomItemByArrayWeights(client, settings.features['cascade_scatters_number_prob'],
            settings.features['cascade_scatters_number_set'])
        
        var reelIds = findReelIdsWithoutS(matrix)
        var selectedReelIds = await getRandomReelIds(client, reelIds, numberOfScatters);
        var winningReelIds  = getUniqueReelIds(destroy)
        var commonReelIds = selectedReelIds.filter(item => winningReelIds.includes(item));
        const reelPositionMap = countPositionsOnReels(destroy);

        for (var scatterIndex = 0 ; scatterIndex < commonReelIds.length ; scatterIndex++)
        {
            var reelId = commonReelIds[scatterIndex]
            var numberOfPostions = reelPositionMap.get(reelId)
            const postionOnreel = await getRandomInt(client, numberOfPostions)
            matrix[reelId][postionOnreel] = 'S'
        }
        return matrix
    }

    // to check will the wild replace in basegame_cascade 
    async function check_to_replace_wild_basegame_cascade(client) {
        const settings = baseSettings.get(client.gameId)
        var wildReplace = false
        wildReplace = await getRandomItemByArrayWeights(client, settings.features['cascade_wild_prob'],
            settings.features['cascade_wild_set'])
        return wildReplace
    }

    // for replacement of wild symbol basegame_cascade
    async function replace_Wild_cascade(client, matrix, destroy) {
        const settings = baseSettings.get(client.gameId)
        var numberOfWilds = await getRandomItemByArrayWeights(client, settings.features['cascade_wilds_number_prob'],
            settings.features['cascade_wilds_number_set'])

        var reelIds = [0, 1, 2, 3, 4, 5];
        var selectedReelIds = await getRandomReelIds(client, reelIds, numberOfWilds);
        var winningReelIds  = getUniqueReelIds(destroy)
        var commonReelIds = selectedReelIds.filter(item => winningReelIds.includes(item));
        const reelPositionMap = countPositionsOnReels(destroy);

        for (var wildIndex = 0 ; wildIndex < commonReelIds.length ; wildIndex++)
        {
            var reelId = commonReelIds[wildIndex]
            var numberOfPostions = reelPositionMap.get(reelId)
            const postionOnreel = await getRandomInt(client, numberOfPostions)
            matrix[reelId][postionOnreel] = 'W'
        }
        return matrix
    }

    async function replace_Wild_FS_cascade(client, matrix, destroy) {
        const settings = baseSettings.get(client.gameId)
        var numberOfWilds = await getRandomItemByArrayWeights(client, settings.features['FS_cascade_wilds_number_prob'],
            settings.features['FS_cascade_wilds_number_set'])

        var reelIds = [0, 1, 2, 3, 4, 5];
        var selectedReelIds = await getRandomReelIds(client, reelIds, numberOfWilds);
        var winningReelIds  = getUniqueReelIds(destroy)
        var commonReelIds = selectedReelIds.filter(item => winningReelIds.includes(item));
        const reelPositionMap = countPositionsOnReels(destroy);

        for (var wildIndex= 0 ; wildIndex < commonReelIds.length ; wildIndex++)
        {
            var reelId = commonReelIds[wildIndex]
            var numberOfPostions = reelPositionMap.get(reelId)
            const postionOnreel = await getRandomInt(client, numberOfPostions)
            matrix[reelId][postionOnreel] = 'W'
        }
        return matrix
    }

module.exports = {
    check_to_replace_wild, check_to_replace_scatter, replace_scatter, replace_Wild, willTheWildFlip, willTheWildFlipInFS,
    check_to_replace_wild_FS, replace_Wild_FS, check_to_replace_wild_FS_cascade, replace_Wild_FS_cascade, check_to_replace_wild_basegame_cascade,
    replace_Wild_cascade, check_to_replace_scatter_basegame_cascade, replace_scatter_cascade, check_to_replace_scatter_buy_bonus,replace_scatter_buy_bonus,
}

