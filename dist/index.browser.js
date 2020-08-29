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

  var Ailment;

  (function (Ailment) {
    Ailment["Poison"] = "poison";
    Ailment["Weak"] = "weak";
    Ailment["Sick"] = "sick";
    Ailment["Injury"] = "injury";
    Ailment["Curse"] = "curse";
    Ailment["Paralysis"] = "paralysis";
    Ailment["AttackReduction"] = "atk down";
    Ailment["DefenseReduction"] = "def down";
    Ailment["RecoveryReduction"] = "rec down";
    Ailment["Unknown"] = "unknown";
  })(Ailment || (Ailment = {}));

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

    get Ailment() {
      return Ailment;
    },

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
    UnitStat["hpRecovery"] = "hpRecovery";
    UnitStat["bbGauge"] = "bbGauge";
    UnitStat["odGauge"] = "odGauge";
    UnitStat["bcDropRate"] = "bcDropRate";
    UnitStat["hcDropRate"] = "hcDropRate";
    UnitStat["itemDropRate"] = "itemDropRate";
    UnitStat["zelDropRate"] = "zelDropRate";
    UnitStat["karmaDropRate"] = "karmaDropRate";
    UnitStat["bcEfficacy"] = "bcEfficacy";
    UnitStat["hcEfficacy"] = "hcEfficacy";
    UnitStat["poisonResist"] = "poisonResist";
    UnitStat["weakResist"] = "weakResist";
    UnitStat["sickResist"] = "sickResist";
    UnitStat["injuryResist"] = "injuryResist";
    UnitStat["curseResist"] = "curseResist";
    UnitStat["paralysisResist"] = "paralysisResist";
    UnitStat["poisonInflict"] = "poisonInflict";
    UnitStat["weakInflict"] = "weakInflict";
    UnitStat["sickInflict"] = "sickInflict";
    UnitStat["injuryInflict"] = "injuryInflict";
    UnitStat["curseInflict"] = "curseInflict";
    UnitStat["paralysisInflict"] = "paralysisInflict";
    UnitStat["atkDownResist"] = "atkDownResist";
    UnitStat["defDownResist"] = "defDownResist";
    UnitStat["recDownResist"] = "recDownResist";
    UnitStat["atkDownInflict"] = "atkDownInflict";
    UnitStat["defDownInflict"] = "defDownInflict";
    UnitStat["recDownInflict"] = "recDownInflict";
    UnitStat["mitigation"] = "mitigation";
    UnitStat["fireMitigation"] = "fireMitigation";
    UnitStat["waterMitigation"] = "waterMitigation";
    UnitStat["earthMitigation"] = "earthMitigation";
    UnitStat["thunderMitigation"] = "thunderMitigation";
    UnitStat["lightMitigation"] = "lightMitigation";
    UnitStat["darkMitigation"] = "darkMitigation";
    UnitStat["reduceDamageToOne"] = "reduceDamageToOne";
    UnitStat["turnDurationModification"] = "turnDurationModification";
    UnitStat["koResistance"] = "koResistance";
    UnitStat["revive"] = "revive";
    UnitStat["defenseIgnore"] = "defenseIgnore";
    UnitStat["criticalDamage"] = "criticalDamage";
    UnitStat["sparkDamage"] = "sparkDamage";
    UnitStat["hitCountModification"] = "hitCountModification";
    UnitStat["damageReflect"] = "damageReflect";
    UnitStat["targetingModification"] = "targetingModification";
    UnitStat["elementModification"] = "elementModification";
    UnitStat["buffStabilityModification"] = "buffStabilityModification";
    UnitStat["extraAction"] = "extraAction";
    UnitStat["damageOverTime"] = "damageOverTime";
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
    IconId["BUFF_HPTHRESHATKUP"] = "BUFF_HPTHRESHATKUP";
    IconId["BUFF_HPTHRESHATKDOWN"] = "BUFF_HPTHRESHATKDOWN";
    IconId["BUFF_HPTHRESHDEFUP"] = "BUFF_HPTHRESHDEFUP";
    IconId["BUFF_HPTHRESHDEFDOWN"] = "BUFF_HPTHRESHDEFDOWN";
    IconId["BUFF_HPTHRESHRECUP"] = "BUFF_HPTHRESHRECUP";
    IconId["BUFF_HPTHRESHRECDOWN"] = "BUFF_HPTHRESHRECDOWN";
    IconId["BUFF_HPTHRESHCRTRATEUP"] = "BUFF_HPTHRESHCRTRATEUP";
    IconId["BUFF_HPTHRESHCRTRATEDOWN"] = "BUFF_HPTHRESHCRTRATEDOWN";
    IconId["BUFF_BBGAUGETHRESHATKUP"] = "BUFF_BBGAUGETHRESHATKUP";
    IconId["BUFF_BBGAUGETHRESHATKDOWN"] = "BUFF_BBGAUGETHRESHATKDOWN";
    IconId["BUFF_BBGAUGETHRESHDEFUP"] = "BUFF_BBGAUGETHRESHDEFUP";
    IconId["BUFF_BBGAUGETHRESHDEFDOWN"] = "BUFF_BBGAUGETHRESHDEFDOWN";
    IconId["BUFF_BBGAUGETHRESHRECUP"] = "BUFF_BBGAUGETHRESHRECUP";
    IconId["BUFF_BBGAUGETHRESHRECDOWN"] = "BUFF_BBGAUGETHRESHRECDOWN";
    IconId["BUFF_BBGAUGETHRESHCRTRATEUP"] = "BUFF_BBGAUGETHRESHCRTRATEUP";
    IconId["BUFF_BBGAUGETHRESHCRTRATEDOWN"] = "BUFF_BBGAUGETHRESHCRTRATEDOWN";
    IconId["BUFF_HPREC"] = "BUFF_HPREC";
    IconId["BUFF_BBREC"] = "BUFF_BBREC";
    IconId["BUFF_DAMAGEBB"] = "BUFF_DAMAGEBB";
    IconId["BUFF_BEENATK_HPREC"] = "BUFF_BEENATK_HPREC";
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
    IconId["BUFF_UNIQUEELEMENTHPUP"] = "BUFF_UNIQUEELEMENTHPUP";
    IconId["BUFF_UNIQUEELEMENTHPDOWN"] = "BUFF_UNIQUEELEMENTHPDOWN";
    IconId["BUFF_UNIQUEELEMENTATKUP"] = "BUFF_UNIQUEELEMENTATKUP";
    IconId["BUFF_UNIQUEELEMENTATKDOWN"] = "BUFF_UNIQUEELEMENTATKDOWN";
    IconId["BUFF_UNIQUEELEMENTDEFUP"] = "BUFF_UNIQUEELEMENTDEFUP";
    IconId["BUFF_UNIQUEELEMENTDEFDOWN"] = "BUFF_UNIQUEELEMENTDEFDOWN";
    IconId["BUFF_UNIQUEELEMENTRECUP"] = "BUFF_UNIQUEELEMENTRECUP";
    IconId["BUFF_UNIQUEELEMENTRECDOWN"] = "BUFF_UNIQUEELEMENTRECDOWN";
    IconId["BUFF_UNIQUEELEMENTCRTRATEUP"] = "BUFF_UNIQUEELEMENTCRTRATEUP";
    IconId["BUFF_UNIQUEELEMENTCRTRATEDOWN"] = "BUFF_UNIQUEELEMENTCRTRATEDOWN";
    IconId["BUFF_MALEHPUP"] = "BUFF_MALEHPUP";
    IconId["BUFF_MALEHPDOWN"] = "BUFF_MALEHPDOWN";
    IconId["BUFF_MALEATKUP"] = "BUFF_MALEATKUP";
    IconId["BUFF_MALEATKDOWN"] = "BUFF_MALEATKDOWN";
    IconId["BUFF_MALEDEFUP"] = "BUFF_MALEDEFUP";
    IconId["BUFF_MALEDEFDOWN"] = "BUFF_MALEDEFDOWN";
    IconId["BUFF_MALERECUP"] = "BUFF_MALERECUP";
    IconId["BUFF_MALERECDOWN"] = "BUFF_MALERECDOWN";
    IconId["BUFF_MALECRTRATEUP"] = "BUFF_MALECRTRATEUP";
    IconId["BUFF_MALECRTRATEDOWN"] = "BUFF_MALECRTRATEDOWN";
    IconId["BUFF_FEMALEHPUP"] = "BUFF_FEMALEHPUP";
    IconId["BUFF_FEMALEHPDOWN"] = "BUFF_FEMALEHPDOWN";
    IconId["BUFF_FEMALEATKUP"] = "BUFF_FEMALEATKUP";
    IconId["BUFF_FEMALEATKDOWN"] = "BUFF_FEMALEATKDOWN";
    IconId["BUFF_FEMALEDEFUP"] = "BUFF_FEMALEDEFUP";
    IconId["BUFF_FEMALEDEFDOWN"] = "BUFF_FEMALEDEFDOWN";
    IconId["BUFF_FEMALERECUP"] = "BUFF_FEMALERECUP";
    IconId["BUFF_FEMALERECDOWN"] = "BUFF_FEMALERECDOWN";
    IconId["BUFF_FEMALECRTRATEUP"] = "BUFF_FEMALECRTRATEUP";
    IconId["BUFF_FEMALECRTRATEDOWN"] = "BUFF_FEMALECRTRATEDOWN";
    IconId["BUFF_OTHERHPUP"] = "BUFF_OTHERHPUP";
    IconId["BUFF_OTHERHPDOWN"] = "BUFF_OTHERHPDOWN";
    IconId["BUFF_OTHERATKUP"] = "BUFF_OTHERATKUP";
    IconId["BUFF_OTHERATKDOWN"] = "BUFF_OTHERATKDOWN";
    IconId["BUFF_OTHERDEFUP"] = "BUFF_OTHERDEFUP";
    IconId["BUFF_OTHERDEFDOWN"] = "BUFF_OTHERDEFDOWN";
    IconId["BUFF_OTHERRECUP"] = "BUFF_OTHERRECUP";
    IconId["BUFF_OTHERRECDOWN"] = "BUFF_OTHERRECDOWN";
    IconId["BUFF_OTHERCRTRATEUP"] = "BUFF_OTHERCRTRATEUP";
    IconId["BUFF_OTHERCRTRATEDOWN"] = "BUFF_OTHERCRTRATEDOWN";
    IconId["BUFF_GENDERHPUP"] = "BUFF_GENDERHPUP";
    IconId["BUFF_GENDERHPDOWN"] = "BUFF_GENDERHPDOWN";
    IconId["BUFF_GENDERATKUP"] = "BUFF_GENDERATKUP";
    IconId["BUFF_GENDERATKDOWN"] = "BUFF_GENDERATKDOWN";
    IconId["BUFF_GENDERDEFUP"] = "BUFF_GENDERDEFUP";
    IconId["BUFF_GENDERDEFDOWN"] = "BUFF_GENDERDEFDOWN";
    IconId["BUFF_GENDERRECUP"] = "BUFF_GENDERRECUP";
    IconId["BUFF_GENDERRECDOWN"] = "BUFF_GENDERRECDOWN";
    IconId["BUFF_GENDERCRTRATEUP"] = "BUFF_GENDERCRTRATEUP";
    IconId["BUFF_GENDERCRTRATEDOWN"] = "BUFF_GENDERCRTRATEDOWN";
    IconId["BUFF_CONVERTATKUP"] = "BUFF_CONVERTATKUP";
    IconId["BUFF_CONVERTATKDOWN"] = "BUFF_CONVERTATKDOWN";
    IconId["BUFF_CONVERTDEFUP"] = "BUFF_CONVERTDEFUP";
    IconId["BUFF_CONVERTDEFDOWN"] = "BUFF_CONVERTDEFDOWN";
    IconId["BUFF_CONVERTRECUP"] = "BUFF_CONVERTRECUP";
    IconId["BUFF_CONVERTRECDOWN"] = "BUFF_CONVERTRECDOWN";
    IconId["BUFF_POISONBLK"] = "BUFF_POISONBLK";
    IconId["BUFF_WEAKBLK"] = "BUFF_WEAKBLK";
    IconId["BUFF_SICKBLK"] = "BUFF_SICKBLK";
    IconId["BUFF_INJURYBLK"] = "BUFF_INJURYBLK";
    IconId["BUFF_CURSEBLK"] = "BUFF_CURSEBLK";
    IconId["BUFF_PARALYSISBLK"] = "BUFF_PARALYSISBLK";
    IconId["BUFF_ATKDOWNBLK"] = "BUFF_ATKDOWNBLK";
    IconId["BUFF_DEFDOWNBLK"] = "BUFF_DEFDOWNBLK";
    IconId["BUFF_RECDOWNBLK"] = "BUFF_RECDOWNBLK";
    IconId["BUFF_AILMENTBLK"] = "BUFF_AILMENTBLK";
    IconId["DEBUFF_POISON"] = "DEBUFF_POISON";
    IconId["DEBUFF_WEAK"] = "DEBUFF_WEAK";
    IconId["DEBUFF_SICK"] = "DEBUFF_SICK";
    IconId["DEBUFF_INJURY"] = "DEBUFF_INJURY";
    IconId["DEBUFF_CURSE"] = "DEBUFF_CURSE";
    IconId["DEBUFF_PARALYSIS"] = "DEBUFF_PARALYSIS";
    IconId["DEBUFF_AILMENT"] = "DEBUFF_AILMENT";
    IconId["BUFF_ADDPOISON"] = "BUFF_ADDPOISON";
    IconId["BUFF_ADDWEAK"] = "BUFF_ADDWEAK";
    IconId["BUFF_ADDSICK"] = "BUFF_ADDSICK";
    IconId["BUFF_ADDINJURY"] = "BUFF_ADDINJURY";
    IconId["BUFF_ADDCURSE"] = "BUFF_ADDCURSE";
    IconId["BUFF_ADDPARA"] = "BUFF_ADDPARA";
    IconId["BUFF_ADDAILMENT"] = "BUFF_ADDAILMENT";
    IconId["BUFF_ADDATKDOWN"] = "BUFF_ADDATKDOWN";
    IconId["BUFF_ADDDEFDOWN"] = "BUFF_ADDDEFDOWN";
    IconId["BUFF_ADDRECDOWN"] = "BUFF_ADDRECDOWN";
    IconId["BUFF_DAMAGECUT"] = "BUFF_DAMAGECUT";
    IconId["BUFF_DAMAGECUTTOONE"] = "BUFF_DAMAGECUTTOONE";
    IconId["BUFF_FIREDMGDOWN"] = "BUFF_FIREDMGDOWN";
    IconId["BUFF_WATERDMGDOWN"] = "BUFF_WATERDMGDOWN";
    IconId["BUFF_EARTHDMGDOWN"] = "BUFF_EARTHDMGDOWN";
    IconId["BUFF_THUNDERDMGDOWN"] = "BUFF_THUNDERDMGDOWN";
    IconId["BUFF_LIGHTDMGDOWN"] = "BUFF_LIGHTDMGDOWN";
    IconId["BUFF_DARKDMGDOWN"] = "BUFF_DARKDMGDOWN";
    IconId["BUFF_ELEMENTDMGDOWN"] = "BUFF_ELEMENTDMGDOWN";
    IconId["BUFF_HCDROP"] = "BUFF_HCDROP";
    IconId["BUFF_HCDOWN"] = "BUFF_HCDOWN";
    IconId["BUFF_BCDROP"] = "BUFF_BCDROP";
    IconId["BUFF_BCDOWN"] = "BUFF_BCDOWN";
    IconId["BUFF_ITEMDROP"] = "BUFF_ITEMDROP";
    IconId["BUFF_ITEMDOWN"] = "BUFF_ITEMDOWN";
    IconId["BUFF_ZELDROP"] = "BUFF_ZELDROP";
    IconId["BUFF_ZELDOWN"] = "BUFF_ZELDOWN";
    IconId["BUFF_KARMADROP"] = "BUFF_KARMADROP";
    IconId["BUFF_KARMADOWN"] = "BUFF_KARMADOWN";
    IconId["BUFF_HPTHRESHHCDROP"] = "BUFF_HPTHRESHHCDROP";
    IconId["BUFF_HPTHRESHHCDOWN"] = "BUFF_HPTHRESHHCDOWN";
    IconId["BUFF_HPTHRESHBCDROP"] = "BUFF_HPTHRESHBCDROP";
    IconId["BUFF_HPTHRESHBCDOWN"] = "BUFF_HPTHRESHBCDOWN";
    IconId["BUFF_HPTHRESHITEMDROP"] = "BUFF_HPTHRESHITEMDROP";
    IconId["BUFF_HPTHRESHITEMDOWN"] = "BUFF_HPTHRESHITEMDOWN";
    IconId["BUFF_HPTHRESHZELDROP"] = "BUFF_HPTHRESHZELDROP";
    IconId["BUFF_HPTHRESHZELDOWN"] = "BUFF_HPTHRESHZELDOWN";
    IconId["BUFF_HPTHRESHKARMADROP"] = "BUFF_HPTHRESHKARMADROP";
    IconId["BUFF_HPTHRESHKARMADOWN"] = "BUFF_HPTHRESHKARMADOWN";
    IconId["BUFF_BBFILL"] = "BUFF_BBFILL";
    IconId["BUFF_BBFILLDOWN"] = "BUFF_BBFILLDOWN";
    IconId["BUFF_HCREC"] = "BUFF_HCREC";
    IconId["BUFF_KOBLK"] = "BUFF_KOBLK";
    IconId["BUFF_HPABS"] = "BUFF_HPABS";
    IconId["BUFF_IGNOREDEF"] = "BUFF_IGNOREDEF";
    IconId["BUFF_CRTUP"] = "BUFF_CRTUP";
    IconId["BUFF_SPARKUP"] = "BUFF_SPARKUP";
    IconId["BUFF_SPARKDOWN"] = "BUFF_SPARKDOWN";
    IconId["BUFF_SPARKHC"] = "BUFF_SPARKHC";
    IconId["BUFF_SPARKBC"] = "BUFF_SPARKBC";
    IconId["BUFF_SPARKITEM"] = "BUFF_SPARKITEM";
    IconId["BUFF_SPARKZEL"] = "BUFF_SPARKZEL";
    IconId["BUFF_SPARKKARMA"] = "BUFF_SPARKKARMA";
    IconId["BUFF_HITUP"] = "BUFF_HITUP";
    IconId["BUFF_COUNTERDAMAGE"] = "BUFF_COUNTERDAMAGE";
    IconId["BUFF_GETENEATT"] = "BUFF_GETENEATT";
    IconId["BUFF_REPENEATT"] = "BUFF_REPENEATT";
    IconId["BUFF_HPTHRESHGETENEATT"] = "BUFF_HPTHRESHGETENEATT";
    IconId["BUFF_HPTHRESHREPENEATT"] = "BUFF_HPTHRESHREPENEATT";
    IconId["BUFF_ADDFIRE"] = "BUFF_ADDFIRE";
    IconId["BUFF_ADDWATER"] = "BUFF_ADDWATER";
    IconId["BUFF_ADDEARTH"] = "BUFF_ADDEARTH";
    IconId["BUFF_ADDTHUNDER"] = "BUFF_ADDTHUNDER";
    IconId["BUFF_ADDLIGHT"] = "BUFF_ADDLIGHT";
    IconId["BUFF_ADDDARK"] = "BUFF_ADDDARK";
    IconId["BUFF_ADDELEMENT"] = "BUFF_ADDELEMENT";
    IconId["BUFF_SHIFTFIRE"] = "BUFF_SHIFTFIRE";
    IconId["BUFF_SHIFTWATER"] = "BUFF_SHIFTWATER";
    IconId["BUFF_SHIFTEARTH"] = "BUFF_SHIFTEARTH";
    IconId["BUFF_SHIFTTHUNDER"] = "BUFF_SHIFTTHUNDER";
    IconId["BUFF_SHIFTLIGHT"] = "BUFF_SHIFTLIGHT";
    IconId["BUFF_SHIFTDARK"] = "BUFF_SHIFTDARK";
    IconId["BUFF_SHIFTELEMENT"] = "BUFF_SHIFTELEMENT";
    IconId["BUFF_REMOVEBUFF"] = "BUFF_REMOVEBUFF";
    IconId["BUFF_DISABLELS"] = "BUFF_DISABLELS";
    IconId["BUFF_SUMMONUNIT"] = "BUFF_SUMMONUNIT";
    IconId["BUFF_DBLSTRIKE"] = "BUFF_DBLSTRIKE";
    IconId["BUFF_OVERDRIVEUP"] = "BUFF_OVERDRIVEUP";
    IconId["BUFF_TURNDMG"] = "BUFF_TURNDMG";
    IconId["ATK_ST"] = "ATK_ST";
    IconId["ATK_AOE"] = "ATK_AOE";
    IconId["ATK_RT"] = "ATK_RT";
    IconId["ATK_ST_HPREC"] = "ATK_ST_HPREC";
    IconId["ATK_AOE_HPREC"] = "ATK_AOE_HPREC";
    IconId["ATK_ST_PROPORTIONAL"] = "ATK_ST_PROPORTIONAL";
    IconId["ATK_AOE_PROPORTIONAL"] = "ATK_AOE_PROPORTIONAL";
    IconId["ATK_ST_FIXED"] = "ATK_ST_FIXED";
    IconId["ATK_AOE_FIXED"] = "ATK_AOE_FIXED";
    IconId["ATK_ST_MULTIELEMENT"] = "ATK_ST_MULTIELEMENT";
    IconId["ATK_AOE_MULTIELEMENT"] = "ATK_AOE_MULTIELEMENT";
    IconId["ATK_ST_SACRIFICIAL"] = "ATK_ST_SACRIFICIAL";
    IconId["ATK_AOE_SACRIFICIAL"] = "ATK_AOE_SACRIFICIAL";
  })(IconId || (IconId = {}));
  /**
   * @description Format of these IDs are `<passive|proc>:<original effect ID>:<stat>`.
   * Usage of passive/proc and original effect ID are for easy tracking of the original effect
   * source of a given buff.
   */


  var BuffId;

  (function (BuffId) {
    BuffId["TURN_DURATION_MODIFICATION"] = "TURN_DURATION_MODIFICATION";
    BuffId["NO_PARAMS_SPECIFIED"] = "NO_PARAMS_SPECIFIED";
    BuffId["UNKNOWN_PASSIVE_EFFECT_ID"] = "UNKNOWN_PASSIVE_EFFECT_ID";
    BuffId["UNKNOWN_PASSIVE_BUFF_PARAMS"] = "UNKNOWN_PASSIVE_BUFF_PARAMS";
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
    BuffId["passive:8"] = "passive:8";
    BuffId["passive:9"] = "passive:9";
    BuffId["passive:10"] = "passive:10";
    BuffId["passive:11:atk"] = "passive:11:atk";
    BuffId["passive:11:def"] = "passive:11:def";
    BuffId["passive:11:rec"] = "passive:11:rec";
    BuffId["passive:11:crit"] = "passive:11:crit";
    BuffId["passive:12:bc"] = "passive:12:bc";
    BuffId["passive:12:hc"] = "passive:12:hc";
    BuffId["passive:12:item"] = "passive:12:item";
    BuffId["passive:12:zel"] = "passive:12:zel";
    BuffId["passive:12:karma"] = "passive:12:karma";
    BuffId["passive:13"] = "passive:13";
    BuffId["passive:14"] = "passive:14";
    BuffId["passive:15"] = "passive:15";
    BuffId["passive:16"] = "passive:16";
    BuffId["passive:17"] = "passive:17";
    BuffId["passive:19:bc"] = "passive:19:bc";
    BuffId["passive:19:hc"] = "passive:19:hc";
    BuffId["passive:19:item"] = "passive:19:item";
    BuffId["passive:19:zel"] = "passive:19:zel";
    BuffId["passive:19:karma"] = "passive:19:karma";
    BuffId["passive:20:poison"] = "passive:20:poison";
    BuffId["passive:20:weak"] = "passive:20:weak";
    BuffId["passive:20:sick"] = "passive:20:sick";
    BuffId["passive:20:injury"] = "passive:20:injury";
    BuffId["passive:20:curse"] = "passive:20:curse";
    BuffId["passive:20:paralysis"] = "passive:20:paralysis";
    BuffId["passive:20:atk down"] = "passive:20:atk down";
    BuffId["passive:20:def down"] = "passive:20:def down";
    BuffId["passive:20:rec down"] = "passive:20:rec down";
    BuffId["passive:20:unknown"] = "passive:20:unknown";
    BuffId["passive:21:atk"] = "passive:21:atk";
    BuffId["passive:21:def"] = "passive:21:def";
    BuffId["passive:21:rec"] = "passive:21:rec";
    BuffId["passive:21:crit"] = "passive:21:crit";
    BuffId["passive:23"] = "passive:23";
    BuffId["passive:24"] = "passive:24";
    BuffId["passive:25"] = "passive:25";
    BuffId["passive:26"] = "passive:26";
    BuffId["passive:27"] = "passive:27";
    BuffId["passive:28"] = "passive:28";
    BuffId["passive:29"] = "passive:29";
    BuffId["passive:30:atk"] = "passive:30:atk";
    BuffId["passive:30:def"] = "passive:30:def";
    BuffId["passive:30:rec"] = "passive:30:rec";
    BuffId["passive:30:crit"] = "passive:30:crit";
    BuffId["passive:31:damage"] = "passive:31:damage";
    BuffId["passive:31:bc"] = "passive:31:bc";
    BuffId["passive:31:hc"] = "passive:31:hc";
    BuffId["passive:31:item"] = "passive:31:item";
    BuffId["passive:31:zel"] = "passive:31:zel";
    BuffId["passive:31:karma"] = "passive:31:karma";
    BuffId["passive:32"] = "passive:32";
    BuffId["passive:33"] = "passive:33";
    BuffId["passive:34"] = "passive:34";
    BuffId["passive:35"] = "passive:35";
    BuffId["passive:36"] = "passive:36";
    BuffId["passive:37"] = "passive:37";
    BuffId["passive:40:atk"] = "passive:40:atk";
    BuffId["passive:40:def"] = "passive:40:def";
    BuffId["passive:40:rec"] = "passive:40:rec";
    BuffId["passive:41:hp"] = "passive:41:hp";
    BuffId["passive:41:atk"] = "passive:41:atk";
    BuffId["passive:41:def"] = "passive:41:def";
    BuffId["passive:41:rec"] = "passive:41:rec";
    BuffId["passive:41:crit"] = "passive:41:crit";
    BuffId["passive:42:hp"] = "passive:42:hp";
    BuffId["passive:42:atk"] = "passive:42:atk";
    BuffId["passive:42:def"] = "passive:42:def";
    BuffId["passive:42:rec"] = "passive:42:rec";
    BuffId["passive:42:crit"] = "passive:42:crit";
    BuffId["passive:43"] = "passive:43";
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
    BuffId["proc:6:bc"] = "proc:6:bc";
    BuffId["proc:6:hc"] = "proc:6:hc";
    BuffId["proc:6:item"] = "proc:6:item";
    BuffId["proc:7"] = "proc:7";
    BuffId["proc:8:flat"] = "proc:8:flat";
    BuffId["proc:8:percent"] = "proc:8:percent";
    BuffId["proc:9:atk"] = "proc:9:atk";
    BuffId["proc:9:def"] = "proc:9:def";
    BuffId["proc:9:rec"] = "proc:9:rec";
    BuffId["proc:9:unknown"] = "proc:9:unknown";
    BuffId["proc:10:poison"] = "proc:10:poison";
    BuffId["proc:10:weak"] = "proc:10:weak";
    BuffId["proc:10:sick"] = "proc:10:sick";
    BuffId["proc:10:injury"] = "proc:10:injury";
    BuffId["proc:10:curse"] = "proc:10:curse";
    BuffId["proc:10:paralysis"] = "proc:10:paralysis";
    BuffId["proc:10:atk down"] = "proc:10:atk down";
    BuffId["proc:10:def down"] = "proc:10:def down";
    BuffId["proc:10:rec down"] = "proc:10:rec down";
    BuffId["proc:10:unknown"] = "proc:10:unknown";
    BuffId["proc:11:poison"] = "proc:11:poison";
    BuffId["proc:11:weak"] = "proc:11:weak";
    BuffId["proc:11:sick"] = "proc:11:sick";
    BuffId["proc:11:injury"] = "proc:11:injury";
    BuffId["proc:11:curse"] = "proc:11:curse";
    BuffId["proc:11:paralysis"] = "proc:11:paralysis";
    BuffId["proc:11:atk down"] = "proc:11:atk down";
    BuffId["proc:11:def down"] = "proc:11:def down";
    BuffId["proc:11:rec down"] = "proc:11:rec down";
    BuffId["proc:11:unknown"] = "proc:11:unknown";
    BuffId["proc:12"] = "proc:12";
    BuffId["proc:13"] = "proc:13";
    BuffId["proc:14"] = "proc:14";
    BuffId["proc:16:fire"] = "proc:16:fire";
    BuffId["proc:16:water"] = "proc:16:water";
    BuffId["proc:16:earth"] = "proc:16:earth";
    BuffId["proc:16:thunder"] = "proc:16:thunder";
    BuffId["proc:16:light"] = "proc:16:light";
    BuffId["proc:16:dark"] = "proc:16:dark";
    BuffId["proc:16:all"] = "proc:16:all";
    BuffId["proc:16:unknown"] = "proc:16:unknown";
    BuffId["proc:17:poison"] = "proc:17:poison";
    BuffId["proc:17:weak"] = "proc:17:weak";
    BuffId["proc:17:sick"] = "proc:17:sick";
    BuffId["proc:17:injury"] = "proc:17:injury";
    BuffId["proc:17:curse"] = "proc:17:curse";
    BuffId["proc:17:paralysis"] = "proc:17:paralysis";
    BuffId["proc:18"] = "proc:18";
    BuffId["proc:19"] = "proc:19";
    BuffId["proc:20"] = "proc:20";
    BuffId["proc:22"] = "proc:22";
    BuffId["proc:23"] = "proc:23";
    BuffId["proc:24:atk"] = "proc:24:atk";
    BuffId["proc:24:def"] = "proc:24:def";
    BuffId["proc:24:rec"] = "proc:24:rec";
    BuffId["proc:26"] = "proc:26";
    BuffId["proc:27"] = "proc:27";
    BuffId["proc:28"] = "proc:28";
    BuffId["proc:29"] = "proc:29";
    BuffId["proc:30:fire"] = "proc:30:fire";
    BuffId["proc:30:water"] = "proc:30:water";
    BuffId["proc:30:earth"] = "proc:30:earth";
    BuffId["proc:30:thunder"] = "proc:30:thunder";
    BuffId["proc:30:light"] = "proc:30:light";
    BuffId["proc:30:dark"] = "proc:30:dark";
    BuffId["proc:30:unknown"] = "proc:30:unknown";
    BuffId["proc:31:flat"] = "proc:31:flat";
    BuffId["proc:31:percent"] = "proc:31:percent";
    BuffId["proc:32:fire"] = "proc:32:fire";
    BuffId["proc:32:water"] = "proc:32:water";
    BuffId["proc:32:earth"] = "proc:32:earth";
    BuffId["proc:32:thunder"] = "proc:32:thunder";
    BuffId["proc:32:light"] = "proc:32:light";
    BuffId["proc:32:dark"] = "proc:32:dark";
    BuffId["proc:32:unknown"] = "proc:32:unknown";
    BuffId["proc:33"] = "proc:33";
    BuffId["proc:34:flat"] = "proc:34:flat";
    BuffId["proc:34:percent"] = "proc:34:percent";
    BuffId["proc:36"] = "proc:36";
    BuffId["proc:37"] = "proc:37";
    BuffId["proc:38:poison"] = "proc:38:poison";
    BuffId["proc:38:weak"] = "proc:38:weak";
    BuffId["proc:38:sick"] = "proc:38:sick";
    BuffId["proc:38:injury"] = "proc:38:injury";
    BuffId["proc:38:curse"] = "proc:38:curse";
    BuffId["proc:38:paralysis"] = "proc:38:paralysis";
    BuffId["proc:38:atk down"] = "proc:38:atk down";
    BuffId["proc:38:def down"] = "proc:38:def down";
    BuffId["proc:38:rec down"] = "proc:38:rec down";
    BuffId["proc:38:unknown"] = "proc:38:unknown";
    BuffId["proc:39:fire"] = "proc:39:fire";
    BuffId["proc:39:water"] = "proc:39:water";
    BuffId["proc:39:earth"] = "proc:39:earth";
    BuffId["proc:39:thunder"] = "proc:39:thunder";
    BuffId["proc:39:light"] = "proc:39:light";
    BuffId["proc:39:dark"] = "proc:39:dark";
    BuffId["proc:39:unknown"] = "proc:39:unknown";
    BuffId["proc:40:poison"] = "proc:40:poison";
    BuffId["proc:40:weak"] = "proc:40:weak";
    BuffId["proc:40:sick"] = "proc:40:sick";
    BuffId["proc:40:injury"] = "proc:40:injury";
    BuffId["proc:40:curse"] = "proc:40:curse";
    BuffId["proc:40:paralysis"] = "proc:40:paralysis";
    BuffId["proc:40:atk down"] = "proc:40:atk down";
    BuffId["proc:40:def down"] = "proc:40:def down";
    BuffId["proc:40:rec down"] = "proc:40:rec down";
    BuffId["proc:40:unknown"] = "proc:40:unknown";
    BuffId["proc:42"] = "proc:42";
    BuffId["proc:43"] = "proc:43";
    BuffId["proc:44"] = "proc:44";
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
    let hasValue = false;
    const result = params.reduce((acc, value, index) => {
      if (value && value !== '0') {
        acc[`param_${startIndex + index}`] = value;
        hasValue = true;
      }

      return acc;
    }, {});
    return hasValue ? result : void 0;
  }
  /**
   * @description Decide whether a given source value is one of the burst types in {@link BuffSource}.
   * @param source Source value to check.
   * @returns Whether the given source value is a burst type. Returns true when the source is determined to
   * be any one of the following: brave burst, super brave burst, ultimate brave burst, bonded brave burst,
   * bonded super brave burst, or bonded dual brave burst.
   */


  function buffSourceIsBurstType(source) {
    return !!source && [BuffSource.BraveBurst, BuffSource.SuperBraveBurst, BuffSource.UltimateBraveBurst, BuffSource.BondedBraveBurst, BuffSource.BondedSuperBraveBurst, BuffSource.DualBraveBurst].includes(source);
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
    const UNKNOWN_PROC_PARAM_EFFECT_KEY = 'unknown proc param';
    const ELEMENT_MAPPING = {
      0: BuffConditionElement.All,
      1: UnitElement.Fire,
      2: UnitElement.Water,
      3: UnitElement.Earth,
      4: UnitElement.Thunder,
      5: UnitElement.Light,
      6: UnitElement.Dark
    };
    const AILMENT_MAPPING = {
      1: Ailment.Poison,
      2: Ailment.Weak,
      3: Ailment.Sick,
      4: Ailment.Injury,
      5: Ailment.Curse,
      6: Ailment.Paralysis,
      7: Ailment.AttackReduction,
      8: Ailment.DefenseReduction,
      9: Ailment.RecoveryReduction
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
    }; // Disable rule as this function is only called once it's confirmed that `effect.params` exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion


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

    const createNoParamsEntry = ({
      originalId,
      sources
    }) => ({
      id: BuffId.NO_PARAMS_SPECIFIED,
      originalId,
      sources
    });
    /**
     * @description Common checks that are run for most effects after the params have been parsed
     * into an array of {@link IBuff} but before said array is returned.
     * @param results List of buffs from the given effect.
     * @param unknownParams Any unknown parameters from the given effect.
     * @param parsingContext Extra metadata extracted from the given effect.
     * @returns {undefined} No value is returned, but it does update the `results` array.
     */


    const handlePostParse = (results, unknownParams, {
      originalId,
      sources,
      targetData,
      effectDelay
    }) => {
      if (results.length === 0) {
        results.push(createNoParamsEntry({
          originalId,
          sources
        }));
      }

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId,
          sources,
          targetData,
          effectDelay
        }));
      }
    };

    const createUnknownParamsEntryFromExtraParams = (extraParams, startIndex, injectionContext) => {
      let unknownParams;

      if (extraParams && extraParams.length > 0) {
        unknownParams = (injectionContext && injectionContext.createUnknownParamsValue || createUnknownParamsValue)(extraParams, startIndex);
      }

      return unknownParams;
    };
    /**
     * @description Decide whether the effect being parsed is a turn duration buff. This should only be
     * checked if all other known values in the effect are 0.
     * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
     * @param turnDuration Parsed turn duration value to check.
     * @param injectionContext Object whose main use is for injecting methods in testing.
     * @returns True if the turn duration value is non-zero and the source type is not a burst type.
     */


    const isTurnDurationBuff = (context, turnDuration, injectionContext) => {
      let result = turnDuration !== 0;

      if (result) {
        result = !(injectionContext && injectionContext.buffSourceIsBurstType || buffSourceIsBurstType)(context.source);
      }

      return result;
    };
    /**
     * @description Helper function to get attack information common across most attacks from the conversion context.
     * @param context Given context that may contain attack information like damage frames.
     * @returns Extracted attack information from the context (with defaults where applicable).
     */


    const getAttackInformationFromContext = context => {
      const hits = parseNumberOrDefault(context.damageFrames && context.damageFrames.hits || 0);
      const distribution = parseNumberOrDefault(context.damageFrames && context.damageFrames['hit dmg% distribution (total)']);
      return {
        hits,
        distribution
      };
    };

    const parseProcWithSingleNumericalParameterAndTurnDuration = ({
      effect,
      context,
      injectionContext,
      effectValueKey,
      effectTurnDurationKey,
      parseParamValue = rawValue => parseNumberOrDefault(rawValue),
      buffId,
      originalId
    }) => {
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let value = 0,
          turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const [rawValue, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        value = parseParamValue(rawValue);
        turnDuration = parseNumberOrDefault(rawTurnDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        value = parseNumberOrDefault(effect[effectValueKey]);
        turnDuration = parseNumberOrDefault(effect[effectTurnDurationKey]);
      }

      const results = [];

      if (value !== 0) {
        results.push(Object.assign({
          id: buffId,
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: [buffId],
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    };

    map.set('1', (effect, context, injectionContext) => {
      const originalId = '1';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
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
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
        results.push(Object.assign({
          id: 'proc:1',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('2', (effect, context, injectionContext) => {
      const originalId = '2';
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
      const results = [];

      if (params.healHigh !== 0 || params.healLow !== 0) {
        results.push(Object.assign({
          id: 'proc:2',
          originalId,
          sources,
          effectDelay,
          value: params
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('3', (effect, context, injectionContext) => {
      const originalId = '3';
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
          originalId,
          sources,
          effectDelay,
          duration: params.turnDuration,
          value: {
            healLow: params.healLow,
            healHigh: params.healHigh,
            'targetRec%': params['targetRec%']
          }
        }, targetData));
      } else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: ['proc:3'],
          duration: params.turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('4', (effect, context, injectionContext) => {
      const originalId = '4';
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
        flatFill = parseNumberOrDefault(rawFlatFill) / 100;
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
          originalId,
          sources,
          effectDelay,
          value: flatFill
        }, targetData));
      }

      if (percentFill !== 0) {
        results.push(Object.assign({
          id: 'proc:4:percent',
          originalId,
          sources,
          effectDelay,
          value: percentFill
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('5', (effect, context, injectionContext) => {
      const originalId = '5';
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
            params[statType] = parseNumberOrDefault(effect[effectKey]);
          }
        });
        params.turnDuration = parseNumberOrDefault(effect['buff turns']);
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
              originalId,
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
      } else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: coreStatProperties.map(statKey => `proc:5:${statKey}`),
          duration: params.turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('6', (effect, context, injectionContext) => {
      const originalId = '6';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const params = {
        bc: '0',
        hc: '0',
        item: '0',
        turnDuration: '0'
      };
      const dropRateProperties = ['bc', 'hc', 'item'];
      let unknownParams;

      if (effect.params) {
        let extraParams;
        [params.bc, params.hc, params.item, params.turnDuration, ...extraParams] = splitEffectParams(effect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      } else {
        params.bc = effect['bc drop rate% buff (10)'];
        params.hc = effect['hc drop rate% buff (9)'];
        params.item = effect['item drop rate% buff (11)'];
        params.turnDuration = effect['drop buff rate turns'];
      }

      dropRateProperties.concat(['turnDuration']).forEach(prop => {
        params[prop] = parseNumberOrDefault(params[prop]);
      });
      const hasAnyRates = dropRateProperties.some(key => params[key] !== 0);
      const results = [];

      if (hasAnyRates) {
        dropRateProperties.forEach(key => {
          const value = params[key];

          if (value !== 0) {
            results.push(Object.assign({
              id: `proc:6:${key}`,
              originalId,
              sources,
              effectDelay,
              duration: params.turnDuration,
              value
            }, targetData));
          }
        });
      } else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: dropRateProperties.map(key => `proc:6:${key}`),
          duration: params.turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('7', (effect, context, injectionContext) => {
      const originalId = '7';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let recoveredHpPercent = 0;
      let unknownParams;

      if (effect.params) {
        const [rawRecoveredHp, ...extraParams] = splitEffectParams(effect);
        recoveredHpPercent = parseNumberOrDefault(rawRecoveredHp);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        recoveredHpPercent = parseNumberOrDefault(effect['angel idol recover hp%']);
      }

      const results = [Object.assign({
        id: 'proc:7',
        originalId,
        sources,
        effectDelay,
        value: recoveredHpPercent
      }, targetData)];
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('8', (effect, context, injectionContext) => {
      const originalId = '8';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let flatHpBoost = 0;
      let percentHpBoost = 0;
      let unknownParams;

      if (effect.params) {
        const [rawFlatBoost, rawPercentBoost, ...extraParams] = splitEffectParams(effect);
        flatHpBoost = parseNumberOrDefault(rawFlatBoost);
        percentHpBoost = parseNumberOrDefault(rawPercentBoost);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        if ('max hp increase' in effect) {
          flatHpBoost = parseNumberOrDefault(effect['max hp increase']);
        }

        if ('max hp% increase' in effect) {
          percentHpBoost = parseNumberOrDefault(effect['max hp% increase']);
        }
      }

      const results = [];

      if (flatHpBoost !== 0) {
        results.push(Object.assign({
          id: 'proc:8:flat',
          originalId,
          sources,
          effectDelay,
          value: flatHpBoost
        }, targetData));
      }

      if (percentHpBoost !== 0) {
        results.push(Object.assign({
          id: 'proc:8:percent',
          originalId,
          sources,
          effectDelay,
          value: percentHpBoost
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('9', (effect, context, injectionContext) => {
      const originalId = '9';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const STAT_TYPE_MAPPING = {
        0: 'atk',
        1: 'def',
        2: 'rec'
      };
      const coreStatProperties = ['atk', 'def', 'rec'];
      const params = {
        element: BuffConditionElement.All,
        statReductionEntries: [],
        turnDuration: 0
      };
      let unknownParams;

      if (effect.params) {
        const [rawElement, statType1, value1, procChance1, statType2, value2, procChance2, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        params.turnDuration = parseNumberOrDefault(rawTurnDuration);
        [[statType1, value1, procChance1], [statType2, value2, procChance2]].forEach(([rawStatType, rawValue, rawProcChance]) => {
          const statType = parseNumberOrDefault(rawStatType) - 1;
          const value = parseNumberOrDefault(rawValue);
          const chance = parseNumberOrDefault(rawProcChance);

          if (statType === 3) {
            // all stats
            params.statReductionEntries.push(...coreStatProperties.map(stat => ({
              stat,
              value,
              chance
            })));
          } else {
            params.statReductionEntries.push({
              stat: STAT_TYPE_MAPPING[statType] || 'unknown',
              value,
              chance
            });
          }
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
      } else {
        const effectElement = effect['element buffed'];

        if (effectElement === 'all') {
          params.element = BuffConditionElement.All;
        } else if (!effectElement) {
          params.element = BuffConditionElement.Unknown;
        } else {
          params.element = effectElement;
        }

        ['buff #1', 'buff #2'].forEach(buffKey => {
          const entry = effect[buffKey];

          if (entry) {
            const chance = parseNumberOrDefault(entry['proc chance%']);
            const keys = Object.keys(entry);
            coreStatProperties.forEach(statType => {
              const effectKey = keys.find(k => k.startsWith(`${statType}% buff`));

              if (effectKey) {
                params.statReductionEntries.push({
                  stat: statType,
                  value: parseNumberOrDefault(entry[effectKey]),
                  chance
                });
              }
            });
          }
        });
        params.turnDuration = parseNumberOrDefault(effect['buff turns']);
      }

      const results = [];
      let hasAnyValues = false;
      params.statReductionEntries.forEach(({
        stat,
        value,
        chance
      }) => {
        if (value !== 0 || chance !== 0) {
          hasAnyValues = true;
          const buffEntry = Object.assign({
            id: `proc:9:${stat}`,
            originalId,
            sources,
            effectDelay,
            duration: params.turnDuration,
            value: {
              value,
              chance
            }
          }, targetData);

          if (params.element !== BuffConditionElement.All) {
            buffEntry.conditions = {
              targetElements: [params.element]
            };
          }

          results.push(buffEntry);
        }
      });

      if (!hasAnyValues && isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: coreStatProperties.map(statKey => `proc:9:${statKey}`),
          duration: params.turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('10', (effect, context, injectionContext) => {
      const originalId = '10';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const curedAilments = [];
      let unknownParams;

      if (effect.params) {
        const splitParams = splitEffectParams(effect);
        const knownParams = splitParams.slice(0, 8);
        const extraParams = splitParams.slice(8);
        knownParams.filter(p => p !== '0').forEach(param => {
          curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
      } else {
        Object.values(AILMENT_MAPPING).forEach(ailment => {
          if (`remove ${ailment}` in effect) {
            // mainly for items
            curedAilments.push(ailment);
          }
        });

        if ('remove all status ailments' in effect) {
          curedAilments.push(Ailment.Unknown); // generic value for skills; unknown at a glance which ailments are cured
        }
      }

      const results = curedAilments.map(ailment => Object.assign({
        id: `proc:10:${ailment}`,
        originalId,
        sources,
        effectDelay,
        value: true
      }, targetData));
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('11', (effect, context, injectionContext) => {
      const originalId = '11';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const inflictedAilments = [];
      let unknownParams;

      if (effect.params) {
        let params = splitEffectParams(effect);

        if (params.length % 2 !== 0 && params[params.length - 1] !== '0') {
          unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(-1), params.length - 1, injectionContext);
          params = params.slice(0, params.length - 1);
        }

        const numParams = params.length;

        for (let index = 0; index < numParams; index += 2) {
          const ailmentValue = params[index];
          const chance = parseNumberOrDefault(params[index + 1]);

          if (ailmentValue !== '0' || chance !== 0) {
            const ailmentType = AILMENT_MAPPING[ailmentValue] || Ailment.Unknown;
            inflictedAilments.push({
              ailment: ailmentType,
              chance
            });
          }
        }
      } else {
        Object.values(AILMENT_MAPPING).forEach(ailment => {
          let effectKey;

          if (ailment === Ailment.Weak) {
            effectKey = 'weaken%';
          } else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
            effectKey = ailment;
          } else {
            effectKey = `${ailment}%`;
          }

          if (effectKey in effect) {
            inflictedAilments.push({
              ailment,
              chance: parseNumberOrDefault(effect[effectKey])
            });
          }
        });
      }

      const results = inflictedAilments.map(({
        ailment,
        chance
      }) => Object.assign({
        id: `proc:11:${ailment}`,
        originalId,
        sources,
        effectDelay,
        value: chance
      }, targetData));
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('12', (effect, context, injectionContext) => {
      const originalId = '12';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let reviveToHp = 0;
      let unknownParams;

      if (effect.params) {
        const [rawReviveToHp, ...extraParams] = splitEffectParams(effect);
        reviveToHp = parseNumberOrDefault(rawReviveToHp);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        reviveToHp = parseNumberOrDefault(effect['revive to hp%']);
      }

      const results = [Object.assign({
        id: 'proc:12',
        originalId,
        sources,
        effectDelay,
        value: reviveToHp
      }, targetData)];
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('13', (effect, context, injectionContext) => {
      const originalId = '13';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let hits = 0;
      const {
        distribution
      } = getAttackInformationFromContext(context);
      const params = {
        'atk%': '0',
        flatAtk: '0',
        'crit%': '0',
        'bc%': '0',
        'hc%': '0'
      };
      let unknownParams;

      if (effect.params) {
        let extraParams;
        let rawHits;
        [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], rawHits, ...extraParams] = splitEffectParams(effect);
        hits = parseNumberOrDefault(rawHits);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        params['atk%'] = effect['bb atk%'];
        params.flatAtk = effect['bb flat atk'];
        params['crit%'] = effect['bb crit%'];
        params['bc%'] = effect['bb bc%'];
        params['hc%'] = effect['bb hc%'];
        hits = parseNumberOrDefault(effect.hits);
      }

      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
        results.push({
          id: 'proc:13',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          }),
          targetType: targetData.targetType,
          targetArea: TargetArea.Random
        });
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('14', (effect, context, injectionContext) => {
      const originalId = '14';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
      const params = {
        'atk%': '0',
        flatAtk: '0',
        'crit%': '0',
        'bc%': '0',
        'hc%': '0',
        'dmg%': '0',
        'drainLow%': '0',
        'drainHigh%': '0'
      };
      let unknownParams;

      if (effect.params) {
        let extraParams;
        [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], params['drainLow%'], params['drainHigh%'], ...extraParams] = splitEffectParams(effect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
      } else {
        params['atk%'] = effect['bb atk%'];
        params.flatAtk = effect['bb flat atk'];
        params['crit%'] = effect['bb crit%'];
        params['bc%'] = effect['bb bc%'];
        params['hc%'] = effect['bb hc%'];
        params['dmg%'] = effect['bb dmg%'];
        params['drainLow%'] = effect['hp drain% low'];
        params['drainHigh%'] = effect['hp drain% high'];
      }

      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
        results.push(Object.assign({
          id: 'proc:14',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('16', (effect, context, injectionContext) => {
      const originalId = '16';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let mitigation = 0;
      let element;
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const [rawElement, rawMitigation, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        mitigation = parseNumberOrDefault(rawMitigation);
        turnDuration = parseNumberOrDefault(rawTurnDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      } else {
        const mitigationKey = Object.keys(effect).find(k => k.startsWith('mitigate'));
        element = mitigationKey && Object.values(ELEMENT_MAPPING).find(e => mitigationKey.includes(e)) || BuffConditionElement.Unknown;

        if (mitigationKey) {
          mitigation = parseNumberOrDefault(effect[mitigationKey]);
        }

        turnDuration = parseNumberOrDefault(effect['buff turns']);
      }

      const results = [];

      if (mitigation !== 0) {
        results.push(Object.assign({
          id: `proc:16:${element}`,
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value: mitigation
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: Object.values(ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map(e => `proc:16:${e}`),
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('17', (effect, context, injectionContext) => {
      const originalId = '17';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
      const resistances = {
        poison: '0',
        weak: '0',
        sick: '0',
        injury: '0',
        curse: '0',
        paralysis: '0'
      };
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        let rawDuration, extraParams;
        [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, rawDuration, ...extraParams] = splitEffectParams(effect);
        turnDuration = parseNumberOrDefault(rawDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
      } else {
        const ailmentKeysInEffect = Object.keys(effect).filter(k => k.startsWith('resist'));
        AILMENTS_ORDER.forEach(ailment => {
          const correspondingKey = ailmentKeysInEffect.find(k => k.includes(ailment));

          if (correspondingKey) {
            resistances[ailment] = effect[correspondingKey];
          }
        });
        turnDuration = parseNumberOrDefault(effect['resist status ails turns']);
      }

      const results = [];
      AILMENTS_ORDER.forEach(ailment => {
        const value = parseNumberOrDefault(resistances[ailment]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `proc:17:${ailment}`,
            originalId,
            sources,
            effectDelay,
            value,
            duration: turnDuration
          }, targetData));
        }
      });

      if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: AILMENTS_ORDER.map(a => `proc:17:${a}`),
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('18', (effect, context, injectionContext) => {
      return parseProcWithSingleNumericalParameterAndTurnDuration({
        effect,
        context,
        injectionContext,
        effectValueKey: 'dmg% reduction',
        effectTurnDurationKey: 'dmg% reduction turns (36)',
        buffId: 'proc:18',
        originalId: '18'
      });
    });
    map.set('19', (effect, context, injectionContext) => {
      return parseProcWithSingleNumericalParameterAndTurnDuration({
        effect,
        context,
        injectionContext,
        effectValueKey: 'increase bb gauge gradual',
        effectTurnDurationKey: 'increase bb gauge gradual turns (37)',
        parseParamValue: rawValue => parseNumberOrDefault(rawValue) / 100,
        buffId: 'proc:19',
        originalId: '19'
      });
    });
    map.set('20', (effect, context, injectionContext) => {
      const originalId = '20';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let fillLow = 0;
      let fillHigh = 0;
      let chance = 0;
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const [rawFillLow, rawFillHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        fillLow = parseNumberOrDefault(rawFillLow) / 100;
        fillHigh = parseNumberOrDefault(rawFillHigh) / 100;
        chance = parseNumberOrDefault(rawChance);
        turnDuration = parseNumberOrDefault(rawTurnDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      } else {
        fillLow = parseNumberOrDefault(effect['bc fill when attacked low']);
        fillHigh = parseNumberOrDefault(effect['bc fill when attacked high']);
        chance = parseNumberOrDefault(effect['bc fill when attacked%']);
        turnDuration = parseNumberOrDefault(effect['bc fill when attacked turns (38)']);
      }

      const hasAnyFillValues = fillLow !== 0 || fillHigh !== 0;
      const results = [];

      if (hasAnyFillValues) {
        results.push(Object.assign({
          id: 'proc:20',
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          conditions: {
            whenAttacked: true
          },
          value: {
            fillLow,
            fillHigh,
            chance
          }
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: ['proc:20'],
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('22', (effect, context, injectionContext) => {
      return parseProcWithSingleNumericalParameterAndTurnDuration({
        effect,
        context,
        injectionContext,
        effectValueKey: 'defense% ignore',
        effectTurnDurationKey: 'defense% ignore turns (39)',
        buffId: 'proc:22',
        originalId: '22'
      });
    });
    map.set('23', (effect, context, injectionContext) => {
      const originalId = '23';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let value = 0,
          turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const params = splitEffectParams(effect);
        value = parseNumberOrDefault(params[0]);
        turnDuration = parseNumberOrDefault(params[6]);
        const extraParams = ['0', ...params.slice(1, 6), '0', ...params.slice(7)];
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
      } else {
        value = parseNumberOrDefault(effect['spark dmg% buff (40)']);
        turnDuration = parseNumberOrDefault(effect['buff turns']);
      }

      const results = [];

      if (value !== 0) {
        results.push(Object.assign({
          id: 'proc:23',
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: ['proc:23'],
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('24', (effect, context, injectionContext) => {
      const originalId = '24';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const coreStatProperties = ['atk', 'def', 'rec'];
      const coreStatPropertyMapping = {
        1: 'atk',
        2: 'def',
        3: 'rec',
        4: 'hp'
      };
      const effectToCoreStatMapping = {
        attack: 'atk',
        defense: 'def',
        recovery: 'rec',
        hp: 'hp'
      };
      const stats = {
        atk: '0',
        def: '0',
        rec: '0'
      };
      let turnDuration = 0;
      let convertedStat = 'unknown';
      let unknownParams;

      if (effect.params) {
        let extraParams;
        let rawConvertedStat, rawTurnDuration;
        [rawConvertedStat, stats.atk, stats.def, stats.rec, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        convertedStat = coreStatPropertyMapping[rawConvertedStat] || 'unknown';
        turnDuration = parseNumberOrDefault(rawTurnDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
      } else {
        const rawConvertedStat = effect['converted attribute'];

        if (rawConvertedStat in effectToCoreStatMapping) {
          convertedStat = effectToCoreStatMapping[rawConvertedStat];
        } else {
          convertedStat = 'unknown';
        }

        const keys = Object.keys(effect);
        coreStatProperties.forEach(statType => {
          const effectKey = keys.find(k => k.startsWith(`${statType}% buff`));

          if (effectKey) {
            stats[statType] = effect[effectKey];
          }
        });
        turnDuration = parseNumberOrDefault(effect['% converted turns']);
      }

      const results = [];
      coreStatProperties.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `proc:24:${stat}`,
            originalId,
            sources,
            effectDelay,
            duration: turnDuration,
            value: {
              convertedStat,
              value
            }
          }, targetData));
        }
      });

      if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: coreStatProperties.map(statKey => `proc:24:${statKey}`),
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('26', (effect, context, injectionContext) => {
      const originalId = '26';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let hitIncreasePerHit = 0,
          extraHitDamage = 0,
          turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const params = splitEffectParams(effect);
        hitIncreasePerHit = parseNumberOrDefault(params[0]);
        extraHitDamage = parseNumberOrDefault(params[2]);
        turnDuration = parseNumberOrDefault(params[7]);
        const extraParams = ['0', params[1], '0', ...params.slice(3, 7), '0', ...params.slice(8)];
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
      } else {
        hitIncreasePerHit = parseNumberOrDefault(effect['hit increase/hit']);
        extraHitDamage = parseNumberOrDefault(effect['extra hits dmg%']);
        turnDuration = parseNumberOrDefault(effect['hit increase buff turns (50)']);
      }

      const results = [];

      if (hitIncreasePerHit !== 0 || extraHitDamage !== 0) {
        results.push(Object.assign({
          id: 'proc:26',
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value: {
            hitIncreasePerHit,
            extraHitDamage
          }
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: ['proc:26'],
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('27', (effect, context, injectionContext) => {
      const originalId = '27';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
      const params = {
        'hpDamageLow%': '0',
        'hpDamageHigh%': '0',
        'hpDamageChance%': '0',
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
        [params['hpDamageLow%'], params['hpDamageHigh%'], params['hpDamageChance%'], params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
      } else {
        params['hpDamageLow%'] = effect['hp% damage low'];
        params['hpDamageHigh%'] = effect['hp% damage high'];
        params['hpDamageChance%'] = effect['hp% damage chance%'];
        params['atk%'] = effect['bb atk%'];
        params.flatAtk = effect['bb flat atk'];
        params['crit%'] = effect['bb crit%'];
        params['bc%'] = effect['bb bc%'];
        params['hc%'] = effect['bb hc%'];
        params['dmg%'] = effect['bb dmg%'];
      }

      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
        results.push(Object.assign({
          id: 'proc:27',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('28', (effect, context, injectionContext) => {
      const originalId = '28';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
      let value = 0;
      let unknownParams;

      if (effect.params) {
        const [rawValue, ...extraParams] = splitEffectParams(effect);
        value = parseNumberOrDefault(rawValue);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        value = parseNumberOrDefault(effect['fixed damage']);
      }

      const results = [];

      if (hits !== 0 || distribution !== 0 || value !== 0) {
        const entry = Object.assign({
          id: 'proc:28',
          originalId,
          sources,
          effectDelay,
          value: {
            hits,
            distribution
          }
        }, targetData);

        if (value !== 0) {
          entry.value.value = value;
        }

        results.push(entry);
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('29', (effect, context, injectionContext) => {
      const originalId = '29';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
      const params = {
        'atk%': '0',
        flatAtk: '0',
        'crit%': '0',
        'bc%': '0',
        'hc%': '0',
        'dmg%': '0'
      };
      let attackElements = [];
      let unknownParams;

      if (effect.params) {
        let element1, element2, element3;
        let extraParams;
        [element1, element2, element3, params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
        [element1, element2, element3].forEach(rawElement => {
          if (rawElement !== '0') {
            attackElements.push(ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
          }

          unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
        });
      } else {
        if (Array.isArray(effect['bb elements'])) {
          attackElements = effect['bb elements'].slice();
        }

        params['atk%'] = effect['bb atk%'];
        params.flatAtk = effect['bb flat atk'];
        params['crit%'] = effect['bb crit%'];
        params['bc%'] = effect['bb bc%'];
        params['hc%'] = effect['bb hc%'];
        params['dmg%'] = effect['bb dmg%'];
      }

      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || attackElements.length > 0 || Object.keys(filteredValue).length > 0) {
        const entry = Object.assign({
          id: 'proc:29',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          })
        }, targetData);

        if (attackElements.length > 0) {
          entry.value.elements = attackElements;
        }

        results.push(entry);
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('30', (effect, context, injectionContext) => {
      const originalId = '30';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let elements = [];
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const params = splitEffectParams(effect);
        elements = params.slice(0, 6).filter(p => p !== '0').map(p => ELEMENT_MAPPING[p] || BuffConditionElement.Unknown);
        turnDuration = parseNumberOrDefault(params[6]);
        unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
      } else {
        if ('elements added' in effect) {
          if (Array.isArray(effect['elements added'])) {
            elements = effect['elements added'];
          } else {
            elements = [BuffConditionElement.Unknown];
          }
        }

        turnDuration = parseNumberOrDefault(effect['elements added turns']);
      }

      const results = [];
      const validElements = Object.values(ELEMENT_MAPPING).filter(e => e !== BuffConditionElement.All);

      if (elements.length > 0) {
        elements.forEach(inputElement => {
          const sanitizedElement = validElements.includes(inputElement) ? inputElement : BuffConditionElement.Unknown;
          results.push(Object.assign({
            id: `proc:30:${sanitizedElement}`,
            originalId,
            sources,
            effectDelay,
            duration: turnDuration
          }, targetData));
        });
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: validElements.concat([BuffConditionElement.Unknown]).map(e => `proc:30:${e}`),
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('31', (effect, context, injectionContext) => {
      const originalId = '31';
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
        flatFill = parseNumberOrDefault(rawFlatFill) / 100;
        percentFill = parseNumberOrDefault(rawPercentFill);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        if ('increase bb gauge' in effect) {
          flatFill = parseNumberOrDefault(effect['increase bb gauge']);
        } // NOTE: Deathmax's datamine only recognizes one value. We think the second parameter is percent fill
        // due to it being tied to a Tilith skill (a unit who's known for BC filling skillsets)

      }

      const results = [];

      if (flatFill !== 0) {
        results.push(Object.assign({
          id: 'proc:31:flat',
          originalId,
          sources,
          effectDelay,
          value: flatFill
        }, targetData));
      }

      if (percentFill !== 0) {
        results.push(Object.assign({
          id: 'proc:31:percent',
          originalId,
          sources,
          effectDelay,
          value: percentFill
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('32', (effect, context, injectionContext) => {
      const originalId = '32';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let element;
      let unknownParams;

      if (effect.params) {
        const [rawElement, ...extraParams] = splitEffectParams(effect);

        if (rawElement && rawElement !== '0') {
          element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        }

        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        const effectElement = effect['set attack element attribute'];

        if (effectElement) {
          const sanitizedElement = Object.values(ELEMENT_MAPPING).find(e => effectElement === e);

          if (sanitizedElement && sanitizedElement !== BuffConditionElement.All) {
            element = sanitizedElement;
          } else {
            element = BuffConditionElement.Unknown;
          }
        }
      }

      const results = [];

      if (element) {
        results.push(Object.assign({
          id: `proc:32:${element}`,
          originalId,
          sources,
          effectDelay,
          value: true
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('33', (effect, context, injectionContext) => {
      const originalId = '33';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let chance = 0;
      let unknownParams;

      if (effect.params) {
        const [rawValue, ...extraParams] = splitEffectParams(effect);
        chance = parseNumberOrDefault(rawValue);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        chance = parseNumberOrDefault(effect['clear buff chance%']);
      }

      const results = [];

      if (chance !== 0) {
        results.push(Object.assign({
          id: 'proc:33',
          originalId,
          sources,
          effectDelay,
          value: chance
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('34', (effect, context, injectionContext) => {
      const originalId = '34';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let flatDrainLow = 0,
          flatDrainHigh = 0;
      let percentDrainLow = 0,
          percentDrainHigh = 0;
      let chance = 0;
      let unknownParams;

      if (effect.params) {
        const [rawFlatLow, rawFlatHigh, rawPercentLow, rawPercentHigh, rawChance, ...extraParams] = splitEffectParams(effect);
        flatDrainLow = parseNumberOrDefault(rawFlatLow) / 100;
        flatDrainHigh = parseNumberOrDefault(rawFlatHigh) / 100;
        percentDrainLow = parseNumberOrDefault(rawPercentLow);
        percentDrainHigh = parseNumberOrDefault(rawPercentHigh);
        chance = parseNumberOrDefault(rawChance);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
      } else {
        flatDrainLow = parseNumberOrDefault(effect['base bb gauge reduction low']);
        flatDrainHigh = parseNumberOrDefault(effect['base bb gauge reduction high']);
        percentDrainLow = parseNumberOrDefault(effect['bb gauge% reduction low']);
        percentDrainHigh = parseNumberOrDefault(effect['bb gauge% reduction high']);
        chance = parseNumberOrDefault(effect['bb gauge reduction chance%']);
      }

      const results = [];

      if (flatDrainLow !== 0 || flatDrainHigh !== 0) {
        results.push(Object.assign({
          id: 'proc:34:flat',
          originalId,
          sources,
          effectDelay,
          value: {
            drainLow: flatDrainLow,
            drainHigh: flatDrainHigh,
            chance
          }
        }, targetData));
      }

      if (percentDrainLow !== 0 || percentDrainHigh !== 0) {
        results.push(Object.assign({
          id: 'proc:34:percent',
          originalId,
          sources,
          effectDelay,
          value: {
            drainLow: percentDrainLow,
            drainHigh: percentDrainHigh,
            chance
          }
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('36', (effect, context, injectionContext) => {
      return parseProcWithSingleNumericalParameterAndTurnDuration({
        effect,
        context,
        injectionContext,
        effectValueKey: 'invalidate LS chance%',
        effectTurnDurationKey: 'invalidate LS turns (60)',
        buffId: 'proc:36',
        originalId: '36'
      });
    });
    map.set('37', (effect, context, injectionContext) => {
      const originalId = '37';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const rawParams = effect.params || effect[UNKNOWN_PROC_PARAM_EFFECT_KEY] || '';
      const [summonGroup, summonId = '', rawPositionX, rawPositionY, ...extraParams] = splitEffectParams({
        params: rawParams
      });
      const positionX = parseNumberOrDefault(rawPositionX);
      const positionY = parseNumberOrDefault(rawPositionY);
      const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      const results = [];

      if (summonGroup || summonId) {
        results.push(Object.assign({
          id: 'proc:37',
          originalId,
          sources,
          effectDelay,
          value: {
            summonGroup,
            summonId,
            positionX,
            positionY
          }
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('38', (effect, context, injectionContext) => {
      const originalId = '38';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const curedAilments = [];
      let unknownParams;

      if (effect.params) {
        const splitParams = splitEffectParams(effect);
        const knownParams = splitParams.slice(0, 9);
        const extraParams = splitParams.slice(9);
        knownParams.filter(p => p !== '0').forEach(param => {
          curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
      } else if (Array.isArray(effect['ailments cured'])) {
        const effectAilmentsCured = effect['ailments cured'];
        Object.values(AILMENT_MAPPING).forEach(ailment => {
          const effectKey = ailment !== Ailment.Weak ? ailment : 'weaken';

          if (effectAilmentsCured.includes(effectKey)) {
            curedAilments.push(ailment);
          }
        });

        if (effectAilmentsCured.length > curedAilments.length) {
          const unknownAilmentCount = effectAilmentsCured.length - curedAilments.length;

          for (let i = 0; i < unknownAilmentCount; ++i) {
            curedAilments.push(Ailment.Unknown);
          }
        }
      }

      const results = curedAilments.map(ailment => Object.assign({
        id: `proc:38:${ailment}`,
        originalId,
        sources,
        effectDelay,
        value: true
      }, targetData));
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('39', (effect, context, injectionContext) => {
      const originalId = '39';
      const ELEMENT_MAPPING = {
        1: UnitElement.Fire,
        2: UnitElement.Water,
        3: UnitElement.Earth,
        4: UnitElement.Thunder,
        5: UnitElement.Light,
        6: UnitElement.Dark
      };
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const elements = [];
      let mitigation = 0;
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const params = splitEffectParams(effect);
        const rawElementsMitigated = params.slice(0, 6);
        mitigation = parseNumberOrDefault(params[6]);
        turnDuration = parseNumberOrDefault(params[7]);
        rawElementsMitigated.forEach(rawElement => {
          if (rawElement !== '0') {
            elements.push(ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
          }
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
      } else {
        Object.values(ELEMENT_MAPPING).forEach(element => {
          if (effect[`mitigate ${element} attacks`]) {
            elements.push(element);
          }
        });
        mitigation = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks']);
        turnDuration = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks buff turns']);
      }

      const results = [];

      if (elements.length > 0) {
        elements.forEach(element => {
          results.push(Object.assign({
            id: `proc:39:${element}`,
            originalId,
            sources,
            effectDelay,
            duration: turnDuration,
            value: mitigation
          }, targetData));
        });
      } else if (mitigation !== 0) {
        results.push(Object.assign({
          id: 'proc:39:unknown',
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value: mitigation
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: Object.values(ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map(e => `proc:39:${e}`),
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('40', (effect, context, injectionContext) => {
      const originalId = '40';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const inflictedAilments = [];
      let turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        const params = splitEffectParams(effect);

        for (let index = 0; index < 8; index += 2) {
          const ailmentValue = params[index];
          const chance = parseNumberOrDefault(params[index + 1]);

          if (ailmentValue !== '0' || chance !== 0) {
            const ailmentType = AILMENT_MAPPING[ailmentValue] || Ailment.Unknown;
            inflictedAilments.push({
              ailment: ailmentType,
              chance
            });
          }
        }

        turnDuration = parseNumberOrDefault(params[8]);
        unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(9), 9, injectionContext);
      } else {
        Object.values(AILMENT_MAPPING).forEach(ailment => {
          let effectKey;

          if (ailment === Ailment.Weak) {
            effectKey = 'weaken% buff';
          } else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
            effectKey = `${ailment} buff`;
          } else {
            effectKey = `${ailment}% buff`;
          }

          if (effectKey in effect) {
            inflictedAilments.push({
              ailment,
              chance: parseNumberOrDefault(effect[effectKey])
            });
          }
        });
        turnDuration = parseNumberOrDefault(effect['buff turns']);
      }

      const results = inflictedAilments.map(({
        ailment,
        chance
      }) => Object.assign({
        id: `proc:40:${ailment}`,
        originalId,
        sources,
        effectDelay,
        duration: turnDuration,
        value: chance
      }, targetData));

      if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          duration: turnDuration,
          buffs: Object.values(AILMENT_MAPPING).concat([Ailment.Unknown]).map(a => `proc:40:${a}`),
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('42', (effect, context, injectionContext) => {
      const originalId = '42';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const {
        hits,
        distribution
      } = getAttackInformationFromContext(context);
      const rawParams = effect.params || effect[UNKNOWN_PROC_PARAM_EFFECT_KEY] || '';
      const [rawModLow, rawModHigh, rawFlatAtk, ...extraParams] = splitEffectParams({
        params: rawParams
      });
      const params = {
        'atkLow%': rawModLow,
        'atkHigh%': rawModHigh,
        flatAtk: rawFlatAtk
      };
      const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      const filteredValue = Object.entries(params).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
        results.push(Object.assign({
          id: 'proc:42',
          originalId,
          sources,
          effectDelay,
          value: Object.assign(Object.assign({}, filteredValue), {
            hits,
            distribution
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('43', (effect, context, injectionContext) => {
      const originalId = '43';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      let overdriveFill = 0;
      let unknownParams;

      if (effect.params) {
        const [rawOverdriveFill, ...extraParams] = splitEffectParams(effect);
        overdriveFill = parseNumberOrDefault(rawOverdriveFill);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        overdriveFill = parseNumberOrDefault(effect['increase od gauge%']);
      }

      const results = [];

      if (overdriveFill !== 0) {
        results.push(Object.assign({
          id: 'proc:43',
          originalId,
          sources,
          effectDelay,
          value: overdriveFill
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
      return results;
    });
    map.set('44', (effect, context, injectionContext) => {
      const originalId = '44';
      const {
        targetData,
        sources,
        effectDelay
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const damageParams = {
        'atk%': '0',
        flatAtk: '0',
        'dmg%': '0'
      };
      let affectsElement = false,
          unitIndex = 0,
          turnDuration = 0;
      let unknownParams;

      if (effect.params) {
        let extraParams;
        let rawAffectsElement, rawUnitIndex, rawTurnDuration;
        [damageParams['atk%'], damageParams.flatAtk, damageParams['dmg%'], rawAffectsElement, rawUnitIndex, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
        affectsElement = rawAffectsElement !== '1'; // NOTE: not sure about this value

        unitIndex = parseNumberOrDefault(rawUnitIndex);
        turnDuration = parseNumberOrDefault(rawTurnDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        damageParams['atk%'] = effect['dot atk%'];
        damageParams.flatAtk = effect['dot flat atk'];
        damageParams['dmg%'] = effect['dot dmg%'];
        affectsElement = !!effect['dot element affected'];
        unitIndex = parseNumberOrDefault(effect['dot unit index']);
        turnDuration = parseNumberOrDefault(effect['dot turns (71)']);
      }

      const filteredDamageParams = Object.entries(damageParams).filter(([, value]) => value && +value).reduce((acc, [key, value]) => {
        acc[key] = parseNumberOrDefault(value);
        return acc;
      }, {});
      const results = [];

      if (Object.keys(filteredDamageParams).length > 0) {
        results.push(Object.assign({
          id: 'proc:44',
          originalId,
          sources,
          effectDelay,
          duration: turnDuration,
          value: Object.assign(Object.assign({}, filteredDamageParams), {
            affectsElement,
            unitIndex
          })
        }, targetData));
      } else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
        results.push(createTurnDurationEntry({
          originalId,
          sources,
          buffs: ['proc:44'],
          duration: turnDuration,
          targetData
        }));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        effectDelay
      });
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
    const conversionFunction = id && getProcEffectToBuffMapping(context.reloadMapping).get(id); // TODO: warning if result is empty?

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
    const AILMENT_MAPPING = {
      1: Ailment.Poison,
      2: Ailment.Weak,
      3: Ailment.Sick,
      4: Ailment.Injury,
      5: Ailment.Curse,
      6: Ailment.Paralysis,
      7: Ailment.AttackReduction,
      8: Ailment.DefenseReduction,
      9: Ailment.RecoveryReduction
    };
    const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
    const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];
    const DROP_TYPES_ORDER = ['bc', 'hc', 'item', 'zel', 'karma'];

    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
      const conditionInfo = (injectionContext && injectionContext.processExtraSkillConditions || processExtraSkillConditions)(effect);
      const targetData = (injectionContext && injectionContext.getPassiveTargetData || getPassiveTargetData)(effect, context);
      const sources = (injectionContext && injectionContext.createSourcesFromContext || createSourcesFromContext)(context);
      return {
        conditionInfo,
        targetData,
        sources
      };
    }; // Disable rule as this function is only called once it's confirmed that `effect.params` exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion


    const splitEffectParams = effect => effect.params.split(',');

    const createUnknownParamsEntry = (unknownParams, {
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

    const createNoParamsEntry = ({
      originalId,
      sources
    }) => ({
      id: BuffId.NO_PARAMS_SPECIFIED,
      originalId,
      sources
    });
    /**
     * @description Common checks that are run for most effects after the params have been parsed
     * into an array of {@link IBuff} but before said array is returned.
     * @param results List of buffs from the given effect.
     * @param unknownParams Any unknown parameters from the given effect.
     * @param parsingContext Extra metadata extracted from the given effect.
     * @returns {undefined} No value is returned, but it does update the `results` array.
     */


    const handlePostParse = (results, unknownParams, {
      originalId,
      sources,
      targetData,
      conditionInfo
    }) => {
      if (results.length === 0) {
        results.push(createNoParamsEntry({
          originalId,
          sources
        }));
      }

      if (unknownParams) {
        results.push(createUnknownParamsEntry(unknownParams, {
          originalId,
          sources,
          targetData,
          conditionInfo
        }));
      }
    };

    const createUnknownParamsEntryFromExtraParams = (extraParams, startIndex, injectionContext) => {
      let unknownParams;

      if (extraParams && extraParams.length > 0) {
        unknownParams = (injectionContext && injectionContext.createUnknownParamsValue || createUnknownParamsValue)(extraParams, startIndex);
      }

      return unknownParams;
    };

    let ThresholdType;

    (function (ThresholdType) {
      ThresholdType["Hp"] = "hp";
      ThresholdType["Bb"] = "bb gauge";
    })(ThresholdType || (ThresholdType = {}));

    const parseThresholdValuesFromParamsProperty = (rawThreshold, rawRequireAboveFlag, thresholdType) => {
      return {
        threshold: parseNumberOrDefault(rawThreshold),
        requireAbove: rawRequireAboveFlag === '1',
        type: thresholdType
      };
    };

    const parseThresholdValuesFromEffect = (effect, thresholdType, suffix = 'buff requirement') => {
      let threshold = 0,
          requireAbove = false;

      if (`${thresholdType} above % ${suffix}` in effect) {
        threshold = parseNumberOrDefault(effect[`${thresholdType} above % ${suffix}`]);
        requireAbove = true;
      } else {
        threshold = parseNumberOrDefault(effect[`${thresholdType} below % ${suffix}`]);
        requireAbove = false;
      }

      return {
        threshold,
        requireAbove,
        type: thresholdType
      };
    };

    const getThresholdConditions = ({
      threshold,
      requireAbove,
      type
    }) => {
      let conditions;

      if (type === ThresholdType.Hp) {
        if (requireAbove) {
          conditions = {
            hpGreaterThanOrEqualTo: threshold
          };
        } else {
          conditions = {
            hpLessThanOrEqualTo: threshold
          };
        }
      } else if (type === ThresholdType.Bb) {
        if (requireAbove) {
          conditions = {
            bbGaugeGreaterThanOrEqualTo: threshold
          };
        } else {
          conditions = {
            bbGaugeLessThanOrEqualTo: threshold
          };
        }
      }

      return conditions;
    };

    const parsePassiveWithSingleNumericalParameter = ({
      effect,
      context,
      injectionContext,
      originalId,
      effectKey,
      buffId,
      parseParamValue = rawValue => parseNumberOrDefault(rawValue)
    }) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      let value = 0;
      let unknownParams;

      if (typedEffect.params) {
        const [rawValue, ...extraParams] = splitEffectParams(typedEffect);
        value = parseParamValue(rawValue);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
      } else {
        value = parseNumberOrDefault(typedEffect[effectKey]);
      }

      if (value !== 0) {
        results.push(Object.assign({
          id: buffId,
          originalId,
          sources,
          value,
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    };

    const parsePassiveWithNumericalValueRangeAndChance = ({
      effect,
      context,
      injectionContext,
      originalId,
      effectKeyLow,
      effectKeyHigh,
      effectKeyChance,
      buffKeyLow,
      buffKeyHigh,
      defaultEffectChance = 0,
      parseParamValue = rawValue => parseNumberOrDefault(rawValue),
      generateBaseConditions = () => ({}),
      buffId
    }) => {
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let valueLow, valueHigh, chance;
      let unknownParams;

      if (typedEffect.params) {
        const [rawLowValue, rawHighValue, rawChance, ...extraParams] = splitEffectParams(typedEffect);
        valueLow = parseParamValue(rawLowValue);
        valueHigh = parseParamValue(rawHighValue);
        chance = parseNumberOrDefault(rawChance);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      } else {
        valueLow = parseNumberOrDefault(typedEffect[effectKeyLow]);
        valueHigh = parseNumberOrDefault(typedEffect[effectKeyHigh]);
        chance = parseNumberOrDefault(typedEffect[effectKeyChance], defaultEffectChance);
      }

      const results = [];

      if (valueLow !== 0 || valueHigh !== 0 || chance !== 0) {
        results.push(Object.assign({
          id: buffId,
          originalId,
          sources,
          value: {
            [buffKeyLow]: valueLow,
            [buffKeyHigh]: valueHigh,
            chance
          },
          conditions: Object.assign(Object.assign({}, conditionInfo), generateBaseConditions())
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    };

    map.set('1', (effect, context, injectionContext) => {
      const originalId = '1';
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
        [stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
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
            originalId,
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('2', (effect, context, injectionContext) => {
      const originalId = '2';
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
        [element1, element2, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
        [element1, element2].forEach(elementValue => {
          if (elementValue && elementValue !== '0') {
            stats.elements.push(ELEMENT_MAPPING[elementValue] || BuffConditionElement.Unknown);
          }
        });
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
      } else {
        if (Array.isArray(typedEffect['elements buffed'])) {
          stats.elements = typedEffect['elements buffed'];
        }

        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      const createBaseStatObject = stat => Object.assign({
        id: `passive:2:${stat}`,
        originalId,
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

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('3', (effect, context, injectionContext) => {
      const originalId = '3';
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
        [unitType, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

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
            originalId,
            sources,
            value: +value,
            conditions: Object.assign(Object.assign({}, conditionInfo), {
              targetUnitType
            })
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('4', (effect, context, injectionContext) => {
      const originalId = '4';
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
        [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
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
            originalId,
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('5', (effect, context, injectionContext) => {
      const originalId = '5';
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
        [rawElement, mitigation, ...extraParams] = splitEffectParams(typedEffect);
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
          originalId,
          sources,
          value,
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('8', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'dmg% mitigation',
        buffId: 'passive:8',
        originalId: '8'
      });
    });
    map.set('9', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'bc fill per turn',
        buffId: 'passive:9',
        originalId: '9'
      });
    });
    map.set('10', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'hc effectiveness%',
        buffId: 'passive:10',
        originalId: '10'
      });
    });
    map.set('11', (effect, context, injectionContext) => {
      const originalId = '11';
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
        crit: '0'
      };
      let thresholdInfo;
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawRequireAboveFlag;
        let rawThreshold;
        [stats.atk, stats.def, stats.rec, stats.crit, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
        thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
        thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
      }

      const thresholdConditions = getThresholdConditions(thresholdInfo);
      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (stat !== 'hp' && value !== 0) {
          const entry = Object.assign({
            id: `passive:11:${stat}`,
            originalId,
            sources,
            value,
            conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions)
          }, targetData);
          results.push(entry);
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('12', (effect, context, injectionContext) => {
      const originalId = '12';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const dropRates = {
        bc: '0',
        hc: '0',
        item: '0',
        zel: '0',
        karma: '0'
      };
      let thresholdInfo;
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawRequireAboveFlag;
        let rawThreshold;
        [dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
        thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
      } else {
        DROP_TYPES_ORDER.forEach(dropType => {
          dropRates[dropType] = typedEffect[`${dropType} drop rate% buff`];
        });
        thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
      }

      const thresholdConditions = getThresholdConditions(thresholdInfo);
      DROP_TYPES_ORDER.forEach(dropType => {
        const value = parseNumberOrDefault(dropRates[dropType]);

        if (value !== 0) {
          const entry = Object.assign({
            id: `passive:12:${dropType}`,
            originalId,
            sources,
            value,
            conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions)
          }, targetData);
          results.push(entry);
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('13', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '13',
        effectKeyLow: 'bc fill on enemy defeat low',
        effectKeyHigh: 'bc fill on enemy defeat high',
        effectKeyChance: 'bc fill on enemy defeat%',
        buffKeyLow: 'fillLow',
        buffKeyHigh: 'fillHigh',
        parseParamValue: rawValue => parseNumberOrDefault(rawValue) / 100,
        generateBaseConditions: () => ({
          onEnemyDefeat: true
        }),
        buffId: 'passive:13'
      });
    });
    map.set('14', (effect, context, injectionContext) => {
      const originalId = '14';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let damageReduction, chance;
      let unknownParams;

      if (typedEffect.params) {
        const [rawReduction, rawChance, ...extraParams] = splitEffectParams(typedEffect);
        damageReduction = parseNumberOrDefault(rawReduction);
        chance = parseNumberOrDefault(rawChance);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        damageReduction = parseNumberOrDefault(typedEffect['dmg reduction%']);
        chance = parseNumberOrDefault(typedEffect['dmg reduction chance%']);
      }

      const results = [];

      if (damageReduction !== 0 || chance !== 0) {
        results.push(Object.assign({
          id: 'passive:14',
          originalId,
          sources,
          value: {
            value: damageReduction,
            chance
          },
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('15', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '15',
        effectKeyLow: 'hp% recover on enemy defeat low',
        effectKeyHigh: 'hp% recover on enemy defeat high',
        effectKeyChance: 'hp% recover on enemy defeat chance%',
        buffKeyLow: 'healLow',
        buffKeyHigh: 'healHigh',
        generateBaseConditions: () => ({
          onEnemyDefeat: true
        }),
        defaultEffectChance: 100,
        buffId: 'passive:15'
      });
    });
    map.set('16', (effect, context, injectionContext) => {
      const originalId = '16';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let healLow, healHigh;
      let unknownParams;

      if (typedEffect.params) {
        const [rawHealLow, rawHealHigh, ...extraParams] = splitEffectParams(typedEffect);
        healLow = parseNumberOrDefault(rawHealLow);
        healHigh = parseNumberOrDefault(rawHealHigh);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        healLow = parseNumberOrDefault(typedEffect['hp% recover on battle win low']);
        healHigh = parseNumberOrDefault(typedEffect['hp% recover on battle win high']);
      }

      const results = [];

      if (healLow !== 0 || healHigh !== 0) {
        results.push(Object.assign({
          id: 'passive:16',
          originalId,
          sources,
          value: {
            healLow,
            healHigh
          },
          conditions: Object.assign(Object.assign({}, conditionInfo), {
            onBattleWin: true
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('17', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '17',
        effectKeyLow: 'hp drain% low',
        effectKeyHigh: 'hp drain% high',
        effectKeyChance: 'hp drain chance%',
        buffKeyLow: 'drainHealLow',
        buffKeyHigh: 'drainHealHigh',
        buffId: 'passive:17'
      });
    });
    map.set('19', (effect, context, injectionContext) => {
      const originalId = '19';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const dropRates = {
        bc: '0',
        hc: '0',
        item: '0',
        zel: '0',
        karma: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        [dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
      } else {
        DROP_TYPES_ORDER.forEach(dropType => {
          dropRates[dropType] = typedEffect[`${dropType} drop rate% buff`];
        });
      }

      DROP_TYPES_ORDER.forEach(dropType => {
        const value = parseNumberOrDefault(dropRates[dropType]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:19:${dropType}`,
            originalId,
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('20', (effect, context, injectionContext) => {
      const originalId = '20';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const inflictedAilments = [];
      const typedEffect = effect;
      let unknownParams;

      if (typedEffect.params) {
        let params = splitEffectParams(typedEffect);

        if (params.length % 2 !== 0 && params[params.length - 1] !== '0') {
          unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(-1), params.length - 1, injectionContext);
          params = params.slice(0, params.length - 1);
        }

        const numParams = params.length;

        for (let index = 0; index < numParams; index += 2) {
          const ailmentValue = params[index];
          const chance = parseNumberOrDefault(params[index + 1]);

          if (ailmentValue !== '0' || chance !== 0) {
            const ailmentType = AILMENT_MAPPING[ailmentValue] || Ailment.Unknown;
            inflictedAilments.push({
              ailment: ailmentType,
              chance
            });
          }
        }
      } else {
        Object.values(AILMENT_MAPPING).forEach(ailment => {
          let effectKey;

          if (ailment === Ailment.Weak) {
            effectKey = 'weaken%';
          } else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
            effectKey = ailment;
          } else {
            effectKey = `${ailment}%`;
          }

          if (effectKey in effect) {
            inflictedAilments.push({
              ailment,
              chance: parseNumberOrDefault(typedEffect[effectKey])
            });
          }
        });
      }

      const results = [];
      inflictedAilments.forEach(({
        ailment,
        chance
      }) => {
        if (chance !== 0) {
          results.push(Object.assign({
            id: `passive:20:${ailment}`,
            originalId,
            sources,
            value: chance,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('21', (effect, context, injectionContext) => {
      const originalId = '21';
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
        crit: '0'
      };
      let turnDuration = 0;
      let unknownParams;

      if (typedEffect.params) {
        let rawDuration, extraParams;
        [stats.atk, stats.def, stats.rec, stats.crit, rawDuration, ...extraParams] = splitEffectParams(typedEffect);
        turnDuration = parseNumberOrDefault(rawDuration);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
      } else {
        stats.atk = typedEffect['first x turns atk% (1)'];
        stats.def = typedEffect['first x turns def% (3)'];
        stats.rec = typedEffect['first x turns rec% (5)'];
        stats.crit = typedEffect['first x turns crit% (7)'];
        turnDuration = parseNumberOrDefault(typedEffect['first x turns']);
      }

      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (stat !== 'hp' && value !== 0) {
          const entry = Object.assign({
            id: `passive:21:${stat}`,
            originalId,
            sources,
            value,
            duration: turnDuration,
            conditions: Object.assign({}, conditionInfo)
          }, targetData);
          results.push(entry);
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('23', (effect, context, injectionContext) => {
      const originalId = '23';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let fillLow, fillHigh;
      let unknownParams;

      if (typedEffect.params) {
        const [rawFillLow, rawFillHigh, ...extraParams] = splitEffectParams(typedEffect);
        fillLow = parseNumberOrDefault(rawFillLow) / 100;
        fillHigh = parseNumberOrDefault(rawFillHigh) / 100;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
      } else {
        fillLow = parseNumberOrDefault(typedEffect['battle end bc fill low']);
        fillHigh = parseNumberOrDefault(typedEffect['battle end bc fill high']);
      }

      const results = [];

      if (fillLow !== 0 || fillHigh !== 0) {
        results.push(Object.assign({
          id: 'passive:23',
          originalId,
          sources,
          value: {
            fillLow,
            fillHigh
          },
          conditions: Object.assign(Object.assign({}, conditionInfo), {
            onBattleWin: true
          })
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('24', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '24',
        effectKeyLow: 'dmg% to hp when attacked low',
        effectKeyHigh: 'dmg% to hp when attacked high',
        effectKeyChance: 'dmg% to hp when attacked chance%',
        buffKeyLow: 'healLow',
        buffKeyHigh: 'healHigh',
        generateBaseConditions: () => ({
          whenAttacked: true
        }),
        buffId: 'passive:24'
      });
    });
    map.set('25', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '25',
        effectKeyLow: 'bc fill when attacked low',
        effectKeyHigh: 'bc fill when attacked high',
        effectKeyChance: 'bc fill when attacked%',
        buffKeyLow: 'fillLow',
        buffKeyHigh: 'fillHigh',
        parseParamValue: rawValue => parseNumberOrDefault(rawValue) / 100,
        generateBaseConditions: () => ({
          whenAttacked: true
        }),
        buffId: 'passive:25'
      });
    });
    map.set('26', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '26',
        effectKeyLow: 'dmg% reflect low',
        effectKeyHigh: 'dmg% reflect high',
        effectKeyChance: 'dmg% reflect chance%',
        buffKeyLow: 'damageReflectLow',
        buffKeyHigh: 'damageReflectHigh',
        generateBaseConditions: () => ({
          whenAttacked: true
        }),
        buffId: 'passive:26'
      });
    });
    map.set('27', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'target% chance',
        buffId: 'passive:27',
        originalId: '27'
      });
    });
    map.set('28', (effect, context, injectionContext) => {
      const originalId = '28';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let value = 0;
      let thresholdInfo;
      let unknownParams;

      if (typedEffect.params) {
        const [rawValue, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
        value = parseNumberOrDefault(rawValue);
        thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      } else {
        value = parseNumberOrDefault(typedEffect['target% chance']);
        thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp, 'passive requirement');
      }

      const results = [];

      if (value !== 0) {
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        const entry = Object.assign({
          id: 'passive:28',
          originalId,
          sources,
          value,
          conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions)
        }, targetData);
        results.push(entry);
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('29', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'ignore def%',
        buffId: 'passive:29',
        originalId: '29'
      });
    });
    map.set('30', (effect, context, injectionContext) => {
      const originalId = '30';
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
        crit: '0'
      };
      let thresholdInfo;
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawRequireAboveFlag;
        let rawThreshold;
        [stats.atk, stats.def, stats.rec, stats.crit, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
        thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Bb);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
        thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Bb);
      }

      const thresholdConditions = getThresholdConditions(thresholdInfo);
      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (stat !== 'hp' && value !== 0) {
          const entry = Object.assign({
            id: `passive:30:${stat}`,
            originalId,
            sources,
            value,
            conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions)
          }, targetData);
          results.push(entry);
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('31', (effect, context, injectionContext) => {
      const originalId = '31';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const dropRates = {
        bc: '0',
        hc: '0',
        item: '0',
        zel: '0',
        karma: '0'
      };
      let sparkDamageBoost = 0;
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawSparkDamageBoost;
        [rawSparkDamageBoost, dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);
        sparkDamageBoost = parseNumberOrDefault(rawSparkDamageBoost);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        sparkDamageBoost = parseNumberOrDefault(typedEffect['damage% for spark']);
        DROP_TYPES_ORDER.forEach(dropType => {
          dropRates[dropType] = typedEffect[`${dropType} drop% for spark`];
        });
      }

      const results = [];

      if (sparkDamageBoost !== 0) {
        results.push(Object.assign({
          id: 'passive:31:damage',
          originalId,
          sources,
          value: sparkDamageBoost,
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      DROP_TYPES_ORDER.forEach(dropType => {
        const value = parseNumberOrDefault(dropRates[dropType]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:31:${dropType}`,
            originalId,
            sources,
            value,
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('32', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'bb gauge fill rate%',
        buffId: 'passive:32',
        originalId: '32'
      });
    });
    map.set('33', (effect, context, injectionContext) => {
      const originalId = '33';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let healLow, healHigh, addedRec;
      let unknownParams;

      if (typedEffect.params) {
        const [rawHealLow, rawHealHigh, rawAddedRec, ...extraParams] = splitEffectParams(typedEffect);
        healLow = parseNumberOrDefault(rawHealLow);
        healHigh = parseNumberOrDefault(rawHealHigh);
        addedRec = (1 + parseNumberOrDefault(rawAddedRec) / 100) * 10;
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      } else {
        healLow = parseNumberOrDefault(typedEffect['turn heal low']);
        healHigh = parseNumberOrDefault(typedEffect['turn heal high']);
        addedRec = parseNumberOrDefault(typedEffect['rec% added (turn heal)']);
      }

      const results = [];

      if (healLow !== 0 || healHigh !== 0) {
        results.push(Object.assign({
          id: 'passive:33',
          originalId,
          sources,
          value: {
            healLow,
            healHigh,
            'addedRec%': addedRec
          },
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('34', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'crit multiplier%',
        buffId: 'passive:34',
        originalId: '34',
        parseParamValue: rawValue => parseNumberOrDefault(rawValue) * 100
      });
    });
    map.set('35', (effect, context, injectionContext) => {
      return parsePassiveWithNumericalValueRangeAndChance({
        effect,
        context,
        injectionContext,
        originalId: '35',
        effectKeyLow: 'bc fill when attacking low',
        effectKeyHigh: 'bc fill when attacking high',
        effectKeyChance: 'bc fill when attacking%',
        buffKeyLow: 'fillLow',
        buffKeyHigh: 'fillHigh',
        parseParamValue: rawValue => parseNumberOrDefault(rawValue) / 100,
        generateBaseConditions: () => ({
          onNormalAttack: true
        }),
        buffId: 'passive:35'
      });
    });
    map.set('36', (effect, context, injectionContext) => {
      const originalId = '36';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let additionalActions = 0,
          damageModifier = 0,
          chance = 0;
      let unknownParams;

      if (typedEffect.params) {
        const [rawAdditionalActions, rawDamageModifier, rawChance, ...extraParams] = splitEffectParams(typedEffect);
        additionalActions = parseNumberOrDefault(rawAdditionalActions);
        damageModifier = parseNumberOrDefault(rawDamageModifier);
        chance = parseNumberOrDefault(rawChance);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
      } else {
        additionalActions = parseNumberOrDefault(typedEffect['additional actions']);
      }

      const results = [];

      if (additionalActions !== 0 || damageModifier !== 0 || chance !== 0) {
        results.push(Object.assign({
          id: 'passive:36',
          originalId,
          sources,
          value: {
            additionalActions,
            damageModifier,
            chance
          },
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('37', (effect, context, injectionContext) => {
      const originalId = '37';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      let hitIncreasePerHit = 0,
          extraHitDamage = 0;
      let unknownParams;

      if (typedEffect.params) {
        const params = splitEffectParams(typedEffect);
        hitIncreasePerHit = parseNumberOrDefault(params[0]);
        extraHitDamage = parseNumberOrDefault(params[2]);
        const extraParams = ['0', params[1], '0', ...params.slice(3)];
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
      } else {
        hitIncreasePerHit = parseNumberOrDefault(typedEffect['hit increase/hit']);
        extraHitDamage = parseNumberOrDefault(typedEffect['extra hits dmg%']);
      }

      const results = [];

      if (hitIncreasePerHit !== 0 || extraHitDamage !== 0) {
        results.push(Object.assign({
          id: 'passive:37',
          originalId,
          sources,
          value: {
            hitIncreasePerHit,
            extraHitDamage
          },
          conditions: Object.assign({}, conditionInfo)
        }, targetData));
      }

      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('40', (effect, context, injectionContext) => {
      const originalId = '40';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const coreStatProperties = ['atk', 'def', 'rec'];
      const coreStatPropertyMapping = {
        1: 'atk',
        2: 'def',
        3: 'rec',
        4: 'hp'
      };
      const effectToCoreStatMapping = {
        attack: 'atk',
        defense: 'def',
        recovery: 'rec',
        hp: 'hp'
      };
      const stats = {
        atk: '0',
        def: '0',
        rec: '0'
      };
      let convertedStat = 'unknown';
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawConvertedStat;
        [rawConvertedStat, stats.atk, stats.def, stats.rec, ...extraParams] = splitEffectParams(typedEffect);
        convertedStat = coreStatPropertyMapping[rawConvertedStat] || 'unknown';
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
      } else {
        const rawConvertedStat = typedEffect['converted attribute'];

        if (rawConvertedStat in effectToCoreStatMapping) {
          convertedStat = effectToCoreStatMapping[rawConvertedStat];
        } else {
          convertedStat = 'unknown';
        }

        coreStatProperties.forEach(statType => {
          const effectKey = `${statType}% buff`;

          if (effectKey in typedEffect) {
            stats[statType] = typedEffect[effectKey];
          }
        });
      }

      const results = [];
      coreStatProperties.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:40:${stat}`,
            originalId,
            sources,
            value: {
              convertedStat,
              value
            },
            conditions: Object.assign({}, conditionInfo)
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('41', (effect, context, injectionContext) => {
      const originalId = '41';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const typedEffect = effect;
      const results = [];
      const stats = {
        minimumElements: '0',
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        hp: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        [stats.minimumElements, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        stats.minimumElements = typedEffect['unique elements required'];
        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      const minimumElements = parseNumberOrDefault(stats.minimumElements);
      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:41:${stat}`,
            originalId,
            sources,
            value: +value,
            conditions: Object.assign(Object.assign({}, conditionInfo), {
              minumumUniqueElements: minimumElements
            })
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('42', (effect, context, injectionContext) => {
      const originalId = '42';
      const {
        conditionInfo,
        targetData,
        sources
      } = retrieveCommonInfoForEffects(effect, context, injectionContext);
      const GENDER_MAPPING = {
        0: UnitGender.Other,
        1: UnitGender.Male,
        2: UnitGender.Female
      };
      const typedEffect = effect;
      const results = [];
      const stats = {
        gender: '',
        atk: '0',
        def: '0',
        rec: '0',
        crit: '0',
        hp: '0'
      };
      let unknownParams;

      if (typedEffect.params) {
        let extraParams;
        let rawGender;
        [rawGender, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
        stats.gender = GENDER_MAPPING[rawGender] || 'unknown';
        unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
      } else {
        stats.gender = typedEffect['gender required'];
        stats.hp = typedEffect['hp% buff'];
        stats.atk = typedEffect['atk% buff'];
        stats.def = typedEffect['def% buff'];
        stats.rec = typedEffect['rec% buff'];
        stats.crit = typedEffect['crit% buff'];
      }

      const targetGender = stats.gender || 'unknown';
      STATS_ORDER.forEach(stat => {
        const value = parseNumberOrDefault(stats[stat]);

        if (value !== 0) {
          results.push(Object.assign({
            id: `passive:42:${stat}`,
            originalId,
            sources,
            value: +value,
            conditions: Object.assign(Object.assign({}, conditionInfo), {
              targetGender
            })
          }, targetData));
        }
      });
      handlePostParse(results, unknownParams, {
        originalId,
        sources,
        targetData,
        conditionInfo
      });
      return results;
    });
    map.set('43', (effect, context, injectionContext) => {
      return parsePassiveWithSingleNumericalParameter({
        effect,
        context,
        injectionContext,
        effectKey: 'take 1 dmg%',
        buffId: 'passive:43',
        originalId: '43'
      });
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
    const conversionFunction = id && getPassiveEffectToBuffMapping(context.reloadMapping).get(id); // TODO: warning if result is empty?

    return typeof conversionFunction === 'function' ? conversionFunction(effect, context) : defaultConversionFunction$1(effect, context);
  }

  const BUFF_METADATA = Object.freeze(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
    'TURN_DURATION_MODIFICATION': {
      id: BuffId.TURN_DURATION_MODIFICATION,
      name: 'Passive Turn Duration Modification',
      stat: UnitStat.turnDurationModification,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value.duration && buff.value.duration < 0 ? IconId.TURN_DURATION_DOWN : IconId.TURN_DURATION_UP]
    },
    'NO_PARAMS_SPECIFIED': {
      id: BuffId.NO_PARAMS_SPECIFIED,
      name: 'No Parameters Specified',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.UNKNOWN]
    },
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
    'passive:8': {
      id: BuffId['passive:8'],
      name: 'Passive Damage Reduction',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DAMAGECUT]
    },
    'passive:9': {
      id: BuffId['passive:9'],
      name: 'Passive Gradual BB Gauge Fill',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BBREC]
    },
    'passive:10': {
      id: BuffId['passive:10'],
      name: 'Passive HC Efficacy',
      stat: UnitStat.hcEfficacy,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HCREC]
    },
    'passive:11:atk': {
      id: BuffId['passive:11:atk'],
      name: 'Passive HP-Conditional Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHATKDOWN : IconId.BUFF_HPTHRESHATKUP]
    },
    'passive:11:def': {
      id: BuffId['passive:11:def'],
      name: 'Passive HP-Conditional Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHDEFDOWN : IconId.BUFF_HPTHRESHDEFUP]
    },
    'passive:11:rec': {
      id: BuffId['passive:11:rec'],
      name: 'Passive HP-Conditional Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHRECDOWN : IconId.BUFF_HPTHRESHRECUP]
    },
    'passive:11:crit': {
      id: BuffId['passive:11:crit'],
      name: 'Passive HP-Conditional Critical Hit Rate Boost',
      stat: UnitStat.crit,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHCRTRATEDOWN : IconId.BUFF_HPTHRESHCRTRATEUP]
    },
    'passive:12:bc': {
      id: BuffId['passive:12:bc'],
      name: 'Passive HP-Conditional Battle Crystal Drop Rate Boost',
      stat: UnitStat.bcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHBCDOWN : IconId.BUFF_HPTHRESHBCDROP]
    },
    'passive:12:hc': {
      id: BuffId['passive:12:hc'],
      name: 'Passive HP-Conditional Heart Crystal Drop Rate Boost',
      stat: UnitStat.hcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHHCDOWN : IconId.BUFF_HPTHRESHHCDROP]
    },
    'passive:12:item': {
      id: BuffId['passive:12:item'],
      name: 'Passive HP-Conditional Item Drop Rate Boost',
      stat: UnitStat.itemDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHITEMDOWN : IconId.BUFF_HPTHRESHITEMDROP]
    },
    'passive:12:zel': {
      id: BuffId['passive:12:zel'],
      name: 'Passive HP-Conditional Zel Drop Rate Boost',
      stat: UnitStat.zelDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHZELDOWN : IconId.BUFF_HPTHRESHZELDROP]
    },
    'passive:12:karma': {
      id: BuffId['passive:12:karma'],
      name: 'Passive HP-Conditional Karma Drop Rate Boost',
      stat: UnitStat.karmaDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHKARMADOWN : IconId.BUFF_HPTHRESHKARMADROP]
    },
    'passive:13': {
      id: BuffId['passive:13'],
      name: 'Passive BB Gauge Fill on Enemy Defeat',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BBREC]
    },
    'passive:14': {
      id: BuffId['passive:14'],
      name: 'Passive Damage Reduction (Chance)',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DAMAGECUT]
    },
    'passive:15': {
      id: BuffId['passive:15'],
      name: 'Passive Heal on Enemy Defeat',
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HPREC]
    },
    'passive:16': {
      id: BuffId['passive:16'],
      name: 'Passive Heal on Battle Win',
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HPREC]
    },
    'passive:17': {
      id: BuffId['passive:17'],
      name: 'HP Absorption',
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HPABS]
    },
    'passive:19:bc': {
      id: BuffId['passive:19:bc'],
      name: 'Passive Battle Crystal Drop Rate Boost',
      stat: UnitStat.bcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP]
    },
    'passive:19:hc': {
      id: BuffId['passive:19:hc'],
      name: 'Passive Heart Crystal Drop Rate Boost',
      stat: UnitStat.hcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP]
    },
    'passive:19:item': {
      id: BuffId['passive:19:item'],
      name: 'Passive Item Drop Rate Boost',
      stat: UnitStat.itemDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP]
    },
    'passive:19:zel': {
      id: BuffId['passive:19:zel'],
      name: 'Passive Zel Drop Rate Boost',
      stat: UnitStat.zelDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_ZELDROP]
    },
    'passive:19:karma': {
      id: BuffId['passive:19:karma'],
      name: 'Passive Karma Drop Rate Boost',
      stat: UnitStat.karmaDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_KARMADROP]
    },
    'passive:20:poison': {
      id: BuffId['passive:20:poison'],
      name: 'Passive Poison Infliction',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDPOISON]
    },
    'passive:20:weak': {
      id: BuffId['passive:20:weak'],
      name: 'Passive Weak Infliction',
      stat: UnitStat.weakInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDWEAK]
    },
    'passive:20:sick': {
      id: BuffId['passive:20:sick'],
      name: 'Passive Sick Infliction',
      stat: UnitStat.sickInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDSICK]
    },
    'passive:20:injury': {
      id: BuffId['passive:20:injury'],
      name: 'Passive Injury Infliction',
      stat: UnitStat.injuryInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDINJURY]
    },
    'passive:20:curse': {
      id: BuffId['passive:20:curse'],
      name: 'Passive Curse Infliction',
      stat: UnitStat.curseInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDCURSE]
    },
    'passive:20:paralysis': {
      id: BuffId['passive:20:paralysis'],
      name: 'Passive Paralysis Infliction',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDPARA]
    },
    'passive:20:atk down': {
      id: BuffId['passive:20:atk down'],
      name: 'Passive Attack Reduction Infliction',
      stat: UnitStat.atkDownInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDATKDOWN]
    },
    'passive:20:def down': {
      id: BuffId['passive:20:def down'],
      name: 'Passive Defense Reduction Infliction',
      stat: UnitStat.defDownInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDDEFDOWN]
    },
    'passive:20:rec down': {
      id: BuffId['passive:20:rec down'],
      name: 'Passive Recovery Reduction Infliction',
      stat: UnitStat.recDownInflict,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_ADDRECDOWN]
    },
    'passive:20:unknown': {
      id: BuffId['passive:20:unknown'],
      name: 'Passive Unknown Ailment Infliction',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.BUFF_ADDAILMENT]
    },
    'passive:21:atk': {
      id: BuffId['passive:21:atk'],
      name: 'Attack Boost for X Turns',
      stat: UnitStat.atk,
      stackType: BuffStackType.ConditionalTimed,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP]
    },
    'passive:21:def': {
      id: BuffId['passive:21:def'],
      name: 'Defense Boost for X Turns',
      stat: UnitStat.def,
      stackType: BuffStackType.ConditionalTimed,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP]
    },
    'passive:21:rec': {
      id: BuffId['passive:21:rec'],
      name: 'Recovery Boost for X Turns',
      stat: UnitStat.rec,
      stackType: BuffStackType.ConditionalTimed,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP]
    },
    'passive:21:crit': {
      id: BuffId['passive:21:crit'],
      name: 'Critical Hit Rate Boost for X Turns',
      stat: UnitStat.crit,
      stackType: BuffStackType.ConditionalTimed,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP]
    },
    'passive:23': {
      id: BuffId['passive:23'],
      name: 'Passive BC Fill on Battle Win',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BBREC]
    },
    'passive:24': {
      id: BuffId['passive:24'],
      name: 'Passive Heal when Attacked',
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BEENATK_HPREC]
    },
    'passive:25': {
      id: BuffId['passive:25'],
      name: 'Passive BC Fill when Attacked',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DAMAGEBB]
    },
    'passive:26': {
      id: BuffId['passive:26'],
      name: 'Passive Damage Counter',
      stat: UnitStat.damageReflect,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_COUNTERDAMAGE]
    },
    'passive:27': {
      id: BuffId['passive:27'],
      name: 'Passive Target Chance Modification',
      stat: UnitStat.targetingModification,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_REPENEATT : IconId.BUFF_GETENEATT]
    },
    'passive:28': {
      id: BuffId['passive:28'],
      name: 'Passive HP-Conditional Target Chance Modification',
      stat: UnitStat.targetingModification,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHREPENEATT : IconId.BUFF_HPTHRESHGETENEATT]
    },
    'passive:29': {
      id: BuffId['passive:29'],
      name: 'Passive Defense Ignore (Chance)',
      stat: UnitStat.defenseIgnore,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_IGNOREDEF]
    },
    'passive:30:atk': {
      id: BuffId['passive:30:atk'],
      name: 'Passive BB Gauge Conditional Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BBGAUGETHRESHATKDOWN : IconId.BUFF_BBGAUGETHRESHATKUP]
    },
    'passive:30:def': {
      id: BuffId['passive:30:def'],
      name: 'Passive BB Gauge Conditional Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BBGAUGETHRESHDEFDOWN : IconId.BUFF_BBGAUGETHRESHDEFUP]
    },
    'passive:30:rec': {
      id: BuffId['passive:30:rec'],
      name: 'Passive BB Gauge Conditional Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BBGAUGETHRESHRECDOWN : IconId.BUFF_BBGAUGETHRESHRECUP]
    },
    'passive:30:crit': {
      id: BuffId['passive:30:crit'],
      name: 'Passive BB Gauge Conditional Critical Hit Rate Boost',
      stat: UnitStat.crit,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN : IconId.BUFF_BBGAUGETHRESHCRTRATEUP]
    },
    'passive:31:damage': {
      id: BuffId['passive:31:damage'],
      name: 'Passive Spark Damage Boost',
      stat: UnitStat.sparkDamage,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP]
    },
    'passive:31:bc': {
      id: BuffId['passive:31:bc'],
      name: 'Passive Battle Crystal Drop Rate Boost during Spark',
      stat: UnitStat.bcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_SPARKBC]
    },
    'passive:31:hc': {
      id: BuffId['passive:31:hc'],
      name: 'Passive Heart Crystal Drop Rate Boost during Spark',
      stat: UnitStat.hcDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_SPARKHC]
    },
    'passive:31:item': {
      id: BuffId['passive:31:item'],
      name: 'Passive Item Drop Rate Boost during Spark',
      stat: UnitStat.itemDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_SPARKITEM]
    },
    'passive:31:zel': {
      id: BuffId['passive:31:zel'],
      name: 'Passive Zel Drop Rate Boost during Spark',
      stat: UnitStat.zelDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_SPARKZEL]
    },
    'passive:31:karma': {
      id: BuffId['passive:31:karma'],
      name: 'Passive Karma Drop Rate Boost during Spark',
      stat: UnitStat.karmaDropRate,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_SPARKKARMA]
    },
    'passive:32': {
      id: BuffId['passive:32'],
      name: 'Passive BC Efficacy',
      stat: UnitStat.bcEfficacy,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BBFILL]
    },
    'passive:33': {
      id: BuffId['passive:33'],
      name: 'Passive Gradual Heal',
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HPREC]
    },
    'passive:34': {
      id: BuffId['passive:34'],
      name: 'Passive Critical Damage Boost',
      stat: UnitStat.criticalDamage,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_CRTUP]
    },
    'passive:35': {
      id: BuffId['passive:35'],
      name: 'Passive BB Gauge Fill when Normal Attacking',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_BBREC]
    },
    'passive:36': {
      id: BuffId['passive:36'],
      name: 'Passive Extra Action',
      stat: UnitStat.extraAction,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DBLSTRIKE]
    },
    'passive:37': {
      id: BuffId['passive:37'],
      name: 'Passive Hit Count Boost',
      stat: UnitStat.hitCountModification,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_HITUP]
    },
    'passive:40:atk': {
      id: BuffId['passive:40:atk'],
      name: 'Passive Converted Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP]
    },
    'passive:40:def': {
      id: BuffId['passive:40:def'],
      name: 'Passive Converted Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP]
    },
    'passive:40:rec': {
      id: BuffId['passive:40:rec'],
      name: 'Passive Converted Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP]
    },
    'passive:41:hp': {
      id: BuffId['passive:41:hp'],
      name: 'Passive Element Squad-based HP Boost',
      stat: UnitStat.hp,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_UNIQUEELEMENTHPDOWN : IconId.BUFF_UNIQUEELEMENTHPUP]
    },
    'passive:41:atk': {
      id: BuffId['passive:41:atk'],
      name: 'Passive Element Squad-based Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_UNIQUEELEMENTATKDOWN : IconId.BUFF_UNIQUEELEMENTATKUP]
    },
    'passive:41:def': {
      id: BuffId['passive:41:def'],
      name: 'Passive Element Squad-based Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_UNIQUEELEMENTDEFDOWN : IconId.BUFF_UNIQUEELEMENTDEFUP]
    },
    'passive:41:rec': {
      id: BuffId['passive:41:rec'],
      name: 'Passive Element Squad-based Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_UNIQUEELEMENTRECDOWN : IconId.BUFF_UNIQUEELEMENTRECUP]
    },
    'passive:41:crit': {
      id: BuffId['passive:41:crit'],
      name: 'Passive Element Squad-based Critical Hit Rate Boost',
      stat: UnitStat.crit,
      stackType: BuffStackType.Passive,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_UNIQUEELEMENTCRTRATEDOWN : IconId.BUFF_UNIQUEELEMENTCRTRATEUP]
    }
  }), (() => {
    const createIconGetterForStat = stat => {
      return buff => {
        let gender = '';
        let polarity = 'UP';

        if (buff) {
          if (buff.value && buff.value < 0) {
            polarity = 'DOWN';
          }

          if (buff.conditions) {
            gender = buff.conditions.targetGender || '';
          }
        }

        if (typeof gender !== 'string' || !gender) {
          gender = 'unknown';
        }

        let iconKey = `BUFF_${gender.toUpperCase()}${stat}${polarity}`;

        if (!gender || !(iconKey in IconId)) {
          iconKey = `BUFF_GENDER${stat}${polarity}`;
        }

        return [IconId[iconKey]];
      };
    };

    return {
      'passive:42:hp': {
        id: BuffId['passive:42:hp'],
        name: 'Passive Gender-Based HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('HP')
      },
      'passive:42:atk': {
        id: BuffId['passive:42:atk'],
        name: 'Passive Gender-Based Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('ATK')
      },
      'passive:42:def': {
        id: BuffId['passive:42:def'],
        name: 'Passive Gender-Based Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('DEF')
      },
      'passive:42:rec': {
        id: BuffId['passive:42:rec'],
        name: 'Passive Gender-Based Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('REC')
      },
      'passive:42:crit': {
        id: BuffId['passive:42:crit'],
        name: 'Passive Gender-Based Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: createIconGetterForStat('CRTRATE')
      }
    };
  })()), {
    'passive:43': {
      id: BuffId['passive:43'],
      name: 'Passive Damage Reduction To One (Chance)',
      stat: UnitStat.reduceDamageToOne,
      stackType: BuffStackType.Passive,
      icons: () => [IconId.BUFF_DAMAGECUTTOONE]
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
      stat: UnitStat.hpRecovery,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_HPREC]
    },
    'proc:3': {
      id: BuffId['proc:3'],
      name: 'Active Gradual Heal',
      stat: UnitStat.hpRecovery,
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
  })()), {
    'proc:6:bc': {
      id: BuffId['proc:6:bc'],
      name: 'Active Battle Crystal Drop Rate Boost',
      stat: UnitStat.bcDropRate,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP]
    },
    'proc:6:hc': {
      id: BuffId['proc:6:hc'],
      name: 'Active Heart Crystal Drop Rate Boost',
      stat: UnitStat.hcDropRate,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP]
    },
    'proc:6:item': {
      id: BuffId['proc:6:item'],
      name: 'Active Item Drop Rate Boost',
      stat: UnitStat.itemDropRate,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP]
    },
    'proc:7': {
      id: BuffId['proc:7'],
      name: 'Guaranteed KO Resistance',
      stat: UnitStat.koResistance,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_KOBLK]
    },
    'proc:8:flat': {
      id: BuffId['proc:8:flat'],
      name: 'Max HP Boost (Flat Amount)',
      stat: UnitStat.hp,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_HPUP]
    },
    'proc:8:percent': {
      id: BuffId['proc:8:percent'],
      name: 'Max HP Boost (Percentage)',
      stat: UnitStat.hp,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_HPUP]
    }
  }), (() => {
    const createIconGetterForStat = stat => {
      return buff => {
        let element = '';
        let hasElement = false;
        let polarity = 'DOWN'; // default to down since these are reduction buffs

        if (buff) {
          if (buff.value && buff.value > 0) {
            polarity = 'UP';
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
      'proc:9:atk': {
        id: BuffId['proc:9:atk'],
        name: 'Active Regular/Elemental Attack Reduction',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('ATK')
      },
      'proc:9:def': {
        id: BuffId['proc:9:def'],
        name: 'Active Regular/Elemental Defense Reduction',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('DEF')
      },
      'proc:9:rec': {
        id: BuffId['proc:9:rec'],
        name: 'Active Regular/Elemental Recovery Reduction',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: createIconGetterForStat('REC')
      },
      'proc:9:unknown': {
        id: BuffId['proc:9:unknown'],
        name: 'Active Regular/Elemental Unknown Stat Reduction',
        stackType: BuffStackType.Active,
        icons: () => [IconId.UNKNOWN]
      }
    };
  })()), {
    'proc:10:poison': {
      id: BuffId['proc:10:poison'],
      name: 'Poison Cleanse',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_POISONBLK]
    },
    'proc:10:weak': {
      id: BuffId['proc:10:weak'],
      name: 'Weak Cleanse',
      stat: UnitStat.weakResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_WEAKBLK]
    },
    'proc:10:sick': {
      id: BuffId['proc:10:sick'],
      name: 'Sick Cleanse',
      stat: UnitStat.sickResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_SICKBLK]
    },
    'proc:10:injury': {
      id: BuffId['proc:10:injury'],
      name: 'Injury Cleanse',
      stat: UnitStat.injuryResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_INJURYBLK]
    },
    'proc:10:curse': {
      id: BuffId['proc:10:curse'],
      name: 'Curse Cleanse',
      stat: UnitStat.curseResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_CURSEBLK]
    },
    'proc:10:paralysis': {
      id: BuffId['proc:10:paralysis'],
      name: 'Paralysis Cleanse',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_PARALYSISBLK]
    },
    'proc:10:atk down': {
      id: BuffId['proc:10:atk down'],
      name: 'Attack Reduction Cleanse',
      stat: UnitStat.atkDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_ATKDOWNBLK]
    },
    'proc:10:def down': {
      id: BuffId['proc:10:def down'],
      name: 'Defense Reduction Cleanse',
      stat: UnitStat.defDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_DEFDOWNBLK]
    },
    'proc:10:rec down': {
      id: BuffId['proc:10:rec down'],
      name: 'Recovery Reduction Cleanse',
      stat: UnitStat.recDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_RECDOWNBLK]
    },
    'proc:10:unknown': {
      id: BuffId['proc:10:unknown'],
      name: 'Unknown Ailment Cleanse',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.BUFF_AILMENTBLK]
    },
    'proc:11:poison': {
      id: BuffId['proc:11:poison'],
      name: 'Poison Infliction',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_POISON]
    },
    'proc:11:weak': {
      id: BuffId['proc:11:weak'],
      name: 'Weak Infliction',
      stat: UnitStat.weakInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_WEAK]
    },
    'proc:11:sick': {
      id: BuffId['proc:11:sick'],
      name: 'Sick Infliction',
      stat: UnitStat.sickInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_SICK]
    },
    'proc:11:injury': {
      id: BuffId['proc:11:injury'],
      name: 'Injury Infliction',
      stat: UnitStat.injuryInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_INJURY]
    },
    'proc:11:curse': {
      id: BuffId['proc:11:curse'],
      name: 'Curse Infliction',
      stat: UnitStat.curseInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_CURSE]
    },
    'proc:11:paralysis': {
      id: BuffId['proc:11:paralysis'],
      name: 'Paralysis Infliction',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.DEBUFF_PARALYSIS]
    },
    'proc:11:atk down': {
      id: BuffId['proc:11:atk down'],
      name: 'Attack Reduction Infliction',
      stat: UnitStat.atkDownInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_ATKDOWN]
    },
    'proc:11:def down': {
      id: BuffId['proc:11:def down'],
      name: 'Defense Reduction Infliction',
      stat: UnitStat.defDownInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_DEFDOWN]
    },
    'proc:11:rec down': {
      id: BuffId['proc:11:rec down'],
      name: 'Recovery Reduction Infliction',
      stat: UnitStat.recDownInflict,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_RECDOWN]
    },
    'proc:11:unknown': {
      id: BuffId['proc:11:unknown'],
      name: 'Unknown Ailment Infliction',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.DEBUFF_AILMENT]
    },
    'proc:12': {
      id: BuffId['proc:12'],
      name: 'Instant Revive (Guaranteed)',
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_KOBLK]
    },
    'proc:13': {
      id: BuffId['proc:13'],
      name: 'Random Target Damage',
      stackType: BuffStackType.Attack,
      icons: () => [IconId.ATK_RT]
    },
    'proc:14': {
      id: BuffId['proc:14'],
      name: 'Lifesteal Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST_HPREC : IconId.ATK_AOE_HPREC]
    },
    'proc:16:fire': {
      id: BuffId['proc:16:fire'],
      name: 'Active Fire Damage Reduction',
      stat: UnitStat.fireMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_FIREDMGDOWN]
    },
    'proc:16:water': {
      id: BuffId['proc:16:water'],
      name: 'Active Water Damage Reduction',
      stat: UnitStat.waterMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_WATERDMGDOWN]
    },
    'proc:16:earth': {
      id: BuffId['proc:16:earth'],
      name: 'Active Earth Damage Reduction',
      stat: UnitStat.earthMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_EARTHDMGDOWN]
    },
    'proc:16:thunder': {
      id: BuffId['proc:16:thunder'],
      name: 'Active Thunder Damage Reduction',
      stat: UnitStat.thunderMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_THUNDERDMGDOWN]
    },
    'proc:16:light': {
      id: BuffId['proc:16:light'],
      name: 'Active Light Damage Reduction',
      stat: UnitStat.lightMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_LIGHTDMGDOWN]
    },
    'proc:16:dark': {
      id: BuffId['proc:16:dark'],
      name: 'Active Dark Damage Reduction',
      stat: UnitStat.darkMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_DARKDMGDOWN]
    },
    'proc:16:all': {
      id: BuffId['proc:16:all'],
      name: 'Active Elemental Damage Reduction (All Elements)',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ELEMENTDMGDOWN]
    },
    'proc:16:unknown': {
      id: BuffId['proc:16:unknown'],
      name: 'Active Elemental Damage Reduction (Unspecified Element)',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ELEMENTDMGDOWN]
    },
    'proc:17:poison': {
      id: BuffId['proc:17:poison'],
      name: 'Active Poison Resist',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_POISONBLK]
    },
    'proc:17:weak': {
      id: BuffId['proc:17:weak'],
      name: 'Active Weak Resist',
      stat: UnitStat.weakResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_WEAKBLK]
    },
    'proc:17:sick': {
      id: BuffId['proc:17:sick'],
      name: 'Active Sick Resist',
      stat: UnitStat.sickResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_SICKBLK]
    },
    'proc:17:injury': {
      id: BuffId['proc:17:injury'],
      name: 'Active Injury Resist',
      stat: UnitStat.injuryResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_INJURYBLK]
    },
    'proc:17:curse': {
      id: BuffId['proc:17:curse'],
      name: 'Active Curse Resist',
      stat: UnitStat.curseResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_CURSEBLK]
    },
    'proc:17:paralysis': {
      id: BuffId['proc:17:paralysis'],
      name: 'Active Paralysis Resist',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_PARALYSISBLK]
    },
    'proc:18': {
      id: BuffId['proc:18'],
      name: 'Active Damage Reduction',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_DAMAGECUT]
    },
    'proc:19': {
      id: BuffId['proc:19'],
      name: 'Active Gradual BB Gauge Fill',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_BBREC]
    },
    'proc:20': {
      id: BuffId['proc:20'],
      name: 'Active BC Fill when attacked',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_DAMAGEBB]
    },
    'proc:22': {
      id: BuffId['proc:22'],
      name: 'Active Defense Ignore',
      stat: UnitStat.defenseIgnore,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_IGNOREDEF]
    },
    'proc:23': {
      id: BuffId['proc:23'],
      name: 'Active Spark Damage Boost',
      stat: UnitStat.sparkDamage,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP]
    },
    'proc:24:atk': {
      id: BuffId['proc:24:atk'],
      name: 'Active Converted Attack Boost',
      stat: UnitStat.atk,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP]
    },
    'proc:24:def': {
      id: BuffId['proc:24:def'],
      name: 'Active Converted Defense Boost',
      stat: UnitStat.def,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP]
    },
    'proc:24:rec': {
      id: BuffId['proc:24:rec'],
      name: 'Active Converted Recovery Boost',
      stat: UnitStat.rec,
      stackType: BuffStackType.Active,
      icons: buff => [buff && buff.value && buff.value.value && buff.value.value < 0 ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP]
    },
    'proc:26': {
      id: BuffId['proc:26'],
      name: 'Active Hit Count Boost',
      stat: UnitStat.hitCountModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_HITUP]
    },
    'proc:27': {
      id: BuffId['proc:27'],
      name: 'Proportional Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL]
    },
    'proc:28': {
      id: BuffId['proc:28'],
      name: 'Fixed Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST_FIXED : IconId.ATK_AOE_FIXED]
    },
    'proc:29': {
      id: BuffId['proc:29'],
      name: 'Multi-Element Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST_MULTIELEMENT : IconId.ATK_AOE_MULTIELEMENT]
    },
    'proc:30:fire': {
      id: BuffId['proc:30:fire'],
      name: 'Active Added Element to Attack (Fire)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDFIRE]
    },
    'proc:30:water': {
      id: BuffId['proc:30:water'],
      name: 'Active Added Element to Attack (Water)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDWATER]
    },
    'proc:30:earth': {
      id: BuffId['proc:30:earth'],
      name: 'Active Added Element to Attack (Earth)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDEARTH]
    },
    'proc:30:thunder': {
      id: BuffId['proc:30:thunder'],
      name: 'Active Added Element to Attack (Thunder)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDTHUNDER]
    },
    'proc:30:light': {
      id: BuffId['proc:30:light'],
      name: 'Active Added Element to Attack (Light)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDLIGHT]
    },
    'proc:30:dark': {
      id: BuffId['proc:30:dark'],
      name: 'Active Added Element to Attack (Dark)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDDARK]
    },
    'proc:30:unknown': {
      id: BuffId['proc:30:unknown'],
      name: 'Active Added Element to Attack (Unspecified Element)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDELEMENT]
    },
    'proc:31:flat': {
      id: BuffId['proc:31:flat'],
      name: 'Burst BB Gauge Fill (Flat Amount)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBREC]
    },
    'proc:31:percent': {
      id: BuffId['proc:31:percent'],
      name: 'Burst BB Gauge Fill (Percentage)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBREC]
    },
    'proc:32:fire': {
      id: BuffId['proc:32:fire'],
      name: 'Element Shift (Fire)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTFIRE]
    },
    'proc:32:water': {
      id: BuffId['proc:32:water'],
      name: 'Element Shift (Water)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTWATER]
    },
    'proc:32:earth': {
      id: BuffId['proc:32:earth'],
      name: 'Element Shift (Earth)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTEARTH]
    },
    'proc:32:thunder': {
      id: BuffId['proc:32:thunder'],
      name: 'Element Shift (Thunder)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTTHUNDER]
    },
    'proc:32:light': {
      id: BuffId['proc:32:light'],
      name: 'Element Shift (Light)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTLIGHT]
    },
    'proc:32:dark': {
      id: BuffId['proc:32:dark'],
      name: 'Element Shift (Dark)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTDARK]
    },
    'proc:32:unknown': {
      id: BuffId['proc:32:unknown'],
      name: 'Element Shift (Unspecified Element)',
      stat: UnitStat.elementModification,
      stackType: BuffStackType.Singleton,
      icons: () => [IconId.BUFF_SHIFTELEMENT]
    },
    'proc:33': {
      id: BuffId['proc:33'],
      name: 'Buff Removal',
      stat: UnitStat.buffStabilityModification,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_REMOVEBUFF]
    },
    'proc:34:flat': {
      id: BuffId['proc:34:flat'],
      name: 'Burst BB Gauge Drain (Flat Amount)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBFILLDOWN]
    },
    'proc:34:percent': {
      id: BuffId['proc:34:percent'],
      name: 'Burst BB Gauge Drain (Percentage)',
      stat: UnitStat.bbGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_BBFILLDOWN]
    },
    'proc:36': {
      id: BuffId['proc:36'],
      name: 'Active Leader Skill Lock',
      stat: UnitStat.buffStabilityModification,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_DISABLELS]
    },
    'proc:37': {
      id: BuffId['proc:37'],
      name: 'Summon Unit',
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_SUMMONUNIT]
    },
    'proc:38:poison': {
      id: BuffId['proc:38:poison'],
      name: 'Poison Cleanse',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_POISONBLK]
    },
    'proc:38:weak': {
      id: BuffId['proc:38:weak'],
      name: 'Weak Cleanse',
      stat: UnitStat.weakResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_WEAKBLK]
    },
    'proc:38:sick': {
      id: BuffId['proc:38:sick'],
      name: 'Sick Cleanse',
      stat: UnitStat.sickResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_SICKBLK]
    },
    'proc:38:injury': {
      id: BuffId['proc:38:injury'],
      name: 'Injury Cleanse',
      stat: UnitStat.injuryResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_INJURYBLK]
    },
    'proc:38:curse': {
      id: BuffId['proc:38:curse'],
      name: 'Curse Cleanse',
      stat: UnitStat.curseResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_CURSEBLK]
    },
    'proc:38:paralysis': {
      id: BuffId['proc:38:paralysis'],
      name: 'Paralysis Cleanse',
      stat: UnitStat.poisonResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_PARALYSISBLK]
    },
    'proc:38:atk down': {
      id: BuffId['proc:38:atk down'],
      name: 'Attack Reduction Cleanse',
      stat: UnitStat.atkDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_ATKDOWNBLK]
    },
    'proc:38:def down': {
      id: BuffId['proc:38:def down'],
      name: 'Defense Reduction Cleanse',
      stat: UnitStat.defDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_DEFDOWNBLK]
    },
    'proc:38:rec down': {
      id: BuffId['proc:38:rec down'],
      name: 'Recovery Reduction Cleanse',
      stat: UnitStat.recDownResist,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_RECDOWNBLK]
    },
    'proc:38:unknown': {
      id: BuffId['proc:38:unknown'],
      name: 'Unknown Ailment Cleanse',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.BUFF_AILMENTBLK]
    },
    'proc:39:fire': {
      id: BuffId['proc:39:fire'],
      name: 'Active Fire Damage Reduction',
      stat: UnitStat.fireMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_FIREDMGDOWN]
    },
    'proc:39:water': {
      id: BuffId['proc:39:water'],
      name: 'Active Water Damage Reduction',
      stat: UnitStat.waterMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_WATERDMGDOWN]
    },
    'proc:39:earth': {
      id: BuffId['proc:39:earth'],
      name: 'Active Earth Damage Reduction',
      stat: UnitStat.earthMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_EARTHDMGDOWN]
    },
    'proc:39:thunder': {
      id: BuffId['proc:39:thunder'],
      name: 'Active Thunder Damage Reduction',
      stat: UnitStat.thunderMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_THUNDERDMGDOWN]
    },
    'proc:39:light': {
      id: BuffId['proc:39:light'],
      name: 'Active Light Damage Reduction',
      stat: UnitStat.lightMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_LIGHTDMGDOWN]
    },
    'proc:39:dark': {
      id: BuffId['proc:39:dark'],
      name: 'Active Dark Damage Reduction',
      stat: UnitStat.darkMitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_DARKDMGDOWN]
    },
    'proc:39:unknown': {
      id: BuffId['proc:39:unknown'],
      name: 'Active Elemental Damage Reduction (Unspecified Element)',
      stat: UnitStat.mitigation,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ELEMENTDMGDOWN]
    },
    'proc:40:poison': {
      id: BuffId['proc:40:poison'],
      name: 'Active Poison Infliction Added to Attack',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDPOISON]
    },
    'proc:40:weak': {
      id: BuffId['proc:40:weak'],
      name: 'Active Weak Infliction Added to Attack',
      stat: UnitStat.weakInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDWEAK]
    },
    'proc:40:sick': {
      id: BuffId['proc:40:sick'],
      name: 'Active Sick Infliction Added to Attack',
      stat: UnitStat.sickInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDSICK]
    },
    'proc:40:injury': {
      id: BuffId['proc:40:injury'],
      name: 'Active Injury Infliction Added to Attack',
      stat: UnitStat.injuryInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDINJURY]
    },
    'proc:40:curse': {
      id: BuffId['proc:40:curse'],
      name: 'Active Curse Infliction Added to Attack',
      stat: UnitStat.curseInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDCURSE]
    },
    'proc:40:paralysis': {
      id: BuffId['proc:40:paralysis'],
      name: 'Active Paralysis Infliction Added to Attack',
      stat: UnitStat.poisonInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDPARA]
    },
    'proc:40:atk down': {
      id: BuffId['proc:40:atk down'],
      name: 'Active Attack Reduction Infliction Added to Attack',
      stat: UnitStat.atkDownInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDATKDOWN]
    },
    'proc:40:def down': {
      id: BuffId['proc:40:def down'],
      name: 'Active Defense Reduction Infliction Added to Attack',
      stat: UnitStat.defDownInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDDEFDOWN]
    },
    'proc:40:rec down': {
      id: BuffId['proc:40:rec down'],
      name: 'Active Recovery Reduction Infliction Added to Attack',
      stat: UnitStat.recDownInflict,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_ADDRECDOWN]
    },
    'proc:40:unknown': {
      id: BuffId['proc:40:unknown'],
      name: 'Active Unknown Ailment Infliction Added to Attack',
      stackType: BuffStackType.Unknown,
      icons: () => [IconId.BUFF_ADDAILMENT]
    },
    'proc:42': {
      id: BuffId['proc:42'],
      name: 'Sacrificial Damage',
      stackType: BuffStackType.Attack,
      icons: buff => [buff && buff.targetArea === TargetArea.Single ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL]
    },
    'proc:43': {
      id: BuffId['proc:43'],
      name: 'Burst OD Gauge Fill (Percentage)',
      stat: UnitStat.odGauge,
      stackType: BuffStackType.Burst,
      icons: () => [IconId.BUFF_OVERDRIVEUP]
    },
    'proc:44': {
      id: BuffId['proc:44'],
      name: 'Active Damage over Time',
      stat: UnitStat.damageOverTime,
      stackType: BuffStackType.Active,
      icons: () => [IconId.BUFF_TURNDMG]
    }
  }));
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
