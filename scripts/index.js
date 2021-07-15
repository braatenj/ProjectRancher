var gameState = {
    money: 1000,
    land: 5,
    landCost: 2000,
    landQuality: 1.0,
    landMax: 0,
    landUsed: 0,
    landFree: 0,
    hay: 0,
    hayGrown: 0,
    hayMax: 10,
    hayStorageUnit: 10,
    hayStorageUnitModifier: 1,
    livestockStore: [
         {name: 'cow', startWeight: 200.00, maxWeight: 1200.00, weightGainBase: 10, weightGainMod: 1, landUsed: 1, cost: 500, salePrice: 550, hayUsed: 2 }
    ],
    livestockInventory: [],
    upgrades: [
        { name: 'autoSellCow', purchased: false, cost: 1000000}
    ],
    unitID: 0,
    weightDecay: 1
}


function init() {
    menuSelect('livestock');
    document.getElementById('navLivestock').addEventListener('click', function(){menuSelect('livestock')});
    document.getElementById('navLandUpgrades').addEventListener('click', function(){menuSelect('land-upgrades')});
    document.getElementById('navRanchUpgrades').addEventListener('click', function(){menuSelect('ranch-upgrades')});
}


function menuSelect(menu) {
    
    var elements = document.getElementById('main-content').getElementsByClassName("section");
    for(var i=0; i<elements.length;i++) {
        elements[i].classList.add('d-none');
        if(elements[i].id == menu) {
            elements[i].classList.remove('d-none');
        }
    }

}

function getNextUnitID() {
    return gameState.unitID++;
}

function updateLandMax() {
    gameState.landMax = gameState.land * gameState.landQuality;
}

function updateLandUsed() {
    var count = 0;
    gameState.livestockInventory.forEach(animal => {
        count += animal.landUsed;
    });
    gameState.landUsed = count;
}

function updateLandFree() {
    gameState.landFree = gameState.landMax - gameState.landUsed;
}

function updateResourceBar() {
    document.getElementById('resource-landSummary').innerHTML = gameState.landUsed + "/" + gameState.landMax;
    document.getElementById('resource-money').innerHTML = gameState.money;
    document.getElementById('resource-hay').innerHTML = gameState.hay + "/" + gameState.hayMax;
}

function harvestHay() {
    gameState.hayGrown = (gameState.landFree * gameState.landQuality);
}

function storeHay() {
    gameState.hay += gameState.hayGrown;
    if(gameState.hay > gameState.hayMax) {
        gameState.hay = gameState.hayMax;
    }
}

function buyLand() {
    if(gameState.money >= gameState.landCost) {
        gameState.land++;
        gameState.money -= gameState.landCost;
        gameState.landCost *= 1.1;
    }
}

function buyCow() {
    if(gameState.money >= gameState.livestockStore[0].cost && gameState.landFree >= gameState.livestockStore[0].landUsed) {
        var tempCow = {id: getNextUnitID(), type: 'cow', currentWeight: gameState.livestockStore[0].startWeight, maxWeight: gameState.livestockStore[0].maxWeight, weightGain: gameState.livestockStore[0].weightGainBase * gameState.livestockStore[0].weightGainMod, landUsed: gameState.livestockStore[0].landUsed, hayUsed: gameState.livestockStore[0].hayUsed, salePrice: gameState.livestockStore[0].salePrice }
        gameState.livestockInventory.push(tempCow);
        gameState.money -= gameState.livestockStore[0].cost;
        /*
        updateLandUsed();
        updateLandFree();
        */
    }
}

function sellLivestockInventory(id) {
    gameState.money += gameState.livestockInventory[id].salePrice;
    gameState.livestockInventory.splice(id,1);
}

function updateLivestockInventory() {
    /* TODO
     * RECALCULATE TO ALLOW SPLIT EATING FROM GROWN & STORED HAY, CURRENTLY ONLY EATS FROM THE SOURCE IF IT CAN CONSUME FROM SINGLE SOURCE
     */
    gameState.livestockInventory.forEach((animal, index) => {
        if(animal.currentWeight == animal.maxWeight) {
            if(gameState.hayGrown >= animal.hayUsed/2) {
                gameState.hayGrown -= (animal.hayUsed/2);
            } else if(gameState.hay >= animal.hayUsed/2) {
                gameState.hay -= (animal.hayUsed/2);
            } else {
                animal.currentWeight -= gameState.weightDecay;
            }
            
        } else {
            if(gameState.hayGrown >= animal.hayUsed) {
                animal.currentWeight += animal.weightGain;
                if(animal.currentWeight > animal.maxWeight) {
                    animal.currentWeight = animal.maxWeight;
                }
                gameState.hayGrown -= animal.hayUsed;
            } else if(gameState.hay >= animal.hayUsed) {
                animal.currentWeight += animal.weightGain;
                if(animal.currentWeight > animal.maxWeight) {
                    animal.currentWeight = animal.maxWeight;
                }
                gameState.hay -= animal.hayUsed;
            } else if (gameState.hayGrown >= (animal.hayUsed/2)) {
                gameState.hayGrown -= (animal.hayUsed/2);
            } else if (gameState.hay >= (animal.hayUsed/2)) {
                gameState.hay -= (animal.hayUsed/2);
            } else {
                animal.currentWeight -= gameState.weightDecay;
                if(animal.currentWeight <= 0) {
                    gameState.livestockInventory.splice(index,1);
                }
            }
        }
    });
}

function updateLivestockInventoryDisplay() {
    var livestockInventoryHTML = "";
    gameState.livestockInventory.forEach((animal, index) => {
        //console.log(animal);
        livestockInventoryHTML += `
            <div class="livestock-inventory-animal">
                <p>${animal.type}</p>
                <p>${animal.currentWeight}/${animal.maxWeight} Lbs</p>
                ${(animal.currentWeight == animal.maxWeight) ? `<button onClick="sellLivestockInventory(${index})" class="livestock-sell-button">Sell</button>`:''}
            </div>
        `
    });
    document.getElementById('livestock-inventory').innerHTML = livestockInventoryHTML;
}

function updateLandSectionDisplay() {
    document.getElementById('buyLand').innerHTML = "Buy Land ($" + gameState.landCost + ")";
}


document.onload = init();
window.setInterval(function() {
    updateLandMax();
    updateLandUsed();
    updateLandFree();
    harvestHay();
    updateLivestockInventory();
    storeHay();
    updateResourceBar();
    updateLivestockInventoryDisplay();
    updateLandSectionDisplay();
    //console.log(gameState.livestockInventory);
}, 1000);
