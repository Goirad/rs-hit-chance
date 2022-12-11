const auraMap = {
  "none": 0,
  "t1": 0.03,
  "t2": 0.05,
  "t3": 0.07,
  "t4": 0.10,
  "berserker": 0.10,
};

const additionalSpecEffectMap = {
  "none": 0,
  "dragonDagger": 0.15,
  "magicShortbow": -0.3
};

const prayerMap = {
  "none": 0,
  "t1": 2,
  "t2": 4,
  "t3": 6,
  "chivalry": 7,
  "piety": 8,
  "leech": 5,
  "turmoil": 10,
  "praesul": 12
};

const potionBoostsMap = {
  // name : [mult, add, isOvl]
  "none": [0, 0, false],
  "ordinary": [0.08, 1, false],
  "super": [0.12, 2, false],
  "grand": [0.14, 2, false],
  "extreme": [0.15, 3, false],
  "supreme": [0.16, 4, false],
  "overload": [0.15, 3, true],
  "supremeOverload": [0.16, 4, true],
  "elderOverload": [0.17, 5, true]
};

const styleMap = {
  "slash": "melee",
  "stab": "melee",
  "crush": "melee",
  "thrown": "range",
  "arrow": "range",
  "bolt": "range",
  "air": "magic",
  "water": "magic",
  "earth": "magic",
  "fire": "magic"
};

const potionBoost = (potion, level) => {
  const [mult, add, isOvl] = potionBoostsMap[potion];
  const boost = mult * level + add;
  return [boost, isOvl];
}
