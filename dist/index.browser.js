"use strict";

var bfmtUtilities = function (exports) {
  'use strict';
  /**
   * @description Get the level entry of a burst at a given level (or the last level if no level is given).
   * @param burst Burst to get level entry from.
   * @param level Optional 1-indexed level to get; if not specified, the last level of the burst is used.
   * @returns Level entry of a burst at a given level (or last level if no level is given) if it exists, undefined otherwise.
   */

  function getLevelEntryForBurst(burst, level) {
    const burstEffectsByLevel = burst && Array.isArray(burst.levels) ? burst.levels : [];
    let levelIndex;

    if (level !== null && !isNaN(level)) {
      // 1-indexed
      levelIndex = +level - 1;
    } else {
      // default to last entry in burst
      levelIndex = burstEffectsByLevel.length - 1;
    }

    return burstEffectsByLevel[levelIndex];
  }
  /**
   * @description Get the effects at the level entry of a burst at a given level (or the last level if no level is given).
   * @param burst Burst to get effects from.
   * @param level Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used.
   * @returns Effects at the level entry of a burst at a given level (or last level if no level is given) if it exists, an empty array otherwise.
   */


  function getEffectsForBurst(burst, level) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    return levelEntry && Array.isArray(levelEntry.effects) ? levelEntry.effects : [];
  }
  /**
   * @description Get the proc/passive ID of a given object.
   * @param effect Object to get the effect ID from.
   * @returns Proc/passive ID of the input effect if it exists; empty string otherwise.
   */


  function getEffectId(effect) {
    let resultId = '';

    if (effect) {
      resultId = effect['proc id'] || effect['unknown proc id'] || effect['passive id'] || effect['unknown passive id'] || '';
    }

    return resultId;
  }

  var KNOWN_PROC_ID;

  (function (KNOWN_PROC_ID) {
    KNOWN_PROC_ID["BurstHeal"] = "2";
    KNOWN_PROC_ID["Unknown"] = "UNKNOWN_PROC_EFFECT_ID";
  })(KNOWN_PROC_ID || (KNOWN_PROC_ID = {}));

  var KNOWN_PASSIVE_ID;

  (function (KNOWN_PASSIVE_ID) {
    KNOWN_PASSIVE_ID["TriggeredEffect"] = "66";
    KNOWN_PASSIVE_ID["Unknown"] = "UNKNOWN_PASSIVE_EFFECT_ID";
  })(KNOWN_PASSIVE_ID || (KNOWN_PASSIVE_ID = {}));

  var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,

    get KNOWN_PROC_ID() {
      return KNOWN_PROC_ID;
    },

    get KNOWN_PASSIVE_ID() {
      return KNOWN_PASSIVE_ID;
    }

  });
  var ProcBuffType;

  (function (ProcBuffType) {
    ProcBuffType["Attack"] = "Attack";
  })(ProcBuffType || (ProcBuffType = {}));
  /* eslint-disable */

  /**
   * @ignore
   */


  const PASSIVE_METADATA = Object.freeze({
    "1": {
      "ID": "1",
      "Name": "Parameter Boost"
    },
    "2": {
      "ID": "2",
      "Name": "Elemental Parameter Boost"
    },
    "3": {
      "ID": "3",
      "Name": "Type-Based Parameter Boost"
    },
    "4": {
      "ID": "4",
      "Name": "Status Negation"
    },
    "5": {
      "ID": "5",
      "Name": "Elemental Damage Reduction"
    },
    "6": {
      "ID": "6",
      "Name": ""
    },
    "7": {
      "ID": "7",
      "Name": ""
    },
    "8": {
      "ID": "8",
      "Name": "Damage Reduction"
    },
    "9": {
      "ID": "9",
      "Name": "Gradual BB Gauge Boost"
    },
    "10": {
      "ID": "10",
      "Name": "HC Efficacy"
    },
    "11": {
      "ID": "11",
      "Name": "HP-Conditional Parameter Boost"
    },
    "12": {
      "ID": "12",
      "Name": "HP-Conditional Drop Rate Boost"
    },
    "13": {
      "ID": "13",
      "Name": "BC Fill on Enemy Defeat"
    },
    "14": {
      "ID": "14",
      "Name": "Damage Reduction (Chance)"
    },
    "15": {
      "ID": "15",
      "Name": "Heal on Enemy Defeat"
    },
    "16": {
      "ID": "16",
      "Name": "Heal on Battle Victory"
    },
    "17": {
      "ID": "17",
      "Name": "HP Absorption"
    },
    "19": {
      "ID": "19",
      "Name": "Drop Rate Boost"
    },
    "20": {
      "ID": "20",
      "Name": "Status Infliction"
    },
    "21": {
      "ID": "21",
      "Name": "Parameter Boost for First X Turns"
    },
    "23": {
      "ID": "23",
      "Name": "BC Fill on Battle Victory"
    },
    "24": {
      "ID": "24",
      "Name": "Heal when Attacked (Chance)"
    },
    "25": {
      "ID": "25",
      "Name": "BC Fill when Hit (Chance)"
    },
    "26": {
      "ID": "26",
      "Name": "Damage Counter (Chance)"
    },
    "27": {
      "ID": "27",
      "Name": "Increased Target Chance"
    },
    "28": {
      "ID": "28",
      "Name": "Decreased Target Chance"
    },
    "29": {
      "ID": "29",
      "Name": "Defense Ignore (Chance)"
    },
    "30": {
      "ID": "30",
      "Name": "BB Conditional Parameter Boost"
    },
    "31": {
      "ID": "31",
      "Name": "Spark Damage Boost, Boost Drop Rate on Spark"
    },
    "32": {
      "ID": "32",
      "Name": "BC Efficacy"
    },
    "33": {
      "ID": "33",
      "Name": "Heal over Time"
    },
    "34": {
      "ID": "34",
      "Name": "Critical Damage Boost"
    },
    "35": {
      "ID": "35",
      "Name": "BC Fill when Normal Attacking"
    },
    "36": {
      "ID": "36",
      "Name": "Extra Action"
    },
    "37": {
      "ID": "37",
      "Name": "Hit Count Boost"
    },
    "38": {
      "ID": "38",
      "Name": ""
    },
    "39": {
      "ID": "39",
      "Name": ""
    },
    "40": {
      "ID": "40",
      "Name": "Parameter Conversion"
    },
    "41": {
      "ID": "41",
      "Name": "Unique Element Count Conditional Parameter Boost"
    },
    "42": {
      "ID": "42",
      "Name": "Gender Parameter Boost"
    },
    "43": {
      "ID": "43",
      "Name": "Damage Reduction to 1"
    },
    "44": {
      "ID": "44",
      "Name": "Flat Parameter Boost"
    },
    "45": {
      "ID": "45",
      "Name": "Critical Damage Negation"
    },
    "46": {
      "ID": "46",
      "Name": "Parameter Boost Relative to HP Remainaing"
    },
    "47": {
      "ID": "47",
      "Name": "BC Fill on Spark"
    },
    "48": {
      "ID": "48",
      "Name": "BC Cost Reduction"
    },
    "49": {
      "ID": "49",
      "Name": "BB Gauge Consumption Reduction"
    },
    "50": {
      "ID": "50",
      "Name": "Elemental Damage Boost"
    },
    "52": {
      "ID": "52",
      "Name": ""
    },
    "53": {
      "ID": "53",
      "Name": "Critical/Elemental Weakness Damage Negation"
    },
    "55": {
      "ID": "55",
      "Name": "Conditional Effect based on HP Threshold"
    },
    "58": {
      "ID": "58",
      "Name": "Damage Reduction when Guarding"
    },
    "59": {
      "ID": "59",
      "Name": "BC Fill when Attacked when Guarding"
    },
    "61": {
      "ID": "61",
      "Name": "BC Fill on Guard"
    },
    "62": {
      "ID": "62",
      "Name": "Elemental Damage Reduction"
    },
    "63": {
      "ID": "63",
      "Name": "Elemental Damage Reduction for first X Turns"
    },
    "64": {
      "ID": "64",
      "Name": "BB Atk Boost"
    },
    "65": {
      "ID": "65",
      "Name": "BC Fill on Critical"
    },
    "66": {
      "ID": "66",
      "Name": "Add buff to Brave Burst"
    },
    "69": {
      "ID": "69",
      "Name": "Chance KO Resistance (Angel Idol)"
    },
    "70": {
      "ID": "70",
      "Name": "OD Gauge Fill Rate Boost"
    },
    "71": {
      "ID": "71",
      "Name": "Status Counter"
    },
    "72": {
      "ID": "72",
      "Name": "Turn End Effects Activate at Turn Start"
    },
    "73": {
      "ID": "73",
      "Name": "Parameter Reduction Negation"
    },
    "74": {
      "ID": "74",
      "Name": "Attack Boost on Status Afflicted Foes"
    },
    "75": {
      "ID": "75",
      "Name": "Spark Vulnerability"
    },
    "77": {
      "ID": "77",
      "Name": "Spark Damage Reduction"
    },
    "78": {
      "ID": "78",
      "Name": "Conditional Effect after Damage Received Threshold"
    },
    "79": {
      "ID": "79",
      "Name": "BC Fill after Damage Received Threshold"
    },
    "80": {
      "ID": "80",
      "Name": "Conditional Effect after Damage Dealt Threshold"
    },
    "81": {
      "ID": "81",
      "Name": "BC Fill after Damage Dealt Threshold"
    },
    "82": {
      "ID": "82",
      "Name": "Conditional Effect after BC Received Threshold"
    },
    "84": {
      "ID": "84",
      "Name": "Conditional Effect after HC Received Threshold"
    },
    "85": {
      "ID": "85",
      "Name": "BC Fill after HC Received Threshold"
    },
    "86": {
      "ID": "86",
      "Name": "Conditional Effect after Spark Threshold"
    },
    "88": {
      "ID": "88",
      "Name": "Conditional Effect on Guard"
    },
    "89": {
      "ID": "89",
      "Name": "Conditional Effect on Critical"
    },
    "90": {
      "ID": "90",
      "Name": "Status Infliction on Critical"
    },
    "91": {
      "ID": "91",
      "Name": ""
    },
    "92": {
      "ID": "92",
      "Name": "Negate Defense Ignore"
    },
    "93": {
      "ID": "93",
      "Name": "Added Elements"
    },
    "96": {
      "ID": "96",
      "Name": "Normal Attacks Hit All Foes"
    },
    "97": {
      "ID": "97",
      "Name": "Player EXP Boost"
    },
    "99": {
      "ID": "99",
      "Name": ""
    },
    "100": {
      "ID": "100",
      "Name": "Spark Critical"
    },
    "101": {
      "ID": "101",
      "Name": "Heal on Spark"
    },
    "102": {
      "ID": "102",
      "Name": "Added Elements"
    },
    "103": {
      "ID": "103",
      "Name": "BB Atk Boost when HP Passes Threshold"
    },
    "104": {
      "ID": "104",
      "Name": "Spark Boost when HP Passes Threshold"
    },
    "105": {
      "ID": "105",
      "Name": "Turn-Based Parameter Boost"
    },
    "106": {
      "ID": "106",
      "Name": "Conditional Effect after Activating Overdrive"
    },
    "107": {
      "ID": "107",
      "Name": "Add Effect to Leader Skill"
    },
    "109": {
      "ID": "109",
      "Name": "BB Gauge Reduction (Chance)"
    },
    "110": {
      "ID": "110",
      "Name": "BC Efficacy Reduction (Chance)"
    },
    "111": {
      "ID": "111",
      "Name": "Increase Brave Burst Activation Rate"
    },
    "112": {
      "ID": "112",
      "Name": "ABP/CBP Boost"
    },
    "113": {
      "ID": "113",
      "Name": "Conditional Effect after HP Threshold"
    },
    "114": {
      "ID": "114",
      "Name": "Inflict Buff when Attacked"
    },
    "127": {
      "ID": "127",
      "Name": "Additional Damage (Damage over Time) Reduction"
    },
    "128": {
      "ID": "128",
      "Name": "Damage Reduction from Normal Attacks"
    },
    "143": {
      "ID": "143",
      "Name": "Break Atk Parameter Limit"
    },
    "10008": {
      "ID": "10008",
      "Name": "Damage Reduction from Specific Sources"
    },
    "11004": {
      "ID": "11004",
      "Name": "Elemental Spark Damage Boost"
    },
    "11005": {
      "ID": "11005",
      "Name": "Elemental Critical Damage Boost"
    },
    "11006": {
      "ID": "11006",
      "Name": "Summoner EXP Boost"
    },
    "11009": {
      "ID": "11009",
      "Name": "Effect Duration Boost"
    },
    "66,1": {
      "ID": "66,1",
      "Name": ""
    }
  });
  /**
   * @ignore
   */

  const PROC_METADATA = Object.freeze({
    "0": {
      "ID": "0",
      "Name": "",
      "Type": ""
    },
    "1": {
      "ID": "1",
      "Name": "Regular Damage",
      "Type": "Attack"
    },
    "2": {
      "ID": "2",
      "Name": "Burst Heal",
      "Type": ""
    },
    "3": {
      "ID": "3",
      "Name": "Heal over Time",
      "Type": ""
    },
    "4": {
      "ID": "4",
      "Name": "BB Gauge Refill",
      "Type": ""
    },
    "5": {
      "ID": "5",
      "Name": "Parameter Boost",
      "Type": ""
    },
    "6": {
      "ID": "6",
      "Name": "Drop Rate",
      "Type": ""
    },
    "7": {
      "ID": "7",
      "Name": "Guaranteed KO Resistance (Angel Idol)",
      "Type": ""
    },
    "8": {
      "ID": "8",
      "Name": "Max HP Boost",
      "Type": ""
    },
    "9": {
      "ID": "9",
      "Name": "Parameter Reduction",
      "Type": ""
    },
    "10": {
      "ID": "10",
      "Name": "Status Cleanse",
      "Type": ""
    },
    "11": {
      "ID": "11",
      "Name": "Status Infliction",
      "Type": ""
    },
    "12": {
      "ID": "12",
      "Name": "Revive (Guaranteed)",
      "Type": ""
    },
    "13": {
      "ID": "13",
      "Name": "Random Target Damage",
      "Type": "Attack"
    },
    "14": {
      "ID": "14",
      "Name": "Lifesteal Damage",
      "Type": "Attack"
    },
    "16": {
      "ID": "16",
      "Name": "Elemental Damage Reduction",
      "Type": ""
    },
    "17": {
      "ID": "17",
      "Name": "Status Negation",
      "Type": ""
    },
    "18": {
      "ID": "18",
      "Name": "Damage Reduction",
      "Type": ""
    },
    "19": {
      "ID": "19",
      "Name": "Gradual BB Gauge Boost",
      "Type": ""
    },
    "20": {
      "ID": "20",
      "Name": "BC Fill on Hit",
      "Type": ""
    },
    "22": {
      "ID": "22",
      "Name": "Defense Ignore",
      "Type": ""
    },
    "23": {
      "ID": "23",
      "Name": "Spark Boost",
      "Type": ""
    },
    "24": {
      "ID": "24",
      "Name": "Parameter Conversion",
      "Type": ""
    },
    "26": {
      "ID": "26",
      "Name": "Hit Count Boost",
      "Type": ""
    },
    "27": {
      "ID": "27",
      "Name": "Proportional Damage",
      "Type": "Attack"
    },
    "28": {
      "ID": "28",
      "Name": "Fixed Damage",
      "Type": "Attack"
    },
    "29": {
      "ID": "29",
      "Name": "Multi-Element Damage",
      "Type": "Attack"
    },
    "30": {
      "ID": "30",
      "Name": "Add Elements",
      "Type": ""
    },
    "31": {
      "ID": "31",
      "Name": "Instant BB Gauge Fill",
      "Type": ""
    },
    "32": {
      "ID": "32",
      "Name": "Element Shift",
      "Type": ""
    },
    "33": {
      "ID": "33",
      "Name": "Buff Removal (Chance)",
      "Type": ""
    },
    "34": {
      "ID": "34",
      "Name": "BB Gauge Reduction (Chance)",
      "Type": ""
    },
    "36": {
      "ID": "36",
      "Name": "Leader Skill Lock (Chance)",
      "Type": ""
    },
    "37": {
      "ID": "37",
      "Name": "Summon Unit",
      "Type": ""
    },
    "38": {
      "ID": "38",
      "Name": "Status Cure",
      "Type": ""
    },
    "39": {
      "ID": "39",
      "Name": "Elemental Damage Reduction",
      "Type": ""
    },
    "40": {
      "ID": "40",
      "Name": "Status Infliction Added to Attack",
      "Type": ""
    },
    "42": {
      "ID": "42",
      "Name": "",
      "Type": ""
    },
    "43": {
      "ID": "43",
      "Name": "Instant OD Fill",
      "Type": ""
    },
    "44": {
      "ID": "44",
      "Name": "Damage over Time (Additional Damage)",
      "Type": ""
    },
    "45": {
      "ID": "45",
      "Name": "BB Atk Boost",
      "Type": ""
    },
    "46": {
      "ID": "46",
      "Name": "Non-Lethal Proportional Damage",
      "Type": "Attack"
    },
    "47": {
      "ID": "47",
      "Name": "HP Scaled Damage",
      "Type": "Attack"
    },
    "48": {
      "ID": "48",
      "Name": "Piercing Proportional Damage",
      "Type": "Attack"
    },
    "49": {
      "ID": "49",
      "Name": "Retire",
      "Type": ""
    },
    "50": {
      "ID": "50",
      "Name": "Damage Counter",
      "Type": ""
    },
    "51": {
      "ID": "51",
      "Name": "Parameter Reduction Added to Attack",
      "Type": ""
    },
    "52": {
      "ID": "52",
      "Name": "BC Efficacy",
      "Type": ""
    },
    "53": {
      "ID": "53",
      "Name": "Status Counter",
      "Type": ""
    },
    "54": {
      "ID": "54",
      "Name": "Critical Damage Boost",
      "Type": ""
    },
    "55": {
      "ID": "55",
      "Name": "Elemental Damage Boost",
      "Type": ""
    },
    "56": {
      "ID": "56",
      "Name": "Chance KO Resistance (Angel Idol)",
      "Type": ""
    },
    "57": {
      "ID": "57",
      "Name": "BC Efficacy Reduction",
      "Type": ""
    },
    "58": {
      "ID": "58",
      "Name": "Spark Vulnerability",
      "Type": ""
    },
    "59": {
      "ID": "59",
      "Name": "BB Atk Reduction",
      "Type": ""
    },
    "60": {
      "ID": "60",
      "Name": "",
      "Type": ""
    },
    "61": {
      "ID": "61",
      "Name": "BB-Scaled Damage",
      "Type": "Attack"
    },
    "62": {
      "ID": "62",
      "Name": "Barrier",
      "Type": ""
    },
    "63": {
      "ID": "63",
      "Name": "Selective Buff Wipe",
      "Type": ""
    },
    "64": {
      "ID": "64",
      "Name": "Consecutive Damage",
      "Type": "Attack"
    },
    "65": {
      "ID": "65",
      "Name": "Attack Boost on Status Afflicted Foes",
      "Type": ""
    },
    "66": {
      "ID": "66",
      "Name": "Revive (Chance)",
      "Type": ""
    },
    "67": {
      "ID": "67",
      "Name": "BC Fill on Spark",
      "Type": ""
    },
    "68": {
      "ID": "68",
      "Name": "Damage Reduction when Guarding",
      "Type": ""
    },
    "69": {
      "ID": "69",
      "Name": "BC Fill on Guard",
      "Type": ""
    },
    "70": {
      "ID": "70",
      "Name": "",
      "Type": ""
    },
    "71": {
      "ID": "71",
      "Name": "BB Gauge Fill Rate Debuff",
      "Type": ""
    },
    "73": {
      "ID": "73",
      "Name": "Parameter Reduction Negation",
      "Type": ""
    },
    "75": {
      "ID": "75",
      "Name": "Element Squad-Scaled Damage",
      "Type": "Attack"
    },
    "76": {
      "ID": "76",
      "Name": "Extra Action",
      "Type": ""
    },
    "78": {
      "ID": "78",
      "Name": "Self Parameter Boost",
      "Type": ""
    },
    "79": {
      "ID": "79",
      "Name": "Player EXP Boost",
      "Type": ""
    },
    "82": {
      "ID": "82",
      "Name": "",
      "Type": ""
    },
    "83": {
      "ID": "83",
      "Name": "Spark Critical",
      "Type": ""
    },
    "84": {
      "ID": "84",
      "Name": "OD Gauge Fill Rate",
      "Type": ""
    },
    "85": {
      "ID": "85",
      "Name": "Heal when Attacked",
      "Type": ""
    },
    "86": {
      "ID": "86",
      "Name": "HP Absorption",
      "Type": ""
    },
    "87": {
      "ID": "87",
      "Name": "Heal on Spark",
      "Type": ""
    },
    "88": {
      "ID": "88",
      "Name": "Self Spark Boost",
      "Type": ""
    },
    "89": {
      "ID": "89",
      "Name": "Self Parameter Conversion",
      "Type": ""
    },
    "92": {
      "ID": "92",
      "Name": "Self Max HP Boost",
      "Type": ""
    },
    "93": {
      "ID": "93",
      "Name": "Spark/Critical/Elemental Weakness Damage Reduction",
      "Type": ""
    },
    "94": {
      "ID": "94",
      "Name": "Normal Attacks Hit All Foes",
      "Type": ""
    },
    "95": {
      "ID": "95",
      "Name": "Nullify Sphere Effects (Sphere Lock)",
      "Type": ""
    },
    "96": {
      "ID": "96",
      "Name": "Nullify Extra Skill Effects (ES Lock)",
      "Type": ""
    },
    "97": {
      "ID": "97",
      "Name": "Element Target Damage",
      "Type": "Attack"
    },
    "113": {
      "ID": "113",
      "Name": "Gradual OD Fill",
      "Type": ""
    },
    "119": {
      "ID": "119",
      "Name": "Gradual BC Drain",
      "Type": ""
    },
    "123": {
      "ID": "123",
      "Name": "OD Gauge Reduction",
      "Type": ""
    },
    "126": {
      "ID": "126",
      "Name": "Damage over Time (Additional Damage) Mitigation",
      "Type": ""
    },
    "127": {
      "ID": "127",
      "Name": "Lock On",
      "Type": ""
    },
    "130": {
      "ID": "130",
      "Name": "Parameter Reduction Counter",
      "Type": ""
    },
    "131": {
      "ID": "131",
      "Name": "",
      "Type": ""
    },
    "132": {
      "ID": "132",
      "Name": "Critical/Elemental Weakness Vulnerability",
      "Type": ""
    },
    "901": {
      "ID": "901",
      "Name": "Raid Heal (on Map)",
      "Type": ""
    },
    "902": {
      "ID": "902",
      "Name": "Raid Parameter Boost",
      "Type": ""
    },
    "903": {
      "ID": "903",
      "Name": "Raid Boss Reveal",
      "Type": ""
    },
    "905": {
      "ID": "905",
      "Name": "Raid Teleport",
      "Type": ""
    },
    "906": {
      "ID": "906",
      "Name": "Raid Flee",
      "Type": ""
    },
    "907": {
      "ID": "907",
      "Name": "Raid Damage Reduction",
      "Type": ""
    },
    "908": {
      "ID": "908",
      "Name": "Raid Item Drop Rate Boost",
      "Type": ""
    },
    "10000": {
      "ID": "10000",
      "Name": "Taunt",
      "Type": ""
    },
    "10001": {
      "ID": "10001",
      "Name": "Stealth",
      "Type": ""
    },
    "10002": {
      "ID": "10002",
      "Name": "Shield (old)",
      "Type": ""
    },
    "10003": {
      "ID": "10003",
      "Name": "Nullify Sphere Effects (Sphere Lock)",
      "Type": ""
    },
    "10004": {
      "ID": "10004",
      "Name": "Damage Immunity",
      "Type": ""
    },
    "10005": {
      "ID": "10005",
      "Name": "Turn Skip (short duration)",
      "Type": ""
    },
    "10006": {
      "ID": "10006",
      "Name": "Turn Skip (long duration)",
      "Type": ""
    },
    "10007": {
      "ID": "10007",
      "Name": "Evasion",
      "Type": ""
    },
    "10009": {
      "ID": "10009",
      "Name": "",
      "Type": ""
    },
    "10012": {
      "ID": "10012",
      "Name": "OD Drain",
      "Type": ""
    },
    "10015": {
      "ID": "10015",
      "Name": "Elemental Spark Boost",
      "Type": ""
    },
    "10016": {
      "ID": "10016",
      "Name": "Element Critical Damage Boost",
      "Type": ""
    },
    "10017": {
      "ID": "10017",
      "Name": "Elemental Shield",
      "Type": ""
    },
    "10018": {
      "ID": "10018",
      "Name": "Max HP Reduction",
      "Type": ""
    },
    "10019": {
      "ID": "10019",
      "Name": "Effect Purge",
      "Type": ""
    },
    "10020": {
      "ID": "10020",
      "Name": "Piercing Damage",
      "Type": "Attack"
    },
    "10021": {
      "ID": "10021",
      "Name": "Active Healing Reduction",
      "Type": ""
    },
    "10022": {
      "ID": "10022",
      "Name": "Passive Healing Reduction",
      "Type": ""
    },
    "10023": {
      "ID": "10023",
      "Name": "HC Efficacy Reduction",
      "Type": ""
    },
    "10025": {
      "ID": "10025",
      "Name": "KO Resistance Negation",
      "Type": ""
    },
    "10026": {
      "ID": "10026",
      "Name": "Doom",
      "Type": ""
    },
    "11000": {
      "ID": "11000",
      "Name": "Negative HP-Scaled Damage",
      "Type": "Attack"
    },
    "11001": {
      "ID": "11001",
      "Name": "Max HP% DoT of Weaker Element Enemies",
      "Type": ""
    },
    "11002": {
      "ID": "11002",
      "Name": "HP Limit Break, Convert to HP",
      "Type": ""
    },
    "11003": {
      "ID": "11003",
      "Name": "Effect Negation",
      "Type": ""
    },
    "70001": {
      "ID": "70001",
      "Name": "Mana Bubble Shield",
      "Type": ""
    },
    "70002": {
      "ID": "70002",
      "Name": "Recast",
      "Type": ""
    },
    "2-5": {
      "ID": "2-5",
      "Name": "Burst Heal and DEF/REC Boost",
      "Type": ""
    }
  });
  /**
   * @description Get the associated metadata entry for a given proc ID.
   * @param id Proc ID to get metadata for.
   * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
   * @returns Corresponding proc metadata entry if it exists, undefined otherwise.
   */

  function getMetadataForProc(id, metadata = PROC_METADATA) {
    return !!metadata && typeof metadata === 'object' && Object.hasOwnProperty.call(metadata, id) ? metadata[id] : void 0;
  }
  /**
   * @description Determine if a given proc ID's type is an attack.
   * @param id Proc ID to check.
   * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
   * @returns Whether the given ID corresponds to a proc ID whose type is attack.
   */


  function isAttackingProcId(id, metadata) {
    const metadataEntry = getMetadataForProc(id, metadata);
    return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
  }
  /**
   * @description Get the extra attack damage frames entry based on the damage frames of a burst. Also apply the given effect delay to the resulting damage frames entry.
   * @param damageFrames Damage frames that each have their own proc ID.
   * @param effectDelay Optional effect delay to apply to the resulting damage frames entry.
   * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
   * @returns Damage frames entry whose frames are based on the input damage frames.
   */


  function getExtraAttackDamageFramesEntry(damageFrames, effectDelay = '0.0/0', metadata) {
    // relevant frames are all effects for healing or attacking
    const inputFrames = Array.isArray(damageFrames) ? damageFrames : [];
    const relevantFrames = inputFrames.filter(frame => {
      const procId = getEffectId(frame);
      return procId === KNOWN_PROC_ID.BurstHeal || isAttackingProcId(procId, metadata);
    });
    const unifiedFrames = relevantFrames.reduce((acc, frameEntry, index) => {
      const keepFirstFrame = index === 0;
      const numFrames = frameEntry['frame times'].length;
      const damageDistribution = frameEntry['hit dmg% distribution'];
      const frameTimes = frameEntry['frame times'];

      for (let frameIndex = keepFirstFrame ? 0 : 1; frameIndex < numFrames; ++frameIndex) {
        acc.push({
          damage: damageDistribution[frameIndex],
          time: frameTimes[frameIndex]
        });
      }

      return acc;
    }, []);
    const resultDamageFramesEntry = {
      'effect delay time(ms)/frame': effectDelay,
      'frame times': [],
      'hit dmg% distribution': [],
      'hit dmg% distribution (total)': 0,
      hits: 0
    };
    unifiedFrames.sort((a, b) => a.time - b.time).forEach(({
      time,
      damage
    }) => {
      resultDamageFramesEntry['frame times'].push(time);
      resultDamageFramesEntry['hit dmg% distribution'].push(damage);
      resultDamageFramesEntry['hit dmg% distribution (total)'] += damage;
    });
    resultDamageFramesEntry.hits = resultDamageFramesEntry['frame times'].length;
    return resultDamageFramesEntry;
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getLevelEntryForBurst: getLevelEntryForBurst,
    getEffectsForBurst: getEffectsForBurst,
    getExtraAttackDamageFramesEntry: getExtraAttackDamageFramesEntry
  });
  /**
   * @description Get the associated metadata entry for a given passive ID.
   * @param id Passive ID to get metadata for.
   * @param metadata Optional source to use as metadata; defaults to internal passive metadata.
   * @returns Corresponding passive metadata entry if it exists, undefined otherwise.
   */

  function getMetadataForPassive(id, metadata = PASSIVE_METADATA) {
    return !!metadata && typeof metadata === 'object' && Object.hasOwnProperty.call(metadata, id) ? metadata[id] : void 0;
  }
  /**
   * @description Get the associated name for a given proc ID.
   * @param id Proc ID to get the name of.
   * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
   * @returns Name of the proc ID if it exists, empty string otherwise.
   */


  function getNameForProc(id, metadata) {
    const metadataEntry = getMetadataForProc(id, metadata);
    return !!metadataEntry && metadataEntry.Name || '';
  }
  /**
   * @description Get the associated name for a given passive ID.
   * @param id Passive ID to get the name of.
   * @param metadata Optional source to use as metadata; defaults to internal passive metadata.
   * @returns Name of the passive ID if it exists, empty string otherwise.
   */


  function getNameForPassive(id, metadata) {
    const metadataEntry = getMetadataForPassive(id, metadata);
    return !!metadataEntry && metadataEntry.Name || '';
  }
  /**
   * @description Determine if a given effect object is a proc effect based on existing properties.
   * Do note that it does not check the validity of each property, only the existence.
   * @param effect Object to check.
   * @returns Whether the given effect object is considered a proc effect based on its properties.
   */


  function isProcEffect(effect) {
    return !!effect && typeof effect === 'object' && (Object.hasOwnProperty.call(effect, 'proc id') || Object.hasOwnProperty.call(effect, 'unknown proc id'));
  }
  /**
   * @description Determine if a given effect object is a passive effect based on existing properties.
   * Do note that it does not check the validity of each property, only the existence.
   * @param effect Object to check.
   * @returns Whether the given effect object is considered a passive effect based on its properties.
   */


  function isPassiveEffect(effect) {
    return !!effect && typeof effect === 'object' && (Object.hasOwnProperty.call(effect, 'passive id') || Object.hasOwnProperty.call(effect, 'unknown passive id'));
  }

  var ArenaCondition;

  (function (ArenaCondition) {
    ArenaCondition["hp_50pr_under"] = "hp_50pr_under";
    ArenaCondition["hp_50pr_over"] = "hp_50pr_over";
    ArenaCondition["hp_75pr_under"] = "hp_75pr_under";
    ArenaCondition["hp_25pr_under"] = "hp_25pr_under";
    ArenaCondition["hp_min"] = "hp_min";
    ArenaCondition["hp_max"] = "hp_max";
    ArenaCondition["atk_max"] = "atk_max";
    ArenaCondition["random"] = "random";
  })(ArenaCondition || (ArenaCondition = {}));

  var MoveType;

  (function (MoveType) {
    MoveType["Moving"] = "1";
    MoveType["Teleporting"] = "2";
    MoveType["NonMoving"] = "3";
  })(MoveType || (MoveType = {}));

  var TargetArea;

  (function (TargetArea) {
    TargetArea["Aoe"] = "aoe";
    TargetArea["Single"] = "single";
    TargetArea["Random"] = "random";
  })(TargetArea || (TargetArea = {}));

  var TargetAreaShorthand;

  (function (TargetAreaShorthand) {
    TargetAreaShorthand["Aoe"] = "AOE";
    TargetAreaShorthand["Single"] = "ST";
    TargetAreaShorthand["Random"] = "RT";
  })(TargetAreaShorthand || (TargetAreaShorthand = {}));

  var TargetType;

  (function (TargetType) {
    TargetType["Self"] = "self";
    TargetType["Party"] = "party";
    TargetType["Enemy"] = "enemy";
  })(TargetType || (TargetType = {}));

  var SpPassiveType;

  (function (SpPassiveType) {
    SpPassiveType["AddPassive"] = "passive";
    SpPassiveType["EnhanceBb"] = "add to bb";
    SpPassiveType["EnhanceSbb"] = "add to sbb";
    SpPassiveType["EnhanceUbb"] = "add to ubb";
    SpPassiveType["EnhancePassive"] = "add to passive";
  })(SpPassiveType || (SpPassiveType = {}));

  var SphereTypeName;

  (function (SphereTypeName) {
    SphereTypeName["None"] = "None";
    SphereTypeName["Status Enhancing"] = "Status Enhancing";
    SphereTypeName["Critical"] = "Critical";
    SphereTypeName["Drop"] = "Drop";
    SphereTypeName["Ailment Inducing"] = "Ailment Inducing";
    SphereTypeName["Element Fusion"] = "Element Fusion";
    SphereTypeName["BB Gauge"] = "BB Gauge";
    SphereTypeName["HP Recovery"] = "HP Recovery";
    SphereTypeName["Target Setting"] = "Target Setting";
    SphereTypeName["Damage Deflecting"] = "Damage Deflecting";
    SphereTypeName["Damage Reducing"] = "Damage Reducing";
    SphereTypeName["Spark"] = "Spark";
    SphereTypeName["Defense Piercing"] = "Defense Piercing";
    SphereTypeName["Attack Boosting"] = "Attack Boosting";
    SphereTypeName["Special"] = "Special";
  })(SphereTypeName || (SphereTypeName = {}));

  var SphereTypeId;

  (function (SphereTypeId) {
    SphereTypeId[SphereTypeId["None"] = 0] = "None";
    SphereTypeId[SphereTypeId["Status Enhancing"] = 1] = "Status Enhancing";
    SphereTypeId[SphereTypeId["Critical"] = 2] = "Critical";
    SphereTypeId[SphereTypeId["Drop"] = 3] = "Drop";
    SphereTypeId[SphereTypeId["Ailment Inducing"] = 4] = "Ailment Inducing";
    SphereTypeId[SphereTypeId["Element Fusion"] = 5] = "Element Fusion";
    SphereTypeId[SphereTypeId["BB Gauge"] = 6] = "BB Gauge";
    SphereTypeId[SphereTypeId["HP Recovery"] = 7] = "HP Recovery";
    SphereTypeId[SphereTypeId["Target Setting"] = 8] = "Target Setting";
    SphereTypeId[SphereTypeId["Damage Deflecting"] = 9] = "Damage Deflecting";
    SphereTypeId[SphereTypeId["Damage Reducing"] = 10] = "Damage Reducing";
    SphereTypeId[SphereTypeId["Spark"] = 11] = "Spark";
    SphereTypeId[SphereTypeId["Defense Piercing"] = 12] = "Defense Piercing";
    SphereTypeId[SphereTypeId["Attack Boosting"] = 13] = "Attack Boosting";
    SphereTypeId[SphereTypeId["Special"] = 14] = "Special";
  })(SphereTypeId || (SphereTypeId = {}));

  var SpCategoryName;

  (function (SpCategoryName) {
    SpCategoryName["Parameter Boost"] = "Parameter Boost";
    SpCategoryName["Spark"] = "Spark";
    SpCategoryName["Critical Hits"] = "Critical Hits";
    SpCategoryName["Attack Boost"] = "Attack Boost";
    SpCategoryName["BB Gauge"] = "BB Gauge";
    SpCategoryName["HP Recovery"] = "HP Recovery";
    SpCategoryName["Drops"] = "Drops";
    SpCategoryName["Ailment Resistance"] = "Ailment Resistance";
    SpCategoryName["Ailment Infliction"] = "Ailment Infliction";
    SpCategoryName["Damage Reduction"] = "Damage Reduction";
    SpCategoryName["Special"] = "Special";
    SpCategoryName["Unknown"] = "Unknown";
  })(SpCategoryName || (SpCategoryName = {}));

  var SpCategoryId;

  (function (SpCategoryId) {
    SpCategoryId["Parameter Boost"] = "1";
    SpCategoryId["Spark"] = "2";
    SpCategoryId["Critical Hits"] = "3";
    SpCategoryId["Attack Boost"] = "4";
    SpCategoryId["BB Gauge"] = "5";
    SpCategoryId["HP Recovery"] = "6";
    SpCategoryId["Drops"] = "7";
    SpCategoryId["Ailment Resistance"] = "8";
    SpCategoryId["Ailment Infliction"] = "9";
    SpCategoryId["Damage Reduction"] = "10";
    SpCategoryId["Special"] = "11";
  })(SpCategoryId || (SpCategoryId = {}));

  var UnitAnimationKey;

  (function (UnitAnimationKey) {
    UnitAnimationKey["Attack"] = "attack";
    UnitAnimationKey["Idle"] = "idle";
    UnitAnimationKey["Move"] = "move";
  })(UnitAnimationKey || (UnitAnimationKey = {}));

  var UnitElement;

  (function (UnitElement) {
    UnitElement["Fire"] = "fire";
    UnitElement["Water"] = "water";
    UnitElement["Earth"] = "earth";
    UnitElement["Thunder"] = "thunder";
    UnitElement["Light"] = "light";
    UnitElement["Dark"] = "dark";
  })(UnitElement || (UnitElement = {}));

  var UnitGender;

  (function (UnitGender) {
    UnitGender["Male"] = "male";
    UnitGender["Female"] = "female";
    UnitGender["Other"] = "other";
  })(UnitGender || (UnitGender = {}));

  var UnitGettingType;

  (function (UnitGettingType) {
    UnitGettingType["Ineligible"] = "not eligible for achievement";
    UnitGettingType["Farmable"] = "farmable";
    UnitGettingType["RareSummon"] = "rare summon";
    UnitGettingType["ExtraSkillElgif"] = "extra skill elgif";
  })(UnitGettingType || (UnitGettingType = {}));

  var UnitKind;

  (function (UnitKind) {
    UnitKind["Normal"] = "normal";
    UnitKind["Evolution"] = "evo";
    UnitKind["Enhancing"] = "enhancing";
    UnitKind["Sale"] = "sale";
  })(UnitKind || (UnitKind = {}));

  var UnitType;

  (function (UnitType) {
    UnitType["Lord"] = "lord";
    UnitType["Anima"] = "anima";
    UnitType["Breaker"] = "breaker";
    UnitType["Guardian"] = "guardian";
    UnitType["Oracle"] = "oracle";
    UnitType["Rex"] = "rex";
  })(UnitType || (UnitType = {}));

  var ItemType;

  (function (ItemType) {
    ItemType["Consumable"] = "consumable";
    ItemType["Material"] = "material";
    ItemType["Sphere"] = "sphere";
    ItemType["EvolutionMaterial"] = "evomat";
    ItemType["SummonerConsumable"] = "summoner_consumable";
    ItemType["LeaderSkillSphere"] = "ls_sphere";
  })(ItemType || (ItemType = {}));

  var MimicUnitIds;

  (function (MimicUnitIds) {
    MimicUnitIds["Mimic"] = "60142";
    MimicUnitIds["BatMimic"] = "60143";
    MimicUnitIds["DragonMimic"] = "60144";
    MimicUnitIds["MetalMimic"] = "60224";
  })(MimicUnitIds || (MimicUnitIds = {}));
  /**
   * @description Known values for the monster groups used in {@link IMimicInfo}.
   */


  const MimicMonsterGroupMapping = {
    '1000': MimicUnitIds.Mimic,
    '1100': MimicUnitIds.BatMimic,
    '1101': MimicUnitIds.BatMimic,
    '1200': MimicUnitIds.DragonMimic,
    '1300': MimicUnitIds.MetalMimic
  };
  var datamineTypes = /*#__PURE__*/Object.freeze({
    __proto__: null,

    get ArenaCondition() {
      return ArenaCondition;
    },

    get MoveType() {
      return MoveType;
    },

    get TargetArea() {
      return TargetArea;
    },

    get TargetAreaShorthand() {
      return TargetAreaShorthand;
    },

    get TargetType() {
      return TargetType;
    },

    get SpPassiveType() {
      return SpPassiveType;
    },

    get SphereTypeName() {
      return SphereTypeName;
    },

    get SphereTypeId() {
      return SphereTypeId;
    },

    get SpCategoryName() {
      return SpCategoryName;
    },

    get SpCategoryId() {
      return SpCategoryId;
    },

    get UnitAnimationKey() {
      return UnitAnimationKey;
    },

    get UnitElement() {
      return UnitElement;
    },

    get UnitGender() {
      return UnitGender;
    },

    get UnitGettingType() {
      return UnitGettingType;
    },

    get UnitKind() {
      return UnitKind;
    },

    get UnitType() {
      return UnitType;
    },

    get ItemType() {
      return ItemType;
    },

    get MimicUnitIds() {
      return MimicUnitIds;
    },

    MimicMonsterGroupMapping: MimicMonsterGroupMapping
  });
  /**
   * @description Create a list of objects that contain both the effect data and its corresponding damage frame.
   * @param effects List of proc effects to combine; must be the same length as the `damageFrames`.
   * @param damageFrames List of damage frames whose index corresponds with the effect in the `effects` list.
   * @returns Collection of composite objects that contain the proc effect and the corresponding frames entry.
   */

  function combineEffectsAndDamageFrames(effects, damageFrames) {
    let combinedEntries = [];

    if (Array.isArray(effects) && effects.length > 0 && Array.isArray(damageFrames) && effects.length === damageFrames.length) {
      combinedEntries = effects.map((effect, i) => {
        const correspondingFrameEntry = damageFrames[i];
        return {
          delay: effect['effect delay time(ms)/frame'],
          effect,
          frames: correspondingFrameEntry,
          id: `${effect['proc id'] || effect['unknown proc id']}`,
          targetArea: effect['random attack'] ? TargetArea.Random : effect['target area'],
          targetType: effect['target type']
        };
      });
    }

    return combinedEntries;
  }
  /**
   * @description Get the name of a given object.
   * @param effect Object to get the name from.
   * @param metadata Optional sources of metadata for procs and passives; defaults to internal metadata for respective types.
   * @returns Name of the input effect if it exists; empty string otherwise.
   */


  function getEffectName(effect, metadata = {}) {
    let resultName = '';
    const effectId = getEffectId(effect);

    if (isPassiveEffect(effect)) {
      resultName = getNameForPassive(effectId, metadata && metadata.passive);
    } else if (isProcEffect(effect)) {
      resultName = getNameForProc(effectId, metadata && metadata.proc);
    }

    return resultName;
  }
  /**
   * @description Provides info at a glance regarding a buff's source and how it stacks.
   */


  var BuffStackType;

  (function (BuffStackType) {
    /**
     * @description The buff is activated via some skill and lasts for a number of turns.
     * Sometimes referred to as procs. Buffs of the same type do not stack unless if they're
     * from different levels. Two possible levels of sources are:
     * 1. Brave Burst or Super Brave Burst (also includes enemy skills)
     * 2. Ultimate Brave Burst or Dual Brave Burst
     */
    BuffStackType["Active"] = "active";
    /**
     * @description The buff is always active provided that the source is not nullified.
     * Most passive buffs can stack with themselves.
     */

    BuffStackType["Passive"] = "passive";
    /**
     * @description The buff is applied for a number of turns once a certain condition is met.
     * Buffs of the same type are not able to stack.
     */

    BuffStackType["ConditionalTimed"] = "conditionalTimed";
    /**
     * @description Only one instance of the buff can be active at a time and can last indefinitely.
     * A couple examples of this are Barrier and Max HP Boost.
     */

    BuffStackType["Singleton"] = "singleton";
    /**
     * @description The buff's effects immediately apply to the target(s). This differs from singleton
     * in that these values aren't permanent and some effects can "stack" (e.g. using two burst heals results
     * in the HP bar filling by the sum of those burst heals).
     */

    BuffStackType["Burst"] = "burst";
    /**
     * @description A specific subset of `Burst` type buffs that deal damage to the target.
     */

    BuffStackType["Attack"] = "attack";
    /**
     * @description Only for buffs that cannot be processed by the library yet.
     */

    BuffStackType["Unknown"] = "unknown";
  })(BuffStackType || (BuffStackType = {}));

  var BuffSource;

  (function (BuffSource) {
    BuffSource["BraveBurst"] = "bb";
    BuffSource["SuperBraveBurst"] = "sbb";
    BuffSource["UltimateBraveBurst"] = "ubb";
    BuffSource["DualBraveBurst"] = "dbb";
    BuffSource["BondedBraveBurst"] = "bbb";
    BuffSource["BondedSuperBraveBurst"] = "dsbb";
    BuffSource["SpEnhancement"] = "sp";
    BuffSource["Item"] = "item";
    BuffSource["LeaderSkill"] = "ls";
    BuffSource["ExtraSkill"] = "es";
    /**
     * @description Buffs that result of having a number of OE+ units in the squad.
     */

    BuffSource["OmniParadigm"] = "omniParadigm";
    /**
     * @description Buffs based on a units type. See {@link UnitType}.
     */

    BuffSource["UnitTypeBonus"] = "unitTypeBonus";
    /**
     * @description Examples include the passive bonuses available in Frontier Gates and Frontier Rifts
     * as well as ambient turn reductions present in some late-game quests.
     */

    BuffSource["Quest"] = "quest";
  })(BuffSource || (BuffSource = {}));
  /**
   * @description Extra element values that can be used in addition to {@link UnitElement}.
   */


  var BuffConditionElement;

  (function (BuffConditionElement) {
    BuffConditionElement["Unknown"] = "unknown";
    BuffConditionElement["OmniParadigm"] = "omniParadigm";
    BuffConditionElement["All"] = "all";
  })(BuffConditionElement || (BuffConditionElement = {}));
  /**
   * @description Stats on a unit that a buff can affect.
   */


  var UnitStat;

  (function (UnitStat) {
    UnitStat["hp"] = "hp";
    UnitStat["atk"] = "atk";
    UnitStat["def"] = "def";
    UnitStat["rec"] = "rec";
    UnitStat["crit"] = "crit";
    UnitStat["bbGauge"] = "bbGauge";
    UnitStat["poisonResist"] = "poisonResist";
    UnitStat["weakResist"] = "weakResist";
    UnitStat["sickResist"] = "sickResist";
    UnitStat["injuryResist"] = "injuryResist";
    UnitStat["curseResist"] = "curseResist";
    UnitStat["paralysisResist"] = "paralysisResist";
    UnitStat["mitigation"] = "mitigation";
    UnitStat["fireMitigation"] = "fireMitigation";
    UnitStat["waterMitigation"] = "waterMitigation";
    UnitStat["earthMitigation"] = "earthMitigation";
    UnitStat["thunderMitigation"] = "thunderMitigation";
    UnitStat["lightMitigation"] = "lightMitigation";
    UnitStat["darkMitigation"] = "darkMitigation";
    UnitStat["turnDurationModification"] = "turnDurationModification";
  })(UnitStat || (UnitStat = {}));

  var IconId;

  (function (IconId) {
    IconId["UNKNOWN"] = "UNKNOWN";
    IconId["TURN_DURATION_UP"] = "TURN_DURATION_UP";
    IconId["TURN_DURATION_DOWN"] = "TURN_DURATION_DOWN";
    IconId["BUFF_HPUP"] = "BUFF_HPUP";
    IconId["BUFF_HPDOWN"] = "BUFF_HPDOWN";
    IconId["BUFF_ATKUP"] = "BUFF_ATKUP";
    IconId["BUFF_ATKDOWN"] = "BUFF_ATKDOWN";
    IconId["BUFF_DEFUP"] = "BUFF_DEFUP";
    IconId["BUFF_DEFDOWN"] = "BUFF_DEFDOWN";
    IconId["BUFF_RECUP"] = "BUFF_RECUP";
    IconId["BUFF_RECDOWN"] = "BUFF_RECDOWN";
    IconId["BUFF_CRTRATEUP"] = "BUFF_CRTRATEUP";
    IconId["BUFF_CRTRATEDOWN"] = "BUFF_CRTRATEDOWN";
    IconId["BUFF_HPREC"] = "BUFF_HPREC";
    IconId["BUFF_BBREC"] = "BUFF_BBREC";
    IconId["BUFF_FIREHPUP"] = "BUFF_FIREHPUP";
    IconId["BUFF_FIREHPDOWN"] = "BUFF_FIREHPDOWN";
    IconId["BUFF_FIREATKUP"] = "BUFF_FIREATKUP";
    IconId["BUFF_FIREATKDOWN"] = "BUFF_FIREATKDOWN";
    IconId["BUFF_FIREDEFUP"] = "BUFF_FIREDEFUP";
    IconId["BUFF_FIREDEFDOWN"] = "BUFF_FIREDEFDOWN";
    IconId["BUFF_FIRERECUP"] = "BUFF_FIRERECUP";
    IconId["BUFF_FIRERECDOWN"] = "BUFF_FIRERECDOWN";
    IconId["BUFF_FIRECRTRATEUP"] = "BUFF_FIRECRTRATEUP";
    IconId["BUFF_FIRECRTRATEDOWN"] = "BUFF_FIRECRTRATEDOWN";
    IconId["BUFF_WATERHPUP"] = "BUFF_WATERHPUP";
    IconId["BUFF_WATERHPDOWN"] = "BUFF_WATERHPDOWN";
    IconId["BUFF_WATERATKUP"] = "BUFF_WATERATKUP";
    IconId["BUFF_WATERATKDOWN"] = "BUFF_WATERATKDOWN";
    IconId["BUFF_WATERDEFUP"] = "BUFF_WATERDEFUP";
    IconId["BUFF_WATERDEFDOWN"] = "BUFF_WATERDEFDOWN";
    IconId["BUFF_WATERRECUP"] = "BUFF_WATERRECUP";
    IconId["BUFF_WATERRECDOWN"] = "BUFF_WATERRECDOWN";
    IconId["BUFF_WATERCRTRATEUP"] = "BUFF_WATERCRTRATEUP";
    IconId["BUFF_WATERCRTRATEDOWN"] = "BUFF_WATERCRTRATEDOWN";
    IconId["BUFF_EARTHHPUP"] = "BUFF_EARTHHPUP";
    IconId["BUFF_EARTHHPDOWN"] = "BUFF_EARTHHPDOWN";
    IconId["BUFF_EARTHATKUP"] = "BUFF_EARTHATKUP";
    IconId["BUFF_EARTHATKDOWN"] = "BUFF_EARTHATKDOWN";
    IconId["BUFF_EARTHDEFUP"] = "BUFF_EARTHDEFUP";
    IconId["BUFF_EARTHDEFDOWN"] = "BUFF_EARTHDEFDOWN";
    IconId["BUFF_EARTHRECUP"] = "BUFF_EARTHRECUP";
    IconId["BUFF_EARTHRECDOWN"] = "BUFF_EARTHRECDOWN";
    IconId["BUFF_EARTHCRTRATEUP"] = "BUFF_EARTHCRTRATEUP";
    IconId["BUFF_EARTHCRTRATEDOWN"] = "BUFF_EARTHCRTRATEDOWN";
    IconId["BUFF_THUNDERHPUP"] = "BUFF_THUNDERHPUP";
    IconId["BUFF_THUNDERHPDOWN"] = "BUFF_THUNDERHPDOWN";
    IconId["BUFF_THUNDERATKUP"] = "BUFF_THUNDERATKUP";
    IconId["BUFF_THUNDERATKDOWN"] = "BUFF_THUNDERATKDOWN";
    IconId["BUFF_THUNDERDEFUP"] = "BUFF_THUNDERDEFUP";
    IconId["BUFF_THUNDERDEFDOWN"] = "BUFF_THUNDERDEFDOWN";
    IconId["BUFF_THUNDERRECUP"] = "BUFF_THUNDERRECUP";
    IconId["BUFF_THUNDERRECDOWN"] = "BUFF_THUNDERRECDOWN";
    IconId["BUFF_THUNDERCRTRATEUP"] = "BUFF_THUNDERCRTRATEUP";
    IconId["BUFF_THUNDERCRTRATEDOWN"] = "BUFF_THUNDERCRTRATEDOWN";
    IconId["BUFF_LIGHTHPUP"] = "BUFF_LIGHTHPUP";
    IconId["BUFF_LIGHTHPDOWN"] = "BUFF_LIGHTHPDOWN";
    IconId["BUFF_LIGHTATKUP"] = "BUFF_LIGHTATKUP";
    IconId["BUFF_LIGHTATKDOWN"] = "BUFF_LIGHTATKDOWN";
    IconId["BUFF_LIGHTDEFUP"] = "BUFF_LIGHTDEFUP";
    IconId["BUFF_LIGHTDEFDOWN"] = "BUFF_LIGHTDEFDOWN";
    IconId["BUFF_LIGHTRECUP"] = "BUFF_LIGHTRECUP";
    IconId["BUFF_LIGHTRECDOWN"] = "BUFF_LIGHTRECDOWN";
    IconId["BUFF_LIGHTCRTRATEUP"] = "BUFF_LIGHTCRTRATEUP";
    IconId["BUFF_LIGHTCRTRATEDOWN"] = "BUFF_LIGHTCRTRATEDOWN";
    IconId["BUFF_DARKHPUP"] = "BUFF_DARKHPUP";
    IconId["BUFF_DARKHPDOWN"] = "BUFF_DARKHPDOWN";
    IconId["BUFF_DARKATKUP"] = "BUFF_DARKATKUP";
    IconId["BUFF_DARKATKDOWN"] = "BUFF_DARKATKDOWN";
    IconId["BUFF_DARKDEFUP"] = "BUFF_DARKDEFUP";
    IconId["BUFF_DARKDEFDOWN"] = "BUFF_DARKDEFDOWN";
    IconId["BUFF_DARKRECUP"] = "BUFF_DARKRECUP";
    IconId["BUFF_DARKRECDOWN"] = "BUFF_DARKRECDOWN";
    IconId["BUFF_DARKCRTRATEUP"] = "BUFF_DARKCRTRATEUP";
    IconId["BUFF_DARKCRTRATEDOWN"] = "BUFF_DARKCRTRATEDOWN";
    IconId["BUFF_ELEMENTHPUP"] = "BUFF_ELEMENTHPUP";
    IconId["BUFF_ELEMENTHPDOWN"] = "BUFF_ELEMENTHPDOWN";
    IconId["BUFF_ELEMENTATKUP"] = "BUFF_ELEMENTATKUP";
    IconId["BUFF_ELEMENTATKDOWN"] = "BUFF_ELEMENTATKDOWN";
    IconId["BUFF_ELEMENTDEFUP"] = "BUFF_ELEMENTDEFUP";
    IconId["BUFF_ELEMENTDEFDOWN"] = "BUFF_ELEMENTDEFDOWN";
    IconId["BUFF_ELEMENTRECUP"] = "BUFF_ELEMENTRECUP";
    IconId["BUFF_ELEMENTRECDOWN"] = "BUFF_ELEMENTRECDOWN";
    IconId["BUFF_ELEMENTCRTRATEUP"] = "BUFF_ELEMENTCRTRATEUP";
    IconId["BUFF_ELEMENTCRTRATEDOWN"] = "BUFF_ELEMENTCRTRATEDOWN";
    IconId["BUFF_LORDHPUP"] = "BUFF_LORDHPUP";
    IconId["BUFF_LORDHPDOWN"] = "BUFF_LORDHPDOWN";
    IconId["BUFF_LORDATKUP"] = "BUFF_LORDATKUP";
    IconId["BUFF_LORDATKDOWN"] = "BUFF_LORDATKDOWN";
    IconId["BUFF_LORDDEFUP"] = "BUFF_LORDDEFUP";
    IconId["BUFF_LORDDEFDOWN"] = "BUFF_LORDDEFDOWN";
    IconId["BUFF_LORDRECUP"] = "BUFF_LORDRECUP";
    IconId["BUFF_LORDRECDOWN"] = "BUFF_LORDRECDOWN";
    IconId["BUFF_LORDCRTRATEUP"] = "BUFF_LORDCRTRATEUP";
    IconId["BUFF_LORDCRTRATEDOWN"] = "BUFF_LORDCRTRATEDOWN";
    IconId["BUFF_ANIMAHPUP"] = "BUFF_ANIMAHPUP";
    IconId["BUFF_ANIMAHPDOWN"] = "BUFF_ANIMAHPDOWN";
    IconId["BUFF_ANIMAATKUP"] = "BUFF_ANIMAATKUP";
    IconId["BUFF_ANIMAATKDOWN"] = "BUFF_ANIMAATKDOWN";
    IconId["BUFF_ANIMADEFUP"] = "BUFF_ANIMADEFUP";
    IconId["BUFF_ANIMADEFDOWN"] = "BUFF_ANIMADEFDOWN";
    IconId["BUFF_ANIMARECUP"] = "BUFF_ANIMARECUP";
    IconId["BUFF_ANIMARECDOWN"] = "BUFF_ANIMARECDOWN";
    IconId["BUFF_ANIMACRTRATEUP"] = "BUFF_ANIMACRTRATEUP";
    IconId["BUFF_ANIMACRTRATEDOWN"] = "BUFF_ANIMACRTRATEDOWN";
    IconId["BUFF_BREAKERHPUP"] = "BUFF_BREAKERHPUP";
    IconId["BUFF_BREAKERHPDOWN"] = "BUFF_BREAKERHPDOWN";
    IconId["BUFF_BREAKERATKUP"] = "BUFF_BREAKERATKUP";
    IconId["BUFF_BREAKERATKDOWN"] = "BUFF_BREAKERATKDOWN";
    IconId["BUFF_BREAKERDEFUP"] = "BUFF_BREAKERDEFUP";
    IconId["BUFF_BREAKERDEFDOWN"] = "BUFF_BREAKERDEFDOWN";
    IconId["BUFF_BREAKERRECUP"] = "BUFF_BREAKERRECUP";
    IconId["BUFF_BREAKERRECDOWN"] = "BUFF_BREAKERRECDOWN";
    IconId["BUFF_BREAKERCRTRATEUP"] = "BUFF_BREAKERCRTRATEUP";
    IconId["BUFF_BREAKERCRTRATEDOWN"] = "BUFF_BREAKERCRTRATEDOWN";
    IconId["BUFF_GUARDIANHPUP"] = "BUFF_GUARDIANHPUP";
    IconId["BUFF_GUARDIANHPDOWN"] = "BUFF_GUARDIANHPDOWN";
    IconId["BUFF_GUARDIANATKUP"] = "BUFF_GUARDIANATKUP";
    IconId["BUFF_GUARDIANATKDOWN"] = "BUFF_GUARDIANATKDOWN";
    IconId["BUFF_GUARDIANDEFUP"] = "BUFF_GUARDIANDEFUP";
    IconId["BUFF_GUARDIANDEFDOWN"] = "BUFF_GUARDIANDEFDOWN";
    IconId["BUFF_GUARDIANRECUP"] = "BUFF_GUARDIANRECUP";
    IconId["BUFF_GUARDIANRECDOWN"] = "BUFF_GUARDIANRECDOWN";
    IconId["BUFF_GUARDIANCRTRATEUP"] = "BUFF_GUARDIANCRTRATEUP";
    IconId["BUFF_GUARDIANCRTRATEDOWN"] = "BUFF_GUARDIANCRTRATEDOWN";
    IconId["BUFF_ORACLEHPUP"] = "BUFF_ORACLEHPUP";
    IconId["BUFF_ORACLEHPDOWN"] = "BUFF_ORACLEHPDOWN";
    IconId["BUFF_ORACLEATKUP"] = "BUFF_ORACLEATKUP";
    IconId["BUFF_ORACLEATKDOWN"] = "BUFF_ORACLEATKDOWN";
    IconId["BUFF_ORACLEDEFUP"] = "BUFF_ORACLEDEFUP";
    IconId["BUFF_ORACLEDEFDOWN"] = "BUFF_ORACLEDEFDOWN";
    IconId["BUFF_ORACLERECUP"] = "BUFF_ORACLERECUP";
    IconId["BUFF_ORACLERECDOWN"] = "BUFF_ORACLERECDOWN";
    IconId["BUFF_ORACLECRTRATEUP"] = "BUFF_ORACLECRTRATEUP";
    IconId["BUFF_ORACLECRTRATEDOWN"] = "BUFF_ORACLECRTRATEDOWN";
    IconId["BUFF_REXHPUP"] = "BUFF_REXHPUP";
    IconId["BUFF_REXHPDOWN"] = "BUFF_REXHPDOWN";
    IconId["BUFF_REXATKUP"] = "BUFF_REXATKUP";
    IconId["BUFF_REXATKDOWN"] = "BUFF_REXATKDOWN";
    IconId["BUFF_REXDEFUP"] = "BUFF_REXDEFUP";
    IconId["BUFF_REXDEFDOWN"] = "BUFF_REXDEFDOWN";
    IconId["BUFF_REXRECUP"] = "BUFF_REXRECUP";
    IconId["BUFF_REXRECDOWN"] = "BUFF_REXRECDOWN";
    IconId["BUFF_REXCRTRATEUP"] = "BUFF_REXCRTRATEUP";
    IconId["BUFF_REXCRTRATEDOWN"] = "BUFF_REXCRTRATEDOWN";
    IconId["BUFF_UNITTYPEHPUP"] = "BUFF_UNITTYPEHPUP";
    IconId["BUFF_UNITTYPEHPDOWN"] = "BUFF_UNITTYPEHPDOWN";
    IconId["BUFF_UNITTYPEATKUP"] = "BUFF_UNITTYPEATKUP";
    IconId["BUFF_UNITTYPEATKDOWN"] = "BUFF_UNITTYPEATKDOWN";
    IconId["BUFF_UNITTYPEDEFUP"] = "BUFF_UNITTYPEDEFUP";
    IconId["BUFF_UNITTYPEDEFDOWN"] = "BUFF_UNITTYPEDEFDOWN";
    IconId["BUFF_UNITTYPERECUP"] = "BUFF_UNITTYPERECUP";
    IconId["BUFF_UNITTYPERECDOWN"] = "BUFF_UNITTYPERECDOWN";
    IconId["BUFF_UNITTYPECRTRATEUP"] = "BUFF_UNITTYPECRTRATEUP";
    IconId["BUFF_UNITTYPECRTRATEDOWN"] = "BUFF_UNITTYPECRTRATEDOWN";
    IconId["BUFF_POISONBLK"] = "BUFF_POISONBLK";
    IconId["BUFF_WEAKBLK"] = "BUFF_WEAKBLK";
    IconId["BUFF_SICKBLK"] = "BUFF_SICKBLK";
    IconId["BUFF_INJURYBLK"] = "BUFF_INJURYBLK";
    IconId["BUFF_CURSEBLK"] = "BUFF_CURSEBLK";
    IconId["BUFF_PARALYSISBLK"] = "BUFF_PARALYSISBLK";
    IconId["BUFF_FIREDMGDOWN"] = "BUFF_FIREDMGDOWN";
    IconId["BUFF_WATERDMGDOWN"] = "BUFF_WATERDMGDOWN";
    IconId["BUFF_EARTHDMGDOWN"] = "BUFF_EARTHDMGDOWN";
    IconId["BUFF_THUNDERDMGDOWN"] = "BUFF_THUNDERDMGDOWN";
    IconId["BUFF_LIGHTDMGDOWN"] = "BUFF_LIGHTDMGDOWN";
    IconId["BUFF_DARKDMGDOWN"] = "BUFF_DARKDMGDOWN";
    IconId["BUFF_ELEMENTDMGDOWN"] = "BUFF_ELEMENTDMGDOWN";
    IconId["ATK_ST"] = "ATK_ST";
    IconId["ATK_AOE"] = "ATK_AOE";
  })(IconId || (IconId = {}));
  /**
   * @description Format of these IDs are `<passive|proc>:<original effect ID>:<stat>`.
   * Usage of passive/proc and original effect ID are for easy tracking of the original effect
   * source of a given buff.
   */


  var BuffId;

  (function (BuffId) {
    BuffId["UNKNOWN_PASSIVE_EFFECT_ID"] = "UNKNOWN_PASSIVE_EFFECT_ID";
    BuffId["UNKNOWN_PASSIVE_BUFF_PARAMS"] = "UNKNOWN_PASSIVE_BUFF_PARAMS";
    BuffId["TURN_DURATION_MODIFICATION"] = "TURN_DURATION_MODIFICATION";
    BuffId["passive:1:hp"] = "passive:1:hp";
    BuffId["passive:1:atk"] = "passive:1:atk";
    BuffId["passive:1:def"] = "passive:1:def";
    BuffId["passive:1:rec"] = "passive:1:rec";
    BuffId["passive:1:crit"] = "passive:1:crit";
    BuffId["passive:2:hp"] = "passive:2:hp";
    BuffId["passive:2:atk"] = "passive:2:atk";
    BuffId["passive:2:def"] = "passive:2:def";
    BuffId["passive:2:rec"] = "passive:2:rec";
    BuffId["passive:2:crit"] = "passive:2:crit";
    BuffId["passive:3:hp"] = "passive:3:hp";
    BuffId["passive:3:atk"] = "passive:3:atk";
    BuffId["passive:3:def"] = "passive:3:def";
    BuffId["passive:3:rec"] = "passive:3:rec";
    BuffId["passive:3:crit"] = "passive:3:crit";
    BuffId["passive:4:poison"] = "passive:4:poison";
    BuffId["passive:4:weak"] = "passive:4:weak";
    BuffId["passive:4:sick"] = "passive:4:sick";
    BuffId["passive:4:injury"] = "passive:4:injury";
    BuffId["passive:4:curse"] = "passive:4:curse";
    BuffId["passive:4:paralysis"] = "passive:4:paralysis";
    BuffId["passive:5:fire"] = "passive:5:fire";
    BuffId["passive:5:water"] = "passive:5:water";
    BuffId["passive:5:earth"] = "passive:5:earth";
    BuffId["passive:5:thunder"] = "passive:5:thunder";
    BuffId["passive:5:light"] = "passive:5:light";
    BuffId["passive:5:dark"] = "passive:5:dark";
    BuffId["passive:5:unknown"] = "passive:5:unknown";
    BuffId["UNKNOWN_PROC_EFFECT_ID"] = "UNKNOWN_PROC_EFFECT_ID";
    BuffId["UNKNOWN_PROC_BUFF_PARAMS"] = "UNKNOWN_PROC_BUFF_PARAMS";
    BuffId["proc:1"] = "proc:1";
    BuffId["proc:2"] = "proc:2";
    BuffId["proc:3"] = "proc:3";
    BuffId["proc:4:flat"] = "proc:4:flat";
    BuffId["proc:4:percent"] = "proc:4:percent";
    BuffId["proc:5:atk"] = "proc:5:atk";
    BuffId["proc:5:def"] = "proc:5:def";
    BuffId["proc:5:rec"] = "proc:5:rec";
    BuffId["proc:5:crit"] = "proc:5:crit";
  })(BuffId || (BuffId = {}));
  /**
   * @description Helper function for creating an entry to be used in the `sources`
   * property of {@link IBuff}.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns Entry in the format of `<BuffSource>-<ID of Buff Source>`.
   */


  function createSourceEntryFromContext(context) {
    return `${context.source}-${context.sourceId}`;
  }
  /**
   * @description Helper function for creating an entries array to be used in the `sources`
   * property of {@link IBuff}. It handles setting the order of the sources.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns List of entries in the format of `<BuffSource>-<ID of Buff Source>`.
   */


  function createSourcesFromContext(context) {
    const resultArray = Array.isArray(context.previousSources) ? context.previousSources.slice() : []; // Ensure that the current source is at the beginning of the array

    resultArray.unshift(createSourceEntryFromContext(context));
    return resultArray;
  }
  /**
   * @description Given the conditions in an extra skill effect, normalize them into
   * a simpler object containing the IDs of each condition type.
   * @param effect Extra skill effect to process conditions from.
   * @returns Conditions based on type, otherwise an empty object if no conditions are found.
   */


  function processExtraSkillConditions(effect) {
    const conditions = effect && Array.isArray(effect.conditions) && effect.conditions || [];
    const aggregate = {
      units: new Set(),
      items: new Set(),
      sphereTypes: new Set(),
      unknowns: new Set()
    };
    conditions.forEach((condition, index) => {
      if ('sphere category required (raw)' in condition) {
        aggregate.sphereTypes.add(condition['sphere category required (raw)']);
      } else if ('item required' in condition) {
        condition['item required'].forEach(item => {
          aggregate.items.add(item);
        });
      } else if ('unit required' in condition) {
        condition['unit required'].forEach(unit => {
          aggregate.units.add(`${unit.id}`);
        });
      } else {
        aggregate.unknowns.add(`type:${condition.type_id || index},condition:${condition.condition_id || index}`);
      }
    }); // filter out properties that have no entries

    const result = Object.entries(aggregate).filter(entry => entry[1].size > 0).reduce((acc, entry) => {
      acc[entry[0]] = Array.from(entry[1]);
      return acc;
    }, {});
    return result;
  }
  /**
   * @description Extract the target type and target area of a given passive effect.
   * @param effect Passive effect to extract target data from.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns The target data for the given effect and context. There are only two possible values:
   * party (`targetType` is party and `targetArea` is aoe ) and single (`targetType` is self and `targetArea` is single)
   */


  function getPassiveTargetData(effect, context) {
    const isLeaderSkillEffect = context.source === BuffSource.LeaderSkill || effect.sp_type === SpPassiveType.EnhancePassive;
    const isPartyEffect = isLeaderSkillEffect || effect['passive target'] === TargetType.Party;
    return {
      targetType: isPartyEffect ? TargetType.Party : TargetType.Self,
      targetArea: isPartyEffect ? TargetArea.Aoe : TargetArea.Single
    };
  }
  /**
   * @description Extract the target type and target area of a given proc effect.
   * @param effect Proc effect to extract target data from.
   * @returns The target data for the given effect and context.
   */


  function getProcTargetData(effect) {
    return {
      targetArea: effect['target area'],
      targetType: effect['target type']
    };
  }
  /**
   * @description Try to parse the given value into a number or return a value if it is not a number.
   * @param value Value to parse into a number.
   * @param defaultValue Value to return if `value` is not a number; defaults to 0.
   * @returns Parsed value as a number or the `defaultValue` if the value is not a number.
   */


  function parseNumberOrDefault(value, defaultValue = 0) {
    return value !== null && !isNaN(value) ? +value : defaultValue;
  }
  /**
   * @description Create an object denoting values that cannot be processed yet. To be used
   * in the `value` property of `IBuff` as needed.
   * @param params Array of values that cannot be processed yet.
   * @param startIndex The first index before which we know how to process an effect's values.
   * @returns Dictionary object where every parameter is keyed by its index in the format of `param_${startIndex + indexInParams}`
   */


  function createUnknownParamsValue(params = [], startIndex = 0) {
    return params.reduce((acc, value, index) => {
      if (value && value !== '0') {
        acc[`param_${startIndex + index}`] = value;
      }

      return acc;
    }, {});
  }

  let mapping;
  /**
   * @description Retrieve the proc-to-buff conversion function mapping for the library. Internally, this is a
   * lazy-loaded singleton to not impact first-load performance.
   * @param reload Optionally re-create the mapping.
   * @returns Mapping of proc IDs to functions.
   */

  function getProcEffectToBuffMapping(reload) {
    if (!mapping || reload) {
      mapping = new Map();
      setMapping(mapping);
    }

    return mapping;
  }
  /**
   * @description Apply the mapping of proc effect IDs to conversion functions to the given Map object.
   * @param map Map to add conversion mapping onto.
   * @returns Does not return anything.
   * @internal
   */


  function setMapping(map) {
    const ELEMENT_MAPPING = {
      0: BuffConditionElement.All,
      1: UnitElement.Fire,
      2: UnitElement.Water,
      3: UnitElement.Earth,
      4: UnitElement.Thunder,
      5: UnitElement.Light,
      6: UnitElement.Dark
    };

    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
      const targetData = (injectionContext && injectionContext.getProcTargetData || getProcTargetData)(effect);
      const sources = (injectionContext && injectionContext.createSourcesFromContext || createSourcesFromContext)(context);
      const effectDelay = effect['effect delay time(ms)/frame'];
      return {
        targetData,
        sources,
        effectDelay
      };
    };

    const splitEffectParams = effect => effect.params.split(',');

    const createUnknownParamsEntry = (unknownParams, {
      originalId,
      sources,
      targetData,
      effectDelay
    }) => Object.assign({
      id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
      originalId,
      effectDelay,
      sources,
      value: unknownParams
    }, targetData);

    const createTurnDurationEntry = ({
      originalId,
      sources,
      buffs,
      duration,
      targetData
    }) => Object.assign({
      id: BuffId.TURN_DURATION_MODIFICATION,
      originalId,
      sources,
      value: {
        buffs,
        duration: duration
      }
    }, targetData);

    const createUnknownParamsEntryFromExtraParams = (extraParams, startIndex, injectionContext) => {
      let unknownParams;

      if (extraParams && extraParams.length > 0) {
        unknownParams = (injectionContext && injectionContext.createUnknownParamsValue || createUnknownParamsValue)(extraParams, startIndex);
      }

      return unknownParams;
    };

    map.set('1', (effect, context, injectionContext) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const hits = +(context.damageFrames && context.damageFrames.hits || 0);
      const distribution = +(context.damageFrames && context.damageFrames['hit dmg% distribution (total)'] || 0);
      const params = {
        'atk%': '0',
        flatAtk: '0',
        'crit%': '0',
        'bc%': '0',
        'hc%': '0',
        'dmg%': '0'
      };
      let unknownParams;

      if (effect.params) {
        let extraParams;
        [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        params['atk%'] = effect['bb atk%'];
        params.flatAtk = effect['bb flat atk'];
        params['crit%'] = effect['bb crit%'];
        params['bc%'] = effect['bb bc%'];
        params['hc%'] = effect['bb hc%'];
        params['dmg%'] = effect['bb dmg%'];
      }

      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = +value;
        return acc;
      }, {});
      const results = [Object.assign({
        id: 'proc:1',
        originalId: '1',
        sources,
        effectDelay,
        value: Object.assign(Object.assign({}, filteredValue), {
          hits,
          distribution
        })
      }, targetData)];

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId: '1',
          sources,
          targetData,
          effectDelay
        }));
      }

      return results;
    });
    map.set('2', (effect, context, injectionContext) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const params = {
        healLow: '0',
        healHigh: '0',
        'healerRec%': 0
      };
      let unknownParams;

      if (effect.params) {
        let recX, recY;
        let extraParams;
        [params.healLow, params.healHigh, recX, recY, ...extraParams] = splitEffectParams(effect);
        params['healerRec%'] = (100 + parseNumberOrDefault(recX)) * (1 + parseNumberOrDefault(recY) / 100) / 10;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      } else {
        params.healLow = effect['heal low'];
        params.healHigh = effect['heal high'];
        params['healerRec%'] = effect['rec added% (from healer)'];
      } // ensure every property is a number


      Object.keys(params).forEach(key => {
        params[key] = parseNumberOrDefault(params[key]);
      });
      const results = [Object.assign({
        id: 'proc:2',
        originalId: '2',
        sources,
        effectDelay,
        value: params
      }, targetData)];

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId: '2',
          sources,
          targetData,
          effectDelay
        }));
      }

      return results;
    });
    map.set('3', (effect, context, injectionContext) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const params = {
        healLow: '0',
        healHigh: '0',
        'targetRec%': 0,
        turnDuration: '0'
      };
      let unknownParams;

      if (effect.params) {
        let rec;
        let extraParams;
        [params.healLow, params.healHigh, rec, params.turnDuration, ...extraParams] = splitEffectParams(effect);
        params['targetRec%'] = (1 + parseNumberOrDefault(rec) / 100) * 10;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      } else {
        params.healLow = effect['gradual heal low'];
        params.healHigh = effect['gradual heal high'];
        params['targetRec%'] = effect['rec added% (from target)'];
        params.turnDuration = effect['gradual heal turns (8)'];
      } // ensure every property is a number


      Object.keys(params).forEach(key => {
        params[key] = parseNumberOrDefault(params[key]);
      });
      const hasAnyHealValues = params.healLow !== 0 || params.healHigh !== 0;
      const results = [];

      if (hasAnyHealValues) {
        results.push(Object.assign({
          id: 'proc:3',
          originalId: '3',
          sources,
          effectDelay,
          duration: params.turnDuration,
          value: {
            healLow: params.healLow,
            healHigh: params.healHigh,
            'targetRec%': params['targetRec%']
          }
        }, targetData));
      } else {
        results.push(createTurnDurationEntry({
          originalId: '3',
          sources,
          buffs: ['proc:3'],
          duration: params.turnDuration,
          targetData
        }));
      }

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId: '3',
          sources,
          targetData,
          effectDelay
        }));
      }

      return results;
    });
    map.set('4', (effect, context, injectionContext) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let flatFill = 0;
      let percentFill = 0;
      let unknownParams;

      if (effect.params) {
        const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
        flatFill = parseNumberOrDefault(rawFlatFill);
        percentFill = parseNumberOrDefault(rawPercentFill);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        if ('bb bc fill' in effect) {
          flatFill = parseNumberOrDefault(effect['bb bc fill']);
        }

        if ('bb bc fill%' in effect) {
          percentFill = parseNumberOrDefault(effect['bb bc fill%']);
        }
      }

      const results = [];

      if (flatFill !== 0) {
        results.push(Object.assign({
          id: 'proc:4:flat',
          originalId: '4',
          sources,
          effectDelay,
          value: flatFill
        }, targetData));
      }

      if (percentFill !== 0) {
        results.push(Object.assign({
          id: 'proc:4:percent',
          originalId: '4',
          sources,
          effectDelay,
          value: percentFill
        }, targetData));
      }

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId: '4',
          sources,
          targetData,
          effectDelay
        }));
      }

      return results;
    });
    map.set('5', (effect, context, injectionContext) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const params = {
        element: BuffConditionElement.All,
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        turnDuration: '0'
      };
      const coreStatProperties = ['atk', 'def', 'rec', 'crit'];
      let unknownParams;

      if (effect.params) {
        let extraParams;
        let rawElement;
        [rawElement, params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
        params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        const effectElement = effect['element buffed'];

        if (effectElement === 'all') {
          params.element = BuffConditionElement.All;
        } else if (!effectElement) {
          params.element = BuffConditionElement.Unknown;
        } else {
          params.element = effectElement;
        }

        const keys = Object.keys(effect);
        coreStatProperties.forEach(statType => {
          const effectKey = keys.find(k => k.startsWith(`${statType}% buff`));

          if (effectKey) {
            params[statType] = effect[effectKey];
          }
        });
        params.turnDuration = effect['buff turns'];
      } // ensure numerical properties are actually numbers


      coreStatProperties.concat(['turnDuration']).forEach(prop => {
        params[prop] = parseNumberOrDefault(params[prop]);
      });
      const hasAnyStats = coreStatProperties.some(statKey => params[statKey] !== 0);
      const results = [];

      if (hasAnyStats) {
        coreStatProperties.forEach(statKey => {
          const value = params[statKey];

          if (value !== 0) {
            const buffEntry = Object.assign({
              id: `proc:5:${statKey}`,
              originalId: '5',
              sources,
              effectDelay,
              duration: params.turnDuration,
              value
            }, targetData);

            if (params.element !== BuffConditionElement.All) {
              buffEntry.conditions = {
                targetElements: [params.element]
              };
            }

            results.push(buffEntry);
          }
        });
      } else {
        results.push(createTurnDurationEntry({
          originalId: '5',
          sources,
          buffs: coreStatProperties.map(statKey => `proc:5:${statKey}`),
          duration: params.turnDuration,
          targetData
        }));
      }

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId: '5',
          sources,
          targetData,
          effectDelay
        }));
      }

      return results;
    });
  }
  /**
   * @description Default function for all effects that cannot be processed.
   * @param effect Effect to convert to `IBuff` format.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns Converted buff(s) from the given proc effect.
   */


  function defaultConversionFunction(effect, context) {
    const id = isProcEffect(effect) && getEffectId(effect) || KNOWN_PROC_ID.Unknown;
    return [{
      id: BuffId.UNKNOWN_PROC_EFFECT_ID,
      originalId: id,
      effectDelay: effect['effect delay time(ms)/frame'],
      targetType: effect['target type'],
      targetArea: effect['target area'],
      sources: createSourcesFromContext(context)
    }];
  }
  /**
   * @description Extract the buff(s) from a given proc effect object.
   * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
   * @param effect Proc effect object to extract buffs from.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns A collection of one or more buffs found in the given proc effect object.
   */


  function convertProcEffectToBuffs(effect, context) {
    if (!effect || typeof effect !== 'object') {
      throw new TypeError('effect parameter should be an object');
    }

    if (!context || typeof context !== 'object') {
      throw new TypeError('context parameter should be an object');
    }

    const id = isProcEffect(effect) && getEffectId(effect);
    const conversionFunction = id && getProcEffectToBuffMapping(context.reloadMapping).get(id);
    return typeof conversionFunction === 'function' ? conversionFunction(effect, context) : defaultConversionFunction(effect, context);
  }

  let mapping$1;
  /**
   * @description Retrieve the passive-to-buff conversion function mapping for the library. Internally, this is a
   * lazy-loaded singleton to not impact first-load performance.
   * @param reload Optionally re-create the mapping.
   * @returns Mapping of passive IDs to functions.
   */

  function getPassiveEffectToBuffMapping(reload) {
    if (!mapping$1 || reload) {
      mapping$1 = new Map();
      setMapping$1(mapping$1);
    }

    return mapping$1;
  }
  /**
   * @description Apply the mapping of passive effect IDs to conversion functions to the given Map object.
   * @param map Map to add conversion mapping onto.
   * @returns Does not return anything.
   * @internal
   */


  function setMapping$1(map) {
    const ELEMENT_MAPPING = {
      1: UnitElement.Fire,
      2: UnitElement.Water,
      3: UnitElement.Earth,
      4: UnitElement.Thunder,
      5: UnitElement.Light,
      6: UnitElement.Dark,
      X: BuffConditionElement.OmniParadigm
    };
    const TYPE_MAPPING = {
      1: UnitType.Lord,
      2: UnitType.Anima,
      3: UnitType.Breaker,
      4: UnitType.Guardian,
      5: UnitType.Oracle,
      6: UnitType.Rex
    };
    const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
    const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];

    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
      const conditionInfo = (injectionContext && injectionContext.processExtraSkillConditions || processExtraSkillConditions)(effect);
      const targetData = (injectionContext && injectionContext.getPassiveTargetData || getPassiveTargetData)(effect, context);
      const sources = (injectionContext && injectionContext.createSourcesFromContext || createSourcesFromContext)(context);
      return {
        conditionInfo,
        targetData,
        sources
      };
    };

    const createaUnknownParamsEntry = (unknownParams, {
      originalId,
      sources,
      targetData,
      conditionInfo
    }) => Object.assign({
      id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
      originalId,
      sources,
      value: unknownParams,
      conditions: Object.assign({}, conditionInfo)
    }, targetData);

    const createUnknownParamsEntryFromExtraParams = (extraParams, startIndex, injectionContext) => {
      let unknownParams;

      if (extraParams && extraParams.length > 0) {
        unknownParams = (injectionContext && injectionContext.createUnknownParamsValue || createUnknownParamsValue)(extraParams, startIndex);
      }

      return unknownParams;
    };

    map.set('1', (effect, context, injectionContext) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const stats = {
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        hp: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        [stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
      } else {
        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:1:${stat}`,
            originalId: '1',
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });

      if (unknownParams) {
        results.push(createaUnknownParamsEntry(unknownParams, {
          originalId: '1',
          sources,
          targetData,
          conditionInfo
        }));
      }

      return results;
    });
    map.set('2', (effect, context, injectionContext) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const stats = {
        elements: [],
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        hp: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let element1, element2;
        [element1, element2, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');
        [element1, element2].forEach(elementValue => {
          if (elementValue && elementValue !== '0') {
            stats.elements.push(ELEMENT_MAPPING[elementValue] || BuffConditionElement.Unknown);
          }
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
      } else {
        stats.elements = typedEffect['elements buffed'];
        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      const createBaseStatObject = stat => Object.assign({
        id: `passive:2:${stat}`,
        originalId: '2',
        sources,
        value: parseNumberOrDefault(stats[stat])
      }, targetData);

      if (stats.elements.length > 0) {
        stats.elements.forEach(element => {
          STATS_ORDER.forEach(stat => {
            const value = parseNumberOrDefault(stats[stat]);

            if (value !== 0) {
              results.push(Object.assign(Object.assign({}, createBaseStatObject(stat)), {
                conditions: Object.assign(Object.assign({}, conditionInfo), {
                  targetElements: [element]
                })
              }));
            }
          });
        });
      } else {
        STATS_ORDER.forEach(stat => {
          const value = parseNumberOrDefault(stats[stat]);

          if (value !== 0) {
            results.push(Object.assign(Object.assign({}, createBaseStatObject(stat)), {
              conditions: Object.assign(Object.assign({}, conditionInfo), {
                targetElements: [BuffConditionElement.Unknown]
              })
            }));
          }
        });
      }

      if (unknownParams) {
        results.push(createaUnknownParamsEntry(unknownParams, {
          originalId: '2',
          sources,
          targetData,
          conditionInfo
        }));
      }

      return results;
    });
    map.set('3', (effect, context, injectionContext) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const stats = {
        unitType: '',
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        hp: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let unitType;
        [unitType, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');

        if (unitType && unitType !== '0') {
          stats.unitType = TYPE_MAPPING[unitType] || 'unknown';
        }

        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        stats.unitType = typedEffect['unit type buffed'];
        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      const targetUnitType = stats.unitType || 'unknown';
      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:3:${stat}`,
            originalId: '3',
            sources,
            value: +value,
            conditions: Object.assign(Object.assign({}, conditionInfo), {
              targetUnitType
            })
          }, targetData));
        }
      });

      if (unknownParams) {
        results.push(createaUnknownParamsEntry(unknownParams, {
          originalId: '3',
          sources,
          targetData,
          conditionInfo
        }));
      }

      return results;
    });
    map.set('4', (effect, context, injectionContext) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const resistances = {
        poison: '0',
        weak: '0',
        sick: '0',
        injury: '0',
        curse: '0',
        paralysis: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, ...extraParams] = typedEffect.params.split(',');
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        AILMENTS_ORDER.forEach(ailment => {
          const effectKey = ailment !== 'weak' ? ailment : 'weaken';
          resistances[ailment] = typedEffect[`${effectKey} resist%`];
        });
      }

      AILMENTS_ORDER.forEach(ailment => {
        const value = parseNumberOrDefault(resistances[ailment]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:4:${ailment}`,
            originalId: '4',
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });

      if (unknownParams) {
        results.push(createaUnknownParamsEntry(unknownParams, {
          originalId: '4',
          sources,
          targetData,
          conditionInfo
        }));
      }

      return results;
    });
    map.set('5', (effect, context, injectionContext) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      let element;
      let mitigation = '0';
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawElement;
        [rawElement, mitigation, ...extraParams] = typedEffect.params.split(',');
        element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        element = Object.values(ELEMENT_MAPPING).find(elem => `${elem} resist%` in effect) || BuffConditionElement.Unknown;

        if (element !== BuffConditionElement.Unknown) {
          mitigation = typedEffect[`${element} resist%`];
        }
      }

      const value = parseNumberOrDefault(mitigation);

      if (value !== 0) {
        results.push(Object.assign({
          id: `passive:5:${element}`,
          originalId: '5',
          sources,
          value,
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      if (unknownParams) {
        results.push(createaUnknownParamsEntry(unknownParams, {
          originalId: '5',
          sources,
          targetData,
          conditionInfo
        }));
      }

      return results;
    });
  }
  /**
   * @description Default function for all effects that cannot be processed.
   * @param effect Effect to convert to `IBuff` format.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns Converted buff(s) from the given passive effect.
   */


  function defaultConversionFunction$1(effect, context) {
    const id = isPassiveEffect(effect) && getEffectId(effect) || KNOWN_PASSIVE_ID.Unknown;
    return [{
      id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
      originalId: id,
      sources: createSourcesFromContext(context)
    }];
  }
  /**
   * @description Extract the buff(s) from a given passive effect object.
   * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
   * @param effect Passive effect object to extract buffs from.
   * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
   * @returns A collection of one or more buffs found in the given passive effect object.
   */


  function convertPassiveEffectToBuffs(effect, context) {
    if (!effect || typeof effect !== 'object') {
      throw new TypeError('effect parameter should be an object');
    }

    if (!context || typeof context !== 'object') {
      throw new TypeError('context parameter should be an object');
    }

    const id = isPassiveEffect(effect) && getEffectId(effect);
    const conversionFunction = id && getPassiveEffectToBuffMapping(context.reloadMapping).get(id);
    return typeof conversionFunction === 'function' ? conversionFunction(effect, context) : defaultConversionFunction$1(effect, context);
  }

  const BUFF_METADATA = Object.freeze(Object.assign(Object.assign(Object.assign(Object.assign({
    'UNKNOWN_PASSIVE_EFFECT_ID': {
      id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
      name: 'Unknown Passive Effect',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.UNKNOWN]
    },
    'UNKNOWN_PASSIVE_BUFF_PARAMS': {
      id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
      name: 'Unknown Passive Buff Parameters',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.UNKNOWN]
    },
    'TURN_DURATION_MODIFICATION': {
      id: BuffId.TURN_DURATION_MODIFICATION,
      name: 'Passive Turn Duration Modification',
      stat: UnitStat.turnDurationModification,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value.duration && buff.value.duration < 0 ? IconId.TURN_DURATION_DOWN : IconId.TURN_DURATION_UP]
    },
    'passive:1:hp': {
      id: BuffId['passive:1:hp'],
      name: 'Passive HP Boost',
      stat: UnitStat.hp,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP]
    },
    'passive:1:atk': {
      id: BuffId['passive:1:atk'],
      name: 'Passive Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP]
    },
    'passive:1:def': {
      id: BuffId['passive:1:def'],
      name: 'Passive Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP]
    },
    'passive:1:rec': {
      id: BuffId['passive:1:rec'],
      name: 'Passive Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP]
    },
    'passive:1:crit': {
      id: BuffId['passive:1:crit'],
      name: 'Passive Critical Hit Rate Boost',
      stat: UnitStat.crit,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP]
    }
  }, (() => {
    const createIconGetterForStat = stat => {
      return buff => {
        let element = '';
        let polarity = 'UP';

        if (buff) {
          if (buff.value && buff.value < 0) {
            polarity = 'DOWN';
          }

          if (buff.conditions && buff.conditions.targetElements) {
            element = buff.conditions.targetElements[0];
          }
        }

        if (typeof element !== 'string') {
          element = '';
        }

        let iconKey = `BUFF_${element.toUpperCase()}${stat}${polarity}`;

        if (!element || !(iconKey in IconId)) {
          iconKey = `BUFF_ELEMENT${stat}${polarity}`;
        }

        return [IconId[iconKey]];
      };
    };

    return {
      'passive:2:hp': {
        id: BuffId['passive:2:hp'],
        name: 'Passive Elemental HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('HP')
      },
      'passive:2:atk': {
        id: BuffId['passive:2:atk'],
        name: 'Passive Elemental Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('ATK')
      },
      'passive:2:def': {
        id: BuffId['passive:2:def'],
        name: 'Passive Elemental Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('DEF')
      },
      'passive:2:rec': {
        id: BuffId['passive:2:rec'],
        name: 'Passive Elemental Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('REC')
      },
      'passive:2:crit': {
        id: BuffId['passive:2:crit'],
        name: 'Passive Elemental Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('CRTRATE')
      }
    };
  })()), (() => {
    const createIconGetterForStat = stat => {
      return buff => {
        let unitType = '';
        let polarity = 'UP';

        if (buff) {
          if (buff.value && buff.value < 0) {
            polarity = 'DOWN';
          }

          if (buff.conditions) {
            unitType = buff.conditions.targetUnitType || '';
          }
        }

        if (typeof unitType !== 'string' || !unitType) {
          unitType = 'unknown';
        }

        let iconKey = `BUFF_${unitType.toUpperCase()}${stat}${polarity}`;

        if (!unitType || !(iconKey in IconId)) {
          iconKey = `BUFF_UNITTYPE${stat}${polarity}`;
        }

        return [IconId[iconKey]];
      };
    };

    return {
      'passive:3:hp': {
        id: BuffId['passive:3:hp'],
        name: 'Passive Type-Based HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('HP')
      },
      'passive:3:atk': {
        id: BuffId['passive:3:atk'],
        name: 'Passive Type-Based Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('ATK')
      },
      'passive:3:def': {
        id: BuffId['passive:3:def'],
        name: 'Passive Type-Based Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('DEF')
      },
      'passive:3:rec': {
        id: BuffId['passive:3:rec'],
        name: 'Passive Type-Based Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('REC')
      },
      'passive:3:crit': {
        id: BuffId['passive:3:crit'],
        name: 'Passive Type-Based Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('CRTRATE')
      }
    };
  })()), {
    'passive:4:poison': {
      id: BuffId['passive:4:poison'],
      name: 'Passive Poison Resist',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_POISONBLK]
    },
    'passive:4:weak': {
      id: BuffId['passive:4:weak'],
      name: 'Passive Weak Resist',
      stat: UnitStat.weakResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_WEAKBLK]
    },
    'passive:4:sick': {
      id: BuffId['passive:4:sick'],
      name: 'Passive Sick Resist',
      stat: UnitStat.sickResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_SICKBLK]
    },
    'passive:4:injury': {
      id: BuffId['passive:4:injury'],
      name: 'Passive Injury Resist',
      stat: UnitStat.injuryResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_INJURYBLK]
    },
    'passive:4:curse': {
      id: BuffId['passive:4:curse'],
      name: 'Passive Curse Resist',
      stat: UnitStat.curseResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_CURSEBLK]
    },
    'passive:4:paralysis': {
      id: BuffId['passive:4:paralysis'],
      name: 'Passive Paralysis Resist',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_PARALYSISBLK]
    },
    'passive:5:fire': {
      id: BuffId['passive:5:fire'],
      name: 'Passive Fire Damage Reduction',
      stat: UnitStat.fireMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_FIREDMGDOWN]
    },
    'passive:5:water': {
      id: BuffId['passive:5:water'],
      name: 'Passive Water Damage Reduction',
      stat: UnitStat.waterMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_WATERDMGDOWN]
    },
    'passive:5:earth': {
      id: BuffId['passive:5:earth'],
      name: 'Passive Earth Damage Reduction',
      stat: UnitStat.earthMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_EARTHDMGDOWN]
    },
    'passive:5:thunder': {
      id: BuffId['passive:5:thunder'],
      name: 'Passive Thunder Damage Reduction',
      stat: UnitStat.thunderMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_THUNDERDMGDOWN]
    },
    'passive:5:light': {
      id: BuffId['passive:5:light'],
      name: 'Passive Light Damage Reduction',
      stat: UnitStat.lightMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_LIGHTDMGDOWN]
    },
    'passive:5:dark': {
      id: BuffId['passive:5:dark'],
      name: 'Passive Dark Damage Reduction',
      stat: UnitStat.darkMitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DARKDMGDOWN]
    },
    'passive:5:unknown': {
      id: BuffId['passive:5:unknown'],
      name: 'Passive Elemental Damage Reduction (Unspecified Element)',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ELEMENTDMGDOWN]
    },
    'UNKNOWN_PROC_EFFECT_ID': {
      id: BuffId.UNKNOWN_PROC_EFFECT_ID,
      name: 'Unknown Proc Effect',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.UNKNOWN]
    },
    'UNKNOWN_PROC_BUFF_PARAMS': {
      id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
      name: 'Unknown Proc Buff Parameters',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.UNKNOWN]
    },
    'proc:1': {
      id: BuffId['proc:1'],
      name: 'Regular Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST : IconId.ATK_AOE]
    },
    'proc:2': {
      id: BuffId['proc:2'],
      name: 'Burst Heal',
      stat: UnitStat.hp,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_HPREC]
    },
    'proc:3': {
      id: BuffId['proc:3'],
      name: 'Gradual Heal',
      stat: UnitStat.hp,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_HPREC]
    },
    'proc:4:flat': {
      id: BuffId['proc:4:flat'],
      name: 'Burst BB Gauge Fill (Flat Amount)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBREC]
    },
    'proc:4:percent': {
      id: BuffId['proc:4:percent'],
      name: 'Burst BB Gauge Fill (Percentage)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBREC]
    }
  }), (() => {
    const createIconGetterForStat = stat => {
      return buff => {
        let element = '';
        let hasElement = false;
        let polarity = 'UP';

        if (buff) {
          if (buff.value && buff.value < 0) {
            polarity = 'DOWN';
          }

          if (buff.conditions && buff.conditions.targetElements) {
            element = buff.conditions.targetElements[0];
            hasElement = true;
          }
        }

        if (typeof element !== 'string') {
          element = '';
        }

        let iconKey = `BUFF_${element.toUpperCase()}${stat}${polarity}`;

        if (!element || !(iconKey in IconId)) {
          iconKey = `BUFF_${hasElement ? 'ELEMENT' : ''}${stat}${polarity}`;
        }

        return [IconId[iconKey]];
      };
    };

    return {
      'proc:5:atk': {
        id: BuffId['proc:5:atk'],
        name: 'Active Regular/Elemental Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('ATK')
      },
      'proc:5:def': {
        id: BuffId['proc:5:def'],
        name: 'Active Regular/Elemental Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('DEF')
      },
      'proc:5:rec': {
        id: BuffId['proc:5:rec'],
        name: 'Active Regular/Elemental Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('REC')
      },
      'proc:5:crit': {
        id: BuffId['proc:5:crit'],
        name: 'Active Regular/Elemental Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('CRTRATE')
      }
    };
  })()));
  /**
   * @description Get the associated metadata entry for a given buff ID.
   * @param id Buff ID to get metadata for.
   * @param metadata Optional source to use as metadata; defaults to internal buff metadata.
   * @returns Corresponding buff metadata entry if it exists, undefined otherwise.
   */

  function getMetadataForBuff(id, metadata = BUFF_METADATA) {
    return !!metadata && typeof metadata === 'object' && Object.hasOwnProperty.call(metadata, id) ? metadata[id] : void 0;
  }

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    convertProcEffectToBuffs: convertProcEffectToBuffs,
    convertPassiveEffectToBuffs: convertPassiveEffectToBuffs,

    get BuffSource() {
      return BuffSource;
    },

    get BuffStackType() {
      return BuffStackType;
    },

    BUFF_METADATA: BUFF_METADATA,
    getMetadataForBuff: getMetadataForBuff
  });
  var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    constants: constants,
    parsers: index$1,
    getMetadataForProc: getMetadataForProc,
    getMetadataForPassive: getMetadataForPassive,
    isAttackingProcId: isAttackingProcId,
    getNameForProc: getNameForProc,
    getNameForPassive: getNameForPassive,
    isProcEffect: isProcEffect,
    isPassiveEffect: isPassiveEffect,
    combineEffectsAndDamageFrames: combineEffectsAndDamageFrames,
    getEffectId: getEffectId,
    getEffectName: getEffectName,

    get ProcBuffType() {
      return ProcBuffType;
    },

    PASSIVE_METADATA: PASSIVE_METADATA,
    PROC_METADATA: PROC_METADATA
  });
  /**
   * @description Get the effects of a given extra skill.
   * @param skill Extra skill to get the effects of.
   * @returns Effects of the given extra skill if they exist, an empty array otherwise.
   */

  function getEffectsForExtraSkill(skill) {
    return skill && Array.isArray(skill.effects) ? skill.effects : [];
  }

  var index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForExtraSkill: getEffectsForExtraSkill
  });
  /**
   * @description Get the effects of a given item.
   * @param item Item to get the effects of, if any are present,
   * @returns Effects of the given item if they exist, an empty array otherwise.
   */

  function getEffectsForItem(item) {
    let result = [];

    if (item && item.effect) {
      if (Array.isArray(item.effect)) {
        result = item.effect;
      } else if (Array.isArray(item.effect.effect)) {
        const {
          effect,
          target_area: targetArea,
          target_type: targetType
        } = item.effect;
        result = effect.map(e => {
          // apply target data to each effect
          const fullProcEffect = Object.assign({}, e);
          fullProcEffect['target area'] = targetArea;
          fullProcEffect['target type'] = targetType;
          return fullProcEffect;
        });
      }
    }

    return result;
  }
  /**
   * @description Generate a URL to display the image with the given item thumbnail filename.
   * @param baseContentUrl Base URL of the server.
   * @param fileName Name of the file that represents the thumbnail image for a given item.
   * @returns Generated URL based on the given content URL and file name.
   */


  function getItemImageUrl(baseContentUrl, fileName) {
    return `${baseContentUrl || ''}/item/${fileName || ''}`;
  }

  var index$4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForItem: getEffectsForItem,
    getItemImageUrl: getItemImageUrl
  });
  /**
   * @description Get the effects of a given leader skill.
   * @param skill Leader skill to get the effects of.
   * @returns Effects of the given leader skill if they exist, an empty array otherwise.
   */

  function getEffectsForLeaderSkill(skill) {
    return skill && Array.isArray(skill.effects) ? skill.effects : [];
  }

  var index$5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForLeaderSkill: getEffectsForLeaderSkill
  });
  /**
   * @description Generate the file names for each of the image type for a given unit ID.
   * @param id Unit ID to use to generate the file names.
   * @param suffix Optional parameter that's useful for things like alternate art.
   * @returns Set of file names for each image type (spritesheet, battle avatar, guide avatar, full illustration).
   */

  function getUnitImageFileNames(id, suffix = '') {
    const fileNameSuffix = `${id || ''}${suffix || ''}.png`;
    return {
      spritesheet: `unit_anime_${fileNameSuffix}`,
      battleAvatar: `unit_ills_battle_${fileNameSuffix}`,
      guideAvatar: `unit_ills_thum_${fileNameSuffix}`,
      fullIllustration: `unit_ills_full_${fileNameSuffix}`
    };
  }
  /**
   * @description Generate a URL to display the image with the given unit filename.
   * @param baseContentUrl Base URL of the server.
   * @param fileName Name of the file that represents an image for a given unit.
   * @returns Generated URL based on the given content URL and file name.
   */


  function getUnitImageUrl(baseContentUrl, fileName) {
    return `${baseContentUrl || ''}/unit/img/${fileName || ''}`;
  }

  var index$6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getUnitImageFileNames: getUnitImageFileNames,
    getUnitImageUrl: getUnitImageUrl
  });
  /**
   * @description Get the effects of a given SP Enhancement Entry.
   * @param entry SP Enhancement Entry to get the effects of.
   * @returns Effects of the given SP Enhancement Entry if they exist, an empty array otherwise.
   */

  function getEffectsForSpEnhancement(entry) {
    const result = [];

    if (entry && entry.skill && Array.isArray(entry.skill.effects)) {
      const effectWrappers = entry.skill.effects;
      effectWrappers.forEach(effectWrapper => {
        Object.keys(effectWrapper).forEach(spType => {
          const originalEffect = effectWrapper[spType];
          const unwrappedEffect = Object.assign(Object.assign({}, originalEffect), {
            sp_type: spType
          });
          result.push(unwrappedEffect);
        });
      });
    }

    return result;
  }
  /**
   * @description Get the associated category name with a given category ID.
   * @param categoryId Category ID to get the name of.
   * @returns Name of the given category ID or the string 'Unknown'.
   */


  function getSpCategoryName(categoryId) {
    let result;
    const numericalCategoryId = +categoryId;

    switch (numericalCategoryId) {
      case 1:
        result = SpCategoryName['Parameter Boost'];
        break;

      case 2:
        result = SpCategoryName.Spark;
        break;

      case 3:
        result = SpCategoryName['Critical Hits'];
        break;

      case 4:
        result = SpCategoryName['Attack Boost'];
        break;

      case 5:
        result = SpCategoryName['BB Gauge'];
        break;

      case 6:
        result = SpCategoryName['HP Recovery'];
        break;

      case 7:
        result = SpCategoryName.Drops;
        break;

      case 8:
        result = SpCategoryName['Ailment Resistance'];
        break;

      case 9:
        result = SpCategoryName['Ailment Infliction'];
        break;

      case 10:
        result = SpCategoryName['Damage Reduction'];
        break;

      case 11:
        result = SpCategoryName.Special;
        break;

      default:
        result = SpCategoryName.Unknown;
        break;
    }

    return result;
  }
  /**
   * @ignore
   */


  const CHARACTER_CODE_FOR_UPPERCASE_A = 'A'.charCodeAt(0);
  /**
   * @ignore
   */

  const CHARACTER_CODE_FOR_LOWERCASE_A = 'a'.charCodeAt(0);
  /**
   * @ignore
   */

  const CHARACTER_CODE_FOR_NUMBER_0 = '0'.charCodeAt(0);
  /**
   * @description Get the corresponding character code for a given index.
   * It expects an index between 0 and 61 inclusive; will return an empty string if
   * the given value is outside of the range.
   * @param index Index of an SP entry in a given skills array.
   * @returns Corresponding single alphanumeric character to the given index
   * or an empty string if the index is invalid.
   */

  function spIndexToCode(index) {
    let result = '';
    let correspondingCharacterCode = -1;

    if (Number.isInteger(index)) {
      if (index >= 0 && index <= 25) {
        // A-Z
        correspondingCharacterCode = index + CHARACTER_CODE_FOR_UPPERCASE_A;
      } else if (index >= 26 && index <= 51) {
        // a-z
        correspondingCharacterCode = index - 26 + CHARACTER_CODE_FOR_LOWERCASE_A;
      } else if (index >= 52 && index <= 61) {
        // 0-9
        correspondingCharacterCode = index - 52 + CHARACTER_CODE_FOR_NUMBER_0;
      }
    }

    if (correspondingCharacterCode !== -1) {
      result = String.fromCharCode(correspondingCharacterCode);
    }

    return result;
  }
  /**
   * @description Get the corresponding index for a given character code.
   * It expects an alphanumeric character and will return -1 otherwise.
   * @param code Character code an SP entry in a given skills array.
   * @returns Corresponding index to the given character or -1 if the
   * character is invalid.
   */


  function spCodeToIndex(code) {
    let result = -1;
    let characterCodeOffset = -1;

    if (!!code && typeof code === 'string' && code.length === 1) {
      if (code >= 'A' && code <= 'Z') {
        characterCodeOffset = CHARACTER_CODE_FOR_UPPERCASE_A;
      } else if (code >= 'a' && code <= 'z') {
        characterCodeOffset = CHARACTER_CODE_FOR_LOWERCASE_A - 26;
      } else if (code >= '0' && code <= '9') {
        characterCodeOffset = CHARACTER_CODE_FOR_NUMBER_0 - 52;
      }
    }

    if (characterCodeOffset !== -1) {
      result = code.charCodeAt(0) - characterCodeOffset;
    }

    return result;
  }
  /**
   * @description Extract the ID of a string in the format of `number@actualId`. If there
   * is no value after the @ character or if no @ character is present, the original ID is returned.
   * This is particularly useful for extracting the ID of [[ISpEnhancementEntry.dependency|`ISpEnhancementEntry.dependency`]].
   * @param id Original SP Enhancement Entry ID.
   * @returns The ID of a string in the format of `number@actualId`, or the original input if
   * there is no @ character or no value after the @ character.
   */


  function getSpEntryId(id) {
    return typeof id === 'string' && id.split('@')[1] || id;
  }
  /**
   * @description Get the first SP Enhancement Entry that matches the given SP Entry ID, if it exists.
   * @param id SP Enhancement entry ID.
   * @param entries Collection of SP Enhancement entries to search in.
   * @returns Corresponding SP Enhancement entry with the given SP ID, undefined otherwise.
   */


  function getSpEntryWithId(id, entries) {
    const spId = getSpEntryId(id);
    return id && Array.isArray(entries) && entries.find(e => getSpEntryId(e && e.id) === spId) || void 0;
  }
  /**
   * @description Get all SP Enhancement entries that one would need to unlock the given SP entry.
   * @param entry SP Entry to get dependencies for.
   * @param allEntries Collection of SP Entries to search in.
   * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
   * @returns Collection of SP Enhancement entries (if any) that are required to unlock the given SP entry.
   */


  function getAllDependenciesForSpEntry(entry, allEntries, addedEntries = new Set()) {
    let dependencies = [];

    if (entry && entry.dependency && Array.isArray(allEntries) && allEntries.length > 0) {
      const dependencyId = getSpEntryId(entry.dependency);
      const dependencyEntry = allEntries.find(s => getSpEntryId(s && s.id) === dependencyId);

      if (dependencyEntry && !addedEntries.has(dependencyEntry)) {
        addedEntries.add(dependencyEntry);
        const subDependencies = getAllDependenciesForSpEntry(dependencyEntry, allEntries, addedEntries);
        dependencies = [dependencyEntry].concat(subDependencies);
      }
    }

    return dependencies;
  }
  /**
   * @description Get all SP Enhancement entries that require the given SP entry in order to be unlockable.
   * @param entry SP Entry to get dependents for.
   * @param allEntries Collection of SP Entries to search in.
   * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
   * @returns Collection of SP Enhancement entries (if any) that require the given SP entry in order to be unlockable.
   */


  function getAllEntriesThatDependOnSpEntry(entry, allEntries, addedEntries = new Set()) {
    let dependents = [];

    if (entry && entry.id && Array.isArray(allEntries) && allEntries.length > 0) {
      const entryId = entry.id;
      dependents = allEntries.filter(s => {
        return s.dependency && s.dependency.includes(entryId) && !addedEntries.has(s);
      });
      dependents.forEach(dependent => {
        addedEntries.add(dependent);
        const subDependents = getAllEntriesThatDependOnSpEntry(dependent, allEntries, addedEntries);
        dependents = dependents.concat(subDependents);
      });
    }

    return dependents;
  }

  var index$7 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForSpEnhancement: getEffectsForSpEnhancement,
    getSpCategoryName: getSpCategoryName,
    spIndexToCode: spIndexToCode,
    spCodeToIndex: spCodeToIndex,
    getSpEntryId: getSpEntryId,
    getSpEntryWithId: getSpEntryWithId,
    getAllDependenciesForSpEntry: getAllDependenciesForSpEntry,
    getAllEntriesThatDependOnSpEntry: getAllEntriesThatDependOnSpEntry
  });
  /* NOTE: this file is automatically generated; do not edit this file */

  var version = '0.7.0';
  exports.buffs = index$2;
  exports.bursts = index;
  exports.datamineTypes = datamineTypes;
  exports.extraSkills = index$3;
  exports.items = index$4;
  exports.leaderSkills = index$5;
  exports.spEnhancements = index$7;
  exports.units = index$6;
  exports.version = version;
  return exports;
}({});
//# sourceMappingURL=index.browser.js.map
