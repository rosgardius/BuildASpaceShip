// --- CONFIGURATION ---
const CONFIG = {
  Rockets: ['Bottle', 'Canister', 'Gas tank', 'Firework', 'Gasoline', 'Diesel', 'Propane', 'Uranium', 'Alien', 'Hyperdrive', 'Antimatter'],
  Ships: ['Cardboard box ship', 'Trash can ship', 'Sofa ship', 'Ikea shelf ship', 'Lada ship', 'Ford Escort ship', 'Audi ship', 'Delorean', 'Vostok 1', 'Apollo 11', 'Vic Viper', 'USS Discovery One', 'Battlestar Galactica BG-75', 'Prometheus', 'Serenity', 'Star Destroyer', 'USS Enterprise',  'Millenium Falcon'],
  Wings: ['Paper', 'Cloth', 'Aluminium foil', 'Plastic', 'Wooden', 'Tin', 'Copper', 'Nickel', 'Bronze', 'Iron', 'Steel', 'Aluminium', 'Solar', 'Titanium', 'Carbon fabric', 'Adamantium', 'Black Matter'],
  MoneyFormat: ['K', 'M', 'B', 'T', 'Qd', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QdDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QdVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QdTg', 'QtTg', 'SxTg', 'SpTg', 'OTg','NTg', 'Qa', 'UQa', 'DQa', 'TQa', 'QdQa', 'QtQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QdOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QdNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn'].reverse(),
  Parts: {
    rocket: { nameArray: 'Rockets', costMult: 7776, speedMult: 2, updateCostMult: 6, updateSpeedMult: 1.5, type: 'rockets', updateType: 'rocketUpdates', costType: 'rocketCost', updateCostType: 'rocketUpdateCost' },
    ship: { nameArray: 'Ships', costMult: 243, baseSpeedAdd: 0.1, updateCostMult: 3, updateSpeedAddType: true, type: 'ships', updateType: 'shipUpdates', costType: 'shipCost', updateCostType: 'shipUpdateCost' },
    wing: { nameArray: 'Wings', costMult: 97.65, speedMult: 1.5, updateCostMult: 2.5, updateSpeedMult: 1.2, type: 'wings', updateType: 'wingUpdates', costType: 'wingCost', updateCostType: 'wingUpdateCost' }
  },
  Achievements: [
    { id: 'firstAchievement', condition: state => state.distance > 10, text: "I can still see you" },
    { id: 'secondAchievement', condition: state => state.baseSpeed * state.speedMultipliers > 340.29, text: "I can still hear you" },
    { id: 'thirdAchievement', condition: state => state.distance > 50000, text: "You have reached the edge of the stratosphere." },
    { id: 'fourthAchievement', condition: state => state.distance > 384400000, text: "Neil Armstrong all over again." },
    { id: 'fifthAchievement', condition: state => state.baseSpeed * state.speedMultipliers > 299792458, text: "You're going faster than light. You hacker." },
    { id: 'sixthAchievement', condition: state => state.distance > 149597871000, text: "Don't go too close to the sun." },
    { id: 'seventhAchievement', condition: state => state.distance > 9.4605284e15, text: "Wow! You have travelled a light-year!" },
    { id: 'eightAchievement', condition: state => state.distance > 9.4605284e18, text: "Millenium? That's like a thousand years!" },
    { id: 'ninthAchievement', condition: state => state.distance > 4.4e26, text: "So this is The Edge?" }
  ]
};

// --- DEFAULT STATE ---
const DEFAULT_STATE = {
  distance: 0,
  bestDistance: 0,
  baseSpeed: 0,
  speedMultipliers: 1,
  money: 20,
  funds: 0.1,
  capitalismAmount: 1,
  rocketCost: 10,
  shipCost: 10,
  wingCost: 25,
  rockets: 0,
  ships: 0,
  wings: 0,
  rocketUpdateCost: 20,
  shipUpdateCost: 20,
  wingUpdateCost: 40,
  rocketUpdates: 0,
  shipUpdates: 0,
  wingUpdates: 0,
  totalMoney: 0,
  totalDistance: 0,
  prestigeAmount: 0,
  nextPlanet: 500000000,
  firstAchievement: false,
  secondAchievement: false,
  thirdAchievement: false,
  fourthAchievement: false,
  fifthAchievement: false,
  sixthAchievement: false,
  seventhAchievement: false,
  eightAchievement: false,
  ninthAchievement: false,
  slaveryCost: 10,
  capitalismCost: 50,
  onAir: false,
  msgShown: false,
  lastSaveTime: Date.now()
};

let player = { ...DEFAULT_STATE };
let lastUpdate = Date.now();
let scientific = false;

// --- FORMATTER ---
const Formatter = {
  shorten: function(money) {
    let temp = CONFIG.MoneyFormat.length;
    for (let i = 0; i < CONFIG.MoneyFormat.length; i++) {
      if (Math.pow(10, temp * 3) <= money) {
        money = money / Math.pow(10, temp * 3);
        return scientific ? money.toFixed(2) + 'e+' + (CONFIG.MoneyFormat.length - i) * 3 : money.toFixed(2) + ' ' + CONFIG.MoneyFormat[i];
      }
      temp--;
    }
    return money.toFixed(1);
  },
  shortenCosts: function(money) {
    let temp = CONFIG.MoneyFormat.length;
    const digitMul = 100;
    for (let i = 0; i < CONFIG.MoneyFormat.length; i++) {
      if (Math.pow(10, temp * 3) <= money) {
        money = money / Math.pow(10, temp * 3);
        const rounded = Math.round(money * digitMul) / digitMul;
        if (rounded == 1000) {
          return scientific ? (rounded / 1000) + 'e+' + (CONFIG.MoneyFormat.length - i + 1) * 3 : (rounded / 1000) + ' ' + CONFIG.MoneyFormat[i - 1];
        }
        return scientific ? rounded + 'e+' + (CONFIG.MoneyFormat.length - i) * 3 : rounded + ' ' + CONFIG.MoneyFormat[i];
      }
      temp--;
    }
    return Math.floor(money);
  },
  shortenFunds: function(money) {
    let temp = CONFIG.MoneyFormat.length;
    for (let i = 0; i < CONFIG.MoneyFormat.length; i++) {
      if (Math.pow(10, temp * 3) <= money) {
        money = money / Math.pow(10, temp * 3);
        return scientific ? money.toFixed(2) + 'e+' + (CONFIG.MoneyFormat.length - i) * 3 : money.toFixed(2) + ' ' + CONFIG.MoneyFormat[i];
      }
      temp--;
    }
    return money.toFixed(2);
  },
  speedIndicators: function(howfast) {
    if (!scientific) {
      if (howfast > 9.4605284e18) return Formatter.shorten(howfast / 9.4605284e18) + " light-millenniums/s";
      if (howfast > 9.4605284e15) return Formatter.shorten(howfast / 9.4605284e15) + " light-years/s";
      if (howfast > 149597871000) return Formatter.shorten(howfast / 149597871000) + " AU/s";
      if (howfast > 299792458) return Formatter.shorten(howfast / 299792458) + "c";
    }
    return Formatter.shorten(howfast) + " m/s";
  },
  distanceIndicators: function(howfar) {
    if (!scientific) {
      if (howfar > 9.4605284e18) return Formatter.shorten(howfar / 9.4605284e18) + " light-millenniums.";
      if (howfar > 9.4605284e15) return Formatter.shorten(howfar / 9.4605284e15) + " light-years.";
      if (howfar > 149597871000) return Formatter.shorten(howfar / 149597871000) + " AUs.";
    }
    return Formatter.shorten(howfar) + " meters.";
  }
};

// --- UI MANAGEMENT ---
const UI = {
  elements: {},
  init: function() {
    this.elements = {
      meterLabel: document.getElementById("meters"),
      rocketButton: document.getElementById("rockets"),
      shipButton: document.getElementById("ship"),
      wingButton: document.getElementById("wings"),
      speedLabel: document.getElementById("speed"),
      moneyLabel: document.getElementById("money"),
      rocketUpdateButton: document.getElementById("rocketUpdate"),
      shipUpdateButton: document.getElementById("shipUpdate"),
      wingUpdateButton: document.getElementById("wingUpdate"),
      launchButton: document.getElementById("launch"),
      slaveryButton: document.getElementById("speedMultiplier"),
      capitalismButton: document.getElementById("baseMultiplier"),
      rocketUpdateAmount: document.getElementById("rocketUpdateAmount"),
      shipUpdateAmount: document.getElementById("shipUpdateAmount"),
      wingUpdateAmount: document.getElementById("wingUpdateAmount"),
      slaveryCost: document.getElementById("slaveryCost"),
      capitalismCost: document.getElementById("capitalismCost"),
      prestige: document.getElementById("prestige"),
      prestigeUpgrades: document.getElementById("prestigeUpgrades"),
      shipContainer: document.getElementById("shipContainer"),
      baseSpeed: document.getElementById("baseSpeed"),
      statRockets: document.getElementById("statRockets"),
      statWings: document.getElementById("statWings"),
      statShips: document.getElementById("statShips"),
      fundStats: document.getElementById("fundStats"),
      bestDistance: document.getElementById("bestDistance"),
      achievementAmount: document.getElementById("achievementAmount"),
      funds: document.getElementById("funds"),
      shipDisplay: document.getElementById("shipDisplay"),
      resetButton: document.getElementById("resetButton"),
      totalMoney: document.getElementById("totalMoney"),
      totalDistance: document.getElementById("totalDistance"),
      nextPlanet: document.getElementById("nextPlanet"),
      refugeesOnPrestige: document.getElementById("refugeesOnPrestige"),
      arrival: document.getElementById("arrival"),
      modal: document.getElementById("popup"),
      achievementBox: document.getElementById("achievementBox")
    };
  },
  update: function() {
    if (!this.elements.meterLabel) return;
    
    const speed = player.baseSpeed * player.speedMultipliers;
    
    this.elements.meterLabel.innerHTML = "You have travelled " + Formatter.distanceIndicators(player.distance);
    this.elements.moneyLabel.innerHTML = Formatter.shorten(player.money) + " €";
    this.elements.speedLabel.innerHTML = Formatter.speedIndicators(speed);
    
    const fundsPerSec = player.funds * player.capitalismAmount * (1 + player.prestigeAmount * 0.02);
    this.elements.funds.innerHTML = Formatter.shorten(player.distance * fundsPerSec) + " €/s";
    
    this.elements.rocketButton.innerHTML = Formatter.shortenCosts(player.rocketCost) + " € for " + CONFIG.Rockets[player.rockets] + " rocket.";
    this.elements.shipButton.innerHTML = Formatter.shortenCosts(player.shipCost) + " € for " + CONFIG.Ships[player.ships] + ".";
    this.elements.wingButton.innerHTML = Formatter.shortenCosts(player.wingCost) + " € for " + CONFIG.Wings[player.wings] + " wings.";
    
    this.elements.rocketUpdateAmount.innerHTML = player.rocketUpdates + "/5";
    this.elements.shipUpdateAmount.innerHTML = player.shipUpdates + "/5";
    this.elements.wingUpdateAmount.innerHTML = player.wingUpdates + "/5";
    
    this.elements.rocketUpdateButton.innerHTML = Formatter.shortenCosts(player.rocketUpdateCost) + " € to update your rockets";
    this.elements.shipUpdateButton.innerHTML = Formatter.shortenCosts(player.shipUpdateCost) + " € to update your ship";
    this.elements.wingUpdateButton.innerHTML = Formatter.shortenCosts(player.wingUpdateCost) + " € to update your wings";
    
    let shipAddSpeed = Math.round(0.1 * (player.ships * player.shipUpdates + 1) * 10) / 10;
    if (player.shipUpdates === 5) shipAddSpeed = 0.1;
    this.elements.shipUpdateButton.setAttribute('data-tooltip', `Adds ${shipAddSpeed} to your base speed. Currently at ${Math.round(player.baseSpeed * 10) / 10}`);
    
    this.elements.launchButton.innerHTML = player.onAir ? "Return to Earth." : "LAUNCH";
    
    this.elements.slaveryCost.innerHTML = 'Cost: ' + Formatter.shortenCosts(player.slaveryCost) + ' refugees.';
    this.elements.capitalismCost.innerHTML = 'Cost: ' + Formatter.shortenCosts(player.capitalismCost) + ' refugees.';
    
    if (player.prestigeAmount !== 0) {
      this.elements.prestige.innerHTML = "You have " + Formatter.shortenCosts(player.prestigeAmount) + " refugees on your exoplanet.";
      this.elements.prestigeUpgrades.style.display = 'block';
    } else {
      this.elements.prestige.innerHTML = "You need to travel further...";
    }
    
    this.elements.rocketButton.className = (player.money >= player.rocketCost && (player.rockets === 0 || player.rocketUpdates === 5) && !player.onAir) ? 'button' : 'nbutton';
    this.elements.shipButton.className = (player.money >= player.shipCost && (player.ships === 0 || player.shipUpdates === 5) && !player.onAir) ? 'button' : 'nbutton';
    this.elements.wingButton.className = (player.money >= player.wingCost && (player.wings === 0 || player.wingUpdates === 5) && !player.onAir) ? 'button' : 'nbutton';
    
    this.elements.rocketUpdateButton.className = (player.money >= player.rocketUpdateCost && player.rocketUpdates < 5 && player.rockets !== 0) ? 'button' : 'nbutton';
    this.elements.shipUpdateButton.className = (player.money >= player.shipUpdateCost && player.shipUpdates < 5 && player.ships !== 0) ? 'button' : 'nbutton';
    this.elements.wingUpdateButton.className = (player.money >= player.wingUpdateCost && player.wingUpdates < 5 && player.wings !== 0) ? 'button' : 'nbutton';
    
    this.elements.slaveryButton.className = (player.prestigeAmount >= player.slaveryCost) ? 'button' : 'nbutton';
    this.elements.capitalismButton.className = (player.prestigeAmount >= player.capitalismCost) ? 'button' : 'nbutton';

    let shipPos = 3;
    if (player.distance < player.nextPlanet) {
      shipPos = Math.round((90 - 87 * player.distance / player.nextPlanet) * 100) / 100;
    }
    this.elements.shipDisplay.style.top = shipPos + '%';
    
    this.elements.resetButton.style.visibility = (player.distance >= player.nextPlanet) ? 'visible' : 'hidden';
    
    this.elements.totalMoney.innerHTML = "You have made a total of " + Formatter.shorten(player.totalMoney) + " €";
    this.elements.totalDistance.innerHTML = "You have travelled a total of " + Formatter.distanceIndicators(player.totalDistance);
    this.elements.nextPlanet.innerHTML = "Distance to the next exoplanet: " + Formatter.distanceIndicators(Math.max((player.nextPlanet - player.distance), 0));
    this.elements.refugeesOnPrestige.innerHTML = "You get " + Formatter.shortenCosts(getPrestige() - player.prestigeAmount) + " refugees on reset.";
    
    const seconds = Math.max(Math.round((player.nextPlanet - player.distance) / Math.max(speed, 0.001)), 0) || 0;
    if (seconds > 86400) {
      this.elements.arrival.innerHTML = 'Arrival in: ' + Math.round(seconds / 86400) + ' Days';
    } else if (seconds > 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      this.elements.arrival.innerHTML = `Arrival in: ${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    } else {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      this.elements.arrival.innerHTML = `Arrival in: ${m}:${s < 10 ? '0' : ''}${s}`;
    }
    
    this.elements.baseSpeed.innerHTML = "Your base speed is " + Math.round(player.baseSpeed * 10) / 10;
    this.elements.statRockets.innerHTML = "You have bought " + player.rockets + " rockets.";
    this.elements.statWings.innerHTML = "You have bought " + player.wings + " pair of wings.";
    this.elements.statShips.innerHTML = "You have bought " + player.ships + " ships.";
    this.elements.fundStats.innerHTML = "You get " + Formatter.shortenFunds(fundsPerSec) + " € per second for each meter travelled. This is increased by achievements";
    this.elements.bestDistance.innerHTML = 'Furthest travelled: ' + Formatter.distanceIndicators(player.bestDistance);
    
    let achievementsCount = 0;
    CONFIG.Achievements.forEach(ach => {
      if (player[ach.id]) {
        achievementsCount++;
        const el = document.getElementById(ach.id);
        if (el) el.style.display = 'block';
      }
    });
    this.elements.achievementAmount.innerHTML = achievementsCount + '/9 achievements unlocked.';
  }
};

// --- SAVE/LOAD ---
function load_game() {
  try {
    const save_data = localStorage.getItem('save');
    if (save_data) {
      const parsed = JSON.parse(save_data);
      player = { ...DEFAULT_STATE, ...parsed };
      
      if (player.onAir && player.lastSaveTime) {
        const now = Date.now();
        const diffSeconds = (now - player.lastSaveTime) / 1000;
        if (diffSeconds > 60) {
          const speed = player.baseSpeed * player.speedMultipliers;
          const distEarned = speed * diffSeconds;
          const fundsPerSec = player.funds * player.capitalismAmount * (1 + player.prestigeAmount * 0.02);
          const moneyEarned = (player.distance + distEarned / 2) * fundsPerSec * diffSeconds;
          
          player.distance += distEarned;
          player.money += moneyEarned;
          player.totalDistance += distEarned;
          player.totalMoney += moneyEarned;
          
          if (player.distance > player.bestDistance) player.bestDistance = player.distance;
          
          alert(`You were gone for ${Formatter.shorten(diffSeconds)} seconds.\nTravelled: ${Formatter.distanceIndicators(distEarned)}\nEarned: ${Formatter.shorten(moneyEarned)} €`);
        }
      }
    }
  } catch (e) {
    console.error('Save loading failed:', e);
  }
}

function save_game() {
  player.lastSaveTime = Date.now();
  localStorage.setItem('save', JSON.stringify(player));
}

// Import/Export
function exportSave() {
  player.lastSaveTime = Date.now();
  const encoded = btoa(JSON.stringify(player));
  navigator.clipboard.writeText(encoded).then(() => {
    alert("Save copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
    prompt("Copy this text:", encoded);
  });
}

function importSave() {
  const saveStr = prompt("Paste your save string here:");
  if (saveStr) {
    try {
      const decoded = JSON.parse(atob(saveStr));
      if (decoded && decoded.money !== undefined) {
        player = { ...DEFAULT_STATE, ...decoded };
        save_game();
        UI.update();
        alert("Save loaded successfully!");
      } else {
        throw new Error("Invalid save data");
      }
    } catch (e) {
      alert("Invalid save string!");
    }
  }
}

// --- LOGIC ---
function buyPart(part) {
  const conf = CONFIG.Parts[part];
  const count = player[conf.type];
  const cost = player[conf.costType];
  const updates = player[conf.updateType];
  
  if (count === 0 && player.money >= cost && !player.onAir) {
    player.money -= cost;
    player[conf.costType] *= conf.costMult;
    if (conf.speedMult) player.speedMultipliers *= conf.speedMult;
    if (conf.baseSpeedAdd) player.baseSpeed += conf.baseSpeedAdd;
    player[conf.type]++;
    player[conf.updateType] = 0;
  } else if (player.money >= cost && updates === 5 && !player.onAir) {
    player.money -= cost;
    player[conf.costType] *= conf.costMult;
    player[conf.type]++;
    player[conf.updateType] = 0;
  }
  UI.update();
}

function upgradePart(part) {
  const conf = CONFIG.Parts[part];
  const count = player[conf.type];
  const updateCost = player[conf.updateCostType];
  const updates = player[conf.updateType];
  
  if (player.money >= updateCost && updates < 5 && count !== 0) {
    player.money -= updateCost;
    player[conf.updateCostType] *= conf.updateCostMult;
    if (conf.updateSpeedMult) player.speedMultipliers *= conf.updateSpeedMult;
    if (conf.updateSpeedAddType) {
      player.baseSpeed += 0.1 * (player.ships * player.shipUpdates + 1);
    }
    player[conf.updateType]++;
    UI.update();
  }
}

function buyMaxUpdates() {
  let bought = false;
  ['rocket', 'ship', 'wing'].forEach(part => {
    const conf = CONFIG.Parts[part];
    
    while (player.money >= player[conf.updateCostType] && player[conf.updateType] < 5 && player[conf.type] !== 0) {
      player.money -= player[conf.updateCostType];
      player[conf.updateCostType] *= conf.updateCostMult;
      if (conf.updateSpeedMult) player.speedMultipliers *= conf.updateSpeedMult;
      if (conf.updateSpeedAddType) player.baseSpeed += 0.1 * (player.ships * player.shipUpdates + 1);
      player[conf.updateType]++;
      bought = true;
    }
    
    if (player.money >= player[conf.costType] && player[conf.updateType] === 5 && !player.onAir) {
      player.money -= player[conf.costType];
      player[conf.costType] *= conf.costMult;
      player[conf.type]++;
      player[conf.updateType] = 0;
      bought = true;
    }
  });
  
  if (bought) {
    buyMaxUpdates();
  } else {
    UI.update();
  }
}

function getPrestige() {
  return Math.round(Math.pow((player.totalMoney / 1e11), 1 / 3) * 100);
}

function achievement(name) {
  if (UI.elements.achievementBox) {
    UI.elements.achievementBox.innerHTML = name;
    if (window.jQuery) {
      $( '#achievementBox' ).fadeIn( 4000 ).fadeOut(1500);
    } else {
      UI.elements.achievementBox.style.display = 'block';
      setTimeout(() => { UI.elements.achievementBox.style.display = 'none'; }, 5500);
    }
  }
  player.funds *= 1.1;
  UI.update();
}

function showTab(tabName) {
  const tabs = document.getElementsByClassName('tab');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.display = (tabs[i].id === tabName) ? 'inline-block' : 'none';
  }
  UI.update();
}

function init() {
  UI.init();
  
  const setupClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  setupClick('yourship', () => {
    showTab('game');
    UI.elements.shipContainer.style.display = 'inline-block';
    if (player.prestigeAmount !== 0) UI.elements.prestigeUpgrades.style.display = 'block';
  });
  
  setupClick('statbutton', () => {
    showTab('statistics');
    UI.elements.prestigeUpgrades.style.display = 'none';
    UI.elements.shipContainer.style.display = 'none';
  });
  
  setupClick('achievementbutton', () => {
    showTab('achievements');
    UI.elements.prestigeUpgrades.style.display = 'none';
    UI.elements.shipContainer.style.display = 'none';
  });
  
  setupClick('optionsbutton', () => {
    showTab('options');
    UI.elements.prestigeUpgrades.style.display = 'none';
    UI.elements.shipContainer.style.display = 'none';
  });
  
  if (UI.elements.rocketButton) UI.elements.rocketButton.onclick = () => buyPart('rocket');
  if (UI.elements.shipButton) UI.elements.shipButton.onclick = () => buyPart('ship');
  if (UI.elements.wingButton) UI.elements.wingButton.onclick = () => buyPart('wing');
  
  if (UI.elements.rocketUpdateButton) UI.elements.rocketUpdateButton.onclick = () => upgradePart('rocket');
  if (UI.elements.shipUpdateButton) UI.elements.shipUpdateButton.onclick = () => upgradePart('ship');
  if (UI.elements.wingUpdateButton) UI.elements.wingUpdateButton.onclick = () => upgradePart('wing');
  
  setupClick('buyMax', () => buyMaxUpdates());
  
  setupClick('hardReset', () => {
    if (confirm("Are you sure you want to erase all your progress?")) {
      player = { ...DEFAULT_STATE, msgShown: true };
      UI.update();
    }
  });
  
  setupClick('twinklingbtn', () => {
    const el = document.getElementsByClassName("twinkling")[0];
    if (el) el.style.display = (el.style.display === 'block' || el.style.display === '') ? 'none' : 'block';
  });
  
  setupClick('notationbtn', () => {
    scientific = !scientific;
    UI.update();
  });
  
  setupClick('exportSaveBtn', exportSave);
  setupClick('importSaveBtn', importSave);
  
  if (UI.elements.launchButton) {
    UI.elements.launchButton.onclick = () => {
      if (player.onAir) {
        player.onAir = false;
        player.distance = 0;
      } else {
        player.onAir = true;
      }
      UI.update();
    };
  }
  
  if (UI.elements.slaveryButton) {
    UI.elements.slaveryButton.onclick = () => {
      if (player.prestigeAmount >= player.slaveryCost) {
        player.speedMultipliers *= 3;
        player.prestigeAmount -= player.slaveryCost;
        player.slaveryCost *= 10000;
        UI.update();
      }
    };
  }
  
  if (UI.elements.capitalismButton) {
    UI.elements.capitalismButton.onclick = () => {
      if (player.prestigeAmount >= player.capitalismCost) {
        player.capitalismAmount *= 3;
        player.prestigeAmount -= player.capitalismCost;
        player.capitalismCost *= 20000;
        UI.update();
      }
    };
  }
  
  if (UI.elements.resetButton) {
    UI.elements.resetButton.onclick = () => {
      if (confirm("Do you want to make a colony to the exoplanet you found? You will get " + Formatter.shortenCosts(getPrestige() - player.prestigeAmount) + " refugees that boost your funding by 2% each")) {
        const fundsBackup = player.funds;
        const tmBackup = player.totalMoney;
        const tdBackup = player.totalDistance;
        const bestBackup = player.bestDistance;
        const achBackup = {};
        CONFIG.Achievements.forEach(ach => achBackup[ach.id] = player[ach.id]);
        
        player = {
          ...DEFAULT_STATE,
          funds: fundsBackup,
          nextPlanet: bestBackup * 2,
          prestigeAmount: getPrestige(),
          totalMoney: tmBackup,
          totalDistance: tdBackup,
          ...achBackup,
          msgShown: true
        };
        
        if (player.onAir) player.onAir = false;
        player.distance = 0;
        
        UI.update();
      }
    };
  }

  const span = document.getElementsByClassName("close")[0];
  if (span) {
    span.onclick = () => UI.elements.modal.style.display = "none";
  }
  window.onclick = (event) => {
    if (UI.elements.modal && event.target == UI.elements.modal) {
      UI.elements.modal.style.display = "none";
    }
  };

  showTab('game');
}

// --- GAME LOOP ---
setInterval(() => {
  const now = Date.now();
  const diff = (now - lastUpdate) / 100;
  
  if (player.onAir) {
    const speed = player.baseSpeed * player.speedMultipliers;
    const fundsPerSec = player.funds * player.capitalismAmount * (1 + player.prestigeAmount * 0.02);
    
    player.distance += speed * diff / 10;
    const earnedMoney = player.distance * fundsPerSec * diff / 10;
    player.money += earnedMoney;
    player.totalDistance += speed * diff / 10;
    player.totalMoney += earnedMoney;
    
    if (player.distance > player.bestDistance) {
      player.bestDistance = player.distance;
    }
  }
  
  UI.update();
  lastUpdate = now;
}, 100);

setInterval(() => {
  save_game();
}, 10000);

setInterval(() => {
  CONFIG.Achievements.forEach(ach => {
    if (!player[ach.id] && ach.condition(player)) {
      achievement(ach.text);
      player[ach.id] = true;
    }
  });
}, 1000);

load_game();
init();

if (!player.msgShown) {
  if (UI.elements.modal) UI.elements.modal.style.display = "block";
  player.msgShown = true;
}
const twinkling = document.getElementsByClassName("twinkling")[0];
if (twinkling) twinkling.style.display = 'none';
