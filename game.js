// CONFIGURATION ---
const CONFIG = {
  Rockets: ['Bottle', 'Canister', 'Gas tank', 'Firework', 'Gasoline', 'Diesel', 'Propane', 'Uranium', 'Alien', 'Hyperdrive', 'Antimatter'],
  Ships: ['Cardboard box ship', 'Trash can ship', 'Sofa ship', 'Ikea shelf ship', 'Lada ship', 'Ford Escort ship', 'Audi ship', 'Delorean', 'Vostok 1', 'Apollo 11', 'Vic Viper', 'USS Discovery One', 'Battlestar Galactica BG-75', 'Prometheus', 'Serenity', 'Star Destroyer', 'USS Enterprise', 'Millenium Falcon'],
  Wings: ['Paper', 'Cloth', 'Aluminium foil', 'Plastic', 'Wooden', 'Tin', 'Copper', 'Nickel', 'Bronze', 'Iron', 'Steel', 'Aluminium', 'Solar', 'Titanium', 'Carbon fabric', 'Adamantium', 'Black Matter'],
  MoneyFormat: ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OTg','NTg', 'Qa', 'UQa', 'DQa', 'TQa', 'QaQa', 'QiQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QiQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QiSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QiSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QaOg', 'QiOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QaNn', 'QiNn', 'SxNn', 'SpNn', 'ONn', 'NNn'].reverse(),
  Parts: {
    rocket: { nameArray: 'Rockets', costMult: 2418.1, updateCostMult: 4.75, type: 'rockets', updateType: 'rocketUpdates', costType: 'rocketCost', updateCostType: 'rocketUpdateCost', speedMultState: 'rocketSpeedMult', updateSpeedMultState: 'rocketUpdateSpeedMult' },
    ship: { nameArray: 'Ships', costMult: 97.66, baseSpeedAdd: 0.1, updateCostMult: 2.5, updateSpeedAddType: true, type: 'ships', updateType: 'shipUpdates', costType: 'shipCost', updateCostType: 'shipUpdateCost' },
    wing: { nameArray: 'Wings', costMult: 157.28, updateCostMult: 2.75, type: 'wings', updateType: 'wingUpdates', costType: 'wingCost', updateCostType: 'wingUpdateCost', speedMultState: 'wingSpeedMult', updateSpeedMultState: 'wingUpdateSpeedMult' }
  },
  Balance: { baseRefugeeIncomeBoost: 0.001, capitalismIncomeBoost: 0.25, slaverySpeedBoost: 0.3 },
  Achievements: [
    {
      id: 'achLevelDistance',
      name: 'Distance',
      getTarget: level => Math.pow(50, level + 1),
      getCurrentValue: state => state.distance
    },
    {
      id: 'achLevelSpeed',
      name: 'Speed',
      getTarget: level => Math.pow(15, level + 1),
      getCurrentValue: state => state.cachedSpeed
    },
    {
      id: 'achLevelPlanets',
      name: 'Planets Passed',
      getTarget: level => Math.pow(level + 1, 2),
      getCurrentValue: state => state.planetsPassed
    }
  ]
};

// DEFAULT STATE ---
const DEFAULT_STATE = {
  distance: 0, bestDistance: 0, baseSpeed: 0,
  rocketSpeedMult: 2, rocketUpdateSpeedMult: 1.5,
  wingSpeedMult: 1.5, wingUpdateSpeedMult: 1.2,
  money: 50, totalMoney: 0, totalDistance: 0,
  rocketCost: 10, shipCost: 10, wingCost: 25,
  rocketUpdateCost: 20, shipUpdateCost: 20, wingUpdateCost: 40,
  rockets: 0, ships: 0, wings: 0,
  rocketUpdates: 0, shipUpdates: 0, wingUpdates: 0,
  nextPlanet: 15000000, previousPlanet: 0, planetsPassed: 0,
  refugees: 0, slaveryLevel: 0, capitalismLevel: 0,
  distanceLogBase: 10, refugeesLogBase: 10,
  cachedSpeed: 0, cachedIncomePerSec: 0,
  achLevelDistance: 0, achLevelSpeed: 0, achLevelPlanets: 0,
  msgShown: false, lastSaveTime: Date.now()
};

let player = structuredClone(DEFAULT_STATE);
let scientific = false;

// MATH & FORMULAS
const Formulas = {
  getLog: (value, base) => Math.log(Math.max(1, value)) / Math.log(base),
  calcNextPlanet: (prevPlanet, planetsPassed) => prevPlanet + prevPlanet * Math.min(3 + 0.5 * (planetsPassed - 1), 20),
  calcRefugeeReward: (nextPlanet, prevPlanet, planetsPassed, logBase) => 
    Math.floor(15 * Math.pow(2, planetsPassed) * (1 + 0.1 * Formulas.getLog(Math.max(1, (nextPlanet - prevPlanet) / 1000000), logBase))),
  calcAchievementMultiplier: levelsArray => {
    let sum = 0;
    for (let level of levelsArray) {
      sum += 0.01 * Math.pow(level, 2) + 0.01 * level;
    }
    return 1 + sum;
  },
  calcIncomePerSec: (speed, distance, distLogBase, capLevel, ref, achMult) => 
    (speed * (1 + 0.1 * Formulas.getLog(Math.max(1, distance), distLogBase)) / 4) * 
    (1 + CONFIG.Balance.capitalismIncomeBoost * capLevel) * 
    (1 + CONFIG.Balance.baseRefugeeIncomeBoost * ref) *
    achMult,
  calcRocketMult: (rockets, updates, baseMult, upMult) => {
    if (rockets === 0) return 1;
    const totalUpdates = (rockets - 1) * 5 + updates;
    return Math.pow(baseMult, rockets) * Math.pow(upMult, totalUpdates);
  },
  calcWingMult: (wings, updates, baseMult, upMult) => {
    if (wings === 0) return 1;
    const totalUpdates = (wings - 1) * 5 + updates;
    return Math.pow(baseMult, wings) * Math.pow(upMult, totalUpdates);
  },
  calcSpeed: (baseSpeed, rTotalMult, wTotalMult, slavLevel) => 
    baseSpeed * (rTotalMult * wTotalMult) * (1 + CONFIG.Balance.slaverySpeedBoost * slavLevel),
  calcCapitalismCost: level => Math.floor(10 * Math.pow(1.25, level)),
  calcSlaveryCost: level => Math.floor(5 * Math.pow(1.32, level))
};

// CACHING LOGIC ---
function updateCache() {
  const rMult = Formulas.calcRocketMult(player.rockets, player.rocketUpdates, player.rocketSpeedMult, player.rocketUpdateSpeedMult);
  const wMult = Formulas.calcWingMult(player.wings, player.wingUpdates, player.wingSpeedMult, player.wingUpdateSpeedMult);
  player.cachedSpeed = Formulas.calcSpeed(player.baseSpeed, rMult, wMult, player.slaveryLevel);
  
  const achLevels = [player.achLevelDistance, player.achLevelSpeed, player.achLevelPlanets];
  const achMult = Formulas.calcAchievementMultiplier(achLevels);
  
  player.cachedIncomePerSec = Formulas.calcIncomePerSec(player.cachedSpeed, player.distance, player.distanceLogBase, player.capitalismLevel, player.refugees, achMult);
}

const Formatter = {
  _getScaleConfig: (money) => {
    if (money < 1000) return null;
    const idx = Math.min(Math.floor(Math.log10(money) / 3), CONFIG.MoneyFormat.length) - 1;
    const val = money / Math.pow(10, (idx + 1) * 3);
    const suffix = CONFIG.MoneyFormat[CONFIG.MoneyFormat.length - 1 - idx];
    return { val, idx, suffix };
  },
  shorten: money => {
    const scale = Formatter._getScaleConfig(money);
    if (!scale) return (money || 0).toFixed(1);
    return scientific ? scale.val.toFixed(2) + 'e+' + ((scale.idx + 1) * 3) : scale.val.toFixed(2) + ' ' + scale.suffix;
  },
  shortenCosts: money => {
    let scale = Formatter._getScaleConfig(money);
    if (!scale) return Math.floor(money || 0).toString();
    
    let rounded = Math.round(scale.val * 100) / 100;
    if (rounded >= 1000 && scale.idx < CONFIG.MoneyFormat.length - 1) {
      rounded = 1; scale.idx++;
    }
    return scientific ? rounded + 'e+' + ((scale.idx + 1) * 3) : rounded + ' ' + CONFIG.MoneyFormat[CONFIG.MoneyFormat.length - 1 - scale.idx];
  },
  shortenFunds: money => {
    const scale = Formatter._getScaleConfig(money);
    if (!scale) return (money || 0).toFixed(2);
    return scientific ? scale.val.toFixed(2) + 'e+' + ((scale.idx + 1) * 3) : scale.val.toFixed(2) + ' ' + scale.suffix;
  },
  speedIndicators: howfast => {
    if (!scientific) {
      if (howfast > 9.4605284e18) return { val: Formatter.shorten(howfast / 9.4605284e18), unit: "light-millenniums/s" };
      if (howfast > 9.4605284e15) return { val: Formatter.shorten(howfast / 9.4605284e15), unit: "light-years/s" };
      if (howfast > 149597871000) return { val: Formatter.shorten(howfast / 149597871000), unit: "AU/s" };
      if (howfast > 299792458) return { val: Formatter.shorten(howfast / 299792458), unit: "c" };
    }
    return { val: Formatter.shorten(howfast), unit: "m/s" };
  },
  distanceIndicators: howfar => {
    if (!scientific) {
      if (howfar > 9.4605284e18) return { val: Formatter.shorten(howfar / 9.4605284e18), unit: "light-millenniums" };
      if (howfar > 9.4605284e15) return { val: Formatter.shorten(howfar / 9.4605284e15), unit: "light-years" };
      if (howfar > 149597871000) return { val: Formatter.shorten(howfar / 149597871000), unit: "AUs" };
    }
    return { val: Formatter.shorten(howfar), unit: "meters" };
  },
  formatTime: seconds => {
    if (!isFinite(seconds) || seconds < 0) return "Infinity";
    const d = Math.floor(seconds / 86400), h = Math.floor((seconds % 86400) / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.floor(seconds % 60);
    const parts = d > 0 ? [d, h, m, s] : h > 0 ? [h, m, s] : [m, s];
    return parts.map(part => part.toString().padStart(2, '0')).join(':');
  }
};

// DOM MANAGER
const DOM = {
  cache: {},
  set: function(id, text) {
    if (this.cache[id] !== text) {
      const el = document.getElementById(id);
      if (el) { el.textContent = text; this.cache[id] = text; }
    }
  },
  setClass: function(id, val) {
    const key = id + '_c';
    if (this.cache[key] !== val) {
      const el = document.getElementById(id);
      if (el) { el.className = val; this.cache[key] = val; }
    }
  },
  setStyle: function(id, prop, val) {
    const key = id + '_s_' + prop;
    if (this.cache[key] !== val) {
      const el = document.getElementById(id);
      if (el) { el.style[prop] = val; this.cache[key] = val; }
    }
  },
  setDisplay: function(id, show, displayType = 'inline-block') {
    this.setStyle(id, 'display', show ? displayType : 'none');
  }
};

// UI RENDERER ---
const UI = {
  activeTab: 'game',
  showTab: function(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    const active = document.getElementById(tabName);
    if (active) active.style.display = 'inline-block';
    
    DOM.setDisplay('shipContainer', tabName === 'game');
    this.update();
  },
  update: function() {
    const speed = player.cachedSpeed;
    const income = player.cachedIncomePerSec;
    
    const showRefugeesTab = player.planetsPassed > 0 || player.refugees > 0;
    const refugeesTabBtn = document.querySelector('button[data-tab="refugees"]');
    if (refugeesTabBtn) {
        refugeesTabBtn.style.display = showRefugeesTab ? 'inline-block' : 'none';
    }
    
    const distData = Formatter.distanceIndicators(player.distance);
    DOM.set('val-meters', distData.val);
    DOM.set('unit-meters', distData.unit);
    
    const spdData = Formatter.speedIndicators(speed);
    DOM.set('val-speed', spdData.val);
    DOM.set('unit-speed', spdData.unit);
    
    DOM.set('val-funds', Formatter.shortenFunds(income));
    DOM.set('val-money', Formatter.shorten(player.money));
    
    if (this.activeTab === 'game') {
      ['rocket', 'ship', 'wing'].forEach(part => {
        const conf = CONFIG.Parts[part];
        const canBuy = player.money >= player[conf.costType] && (player[conf.type] === 0 || player[conf.updateType] === 5);
        
        DOM.set(`val-cost-${part}`, Formatter.shortenCosts(player[conf.costType]));
        DOM.set(`val-name-${part}`, CONFIG[conf.nameArray][player[conf.type]] || 'Max');
        DOM.setClass(`btn-buy-${part}`, canBuy ? 'button' : 'nbutton');
        
        const canUpdate = player.money >= player[conf.updateCostType] && player[conf.updateType] < 5 && player[conf.type] !== 0;
        DOM.set(`val-update-amount-${part}`, player[conf.updateType]);
        DOM.set(`val-update-cost-${part}`, Formatter.shortenCosts(player[conf.updateCostType]));
        DOM.setClass(`btn-update-${part}`, canUpdate ? 'button' : 'nbutton');
        
        const waitBuy = !canBuy && player.money < player[conf.costType] && income > 0 && (player[conf.type] === 0 || player[conf.updateType] === 5);
        if (waitBuy) DOM.set(`val-wait-buy-${part}`, Formatter.formatTime((player[conf.costType] - player.money) / income));
        DOM.setDisplay(`wrap-wait-buy-${part}`, waitBuy, 'inline');
        
        const waitUpdate = !canUpdate && player[conf.updateType] < 5 && player[conf.type] !== 0 && player.money < player[conf.updateCostType] && income > 0;
        if (waitUpdate) DOM.set(`val-wait-update-${part}`, Formatter.formatTime((player[conf.updateCostType] - player.money) / income));
        DOM.setDisplay(`wrap-wait-update-${part}`, waitUpdate, 'inline');
      });

      const rMult = Formulas.calcRocketMult(player.rockets, player.rocketUpdates, player.rocketSpeedMult, player.rocketUpdateSpeedMult);
      const wMult = Formulas.calcWingMult(player.wings, player.wingUpdates, player.wingSpeedMult, player.wingUpdateSpeedMult);
      
      DOM.set('val-rocket-mult', rMult.toFixed(2));
      DOM.set('val-wing-mult', wMult.toFixed(2));
      
      DOM.set('val-rocket-base-mult', player.rocketSpeedMult.toString());
      DOM.set('val-rocket-up-mult', player.rocketUpdateSpeedMult.toString());
      DOM.set('val-wing-base-mult', player.wingSpeedMult.toString());
      DOM.set('val-wing-up-mult', player.wingUpdateSpeedMult.toString());
      
      let shipAddSpeed = Math.round(0.1 * (player.ships * player.shipUpdates + 1) * 10) / 10;
      DOM.set('val-ship-add', player.shipUpdates === 5 ? 0.1 : shipAddSpeed);
      DOM.set('val-ship-base', Math.round(player.baseSpeed * 10) / 10);
      
      const distLeft = Math.max(0, player.nextPlanet - player.distance);
      DOM.set('val-planet-dist', Formatter.distanceIndicators(distLeft).val);
      DOM.set('unit-planet-dist', Formatter.distanceIndicators(distLeft).unit);
      DOM.set('val-planet-reward', Formatter.shortenCosts(Formulas.calcRefugeeReward(player.nextPlanet, player.previousPlanet, player.planetsPassed, player.refugeesLogBase)));
      DOM.set('val-planet-time', speed > 0 ? Formatter.formatTime(distLeft / speed) : 'Infinity');

      let shipPos = 3;
      if (player.distance < player.nextPlanet && player.nextPlanet > player.previousPlanet) {
        shipPos = Math.max(3, Math.round((90 - 87 * ((player.distance - player.previousPlanet) / (player.nextPlanet - player.previousPlanet))) * 100) / 100);
      }
      DOM.setStyle('shipDisplay', 'top', shipPos + '%');
    } 
    else if (this.activeTab === 'refugees') {
      DOM.setDisplay('btn-tab-refugees', player.planetsPassed > 0 || player.refugees > 0);
      DOM.set('val-prestige-refugees', Formatter.shortenCosts(player.refugees));
      DOM.setDisplay('msg-prestige-req', player.planetsPassed === 0 && player.refugees === 0, 'block');
      
      DOM.set('val-boost-refugees', (player.refugees * CONFIG.Balance.baseRefugeeIncomeBoost * 100).toFixed(1));
      DOM.set('val-boost-slavery', (player.slaveryLevel * CONFIG.Balance.slaverySpeedBoost * 100).toFixed(0));
      DOM.set('val-boost-capitalism', (player.capitalismLevel * CONFIG.Balance.capitalismIncomeBoost * 100).toFixed(0));
      
      const slavCost = Formulas.calcSlaveryCost(player.slaveryLevel);
      const capCost = Formulas.calcCapitalismCost(player.capitalismLevel);
      DOM.set('val-cost-slavery', Formatter.shortenCosts(slavCost));
      DOM.set('val-cost-capitalism', Formatter.shortenCosts(capCost));
      DOM.set('val-lvl-slavery', player.slaveryLevel);
      DOM.set('val-lvl-capitalism', player.capitalismLevel);
      DOM.setClass('btn-buy-slavery', player.refugees >= slavCost ? 'button' : 'nbutton');
      DOM.setClass('btn-buy-capitalism', player.refugees >= capCost ? 'button' : 'nbutton');
    }
    else if (this.activeTab === 'statistics') {
      DOM.set('val-stat-money', Formatter.shorten(player.totalMoney));
      DOM.set('val-stat-dist', Formatter.distanceIndicators(player.totalDistance).val);
      DOM.set('unit-stat-dist', Formatter.distanceIndicators(player.totalDistance).unit);
      DOM.set('val-stat-base', Math.round(player.baseSpeed * 10) / 10);
      DOM.set('val-stat-rockets', player.rockets);
      DOM.set('val-stat-wings', player.wings);
      DOM.set('val-stat-ships', player.ships);
      DOM.set('val-stat-planets', player.planetsPassed);
      DOM.set('val-stat-cap-lvl', player.capitalismLevel);
      DOM.set('val-stat-slav-lvl', player.slaveryLevel);
      DOM.set('val-stat-total-ref', Formatter.shortenCosts(player.refugees));
      
      const totalLevels = player.achLevelDistance + player.achLevelSpeed + player.achLevelPlanets;
      DOM.set('val-ach-count', totalLevels);
    }
    else if (this.activeTab === 'achievements') {
      const levelsArray = [player.achLevelDistance, player.achLevelSpeed, player.achLevelPlanets];
      const totalBonus = (Formulas.calcAchievementMultiplier(levelsArray) - 1) * 100;
      DOM.set('val-ach-total-bonus', totalBonus.toFixed(0));

      const container = document.getElementById('achievementsContainer');
      if (container) {
        CONFIG.Achievements.forEach((ach, index) => {
          let el = document.getElementById('ach-dyn-' + index);
          if (!el) {
            el = document.createElement('div');
            el.id = 'ach-dyn-' + index;
            el.className = 'achievement';
            el.style.display = 'block';
            container.appendChild(el);
          }
          
          const level = player[ach.id];
          const currentVal = ach.getCurrentValue(player);
          const target = ach.getTarget(level);
          
          const bonus = (0.01 * Math.pow(level, 2) + 0.01 * level) * 100;
          let pct = Math.min(100, Math.max(0, (currentVal / target) * 100));
          
          let curStr, reqStr;
          if (ach.id === 'achLevelDistance') {
            const c = Formatter.distanceIndicators(currentVal);
            const t = Formatter.distanceIndicators(target);
            curStr = c.val + ' ' + c.unit;
            reqStr = t.val + ' ' + t.unit;
          } else if (ach.id === 'achLevelSpeed') {
            const c = Formatter.speedIndicators(currentVal);
            const t = Formatter.speedIndicators(target);
            curStr = c.val + ' ' + c.unit;
            reqStr = t.val + ' ' + t.unit;
          } else {
            curStr = Math.floor(currentVal);
            reqStr = Math.floor(target);
          }

          const newHtml = `<strong>${ach.name}: Level ${level}</strong><br>` +
                          `<span class="description-text">+${bonus.toFixed(0)}% income</span><br>` +
                          `<span class="description-text">${curStr} / ${reqStr} (${pct.toFixed(2)}%)</span>`;
          
          if (el.innerHTML !== newHtml) {
            el.innerHTML = newHtml;
          }
        });
      }
    }
  }
};

// GAME LOGIC ---
const GameLogic = {
  triggerPlanetMilestone: function(offline = false) {
    const reward = Formulas.calcRefugeeReward(player.nextPlanet, player.previousPlanet, player.planetsPassed, player.refugeesLogBase);
    player.refugees += reward;
    player.previousPlanet = player.nextPlanet;
    player.planetsPassed++;
    player.nextPlanet = Formulas.calcNextPlanet(player.previousPlanet, player.planetsPassed);
    
    updateCache();
    
    if (!offline) {
      const box = document.getElementById('achievementBox');
      if (box) {
        DOM.set('val-ach-msg', `Planet Reached! +${reward} refugees recruited!`);
        box.classList.add('show');
        clearTimeout(box.hideTimeout);
        box.hideTimeout = setTimeout(() => box.classList.remove('show'), 4000);
      }
    }
  },
  buyPart: function(part) {
    const conf = CONFIG.Parts[part];
    if (player.money >= player[conf.costType] && (player[conf.type] === 0 || player[conf.updateType] === 5)) {
      player.money -= player[conf.costType];
      player[conf.costType] *= conf.costMult;
      
      if (conf.baseSpeedAdd) player.baseSpeed += conf.baseSpeedAdd;
      
      player[conf.type]++;
      player[conf.updateType] = 0;
      updateCache();
    }
  },
  upgradePart: function(part) {
    const conf = CONFIG.Parts[part];
    if (player.money >= player[conf.updateCostType] && player[conf.updateType] < 5 && player[conf.type] !== 0) {
      player.money -= player[conf.updateCostType];
      player[conf.updateCostType] *= conf.updateCostMult;
      
      if (conf.updateSpeedAddType) player.baseSpeed += 0.1 * (player.ships * player.shipUpdates + 1);
      
      player[conf.updateType]++;
      updateCache();
    }
  },
  buyMaxUpdates: function() {
    let bought = true;
    while (bought) {
      bought = false;
      ['rocket', 'ship', 'wing'].forEach(part => {
        const conf = CONFIG.Parts[part];
        while (player.money >= player[conf.updateCostType] && player[conf.updateType] < 5 && player[conf.type] !== 0) {
          player.money -= player[conf.updateCostType];
          player[conf.updateCostType] *= conf.updateCostMult;
          if (conf.updateSpeedAddType) player.baseSpeed += 0.1 * (player.ships * player.shipUpdates + 1);
          player[conf.updateType]++;
          bought = true;
        }
        if (player.money >= player[conf.costType] && player[conf.updateType] === 5) {
          player.money -= player[conf.costType];
          player[conf.costType] *= conf.costMult;
          if (conf.baseSpeedAdd) player.baseSpeed += conf.baseSpeedAdd;
          player[conf.type]++;
          player[conf.updateType] = 0;
          bought = true;
        }
      });
    }
    updateCache();
  }
};

// SAVE SYSTEM ---
const SaveManager = {
  load: function() {
    try {
      const data = localStorage.getItem('save');
      if (data) {
        const parsed = JSON.parse(data);
        player = { ...DEFAULT_STATE, ...parsed };
        updateCache();
        
        if (player.lastSaveTime) {
          const diffSec = (Date.now() - player.lastSaveTime) / 1000;
          if (diffSec > 60) this.simulateOffline(diffSec);
        }
      }
    } catch (e) { console.error('Load failed:', e); }
    updateCache();
  },
  save: function() {
    player.lastSaveTime = Date.now();
    localStorage.setItem('save', JSON.stringify(player));
  },
simulateOffline: function(timeRemaining) {
    const totalOfflineTime = timeRemaining;
    
    let earnedD = 0, earnedM = 0, planets = 0;
    while (timeRemaining > 0 && (player.cachedSpeed > 0 || player.cachedIncomePerSec > 0)) {
      updateCache();
      const tNext = player.cachedSpeed > 0 ? (player.nextPlanet - player.distance) / player.cachedSpeed : Infinity;
      const step = Math.min(timeRemaining, tNext);
      
      const stepDist = player.cachedSpeed * step;
      const stepMoney = player.cachedIncomePerSec * step;
      
      player.distance += stepDist; player.money += stepMoney;
      earnedD += stepDist; earnedM += stepMoney;
      timeRemaining -= step;

      if (timeRemaining >= 0 && step === tNext) { GameLogic.triggerPlanetMilestone(true); planets++; }
    }
    player.totalDistance += earnedD; player.totalMoney += earnedM;
    if (player.distance > player.bestDistance) player.bestDistance = player.distance;
    
    let msg = `Offline for ${Formatter.shorten(totalOfflineTime)}s.\nTravelled: ${Formatter.distanceIndicators(earnedD).val}\nEarned: ${Formatter.shorten(earnedM)} €`;
    if (planets > 0) msg += `\nDiscovered ${planets} new planet(s)!`;
    alert(msg);
  }
};

// INITIALIZATION & EVENTS ---
function init() {
  document.addEventListener('click', e => {
    const target = e.target;
    
    if (target.dataset.tab) return UI.showTab(target.dataset.tab);

    const actionEl = target.closest('[data-action]');
    if (!actionEl) return;
    
    const action = actionEl.dataset.action;
    const part = actionEl.dataset.part;

    switch (action) {
      case 'buyPart': GameLogic.buyPart(part); break;
      case 'upgradePart': GameLogic.upgradePart(part); break;
      case 'buyMax': GameLogic.buyMaxUpdates(); break;
      case 'buySlavery':
        const sCost = Formulas.calcSlaveryCost(player.slaveryLevel);
        if (player.refugees >= sCost) { player.refugees -= sCost; player.slaveryLevel++; updateCache(); }
        break;
      case 'buyCapitalism':
        const cCost = Formulas.calcCapitalismCost(player.capitalismLevel);
        if (player.refugees >= cCost) { player.refugees -= cCost; player.capitalismLevel++; updateCache(); }
        break;
      case 'hardReset':
        if (confirm("Erase all progress?")) { player = structuredClone(DEFAULT_STATE); player.msgShown = true; updateCache(); SaveManager.save(); }
        break;
      case 'toggleAnim':
        const tw = document.querySelector('.twinkling');
        if (tw) tw.style.display = tw.style.display === 'block' ? 'none' : 'block';
        break;
      case 'toggleNotat': scientific = !scientific; break;
      case 'closeModal':
        const modal = document.getElementById('popup');
        if (modal) modal.style.display = 'none';
        break;
    }
  });

  UI.showTab('game');
  if (!player.msgShown) {
    const modal = document.getElementById('popup');
    if (modal) modal.style.display = "block";
    player.msgShown = true;
  }
}

// LOOPS
let lastLogicUpdate = performance.now();
setInterval(() => {
  const now = performance.now();
  const diffSec = (now - lastLogicUpdate) / 1000;
  lastLogicUpdate = now;
  
  const distGain = player.cachedSpeed * diffSec;
  const moneyGain = player.cachedIncomePerSec * diffSec;
  
  player.distance += distGain; player.money += moneyGain;
  player.totalDistance += distGain; player.totalMoney += moneyGain;
  if (player.distance > player.bestDistance) player.bestDistance = player.distance;
  if (player.distance >= player.nextPlanet) GameLogic.triggerPlanetMilestone();

  let cacheNeedsUpdate = false;
  CONFIG.Achievements.forEach(ach => {
    let leveledUp = false;
    while (ach.getCurrentValue(player) >= ach.getTarget(player[ach.id])) {
      player[ach.id]++;
      leveledUp = true;
      cacheNeedsUpdate = true;
    }
    if (leveledUp) {
      const box = document.getElementById('achievementBox');
      if (box) {
        DOM.set('val-ach-msg', `Achievement Level Up! ${ach.name} reached Level ${player[ach.id]}!`);
        box.classList.add('show');
        clearTimeout(box.hideTimeout);
        box.hideTimeout = setTimeout(() => box.classList.remove('show'), 5500);
      }
    }
  });
  
  if (cacheNeedsUpdate) {
    updateCache();
  }
}, 100); 

function renderLoop() {
  UI.update();
  requestAnimationFrame(renderLoop);
}

setInterval(() => SaveManager.save(), 10000);

// BOOTSTRAP ---
SaveManager.load();
init();
requestAnimationFrame(renderLoop);