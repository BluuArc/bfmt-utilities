'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @description Get the level entry of a burst at a given level (or the last level if no level is given).
 * @param burst Burst to get level entry from.
 * @param level Optional 1-indexed level to get; if not specified, the last level of the burst is used.
 * @returns Level entry of a burst at a given level (or last level if no level is given) if it exists, undefined otherwise.
 */
function getLevelEntryForBurst(burst, level) {
    const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
    let levelIndex;
    if (level !== null && !isNaN(level)) {
        // 1-indexed
        levelIndex = (+level - 1);
    }
    else {
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
    return (levelEntry && Array.isArray(levelEntry.effects)) ? levelEntry.effects : [];
}

/**
 * @description Get the proc/passive ID of a given object.
 * @param effect Object to get the effect ID from.
 * @returns Proc/passive ID of the input effect if it exists; empty string otherwise.
 */
function getEffectId(effect) {
    let resultId = '';
    if (effect) {
        resultId = effect['proc id'] || effect['unknown proc id'] ||
            effect['passive id'] || effect['unknown passive id'] || '';
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
var KNOWN_CONDITIONAL_ID;
(function (KNOWN_CONDITIONAL_ID) {
    KNOWN_CONDITIONAL_ID["Unknown"] = "UNKNOWN_CONDITIONAL_EFFECT_ID";
})(KNOWN_CONDITIONAL_ID || (KNOWN_CONDITIONAL_ID = {}));

var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get KNOWN_PROC_ID () { return KNOWN_PROC_ID; },
    get KNOWN_PASSIVE_ID () { return KNOWN_PASSIVE_ID; },
    get KNOWN_CONDITIONAL_ID () { return KNOWN_CONDITIONAL_ID; }
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
    return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
        ? metadata[id]
        : (void 0);
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
                time: frameTimes[frameIndex],
            });
        }
        return acc;
    }, []);
    const resultDamageFramesEntry = {
        'effect delay time(ms)/frame': effectDelay,
        'frame times': [],
        'hit dmg% distribution': [],
        'hit dmg% distribution (total)': 0,
        hits: 0,
    };
    unifiedFrames.sort((a, b) => a.time - b.time)
        .forEach(({ time, damage }) => {
        resultDamageFramesEntry['frame times'].push(time);
        resultDamageFramesEntry['hit dmg% distribution'].push(damage);
        resultDamageFramesEntry['hit dmg% distribution (total)'] += damage;
    });
    resultDamageFramesEntry.hits = resultDamageFramesEntry['frame times'].length;
    return resultDamageFramesEntry;
}

var index$7 = /*#__PURE__*/Object.freeze({
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
    return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
        ? metadata[id]
        : (void 0);
}

/**
 * @description Get the associated name for a given proc ID.
 * @param id Proc ID to get the name of.
 * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
 * @returns Name of the proc ID if it exists, empty string otherwise.
 */
function getNameForProc(id, metadata) {
    const metadataEntry = getMetadataForProc(id, metadata);
    return (!!metadataEntry && metadataEntry.Name) || '';
}

/**
 * @description Get the associated name for a given passive ID.
 * @param id Passive ID to get the name of.
 * @param metadata Optional source to use as metadata; defaults to internal passive metadata.
 * @returns Name of the passive ID if it exists, empty string otherwise.
 */
function getNameForPassive(id, metadata) {
    const metadataEntry = getMetadataForPassive(id, metadata);
    return (!!metadataEntry && metadataEntry.Name) || '';
}

/**
 * @description Determine if a given effect object is a proc effect based on existing properties.
 * Do note that it does not check the validity of each property, only the existence.
 * @param effect Object to check.
 * @returns Whether the given effect object is considered a proc effect based on its properties.
 */
function isProcEffect(effect) {
    return !!effect &&
        typeof effect === 'object' &&
        (Object.hasOwnProperty.call(effect, 'proc id') || Object.hasOwnProperty.call(effect, 'unknown proc id'));
}

/**
 * @description Determine if a given effect object is a passive effect based on existing properties.
 * Do note that it does not check the validity of each property, only the existence.
 * @param effect Object to check.
 * @returns Whether the given effect object is considered a passive effect based on its properties.
 */
function isPassiveEffect(effect) {
    return !!effect &&
        typeof effect === 'object' &&
        (Object.hasOwnProperty.call(effect, 'passive id') || Object.hasOwnProperty.call(effect, 'unknown passive id'));
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
    '1300': MimicUnitIds.MetalMimic,
};

var datamineTypes = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Ailment () { return Ailment; },
    get ArenaCondition () { return ArenaCondition; },
    get MoveType () { return MoveType; },
    get TargetArea () { return TargetArea; },
    get TargetAreaShorthand () { return TargetAreaShorthand; },
    get TargetType () { return TargetType; },
    get SpPassiveType () { return SpPassiveType; },
    get SphereTypeName () { return SphereTypeName; },
    get SphereTypeId () { return SphereTypeId; },
    get SpCategoryName () { return SpCategoryName; },
    get SpCategoryId () { return SpCategoryId; },
    get UnitAnimationKey () { return UnitAnimationKey; },
    get UnitElement () { return UnitElement; },
    get UnitGender () { return UnitGender; },
    get UnitGettingType () { return UnitGettingType; },
    get UnitKind () { return UnitKind; },
    get UnitType () { return UnitType; },
    get ItemType () { return ItemType; },
    get MimicUnitIds () { return MimicUnitIds; },
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
                targetType: effect['target type'],
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
    }
    else if (isProcEffect(effect)) {
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
    UnitStat["bcCostReduction"] = "bcCostReduction";
    UnitStat["bbGaugeConsumptionReduction"] = "bbGaugeConsumptionReduction";
    UnitStat["ailmentAttackBoost"] = "ailmentAttackBoost";
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
    UnitStat["poisonCounter"] = "poisonCounter";
    UnitStat["weakCounter"] = "weakCounter";
    UnitStat["sickCounter"] = "sickCounter";
    UnitStat["injuryCounter"] = "injuryCounter";
    UnitStat["curseCounter"] = "curseCounter";
    UnitStat["paralysisCounter"] = "paralysisCounter";
    UnitStat["atkDownResist"] = "atkDownResist";
    UnitStat["defDownResist"] = "defDownResist";
    UnitStat["recDownResist"] = "recDownResist";
    UnitStat["atkDownInflict"] = "atkDownInflict";
    UnitStat["defDownInflict"] = "defDownInflict";
    UnitStat["recDownInflict"] = "recDownInflict";
    UnitStat["atkDownCounter"] = "atkDownCounter";
    UnitStat["defDownCounter"] = "defDownCounter";
    UnitStat["recDownCounter"] = "recDownCounter";
    UnitStat["mitigation"] = "mitigation";
    UnitStat["fireMitigation"] = "fireMitigation";
    UnitStat["waterMitigation"] = "waterMitigation";
    UnitStat["earthMitigation"] = "earthMitigation";
    UnitStat["thunderMitigation"] = "thunderMitigation";
    UnitStat["lightMitigation"] = "lightMitigation";
    UnitStat["darkMitigation"] = "darkMitigation";
    UnitStat["reduceDamageToOne"] = "reduceDamageToOne";
    UnitStat["guardMitigation"] = "guardMitigation";
    UnitStat["barrier"] = "barrier";
    UnitStat["fireElementalDamage"] = "fireElementalDamage";
    UnitStat["waterElementalDamage"] = "waterElementalDamage";
    UnitStat["earthElementalDamage"] = "earthElementalDamage";
    UnitStat["thunderElementalDamage"] = "thunderElementalDamage";
    UnitStat["lightElementalDamage"] = "lightElementalDamage";
    UnitStat["darkElementalDamage"] = "darkElementalDamage";
    UnitStat["elementalWeaknessDamageMitigation"] = "elementalWeaknessDamageMitigation";
    UnitStat["elementalDamageVulnerability"] = "elementalDamageVulnerability";
    UnitStat["turnDurationModification"] = "turnDurationModification";
    UnitStat["koResistance"] = "koResistance";
    UnitStat["revive"] = "revive";
    UnitStat["defenseIgnore"] = "defenseIgnore";
    UnitStat["defenseIgnoreMitigation"] = "defenseIgnoreMitigation";
    UnitStat["criticalDamage"] = "criticalDamage";
    UnitStat["criticalDamageMitigation"] = "criticalDamageMitigation";
    UnitStat["criticalDamageVulnerability"] = "criticalDamageVulnerability";
    UnitStat["sparkDamage"] = "sparkDamage";
    UnitStat["sparkDamageMitigation"] = "sparkDamageMitigation";
    UnitStat["bbAtk"] = "bbAtk";
    UnitStat["hitCountModification"] = "hitCountModification";
    UnitStat["damageReflect"] = "damageReflect";
    UnitStat["targetingModification"] = "targetingModification";
    UnitStat["elementModification"] = "elementModification";
    UnitStat["buffStabilityModification"] = "buffStabilityModification";
    UnitStat["extraAction"] = "extraAction";
    UnitStat["damageOverTime"] = "damageOverTime";
    UnitStat["damageOverTimeMitigation"] = "damageOverTimeMitigation";
    UnitStat["effectOccurrenceShift"] = "effectOccurrenceShift";
    UnitStat["expModification"] = "expModification";
    UnitStat["shield"] = "shield";
    UnitStat["aoeNormalAttack"] = "aoeNormalAttack";
    UnitStat["skillActivationRate"] = "skillActivationRate";
    UnitStat["arenaBattlePointModification"] = "arenaBattlePointModification";
    UnitStat["coloBattlePointModification"] = "coloBattlePointModification";
    UnitStat["normalAttackMitigation"] = "normalAttackMitigation";
    UnitStat["attackLimitBreak"] = "attackLimitBreak";
    UnitStat["mapModification"] = "mapModification";
    UnitStat["battleModification"] = "battleModification";
})(UnitStat || (UnitStat = {}));
var IconId;
(function (IconId) {
    IconId["UNKNOWN"] = "UNKNOWN";
    IconId["TURN_DURATION_UP"] = "TURN_DURATION_UP";
    IconId["TURN_DURATION_DOWN"] = "TURN_DURATION_DOWN";
    IconId["CONDITIONALBUFF_HPTHRESH"] = "CONDITIONALBUFF_HPTHRESH";
    IconId["CONDITIONALBUFF_DAMAGETAKENTHRESH"] = "CONDITIONALBUFF_DAMAGETAKENTHRESH";
    IconId["CONDITIONALBUFF_DAMAGEDEALTTHRESH"] = "CONDITIONALBUFF_DAMAGEDEALTTHRESH";
    IconId["CONDITIONALBUFF_BCRECEIVEDTHRESH"] = "CONDITIONALBUFF_BCRECEIVEDTHRESH";
    IconId["CONDITIONALBUFF_HCRECEIVEDTHRESH"] = "CONDITIONALBUFF_HCRECEIVEDTHRESH";
    IconId["CONDITIONALBUFF_SPARKCOUNTTHRESH"] = "CONDITIONALBUFF_SPARKCOUNTTHRESH";
    IconId["CONDITIONALBUFF_GUARD"] = "CONDITIONALBUFF_GUARD";
    IconId["CONDITIONALBUFF_CRIT"] = "CONDITIONALBUFF_CRIT";
    IconId["CONDITIONALBUFF_OD"] = "CONDITIONALBUFF_OD";
    IconId["CONDITIONALBUFF_WHENHIT"] = "CONDITIONALBUFF_WHENHIT";
    IconId["BUFF_ADDTO_BB"] = "BUFF_ADDTO_BB";
    IconId["BUFF_ADDTO_SBB"] = "BUFF_ADDTO_SBB";
    IconId["BUFF_ADDTO_UBB"] = "BUFF_ADDTO_UBB";
    IconId["BUFF_ADDTO_LS"] = "BUFF_ADDTO_LS";
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
    IconId["BUFF_SELFHPUP"] = "BUFF_SELFHPUP";
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
    IconId["BUFF_BBREDUC"] = "BUFF_BBREDUC";
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
    IconId["BUFF_SELFCONVERTATKUP"] = "BUFF_SELFCONVERTATKUP";
    IconId["BUFF_SELFCONVERTATKDOWN"] = "BUFF_SELFCONVERTATKDOWN";
    IconId["BUFF_SELFCONVERTDEFUP"] = "BUFF_SELFCONVERTDEFUP";
    IconId["BUFF_SELFCONVERTDEFDOWN"] = "BUFF_SELFCONVERTDEFDOWN";
    IconId["BUFF_SELFCONVERTRECUP"] = "BUFF_SELFCONVERTRECUP";
    IconId["BUFF_SELFCONVERTRECDOWN"] = "BUFF_SELFCONVERTRECDOWN";
    IconId["BUFF_HPSCALEDATKUP"] = "BUFF_HPSCALEDATKUP";
    IconId["BUFF_HPSCALEDATKDOWN"] = "BUFF_HPSCALEDATKDOWN";
    IconId["BUFF_HPSCALEDDEFUP"] = "BUFF_HPSCALEDDEFUP";
    IconId["BUFF_HPSCALEDDEFDOWN"] = "BUFF_HPSCALEDDEFDOWN";
    IconId["BUFF_HPSCALEDRECUP"] = "BUFF_HPSCALEDRECUP";
    IconId["BUFF_HPSCALEDRECDOWN"] = "BUFF_HPSCALEDRECDOWN";
    IconId["BUFF_TURNSCALEDATKUP"] = "BUFF_TURNSCALEDATKUP";
    IconId["BUFF_TURNSCALEDATKDOWN"] = "BUFF_TURNSCALEDATKDOWN";
    IconId["BUFF_TURNSCALEDDEFUP"] = "BUFF_TURNSCALEDDEFUP";
    IconId["BUFF_TURNSCALEDDEFDOWN"] = "BUFF_TURNSCALEDDEFDOWN";
    IconId["BUFF_TURNSCALEDRECUP"] = "BUFF_TURNSCALEDRECUP";
    IconId["BUFF_TURNSCALEDRECDOWN"] = "BUFF_TURNSCALEDRECDOWN";
    IconId["BUFF_SELFATKUP"] = "BUFF_SELFATKUP";
    IconId["BUFF_ATKDOWNLOCK"] = "BUFF_ATKDOWNLOCK";
    IconId["BUFF_SELFDEFUP"] = "BUFF_SELFDEFUP";
    IconId["BUFF_DEFDOWNLOCK"] = "BUFF_DEFDOWNLOCK";
    IconId["BUFF_SELFRECUP"] = "BUFF_SELFRECUP";
    IconId["BUFF_RECDOWNLOCK"] = "BUFF_RECDOWNLOCK";
    IconId["BUFF_SELFCRTRATEUP"] = "BUFF_SELFCRTRATEUP";
    IconId["BUFF_CRTRATEDOWNLOCK"] = "BUFF_CRTRATEDOWNLOCK";
    IconId["BUFF_POISONBLK"] = "BUFF_POISONBLK";
    IconId["BUFF_WEAKBLK"] = "BUFF_WEAKBLK";
    IconId["BUFF_SICKBLK"] = "BUFF_SICKBLK";
    IconId["BUFF_INJURYBLK"] = "BUFF_INJURYBLK";
    IconId["BUFF_CURSEBLK"] = "BUFF_CURSEBLK";
    IconId["BUFF_PARALYSISBLK"] = "BUFF_PARALYSISBLK";
    IconId["BUFF_RESISTATKDOWN"] = "BUFF_RESISTATKDOWN";
    IconId["BUFF_RESISTDEFDOWN"] = "BUFF_RESISTDEFDOWN";
    IconId["BUFF_RESISTRECDOWN"] = "BUFF_RESISTRECDOWN";
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
    IconId["BUFF_POISONCOUNTER"] = "BUFF_POISONCOUNTER";
    IconId["BUFF_POISIONCOUNTER"] = "BUFF_POISONCOUNTER";
    IconId["BUFF_WEAKCOUNTER"] = "BUFF_WEAKCOUNTER";
    IconId["BUFF_SICKCOUNTER"] = "BUFF_SICKCOUNTER";
    IconId["BUFF_INJCONTER"] = "BUFF_INJCONTER";
    IconId["BUFF_CURSECOUNTER"] = "BUFF_CURSECOUNTER";
    IconId["BUFF_PARALYCOUNTER"] = "BUFF_PARALYCOUNTER";
    IconId["BUFF_PROB_ATKREDUC"] = "BUFF_PROB_ATKREDUC";
    IconId["BUFF_PROB_DEFREDUC"] = "BUFF_PROB_DEFREDUC";
    IconId["BUFF_PROB_RECREDUC"] = "BUFF_PROB_RECREDUC";
    IconId["BUFF_DAMAGECUT"] = "BUFF_DAMAGECUT";
    IconId["BUFF_DAMAGECUTTOONE"] = "BUFF_DAMAGECUTTOONE";
    // elemental damage reduction buffs
    IconId["BUFF_FIREDMGDOWN"] = "BUFF_FIREDMGDOWN";
    IconId["BUFF_WATERDMGDOWN"] = "BUFF_WATERDMGDOWN";
    IconId["BUFF_EARTHDMGDOWN"] = "BUFF_EARTHDMGDOWN";
    IconId["BUFF_THUNDERDMGDOWN"] = "BUFF_THUNDERDMGDOWN";
    IconId["BUFF_LIGHTDMGDOWN"] = "BUFF_LIGHTDMGDOWN";
    IconId["BUFF_DARKDMGDOWN"] = "BUFF_DARKDMGDOWN";
    IconId["BUFF_ELEMENTDMGDOWN"] = "BUFF_ELEMENTDMGDOWN";
    // elemental weakness buffs
    IconId["BUFF_FIREDMGUP"] = "BUFF_FIREDMGUP";
    IconId["BUFF_WATERDMGUP"] = "BUFF_WATERDMGUP";
    IconId["BUFF_WATERMDGUP"] = "BUFF_WATERDMGUP";
    IconId["BUFF_EARTHDMGUP"] = "BUFF_EARTHDMGUP";
    IconId["BUFF_THUNDERDMGUP"] = "BUFF_THUNDERDMGUP";
    IconId["BUFF_LIGHTDMGUP"] = "BUFF_LIGHTDMGUP";
    IconId["BUFF_DARKDMGUP"] = "BUFF_DARKDMGUP";
    IconId["BUFF_ELEMENTDMGUP"] = "BUFF_ELEMENTDMGUP";
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
    IconId["BUFF_KO"] = "BUFF_KO";
    IconId["BUFF_KOBLOCK"] = "BUFF_KOBLOCK";
    IconId["BUFF_HPABS"] = "BUFF_HPABS";
    IconId["BUFF_IGNOREDEF"] = "BUFF_IGNOREDEF";
    IconId["BUFF_IGNOREDEFBLK"] = "BUFF_IGNOREDEFBLK";
    IconId["BUFF_CRTUP"] = "BUFF_CRTUP";
    IconId["BUFF_CRTDOWN"] = "BUFF_CRTDOWN";
    IconId["BUFF_ELEMENTDOWN"] = "BUFF_ELEMENTDOWN";
    IconId["BUFF_SPARKUP"] = "BUFF_SPARKUP";
    IconId["BUFF_SPARKDOWN"] = "BUFF_SPARKDOWN";
    IconId["BUFF_SPARKDMGUP"] = "BUFF_SPARKDMGUP";
    IconId["BUFF_SPARKDMGDOWN"] = "BUFF_SPARKDMGDOWN";
    IconId["BUFF_SPARKDMGUP2"] = "BUFF_SPARKDMGUP2";
    IconId["BUFF_SPARKDMGDOWN2"] = "BUFF_SPARKDMGDOWN2";
    IconId["BUFF_SPARKHC"] = "BUFF_SPARKHC";
    IconId["BUFF_SPARKBC"] = "BUFF_SPARKBC";
    IconId["BUFF_SPARKITEM"] = "BUFF_SPARKITEM";
    IconId["BUFF_SPARKZEL"] = "BUFF_SPARKZEL";
    IconId["BUFF_SPARKKARMA"] = "BUFF_SPARKKARMA";
    IconId["BUFF_SPARKBBUP"] = "BUFF_SPARKBBUP";
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
    IconId["BUFF_NULLSPHERE"] = "BUFF_NULLSPHERE";
    IconId["BUFF_NULLES"] = "BUFF_NULLES";
    IconId["BUFF_SUMMONUNIT"] = "BUFF_SUMMONUNIT";
    IconId["BUFF_DBLSTRIKE"] = "BUFF_DBLSTRIKE";
    IconId["BUFF_OVERDRIVEUP"] = "BUFF_OVERDRIVEUP";
    IconId["BUFF_ODFILLBOOST"] = "BUFF_ODFILLBOOST";
    IconId["BUFF_ODFILLDRAIN"] = "BUFF_ODFILLDRAIN";
    IconId["BUFF_TURNDMG"] = "BUFF_TURNDMG";
    IconId["BUFF_ATKREDUC"] = "BUFF_ATKREDUC";
    IconId["BUFF_BBATKUP"] = "BUFF_BBATKUP";
    IconId["BUFF_SBBATKUP"] = "BUFF_SBBATKUP";
    IconId["BUFF_UBBATKUP"] = "BUFF_UBBATKUP";
    IconId["BUFF_BBATKDOWN"] = "BUFF_BBATKDOWN";
    IconId["BUFF_SBBATKDOWN"] = "BUFF_SBBATKDOWN";
    IconId["BUFF_UBBATKDOWN"] = "BUFF_UBBATKDOWN";
    IconId["BUFF_BBCOST_REDUCTION"] = "BUFF_BBCOST_REDUCTION";
    IconId["BUFF_GUARDCUT"] = "BUFF_GUARDCUT";
    IconId["BUFF_GUARDBBUP"] = "BUFF_GUARDBBUP";
    IconId["BUFF_FIRESHIELD"] = "BUFF_FIRESHIELD";
    IconId["BUFF_WATERSHIELD"] = "BUFF_WATERSHIELD";
    IconId["BUFF_EARTHSHIELD"] = "BUFF_EARTHSHIELD";
    IconId["BUFF_THUNDERSHIELD"] = "BUFF_THUNDERSHIELD";
    IconId["BUFF_LIGHTSHIELD"] = "BUFF_LIGHTSHIELD";
    IconId["BUFF_DARKSHIELD"] = "BUFF_DARKSHIELD";
    IconId["BUFF_ELEMENTSHIELD"] = "BUFF_ELEMENTSHIELD";
    IconId["BUFF_AILDMGUP"] = "BUFF_AILDMGUP";
    IconId["BUFF_HPTURNSTART"] = "BUFF_HPTURNSTART";
    IconId["BUFF_BCTURNSTART"] = "BUFF_BCTURNSTART";
    IconId["BUFF_PLAYEREXP"] = "BUFF_PLAYEREXP";
    IconId["BUFF_SPARKCRTACTIVATED"] = "BUFF_SPARKCRTACTIVATED";
    IconId["BUFF_SPARK_HPREC"] = "BUFF_SPARK_HPREC";
    IconId["BUFF_AOEATK"] = "BUFF_AOEATK";
    IconId["BUFF_SKILLACTIVATIONRATEUP"] = "BUFF_SKILLACTIVATIONRATEUP";
    IconId["BUFF_ABPUP"] = "BUFF_ABPUP";
    IconId["BUFF_CBPUP"] = "BUFF_CBPUP";
    IconId["BUFF_TARGETED"] = "BUFF_TARGETED";
    IconId["BUFF_NORMALATTACKREDUCTION"] = "BUFF_NORMALATTACKREDUCTION";
    IconId["BUFF_PARAMBREAK_ATK"] = "BUFF_PARAMBREAK_ATK";
    IconId["BUFF_CRITDMG_VUL"] = "BUFF_CRITDMG_VUL";
    IconId["BUFF_ELEDMG_VUL"] = "BUFF_ELEDMG_VUL";
    IconId["BUFF_RAIDHPREC"] = "BUFF_RAIDHPREC";
    IconId["BUFF_RAIDATKUP"] = "BUFF_RAIDATKUP";
    IconId["BUFF_RAIDDEFUP"] = "BUFF_RAIDDEFUP";
    IconId["BUFF_RAIDRECUP"] = "BUFF_RAIDRECUP";
    IconId["BUFF_RAIDCRTUP"] = "BUFF_RAIDCRTUP";
    IconId["BUFF_RAID_BOSS_REVEAL"] = "BUFF_RAID_BOSS_REVEAL";
    IconId["BUFF_RAID_TELEPORT"] = "BUFF_RAID_TELEPORT";
    IconId["BUFF_RAID_FLEE"] = "BUFF_RAID_FLEE";
    IconId["BUFF_RAID_DAMAGECUT"] = "BUFF_RAID_DAMAGECUT";
    IconId["BUFF_RAID_ITEMDROP"] = "BUFF_RAID_ITEMDROP";
    IconId["SG_BUFF_ALL"] = "SG_BUFF_ALL";
    IconId["SG_BUFF_FIRE"] = "SG_BUFF_FIRE";
    IconId["SG_BUFF_WATER"] = "SG_BUFF_WATER";
    IconId["SG_BUFF_EARTH"] = "SG_BUFF_EARTH";
    IconId["SG_BUFF_THUNDER"] = "SG_BUFF_THUNDER";
    IconId["SG_BUFF_LIGHT"] = "SG_BUFF_LIGHT";
    IconId["SG_BUFF_DARK"] = "SG_BUFF_DARK";
    IconId["SG_BUFF_UNKNOWN"] = "SG_BUFF_UNKNOWN";
    IconId["SG_BUFF_STEALTH"] = "SG_BUFF_STEALTH";
    IconId["ATK_ST"] = "ATK_ST";
    IconId["ATK_AOE"] = "ATK_AOE";
    IconId["ATK_RT"] = "ATK_RT";
    IconId["ATK_ST_HPREC"] = "ATK_ST_HPREC";
    IconId["ATK_AOE_HPREC"] = "ATK_AOE_HPREC";
    IconId["ATK_ST_PROPORTIONAL"] = "ATK_ST_PROPORTIONAL";
    IconId["ATK_AOE_PROPORTIONAL"] = "ATK_AOE_PROPORTIONAL";
    IconId["ATK_ST_PIERCING_PROPORTIONAL"] = "ATK_ST_PIERCING_PROPORTIONAL";
    IconId["ATK_AOE_PIERCING_PROPORTIONAL"] = "ATK_AOE_PIERCING_PROPORTIONAL";
    IconId["ATK_ST_FIXED"] = "ATK_ST_FIXED";
    IconId["ATK_AOE_FIXED"] = "ATK_AOE_FIXED";
    IconId["ATK_ST_PIERCING_FIXED"] = "ATK_ST_PIERCING_FIXED";
    IconId["ATK_AOE_PIERCING_FIXED"] = "ATK_AOE_PIERCING_FIXED";
    IconId["ATK_ST_MULTIELEMENT"] = "ATK_ST_MULTIELEMENT";
    IconId["ATK_AOE_MULTIELEMENT"] = "ATK_AOE_MULTIELEMENT";
    IconId["ATK_ST_SACRIFICIAL"] = "ATK_ST_SACRIFICIAL";
    IconId["ATK_AOE_SACRIFICIAL"] = "ATK_AOE_SACRIFICIAL";
    IconId["ATK_ST_HPSCALED"] = "ATK_ST_HPSCALED";
    IconId["ATK_AOE_HPSCALED"] = "ATK_AOE_HPSCALED";
    IconId["ATK_ST_BBGAUGESCALED"] = "ATK_ST_BBGAUGESCALED";
    IconId["ATK_AOE_BBGAUGESCALED"] = "ATK_AOE_BBGAUGESCALED";
    IconId["ATK_ST_USAGESCALED"] = "ATK_ST_USAGESCALED";
    IconId["ATK_AOE_USAGESCALED"] = "ATK_AOE_USAGESCALED";
    IconId["ATK_ST_ELEMENTSCALED"] = "ATK_ST_ELEMENTSCALED";
    IconId["ATK_AOE_ELEMENTSCALED"] = "ATK_AOE_ELEMENTSCALED";
})(IconId || (IconId = {}));
/**
 * @description Format of these IDs are `<passive|proc|conditional>:<original effect ID>:<stat>`.
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
    BuffId["passive:2:elemental-hp"] = "passive:2:elemental-hp";
    BuffId["passive:2:elemental-atk"] = "passive:2:elemental-atk";
    BuffId["passive:2:elemental-def"] = "passive:2:elemental-def";
    BuffId["passive:2:elemental-rec"] = "passive:2:elemental-rec";
    BuffId["passive:2:elemental-crit"] = "passive:2:elemental-crit";
    BuffId["passive:3:type based-hp"] = "passive:3:type based-hp";
    BuffId["passive:3:type based-atk"] = "passive:3:type based-atk";
    BuffId["passive:3:type based-def"] = "passive:3:type based-def";
    BuffId["passive:3:type based-rec"] = "passive:3:type based-rec";
    BuffId["passive:3:type based-crit"] = "passive:3:type based-crit";
    BuffId["passive:4:resist-poison"] = "passive:4:resist-poison";
    BuffId["passive:4:resist-weak"] = "passive:4:resist-weak";
    BuffId["passive:4:resist-sick"] = "passive:4:resist-sick";
    BuffId["passive:4:resist-injury"] = "passive:4:resist-injury";
    BuffId["passive:4:resist-curse"] = "passive:4:resist-curse";
    BuffId["passive:4:resist-paralysis"] = "passive:4:resist-paralysis";
    BuffId["passive:5:mitigate-fire"] = "passive:5:mitigate-fire";
    BuffId["passive:5:mitigate-water"] = "passive:5:mitigate-water";
    BuffId["passive:5:mitigate-earth"] = "passive:5:mitigate-earth";
    BuffId["passive:5:mitigate-thunder"] = "passive:5:mitigate-thunder";
    BuffId["passive:5:mitigate-light"] = "passive:5:mitigate-light";
    BuffId["passive:5:mitigate-dark"] = "passive:5:mitigate-dark";
    BuffId["passive:5:mitigate-unknown"] = "passive:5:mitigate-unknown";
    BuffId["passive:8:mitigation"] = "passive:8:mitigation";
    BuffId["passive:9:gradual bc fill"] = "passive:9:gradual bc fill";
    BuffId["passive:10:hc efficacy"] = "passive:10:hc efficacy";
    BuffId["passive:11:hp conditional-atk"] = "passive:11:hp conditional-atk";
    BuffId["passive:11:hp conditional-def"] = "passive:11:hp conditional-def";
    BuffId["passive:11:hp conditional-rec"] = "passive:11:hp conditional-rec";
    BuffId["passive:11:hp conditional-crit"] = "passive:11:hp conditional-crit";
    BuffId["passive:12:hp conditional drop boost-bc"] = "passive:12:hp conditional drop boost-bc";
    BuffId["passive:12:hp conditional drop boost-hc"] = "passive:12:hp conditional drop boost-hc";
    BuffId["passive:12:hp conditional drop boost-item"] = "passive:12:hp conditional drop boost-item";
    BuffId["passive:12:hp conditional drop boost-zel"] = "passive:12:hp conditional drop boost-zel";
    BuffId["passive:12:hp conditional drop boost-karma"] = "passive:12:hp conditional drop boost-karma";
    BuffId["passive:13:bc fill on enemy defeat"] = "passive:13:bc fill on enemy defeat";
    BuffId["passive:14:chance mitigation"] = "passive:14:chance mitigation";
    BuffId["passive:15:heal on enemy defeat"] = "passive:15:heal on enemy defeat";
    BuffId["passive:16:heal on win"] = "passive:16:heal on win";
    BuffId["passive:17:hp absorb"] = "passive:17:hp absorb";
    BuffId["passive:19:drop boost-bc"] = "passive:19:drop boost-bc";
    BuffId["passive:19:drop boost-hc"] = "passive:19:drop boost-hc";
    BuffId["passive:19:drop boost-item"] = "passive:19:drop boost-item";
    BuffId["passive:19:drop boost-zel"] = "passive:19:drop boost-zel";
    BuffId["passive:19:drop boost-karma"] = "passive:19:drop boost-karma";
    BuffId["passive:20:chance inflict-poison"] = "passive:20:chance inflict-poison";
    BuffId["passive:20:chance inflict-weak"] = "passive:20:chance inflict-weak";
    BuffId["passive:20:chance inflict-sick"] = "passive:20:chance inflict-sick";
    BuffId["passive:20:chance inflict-injury"] = "passive:20:chance inflict-injury";
    BuffId["passive:20:chance inflict-curse"] = "passive:20:chance inflict-curse";
    BuffId["passive:20:chance inflict-paralysis"] = "passive:20:chance inflict-paralysis";
    BuffId["passive:20:chance inflict-atk down"] = "passive:20:chance inflict-atk down";
    BuffId["passive:20:chance inflict-def down"] = "passive:20:chance inflict-def down";
    BuffId["passive:20:chance inflict-rec down"] = "passive:20:chance inflict-rec down";
    BuffId["passive:20:chance inflict-unknown"] = "passive:20:chance inflict-unknown";
    BuffId["passive:21:first turn-atk"] = "passive:21:first turn-atk";
    BuffId["passive:21:first turn-def"] = "passive:21:first turn-def";
    BuffId["passive:21:first turn-rec"] = "passive:21:first turn-rec";
    BuffId["passive:21:first turn-crit"] = "passive:21:first turn-crit";
    BuffId["passive:23:bc fill on win"] = "passive:23:bc fill on win";
    BuffId["passive:24:heal on hit"] = "passive:24:heal on hit";
    BuffId["passive:25:bc fill on hit"] = "passive:25:bc fill on hit";
    BuffId["passive:26:chance damage reflect"] = "passive:26:chance damage reflect";
    BuffId["passive:27:target chance change"] = "passive:27:target chance change";
    BuffId["passive:28:hp conditional target chance change"] = "passive:28:hp conditional target chance change";
    BuffId["passive:29:chance def ignore"] = "passive:29:chance def ignore";
    BuffId["passive:30:bb gauge conditional-atk"] = "passive:30:bb gauge conditional-atk";
    BuffId["passive:30:bb gauge conditional-def"] = "passive:30:bb gauge conditional-def";
    BuffId["passive:30:bb gauge conditional-rec"] = "passive:30:bb gauge conditional-rec";
    BuffId["passive:30:bb gauge conditional-crit"] = "passive:30:bb gauge conditional-crit";
    BuffId["passive:31:spark-damage"] = "passive:31:spark-damage";
    BuffId["passive:31:spark-bc"] = "passive:31:spark-bc";
    BuffId["passive:31:spark-hc"] = "passive:31:spark-hc";
    BuffId["passive:31:spark-item"] = "passive:31:spark-item";
    BuffId["passive:31:spark-zel"] = "passive:31:spark-zel";
    BuffId["passive:31:spark-karma"] = "passive:31:spark-karma";
    BuffId["passive:32:bc efficacy"] = "passive:32:bc efficacy";
    BuffId["passive:33:gradual heal"] = "passive:33:gradual heal";
    BuffId["passive:34:critical damage"] = "passive:34:critical damage";
    BuffId["passive:35:bc fill on normal attack"] = "passive:35:bc fill on normal attack";
    BuffId["passive:36:extra action"] = "passive:36:extra action";
    BuffId["passive:37:hit count boost"] = "passive:37:hit count boost";
    BuffId["passive:40:converted-atk"] = "passive:40:converted-atk";
    BuffId["passive:40:converted-def"] = "passive:40:converted-def";
    BuffId["passive:40:converted-rec"] = "passive:40:converted-rec";
    BuffId["passive:41:unique element count-hp"] = "passive:41:unique element count-hp";
    BuffId["passive:41:unique element count-atk"] = "passive:41:unique element count-atk";
    BuffId["passive:41:unique element count-def"] = "passive:41:unique element count-def";
    BuffId["passive:41:unique element count-rec"] = "passive:41:unique element count-rec";
    BuffId["passive:41:unique element count-crit"] = "passive:41:unique element count-crit";
    BuffId["passive:42:gender-hp"] = "passive:42:gender-hp";
    BuffId["passive:42:gender-atk"] = "passive:42:gender-atk";
    BuffId["passive:42:gender-def"] = "passive:42:gender-def";
    BuffId["passive:42:gender-rec"] = "passive:42:gender-rec";
    BuffId["passive:42:gender-crit"] = "passive:42:gender-crit";
    BuffId["passive:43:chance damage to one"] = "passive:43:chance damage to one";
    BuffId["passive:44:flat-hp"] = "passive:44:flat-hp";
    BuffId["passive:44:flat-atk"] = "passive:44:flat-atk";
    BuffId["passive:44:flat-def"] = "passive:44:flat-def";
    BuffId["passive:44:flat-rec"] = "passive:44:flat-rec";
    BuffId["passive:44:flat-crit"] = "passive:44:flat-crit";
    BuffId["passive:45:critical damage reduction-base"] = "passive:45:critical damage reduction-base";
    BuffId["passive:45:critical damage reduction-buff"] = "passive:45:critical damage reduction-buff";
    BuffId["passive:46:hp scaled-atk"] = "passive:46:hp scaled-atk";
    BuffId["passive:46:hp scaled-def"] = "passive:46:hp scaled-def";
    BuffId["passive:46:hp scaled-rec"] = "passive:46:hp scaled-rec";
    BuffId["passive:47:bc fill on spark"] = "passive:47:bc fill on spark";
    BuffId["passive:48:bc cost reduction"] = "passive:48:bc cost reduction";
    BuffId["passive:49:bb gauge consumption reduction"] = "passive:49:bb gauge consumption reduction";
    BuffId["passive:50:elemental weakness damage-fire"] = "passive:50:elemental weakness damage-fire";
    BuffId["passive:50:elemental weakness damage-water"] = "passive:50:elemental weakness damage-water";
    BuffId["passive:50:elemental weakness damage-earth"] = "passive:50:elemental weakness damage-earth";
    BuffId["passive:50:elemental weakness damage-thunder"] = "passive:50:elemental weakness damage-thunder";
    BuffId["passive:50:elemental weakness damage-light"] = "passive:50:elemental weakness damage-light";
    BuffId["passive:50:elemental weakness damage-dark"] = "passive:50:elemental weakness damage-dark";
    BuffId["passive:50:elemental weakness damage-unknown"] = "passive:50:elemental weakness damage-unknown";
    BuffId["passive:53:critical damage-base"] = "passive:53:critical damage-base";
    BuffId["passive:53:critical damage-buff"] = "passive:53:critical damage-buff";
    BuffId["passive:53:element damage-base"] = "passive:53:element damage-base";
    BuffId["passive:53:element damage-buff"] = "passive:53:element damage-buff";
    BuffId["passive:53:critical rate-base"] = "passive:53:critical rate-base";
    BuffId["passive:53:critical rate-buff"] = "passive:53:critical rate-buff";
    BuffId["passive:55:hp conditional"] = "passive:55:hp conditional";
    BuffId["passive:58:guard mitigation"] = "passive:58:guard mitigation";
    BuffId["passive:59:bc fill when attacked on guard-percent"] = "passive:59:bc fill when attacked on guard-percent";
    BuffId["passive:59:bc fill when attacked on guard-flat"] = "passive:59:bc fill when attacked on guard-flat";
    BuffId["passive:61:bc fill on guard-percent"] = "passive:61:bc fill on guard-percent";
    BuffId["passive:61:bc fill on guard-flat"] = "passive:61:bc fill on guard-flat";
    BuffId["passive:62:mitigate-fire"] = "passive:62:mitigate-fire";
    BuffId["passive:62:mitigate-water"] = "passive:62:mitigate-water";
    BuffId["passive:62:mitigate-earth"] = "passive:62:mitigate-earth";
    BuffId["passive:62:mitigate-thunder"] = "passive:62:mitigate-thunder";
    BuffId["passive:62:mitigate-light"] = "passive:62:mitigate-light";
    BuffId["passive:62:mitigate-dark"] = "passive:62:mitigate-dark";
    BuffId["passive:62:mitigate-unknown"] = "passive:62:mitigate-unknown";
    BuffId["passive:63:first turn mitigate-fire"] = "passive:63:first turn mitigate-fire";
    BuffId["passive:63:first turn mitigate-water"] = "passive:63:first turn mitigate-water";
    BuffId["passive:63:first turn mitigate-earth"] = "passive:63:first turn mitigate-earth";
    BuffId["passive:63:first turn mitigate-thunder"] = "passive:63:first turn mitigate-thunder";
    BuffId["passive:63:first turn mitigate-light"] = "passive:63:first turn mitigate-light";
    BuffId["passive:63:first turn mitigate-dark"] = "passive:63:first turn mitigate-dark";
    BuffId["passive:63:first turn mitigate-unknown"] = "passive:63:first turn mitigate-unknown";
    BuffId["passive:64:attack boost-bb"] = "passive:64:attack boost-bb";
    BuffId["passive:64:attack boost-sbb"] = "passive:64:attack boost-sbb";
    BuffId["passive:64:attack boost-ubb"] = "passive:64:attack boost-ubb";
    BuffId["passive:65:bc fill on crit"] = "passive:65:bc fill on crit";
    BuffId["passive:66:add effect to skill-bb"] = "passive:66:add effect to skill-bb";
    BuffId["passive:66:add effect to skill-sbb"] = "passive:66:add effect to skill-sbb";
    BuffId["passive:66:add effect to skill-ubb"] = "passive:66:add effect to skill-ubb";
    BuffId["passive:69:chance ko resistance"] = "passive:69:chance ko resistance";
    BuffId["passive:70:od fill rate"] = "passive:70:od fill rate";
    BuffId["passive:71:inflict on hit-poison"] = "passive:71:inflict on hit-poison";
    BuffId["passive:71:inflict on hit-weak"] = "passive:71:inflict on hit-weak";
    BuffId["passive:71:inflict on hit-sick"] = "passive:71:inflict on hit-sick";
    BuffId["passive:71:inflict on hit-injury"] = "passive:71:inflict on hit-injury";
    BuffId["passive:71:inflict on hit-curse"] = "passive:71:inflict on hit-curse";
    BuffId["passive:71:inflict on hit-paralysis"] = "passive:71:inflict on hit-paralysis";
    BuffId["passive:72:effect at turn start-hp"] = "passive:72:effect at turn start-hp";
    BuffId["passive:72:effect at turn start-bc"] = "passive:72:effect at turn start-bc";
    BuffId["passive:73:resist-poison"] = "passive:73:resist-poison";
    BuffId["passive:73:resist-weak"] = "passive:73:resist-weak";
    BuffId["passive:73:resist-sick"] = "passive:73:resist-sick";
    BuffId["passive:73:resist-injury"] = "passive:73:resist-injury";
    BuffId["passive:73:resist-curse"] = "passive:73:resist-curse";
    BuffId["passive:73:resist-paralysis"] = "passive:73:resist-paralysis";
    BuffId["passive:73:resist-atk down"] = "passive:73:resist-atk down";
    BuffId["passive:73:resist-def down"] = "passive:73:resist-def down";
    BuffId["passive:73:resist-rec down"] = "passive:73:resist-rec down";
    BuffId["passive:74:ailment attack boost"] = "passive:74:ailment attack boost";
    BuffId["passive:75:spark vulnerability"] = "passive:75:spark vulnerability";
    BuffId["passive:77:spark damage reduction-base"] = "passive:77:spark damage reduction-base";
    BuffId["passive:77:spark damage reduction-buff"] = "passive:77:spark damage reduction-buff";
    BuffId["passive:78:damage taken conditional"] = "passive:78:damage taken conditional";
    BuffId["passive:79:bc fill after damage taken conditional-flat"] = "passive:79:bc fill after damage taken conditional-flat";
    BuffId["passive:79:bc fill after damage taken conditional-percent"] = "passive:79:bc fill after damage taken conditional-percent";
    BuffId["passive:80:damage dealt conditional"] = "passive:80:damage dealt conditional";
    BuffId["passive:81:bc fill after damage dealt conditional-flat"] = "passive:81:bc fill after damage dealt conditional-flat";
    BuffId["passive:81:bc fill after damage dealt conditional-percent"] = "passive:81:bc fill after damage dealt conditional-percent";
    BuffId["passive:82:bc received conditional"] = "passive:82:bc received conditional";
    BuffId["passive:83:bc fill after bc received conditional-flat"] = "passive:83:bc fill after bc received conditional-flat";
    BuffId["passive:83:bc fill after bc received conditional-percent"] = "passive:83:bc fill after bc received conditional-percent";
    BuffId["passive:84:hc received conditional"] = "passive:84:hc received conditional";
    BuffId["passive:85:bc fill after hc received conditional-flat"] = "passive:85:bc fill after hc received conditional-flat";
    BuffId["passive:85:bc fill after hc received conditional-percent"] = "passive:85:bc fill after hc received conditional-percent";
    BuffId["passive:86:spark count conditional"] = "passive:86:spark count conditional";
    BuffId["passive:87:bc fill after spark count conditional-flat"] = "passive:87:bc fill after spark count conditional-flat";
    BuffId["passive:87:bc fill after spark count conditional-percent"] = "passive:87:bc fill after spark count conditional-percent";
    BuffId["passive:88:on guard conditional"] = "passive:88:on guard conditional";
    BuffId["passive:89:on critical hit conditional"] = "passive:89:on critical hit conditional";
    BuffId["passive:90:inflict on crit-poison"] = "passive:90:inflict on crit-poison";
    BuffId["passive:90:inflict on crit-weak"] = "passive:90:inflict on crit-weak";
    BuffId["passive:90:inflict on crit-sick"] = "passive:90:inflict on crit-sick";
    BuffId["passive:90:inflict on crit-injury"] = "passive:90:inflict on crit-injury";
    BuffId["passive:90:inflict on crit-curse"] = "passive:90:inflict on crit-curse";
    BuffId["passive:90:inflict on crit-paralysis"] = "passive:90:inflict on crit-paralysis";
    BuffId["passive:91:first turn spark"] = "passive:91:first turn spark";
    BuffId["passive:92:negate defense ignore"] = "passive:92:negate defense ignore";
    BuffId["passive:93:add element-fire"] = "passive:93:add element-fire";
    BuffId["passive:93:add element-water"] = "passive:93:add element-water";
    BuffId["passive:93:add element-earth"] = "passive:93:add element-earth";
    BuffId["passive:93:add element-thunder"] = "passive:93:add element-thunder";
    BuffId["passive:93:add element-light"] = "passive:93:add element-light";
    BuffId["passive:93:add element-dark"] = "passive:93:add element-dark";
    BuffId["passive:93:add element-unknown"] = "passive:93:add element-unknown";
    BuffId["passive:96:aoe normal attack"] = "passive:96:aoe normal attack";
    BuffId["passive:97:player exp boost"] = "passive:97:player exp boost";
    BuffId["passive:100:spark critical"] = "passive:100:spark critical";
    BuffId["passive:101:heal on spark"] = "passive:101:heal on spark";
    BuffId["passive:102:add element-fire"] = "passive:102:add element-fire";
    BuffId["passive:102:add element-water"] = "passive:102:add element-water";
    BuffId["passive:102:add element-earth"] = "passive:102:add element-earth";
    BuffId["passive:102:add element-thunder"] = "passive:102:add element-thunder";
    BuffId["passive:102:add element-light"] = "passive:102:add element-light";
    BuffId["passive:102:add element-dark"] = "passive:102:add element-dark";
    BuffId["passive:102:add element-unknown"] = "passive:102:add element-unknown";
    BuffId["passive:103:hp conditional attack boost-bb"] = "passive:103:hp conditional attack boost-bb";
    BuffId["passive:103:hp conditional attack boost-sbb"] = "passive:103:hp conditional attack boost-sbb";
    BuffId["passive:103:hp conditional attack boost-ubb"] = "passive:103:hp conditional attack boost-ubb";
    BuffId["passive:104:hp conditional spark-damage"] = "passive:104:hp conditional spark-damage";
    BuffId["passive:104:hp conditional spark-bc"] = "passive:104:hp conditional spark-bc";
    BuffId["passive:104:hp conditional spark-hc"] = "passive:104:hp conditional spark-hc";
    BuffId["passive:104:hp conditional spark-item"] = "passive:104:hp conditional spark-item";
    BuffId["passive:104:hp conditional spark-zel"] = "passive:104:hp conditional spark-zel";
    BuffId["passive:104:hp conditional spark-karma"] = "passive:104:hp conditional spark-karma";
    BuffId["passive:105:turn scaled-atk"] = "passive:105:turn scaled-atk";
    BuffId["passive:105:turn scaled-def"] = "passive:105:turn scaled-def";
    BuffId["passive:105:turn scaled-rec"] = "passive:105:turn scaled-rec";
    BuffId["passive:106:on overdrive conditional"] = "passive:106:on overdrive conditional";
    BuffId["passive:107:add effect to leader skill"] = "passive:107:add effect to leader skill";
    BuffId["passive:109:bc efficacy reduction"] = "passive:109:bc efficacy reduction";
    BuffId["passive:110:bc drain-flat"] = "passive:110:bc drain-flat";
    BuffId["passive:110:bc drain-percent"] = "passive:110:bc drain-percent";
    BuffId["passive:111:skill activation rate boost"] = "passive:111:skill activation rate boost";
    BuffId["passive:112:point gain boost-arena"] = "passive:112:point gain boost-arena";
    BuffId["passive:112:point gain boost-colo"] = "passive:112:point gain boost-colo";
    BuffId["passive:113:hp conditional"] = "passive:113:hp conditional";
    BuffId["passive:114:when attacked conditional"] = "passive:114:when attacked conditional";
    BuffId["passive:127:damage over time reduction"] = "passive:127:damage over time reduction";
    BuffId["passive:128:normal attack mitigation"] = "passive:128:normal attack mitigation";
    BuffId["passive:143:atk limit break"] = "passive:143:atk limit break";
    BuffId["UNKNOWN_PROC_EFFECT_ID"] = "UNKNOWN_PROC_EFFECT_ID";
    BuffId["UNKNOWN_PROC_BUFF_PARAMS"] = "UNKNOWN_PROC_BUFF_PARAMS";
    BuffId["proc:1:attack"] = "proc:1:attack";
    BuffId["proc:2:burst heal"] = "proc:2:burst heal";
    BuffId["proc:3:gradual heal"] = "proc:3:gradual heal";
    BuffId["proc:4:bc fill-flat"] = "proc:4:bc fill-flat";
    BuffId["proc:4:bc fill-percent"] = "proc:4:bc fill-percent";
    BuffId["proc:5:regular or elemental-atk"] = "proc:5:regular or elemental-atk";
    BuffId["proc:5:regular or elemental-def"] = "proc:5:regular or elemental-def";
    BuffId["proc:5:regular or elemental-rec"] = "proc:5:regular or elemental-rec";
    BuffId["proc:5:regular or elemental-crit"] = "proc:5:regular or elemental-crit";
    BuffId["proc:6:drop boost-bc"] = "proc:6:drop boost-bc";
    BuffId["proc:6:drop boost-hc"] = "proc:6:drop boost-hc";
    BuffId["proc:6:drop boost-item"] = "proc:6:drop boost-item";
    BuffId["proc:7:guaranteed ko resistance"] = "proc:7:guaranteed ko resistance";
    BuffId["proc:8:max hp boost-flat"] = "proc:8:max hp boost-flat";
    BuffId["proc:8:max hp boost-percent"] = "proc:8:max hp boost-percent";
    BuffId["proc:9:regular or elemental reduction-atk"] = "proc:9:regular or elemental reduction-atk";
    BuffId["proc:9:regular or elemental reduction-def"] = "proc:9:regular or elemental reduction-def";
    BuffId["proc:9:regular or elemental reduction-rec"] = "proc:9:regular or elemental reduction-rec";
    BuffId["proc:9:regular or elemental reduction-unknown"] = "proc:9:regular or elemental reduction-unknown";
    BuffId["proc:10:cleanse-poison"] = "proc:10:cleanse-poison";
    BuffId["proc:10:cleanse-weak"] = "proc:10:cleanse-weak";
    BuffId["proc:10:cleanse-sick"] = "proc:10:cleanse-sick";
    BuffId["proc:10:cleanse-injury"] = "proc:10:cleanse-injury";
    BuffId["proc:10:cleanse-curse"] = "proc:10:cleanse-curse";
    BuffId["proc:10:cleanse-paralysis"] = "proc:10:cleanse-paralysis";
    BuffId["proc:10:cleanse-atk down"] = "proc:10:cleanse-atk down";
    BuffId["proc:10:cleanse-def down"] = "proc:10:cleanse-def down";
    BuffId["proc:10:cleanse-rec down"] = "proc:10:cleanse-rec down";
    BuffId["proc:10:cleanse-unknown"] = "proc:10:cleanse-unknown";
    BuffId["proc:11:chance inflict-poison"] = "proc:11:chance inflict-poison";
    BuffId["proc:11:chance inflict-weak"] = "proc:11:chance inflict-weak";
    BuffId["proc:11:chance inflict-sick"] = "proc:11:chance inflict-sick";
    BuffId["proc:11:chance inflict-injury"] = "proc:11:chance inflict-injury";
    BuffId["proc:11:chance inflict-curse"] = "proc:11:chance inflict-curse";
    BuffId["proc:11:chance inflict-paralysis"] = "proc:11:chance inflict-paralysis";
    BuffId["proc:11:chance inflict-atk down"] = "proc:11:chance inflict-atk down";
    BuffId["proc:11:chance inflict-def down"] = "proc:11:chance inflict-def down";
    BuffId["proc:11:chance inflict-rec down"] = "proc:11:chance inflict-rec down";
    BuffId["proc:11:chance inflict-unknown"] = "proc:11:chance inflict-unknown";
    BuffId["proc:12:guaranteed revive"] = "proc:12:guaranteed revive";
    BuffId["proc:13:random attack"] = "proc:13:random attack";
    BuffId["proc:14:hp absorb attack"] = "proc:14:hp absorb attack";
    BuffId["proc:16:mitigate-fire"] = "proc:16:mitigate-fire";
    BuffId["proc:16:mitigate-water"] = "proc:16:mitigate-water";
    BuffId["proc:16:mitigate-earth"] = "proc:16:mitigate-earth";
    BuffId["proc:16:mitigate-thunder"] = "proc:16:mitigate-thunder";
    BuffId["proc:16:mitigate-light"] = "proc:16:mitigate-light";
    BuffId["proc:16:mitigate-dark"] = "proc:16:mitigate-dark";
    BuffId["proc:16:mitigate-all"] = "proc:16:mitigate-all";
    BuffId["proc:16:mitigate-unknown"] = "proc:16:mitigate-unknown";
    BuffId["proc:17:resist-poison"] = "proc:17:resist-poison";
    BuffId["proc:17:resist-weak"] = "proc:17:resist-weak";
    BuffId["proc:17:resist-sick"] = "proc:17:resist-sick";
    BuffId["proc:17:resist-injury"] = "proc:17:resist-injury";
    BuffId["proc:17:resist-curse"] = "proc:17:resist-curse";
    BuffId["proc:17:resist-paralysis"] = "proc:17:resist-paralysis";
    BuffId["proc:18:mitigation"] = "proc:18:mitigation";
    BuffId["proc:19:gradual bc fill"] = "proc:19:gradual bc fill";
    BuffId["proc:20:bc fill on hit"] = "proc:20:bc fill on hit";
    BuffId["proc:22:defense ignore"] = "proc:22:defense ignore";
    BuffId["proc:23:spark damage"] = "proc:23:spark damage";
    BuffId["proc:24:converted-atk"] = "proc:24:converted-atk";
    BuffId["proc:24:converted-def"] = "proc:24:converted-def";
    BuffId["proc:24:converted-rec"] = "proc:24:converted-rec";
    BuffId["proc:26:hit count boost"] = "proc:26:hit count boost";
    BuffId["proc:27:proportional attack"] = "proc:27:proportional attack";
    BuffId["proc:28:fixed attack"] = "proc:28:fixed attack";
    BuffId["proc:29:multi-element attack"] = "proc:29:multi-element attack";
    BuffId["proc:30:add element-fire"] = "proc:30:add element-fire";
    BuffId["proc:30:add element-water"] = "proc:30:add element-water";
    BuffId["proc:30:add element-earth"] = "proc:30:add element-earth";
    BuffId["proc:30:add element-thunder"] = "proc:30:add element-thunder";
    BuffId["proc:30:add element-light"] = "proc:30:add element-light";
    BuffId["proc:30:add element-dark"] = "proc:30:add element-dark";
    BuffId["proc:30:add element-unknown"] = "proc:30:add element-unknown";
    BuffId["proc:31:bc fill-flat"] = "proc:31:bc fill-flat";
    BuffId["proc:31:bc fill-percent"] = "proc:31:bc fill-percent";
    BuffId["proc:32:element shift-fire"] = "proc:32:element shift-fire";
    BuffId["proc:32:element shift-water"] = "proc:32:element shift-water";
    BuffId["proc:32:element shift-earth"] = "proc:32:element shift-earth";
    BuffId["proc:32:element shift-thunder"] = "proc:32:element shift-thunder";
    BuffId["proc:32:element shift-light"] = "proc:32:element shift-light";
    BuffId["proc:32:element shift-dark"] = "proc:32:element shift-dark";
    BuffId["proc:32:element shift-unknown"] = "proc:32:element shift-unknown";
    BuffId["proc:33:buff wipe"] = "proc:33:buff wipe";
    BuffId["proc:34:bc drain-flat"] = "proc:34:bc drain-flat";
    BuffId["proc:34:bc drain-percent"] = "proc:34:bc drain-percent";
    BuffId["proc:36:ls lock"] = "proc:36:ls lock";
    BuffId["proc:37:summon"] = "proc:37:summon";
    BuffId["proc:38:cleanse-poison"] = "proc:38:cleanse-poison";
    BuffId["proc:38:cleanse-weak"] = "proc:38:cleanse-weak";
    BuffId["proc:38:cleanse-sick"] = "proc:38:cleanse-sick";
    BuffId["proc:38:cleanse-injury"] = "proc:38:cleanse-injury";
    BuffId["proc:38:cleanse-curse"] = "proc:38:cleanse-curse";
    BuffId["proc:38:cleanse-paralysis"] = "proc:38:cleanse-paralysis";
    BuffId["proc:38:cleanse-atk down"] = "proc:38:cleanse-atk down";
    BuffId["proc:38:cleanse-def down"] = "proc:38:cleanse-def down";
    BuffId["proc:38:cleanse-rec down"] = "proc:38:cleanse-rec down";
    BuffId["proc:38:cleanse-unknown"] = "proc:38:cleanse-unknown";
    BuffId["proc:39:mitigate-fire"] = "proc:39:mitigate-fire";
    BuffId["proc:39:mitigate-water"] = "proc:39:mitigate-water";
    BuffId["proc:39:mitigate-earth"] = "proc:39:mitigate-earth";
    BuffId["proc:39:mitigate-thunder"] = "proc:39:mitigate-thunder";
    BuffId["proc:39:mitigate-light"] = "proc:39:mitigate-light";
    BuffId["proc:39:mitigate-dark"] = "proc:39:mitigate-dark";
    BuffId["proc:39:mitigate-unknown"] = "proc:39:mitigate-unknown";
    BuffId["proc:40:add ailment-poison"] = "proc:40:add ailment-poison";
    BuffId["proc:40:add ailment-weak"] = "proc:40:add ailment-weak";
    BuffId["proc:40:add ailment-sick"] = "proc:40:add ailment-sick";
    BuffId["proc:40:add ailment-injury"] = "proc:40:add ailment-injury";
    BuffId["proc:40:add ailment-curse"] = "proc:40:add ailment-curse";
    BuffId["proc:40:add ailment-paralysis"] = "proc:40:add ailment-paralysis";
    BuffId["proc:40:add ailment-atk down"] = "proc:40:add ailment-atk down";
    BuffId["proc:40:add ailment-def down"] = "proc:40:add ailment-def down";
    BuffId["proc:40:add ailment-rec down"] = "proc:40:add ailment-rec down";
    BuffId["proc:40:add ailment-unknown"] = "proc:40:add ailment-unknown";
    BuffId["proc:42:sacrificial attack"] = "proc:42:sacrificial attack";
    BuffId["proc:42:instant death"] = "proc:42:instant death";
    BuffId["proc:43:burst od fill"] = "proc:43:burst od fill";
    BuffId["proc:44:damage over time"] = "proc:44:damage over time";
    BuffId["proc:45:attack boost-bb"] = "proc:45:attack boost-bb";
    BuffId["proc:45:attack boost-sbb"] = "proc:45:attack boost-sbb";
    BuffId["proc:45:attack boost-ubb"] = "proc:45:attack boost-ubb";
    BuffId["proc:46:non-lethal proportional attack"] = "proc:46:non-lethal proportional attack";
    BuffId["proc:47:hp scaled attack"] = "proc:47:hp scaled attack";
    BuffId["proc:48:piercing attack-base"] = "proc:48:piercing attack-base";
    BuffId["proc:48:piercing attack-current"] = "proc:48:piercing attack-current";
    BuffId["proc:48:piercing attack-fixed"] = "proc:48:piercing attack-fixed";
    BuffId["proc:48:piercing attack-unknown"] = "proc:48:piercing attack-unknown";
    BuffId["proc:49:chance instant death"] = "proc:49:chance instant death";
    BuffId["proc:50:chance damage reflect"] = "proc:50:chance damage reflect";
    BuffId["proc:51:add to attack-atk down"] = "proc:51:add to attack-atk down";
    BuffId["proc:51:add to attack-def down"] = "proc:51:add to attack-def down";
    BuffId["proc:51:add to attack-rec down"] = "proc:51:add to attack-rec down";
    BuffId["proc:52:bc efficacy"] = "proc:52:bc efficacy";
    BuffId["proc:53:inflict on hit-poison"] = "proc:53:inflict on hit-poison";
    BuffId["proc:53:inflict on hit-weak"] = "proc:53:inflict on hit-weak";
    BuffId["proc:53:inflict on hit-sick"] = "proc:53:inflict on hit-sick";
    BuffId["proc:53:inflict on hit-injury"] = "proc:53:inflict on hit-injury";
    BuffId["proc:53:inflict on hit-curse"] = "proc:53:inflict on hit-curse";
    BuffId["proc:53:inflict on hit-paralysis"] = "proc:53:inflict on hit-paralysis";
    BuffId["proc:54:critical damage boost"] = "proc:54:critical damage boost";
    BuffId["proc:55:elemental weakness damage-fire"] = "proc:55:elemental weakness damage-fire";
    BuffId["proc:55:elemental weakness damage-water"] = "proc:55:elemental weakness damage-water";
    BuffId["proc:55:elemental weakness damage-earth"] = "proc:55:elemental weakness damage-earth";
    BuffId["proc:55:elemental weakness damage-thunder"] = "proc:55:elemental weakness damage-thunder";
    BuffId["proc:55:elemental weakness damage-light"] = "proc:55:elemental weakness damage-light";
    BuffId["proc:55:elemental weakness damage-dark"] = "proc:55:elemental weakness damage-dark";
    BuffId["proc:55:elemental weakness damage-unknown"] = "proc:55:elemental weakness damage-unknown";
    BuffId["proc:56:chance ko resistance"] = "proc:56:chance ko resistance";
    BuffId["proc:57:bc drop resistance-base"] = "proc:57:bc drop resistance-base";
    BuffId["proc:57:bc drop resistance-buff"] = "proc:57:bc drop resistance-buff";
    BuffId["proc:57:hc drop resistance-base"] = "proc:57:hc drop resistance-base";
    BuffId["proc:57:hc drop resistance-buff"] = "proc:57:hc drop resistance-buff";
    BuffId["proc:58:spark vulnerability"] = "proc:58:spark vulnerability";
    BuffId["proc:59:attack reduction-bb"] = "proc:59:attack reduction-bb";
    BuffId["proc:59:attack reduction-sbb"] = "proc:59:attack reduction-sbb";
    BuffId["proc:59:attack reduction-ubb"] = "proc:59:attack reduction-ubb";
    BuffId["proc:61:party bb gauge-scaled attack"] = "proc:61:party bb gauge-scaled attack";
    BuffId["proc:61:party bc drain"] = "proc:61:party bc drain";
    BuffId["proc:62:barrier-all"] = "proc:62:barrier-all";
    BuffId["proc:62:barrier-fire"] = "proc:62:barrier-fire";
    BuffId["proc:62:barrier-water"] = "proc:62:barrier-water";
    BuffId["proc:62:barrier-earth"] = "proc:62:barrier-earth";
    BuffId["proc:62:barrier-thunder"] = "proc:62:barrier-thunder";
    BuffId["proc:62:barrier-light"] = "proc:62:barrier-light";
    BuffId["proc:62:barrier-dark"] = "proc:62:barrier-dark";
    BuffId["proc:62:barrier-unknown"] = "proc:62:barrier-unknown";
    BuffId["proc:64:consecutive usage attack"] = "proc:64:consecutive usage attack";
    BuffId["proc:65:ailment attack boost"] = "proc:65:ailment attack boost";
    BuffId["proc:66:chance revive"] = "proc:66:chance revive";
    BuffId["proc:67:bc fill on spark"] = "proc:67:bc fill on spark";
    BuffId["proc:68:guard mitigation"] = "proc:68:guard mitigation";
    BuffId["proc:69:bc fill on guard-flat"] = "proc:69:bc fill on guard-flat";
    BuffId["proc:69:bc fill on guard-percent"] = "proc:69:bc fill on guard-percent";
    BuffId["proc:71:bc efficacy reduction"] = "proc:71:bc efficacy reduction";
    BuffId["proc:73:resist-atk down"] = "proc:73:resist-atk down";
    BuffId["proc:73:resist-def down"] = "proc:73:resist-def down";
    BuffId["proc:73:resist-rec down"] = "proc:73:resist-rec down";
    BuffId["proc:75:element squad-scaled attack"] = "proc:75:element squad-scaled attack";
    BuffId["proc:76:extra action"] = "proc:76:extra action";
    BuffId["proc:78:self stat boost-atk"] = "proc:78:self stat boost-atk";
    BuffId["proc:78:self stat boost-def"] = "proc:78:self stat boost-def";
    BuffId["proc:78:self stat boost-rec"] = "proc:78:self stat boost-rec";
    BuffId["proc:78:self stat boost-crit"] = "proc:78:self stat boost-crit";
    BuffId["proc:79:player exp boost"] = "proc:79:player exp boost";
    BuffId["proc:82:resummon"] = "proc:82:resummon";
    BuffId["proc:83:spark critical"] = "proc:83:spark critical";
    BuffId["proc:84:od fill rate"] = "proc:84:od fill rate";
    BuffId["proc:85:heal on hit"] = "proc:85:heal on hit";
    BuffId["proc:86:hp absorb"] = "proc:86:hp absorb";
    BuffId["proc:87:heal on spark"] = "proc:87:heal on spark";
    BuffId["proc:88:self spark damage"] = "proc:88:self spark damage";
    BuffId["proc:89:self converted-atk"] = "proc:89:self converted-atk";
    BuffId["proc:89:self converted-def"] = "proc:89:self converted-def";
    BuffId["proc:89:self converted-rec"] = "proc:89:self converted-rec";
    BuffId["proc:92:self max hp boost-flat"] = "proc:92:self max hp boost-flat";
    BuffId["proc:92:self max hp boost-percent"] = "proc:92:self max hp boost-percent";
    BuffId["proc:93:critical damage resistance-base"] = "proc:93:critical damage resistance-base";
    BuffId["proc:93:critical damage resistance-buff"] = "proc:93:critical damage resistance-buff";
    BuffId["proc:93:element damage resistance-base"] = "proc:93:element damage resistance-base";
    BuffId["proc:93:element damage resistance-buff"] = "proc:93:element damage resistance-buff";
    BuffId["proc:93:spark damage resistance-base"] = "proc:93:spark damage resistance-base";
    BuffId["proc:93:spark damage resistance-buff"] = "proc:93:spark damage resistance-buff";
    BuffId["proc:94:aoe normal attack"] = "proc:94:aoe normal attack";
    BuffId["proc:95:sphere lock"] = "proc:95:sphere lock";
    BuffId["proc:96:es lock"] = "proc:96:es lock";
    BuffId["proc:97:element specific attack"] = "proc:97:element specific attack";
    BuffId["proc:113:gradual od fill"] = "proc:113:gradual od fill";
    BuffId["proc:119:gradual bc drain-flat"] = "proc:119:gradual bc drain-flat";
    BuffId["proc:119:gradual bc drain-percent"] = "proc:119:gradual bc drain-percent";
    BuffId["proc:123:od gauge drain"] = "proc:123:od gauge drain";
    BuffId["proc:126:damage over time reduction"] = "proc:126:damage over time reduction";
    BuffId["proc:127:lock on"] = "proc:127:lock on";
    BuffId["proc:130:inflict on hit-atk down"] = "proc:130:inflict on hit-atk down";
    BuffId["proc:130:inflict on hit-def down"] = "proc:130:inflict on hit-def down";
    BuffId["proc:130:inflict on hit-rec down"] = "proc:130:inflict on hit-rec down";
    BuffId["proc:131:spark damage mitigation"] = "proc:131:spark damage mitigation";
    BuffId["proc:132:chance inflict vulnerability-critical"] = "proc:132:chance inflict vulnerability-critical";
    BuffId["proc:132:chance inflict vulnerability-elemental"] = "proc:132:chance inflict vulnerability-elemental";
    BuffId["proc:901:raid burst heal"] = "proc:901:raid burst heal";
    BuffId["proc:902:raid stat boost-atk"] = "proc:902:raid stat boost-atk";
    BuffId["proc:902:raid stat boost-def"] = "proc:902:raid stat boost-def";
    BuffId["proc:902:raid stat boost-rec"] = "proc:902:raid stat boost-rec";
    BuffId["proc:902:raid stat boost-crit"] = "proc:902:raid stat boost-crit";
    BuffId["proc:903:boss location reveal"] = "proc:903:boss location reveal";
    BuffId["proc:905:teleport to camp"] = "proc:905:teleport to camp";
    BuffId["proc:906:flee battle"] = "proc:906:flee battle";
    BuffId["proc:907:raid mitigation"] = "proc:907:raid mitigation";
    BuffId["proc:908:raid drop rate multiplier"] = "proc:908:raid drop rate multiplier";
    BuffId["UNKNOWN_CONDITIONAL_EFFECT_ID"] = "UNKNOWN_CONDITIONAL_EFFECT_ID";
    BuffId["UNKNOWN_CONDITIONAL_BUFF_PARAMS"] = "UNKNOWN_CONDITIONAL_BUFF_PARAMS";
    BuffId["conditional:1:attack buff"] = "conditional:1:attack buff";
    BuffId["conditional:3:defense buff"] = "conditional:3:defense buff";
    BuffId["conditional:5:recovery buff"] = "conditional:5:recovery buff";
    BuffId["conditional:7:critical hit rate buff"] = "conditional:7:critical hit rate buff";
    BuffId["conditional:8:gradual heal"] = "conditional:8:gradual heal";
    BuffId["conditional:12:guaranteed ko resistance"] = "conditional:12:guaranteed ko resistance";
    BuffId["conditional:13:elemental attack buff"] = "conditional:13:elemental attack buff";
    BuffId["conditional:14:elemental defense buff"] = "conditional:14:elemental defense buff";
    BuffId["conditional:21:fire mitigation"] = "conditional:21:fire mitigation";
    BuffId["conditional:22:water mitigation"] = "conditional:22:water mitigation";
    BuffId["conditional:23:earth mitigation"] = "conditional:23:earth mitigation";
    BuffId["conditional:24:thunder mitigation"] = "conditional:24:thunder mitigation";
    BuffId["conditional:25:light mitigation"] = "conditional:25:light mitigation";
    BuffId["conditional:26:dark mitigation"] = "conditional:26:dark mitigation";
    BuffId["conditional:36:mitigation"] = "conditional:36:mitigation";
    BuffId["conditional:37:gradual bc fill"] = "conditional:37:gradual bc fill";
    BuffId["conditional:40:spark damage"] = "conditional:40:spark damage";
    BuffId["conditional:51:add fire element"] = "conditional:51:add fire element";
    BuffId["conditional:52:add water element"] = "conditional:52:add water element";
    BuffId["conditional:53:add earth element"] = "conditional:53:add earth element";
    BuffId["conditional:54:add thunder element"] = "conditional:54:add thunder element";
    BuffId["conditional:55:add light element"] = "conditional:55:add light element";
    BuffId["conditional:56:add dark element"] = "conditional:56:add dark element";
    BuffId["conditional:72:attack boost-bb"] = "conditional:72:attack boost-bb";
    BuffId["conditional:72:attack boost-sbb"] = "conditional:72:attack boost-sbb";
    BuffId["conditional:72:attack boost-ubb"] = "conditional:72:attack boost-ubb";
    BuffId["conditional:74:add atk down to attack"] = "conditional:74:add atk down to attack";
    BuffId["conditional:75:add def down to attack"] = "conditional:75:add def down to attack";
    BuffId["conditional:84:critical damage"] = "conditional:84:critical damage";
    BuffId["conditional:91:chance ko resistance"] = "conditional:91:chance ko resistance";
    BuffId["conditional:95:fire barrier"] = "conditional:95:fire barrier";
    BuffId["conditional:96:water barrier"] = "conditional:96:water barrier";
    BuffId["conditional:97:earth barrier"] = "conditional:97:earth barrier";
    BuffId["conditional:98:thunder barrier"] = "conditional:98:thunder barrier";
    BuffId["conditional:99:light barrier"] = "conditional:99:light barrier";
    BuffId["conditional:100:dark barrier"] = "conditional:100:dark barrier";
    BuffId["conditional:111:bc fill on spark"] = "conditional:111:bc fill on spark";
    BuffId["conditional:112:bc efficacy reduction"] = "conditional:112:bc efficacy reduction";
    BuffId["conditional:124:self attack buff"] = "conditional:124:self attack buff";
    BuffId["conditional:125:self defense buff"] = "conditional:125:self defense buff";
    BuffId["conditional:131:spark critical"] = "conditional:131:spark critical";
    BuffId["conditional:132:od fill rate"] = "conditional:132:od fill rate";
    BuffId["conditional:133:heal on hit"] = "conditional:133:heal on hit";
    BuffId["conditional:143:critical damage reduction-base"] = "conditional:143:critical damage reduction-base";
    BuffId["conditional:143:critical damage reduction-buff"] = "conditional:143:critical damage reduction-buff";
    BuffId["conditional:144:spark damage reduction-base"] = "conditional:144:spark damage reduction-base";
    BuffId["conditional:144:spark damage reduction-buff"] = "conditional:144:spark damage reduction-buff";
    BuffId["conditional:145:elemental weakness damage reduction-base"] = "conditional:145:elemental weakness damage reduction-base";
    BuffId["conditional:145:elemental weakness damage reduction-buff"] = "conditional:145:elemental weakness damage reduction-buff";
    BuffId["conditional:153:chance inflict atk down on hit"] = "conditional:153:chance inflict atk down on hit";
    BuffId["conditional:10001:stealth"] = "conditional:10001:stealth";
    BuffId["conditional:10001:stealth-atk"] = "conditional:10001:stealth-atk";
    BuffId["conditional:10001:stealth-def"] = "conditional:10001:stealth-def";
    BuffId["conditional:10001:stealth-rec"] = "conditional:10001:stealth-rec";
    BuffId["conditional:10001:stealth-crit"] = "conditional:10001:stealth-crit";
    BuffId["conditional:10500:shield-all"] = "conditional:10500:shield-all";
    BuffId["conditional:10500:shield-fire"] = "conditional:10500:shield-fire";
    BuffId["conditional:10500:shield-water"] = "conditional:10500:shield-water";
    BuffId["conditional:10500:shield-earth"] = "conditional:10500:shield-earth";
    BuffId["conditional:10500:shield-thunder"] = "conditional:10500:shield-thunder";
    BuffId["conditional:10500:shield-light"] = "conditional:10500:shield-light";
    BuffId["conditional:10500:shield-dark"] = "conditional:10500:shield-dark";
    BuffId["conditional:10500:shield-unknown"] = "conditional:10500:shield-unknown";
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
    const resultArray = Array.isArray(context.previousSources)
        ? context.previousSources.slice()
        : [];
    // Ensure that the current source is at the beginning of the array
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
    const conditions = (effect && Array.isArray(effect.conditions) && effect.conditions) || [];
    const aggregate = {
        units: new Set(),
        items: new Set(),
        sphereTypes: new Set(),
        unknowns: new Set(),
    };
    conditions.forEach((condition, index) => {
        if ('sphere category required (raw)' in condition) {
            aggregate.sphereTypes.add(condition['sphere category required (raw)']);
        }
        else if ('item required' in condition) {
            condition['item required'].forEach((item) => {
                aggregate.items.add(item);
            });
        }
        else if ('unit required' in condition) {
            condition['unit required'].forEach((unit) => {
                aggregate.units.add(`${unit.id}`);
            });
        }
        else {
            aggregate.unknowns.add(`type:${condition.type_id || index},condition:${condition.condition_id || index}`);
        }
    });
    // filter out properties that have no entries
    const result = Object.entries(aggregate)
        .filter((entry) => entry[1].size > 0)
        .reduce((acc, entry) => {
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
    const isLeaderSkillEffect = context.source === BuffSource.LeaderSkill ||
        (effect.sp_type === SpPassiveType.EnhancePassive);
    const isPartyEffect = isLeaderSkillEffect || effect['passive target'] === TargetType.Party;
    return {
        targetType: isPartyEffect ? TargetType.Party : TargetType.Self,
        targetArea: isPartyEffect ? TargetArea.Aoe : TargetArea.Single,
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
        targetType: effect['target type'],
    };
}
/**
 * @description Try to parse the given value into a number or return a value if it is not a number.
 * @param value Value to parse into a number.
 * @param defaultValue Value to return if `value` is not a number; defaults to 0.
 * @returns Parsed value as a number or the `defaultValue` if the value is not a number.
 */
function parseNumberOrDefault(value, defaultValue = 0) {
    return (value !== null && !isNaN(value)) ? +value : defaultValue;
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
    const result = params
        .reduce((acc, value, index) => {
        if (value && value !== '0') {
            acc[`param_${startIndex + index}`] = value;
            hasValue = true;
        }
        return acc;
    }, {});
    return hasValue ? result : (void 0);
}
/**
 * @description Decide whether a given source value is one of the burst types in {@link BuffSource}.
 * @param source Source value to check.
 * @returns Whether the given source value is a burst type. Returns true when the source is determined to
 * be any one of the following: brave burst, super brave burst, ultimate brave burst, bonded brave burst,
 * bonded super brave burst, or bonded dual brave burst.
 */
function buffSourceIsBurstType(source) {
    return !!source && [
        BuffSource.BraveBurst, BuffSource.SuperBraveBurst, BuffSource.UltimateBraveBurst,
        BuffSource.BondedBraveBurst, BuffSource.BondedSuperBraveBurst, BuffSource.DualBraveBurst,
    ].includes(source);
}
/**
 * @description Given an array of parameters, conditionally creata an unknown params value entry.
 * @param extraParams Array of string parameters from an effect.
 * @param startIndex Index to use when generating entries for the unknown params value entry.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns An unknown params entry if there are extra parameters, undefined otherwise.
 */
function createUnknownParamsEntryFromExtraParams(extraParams, startIndex, injectionContext) {
    let unknownParams;
    if (extraParams && extraParams.length > 0) {
        unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
    }
    return unknownParams;
}
/**
 * @description Helper function for creating a `NO_PARAMS_SPECIFIED` entry from a given context.
 * @param context An effect processing context containing information created while parsing an effect.
 * @returns A single buff denoting a `NO_PARAMS_SPECIFIED` entry.
 */
function createNoParamsEntry({ originalId, sources }) {
    return {
        id: BuffId.NO_PARAMS_SPECIFIED,
        originalId,
        sources,
    };
}

let mapping$2;
/**
 * @description Retrieve the proc-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of proc IDs to functions.
 */
function getProcEffectToBuffMapping(reload) {
    if (!mapping$2 || reload) {
        mapping$2 = new Map();
        setMapping$2(mapping$2);
    }
    return mapping$2;
}
/**
 * @description Apply the mapping of proc effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping$2(map) {
    const UNKNOWN_PROC_PARAM_EFFECT_KEY = 'unknown proc param';
    const ELEMENT_MAPPING = {
        0: BuffConditionElement.All,
        1: UnitElement.Fire,
        2: UnitElement.Water,
        3: UnitElement.Earth,
        4: UnitElement.Thunder,
        5: UnitElement.Light,
        6: UnitElement.Dark,
    };
    const NON_ZERO_ELEMENT_MAPPING = {
        1: UnitElement.Fire,
        2: UnitElement.Water,
        3: UnitElement.Earth,
        4: UnitElement.Thunder,
        5: UnitElement.Light,
        6: UnitElement.Dark,
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
        9: Ailment.RecoveryReduction,
    };
    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
        const targetData = ((injectionContext && injectionContext.getProcTargetData) || getProcTargetData)(effect);
        const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
        const effectDelay = effect['effect delay time(ms)/frame'];
        return { targetData, sources, effectDelay };
    };
    // Disable rule as this function is only called once it's confirmed that `effect.params` exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const splitEffectParams = (effect) => effect.params.split(',');
    const splitEffectWithUnknownProcParamsProperty = (effect) => {
        const rawParams = effect.params || effect[UNKNOWN_PROC_PARAM_EFFECT_KEY] || '';
        return splitEffectParams({ params: rawParams });
    };
    const createUnknownParamsEntry = (unknownParams, { originalId, sources, targetData, effectDelay, }) => (Object.assign({ id: BuffId.UNKNOWN_PROC_BUFF_PARAMS, originalId,
        effectDelay,
        sources, value: unknownParams }, targetData));
    const createTurnDurationEntry = ({ originalId, sources, buffs, duration, targetData, }) => (Object.assign({ id: BuffId.TURN_DURATION_MODIFICATION, originalId,
        sources, value: {
            buffs,
            duration,
        } }, targetData));
    /**
     * @description Common checks that are run for most effects after the params have been parsed
     * into an array of {@link IBuff} but before said array is returned.
     * @param results List of buffs from the given effect.
     * @param unknownParams Any unknown parameters from the given effect.
     * @param parsingContext Extra metadata extracted from the given effect.
     * @returns {undefined} No value is returned, but it does update the `results` array.
     */
    const handlePostParse = (results, unknownParams, { originalId, sources, targetData, effectDelay, }) => {
        if (results.length === 0) {
            results.push(createNoParamsEntry({ originalId, sources }));
        }
        if (unknownParams) {
            results.push(createUnknownParamsEntry(unknownParams, {
                originalId,
                sources,
                targetData,
                effectDelay,
            }));
        }
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
            result = !((injectionContext && injectionContext.buffSourceIsBurstType) || buffSourceIsBurstType)(context.source);
        }
        return result;
    };
    /**
     * @description Helper function to get attack information common across most attacks from the conversion context.
     * @param context Given context that may contain attack information like damage frames.
     * @returns Extracted attack information from the context (with defaults where applicable).
     */
    const getAttackInformationFromContext = (context) => {
        const hits = parseNumberOrDefault(context.damageFrames && context.damageFrames.hits || 0);
        const distribution = parseNumberOrDefault(context.damageFrames && context.damageFrames['hit dmg% distribution (total)']);
        return {
            hits,
            distribution,
        };
    };
    const parseProcWithSingleNumericalParameterAndTurnDuration = ({ effect, context, injectionContext, effectValueKey, effectTurnDurationKey, parseParamValue = (rawValue) => parseNumberOrDefault(rawValue), buffId, originalId, }) => {
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let value = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawValue, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            value = parseParamValue(rawValue);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else if (effectValueKey && effectTurnDurationKey) {
            value = parseNumberOrDefault(effect[effectValueKey]);
            turnDuration = parseNumberOrDefault(effect[effectTurnDurationKey]);
        }
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: buffId, originalId,
                sources,
                effectDelay, duration: turnDuration, value }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: [buffId],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    };
    const parseProcWithNumericalValueRangeAndChanceAndTurnDuration = ({ effect, context, injectionContext, originalId, buffId, effectKeyLow, effectKeyHigh, effectKeyChance, effectTurnDurationKey, buffKeyLow, buffKeyHigh, parseParamValue = (rawValue) => parseNumberOrDefault(rawValue), generateConditions, }) => {
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let valueLow = 0;
        let valueHigh = 0;
        let chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawValueLow, rawValueHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            valueLow = parseParamValue(rawValueLow);
            valueHigh = parseParamValue(rawValueHigh);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            valueLow = parseNumberOrDefault(effect[effectKeyLow]);
            valueHigh = parseNumberOrDefault(effect[effectKeyHigh]);
            chance = parseNumberOrDefault(effect[effectKeyChance]);
            turnDuration = parseNumberOrDefault(effect[effectTurnDurationKey]);
        }
        const hasAnyValues = valueLow !== 0 || valueHigh !== 0 || chance !== 0;
        const results = [];
        if (hasAnyValues) {
            const entry = Object.assign({ id: buffId, originalId,
                sources,
                effectDelay, duration: turnDuration, value: {
                    [buffKeyLow]: valueLow,
                    [buffKeyHigh]: valueHigh,
                    chance,
                } }, targetData);
            if (generateConditions) {
                entry.conditions = generateConditions();
            }
            results.push(entry);
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: [buffId],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    };
    map.set('1', (effect, context, injectionContext) => {
        const originalId = '1';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            params['atk%'] = effect['bb atk%'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:1:attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('2', (effect, context, injectionContext) => {
        const originalId = '2';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            healLow: '0',
            healHigh: '0',
            'healerRec%': 0,
        };
        let unknownParams;
        if (effect.params) {
            let recX, recY;
            let extraParams;
            [params.healLow, params.healHigh, recX, recY, ...extraParams] = splitEffectParams(effect);
            params['healerRec%'] = ((100 + parseNumberOrDefault(recX)) * (1 + parseNumberOrDefault(recY) / 100)) / 10;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            params.healLow = effect['heal low'];
            params.healHigh = effect['heal high'];
            params['healerRec%'] = effect['rec added% (from healer)'];
        }
        // ensure every property is a number
        Object.keys(params).forEach((key) => {
            params[key] = parseNumberOrDefault(params[key]);
        });
        const results = [];
        if (params.healHigh !== 0 || params.healLow !== 0) {
            results.push(Object.assign({ id: 'proc:2:burst heal', originalId,
                sources,
                effectDelay, value: params }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('3', (effect, context, injectionContext) => {
        const originalId = '3';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            healLow: '0',
            healHigh: '0',
            'targetRec%': 0,
            turnDuration: '0',
        };
        let unknownParams;
        if (effect.params) {
            let rec;
            let extraParams;
            [params.healLow, params.healHigh, rec, params.turnDuration, ...extraParams] = splitEffectParams(effect);
            params['targetRec%'] = (1 + parseNumberOrDefault(rec) / 100) * 10;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            params.healLow = effect['gradual heal low'];
            params.healHigh = effect['gradual heal high'];
            params['targetRec%'] = effect['rec added% (from target)'];
            params.turnDuration = effect['gradual heal turns (8)'];
        }
        // ensure every property is a number
        Object.keys(params).forEach((key) => {
            params[key] = parseNumberOrDefault(params[key]);
        });
        const hasAnyHealValues = params.healLow !== 0 || params.healHigh !== 0;
        const results = [];
        if (hasAnyHealValues) {
            results.push(Object.assign({ id: 'proc:3:gradual heal', originalId,
                sources,
                effectDelay, duration: params.turnDuration, value: {
                    healLow: params.healLow,
                    healHigh: params.healHigh,
                    'targetRec%': params['targetRec%'],
                } }, targetData));
        }
        else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:3:gradual heal'],
                duration: params.turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('4', (effect, context, injectionContext) => {
        const originalId = '4';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatFill = 0;
        let percentFill = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
            flatFill = parseNumberOrDefault(rawFlatFill) / 100;
            percentFill = parseNumberOrDefault(rawPercentFill);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            if ('bb bc fill' in effect) {
                flatFill = parseNumberOrDefault(effect['bb bc fill']);
            }
            if ('bb bc fill%' in effect) {
                percentFill = parseNumberOrDefault(effect['bb bc fill%']);
            }
        }
        const results = [];
        if (flatFill !== 0) {
            results.push(Object.assign({ id: 'proc:4:bc fill-flat', originalId,
                sources,
                effectDelay, value: flatFill }, targetData));
        }
        if (percentFill !== 0) {
            results.push(Object.assign({ id: 'proc:4:bc fill-percent', originalId,
                sources,
                effectDelay, value: percentFill }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('5', (effect, context, injectionContext) => {
        const originalId = '5';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            element: BuffConditionElement.All,
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            turnDuration: '0',
        };
        const coreStatProperties = ['atk', 'def', 'rec', 'crit'];
        let unknownParams;
        if (effect.params) {
            let extraParams;
            let rawElement;
            [rawElement, params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
            params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            const effectElement = effect['element buffed'];
            if (effectElement === 'all') {
                params.element = BuffConditionElement.All;
            }
            else if (!effectElement) {
                params.element = BuffConditionElement.Unknown;
            }
            else {
                params.element = effectElement;
            }
            const keys = Object.keys(effect);
            coreStatProperties.forEach((statType) => {
                const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
                if (effectKey) {
                    params[statType] = effect[effectKey];
                }
            });
            params.turnDuration = effect['buff turns'];
        }
        // ensure numerical properties are actually numbers
        coreStatProperties.concat(['turnDuration']).forEach((prop) => {
            params[prop] = parseNumberOrDefault(params[prop]);
        });
        const hasAnyStats = coreStatProperties.some((statKey) => params[statKey] !== 0);
        const results = [];
        if (hasAnyStats) {
            coreStatProperties.forEach((statKey) => {
                const value = params[statKey];
                if (value !== 0) {
                    const buffEntry = Object.assign({ id: `proc:5:regular or elemental-${statKey}`, originalId,
                        sources,
                        effectDelay, duration: params.turnDuration, value }, targetData);
                    if (params.element !== BuffConditionElement.All) {
                        buffEntry.conditions = {
                            targetElements: [params.element],
                        };
                    }
                    results.push(buffEntry);
                }
            });
        }
        else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: coreStatProperties.map((statKey) => `proc:5:regular or elemental-${statKey}`),
                duration: params.turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('6', (effect, context, injectionContext) => {
        const originalId = '6';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            bc: '0',
            hc: '0',
            item: '0',
            turnDuration: '0',
        };
        const dropRateProperties = ['bc', 'hc', 'item'];
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params.bc, params.hc, params.item, params.turnDuration, ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            params.bc = effect['bc drop rate% buff (10)'];
            params.hc = effect['hc drop rate% buff (9)'];
            params.item = effect['item drop rate% buff (11)'];
            params.turnDuration = effect['drop buff rate turns'];
        }
        dropRateProperties.concat(['turnDuration']).forEach((prop) => {
            params[prop] = parseNumberOrDefault(params[prop]);
        });
        const hasAnyRates = dropRateProperties.some((key) => params[key] !== 0);
        const results = [];
        if (hasAnyRates) {
            dropRateProperties.forEach((key) => {
                const value = params[key];
                if (value !== 0) {
                    results.push(Object.assign({ id: `proc:6:drop boost-${key}`, originalId,
                        sources,
                        effectDelay, duration: params.turnDuration, value }, targetData));
                }
            });
        }
        else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: dropRateProperties.map((key) => `proc:6:drop boost-${key}`),
                duration: params.turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('7', (effect, context, injectionContext) => {
        const originalId = '7';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let recoveredHpPercent = 0;
        let unknownParams;
        if (effect.params) {
            const [rawRecoveredHp, ...extraParams] = splitEffectParams(effect);
            recoveredHpPercent = parseNumberOrDefault(rawRecoveredHp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            recoveredHpPercent = parseNumberOrDefault(effect['angel idol recover hp%']);
        }
        const results = [Object.assign({ id: 'proc:7:guaranteed ko resistance', originalId,
                sources,
                effectDelay, value: recoveredHpPercent }, targetData)];
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('8', (effect, context, injectionContext) => {
        const originalId = '8';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatHpBoost = 0;
        let percentHpBoost = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlatBoost, rawPercentBoost, ...extraParams] = splitEffectParams(effect);
            flatHpBoost = parseNumberOrDefault(rawFlatBoost);
            percentHpBoost = parseNumberOrDefault(rawPercentBoost);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            if ('max hp increase' in effect) {
                flatHpBoost = parseNumberOrDefault(effect['max hp increase']);
            }
            if ('max hp% increase' in effect) {
                percentHpBoost = parseNumberOrDefault(effect['max hp% increase']);
            }
        }
        const results = [];
        if (flatHpBoost !== 0) {
            results.push(Object.assign({ id: 'proc:8:max hp boost-flat', originalId,
                sources,
                effectDelay, value: flatHpBoost }, targetData));
        }
        if (percentHpBoost !== 0) {
            results.push(Object.assign({ id: 'proc:8:max hp boost-percent', originalId,
                sources,
                effectDelay, value: percentHpBoost }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('9', (effect, context, injectionContext) => {
        const originalId = '9';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const STAT_TYPE_MAPPING = {
            0: 'atk',
            1: 'def',
            2: 'rec',
        };
        const coreStatProperties = ['atk', 'def', 'rec'];
        const params = {
            element: BuffConditionElement.All,
            statReductionEntries: [],
            turnDuration: 0,
        };
        let unknownParams;
        if (effect.params) {
            const [rawElement, statType1, value1, procChance1, statType2, value2, procChance2, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
            params.turnDuration = parseNumberOrDefault(rawTurnDuration);
            [
                [statType1, value1, procChance1],
                [statType2, value2, procChance2],
            ].forEach(([rawStatType, rawValue, rawProcChance]) => {
                const statType = parseNumberOrDefault(rawStatType) - 1;
                const value = parseNumberOrDefault(rawValue);
                const chance = parseNumberOrDefault(rawProcChance);
                if (statType === 3) { // all stats
                    params.statReductionEntries.push(...coreStatProperties.map((stat) => ({
                        stat,
                        value,
                        chance,
                    })));
                }
                else {
                    params.statReductionEntries.push({
                        stat: STAT_TYPE_MAPPING[statType] || 'unknown',
                        value,
                        chance,
                    });
                }
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            const effectElement = effect['element buffed'];
            if (effectElement === 'all') {
                params.element = BuffConditionElement.All;
            }
            else if (!effectElement) {
                params.element = BuffConditionElement.Unknown;
            }
            else {
                params.element = effectElement;
            }
            ['buff #1', 'buff #2'].forEach((buffKey) => {
                const entry = effect[buffKey];
                if (entry) {
                    const chance = parseNumberOrDefault(entry['proc chance%']);
                    const keys = Object.keys(entry);
                    coreStatProperties.forEach((statType) => {
                        const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
                        if (effectKey) {
                            params.statReductionEntries.push({
                                stat: statType,
                                value: parseNumberOrDefault(entry[effectKey]),
                                chance,
                            });
                        }
                    });
                }
            });
            params.turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = [];
        let hasAnyValues = false;
        params.statReductionEntries.forEach(({ stat, value, chance }) => {
            if (value !== 0 || chance !== 0) {
                hasAnyValues = true;
                const buffEntry = Object.assign({ id: `proc:9:regular or elemental reduction-${stat}`, originalId,
                    sources,
                    effectDelay, duration: params.turnDuration, value: { value, chance } }, targetData);
                if (params.element !== BuffConditionElement.All) {
                    buffEntry.conditions = {
                        targetElements: [params.element],
                    };
                }
                results.push(buffEntry);
            }
        });
        if (!hasAnyValues && isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: coreStatProperties.map((statKey) => `proc:9:regular or elemental reduction-${statKey}`),
                duration: params.turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('10', (effect, context, injectionContext) => {
        const originalId = '10';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const curedAilments = [];
        let unknownParams;
        if (effect.params) {
            const splitParams = splitEffectParams(effect);
            const knownParams = splitParams.slice(0, 8);
            const extraParams = splitParams.slice(8);
            knownParams
                .filter((p) => p !== '0')
                .forEach((param) => {
                curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            Object.values(AILMENT_MAPPING).forEach((ailment) => {
                if (`remove ${ailment}` in effect) { // mainly for items
                    curedAilments.push(ailment);
                }
            });
            if ('remove all status ailments' in effect) {
                curedAilments.push(Ailment.Unknown); // generic value for skills; unknown at a glance which ailments are cured
            }
        }
        const results = curedAilments.map((ailment) => (Object.assign({ id: `proc:10:cleanse-${ailment}`, originalId,
            sources,
            effectDelay, value: true }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('11', (effect, context, injectionContext) => {
        const originalId = '11';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
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
                        chance,
                    });
                }
            }
        }
        else {
            Object.values(AILMENT_MAPPING).forEach((ailment) => {
                let effectKey;
                if (ailment === Ailment.Weak) {
                    effectKey = 'weaken%';
                }
                else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
                    effectKey = ailment;
                }
                else {
                    effectKey = `${ailment}%`;
                }
                if (effectKey in effect) {
                    inflictedAilments.push({
                        ailment,
                        chance: parseNumberOrDefault(effect[effectKey]),
                    });
                }
            });
        }
        const results = inflictedAilments.map(({ ailment, chance }) => (Object.assign({ id: `proc:11:chance inflict-${ailment}`, originalId,
            sources,
            effectDelay, value: chance }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('12', (effect, context, injectionContext) => {
        const originalId = '12';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let reviveToHp = 0;
        let unknownParams;
        if (effect.params) {
            const [rawReviveToHp, ...extraParams] = splitEffectParams(effect);
            reviveToHp = parseNumberOrDefault(rawReviveToHp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            reviveToHp = parseNumberOrDefault(effect['revive to hp%']);
        }
        const results = [Object.assign({ id: 'proc:12:guaranteed revive', originalId,
                sources,
                effectDelay, value: reviveToHp }, targetData)];
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('13', (effect, context, injectionContext) => {
        const originalId = '13';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let hits = 0;
        const { distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            let rawHits;
            [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], rawHits, ...extraParams] = splitEffectParams(effect);
            hits = parseNumberOrDefault(rawHits);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            params['atk%'] = effect['bb atk%'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            hits = parseNumberOrDefault(effect.hits);
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push({
                id: 'proc:13:random attack',
                originalId,
                sources,
                effectDelay,
                value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }),
                targetType: targetData.targetType,
                targetArea: TargetArea.Random,
            });
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('14', (effect, context, injectionContext) => {
        const originalId = '14';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
            'drainLow%': '0',
            'drainHigh%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], params['drainLow%'], params['drainHigh%'], ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            params['atk%'] = effect['bb atk%'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
            params['drainLow%'] = effect['hp drain% low'];
            params['drainHigh%'] = effect['hp drain% high'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:14:hp absorb attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('16', (effect, context, injectionContext) => {
        const originalId = '16';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
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
        }
        else {
            const mitigationKey = Object.keys(effect).find((k) => k.startsWith('mitigate'));
            element = (mitigationKey && Object.values(ELEMENT_MAPPING).find((e) => mitigationKey.includes(e))) || BuffConditionElement.Unknown;
            if (mitigationKey) {
                mitigation = parseNumberOrDefault(effect[mitigationKey]);
            }
            turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = [];
        if (mitigation !== 0) {
            results.push(Object.assign({ id: `proc:16:mitigate-${element}`, originalId,
                sources,
                effectDelay, duration: turnDuration, value: mitigation }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: Object.values(ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:16:mitigate-${e}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('17', (effect, context, injectionContext) => {
        const originalId = '17';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
        const resistances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
        };
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            let rawDuration, extraParams;
            [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, rawDuration, ...extraParams] = splitEffectParams(effect);
            turnDuration = parseNumberOrDefault(rawDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('resist'));
            AILMENTS_ORDER.forEach((ailment) => {
                const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
                if (correspondingKey) {
                    resistances[ailment] = effect[correspondingKey];
                }
            });
            turnDuration = parseNumberOrDefault(effect['resist status ails turns']);
        }
        const results = [];
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(resistances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `proc:17:resist-${ailment}`, originalId,
                    sources,
                    effectDelay,
                    value, duration: turnDuration }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: AILMENTS_ORDER.map((a) => `proc:17:resist-${a}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
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
            buffId: 'proc:18:mitigation',
            originalId: '18',
        });
    });
    map.set('19', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'increase bb gauge gradual',
            effectTurnDurationKey: 'increase bb gauge gradual turns (37)',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            buffId: 'proc:19:gradual bc fill',
            originalId: '19',
        });
    });
    map.set('20', (effect, context, injectionContext) => {
        return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
            effect,
            context,
            injectionContext,
            originalId: '20',
            buffId: 'proc:20:bc fill on hit',
            effectKeyLow: 'bc fill when attacked low',
            effectKeyHigh: 'bc fill when attacked high',
            effectKeyChance: 'bc fill when attacked%',
            effectTurnDurationKey: 'bc fill when attacked turns (38)',
            buffKeyLow: 'fillLow',
            buffKeyHigh: 'fillHigh',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            generateConditions: () => ({ whenAttacked: true }),
        });
    });
    map.set('22', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'defense% ignore',
            effectTurnDurationKey: 'defense% ignore turns (39)',
            buffId: 'proc:22:defense ignore',
            originalId: '22',
        });
    });
    map.set('23', (effect, context, injectionContext) => {
        const originalId = '23';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let value = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            value = parseNumberOrDefault(params[0]);
            turnDuration = parseNumberOrDefault(params[6]);
            const extraParams = ['0', ...params.slice(1, 6), '0', ...params.slice(7)];
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        else {
            value = parseNumberOrDefault(effect['spark dmg% buff (40)']);
            turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'proc:23:spark damage', originalId,
                sources,
                effectDelay, duration: turnDuration, value }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:23:spark damage'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('24', (effect, context, injectionContext) => {
        const originalId = '24';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const coreStatProperties = ['atk', 'def', 'rec'];
        const coreStatPropertyMapping = {
            1: 'atk',
            2: 'def',
            3: 'rec',
            4: 'hp',
        };
        const effectToCoreStatMapping = {
            attack: 'atk',
            defense: 'def',
            recovery: 'rec',
            hp: 'hp',
        };
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
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
        }
        else {
            const rawConvertedStat = effect['converted attribute'];
            if (rawConvertedStat in effectToCoreStatMapping) {
                convertedStat = effectToCoreStatMapping[rawConvertedStat];
            }
            else {
                convertedStat = 'unknown';
            }
            const keys = Object.keys(effect);
            coreStatProperties.forEach((statType) => {
                const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
                if (effectKey) {
                    stats[statType] = effect[effectKey];
                }
            });
            turnDuration = parseNumberOrDefault(effect['% converted turns']);
        }
        const results = [];
        coreStatProperties.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `proc:24:converted-${stat}`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: {
                        convertedStat,
                        value,
                    } }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: coreStatProperties.map((statKey) => `proc:24:converted-${statKey}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('26', (effect, context, injectionContext) => {
        const originalId = '26';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let hitIncreasePerHit = 0, extraHitDamage = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            hitIncreasePerHit = parseNumberOrDefault(params[0]);
            extraHitDamage = parseNumberOrDefault(params[2]);
            turnDuration = parseNumberOrDefault(params[7]);
            const extraParams = ['0', params[1], '0', ...params.slice(3, 7), '0', ...params.slice(8)];
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        else {
            hitIncreasePerHit = parseNumberOrDefault(effect['hit increase/hit']);
            extraHitDamage = parseNumberOrDefault(effect['extra hits dmg%']);
            turnDuration = parseNumberOrDefault(effect['hit increase buff turns (50)']);
        }
        const results = [];
        if (hitIncreasePerHit !== 0 || extraHitDamage !== 0) {
            results.push(Object.assign({ id: 'proc:26:hit count boost', originalId,
                sources,
                effectDelay, duration: turnDuration, value: {
                    hitIncreasePerHit,
                    extraHitDamage,
                } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:26:hit count boost'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('27', (effect, context, injectionContext) => {
        const originalId = '27';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'hpDamageLow%': '0',
            'hpDamageHigh%': '0',
            'hpDamageChance%': '0',
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params['hpDamageLow%'], params['hpDamageHigh%'], params['hpDamageChance%'], params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
        }
        else {
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
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:27:proportional attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('28', (effect, context, injectionContext) => {
        const originalId = '28';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        let value = 0;
        let unknownParams;
        if (effect.params) {
            const [rawValue, ...extraParams] = splitEffectParams(effect);
            value = parseNumberOrDefault(rawValue);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            value = parseNumberOrDefault(effect['fixed damage']);
        }
        const results = [];
        if (hits !== 0 || distribution !== 0 || value !== 0) {
            const entry = Object.assign({ id: 'proc:28:fixed attack', originalId,
                sources,
                effectDelay, value: {
                    hits,
                    distribution,
                } }, targetData);
            if (value !== 0) {
                entry.value.value = value;
            }
            results.push(entry);
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('29', (effect, context, injectionContext) => {
        const originalId = '29';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let attackElements = [];
        let unknownParams;
        if (effect.params) {
            let element1, element2, element3;
            let extraParams;
            [element1, element2, element3, params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            [element1, element2, element3].forEach((rawElement) => {
                if (rawElement !== '0') {
                    attackElements.push(ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
                }
                unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
            });
        }
        else {
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
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || attackElements.length > 0 || Object.keys(filteredValue).length > 0) {
            const entry = Object.assign({ id: 'proc:29:multi-element attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }) }, targetData);
            if (attackElements.length > 0) {
                entry.value.elements = attackElements;
            }
            results.push(entry);
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('30', (effect, context, injectionContext) => {
        const originalId = '30';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let elements = [];
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            elements = params
                .slice(0, 6)
                .filter((p) => p !== '0')
                .map((p) => ELEMENT_MAPPING[p] || BuffConditionElement.Unknown);
            turnDuration = parseNumberOrDefault(params[6]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
        }
        else {
            if ('elements added' in effect) {
                if (Array.isArray(effect['elements added'])) {
                    elements = effect['elements added'];
                }
                else {
                    elements = [BuffConditionElement.Unknown];
                }
            }
            turnDuration = parseNumberOrDefault(effect['elements added turns']);
        }
        const results = [];
        const validElements = Object.values(ELEMENT_MAPPING).filter((e) => e !== BuffConditionElement.All);
        if (elements.length > 0) {
            elements.forEach((inputElement) => {
                const sanitizedElement = validElements.includes(inputElement) ? inputElement : BuffConditionElement.Unknown;
                results.push(Object.assign({ id: `proc:30:add element-${sanitizedElement}`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: true }, targetData));
            });
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: validElements.concat([BuffConditionElement.Unknown]).map((e) => `proc:30:add element-${e}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('31', (effect, context, injectionContext) => {
        const originalId = '31';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatFill = 0;
        let percentFill = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
            flatFill = parseNumberOrDefault(rawFlatFill) / 100;
            percentFill = parseNumberOrDefault(rawPercentFill);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            if ('increase bb gauge' in effect) {
                flatFill = parseNumberOrDefault(effect['increase bb gauge']);
            }
            // NOTE: Deathmax's datamine only recognizes one value. We think the second parameter is percent fill
            // due to it being tied to a Tilith skill (a unit who's known for BC filling skillsets)
        }
        const results = [];
        if (flatFill !== 0) {
            results.push(Object.assign({ id: 'proc:31:bc fill-flat', originalId,
                sources,
                effectDelay, value: flatFill }, targetData));
        }
        if (percentFill !== 0) {
            results.push(Object.assign({ id: 'proc:31:bc fill-percent', originalId,
                sources,
                effectDelay, value: percentFill }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('32', (effect, context, injectionContext) => {
        const originalId = '32';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let element;
        let unknownParams;
        if (effect.params) {
            const [rawElement, ...extraParams] = splitEffectParams(effect);
            if (rawElement && rawElement !== '0') {
                element = NON_ZERO_ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
            }
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            const effectElement = effect['set attack element attribute'];
            if (effectElement) {
                const sanitizedElement = Object.values(NON_ZERO_ELEMENT_MAPPING).find((e) => effectElement === e);
                if (sanitizedElement && sanitizedElement !== BuffConditionElement.All) {
                    element = sanitizedElement;
                }
                else {
                    element = BuffConditionElement.Unknown;
                }
            }
        }
        const results = [];
        if (element) {
            results.push(Object.assign({ id: `proc:32:element shift-${element}`, originalId,
                sources,
                effectDelay, value: true }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('33', (effect, context, injectionContext) => {
        const originalId = '33';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let chance = 0;
        let unknownParams;
        if (effect.params) {
            const [rawValue, ...extraParams] = splitEffectParams(effect);
            chance = parseNumberOrDefault(rawValue);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            chance = parseNumberOrDefault(effect['clear buff chance%']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:33:buff wipe', originalId,
                sources,
                effectDelay, value: chance }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('34', (effect, context, injectionContext) => {
        const originalId = '34';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatDrainLow = 0, flatDrainHigh = 0;
        let percentDrainLow = 0, percentDrainHigh = 0;
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
        }
        else {
            flatDrainLow = parseNumberOrDefault(effect['base bb gauge reduction low']);
            flatDrainHigh = parseNumberOrDefault(effect['base bb gauge reduction high']);
            percentDrainLow = parseNumberOrDefault(effect['bb gauge% reduction low']);
            percentDrainHigh = parseNumberOrDefault(effect['bb gauge% reduction high']);
            chance = parseNumberOrDefault(effect['bb gauge reduction chance%']);
        }
        const results = [];
        if (flatDrainLow !== 0 || flatDrainHigh !== 0) {
            results.push(Object.assign({ id: 'proc:34:bc drain-flat', originalId,
                sources,
                effectDelay, value: {
                    drainLow: flatDrainLow,
                    drainHigh: flatDrainHigh,
                    chance,
                } }, targetData));
        }
        if (percentDrainLow !== 0 || percentDrainHigh !== 0) {
            results.push(Object.assign({ id: 'proc:34:bc drain-percent', originalId,
                sources,
                effectDelay, value: {
                    drainLow: percentDrainLow,
                    drainHigh: percentDrainHigh,
                    chance,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
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
            buffId: 'proc:36:ls lock',
            originalId: '36',
        });
    });
    map.set('37', (effect, context, injectionContext) => {
        const originalId = '37';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [summonGroup, summonId = '', rawPositionX, rawPositionY, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const positionX = parseNumberOrDefault(rawPositionX);
        const positionY = parseNumberOrDefault(rawPositionY);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        const results = [];
        if (summonGroup || summonId) {
            results.push(Object.assign({ id: 'proc:37:summon', originalId,
                sources,
                effectDelay, value: {
                    summonGroup,
                    summonId,
                    positionX,
                    positionY,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('38', (effect, context, injectionContext) => {
        const originalId = '38';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const curedAilments = [];
        let unknownParams;
        if (effect.params) {
            const splitParams = splitEffectParams(effect);
            const knownParams = splitParams.slice(0, 9);
            const extraParams = splitParams.slice(9);
            knownParams
                .filter((p) => p !== '0')
                .forEach((param) => {
                curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
        }
        else if (Array.isArray(effect['ailments cured'])) {
            const effectAilmentsCured = effect['ailments cured'];
            Object.values(AILMENT_MAPPING).forEach((ailment) => {
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
        const results = curedAilments.map((ailment) => (Object.assign({ id: `proc:38:cleanse-${ailment}`, originalId,
            sources,
            effectDelay, value: true }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('39', (effect, context, injectionContext) => {
        const originalId = '39';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const elements = [];
        let mitigation = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            const rawElementsMitigated = params.slice(0, 6);
            mitigation = parseNumberOrDefault(params[6]);
            turnDuration = parseNumberOrDefault(params[7]);
            rawElementsMitigated.forEach((rawElement) => {
                if (rawElement !== '0') {
                    elements.push(NON_ZERO_ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
                }
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            Object.values(NON_ZERO_ELEMENT_MAPPING).forEach((element) => {
                if (effect[`mitigate ${element} attacks`]) {
                    elements.push(element);
                }
            });
            mitigation = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks']);
            turnDuration = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks buff turns']);
        }
        const results = [];
        if (elements.length > 0) {
            elements.forEach((element) => {
                results.push(Object.assign({ id: `proc:39:mitigate-${element}`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: mitigation }, targetData));
            });
        }
        else if (mitigation !== 0) {
            results.push(Object.assign({ id: 'proc:39:mitigate-unknown', originalId,
                sources,
                effectDelay, duration: turnDuration, value: mitigation }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:39:mitigate-${e}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('40', (effect, context, injectionContext) => {
        const originalId = '40';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
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
                        chance,
                    });
                }
            }
            turnDuration = parseNumberOrDefault(params[8]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(9), 9, injectionContext);
        }
        else {
            Object.values(AILMENT_MAPPING).forEach((ailment) => {
                let effectKey;
                if (ailment === Ailment.Weak) {
                    effectKey = 'weaken% buff';
                }
                else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
                    effectKey = `${ailment} buff`;
                }
                else {
                    effectKey = `${ailment}% buff`;
                }
                if (effectKey in effect) {
                    inflictedAilments.push({
                        ailment,
                        chance: parseNumberOrDefault(effect[effectKey]),
                    });
                }
            });
            turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = inflictedAilments.map(({ ailment, chance }) => (Object.assign({ id: `proc:40:add ailment-${ailment}`, originalId,
            sources,
            effectDelay, duration: turnDuration, value: chance }, targetData)));
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                duration: turnDuration,
                buffs: Object.values(AILMENT_MAPPING).concat([Ailment.Unknown]).map((a) => `proc:40:add ailment-${a}`),
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('42', (effect, context, injectionContext) => {
        const originalId = '42';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const [rawModLow, rawModHigh, rawFlatAtk, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const params = {
            'atkLow%': rawModLow,
            'atkHigh%': rawModHigh,
            flatAtk: rawFlatAtk,
        };
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        let results;
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results = [
                Object.assign({ id: 'proc:42:sacrificial attack', originalId,
                    sources,
                    effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                        distribution }) }, targetData),
                {
                    id: 'proc:42:instant death',
                    originalId,
                    sources,
                    effectDelay,
                    value: true,
                    targetArea: TargetArea.Single,
                    targetType: TargetType.Self,
                },
            ];
        }
        else {
            results = [];
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('43', (effect, context, injectionContext) => {
        const originalId = '43';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let overdriveFill = 0;
        let unknownParams;
        if (effect.params) {
            const [rawOverdriveFill, ...extraParams] = splitEffectParams(effect);
            overdriveFill = parseNumberOrDefault(rawOverdriveFill);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            overdriveFill = parseNumberOrDefault(effect['increase od gauge%']);
        }
        const results = [];
        if (overdriveFill !== 0) {
            results.push(Object.assign({ id: 'proc:43:burst od fill', originalId,
                sources,
                effectDelay, value: overdriveFill }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('44', (effect, context, injectionContext) => {
        const originalId = '44';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const damageParams = {
            'atk%': '0',
            flatAtk: '0',
            'dmg%': '0',
        };
        let affectsElement = false, unitIndex = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            let extraParams;
            let rawAffectsElement, rawUnitIndex, rawTurnDuration;
            [damageParams['atk%'], damageParams.flatAtk, damageParams['dmg%'], rawAffectsElement, rawUnitIndex, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            affectsElement = rawAffectsElement !== '1'; // NOTE: not sure about this value
            unitIndex = parseNumberOrDefault(rawUnitIndex);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            damageParams['atk%'] = effect['dot atk%'];
            damageParams.flatAtk = effect['dot flat atk'];
            damageParams['dmg%'] = effect['dot dmg%'];
            affectsElement = !!(effect['dot element affected']);
            unitIndex = parseNumberOrDefault(effect['dot unit index']);
            turnDuration = parseNumberOrDefault(effect['dot turns (71)']);
        }
        const filteredDamageParams = Object.entries(damageParams)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (Object.keys(filteredDamageParams).length > 0) {
            results.push(Object.assign({ id: 'proc:44:damage over time', originalId,
                sources,
                effectDelay, duration: turnDuration, value: Object.assign(Object.assign({}, filteredDamageParams), { affectsElement,
                    unitIndex }) }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:44:damage over time'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('45', (effect, context, injectionContext) => {
        const originalId = '45';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let bb = 0, sbb = 0, ubb = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawBb, rawSbb, rawUbb, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            bb = parseNumberOrDefault(rawBb);
            sbb = parseNumberOrDefault(rawSbb);
            ubb = parseNumberOrDefault(rawUbb);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            bb = parseNumberOrDefault(effect['bb atk% buff']);
            sbb = parseNumberOrDefault(effect['sbb atk% buff']);
            ubb = parseNumberOrDefault(effect['ubb atk% buff']);
            turnDuration = parseNumberOrDefault(effect['buff turns (72)']);
        }
        const results = [];
        if (bb !== 0) {
            results.push(Object.assign({ id: 'proc:45:attack boost-bb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: bb }, targetData));
        }
        if (sbb !== 0) {
            results.push(Object.assign({ id: 'proc:45:attack boost-sbb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: sbb }, targetData));
        }
        if (ubb !== 0) {
            results.push(Object.assign({ id: 'proc:45:attack boost-ubb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: ubb }, targetData));
        }
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['bb', 'sbb', 'ubb'].map((type) => `proc:45:attack boost-${type}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('46', (effect, context, injectionContext) => {
        const originalId = '46';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const [rawHpLow, rawHpHigh, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const hpLow = parseNumberOrDefault(rawHpLow);
        const hpHigh = parseNumberOrDefault(rawHpHigh);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (hpLow !== 0 || hpHigh !== 0 || hits !== 0 || distribution !== 0) {
            const entry = Object.assign({ id: 'proc:46:non-lethal proportional attack', originalId,
                sources,
                effectDelay, value: {
                    hits,
                    distribution,
                } }, targetData);
            if (hpLow !== 0 || hpHigh !== 0) {
                entry.value = {
                    'hpDamageLow%': hpLow,
                    'hpDamageHigh%': hpHigh,
                    hits,
                    distribution,
                };
            }
            results.push(entry);
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('47', (effect, context, injectionContext) => {
        const originalId = '47';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'baseAtk%': '0',
            'maxAddedAtk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let proportionalMode = 'unknown';
        let unknownParams;
        if (effect.params) {
            let extraParams;
            let rawMaxAttackValue, rawProportionalMode;
            [params['baseAtk%'], rawMaxAttackValue, rawProportionalMode, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            params['maxAddedAtk%'] = parseNumberOrDefault(rawMaxAttackValue) - parseNumberOrDefault(params['baseAtk%']);
            proportionalMode = rawProportionalMode === '1' ? 'lost' : 'remaining';
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            params['baseAtk%'] = effect['bb base atk%'];
            params['maxAddedAtk%'] = effect['bb added atk% based on hp'];
            proportionalMode = effect['bb added atk% proportional to hp'] || 'unknown';
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:47:hp scaled attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { proportionalMode,
                    hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('48', (effect, context, injectionContext) => {
        const originalId = '48';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const [rawBasePercentHpLow, rawBasePercentHpHigh, rawCurrentPercentHpLow, rawCurrentPercentHpHigh, rawFixedDamage, rawChance, rawIsLethal, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const basePercentHpLow = parseNumberOrDefault(rawBasePercentHpLow);
        const basePercentHpHigh = parseNumberOrDefault(rawBasePercentHpHigh);
        const currentPercentHpLow = parseNumberOrDefault(rawCurrentPercentHpLow);
        const currentPercentHpHigh = parseNumberOrDefault(rawCurrentPercentHpHigh);
        const fixedDamage = parseNumberOrDefault(rawFixedDamage);
        const chance = parseNumberOrDefault(rawChance);
        const isLethal = rawIsLethal === '1';
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        /**
         * Current assumption is that each set of parameters results in a separate attack
         * due to no known skills having more than one of each variant.
         */
        const results = [];
        const createAttackOfType = (type, valueProperties) => (Object.assign({ id: `proc:48:piercing attack-${type}`, originalId,
            sources,
            effectDelay, value: Object.assign(Object.assign({}, valueProperties), { isLethal,
                chance,
                hits,
                distribution }) }, targetData));
        if (basePercentHpLow !== 0 || basePercentHpHigh !== 0) {
            results.push(createAttackOfType('base', {
                'hpDamageLow%': basePercentHpLow,
                'hpDamageHigh%': basePercentHpHigh,
            }));
        }
        if (currentPercentHpLow !== 0 || currentPercentHpHigh !== 0) {
            results.push(createAttackOfType('current', {
                'hpDamageLow%': currentPercentHpLow,
                'hpDamageHigh%': currentPercentHpHigh,
            }));
        }
        if (fixedDamage !== 0) {
            results.push(createAttackOfType('fixed', {
                value: fixedDamage,
            }));
        }
        if (results.length === 0 && (hits !== 0 || distribution !== 0)) {
            results.push(createAttackOfType('unknown', {}));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('49', (effect, context, injectionContext) => {
        const originalId = '49';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawChance, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const chance = parseNumberOrDefault(rawChance);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:49:chance instant death', originalId,
                sources,
                effectDelay, value: chance }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('50', (effect, context, injectionContext) => {
        const originalId = '50';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawDamageLow, rawDamageHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const reflectedDamageLow = parseNumberOrDefault(rawDamageLow);
        const reflectedDamageHigh = parseNumberOrDefault(rawDamageHigh);
        const chance = parseNumberOrDefault(rawChance);
        const turnDuration = parseNumberOrDefault(rawTurnDuration);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        const hasAnyRangeValues = reflectedDamageLow !== 0 || reflectedDamageHigh !== 0;
        const results = [];
        if (hasAnyRangeValues) {
            results.push(Object.assign({ id: 'proc:50:chance damage reflect', originalId,
                sources,
                effectDelay, duration: turnDuration, value: {
                    'reflectedDamageLow%': reflectedDamageLow,
                    'reflectedDamageHigh%': reflectedDamageHigh,
                    chance,
                } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:50:chance damage reflect'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('51', (effect, context, injectionContext) => {
        const originalId = '51';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const inflictedReductions = [];
        let debuffTurnDuration = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            [
                { type: Ailment.AttackReduction, reductionValue: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[3]) },
                { type: Ailment.DefenseReduction, reductionValue: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[4]) },
                { type: Ailment.RecoveryReduction, reductionValue: parseNumberOrDefault(params[2]), chance: parseNumberOrDefault(params[5]) },
            ].forEach(({ type, reductionValue, chance }) => {
                if (reductionValue !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, reductionValue, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(params[6]);
            turnDuration = parseNumberOrDefault(params[7]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            [
                { type: Ailment.AttackReduction, reductionValueKey: 'inflict atk% debuff (2)', chanceKey: 'inflict atk% debuff chance% (74)' },
                { type: Ailment.DefenseReduction, reductionValueKey: 'inflict def% debuff (4)', chanceKey: 'inflict def% debuff chance% (75)' },
                { type: Ailment.RecoveryReduction, reductionValueKey: 'inflict rec% debuff (6)', chanceKey: 'inflict rec% debuff chance% (76)' },
            ].forEach(({ type, reductionValueKey, chanceKey }) => {
                const reductionValue = parseNumberOrDefault(effect[reductionValueKey]);
                const chance = parseNumberOrDefault(effect[chanceKey]);
                if (reductionValue !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, reductionValue, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(effect['stat% debuff turns']);
            turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = inflictedReductions.map(({ type, reductionValue, chance }) => (Object.assign({ id: `proc:51:add to attack-${type}`, originalId,
            sources,
            effectDelay, duration: turnDuration, value: {
                reductionValue,
                chance,
                debuffTurnDuration,
            } }, targetData)));
        if (results.length === 0 && (isTurnDurationBuff(context, turnDuration, injectionContext) || isTurnDurationBuff(context, debuffTurnDuration, injectionContext))) {
            // manually create turn duration buff to account for debuff turn duration
            results.push(Object.assign({ id: BuffId.TURN_DURATION_MODIFICATION, originalId,
                sources, value: {
                    buffs: [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction].map((a) => `proc:51:add to attack-${a}`),
                    duration: turnDuration,
                    debuffTurnDuration: debuffTurnDuration,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('52', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'bb gauge fill rate% buff',
            effectTurnDurationKey: 'buff turns (77)',
            buffId: 'proc:52:bc efficacy',
            originalId: '52',
        });
    });
    map.set('53', (effect, context, injectionContext) => {
        const originalId = '53';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
        const inflictionChances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
        };
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            let rawDuration, extraParams;
            [inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, rawDuration, ...extraParams] = splitEffectParams(effect);
            turnDuration = parseNumberOrDefault(rawDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('counter inflict'));
            AILMENTS_ORDER.forEach((ailment) => {
                const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
                if (correspondingKey) {
                    inflictionChances[ailment] = effect[correspondingKey];
                }
            });
            turnDuration = parseNumberOrDefault(effect['counter inflict ailment turns']);
        }
        const results = [];
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(inflictionChances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `proc:53:inflict on hit-${ailment}`, originalId,
                    sources,
                    effectDelay,
                    value, duration: turnDuration, conditions: { whenAttacked: true } }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: AILMENTS_ORDER.map((a) => `proc:53:inflict on hit-${a}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('54', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'crit multiplier%',
            effectTurnDurationKey: 'buff turns (84)',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) * 100,
            buffId: 'proc:54:critical damage boost',
            originalId: '54',
        });
    });
    map.set('55', (effect, context, injectionContext) => {
        const originalId = '55';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let elements;
        let damageBoost = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => NON_ZERO_ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            damageBoost = parseNumberOrDefault(params[6]) * 100;
            turnDuration = parseNumberOrDefault(params[7]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            elements = Object.values(NON_ZERO_ELEMENT_MAPPING).filter((element) => !!effect[`${element} units do extra elemental weakness dmg`]);
            damageBoost = parseNumberOrDefault(effect['elemental weakness multiplier%']);
            turnDuration = parseNumberOrDefault(effect['elemental weakness buff turns']);
        }
        let results = [];
        if (damageBoost !== 0) {
            results = elements.map((element) => (Object.assign({ id: `proc:55:elemental weakness damage-${element}`, originalId,
                sources,
                effectDelay, duration: turnDuration, value: damageBoost }, targetData)));
            if (results.length === 0) {
                results.push(Object.assign({ id: 'proc:55:elemental weakness damage-unknown', originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: damageBoost }, targetData));
            }
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:55:elemental weakness damage-${e}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('56', (effect, context, injectionContext) => {
        const originalId = '56';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let chance = 0, recoveredHpPercent = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawChance, rawRecoverHp, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            chance = parseNumberOrDefault(rawChance);
            recoveredHpPercent = parseNumberOrDefault(rawRecoverHp);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            chance = parseNumberOrDefault(effect['angel idol recover chance%']);
            recoveredHpPercent = parseNumberOrDefault(effect['angel idol recover hp%']);
            turnDuration = parseNumberOrDefault(effect['angel idol buff turns (91)']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:56:chance ko resistance', originalId,
                sources,
                effectDelay, duration: turnDuration, value: { 'recoveredHp%': recoveredHpPercent, chance } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:56:chance ko resistance'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('57', (effect, context, injectionContext) => {
        const originalId = '57';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let bcBaseResist = 0, bcBuffResist = 0;
        let hcBaseResist = 0, hcBuffResist = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawBcBaseResist, rawBcBuffResist, rawHcBaseResist, rawHcBuffResist, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            bcBaseResist = parseNumberOrDefault(rawBcBaseResist);
            bcBuffResist = parseNumberOrDefault(rawBcBuffResist);
            hcBaseResist = parseNumberOrDefault(rawHcBaseResist);
            hcBuffResist = parseNumberOrDefault(rawHcBuffResist);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            // Deathmax's datamine doesn't parse HC drop resistance
            bcBaseResist = parseNumberOrDefault(effect['base bc drop% resist buff']);
            bcBuffResist = parseNumberOrDefault(effect['buffed bc drop% resist buff']);
            turnDuration = parseNumberOrDefault(effect['bc drop% resist buff turns (92)']);
        }
        const results = [];
        if (bcBaseResist !== 0) {
            results.push(Object.assign({ id: 'proc:57:bc drop resistance-base', originalId,
                sources,
                effectDelay, duration: turnDuration, value: bcBaseResist }, targetData));
        }
        if (bcBuffResist !== 0) {
            results.push(Object.assign({ id: 'proc:57:bc drop resistance-buff', originalId,
                sources,
                effectDelay, duration: turnDuration, value: bcBuffResist }, targetData));
        }
        if (hcBaseResist !== 0) {
            results.push(Object.assign({ id: 'proc:57:hc drop resistance-base', originalId,
                sources,
                effectDelay, duration: turnDuration, value: hcBaseResist }, targetData));
        }
        if (hcBuffResist !== 0) {
            results.push(Object.assign({ id: 'proc:57:hc drop resistance-buff', originalId,
                sources,
                effectDelay, duration: turnDuration, value: hcBuffResist }, targetData));
        }
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: [
                    'proc:57:bc drop resistance-base',
                    'proc:57:bc drop resistance-buff',
                    'proc:57:hc drop resistance-base',
                    'proc:57:hc drop resistance-buff',
                ],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('58', (effect, context, injectionContext) => {
        const originalId = '58';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let damageIncrease = 0, chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            damageIncrease = parseNumberOrDefault(rawDamageIncrease);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            damageIncrease = parseNumberOrDefault(effect['spark dmg% received']);
            chance = parseNumberOrDefault(effect['spark dmg received apply%']);
            turnDuration = parseNumberOrDefault(effect['spark dmg received debuff turns (94)']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:58:spark vulnerability', originalId,
                sources,
                effectDelay, duration: turnDuration, value: { 'sparkDamage%': damageIncrease, chance } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:58:spark vulnerability'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('59', (effect, context, injectionContext) => {
        const originalId = '59';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawBb, rawSbb, rawUbb, rawTurnDuration, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const bb = parseNumberOrDefault(rawBb);
        const sbb = parseNumberOrDefault(rawSbb);
        const ubb = parseNumberOrDefault(rawUbb);
        const turnDuration = parseNumberOrDefault(rawTurnDuration);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        const results = [];
        if (bb !== 0) {
            results.push(Object.assign({ id: 'proc:59:attack reduction-bb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: bb }, targetData));
        }
        if (sbb !== 0) {
            results.push(Object.assign({ id: 'proc:59:attack reduction-sbb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: sbb }, targetData));
        }
        if (ubb !== 0) {
            results.push(Object.assign({ id: 'proc:59:attack reduction-ubb', originalId,
                sources,
                effectDelay, duration: turnDuration, value: ubb }, targetData));
        }
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['bb', 'sbb', 'ubb'].map((type) => `proc:59:attack reduction-${type}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('61', (effect, context, injectionContext) => {
        const originalId = '61';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'baseAtk%': '0',
            'maxAddedAtk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            let rawMaxAttackValue;
            [params['baseAtk%'], rawMaxAttackValue, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            params['maxAddedAtk%'] = parseNumberOrDefault(rawMaxAttackValue);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            params['baseAtk%'] = effect['bb base atk%'];
            params['maxAddedAtk%'] = effect['bb max atk% based on ally bb gauge and clear bb gauges'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        let results;
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results = [
                Object.assign({ id: 'proc:61:party bb gauge-scaled attack', originalId,
                    sources,
                    effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                        distribution }) }, targetData),
                {
                    id: 'proc:61:party bc drain',
                    originalId,
                    sources,
                    effectDelay,
                    value: true,
                    targetArea: TargetArea.Aoe,
                    targetType: TargetType.Party,
                },
            ];
        }
        else {
            results = [];
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('62', (effect, context, injectionContext) => {
        const originalId = '62';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let element;
        let hp = 0, defense = 0, damageAbsorption = 0;
        let unknownParams;
        if (effect.params) {
            const [rawElement, rawHp, rawDefense, rawDamageAbsorption, ...extraParams] = splitEffectParams(effect);
            element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
            hp = parseNumberOrDefault(rawHp);
            defense = parseNumberOrDefault(rawDefense);
            damageAbsorption = parseNumberOrDefault(rawDamageAbsorption);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            const effectElement = effect['elemental barrier element'];
            element = (effectElement && Object.values(ELEMENT_MAPPING).find((e) => e === effectElement)) || BuffConditionElement.Unknown;
            hp = parseNumberOrDefault(effect['elemental barrier hp']);
            defense = parseNumberOrDefault(effect['elemental barrier def']);
            damageAbsorption = parseNumberOrDefault(effect['elemental barrier absorb dmg%']);
        }
        const results = [];
        if (hp !== 0 || defense !== 0 || damageAbsorption !== 0) {
            results.push(Object.assign({ id: `proc:62:barrier-${element}`, originalId,
                sources,
                effectDelay, value: {
                    hp,
                    defense,
                    'damageAbsorption%': damageAbsorption,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('64', (effect, context, injectionContext) => {
        const originalId = '64';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            'addedAtkPerUse%': '0',
            maxIncreases: '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params['atk%'], params['addedAtkPerUse%'], params.maxIncreases, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            params['atk%'] = effect['bb atk%'];
            params['addedAtkPerUse%'] = effect['bb atk% inc per use'];
            params.maxIncreases = effect['bb atk% max number of inc'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:64:consecutive usage attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('65', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'atk% buff when enemy has ailment',
            effectTurnDurationKey: 'atk% buff turns (110)',
            buffId: 'proc:65:ailment attack boost',
            originalId: '65',
        });
    });
    map.set('66', (effect, context, injectionContext) => {
        const originalId = '66';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let recoveredHp = 0, chance = 0;
        let unknownParams;
        if (effect.params) {
            const [rawRecoveredHp, rawChance, ...extraParams] = splitEffectParams(effect);
            recoveredHp = parseNumberOrDefault(rawRecoveredHp);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            recoveredHp = parseNumberOrDefault(effect['revive unit hp%']);
            chance = parseNumberOrDefault(effect['revive unit chance%']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:66:chance revive', originalId,
                sources,
                effectDelay, value: { 'reviveToHp%': recoveredHp, chance } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('67', (effect, context, injectionContext) => {
        return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
            effect,
            context,
            injectionContext,
            originalId: '67',
            buffId: 'proc:67:bc fill on spark',
            effectKeyLow: 'bc fill on spark low',
            effectKeyHigh: 'bc fill on spark high',
            effectKeyChance: 'bc fill on spark%',
            effectTurnDurationKey: 'bc fill on spark buff turns (111)',
            buffKeyLow: 'fillLow',
            buffKeyHigh: 'fillHigh',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
        });
    });
    map.set('68', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'guard increase mitigation%',
            effectTurnDurationKey: 'guard increase mitigation buff turns (113)',
            buffId: 'proc:68:guard mitigation',
            originalId: '68',
        });
    });
    map.set('69', (effect, context, injectionContext) => {
        const originalId = '69';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatFill = 0;
        let percentFill = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlatFill, rawPercentFill, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            flatFill = parseNumberOrDefault(rawFlatFill) / 100;
            percentFill = parseNumberOrDefault(rawPercentFill);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            if ('bb bc fill on guard' in effect) {
                flatFill = parseNumberOrDefault(effect['bb bc fill on guard']);
            }
            if ('bb bc fill% on guard' in effect) {
                percentFill = parseNumberOrDefault(effect['bb bc fill% on guard']);
            }
            turnDuration = parseNumberOrDefault(effect['bb bc fill on guard buff turns (114)']);
        }
        const results = [];
        if (flatFill !== 0) {
            results.push(Object.assign({ id: 'proc:69:bc fill on guard-flat', originalId,
                sources,
                effectDelay, duration: turnDuration, value: flatFill, conditions: {
                    onGuard: true,
                } }, targetData));
        }
        if (percentFill !== 0) {
            results.push(Object.assign({ id: 'proc:69:bc fill on guard-percent', originalId,
                sources,
                effectDelay, duration: turnDuration, value: percentFill, conditions: {
                    onGuard: true,
                } }, targetData));
        }
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:69:bc fill on guard-flat', 'proc:69:bc fill on guard-percent'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('71', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'bb fill inc%',
            effectTurnDurationKey: 'bb fill inc buff turns (112)',
            buffId: 'proc:71:bc efficacy reduction',
            originalId: '71',
        });
    });
    map.set('73', (effect, context, injectionContext) => {
        const originalId = '73';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const AILMENTS_ORDER = [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
        const resistances = {
            [Ailment.AttackReduction]: '0',
            [Ailment.DefenseReduction]: '0',
            [Ailment.RecoveryReduction]: '0',
        };
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            let rawDuration, extraParams;
            [resistances[Ailment.AttackReduction], resistances[Ailment.DefenseReduction], resistances[Ailment.RecoveryReduction], rawDuration, ...extraParams] = splitEffectParams(effect);
            turnDuration = parseNumberOrDefault(rawDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.includes('resist%'));
            AILMENTS_ORDER.forEach((ailment) => {
                const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
                if (correspondingKey) {
                    resistances[ailment] = effect[correspondingKey];
                }
            });
            turnDuration = parseNumberOrDefault(effect['stat down immunity buff turns']);
        }
        const results = [];
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(resistances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `proc:73:resist-${ailment}`, originalId,
                    sources,
                    effectDelay,
                    value, duration: turnDuration }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: AILMENTS_ORDER.map((a) => `proc:73:resist-${a}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('75', (effect, context, injectionContext) => {
        const originalId = '75';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'baseAtk%': '0',
            'addedAttackPerUnitWithMatchingElement%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        let element;
        let unknownParams;
        if (effect.params) {
            let extraParams, rawElement;
            [rawElement, params['baseAtk%'], params['addedAttackPerUnitWithMatchingElement%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            // in Deathmax's datamine, this proc is incorrectly parsed as a tri-stat buff
            const effectElement = effect['counted element for buff multiplier'];
            if (!effectElement) {
                element = BuffConditionElement.Unknown;
            }
            else {
                element = effectElement;
            }
            params['baseAtk%'] = effect['atk% buff (1)'];
            params['addedAttackPerUnitWithMatchingElement%'] = effect['def% buff (3)'];
            params.flatAtk = effect['rec% buff (5)'];
            params['crit%'] = effect['crit% buff (7)'];
            params['bc%'] = effect['buff turns'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:75:element squad-scaled attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { elementToMatch: element, hits,
                    distribution }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('76', (effect, context, injectionContext) => {
        const originalId = '76';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let maxExtraActions = 0, chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawMaxExtraActions, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            maxExtraActions = parseNumberOrDefault(rawMaxExtraActions);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            maxExtraActions = parseNumberOrDefault(effect['max number of extra actions']);
            chance = parseNumberOrDefault(effect['chance% for extra action']);
            turnDuration = parseNumberOrDefault(effect['extra action buff turns (123)']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:76:extra action', originalId,
                sources,
                effectDelay, duration: turnDuration, value: { maxExtraActions, chance } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:76:extra action'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('78', (effect, context, injectionContext) => {
        const originalId = '78';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            turnDuration: '0',
        };
        const coreStatProperties = ['atk', 'def', 'rec', 'crit'];
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            coreStatProperties.forEach((statType) => {
                const effectKey = `self ${statType}% buff`;
                if (effectKey in effect) {
                    params[statType] = effect[effectKey];
                }
            });
            params.turnDuration = effect['self stat buff turns'];
        }
        // ensure numerical properties are actually numbers
        coreStatProperties.concat(['turnDuration']).forEach((prop) => {
            params[prop] = parseNumberOrDefault(params[prop]);
        });
        const hasAnyStats = coreStatProperties.some((statKey) => params[statKey] !== 0);
        const results = [];
        if (hasAnyStats) {
            coreStatProperties.forEach((statKey) => {
                const value = params[statKey];
                if (value !== 0) {
                    results.push(Object.assign({ id: `proc:78:self stat boost-${statKey}`, originalId,
                        sources,
                        effectDelay, duration: params.turnDuration, value }, targetData));
                }
            });
        }
        else if (isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: coreStatProperties.map((statKey) => `proc:78:self stat boost-${statKey}`),
                duration: params.turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('79', (effect, context, injectionContext) => {
        const originalId = '79';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawExpBoost, rawDurationInMinutes = '', ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const expBoost = parseNumberOrDefault(rawExpBoost);
        const durationInMinutes = parseNumberOrDefault(rawDurationInMinutes);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (expBoost !== 0) {
            results.push(Object.assign({ id: 'proc:79:player exp boost', originalId,
                sources,
                effectDelay, value: { 'expBoost%': expBoost, durationInMinutes } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('82', (effect, context, injectionContext) => {
        const originalId = '82';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [summonGroup, rawPercentHp, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
        const percentHp = parseNumberOrDefault(rawPercentHp);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (summonGroup) {
            results.push(Object.assign({ id: 'proc:82:resummon', originalId,
                sources,
                effectDelay, value: {
                    summonGroup,
                    'startingHp%': percentHp,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('83', (effect, context, injectionContext) => {
        const originalId = '83';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let chance = 0, sparkDamage = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawChance, rawSparkDamage, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            chance = parseNumberOrDefault(rawChance);
            sparkDamage = parseNumberOrDefault(rawSparkDamage);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            chance = parseNumberOrDefault(effect['spark dmg inc chance%']);
            sparkDamage = parseNumberOrDefault(effect['spark dmg inc% buff']);
            turnDuration = parseNumberOrDefault(effect['spark dmg inc buff turns (131)']);
        }
        const results = [];
        if (sparkDamage !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'proc:83:spark critical', originalId,
                sources,
                effectDelay, duration: turnDuration, value: { 'sparkDamage%': sparkDamage, chance } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:83:spark critical'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('84', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            effectValueKey: 'od fill rate% buff',
            effectTurnDurationKey: 'od fill rate buff turns (132)',
            buffId: 'proc:84:od fill rate',
            originalId: '84',
        });
    });
    map.set('85', (effect, context, injectionContext) => {
        return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
            effect,
            context,
            injectionContext,
            originalId: '85',
            buffId: 'proc:85:heal on hit',
            effectKeyLow: 'hp recover from dmg% low',
            effectKeyHigh: 'hp recover from dmg% high',
            effectKeyChance: 'hp recover from dmg chance',
            effectTurnDurationKey: 'hp recover from dmg buff turns (133)',
            buffKeyLow: 'healLow',
            buffKeyHigh: 'healHigh',
            generateConditions: () => ({ whenAttacked: true }),
        });
    });
    map.set('86', (effect, context, injectionContext) => {
        return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
            effect,
            context,
            injectionContext,
            originalId: '86',
            buffId: 'proc:86:hp absorb',
            effectKeyLow: 'hp drain% low',
            effectKeyHigh: 'hp drain% high',
            effectKeyChance: 'hp drain chance%',
            effectTurnDurationKey: 'hp drain buff turns (134)',
            buffKeyLow: 'drainHealLow%',
            buffKeyHigh: 'drainHealHigh%',
        });
    });
    map.set('87', (effect, context, injectionContext) => {
        return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
            effect,
            context,
            injectionContext,
            originalId: '87',
            buffId: 'proc:87:heal on spark',
            effectKeyLow: 'spark recover hp low',
            effectKeyHigh: 'spark recover hp high',
            effectKeyChance: 'spark recover hp chance%',
            effectTurnDurationKey: 'spark recover hp buff turns (135)',
            buffKeyLow: 'healLow',
            buffKeyHigh: 'healHigh',
        });
    });
    map.set('88', (effect, context, injectionContext) => {
        const originalId = '88';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let value = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            value = parseNumberOrDefault(params[0]);
            turnDuration = parseNumberOrDefault(params[6]);
            const extraParams = ['0', ...params.slice(1, 6), '0', ...params.slice(7)];
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        else {
            value = parseNumberOrDefault(effect['spark dmg inc%']);
            turnDuration = parseNumberOrDefault(effect['spark dmg inc% turns (136)']);
        }
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'proc:88:self spark damage', originalId,
                sources,
                effectDelay, duration: turnDuration, value }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:88:self spark damage'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('89', (effect, context, injectionContext) => {
        const originalId = '89';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const coreStatProperties = ['atk', 'def', 'rec'];
        const coreStatPropertyMapping = {
            1: 'atk',
            2: 'def',
            3: 'rec',
            4: 'hp',
        };
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
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
        }
        const results = [];
        coreStatProperties.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `proc:89:self converted-${stat}`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: {
                        convertedStat,
                        value,
                    } }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: coreStatProperties.map((statKey) => `proc:89:self converted-${statKey}`),
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('92', (effect, context, injectionContext) => {
        const originalId = '92';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatHpBoost = 0;
        let percentHpBoost = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlatBoost, rawPercentBoost, ...extraParams] = splitEffectParams(effect);
            flatHpBoost = parseNumberOrDefault(rawFlatBoost);
            percentHpBoost = parseNumberOrDefault(rawPercentBoost);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        const results = [];
        if (flatHpBoost !== 0) {
            results.push(Object.assign({ id: 'proc:92:self max hp boost-flat', originalId,
                sources,
                effectDelay, value: flatHpBoost }, targetData));
        }
        if (percentHpBoost !== 0) {
            results.push(Object.assign({ id: 'proc:92:self max hp boost-percent', originalId,
                sources,
                effectDelay, value: percentHpBoost }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('93', (effect, context, injectionContext) => {
        const originalId = '93';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let ResistType;
        (function (ResistType) {
            ResistType["CriticalDamage"] = "critical damage";
            ResistType["ElementDamage"] = "element damage";
            ResistType["SparkDamage"] = "spark damage";
        })(ResistType || (ResistType = {}));
        const resistances = [];
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawBaseCritDamageResist, rawBuffCritDamageResist, rawBaseElementDamageResist, rawBuffElementDamageResist, rawBaseSparkDamageResist, rawBuffSparkDamageResist, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            [
                { resistType: ResistType.CriticalDamage, base: parseNumberOrDefault(rawBaseCritDamageResist), buff: parseNumberOrDefault(rawBuffCritDamageResist) },
                { resistType: ResistType.ElementDamage, base: parseNumberOrDefault(rawBaseElementDamageResist), buff: parseNumberOrDefault(rawBuffElementDamageResist) },
                { resistType: ResistType.SparkDamage, base: parseNumberOrDefault(rawBaseSparkDamageResist), buff: parseNumberOrDefault(rawBuffSparkDamageResist) },
            ].forEach(({ resistType, base, buff }) => {
                if (base !== 0 || buff !== 0) {
                    resistances.push({ resistType, base, buff });
                }
            });
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            [
                { resistType: ResistType.CriticalDamage, baseKey: 'crit dmg base damage resist% (143)', buffKey: 'crit dmg buffed damage resist% (143)' },
                { resistType: ResistType.ElementDamage, baseKey: 'strong base element damage resist% (144)', buffKey: 'strong buffed element damage resist% (144)' },
                { resistType: ResistType.SparkDamage, baseKey: 'spark dmg base resist% (145)', buffKey: 'spark dmg buffed resist% (145)' },
            ].forEach(({ resistType, baseKey, buffKey }) => {
                const base = parseNumberOrDefault(effect[baseKey]);
                const buff = parseNumberOrDefault(effect[buffKey]);
                if (base !== 0 || buff !== 0) {
                    resistances.push({ resistType, base, buff });
                }
            });
            turnDuration = parseNumberOrDefault(effect['dmg resist turns']);
        }
        const results = [];
        resistances.forEach(({ resistType, base, buff }) => {
            if (base !== 0) {
                results.push(Object.assign({ id: `proc:93:${resistType} resistance-base`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: base }, targetData));
            }
            if (buff !== 0) {
                results.push(Object.assign({ id: `proc:93:${resistType} resistance-buff`, originalId,
                    sources,
                    effectDelay, duration: turnDuration, value: buff }, targetData));
            }
        });
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            const buffs = [];
            [ResistType.CriticalDamage, ResistType.ElementDamage, ResistType.SparkDamage].forEach((resistType) => {
                buffs.push(`proc:93:${resistType} resistance-base`, `proc:93:${resistType} resistance-buff`);
            });
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs,
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('94', (effect, context, injectionContext) => {
        const originalId = '94';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let damageIncrease = 0, chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            damageIncrease = parseNumberOrDefault(rawDamageIncrease);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            damageIncrease = parseNumberOrDefault(effect['aoe atk inc%']);
            chance = parseNumberOrDefault(effect['chance to aoe']);
            turnDuration = parseNumberOrDefault(effect['aoe atk turns (142)']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'proc:94:aoe normal attack', originalId,
                sources,
                effectDelay, duration: turnDuration, value: { 'damageModifier%': damageIncrease, chance } }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:94:aoe normal attack'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('95', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            buffId: 'proc:95:sphere lock',
            originalId: '95',
        });
    });
    map.set('96', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            buffId: 'proc:96:es lock',
            originalId: '96',
        });
    });
    map.set('97', (effect, context, injectionContext) => {
        const originalId = '97';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        /**
         * @desc Mapping of a given element to the element that is weak to it. For example, given a key of
         * `fire`, the corresponding value is `earth` because `earth` units are weak to (i.e. take extra
         * damage from) `fire` attacks.
         */
        const weakerElementMapping = {
            [UnitElement.Fire]: UnitElement.Earth,
            [UnitElement.Water]: UnitElement.Fire,
            [UnitElement.Earth]: UnitElement.Thunder,
            [UnitElement.Thunder]: UnitElement.Water,
            [UnitElement.Light]: UnitElement.Dark,
            [UnitElement.Dark]: UnitElement.Light,
        };
        const getOpposingWeakerElement = (inputElement) => {
            return (inputElement && Object.hasOwnProperty.call(weakerElementMapping, inputElement))
                ? weakerElementMapping[inputElement]
                : BuffConditionElement.Unknown;
        };
        const { hits, distribution } = getAttackInformationFromContext(context);
        const params = {
            'atk%': '0',
            flatAtk: '0',
            'crit%': '0',
            'bc%': '0',
            'hc%': '0',
            'dmg%': '0',
        };
        const targetElements = [getOpposingWeakerElement(context.sourceElement)];
        let unknownParams;
        if (effect.params) {
            let extraParams, rawTargetElementsParam;
            [rawTargetElementsParam, params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
            if (rawTargetElementsParam && rawTargetElementsParam !== '0') {
                targetElements.push(getOpposingWeakerElement(ELEMENT_MAPPING[rawTargetElementsParam]));
            }
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            // in Deathmax's datamine, this proc is incorrectly parsed as a tri-stat buff
            const extraTargetElement = effect['additional element used for attack check'];
            if (extraTargetElement && extraTargetElement !== 'self only') {
                targetElements.push(getOpposingWeakerElement(extraTargetElement));
            }
            else if (!extraTargetElement) {
                targetElements.push(BuffConditionElement.Unknown);
            }
            params['atk%'] = effect['bb atk%'];
            params.flatAtk = effect['bb flat atk'];
            params['crit%'] = effect['bb crit%'];
            params['bc%'] = effect['bb bc%'];
            params['hc%'] = effect['bb hc%'];
            params['dmg%'] = effect['bb dmg%'];
        }
        const filteredValue = Object.entries(params)
            .filter(([, value]) => value && +value)
            .reduce((acc, [key, value]) => {
            acc[key] = parseNumberOrDefault(value);
            return acc;
        }, {});
        const results = [];
        if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
            results.push(Object.assign({ id: 'proc:97:element specific attack', originalId,
                sources,
                effectDelay, value: Object.assign(Object.assign({}, filteredValue), { hits,
                    distribution }), conditions: { targetElements } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('113', (effect, context, injectionContext) => {
        const originalId = '113';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let value = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            value = parseNumberOrDefault(params[2]);
            turnDuration = parseNumberOrDefault(params[3]);
            unknownParams = createUnknownParamsEntryFromExtraParams([params[0], params[1], '0', '0'].concat(params.slice(4)), 0, injectionContext);
        }
        else {
            value = parseNumberOrDefault(effect['od fill']);
            turnDuration = parseNumberOrDefault(effect['od fill turns (148)']);
        }
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'proc:113:gradual od fill', originalId,
                sources,
                effectDelay, duration: turnDuration, value }, targetData));
        }
        else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:113:gradual od fill'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('119', (effect, context, injectionContext) => {
        const originalId = '119';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let flatDrain = 0, percentDrain = 0;
        let chance = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawFlat, rawPercent, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            flatDrain = parseNumberOrDefault(rawFlat) / 100;
            percentDrain = parseNumberOrDefault(rawPercent);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        const results = [];
        if (flatDrain !== 0) {
            results.push(Object.assign({ id: 'proc:119:gradual bc drain-flat', originalId,
                sources,
                effectDelay, duration: turnDuration, value: {
                    drain: flatDrain,
                    chance,
                } }, targetData));
        }
        if (percentDrain !== 0) {
            results.push(Object.assign({ id: 'proc:119:gradual bc drain-percent', originalId,
                sources,
                effectDelay, duration: turnDuration, value: {
                    'drain%': percentDrain,
                    chance,
                } }, targetData));
        }
        if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
            results.push(createTurnDurationEntry({
                originalId,
                sources,
                buffs: ['proc:119:gradual bc drain-flat', 'proc:119:gradual bc drain-percent'],
                duration: turnDuration,
                targetData,
            }));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('123', (effect, context, injectionContext) => {
        const originalId = '123';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let drainPercent = 0, chance = 0;
        let unknownParams;
        if (effect.params) {
            const [rawChance, unknownSecondParam, rawDrainPercent, ...extraParams] = splitEffectParams(effect);
            drainPercent = parseNumberOrDefault(rawDrainPercent);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams([unknownSecondParam, '0'].concat(extraParams), 1, injectionContext);
        }
        const results = [];
        if (chance !== 0 || drainPercent !== 0) {
            results.push(Object.assign({ id: 'proc:123:od gauge drain', originalId,
                sources,
                effectDelay, value: { 'drain%': drainPercent, chance } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('126', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            buffId: 'proc:126:damage over time reduction',
            originalId: '126',
        });
    });
    map.set('127', (effect, context, injectionContext) => {
        const originalId = '127';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        const results = [Object.assign({ id: 'proc:127:lock on', originalId,
                sources,
                effectDelay, duration: turnDuration, value: true }, targetData)];
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('130', (effect, context, injectionContext) => {
        const originalId = '130';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const inflictedReductions = [];
        let debuffTurnDuration = 0, turnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            [
                { type: Ailment.AttackReduction, reductionValue: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[3]) },
                { type: Ailment.DefenseReduction, reductionValue: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[4]) },
                { type: Ailment.RecoveryReduction, reductionValue: parseNumberOrDefault(params[2]), chance: parseNumberOrDefault(params[5]) },
            ].forEach(({ type, reductionValue, chance }) => {
                if (reductionValue !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, reductionValue, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(params[6]);
            turnDuration = parseNumberOrDefault(params[7]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            [
                { type: Ailment.AttackReduction, reductionValueKey: 'atk% buff (153)', chanceKey: 'atk buff chance%' },
                { type: Ailment.DefenseReduction, reductionValueKey: 'def% buff (154)', chanceKey: 'def buff chance%' },
                { type: Ailment.RecoveryReduction, reductionValueKey: 'rec% buff (155)', chanceKey: 'rec buff chance%' },
            ].forEach(({ type, reductionValueKey, chanceKey }) => {
                const reductionValue = parseNumberOrDefault(effect[reductionValueKey]);
                const chance = parseNumberOrDefault(effect[chanceKey]);
                if (reductionValue !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, reductionValue, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(effect['debuff turns']);
            turnDuration = parseNumberOrDefault(effect['buff turns']);
        }
        const results = inflictedReductions.map(({ type, reductionValue, chance }) => (Object.assign({ id: `proc:130:inflict on hit-${type}`, originalId,
            sources,
            effectDelay, duration: turnDuration, value: {
                reductionValue,
                chance,
                debuffTurnDuration,
            } }, targetData)));
        if (results.length === 0 && (isTurnDurationBuff(context, turnDuration, injectionContext) || isTurnDurationBuff(context, debuffTurnDuration, injectionContext))) {
            // manually create turn duration buff to account for debuff turn duration
            results.push(Object.assign({ id: BuffId.TURN_DURATION_MODIFICATION, originalId,
                sources, value: {
                    buffs: [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction].map((a) => `proc:130:inflict on hit-${a}`),
                    duration: turnDuration,
                    debuffTurnDuration: debuffTurnDuration,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('131', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            buffId: 'proc:131:spark damage mitigation',
            originalId: '131',
        });
    });
    map.set('132', (effect, context, injectionContext) => {
        const originalId = '132';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let VulnerabilityType;
        (function (VulnerabilityType) {
            VulnerabilityType["Critical"] = "critical";
            VulnerabilityType["Elemental"] = "elemental";
        })(VulnerabilityType || (VulnerabilityType = {}));
        const inflictedReductions = [];
        let debuffTurnDuration = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            [
                { type: VulnerabilityType.Critical, value: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[2]) },
                { type: VulnerabilityType.Elemental, value: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[3]) },
            ].forEach(({ type, value, chance }) => {
                if (value !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, value, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(params[4]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(5), 5, injectionContext);
        }
        else {
            [
                { type: VulnerabilityType.Critical, valueKey: 'crit vuln dmg% (157)', chanceKey: 'crit vuln chance%' },
                { type: VulnerabilityType.Elemental, valueKey: 'elemental vuln dmg% (158)', chanceKey: 'elemental vuln chance%' },
            ].forEach(({ type, valueKey, chanceKey }) => {
                const value = parseNumberOrDefault(effect[valueKey]);
                const chance = parseNumberOrDefault(effect[chanceKey]);
                if (value !== 0 || chance !== 0) {
                    inflictedReductions.push({ type, value, chance });
                }
            });
            debuffTurnDuration = parseNumberOrDefault(effect['vuln turns']);
        }
        const results = inflictedReductions.map(({ type, value, chance }) => (Object.assign({ id: `proc:132:chance inflict vulnerability-${type}`, originalId,
            sources,
            effectDelay, duration: debuffTurnDuration, value: {
                'increased dmg%': value,
                chance,
            } }, targetData)));
        if (results.length === 0 && isTurnDurationBuff(context, debuffTurnDuration, injectionContext)) {
            // manually create turn duration buff to account for debuff turn duration
            results.push(Object.assign({ id: BuffId.TURN_DURATION_MODIFICATION, originalId,
                sources, value: {
                    buffs: [VulnerabilityType.Critical, VulnerabilityType.Elemental].map((v) => `proc:132:chance inflict vulnerability-${v}`),
                    duration: debuffTurnDuration,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('901', (effect, context, injectionContext) => {
        const originalId = '901';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let healLow = 0, healHigh = 0;
        let unknownParams;
        if (effect.params) {
            const params = splitEffectParams(effect);
            healLow = parseNumberOrDefault(params[0]);
            healHigh = parseNumberOrDefault(params[1]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(2), 2, injectionContext);
        }
        const results = [];
        if (healHigh !== 0 || healLow !== 0) {
            results.push(Object.assign({ id: 'proc:901:raid burst heal', originalId,
                sources,
                effectDelay, value: {
                    // healing value is based on the REC value at the squad/unit selection screen
                    'baseRecLow%': healLow,
                    'baseRecHigh%': healHigh,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('902', (effect, context, injectionContext) => {
        const originalId = '902';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const params = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            turnDuration: '0',
        };
        const coreStatProperties = ['atk', 'def', 'rec', 'crit'];
        const coreStatPropertyMapping = {
            atk: 'atk% buff (100)',
            def: 'def% buff (101)',
            rec: 'rec% buff (102)',
            crit: 'crit% buff (103)',
        };
        let unknownParams;
        if (effect.params) {
            let extraParams;
            [params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            coreStatProperties.forEach((statType) => {
                const effectKey = coreStatPropertyMapping[statType];
                if (effectKey in effect) {
                    params[statType] = effect[effectKey];
                }
            });
            params.turnDuration = effect['buff timer (seconds)'];
        }
        // ensure numerical properties are actually numbers
        coreStatProperties.concat(['turnDuration']).forEach((prop) => {
            params[prop] = parseNumberOrDefault(params[prop]);
        });
        const hasAnyStats = coreStatProperties.some((statKey) => params[statKey] !== 0);
        const results = [];
        if (hasAnyStats) {
            coreStatProperties.forEach((statKey) => {
                const value = params[statKey];
                if (value !== 0) {
                    results.push(Object.assign({ id: `proc:902:raid stat boost-${statKey}`, originalId,
                        sources,
                        effectDelay, duration: params.turnDuration, // seconds
                        value }, targetData));
                }
            });
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('903', (effect, context, injectionContext) => {
        const originalId = '903';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let secondsDuration = 0;
        let unknownParams;
        if (effect.params) {
            const [unknownValue, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
            secondsDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams([unknownValue, '0', ...extraParams], 0, injectionContext);
        }
        const results = [];
        if (secondsDuration !== 0) {
            results.push(Object.assign({ id: 'proc:903:boss location reveal', originalId,
                sources,
                effectDelay, duration: secondsDuration, value: true }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('905', (effect, context, injectionContext) => {
        const originalId = '905';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let unknownParams;
        if (effect.params) {
            const extraParams = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        const results = [Object.assign({ id: 'proc:905:teleport to camp', originalId,
                sources,
                effectDelay, value: true }, targetData)];
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('906', (effect, context, injectionContext) => {
        const originalId = '906';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let unknownParams;
        if (effect.params) {
            const extraParams = splitEffectParams(effect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        const results = [Object.assign({ id: 'proc:906:flee battle', originalId,
                sources,
                effectDelay, value: true }, targetData)];
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
    map.set('907', (effect, context, injectionContext) => {
        return parseProcWithSingleNumericalParameterAndTurnDuration({
            effect,
            context,
            injectionContext,
            buffId: 'proc:907:raid mitigation',
            originalId: '907',
        });
    });
    map.set('908', (effect, context, injectionContext) => {
        const originalId = '908';
        const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        let dropRatePercentIncrease = 0;
        let unknownParams;
        if (effect.params) {
            const [rawValue, ...extraParams] = splitEffectParams(effect);
            dropRatePercentIncrease = parseNumberOrDefault(rawValue);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        const results = [];
        if (dropRatePercentIncrease !== 0) {
            results.push(Object.assign({ id: 'proc:908:raid drop rate multiplier', originalId,
                sources,
                effectDelay, value: (dropRatePercentIncrease + 100) / 100 }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            effectDelay,
        });
        return results;
    });
}

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given proc effect.
 */
function defaultConversionFunction$2(effect, context) {
    const id = (isProcEffect(effect) && getEffectId(effect)) || KNOWN_PROC_ID.Unknown;
    return [{
            id: BuffId.UNKNOWN_PROC_EFFECT_ID,
            originalId: id,
            effectDelay: effect['effect delay time(ms)/frame'],
            targetType: effect['target type'],
            targetArea: effect['target area'],
            sources: createSourcesFromContext(context),
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
    const id = (isProcEffect(effect) && getEffectId(effect));
    const conversionFunction = (id && getProcEffectToBuffMapping(context.reloadMapping).get(id));
    // TODO: warning if result is empty?
    return typeof conversionFunction === 'function'
        ? conversionFunction(effect, context)
        : defaultConversionFunction$2(effect, context);
}

let mapping$1;
/**
 * @description Retrieve the conditional-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of conditional IDs to functions.
 */
function getConditionalEffectToBuffMapping(reload) {
    if (!mapping$1 || reload) {
        mapping$1 = new Map();
        setMapping$1(mapping$1);
    }
    return mapping$1;
}
/**
 * @description Apply the mapping of conditional effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping$1(map) {
    const ELEMENT_MAPPING = {
        0: BuffConditionElement.All,
        1: UnitElement.Fire,
        2: UnitElement.Water,
        3: UnitElement.Earth,
        4: UnitElement.Thunder,
        5: UnitElement.Light,
        6: UnitElement.Dark,
    };
    const createUnknownParamsEntry = (unknownParams, { originalId, sources, targetData, }) => (Object.assign({ id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS, originalId,
        sources, value: unknownParams }, targetData));
    /**
     * @description Common checks that are run for most effects after the params have been parsed
     * into an array of {@link IBuff} but before said array is returned.
     * @param results List of buffs from the given effect.
     * @param unknownParams Any unknown parameters from the given effect.
     * @param parsingContext Extra metadata extracted from the given effect.
     * @returns {undefined} No value is returned, but it does update the `results` array.
     */
    const handlePostParse = (results, unknownParams, { originalId, sources, targetData, }) => {
        if (results.length === 0) {
            results.push(createNoParamsEntry({ originalId, sources }));
        }
        if (unknownParams) {
            results.push(createUnknownParamsEntry(unknownParams, {
                originalId,
                sources,
                targetData,
            }));
        }
    };
    const getDefaultTargetData = (targetType) => ({ targetType: targetType || TargetType.Self, targetArea: TargetArea.Single });
    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
        const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
        const splitParams = typeof effect.params === 'string' ? effect.params.split('&') : [];
        const targetData = getDefaultTargetData(effect.targetType);
        const turnDuration = parseNumberOrDefault(effect.turnDuration);
        return { targetData, sources, splitParams, turnDuration };
    };
    const parseConditionalWithSingleNumericalParameter = ({ effect, context, injectionContext, originalId, buffId, returnBuffWithValueOfZero = false, parseParamValue = (rawValue) => parseNumberOrDefault(rawValue), }) => {
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawValue, ...extraParams] = splitParams;
        const value = parseParamValue(rawValue);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        const results = [];
        if (returnBuffWithValueOfZero || value !== 0) {
            results.push(Object.assign({ id: buffId, originalId,
                sources, duration: turnDuration, value }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    };
    const parseConditionalWithOnlyBaseAndBuffResistanceParameters = ({ effect, context, injectionContext, originalId, baseResistanceBuffId, buffResistanceBuffId, }) => {
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawBaseResist, rawBuffResist, ...extraParams] = splitParams;
        const baseResist = parseNumberOrDefault(rawBaseResist);
        const buffResist = parseNumberOrDefault(rawBuffResist);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (baseResist !== 0) {
            results.push(Object.assign({ id: baseResistanceBuffId, originalId,
                sources, duration: turnDuration, value: baseResist }, targetData));
        }
        if (buffResist !== 0) {
            results.push(Object.assign({ id: buffResistanceBuffId, originalId,
                sources, duration: turnDuration, value: buffResist }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    };
    const parseBarrierConditionalBuff = ({ effect, context, injectionContext, buffId, originalId, }) => {
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawElement, rawHp, ...extraParams] = splitParams;
        const element = ELEMENT_MAPPING[rawElement] || rawElement || BuffConditionElement.Unknown;
        const hp = parseNumberOrDefault(rawHp);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (hp !== 0) {
            results.push(Object.assign({ id: buffId, originalId,
                sources, duration: turnDuration, value: {
                    hp,
                    parsedElement: element,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    };
    map.set('1', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '1',
            buffId: 'conditional:1:attack buff',
        });
    });
    map.set('3', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '3',
            buffId: 'conditional:3:defense buff',
        });
    });
    map.set('5', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '5',
            buffId: 'conditional:5:recovery buff',
        });
    });
    map.set('7', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '7',
            buffId: 'conditional:7:critical hit rate buff',
        });
    });
    map.set('8', (effect, context, injectionContext) => {
        const originalId = '8';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawHealLow, rawHealHigh, rawAddedRec, ...extraParams] = splitParams;
        const healLow = parseNumberOrDefault(rawHealLow);
        const healHigh = parseNumberOrDefault(rawHealHigh);
        const addedRec = (1 + parseNumberOrDefault(rawAddedRec) / 100) * 10;
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (healLow !== 0 || healHigh !== 0) {
            results.push(Object.assign({ id: 'conditional:8:gradual heal', originalId,
                sources, duration: turnDuration, value: {
                    healLow,
                    healHigh,
                    'addedRec%': addedRec,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('12', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '12',
            buffId: 'conditional:12:guaranteed ko resistance',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('13', (effect, context, injectionContext) => {
        const originalId = '13';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawElement, rawValue, ...extraParams] = splitParams;
        const element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        const value = parseNumberOrDefault(rawValue);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'conditional:13:elemental attack buff', originalId,
                sources, duration: turnDuration, value, conditions: {
                    targetElements: [element],
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('14', (effect, context, injectionContext) => {
        const originalId = '14';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawElement, rawValue, ...extraParams] = splitParams;
        const element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
        const value = parseNumberOrDefault(rawValue);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'conditional:14:elemental defense buff', originalId,
                sources, duration: turnDuration, value, conditions: {
                    targetElements: [element],
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('21', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '21',
            buffId: 'conditional:21:fire mitigation',
        });
    });
    map.set('22', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '22',
            buffId: 'conditional:22:water mitigation',
        });
    });
    map.set('23', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '23',
            buffId: 'conditional:23:earth mitigation',
        });
    });
    map.set('24', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '24',
            buffId: 'conditional:24:thunder mitigation',
        });
    });
    map.set('25', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '25',
            buffId: 'conditional:25:light mitigation',
        });
    });
    map.set('26', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '26',
            buffId: 'conditional:26:dark mitigation',
        });
    });
    map.set('36', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '36',
            buffId: 'conditional:36:mitigation',
        });
    });
    map.set('37', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '37',
            buffId: 'conditional:37:gradual bc fill',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
        });
    });
    map.set('40', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '40',
            buffId: 'conditional:40:spark damage',
        });
    });
    map.set('51', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '51',
            buffId: 'conditional:51:add fire element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('52', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '52',
            buffId: 'conditional:52:add water element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('53', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '53',
            buffId: 'conditional:53:add earth element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('54', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '54',
            buffId: 'conditional:54:add thunder element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('55', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '55',
            buffId: 'conditional:55:add light element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('56', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '56',
            buffId: 'conditional:56:add dark element',
            returnBuffWithValueOfZero: true,
        });
    });
    map.set('72', (effect, context, injectionContext) => {
        const originalId = '72';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawBb, rawSbb, rawUbb, ...extraParams] = splitParams;
        const bb = parseNumberOrDefault(rawBb);
        const sbb = parseNumberOrDefault(rawSbb);
        const ubb = parseNumberOrDefault(rawUbb);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (bb !== 0) {
            results.push(Object.assign({ id: 'conditional:72:attack boost-bb', originalId,
                sources, duration: turnDuration, value: bb }, targetData));
        }
        if (sbb !== 0) {
            results.push(Object.assign({ id: 'conditional:72:attack boost-sbb', originalId,
                sources, duration: turnDuration, value: sbb }, targetData));
        }
        if (ubb !== 0) {
            results.push(Object.assign({ id: 'conditional:72:attack boost-ubb', originalId,
                sources, duration: turnDuration, value: ubb }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('74', (effect, context, injectionContext) => {
        const originalId = '74';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawReductionValue, rawChance, rawDebuffTurns, ...extraParams] = splitParams;
        const reductionValue = parseNumberOrDefault(rawReductionValue);
        const chance = parseNumberOrDefault(rawChance);
        const debuffTurnDuration = parseNumberOrDefault(rawDebuffTurns);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (reductionValue !== 0 || chance !== 0 || debuffTurnDuration !== 0) {
            results.push(Object.assign({ id: 'conditional:74:add atk down to attack', originalId,
                sources, duration: turnDuration, value: {
                    reductionValue,
                    chance,
                    debuffTurnDuration,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('75', (effect, context, injectionContext) => {
        const originalId = '75';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawReductionValue, rawChance, rawDebuffTurns, ...extraParams] = splitParams;
        const reductionValue = parseNumberOrDefault(rawReductionValue);
        const chance = parseNumberOrDefault(rawChance);
        const debuffTurnDuration = parseNumberOrDefault(rawDebuffTurns);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (reductionValue !== 0 || chance !== 0 || debuffTurnDuration !== 0) {
            results.push(Object.assign({ id: 'conditional:75:add def down to attack', originalId,
                sources, duration: turnDuration, value: {
                    reductionValue,
                    chance,
                    debuffTurnDuration,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('84', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '84',
            buffId: 'conditional:84:critical damage',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) * 100,
        });
    });
    map.set('91', (effect, context, injectionContext) => {
        const originalId = '91';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawChance, rawHpRecover, ...extraParams] = splitParams;
        const chance = parseNumberOrDefault(rawChance);
        const hpRecover = parseNumberOrDefault(rawHpRecover);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'conditional:91:chance ko resistance', originalId,
                sources, duration: turnDuration, value: {
                    'hpRecover%': hpRecover,
                    chance,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('95', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:95:fire barrier',
            originalId: '95',
        });
    });
    map.set('96', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:96:water barrier',
            originalId: '96',
        });
    });
    map.set('97', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:97:earth barrier',
            originalId: '97',
        });
    });
    map.set('98', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:98:thunder barrier',
            originalId: '98',
        });
    });
    map.set('99', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:99:light barrier',
            originalId: '99',
        });
    });
    map.set('100', (effect, context, injectionContext) => {
        return parseBarrierConditionalBuff({
            effect,
            context,
            injectionContext,
            buffId: 'conditional:100:dark barrier',
            originalId: '100',
        });
    });
    map.set('111', (effect, context, injectionContext) => {
        const originalId = '111';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawFillLow, rawFillHigh, rawChance, ...extraParams] = splitParams;
        const fillLow = parseNumberOrDefault(rawFillLow) / 100;
        const fillHigh = parseNumberOrDefault(rawFillHigh) / 100;
        const chance = parseNumberOrDefault(rawChance);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (fillLow !== 0 || fillHigh !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'conditional:111:bc fill on spark', originalId,
                sources, duration: turnDuration, value: {
                    fillLow,
                    fillHigh,
                    chance,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('112', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '112',
            buffId: 'conditional:112:bc efficacy reduction',
        });
    });
    map.set('124', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '124',
            buffId: 'conditional:124:self attack buff',
        });
    });
    map.set('125', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '125',
            buffId: 'conditional:125:self defense buff',
        });
    });
    map.set('131', (effect, context, injectionContext) => {
        const originalId = '131';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawChance, rawSparkDamage, ...extraParams] = splitParams;
        const chance = parseNumberOrDefault(rawChance);
        const sparkDamage = parseNumberOrDefault(rawSparkDamage);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (chance !== 0 || sparkDamage !== 0) {
            results.push(Object.assign({ id: 'conditional:131:spark critical', originalId,
                sources, duration: turnDuration, value: {
                    chance,
                    'sparkDamage%': sparkDamage,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('132', (effect, context, injectionContext) => {
        return parseConditionalWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            originalId: '132',
            buffId: 'conditional:132:od fill rate',
        });
    });
    map.set('133', (effect, context, injectionContext) => {
        const originalId = '133';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawHealLow, rawHealHigh, rawChance, ...extraParams] = splitParams;
        const healLow = parseNumberOrDefault(rawHealLow);
        const healHigh = parseNumberOrDefault(rawHealHigh);
        const chance = parseNumberOrDefault(rawChance);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (healLow !== 0 || healHigh !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'conditional:133:heal on hit', originalId,
                sources, duration: turnDuration, value: {
                    healLow,
                    healHigh,
                    chance,
                }, conditions: { whenAttacked: true } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('143', (effect, context, injectionContext) => {
        return parseConditionalWithOnlyBaseAndBuffResistanceParameters({
            effect,
            context,
            injectionContext,
            originalId: '143',
            baseResistanceBuffId: 'conditional:143:critical damage reduction-base',
            buffResistanceBuffId: 'conditional:143:critical damage reduction-buff',
        });
    });
    map.set('144', (effect, context, injectionContext) => {
        return parseConditionalWithOnlyBaseAndBuffResistanceParameters({
            effect,
            context,
            injectionContext,
            originalId: '144',
            baseResistanceBuffId: 'conditional:144:spark damage reduction-base',
            buffResistanceBuffId: 'conditional:144:spark damage reduction-buff',
        });
    });
    map.set('145', (effect, context, injectionContext) => {
        return parseConditionalWithOnlyBaseAndBuffResistanceParameters({
            effect,
            context,
            injectionContext,
            originalId: '145',
            baseResistanceBuffId: 'conditional:145:elemental weakness damage reduction-base',
            buffResistanceBuffId: 'conditional:145:elemental weakness damage reduction-buff',
        });
    });
    map.set('153', (effect, context, injectionContext) => {
        const originalId = '153';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawReductionValue, rawChance, rawDebuffTurnDuration, ...extraParams] = splitParams;
        const reductionValue = parseNumberOrDefault(rawReductionValue);
        const chance = parseNumberOrDefault(rawChance);
        const debuffTurnDuration = parseNumberOrDefault(rawDebuffTurnDuration);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (reductionValue !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'conditional:153:chance inflict atk down on hit', originalId,
                sources, duration: turnDuration, value: {
                    reductionValue,
                    chance,
                    debuffTurnDuration,
                }, conditions: { whenAttacked: true } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('10001', (effect, context, injectionContext) => {
        const originalId = '10001';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawAttack, rawDefense, rawCritRate, rawRecovery, ...extraParams] = splitParams;
        const stats = {
            atk: parseNumberOrDefault(rawAttack),
            def: parseNumberOrDefault(rawDefense),
            rec: parseNumberOrDefault(rawRecovery),
            crit: parseNumberOrDefault(rawCritRate),
        };
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        const makeBaseBuff = () => (Object.assign({ originalId,
            sources, duration: turnDuration }, targetData));
        const results = [Object.assign(Object.assign({}, makeBaseBuff()), { id: 'conditional:10001:stealth', value: true })];
        ['atk', 'def', 'crit', 'rec'].forEach((stat) => {
            const value = stats[stat];
            if (value !== 0) {
                results.push(Object.assign(Object.assign({}, makeBaseBuff()), { id: `conditional:10001:stealth-${stat}`, value }));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
    map.set('10500', (effect, context, injectionContext) => {
        const originalId = '10500';
        const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawElementValue, rawHp, rawDefense, ...extraParams] = splitParams;
        const element = ELEMENT_MAPPING[rawElementValue] || BuffConditionElement.Unknown;
        const hp = parseNumberOrDefault(rawHp);
        const defense = parseNumberOrDefault(rawDefense);
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        const results = [];
        if (hp !== 0 || defense !== 0) {
            results.push(Object.assign({ id: `conditional:10500:shield-${element}`, originalId,
                sources, duration: turnDuration, value: {
                    hp,
                    defense,
                } }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
        });
        return results;
    });
}

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given conditional effect.
 */
function defaultConversionFunction$1(effect, context) {
    const id = effect.id || KNOWN_CONDITIONAL_ID.Unknown;
    return [{
            id: BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID,
            originalId: id,
            sources: createSourcesFromContext(context),
        }];
}
/**
 * @description Extract the buff(s) from a given conditional effect object.
 * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
 * @param effect Conditional effect to extract buffs from
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns A collection of one or more buffs found in the given passive effect object.
 */
function convertConditionalEffectToBuffs(effect, context) {
    if (!effect || typeof effect !== 'object') {
        throw new TypeError('effect parameter should be an object');
    }
    if (!context || typeof context !== 'object') {
        throw new TypeError('context parameter should be an object');
    }
    const conversionFunction = getConditionalEffectToBuffMapping(context.reloadMapping).get(effect.id);
    // TODO: warning if result is empty?
    return typeof conversionFunction === 'function'
        ? conversionFunction(effect, context)
        : defaultConversionFunction$1(effect, context);
}

let mapping;
/**
 * @description Retrieve the passive-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @param convertPassiveEffectToBuffs Function used for recursive passive buff parsing.
 * @returns Mapping of passive IDs to functions.
 */
function getPassiveEffectToBuffMapping(reload, convertPassiveEffectToBuffs) {
    if (!mapping || reload) {
        mapping = new Map();
        setMapping(mapping, convertPassiveEffectToBuffs || (() => []));
    }
    return mapping;
}
/**
 * @description Apply the mapping of passive effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @param convertPassiveEffectToBuffs Function used for recursive passive buff parsing.
 * @returns Does not return anything.
 * @internal
 */
function setMapping(map, convertPassiveEffectToBuffs) {
    const UNKNOWN_PASSIVE_PARAM_EFFECT_KEY = 'unknown passive params';
    const ELEMENT_MAPPING = {
        1: UnitElement.Fire,
        2: UnitElement.Water,
        3: UnitElement.Earth,
        4: UnitElement.Thunder,
        5: UnitElement.Light,
        6: UnitElement.Dark,
        X: BuffConditionElement.OmniParadigm,
    };
    const TYPE_MAPPING = {
        1: UnitType.Lord,
        2: UnitType.Anima,
        3: UnitType.Breaker,
        4: UnitType.Guardian,
        5: UnitType.Oracle,
        6: UnitType.Rex,
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
        9: Ailment.RecoveryReduction,
    };
    const TARGET_TYPE_MAPPING = {
        1: TargetType.Party,
        2: TargetType.Enemy,
        3: TargetType.Self,
    };
    const TARGET_AREA_MAPPING = {
        1: TargetArea.Single,
        2: TargetArea.Aoe,
    };
    const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
    const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
    const DROP_TYPES_ORDER = ['bc', 'hc', 'item', 'zel', 'karma'];
    const retrieveCommonInfoForEffects = (effect, context, injectionContext) => {
        const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect);
        const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
        const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
        return { conditionInfo, targetData, sources };
    };
    const convertConditionalEffectToBuffsWithInjectionContext = (effect, context, injectionContext) => {
        const conversionFunction = (injectionContext && injectionContext.convertConditionalEffectToBuffs) || convertConditionalEffectToBuffs;
        return conversionFunction(effect, context);
    };
    const convertProcEffectToBuffsWithInjectionContext = (effect, context, injectionContext) => {
        const conversionFunction = (injectionContext && injectionContext.convertProcEffectToBuffs) || convertProcEffectToBuffs;
        return conversionFunction(effect, context);
    };
    // Disable rule as this function is only called once it's confirmed that `effect.params` exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const splitEffectParams = (effect) => effect.params.split(',');
    const splitEffectWithUnknownPassiveParamsProperty = (effect) => {
        const rawParams = effect.params || effect[UNKNOWN_PASSIVE_PARAM_EFFECT_KEY] || '';
        return splitEffectParams({ params: rawParams });
    };
    const createUnknownParamsEntry = (unknownParams, { originalId, sources, targetData, conditionInfo, }) => (Object.assign({ id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS, originalId,
        sources, value: unknownParams, conditions: Object.assign({}, conditionInfo) }, targetData));
    /**
     * @description Common checks that are run for most effects after the params have been parsed
     * into an array of {@link IBuff} but before said array is returned.
     * @param results List of buffs from the given effect.
     * @param unknownParams Any unknown parameters from the given effect.
     * @param parsingContext Extra metadata extracted from the given effect.
     * @returns {undefined} No value is returned, but it does update the `results` array.
     */
    const handlePostParse = (results, unknownParams, { originalId, sources, targetData, conditionInfo, }) => {
        if (results.length === 0) {
            results.push(createNoParamsEntry({ originalId, sources }));
        }
        if (unknownParams) {
            results.push(createUnknownParamsEntry(unknownParams, {
                originalId,
                sources,
                targetData,
                conditionInfo,
            }));
        }
    };
    let ThresholdType;
    (function (ThresholdType) {
        ThresholdType["Hp"] = "hp";
        ThresholdType["Bb"] = "bb gauge";
        ThresholdType["DamageTaken"] = "damage taken";
        ThresholdType["DamageDealt"] = "damage dealt";
        ThresholdType["BcReceived"] = "bc receive count";
        ThresholdType["HcReceived"] = "hc receive count";
        ThresholdType["SparkCount"] = "spark count";
        ThresholdType["ChanceGuard"] = "on guard";
        ThresholdType["ChanceCrit"] = "on crit";
        ThresholdType["ChanceOverDrive"] = "on overdrive activation";
        ThresholdType["ChanceWhenAttacked"] = "when attacked";
    })(ThresholdType || (ThresholdType = {}));
    const parseThresholdValuesFromParamsProperty = (rawThreshold, rawRequireAboveFlag, thresholdType) => {
        return {
            threshold: parseNumberOrDefault(rawThreshold),
            requireAbove: rawRequireAboveFlag === '1',
            type: thresholdType,
        };
    };
    const parseThresholdValuesFromEffect = (effect, thresholdType, suffix = 'buff requirement') => {
        let effectKey, fallbackEffectKey, requireAbove = true;
        if (thresholdType === ThresholdType.DamageTaken) {
            effectKey = 'damage threshold activation';
        }
        else if (thresholdType === ThresholdType.DamageDealt) {
            effectKey = 'damage dealt threshold activation';
        }
        else if (thresholdType === ThresholdType.BcReceived) {
            effectKey = 'bc receive count buff activation';
            fallbackEffectKey = 'bc receive count activation';
        }
        else if (thresholdType === ThresholdType.HcReceived) {
            effectKey = 'hc receive count buff activation';
            fallbackEffectKey = 'hc receive count activation';
        }
        else if (thresholdType === ThresholdType.SparkCount) {
            effectKey = 'spark count buff activation';
            fallbackEffectKey = 'spark count activation';
        }
        else if (`${thresholdType} above % ${suffix}` in effect) {
            effectKey = `${thresholdType} above % ${suffix}`;
        }
        else {
            effectKey = `${thresholdType} below % ${suffix}`;
            requireAbove = false;
        }
        const threshold = !fallbackEffectKey
            ? parseNumberOrDefault(effect[effectKey])
            : parseNumberOrDefault(effect[effectKey], parseNumberOrDefault(effect[fallbackEffectKey]));
        return {
            threshold,
            requireAbove,
            type: thresholdType,
        };
    };
    const getThresholdConditions = ({ threshold, requireAbove, type }) => {
        let conditions;
        if (type === ThresholdType.Hp) {
            if (requireAbove) {
                conditions = { hpGreaterThanOrEqualTo: threshold };
            }
            else {
                conditions = { hpLessThanOrEqualTo: threshold };
            }
        }
        else if (type === ThresholdType.Bb) {
            if (requireAbove) {
                conditions = { bbGaugeGreaterThanOrEqualTo: threshold };
            }
            else {
                conditions = { bbGaugeLessThanOrEqualTo: threshold };
            }
        }
        else if (type === ThresholdType.DamageTaken) {
            conditions = { damageTakenExceeds: threshold };
        }
        else if (type === ThresholdType.DamageDealt) {
            conditions = { damageDealtExceeds: threshold };
        }
        else if (type === ThresholdType.BcReceived) {
            conditions = { bcReceivedExceeds: threshold };
        }
        else if (type === ThresholdType.HcReceived) {
            conditions = { hcReceivedExceeds: threshold };
        }
        else if (type === ThresholdType.SparkCount) {
            conditions = { sparkCountExceeds: threshold };
        }
        else if (type === ThresholdType.ChanceGuard) {
            conditions = { onGuardChance: threshold };
        }
        else if (type === ThresholdType.ChanceCrit) {
            conditions = { onCriticalHitChance: threshold };
        }
        else if (type === ThresholdType.ChanceOverDrive) {
            conditions = { onOverdriveChance: threshold };
        }
        else if (type === ThresholdType.ChanceWhenAttacked) {
            conditions = { whenAttackedChance: threshold };
        }
        return conditions;
    };
    const parsePassiveWithSingleNumericalParameter = ({ effect, context, injectionContext, originalId, effectKey, buffId, parseParamValue = (rawValue) => parseNumberOrDefault(rawValue), }) => {
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let value = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawValue, ...extraParams] = splitEffectParams(typedEffect);
            value = parseParamValue(rawValue);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
        }
        else {
            value = parseNumberOrDefault(typedEffect[effectKey]);
        }
        if (value !== 0) {
            results.push(Object.assign({ id: buffId, originalId,
                sources,
                value, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    };
    const parsePassiveWithNumericalValueRangeAndChance = ({ effect, context, injectionContext, originalId, effectKeyLow, effectKeyHigh, effectKeyChance, buffKeyLow, buffKeyHigh, defaultEffectChance = 0, parseParamValue = (rawValue) => parseNumberOrDefault(rawValue), generateBaseConditions = () => ({}), buffId, }) => {
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let valueLow, valueHigh, chance;
        let unknownParams;
        if (typedEffect.params) {
            const [rawLowValue, rawHighValue, rawChance, ...extraParams] = splitEffectParams(typedEffect);
            valueLow = parseParamValue(rawLowValue);
            valueHigh = parseParamValue(rawHighValue);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            valueLow = parseNumberOrDefault(typedEffect[effectKeyLow]);
            valueHigh = parseNumberOrDefault(typedEffect[effectKeyHigh]);
            chance = parseNumberOrDefault(typedEffect[effectKeyChance], defaultEffectChance);
        }
        const results = [];
        if (valueLow !== 0 || valueHigh !== 0 || chance !== 0) {
            results.push(Object.assign({ id: buffId, originalId,
                sources, value: {
                    [buffKeyLow]: valueLow,
                    [buffKeyHigh]: valueHigh,
                    chance,
                }, conditions: Object.assign(Object.assign({}, conditionInfo), generateBaseConditions()) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    };
    const parseConditionalPassiveWithSingleNumericalCondition = ({ effect, context, injectionContext, originalId, buffId, thresholdType, modifyConditionalEffect, }) => {
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            const conditionalEffect = {
                id: params[0],
                params: params[1],
                turnDuration: parseNumberOrDefault(params[4]),
            };
            if (typeof modifyConditionalEffect === 'function') {
                modifyConditionalEffect(conditionalEffect);
            }
            const triggeredBuffs = convertConditionalEffectToBuffsWithInjectionContext(conditionalEffect, context, injectionContext);
            const maxTriggerCount = parseNumberOrDefault(params[2]);
            const thresholdInfo = parseThresholdValuesFromParamsProperty(params[3], '1', thresholdType);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(5), 5, injectionContext);
            if (triggeredBuffs.length > 0) {
                const thresholdConditions = getThresholdConditions(thresholdInfo);
                results.push(Object.assign({ id: buffId, originalId,
                    sources, value: {
                        triggeredBuffs,
                        maxTriggerCount,
                    }, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    };
    const parseConditionalBcFillWithSingleNumericalCondition = ({ effect, context, injectionContext, originalId, thresholdType, flatFillBuffId, percentFillBuffId, flatFillEffectKey, }) => {
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let flatFill, percentFill, thresholdInfo;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            flatFill = parseNumberOrDefault(params[0]) / 100;
            percentFill = parseNumberOrDefault(params[1]);
            thresholdInfo = parseThresholdValuesFromParamsProperty(params[2], '1', thresholdType);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(3), 3, injectionContext);
        }
        else {
            flatFill = parseNumberOrDefault(typedEffect[flatFillEffectKey]);
            percentFill = 0; // NOTE: deathmax datamine does not parse this property
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, thresholdType);
        }
        const results = [];
        if (flatFill !== 0) {
            const thresholdConditions = getThresholdConditions(thresholdInfo);
            results.push(Object.assign({ id: flatFillBuffId, originalId,
                sources, value: flatFill, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
        }
        if (percentFill !== 0) {
            const thresholdConditions = getThresholdConditions(thresholdInfo);
            results.push(Object.assign({ id: percentFillBuffId, originalId,
                sources, value: percentFill, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    };
    map.set('1', (effect, context, injectionContext) => {
        const originalId = '1';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            stats.hp = typedEffect['hp% buff'];
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
        }
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:1:${stat}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('2', (effect, context, injectionContext) => {
        const originalId = '2';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            elements: [],
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let element1, element2;
            [element1, element2, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
            [element1, element2].forEach((elementValue) => {
                if (elementValue && elementValue !== '0') {
                    stats.elements.push(ELEMENT_MAPPING[elementValue] || BuffConditionElement.Unknown);
                }
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
        }
        else {
            if (Array.isArray(typedEffect['elements buffed'])) {
                stats.elements = typedEffect['elements buffed'];
            }
            stats.hp = typedEffect['hp% buff'];
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
        }
        const createBaseStatObject = (stat) => (Object.assign({ id: `passive:2:elemental-${stat}`, originalId,
            sources, value: parseNumberOrDefault(stats[stat]) }, targetData));
        if (stats.elements.length > 0) {
            stats.elements.forEach((element) => {
                STATS_ORDER.forEach((stat) => {
                    const value = parseNumberOrDefault(stats[stat]);
                    if (value !== 0) {
                        results.push(Object.assign(Object.assign({}, createBaseStatObject(stat)), { conditions: Object.assign(Object.assign({}, conditionInfo), { targetElements: [element] }) }));
                    }
                });
            });
        }
        else {
            STATS_ORDER.forEach((stat) => {
                const value = parseNumberOrDefault(stats[stat]);
                if (value !== 0) {
                    results.push(Object.assign(Object.assign({}, createBaseStatObject(stat)), { conditions: Object.assign(Object.assign({}, conditionInfo), { targetElements: [BuffConditionElement.Unknown] }) }));
                }
            });
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('3', (effect, context, injectionContext) => {
        const originalId = '3';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            unitType: '',
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
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
        }
        else {
            stats.unitType = typedEffect['unit type buffed'];
            stats.hp = typedEffect['hp% buff'];
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
        }
        const targetUnitType = stats.unitType || 'unknown';
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:3:type based-${stat}`, originalId,
                    sources, value: +value, conditions: Object.assign(Object.assign({}, conditionInfo), { targetUnitType }) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('4', (effect, context, injectionContext) => {
        const originalId = '4';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const resistances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            AILMENTS_ORDER.forEach((ailment) => {
                const effectKey = ailment !== 'weak' ? ailment : 'weaken';
                resistances[ailment] = typedEffect[`${effectKey} resist%`];
            });
        }
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(resistances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:4:resist-${ailment}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('5', (effect, context, injectionContext) => {
        const originalId = '5';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
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
        }
        else {
            element = Object.values(ELEMENT_MAPPING).find((elem) => `${elem} resist%` in effect) || BuffConditionElement.Unknown;
            if (element !== BuffConditionElement.Unknown) {
                mitigation = typedEffect[`${element} resist%`];
            }
        }
        const value = parseNumberOrDefault(mitigation);
        if (value !== 0) {
            results.push(Object.assign({ id: `passive:5:mitigate-${element}`, originalId,
                sources,
                value, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('8', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'dmg% mitigation',
            buffId: 'passive:8:mitigation',
            originalId: '8',
        });
    });
    map.set('9', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'bc fill per turn',
            buffId: 'passive:9:gradual bc fill',
            originalId: '9',
        });
    });
    map.set('10', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'hc effectiveness%',
            buffId: 'passive:10:hc efficacy',
            originalId: '10',
        });
    });
    map.set('11', (effect, context, injectionContext) => {
        const originalId = '11';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
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
        }
        else {
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
        }
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (stat !== 'hp' && value !== 0) {
                const entry = Object.assign({ id: `passive:11:hp conditional-${stat}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData);
                results.push(entry);
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('12', (effect, context, injectionContext) => {
        const originalId = '12';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const dropRates = {
            bc: '0',
            hc: '0',
            item: '0',
            zel: '0',
            karma: '0',
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
        }
        else {
            DROP_TYPES_ORDER.forEach((dropType) => {
                dropRates[dropType] = typedEffect[`${dropType} drop rate% buff`];
            });
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
        }
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        DROP_TYPES_ORDER.forEach((dropType) => {
            const value = parseNumberOrDefault(dropRates[dropType]);
            if (value !== 0) {
                const entry = Object.assign({ id: `passive:12:hp conditional drop boost-${dropType}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData);
                results.push(entry);
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
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
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            generateBaseConditions: () => ({ onEnemyDefeat: true }),
            buffId: 'passive:13:bc fill on enemy defeat',
        });
    });
    map.set('14', (effect, context, injectionContext) => {
        const originalId = '14';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let damageReduction, chance;
        let unknownParams;
        if (typedEffect.params) {
            const [rawReduction, rawChance, ...extraParams] = splitEffectParams(typedEffect);
            damageReduction = parseNumberOrDefault(rawReduction);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            damageReduction = parseNumberOrDefault(typedEffect['dmg reduction%']);
            chance = parseNumberOrDefault(typedEffect['dmg reduction chance%']);
        }
        const results = [];
        if (damageReduction !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'passive:14:chance mitigation', originalId,
                sources, value: {
                    value: damageReduction,
                    chance,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
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
            generateBaseConditions: () => ({ onEnemyDefeat: true }),
            defaultEffectChance: 100,
            buffId: 'passive:15:heal on enemy defeat',
        });
    });
    map.set('16', (effect, context, injectionContext) => {
        const originalId = '16';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let healLow, healHigh;
        let unknownParams;
        if (typedEffect.params) {
            const [rawHealLow, rawHealHigh, ...extraParams] = splitEffectParams(typedEffect);
            healLow = parseNumberOrDefault(rawHealLow);
            healHigh = parseNumberOrDefault(rawHealHigh);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            healLow = parseNumberOrDefault(typedEffect['hp% recover on battle win low']);
            healHigh = parseNumberOrDefault(typedEffect['hp% recover on battle win high']);
        }
        const results = [];
        if (healLow !== 0 || healHigh !== 0) {
            results.push(Object.assign({ id: 'passive:16:heal on win', originalId,
                sources, value: {
                    healLow,
                    healHigh,
                }, conditions: Object.assign(Object.assign({}, conditionInfo), { onBattleWin: true }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
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
            buffKeyLow: 'drainHealLow%',
            buffKeyHigh: 'drainHealHigh%',
            buffId: 'passive:17:hp absorb',
        });
    });
    map.set('19', (effect, context, injectionContext) => {
        const originalId = '19';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const dropRates = {
            bc: '0',
            hc: '0',
            item: '0',
            zel: '0',
            karma: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            DROP_TYPES_ORDER.forEach((dropType) => {
                dropRates[dropType] = typedEffect[`${dropType} drop rate% buff`];
            });
        }
        DROP_TYPES_ORDER.forEach((dropType) => {
            const value = parseNumberOrDefault(dropRates[dropType]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:19:drop boost-${dropType}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('20', (effect, context, injectionContext) => {
        const originalId = '20';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
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
                        chance,
                    });
                }
            }
        }
        else {
            Object.values(AILMENT_MAPPING).forEach((ailment) => {
                let effectKey;
                if (ailment === Ailment.Weak) {
                    effectKey = 'weaken%';
                }
                else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
                    effectKey = ailment;
                }
                else {
                    effectKey = `${ailment}%`;
                }
                if (effectKey in effect) {
                    inflictedAilments.push({
                        ailment,
                        chance: parseNumberOrDefault(typedEffect[effectKey]),
                    });
                }
            });
        }
        const results = [];
        inflictedAilments.forEach(({ ailment, chance }) => {
            if (chance !== 0) {
                results.push(Object.assign({ id: `passive:20:chance inflict-${ailment}`, originalId,
                    sources, value: chance, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('21', (effect, context, injectionContext) => {
        const originalId = '21';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
        };
        let turnDuration = 0;
        let unknownParams;
        if (typedEffect.params) {
            let rawDuration, extraParams;
            [stats.atk, stats.def, stats.rec, stats.crit, rawDuration, ...extraParams] = splitEffectParams(typedEffect);
            turnDuration = parseNumberOrDefault(rawDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            stats.atk = typedEffect['first x turns atk% (1)'];
            stats.def = typedEffect['first x turns def% (3)'];
            stats.rec = typedEffect['first x turns rec% (5)'];
            stats.crit = typedEffect['first x turns crit% (7)'];
            turnDuration = parseNumberOrDefault(typedEffect['first x turns']);
        }
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (stat !== 'hp' && value !== 0) {
                const entry = Object.assign({ id: `passive:21:first turn-${stat}`, originalId,
                    sources,
                    value, duration: turnDuration, conditions: Object.assign({}, conditionInfo) }, targetData);
                results.push(entry);
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('23', (effect, context, injectionContext) => {
        const originalId = '23';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let fillLow, fillHigh;
        let unknownParams;
        if (typedEffect.params) {
            const [rawFillLow, rawFillHigh, ...extraParams] = splitEffectParams(typedEffect);
            fillLow = parseNumberOrDefault(rawFillLow) / 100;
            fillHigh = parseNumberOrDefault(rawFillHigh) / 100;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            fillLow = parseNumberOrDefault(typedEffect['battle end bc fill low']);
            fillHigh = parseNumberOrDefault(typedEffect['battle end bc fill high']);
        }
        const results = [];
        if (fillLow !== 0 || fillHigh !== 0) {
            results.push(Object.assign({ id: 'passive:23:bc fill on win', originalId,
                sources, value: {
                    fillLow,
                    fillHigh,
                }, conditions: Object.assign(Object.assign({}, conditionInfo), { onBattleWin: true }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
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
            generateBaseConditions: () => ({ whenAttacked: true }),
            buffId: 'passive:24:heal on hit',
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
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            generateBaseConditions: () => ({ whenAttacked: true }),
            buffId: 'passive:25:bc fill on hit',
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
            generateBaseConditions: () => ({ whenAttacked: true }),
            buffId: 'passive:26:chance damage reflect',
        });
    });
    map.set('27', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'target% chance',
            buffId: 'passive:27:target chance change',
            originalId: '27',
        });
    });
    map.set('28', (effect, context, injectionContext) => {
        const originalId = '28';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let value = 0;
        let thresholdInfo;
        let unknownParams;
        if (typedEffect.params) {
            const [rawValue, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
            value = parseNumberOrDefault(rawValue);
            thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            value = parseNumberOrDefault(typedEffect['target% chance']);
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp, 'passive requirement');
        }
        const results = [];
        if (value !== 0) {
            const thresholdConditions = getThresholdConditions(thresholdInfo);
            const entry = Object.assign({ id: 'passive:28:hp conditional target chance change', originalId,
                sources,
                value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData);
            results.push(entry);
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('29', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'ignore def%',
            buffId: 'passive:29:chance def ignore',
            originalId: '29',
        });
    });
    map.set('30', (effect, context, injectionContext) => {
        const originalId = '30';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
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
        }
        else {
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Bb);
        }
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (stat !== 'hp' && value !== 0) {
                const entry = Object.assign({ id: `passive:30:bb gauge conditional-${stat}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData);
                results.push(entry);
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('31', (effect, context, injectionContext) => {
        const originalId = '31';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const dropRates = {
            bc: '0',
            hc: '0',
            item: '0',
            zel: '0',
            karma: '0',
        };
        let sparkDamageBoost = 0;
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let rawSparkDamageBoost;
            [rawSparkDamageBoost, dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);
            sparkDamageBoost = parseNumberOrDefault(rawSparkDamageBoost);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            sparkDamageBoost = parseNumberOrDefault(typedEffect['damage% for spark']);
            DROP_TYPES_ORDER.forEach((dropType) => {
                dropRates[dropType] = typedEffect[`${dropType} drop% for spark`];
            });
        }
        const results = [];
        if (sparkDamageBoost !== 0) {
            results.push(Object.assign({ id: 'passive:31:spark-damage', originalId,
                sources, value: sparkDamageBoost, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        DROP_TYPES_ORDER.forEach((dropType) => {
            const value = parseNumberOrDefault(dropRates[dropType]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:31:spark-${dropType}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('32', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'bb gauge fill rate%',
            buffId: 'passive:32:bc efficacy',
            originalId: '32',
        });
    });
    map.set('33', (effect, context, injectionContext) => {
        const originalId = '33';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let healLow, healHigh, addedRec;
        let unknownParams;
        if (typedEffect.params) {
            const [rawHealLow, rawHealHigh, rawAddedRec, ...extraParams] = splitEffectParams(typedEffect);
            healLow = parseNumberOrDefault(rawHealLow);
            healHigh = parseNumberOrDefault(rawHealHigh);
            addedRec = (1 + parseNumberOrDefault(rawAddedRec) / 100) * 10;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            healLow = parseNumberOrDefault(typedEffect['turn heal low']);
            healHigh = parseNumberOrDefault(typedEffect['turn heal high']);
            addedRec = parseNumberOrDefault(typedEffect['rec% added (turn heal)']);
        }
        const results = [];
        if (healLow !== 0 || healHigh !== 0) {
            results.push(Object.assign({ id: 'passive:33:gradual heal', originalId,
                sources, value: {
                    healLow,
                    healHigh,
                    'addedRec%': addedRec,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('34', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'crit multiplier%',
            buffId: 'passive:34:critical damage',
            originalId: '34',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) * 100,
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
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            generateBaseConditions: () => ({ onNormalAttack: true }),
            buffId: 'passive:35:bc fill on normal attack',
        });
    });
    map.set('36', (effect, context, injectionContext) => {
        const originalId = '36';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let additionalActions = 0, damageModifier = 0, chance = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawAdditionalActions, rawDamageModifier, rawChance, ...extraParams] = splitEffectParams(typedEffect);
            additionalActions = parseNumberOrDefault(rawAdditionalActions);
            damageModifier = parseNumberOrDefault(rawDamageModifier);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            additionalActions = parseNumberOrDefault(typedEffect['additional actions']);
        }
        const results = [];
        if (additionalActions !== 0 || damageModifier !== 0 || chance !== 0) {
            results.push(Object.assign({ id: 'passive:36:extra action', originalId,
                sources, value: {
                    additionalActions,
                    damageModifier,
                    chance,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('37', (effect, context, injectionContext) => {
        const originalId = '37';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let hitIncreasePerHit = 0, extraHitDamage = 0;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            hitIncreasePerHit = parseNumberOrDefault(params[0]);
            extraHitDamage = parseNumberOrDefault(params[2]);
            const extraParams = ['0', params[1], '0', ...params.slice(3)];
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
        }
        else {
            hitIncreasePerHit = parseNumberOrDefault(typedEffect['hit increase/hit']);
            extraHitDamage = parseNumberOrDefault(typedEffect['extra hits dmg%']);
        }
        const results = [];
        if (hitIncreasePerHit !== 0 || extraHitDamage !== 0) {
            results.push(Object.assign({ id: 'passive:37:hit count boost', originalId,
                sources, value: {
                    hitIncreasePerHit,
                    extraHitDamage,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('40', (effect, context, injectionContext) => {
        const originalId = '40';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const coreStatProperties = ['atk', 'def', 'rec'];
        const coreStatPropertyMapping = {
            1: 'atk',
            2: 'def',
            3: 'rec',
            4: 'hp',
        };
        const effectToCoreStatMapping = {
            attack: 'atk',
            defense: 'def',
            recovery: 'rec',
            hp: 'hp',
        };
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
        };
        let convertedStat = 'unknown';
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let rawConvertedStat;
            [rawConvertedStat, stats.atk, stats.def, stats.rec, ...extraParams] = splitEffectParams(typedEffect);
            convertedStat = coreStatPropertyMapping[rawConvertedStat] || 'unknown';
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            const rawConvertedStat = typedEffect['converted attribute'];
            if (rawConvertedStat in effectToCoreStatMapping) {
                convertedStat = effectToCoreStatMapping[rawConvertedStat];
            }
            else {
                convertedStat = 'unknown';
            }
            coreStatProperties.forEach((statType) => {
                const effectKey = `${statType}% buff`;
                if (effectKey in typedEffect) {
                    stats[statType] = typedEffect[effectKey];
                }
            });
        }
        const results = [];
        coreStatProperties.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:40:converted-${stat}`, originalId,
                    sources, value: {
                        convertedStat,
                        value,
                    }, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('41', (effect, context, injectionContext) => {
        const originalId = '41';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            minimumElements: '0',
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [stats.minimumElements, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            stats.minimumElements = typedEffect['unique elements required'];
            stats.hp = typedEffect['hp% buff'];
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
        }
        const minimumElements = parseNumberOrDefault(stats.minimumElements);
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:41:unique element count-${stat}`, originalId,
                    sources, value: +value, conditions: Object.assign(Object.assign({}, conditionInfo), { minimumUniqueElements: minimumElements }) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('42', (effect, context, injectionContext) => {
        const originalId = '42';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const GENDER_MAPPING = {
            0: UnitGender.Other,
            1: UnitGender.Male,
            2: UnitGender.Female,
        };
        const typedEffect = effect;
        const results = [];
        const stats = {
            gender: '',
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let rawGender;
            [rawGender, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
            stats.gender = GENDER_MAPPING[rawGender] || 'unknown';
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            stats.gender = typedEffect['gender required'];
            stats.hp = typedEffect['hp% buff'];
            stats.atk = typedEffect['atk% buff'];
            stats.def = typedEffect['def% buff'];
            stats.rec = typedEffect['rec% buff'];
            stats.crit = typedEffect['crit% buff'];
        }
        const targetGender = stats.gender || 'unknown';
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:42:gender-${stat}`, originalId,
                    sources, value: +value, conditions: Object.assign(Object.assign({}, conditionInfo), { targetGender }) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('43', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'take 1 dmg%',
            buffId: 'passive:43:chance damage to one',
            originalId: '43',
        });
    });
    map.set('44', (effect, context, injectionContext) => {
        const originalId = '44';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const stats = {
            atk: '0',
            def: '0',
            rec: '0',
            crit: '0',
            hp: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            stats.hp = typedEffect['hp buff'];
            stats.atk = typedEffect['atk buff'];
            stats.def = typedEffect['def buff'];
            stats.rec = typedEffect['rec buff'];
            stats.crit = typedEffect['crit buff'];
        }
        STATS_ORDER.forEach((stat) => {
            const value = parseNumberOrDefault(stats[stat]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:44:flat-${stat}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('45', (effect, context, injectionContext) => {
        const originalId = '45';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let baseResist = 0, buffResist = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawBaseResist, rawBuffResist, ...extraParams] = splitEffectParams(typedEffect);
            baseResist = parseNumberOrDefault(rawBaseResist);
            buffResist = parseNumberOrDefault(rawBuffResist);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            baseResist = parseNumberOrDefault(typedEffect['base crit% resist']);
            buffResist = parseNumberOrDefault(typedEffect['buff crit% resist']);
        }
        const results = [];
        if (baseResist !== 0) {
            results.push(Object.assign({ id: 'passive:45:critical damage reduction-base', originalId,
                sources, value: baseResist, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        if (buffResist !== 0) {
            results.push(Object.assign({ id: 'passive:45:critical damage reduction-buff', originalId,
                sources, value: buffResist, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('46', (effect, context, injectionContext) => {
        const originalId = '46';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const availableStats = ['atk', 'def', 'rec'];
        const stats = [];
        let proportionalMode = 'unknown';
        const typedEffect = effect;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            availableStats.forEach((stat, index) => {
                const baseValue = parseNumberOrDefault(params[index * 2]);
                const addedValue = parseNumberOrDefault(params[(index * 2) + 1]);
                if (baseValue !== 0 || addedValue !== 0) {
                    stats.push({
                        stat,
                        baseValue,
                        addedValue,
                    });
                }
            });
            proportionalMode = params[6] === '1' ? 'lost' : 'remaining';
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
        }
        else {
            availableStats.forEach((stat) => {
                const baseValue = parseNumberOrDefault(typedEffect[`${stat}% base buff`]);
                const addedValue = parseNumberOrDefault(typedEffect[`${stat}% extra buff based on hp`]);
                if (baseValue !== 0 || addedValue !== 0) {
                    stats.push({
                        stat,
                        baseValue,
                        addedValue,
                    });
                }
            });
            proportionalMode = typedEffect['buff proportional to hp'] || 'unknown';
        }
        const results = stats.map(({ stat, baseValue, addedValue }) => (Object.assign({ id: `passive:46:hp scaled-${stat}`, originalId,
            sources, value: {
                baseValue,
                addedValue,
                proportionalMode,
            }, conditions: Object.assign({}, conditionInfo) }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('47', (effect, context, injectionContext) => {
        return parsePassiveWithNumericalValueRangeAndChance({
            effect,
            context,
            injectionContext,
            originalId: '47',
            effectKeyLow: 'bc fill on spark low',
            effectKeyHigh: 'bc fill on spark high',
            effectKeyChance: 'bc fill on spark%',
            buffKeyLow: 'fillLow',
            buffKeyHigh: 'fillHigh',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            buffId: 'passive:47:bc fill on spark',
        });
    });
    map.set('48', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'reduced bb bc cost%',
            buffId: 'passive:48:bc cost reduction',
            originalId: '48',
        });
    });
    map.set('49', (effect, context, injectionContext) => {
        return parsePassiveWithNumericalValueRangeAndChance({
            effect,
            context,
            injectionContext,
            originalId: '49',
            effectKeyLow: 'reduced bb bc use% low',
            effectKeyHigh: 'reduced bb bc use% high',
            effectKeyChance: 'reduced bb bc use chance%',
            buffKeyLow: 'reducedUseLow%',
            buffKeyHigh: 'reducedUseHigh%',
            buffId: 'passive:49:bb gauge consumption reduction',
        });
    });
    map.set('50', (effect, context, injectionContext) => {
        const originalId = '50';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let elements;
        let damageBoost = 0;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            damageBoost = parseNumberOrDefault(params[6]) * 100;
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
        }
        else {
            elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`${element} units do extra elemental weakness dmg`]);
            damageBoost = parseNumberOrDefault(typedEffect['elemental weakness multiplier%']);
        }
        let results = [];
        if (damageBoost !== 0) {
            results = elements.map((element) => (Object.assign({ id: `passive:50:elemental weakness damage-${element}`, originalId,
                sources, value: damageBoost, conditions: Object.assign({}, conditionInfo) }, targetData)));
            if (results.length === 0) {
                results.push(Object.assign({ id: 'passive:50:elemental weakness damage-unknown', originalId,
                    sources, value: damageBoost, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('53', (effect, context, injectionContext) => {
        const originalId = '53';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let ResistType;
        (function (ResistType) {
            ResistType["CriticalDamage"] = "critical damage";
            ResistType["ElementDamage"] = "element damage";
            ResistType["CriticalHitRate"] = "critical rate";
        })(ResistType || (ResistType = {}));
        const resistances = [];
        let unknownParams;
        if (typedEffect.params) {
            const [rawBaseCritDamageResist, rawBuffCritDamageResist, rawBaseElementDamageResist, rawBuffElementDamageResist, rawBaseCritChanceResist, rawBuffCritChanceResist, ...extraParams] = splitEffectParams(typedEffect);
            [
                { resistType: ResistType.CriticalDamage, base: parseNumberOrDefault(rawBaseCritDamageResist), buff: parseNumberOrDefault(rawBuffCritDamageResist) },
                { resistType: ResistType.ElementDamage, base: parseNumberOrDefault(rawBaseElementDamageResist), buff: parseNumberOrDefault(rawBuffElementDamageResist) },
                { resistType: ResistType.CriticalHitRate, base: parseNumberOrDefault(rawBaseCritChanceResist), buff: parseNumberOrDefault(rawBuffCritChanceResist) },
            ].forEach(({ resistType, base, buff }) => {
                if (base !== 0 || buff !== 0) {
                    resistances.push({ resistType, base, buff });
                }
            });
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            [
                { resistType: ResistType.CriticalDamage, baseKey: 'crit dmg base damage resist%', buffKey: 'crit dmg buffed damage resist%' },
                { resistType: ResistType.ElementDamage, baseKey: 'strong base element damage resist%', buffKey: 'strong buffed element damage resist%' },
                { resistType: ResistType.CriticalHitRate, baseKey: 'crit chance base resist%', buffKey: 'crit chance buffed resist%' },
            ].forEach(({ resistType, baseKey, buffKey }) => {
                const base = parseNumberOrDefault(typedEffect[baseKey]);
                const buff = parseNumberOrDefault(typedEffect[buffKey]);
                if (base !== 0 || buff !== 0) {
                    resistances.push({ resistType, base, buff });
                }
            });
        }
        const results = [];
        resistances.forEach(({ resistType, base, buff }) => {
            if (base !== 0) {
                results.push(Object.assign({ id: `passive:53:${resistType}-base`, originalId,
                    sources, value: base, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
            if (buff !== 0) {
                results.push(Object.assign({ id: `passive:53:${resistType}-buff`, originalId,
                    sources, value: buff, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('55', (effect, context, injectionContext) => {
        const originalId = '55';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            const triggeredBuffs = convertConditionalEffectToBuffsWithInjectionContext({
                id: params[0],
                params: params[1],
                turnDuration: parseNumberOrDefault(params[5]),
            }, context, injectionContext);
            const maxTriggerCount = parseNumberOrDefault(params[2]);
            const thresholdInfo = parseThresholdValuesFromParamsProperty(params[3], params[4], ThresholdType.Hp);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);
            if (triggeredBuffs.length > 0) {
                const thresholdConditions = getThresholdConditions(thresholdInfo);
                results.push(Object.assign({ id: 'passive:55:hp conditional', originalId,
                    sources, value: {
                        triggeredBuffs,
                        maxTriggerCount,
                    }, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('58', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'guard increase mitigation%',
            buffId: 'passive:58:guard mitigation',
            originalId: '58',
        });
    });
    map.set('59', (effect, context, injectionContext) => {
        const originalId = '59';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let percentFill, flatFill;
        let unknownParams;
        if (typedEffect.params) {
            const [rawPercentFill, rawFlatFill, ...extraParams] = splitEffectParams(typedEffect);
            percentFill = parseNumberOrDefault(rawPercentFill);
            flatFill = parseNumberOrDefault(rawFlatFill) / 100;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            percentFill = parseNumberOrDefault(typedEffect['bb gauge% filled when attacked while guarded']);
            flatFill = parseNumberOrDefault(typedEffect['bc filled when attacked while guarded']);
        }
        const results = [];
        if (percentFill !== 0) {
            results.push(Object.assign({ id: 'passive:59:bc fill when attacked on guard-percent', originalId,
                sources, value: percentFill, conditions: Object.assign(Object.assign({}, conditionInfo), { whenAttacked: true, onGuard: true }) }, targetData));
        }
        if (flatFill !== 0) {
            results.push(Object.assign({ id: 'passive:59:bc fill when attacked on guard-flat', originalId,
                sources, value: flatFill, conditions: Object.assign(Object.assign({}, conditionInfo), { whenAttacked: true, onGuard: true }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('61', (effect, context, injectionContext) => {
        const originalId = '61';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let percentFill, flatFill;
        let unknownParams;
        if (typedEffect.params) {
            const [rawPercentFill, rawFlatFill, ...extraParams] = splitEffectParams(typedEffect);
            percentFill = parseNumberOrDefault(rawPercentFill);
            flatFill = parseNumberOrDefault(rawFlatFill) / 100;
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            percentFill = parseNumberOrDefault(typedEffect['bb gauge% filled on guard']);
            flatFill = parseNumberOrDefault(typedEffect['bc filled on guard']);
        }
        const results = [];
        if (percentFill !== 0) {
            results.push(Object.assign({ id: 'passive:61:bc fill on guard-percent', originalId,
                sources, value: percentFill, conditions: Object.assign(Object.assign({}, conditionInfo), { onGuard: true }) }, targetData));
        }
        if (flatFill !== 0) {
            results.push(Object.assign({ id: 'passive:61:bc fill on guard-flat', originalId,
                sources, value: flatFill, conditions: Object.assign(Object.assign({}, conditionInfo), { onGuard: true }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('62', (effect, context, injectionContext) => {
        const originalId = '62';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let elements;
        let mitigation = 0;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            mitigation = parseNumberOrDefault(params[6]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
        }
        else {
            elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`mitigate ${element} attacks`]);
            mitigation = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks']);
        }
        let results = [];
        if (mitigation !== 0) {
            results = elements.map((element) => (Object.assign({ id: `passive:62:mitigate-${element}`, originalId,
                sources, value: mitigation, conditions: Object.assign({}, conditionInfo) }, targetData)));
            if (results.length === 0) {
                results.push(Object.assign({ id: 'passive:62:mitigate-unknown', originalId,
                    sources, value: mitigation, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('63', (effect, context, injectionContext) => {
        const originalId = '63';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let elements;
        let mitigation = 0, turnDuration = 0;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            mitigation = parseNumberOrDefault(params[6]);
            turnDuration = parseNumberOrDefault(params[7]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`mitigate ${element} attacks`]);
            mitigation = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks']);
            turnDuration = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks buff for first x turns']);
        }
        let results = [];
        if (mitigation !== 0) {
            results = elements.map((element) => (Object.assign({ id: `passive:63:first turn mitigate-${element}`, originalId,
                sources, duration: turnDuration, value: mitigation, conditions: Object.assign({}, conditionInfo) }, targetData)));
            if (results.length === 0) {
                results.push(Object.assign({ id: 'passive:63:first turn mitigate-unknown', originalId,
                    sources, duration: turnDuration, value: mitigation, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('64', (effect, context, injectionContext) => {
        const originalId = '64';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let bb = 0, sbb = 0, ubb = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawBb, rawSbb, rawUbb, ...extraParams] = splitEffectParams(typedEffect);
            bb = parseNumberOrDefault(rawBb);
            sbb = parseNumberOrDefault(rawSbb);
            ubb = parseNumberOrDefault(rawUbb);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            bb = parseNumberOrDefault(typedEffect['bb atk% buff']);
            sbb = parseNumberOrDefault(typedEffect['sbb atk% buff']);
            ubb = parseNumberOrDefault(typedEffect['ubb atk% buff']);
        }
        const results = [];
        if (bb !== 0) {
            results.push(Object.assign({ id: 'passive:64:attack boost-bb', originalId,
                sources, conditions: Object.assign({}, conditionInfo), value: bb }, targetData));
        }
        if (sbb !== 0) {
            results.push(Object.assign({ id: 'passive:64:attack boost-sbb', originalId,
                sources, conditions: Object.assign({}, conditionInfo), value: sbb }, targetData));
        }
        if (ubb !== 0) {
            results.push(Object.assign({ id: 'passive:64:attack boost-ubb', originalId,
                sources, conditions: Object.assign({}, conditionInfo), value: ubb }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('65', (effect, context, injectionContext) => {
        return parsePassiveWithNumericalValueRangeAndChance({
            effect,
            context,
            injectionContext,
            originalId: '65',
            effectKeyLow: 'bc fill on crit min',
            effectKeyHigh: 'bc fill on crit max',
            effectKeyChance: 'bc fill on crit%',
            buffKeyLow: 'fillLow',
            buffKeyHigh: 'fillHigh',
            parseParamValue: (rawValue) => parseNumberOrDefault(rawValue) / 100,
            generateBaseConditions: () => ({ onCriticalHit: true }),
            buffId: 'passive:65:bc fill on crit',
        });
    });
    map.set('66', (effect, context, injectionContext) => {
        const originalId = '66';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let triggeredBuffs = [];
        let triggerOnBb = false, triggerOnSbb = false, triggerOnUbb = false;
        let unknownParams;
        if (typedEffect.params) {
            const [rawProcIds, rawParams = '', rawTargetTypes = '', rawTargetAreas = '', rawStartFrames = '', rawTriggerOnBb, rawTriggerOnSbb, rawTriggerOnUbb, ...extraParams] = splitEffectParams(typedEffect);
            const allProcIds = rawProcIds.split('~');
            const allProcParams = rawParams.split('~');
            const allTargetTypes = rawTargetTypes.split('~');
            const allTargetAreas = rawTargetAreas.split('~');
            const allStartFrames = rawStartFrames.split('~');
            const FRAME_IN_MS = (16 + (2 / 3));
            allProcIds.forEach((procId, index) => {
                const params = (allProcParams[index] || '').replace(/&/g, ',');
                const targetType = allTargetTypes[index];
                const targetArea = allTargetAreas[index];
                const startFrame = parseNumberOrDefault(allStartFrames[index]);
                const effectDelayInMs = (startFrame * FRAME_IN_MS).toFixed(1);
                const procEffect = {
                    'proc id': procId,
                    params,
                    'effect delay time(ms)/frame': `${effectDelayInMs}/${startFrame}`,
                    'target area': TARGET_AREA_MAPPING[targetArea] || targetArea || 'unknown target area',
                    'target type': TARGET_TYPE_MAPPING[targetType] || targetType || 'unknown target type',
                };
                const procBuffs = convertProcEffectToBuffsWithInjectionContext(procEffect, context, injectionContext);
                triggeredBuffs = triggeredBuffs.concat(procBuffs);
            });
            triggerOnBb = rawTriggerOnBb === '1';
            triggerOnSbb = rawTriggerOnSbb === '1';
            triggerOnUbb = rawTriggerOnUbb === '1';
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            const triggeredEffects = typedEffect['triggered effect'];
            if (Array.isArray(triggeredEffects)) {
                triggeredEffects.forEach((procEffect) => {
                    const procBuffs = convertProcEffectToBuffsWithInjectionContext(procEffect, context, injectionContext);
                    triggeredBuffs = triggeredBuffs.concat(procBuffs);
                });
            }
            triggerOnBb = !!typedEffect['trigger on bb'];
            triggerOnSbb = !!typedEffect['trigger on sbb'];
            triggerOnUbb = !!typedEffect['trigger on ubb'];
        }
        const results = [];
        if ((triggerOnBb || triggerOnSbb || triggerOnUbb) && triggeredBuffs.length > 0) {
            const addBuffOfBurstType = (burstType) => {
                results.push(Object.assign({ id: `passive:66:add effect to skill-${burstType}`, originalId,
                    sources, value: triggeredBuffs, conditions: Object.assign({}, conditionInfo) }, targetData));
            };
            if (triggerOnBb) {
                addBuffOfBurstType('bb');
            }
            if (triggerOnSbb) {
                addBuffOfBurstType('sbb');
            }
            if (triggerOnUbb) {
                addBuffOfBurstType('ubb');
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('69', (effect, context, injectionContext) => {
        const originalId = '69';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let recoveredHp = 0, maxCount = 0;
        let chanceLow = 0, chanceHigh = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawRecoveredHp, rawMaxCount, rawChanceLow, rawChanceHigh, ...extraParams] = splitEffectParams(typedEffect);
            recoveredHp = parseNumberOrDefault(rawRecoveredHp);
            maxCount = parseNumberOrDefault(rawMaxCount);
            chanceLow = parseNumberOrDefault(rawChanceLow);
            chanceHigh = parseNumberOrDefault(rawChanceHigh);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
        }
        else {
            recoveredHp = parseNumberOrDefault(typedEffect['angel idol recover hp%']);
            maxCount = parseNumberOrDefault(typedEffect['angel idol recover counts']);
            chanceLow = parseNumberOrDefault(typedEffect['angel idol recover chance% low']);
            chanceHigh = parseNumberOrDefault(typedEffect['angel idol recover chance% high']);
        }
        const results = [];
        if (chanceLow !== 0 || chanceHigh !== 0) {
            results.push(Object.assign({ id: 'passive:69:chance ko resistance', originalId,
                sources, value: {
                    'recoveredHp%': recoveredHp,
                    maxCount,
                    chanceLow,
                    chanceHigh,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('70', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'od fill rate%',
            buffId: 'passive:70:od fill rate',
            originalId: '70',
        });
    });
    map.set('71', (effect, context, injectionContext) => {
        const originalId = '71';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const inflictionChances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('counter inflict'));
            AILMENTS_ORDER.forEach((ailment) => {
                const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
                if (correspondingKey) {
                    inflictionChances[ailment] = typedEffect[correspondingKey];
                }
            });
        }
        const results = [];
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(inflictionChances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:71:inflict on hit-${ailment}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('72', (effect, context, injectionContext) => {
        const originalId = '72';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const [rawHpAtTurnStart, rawBcAtTurnStart, ...extraParams] = splitEffectWithUnknownPassiveParamsProperty(effect);
        const hpAtTurnStart = rawHpAtTurnStart === '1';
        const bcAtTurnStart = rawBcAtTurnStart === '1';
        const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        const results = [];
        if (hpAtTurnStart) {
            results.push(Object.assign({ id: 'passive:72:effect at turn start-hp', originalId,
                sources, value: true, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        if (bcAtTurnStart) {
            results.push(Object.assign({ id: 'passive:72:effect at turn start-bc', originalId,
                sources, value: true, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('73', (effect, context, injectionContext) => {
        const originalId = '73';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis, Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
        const results = [];
        const resistances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
            'atk down': '0',
            'def down': '0',
            'rec down': '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, resistances['atk down'], resistances['def down'], resistances['rec down'], ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
        }
        else {
            AILMENTS_ORDER.forEach((ailment) => {
                const effectKey = ailment !== 'weak' ? ailment : 'weaken';
                resistances[ailment] = typedEffect[`${effectKey} resist%`];
            });
        }
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(resistances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:73:resist-${ailment}`, originalId,
                    sources,
                    value, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('74', (effect, context, injectionContext) => {
        const originalId = '74';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let requiredAilments, attackBoost = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawRequiredAilments, rawBoost, ...extraParams] = splitEffectParams(typedEffect);
            requiredAilments = rawRequiredAilments.split('&')
                .filter((p) => p !== '0')
                .map((p) => AILMENT_MAPPING[p] || Ailment.Unknown);
            attackBoost = parseNumberOrDefault(rawBoost);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(typedEffect).filter((k) => (typedEffect[k] === true) && k.startsWith('atk% buff when enemy has'));
            requiredAilments = AILMENTS_ORDER.filter((ailment) => ailmentKeysInEffect.find((k) => k.includes(ailment)));
            attackBoost = parseNumberOrDefault(typedEffect['atk% buff when enemy has ailment']);
        }
        const results = [];
        if (attackBoost !== 0) {
            results.push(Object.assign({ id: 'passive:74:ailment attack boost', originalId,
                sources, value: attackBoost, conditions: Object.assign(Object.assign({}, conditionInfo), { targetHasAnyOfGivenAilments: requiredAilments }) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('75', (effect, context, injectionContext) => {
        const originalId = '75';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let damageIncrease = 0, chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(typedEffect);
            damageIncrease = parseNumberOrDefault(rawDamageIncrease);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        else {
            damageIncrease = parseNumberOrDefault(typedEffect['spark debuff%']);
            chance = parseNumberOrDefault(typedEffect['spark debuff chance%']);
            turnDuration = parseNumberOrDefault(typedEffect['spark debuff turns']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'passive:75:spark vulnerability', originalId,
                sources, duration: turnDuration, value: { 'sparkDamage%': damageIncrease, chance }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('77', (effect, context, injectionContext) => {
        const originalId = '77';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let baseResist = 0, buffResist = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawBaseResist, rawBuffResist, ...extraParams] = splitEffectParams(typedEffect);
            baseResist = parseNumberOrDefault(rawBaseResist);
            buffResist = parseNumberOrDefault(rawBuffResist);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            baseResist = parseNumberOrDefault(typedEffect['base spark dmg% resist']);
            buffResist = parseNumberOrDefault(typedEffect['buff spark dmg% resist']);
        }
        const results = [];
        if (baseResist !== 0) {
            results.push(Object.assign({ id: 'passive:77:spark damage reduction-base', originalId,
                sources, value: baseResist, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        if (buffResist !== 0) {
            results.push(Object.assign({ id: 'passive:77:spark damage reduction-buff', originalId,
                sources, value: buffResist, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('78', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '78',
            buffId: 'passive:78:damage taken conditional',
            thresholdType: ThresholdType.DamageTaken,
        });
    });
    map.set('79', (effect, context, injectionContext) => {
        return parseConditionalBcFillWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '79',
            thresholdType: ThresholdType.DamageTaken,
            flatFillBuffId: 'passive:79:bc fill after damage taken conditional-flat',
            percentFillBuffId: 'passive:79:bc fill after damage taken conditional-percent',
            flatFillEffectKey: 'increase bb gauge',
        });
    });
    map.set('80', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '80',
            buffId: 'passive:80:damage dealt conditional',
            thresholdType: ThresholdType.DamageDealt,
        });
    });
    map.set('81', (effect, context, injectionContext) => {
        return parseConditionalBcFillWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '81',
            thresholdType: ThresholdType.DamageDealt,
            flatFillBuffId: 'passive:81:bc fill after damage dealt conditional-flat',
            percentFillBuffId: 'passive:81:bc fill after damage dealt conditional-percent',
            flatFillEffectKey: 'increase bb gauge',
        });
    });
    map.set('82', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '82',
            buffId: 'passive:82:bc received conditional',
            thresholdType: ThresholdType.BcReceived,
        });
    });
    map.set('83', (effect, context, injectionContext) => {
        return parseConditionalBcFillWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '83',
            thresholdType: ThresholdType.BcReceived,
            flatFillBuffId: 'passive:83:bc fill after bc received conditional-flat',
            percentFillBuffId: 'passive:83:bc fill after bc received conditional-percent',
            flatFillEffectKey: 'increase bb gauge',
        });
    });
    map.set('84', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '84',
            buffId: 'passive:84:hc received conditional',
            thresholdType: ThresholdType.HcReceived,
        });
    });
    map.set('85', (effect, context, injectionContext) => {
        return parseConditionalBcFillWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '85',
            thresholdType: ThresholdType.HcReceived,
            flatFillBuffId: 'passive:85:bc fill after hc received conditional-flat',
            percentFillBuffId: 'passive:85:bc fill after hc received conditional-percent',
            flatFillEffectKey: 'increase bb gauge',
        });
    });
    map.set('86', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '86',
            buffId: 'passive:86:spark count conditional',
            thresholdType: ThresholdType.SparkCount,
        });
    });
    map.set('87', (effect, context, injectionContext) => {
        return parseConditionalBcFillWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '87',
            thresholdType: ThresholdType.SparkCount,
            flatFillBuffId: 'passive:87:bc fill after spark count conditional-flat',
            percentFillBuffId: 'passive:87:bc fill after spark count conditional-percent',
            flatFillEffectKey: 'increase bb gauge',
        });
    });
    map.set('88', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '88',
            buffId: 'passive:88:on guard conditional',
            thresholdType: ThresholdType.ChanceGuard,
        });
    });
    map.set('89', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '89',
            buffId: 'passive:89:on critical hit conditional',
            thresholdType: ThresholdType.ChanceCrit,
        });
    });
    map.set('90', (effect, context, injectionContext) => {
        const originalId = '90';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const inflictionChances = {
            poison: '0',
            weak: '0',
            sick: '0',
            injury: '0',
            curse: '0',
            paralysis: '0',
        };
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            [inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
        }
        else {
            const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('inflict'));
            AILMENTS_ORDER.forEach((ailment) => {
                const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
                if (correspondingKey) {
                    inflictionChances[ailment] = typedEffect[correspondingKey];
                }
            });
        }
        const results = [];
        AILMENTS_ORDER.forEach((ailment) => {
            const value = parseNumberOrDefault(inflictionChances[ailment]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:90:inflict on crit-${ailment}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), { onCriticalHit: true }) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('91', (effect, context, injectionContext) => {
        const originalId = '91';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let value = 0, turnDuration = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [firstUnknownValue, rawValue, rawTurnDuration, ...extraParams] = splitEffectParams(typedEffect);
            value = parseNumberOrDefault(rawValue);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams([firstUnknownValue, '0', '0'].concat(extraParams), 0, injectionContext);
        }
        const results = [];
        if (value !== 0) {
            results.push(Object.assign({ id: 'passive:91:first turn spark', originalId,
                sources, duration: turnDuration, value, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('92', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'ignore def resist chance%',
            buffId: 'passive:92:negate defense ignore',
            originalId: '92',
        });
    });
    map.set('93', (effect, context, injectionContext) => {
        const originalId = '93';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let elements = [];
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            // is last parameter turn duration, where -1 is lasting indefinitely?
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);
        }
        const results = elements.map((element) => (Object.assign({ id: `passive:93:add element-${element}`, originalId,
            sources, value: true, conditions: Object.assign({}, conditionInfo) }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('96', (effect, context, injectionContext) => {
        const originalId = '96';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let damageIncrease = 0, chance = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawDamageIncrease, rawChance, ...extraParams] = splitEffectParams(typedEffect);
            damageIncrease = parseNumberOrDefault(rawDamageIncrease);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            damageIncrease = parseNumberOrDefault(typedEffect['aoe atk inc%']);
            chance = parseNumberOrDefault(typedEffect['chance to aoe']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'passive:96:aoe normal attack', originalId,
                sources, value: { 'damageModifier%': damageIncrease, chance }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('97', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'xp gained increase%',
            buffId: 'passive:97:player exp boost',
            originalId: '97',
        });
    });
    map.set('100', (effect, context, injectionContext) => {
        const originalId = '100';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let sparkDamage = 0, chance = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawChance, rawSparkDamage, ...extraParams] = splitEffectParams(typedEffect);
            chance = parseNumberOrDefault(rawChance);
            sparkDamage = parseNumberOrDefault(rawSparkDamage);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            chance = parseNumberOrDefault(typedEffect['spark crit chance%']);
            sparkDamage = parseNumberOrDefault(typedEffect['spark crit dmg%']);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'passive:100:spark critical', originalId,
                sources, value: { 'sparkDamage%': sparkDamage, chance }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('101', (effect, context, injectionContext) => {
        return parsePassiveWithNumericalValueRangeAndChance({
            effect,
            context,
            injectionContext,
            originalId: '101',
            effectKeyLow: 'heal on spark low',
            effectKeyHigh: 'heal on spark high',
            effectKeyChance: 'heal on spark%',
            buffKeyLow: 'healLow',
            buffKeyHigh: 'healHigh',
            buffId: 'passive:101:heal on spark',
        });
    });
    map.set('102', (effect, context, injectionContext) => {
        const originalId = '102';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let elements = [];
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            elements = params.filter((value, index) => value !== '0' && index < 6)
                .map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);
        }
        const results = elements.map((element) => (Object.assign({ id: `passive:102:add element-${element}`, originalId,
            sources, value: true, conditions: Object.assign({}, conditionInfo) }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('103', (effect, context, injectionContext) => {
        const originalId = '103';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        const boosts = {
            bb: '0',
            sbb: '0',
            ubb: '0',
        };
        const BOOST_ORDER = ['bb', 'sbb', 'ubb'];
        let thresholdInfo;
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let rawRequireAboveFlag;
            let rawThreshold;
            [boosts.bb, boosts.sbb, boosts.ubb, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
            thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        else {
            boosts.bb = typedEffect['bb atk% add'];
            boosts.sbb = typedEffect['sbb atk% add'];
            boosts.ubb = typedEffect['ubb atk% add'];
            // not using existing effect threshold parsing functions because this is
            // is parsed differently for some reason
            thresholdInfo = {
                threshold: parseNumberOrDefault(typedEffect['hp threshold']),
                requireAbove: typedEffect['triggered when hp'] === 'higher',
                type: ThresholdType.Hp,
            };
        }
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        BOOST_ORDER.forEach((boost) => {
            const value = parseNumberOrDefault(boosts[boost]);
            if (value !== 0) {
                const entry = Object.assign({ id: `passive:103:hp conditional attack boost-${boost}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData);
                results.push(entry);
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('104', (effect, context, injectionContext) => {
        const originalId = '104';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const dropRates = {
            bc: '0',
            hc: '0',
            item: '0',
            zel: '0',
            karma: '0',
        };
        let sparkDamageBoost = 0;
        let thresholdInfo;
        let unknownParams;
        if (typedEffect.params) {
            let extraParams;
            let rawSparkDamageBoost;
            let rawRequireAboveFlag;
            let rawThreshold;
            [rawSparkDamageBoost, dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
            sparkDamageBoost = parseNumberOrDefault(rawSparkDamageBoost);
            thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
        }
        else {
            sparkDamageBoost = parseNumberOrDefault(typedEffect['damage% for spark']);
            DROP_TYPES_ORDER.forEach((dropType) => {
                dropRates[dropType] = typedEffect[`${dropType} drop% for spark`];
            });
            thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
        }
        const thresholdConditions = getThresholdConditions(thresholdInfo);
        const results = [];
        if (sparkDamageBoost !== 0) {
            results.push(Object.assign({ id: 'passive:104:hp conditional spark-damage', originalId,
                sources, value: sparkDamageBoost, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
        }
        DROP_TYPES_ORDER.forEach((dropType) => {
            const value = parseNumberOrDefault(dropRates[dropType]);
            if (value !== 0) {
                results.push(Object.assign({ id: `passive:104:hp conditional spark-${dropType}`, originalId,
                    sources,
                    value, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
            }
        });
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('105', (effect, context, injectionContext) => {
        const originalId = '105';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const availableStats = ['atk', 'def', 'rec'];
        const stats = [];
        let turnCount;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            const scaleLowToHigh = params[6] === '1';
            availableStats.forEach((stat, index) => {
                const minValue = parseNumberOrDefault(params[index * 2]);
                const maxValue = parseNumberOrDefault(params[(index * 2) + 1]);
                if (minValue !== 0 || maxValue !== 0) {
                    stats.push({
                        stat,
                        startingValue: scaleLowToHigh ? minValue : maxValue,
                        endingValue: scaleLowToHigh ? maxValue : minValue,
                    });
                }
            });
            turnCount = parseNumberOrDefault(params[7]);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
        }
        else {
            const scaleLowToHigh = 'increase from min to max' in typedEffect;
            availableStats.forEach((stat) => {
                const minValue = parseNumberOrDefault(typedEffect[`${stat}% min buff`]);
                const maxValue = parseNumberOrDefault(typedEffect[`${stat}% max buff`]);
                if (minValue !== 0 || maxValue !== 0) {
                    stats.push({
                        stat,
                        startingValue: scaleLowToHigh ? minValue : maxValue,
                        endingValue: scaleLowToHigh ? maxValue : minValue,
                    });
                }
            });
            turnCount = parseNumberOrDefault(typedEffect['turn count']);
        }
        const results = stats.map(({ stat, startingValue, endingValue }) => (Object.assign({ id: `passive:105:turn scaled-${stat}`, originalId,
            sources, value: {
                'startingValue%': startingValue,
                'endingValue%': endingValue,
                turnCount,
            }, conditions: Object.assign({}, conditionInfo) }, targetData)));
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('106', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '106',
            buffId: 'passive:106:on overdrive conditional',
            thresholdType: ThresholdType.ChanceOverDrive,
        });
    });
    map.set('107', (effect, context, injectionContext) => {
        const originalId = '107';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let unknownParams;
        if (typedEffect.params) {
            const [addedPassiveId, addedPassiveParams = '', ...extraParams] = splitEffectParams(typedEffect);
            const addedPassiveAsEffect = {
                'passive id': addedPassiveId,
                params: addedPassiveParams.split('$').join(','),
            };
            const addedPassiveContext = Object.assign(Object.assign({}, context), { source: BuffSource.LeaderSkill });
            const addedBuffs = convertPassiveEffectToBuffs(addedPassiveAsEffect, addedPassiveContext);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
            if (addedBuffs.length > 0) {
                results.push(Object.assign({ id: 'passive:107:add effect to leader skill', originalId,
                    sources, value: addedBuffs, conditions: Object.assign({}, conditionInfo) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('109', (effect, context, injectionContext) => {
        const originalId = '109';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let efficacyChange = 0, chance = 0;
        let turnDuration = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(typedEffect);
            efficacyChange = parseNumberOrDefault(rawDamageIncrease);
            chance = parseNumberOrDefault(rawChance);
            turnDuration = parseNumberOrDefault(rawTurnDuration);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'passive:109:bc efficacy reduction', originalId,
                sources, duration: turnDuration, value: { 'efficacyChange%': efficacyChange, chance }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('110', (effect, context, injectionContext) => {
        const originalId = '110';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let flatDrainLow = 0, flatDrainHigh = 0;
        let percentDrainLow = 0, percentDrainHigh = 0;
        let chance = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawFlatDrainLow, rawFlatDrainHigh, rawPercentDrainLow, rawPercentDrainHigh, rawChance, ...extraParams] = splitEffectParams(typedEffect);
            flatDrainLow = parseNumberOrDefault(rawFlatDrainLow) / 100;
            flatDrainHigh = parseNumberOrDefault(rawFlatDrainHigh) / 100;
            percentDrainLow = parseNumberOrDefault(rawPercentDrainLow);
            percentDrainHigh = parseNumberOrDefault(rawPercentDrainHigh);
            chance = parseNumberOrDefault(rawChance);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
        }
        const results = [];
        if (flatDrainLow !== 0 || flatDrainHigh !== 0) {
            results.push(Object.assign({ id: 'passive:110:bc drain-flat', originalId,
                sources, value: {
                    drainLow: flatDrainLow,
                    drainHigh: flatDrainHigh,
                    chance,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        if (percentDrainLow !== 0 || percentDrainHigh !== 0) {
            results.push(Object.assign({ id: 'passive:110:bc drain-percent', originalId,
                sources, value: {
                    drainLow: percentDrainLow,
                    drainHigh: percentDrainHigh,
                    chance,
                }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('111', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'increase skill activation in arena%',
            buffId: 'passive:111:skill activation rate boost',
            originalId: '111',
        });
    });
    map.set('112', (effect, context, injectionContext) => {
        const originalId = '112';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let abp, cbp;
        let unknownParams;
        if (typedEffect.params) {
            const [rawAbp, rawCbp, ...extraParams] = splitEffectParams(typedEffect);
            abp = parseNumberOrDefault(rawAbp);
            cbp = parseNumberOrDefault(rawCbp);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        else {
            abp = parseNumberOrDefault(typedEffect['abp gain%']);
            cbp = parseNumberOrDefault(typedEffect['cbp gain%']);
        }
        const results = [];
        if (abp !== 0) {
            results.push(Object.assign({ id: 'passive:112:point gain boost-arena', originalId,
                sources, value: abp, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        if (cbp !== 0) {
            results.push(Object.assign({ id: 'passive:112:point gain boost-colo', originalId,
                sources, value: cbp, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('113', (effect, context, injectionContext) => {
        const originalId = '113';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            const triggeredBuffs = convertConditionalEffectToBuffsWithInjectionContext({
                id: params[0],
                params: params[1],
                turnDuration: -1,
            }, context, injectionContext);
            const maxTriggerCount = -1;
            const thresholdInfo = parseThresholdValuesFromParamsProperty(params[2], params[3], ThresholdType.Hp);
            unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(4), 4, injectionContext);
            if (triggeredBuffs.length > 0) {
                const thresholdConditions = getThresholdConditions(thresholdInfo);
                results.push(Object.assign({ id: 'passive:113:hp conditional', originalId,
                    sources, value: {
                        triggeredBuffs,
                        maxTriggerCount,
                    }, conditions: Object.assign(Object.assign({}, conditionInfo), thresholdConditions) }, targetData));
            }
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('114', (effect, context, injectionContext) => {
        return parseConditionalPassiveWithSingleNumericalCondition({
            effect,
            context,
            injectionContext,
            originalId: '114',
            buffId: 'passive:114:when attacked conditional',
            thresholdType: ThresholdType.ChanceWhenAttacked,
            modifyConditionalEffect: (effect) => { effect.targetType = TargetType.Enemy; },
        });
    });
    map.set('127', (effect, context, injectionContext) => {
        const originalId = '127';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        const results = [];
        let reduction = 0;
        let unknownParams;
        if (typedEffect.params) {
            const params = splitEffectParams(typedEffect);
            reduction = parseNumberOrDefault(params[1]);
            unknownParams = createUnknownParamsEntryFromExtraParams([params[0], '0'].concat(params.slice(2)), 0, injectionContext);
        }
        if (reduction !== 0) {
            results.push(Object.assign({ id: 'passive:127:damage over time reduction', originalId,
                sources, value: reduction, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('128', (effect, context, injectionContext) => {
        const originalId = '128';
        const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
        const typedEffect = effect;
        let normalAttackMitigation = 0, chance = 0;
        let unknownParams;
        if (typedEffect.params) {
            const [rawChance, rawNormalAttackMitigation, ...extraParams] = splitEffectParams(typedEffect);
            chance = parseNumberOrDefault(rawChance);
            normalAttackMitigation = parseNumberOrDefault(rawNormalAttackMitigation);
            unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
        }
        const results = [];
        if (chance !== 0) {
            results.push(Object.assign({ id: 'passive:128:normal attack mitigation', originalId,
                sources, value: { 'mitigation%': normalAttackMitigation, chance }, conditions: Object.assign({}, conditionInfo) }, targetData));
        }
        handlePostParse(results, unknownParams, {
            originalId,
            sources,
            targetData,
            conditionInfo,
        });
        return results;
    });
    map.set('143', (effect, context, injectionContext) => {
        return parsePassiveWithSingleNumericalParameter({
            effect,
            context,
            injectionContext,
            effectKey: 'increase atk cap',
            buffId: 'passive:143:atk limit break',
            originalId: '143',
        });
    });
}

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given passive effect.
 */
function defaultConversionFunction(effect, context) {
    const id = (isPassiveEffect(effect) && getEffectId(effect)) || KNOWN_PASSIVE_ID.Unknown;
    return [{
            id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
            originalId: id,
            sources: createSourcesFromContext(context),
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
    const id = (isPassiveEffect(effect) && getEffectId(effect));
    const conversionFunction = (id && getPassiveEffectToBuffMapping(context.reloadMapping, convertPassiveEffectToBuffs).get(id));
    // TODO: warning if result is empty?
    return typeof conversionFunction === 'function'
        ? conversionFunction(effect, context)
        : defaultConversionFunction(effect, context);
}

const BUFF_METADATA = Object.freeze(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ TURN_DURATION_MODIFICATION: {
        id: BuffId.TURN_DURATION_MODIFICATION,
        name: 'Passive Turn Duration Modification',
        stat: UnitStat.turnDurationModification,
        stackType: BuffStackType.Passive,
        icons: (buff) => [
            (buff && buff.value &&
                buff.value.duration &&
                buff.value.duration < 0) ?
                IconId.TURN_DURATION_DOWN : IconId.TURN_DURATION_UP
        ],
    }, NO_PARAMS_SPECIFIED: {
        id: BuffId.NO_PARAMS_SPECIFIED,
        name: 'No Parameters Specified',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, UNKNOWN_PASSIVE_EFFECT_ID: {
        id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
        name: 'Unknown Passive Effect',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, UNKNOWN_PASSIVE_BUFF_PARAMS: {
        id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
        name: 'Unknown Passive Buff Parameters',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, 'passive:1:hp': {
        id: BuffId['passive:1:hp'],
        name: 'Passive HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP],
    }, 'passive:1:atk': {
        id: BuffId['passive:1:atk'],
        name: 'Passive Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
    }, 'passive:1:def': {
        id: BuffId['passive:1:def'],
        name: 'Passive Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
    }, 'passive:1:rec': {
        id: BuffId['passive:1:rec'],
        name: 'Passive Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
    }, 'passive:1:crit': {
        id: BuffId['passive:1:crit'],
        name: 'Passive Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
    } }, (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'passive:2:elemental-hp': {
            id: BuffId['passive:2:elemental-hp'],
            name: 'Passive Elemental HP Boost',
            stat: UnitStat.hp,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('HP'),
        },
        'passive:2:elemental-atk': {
            id: BuffId['passive:2:elemental-atk'],
            name: 'Passive Elemental Attack Boost',
            stat: UnitStat.atk,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('ATK'),
        },
        'passive:2:elemental-def': {
            id: BuffId['passive:2:elemental-def'],
            name: 'Passive Elemental Defense Boost',
            stat: UnitStat.def,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('DEF'),
        },
        'passive:2:elemental-rec': {
            id: BuffId['passive:2:elemental-rec'],
            name: 'Passive Elemental Recovery Boost',
            stat: UnitStat.rec,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('REC'),
        },
        'passive:2:elemental-crit': {
            id: BuffId['passive:2:elemental-crit'],
            name: 'Passive Elemental Critical Hit Rate Boost',
            stat: UnitStat.crit,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('CRTRATE'),
        },
    };
})()), (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'passive:3:type based-hp': {
            id: BuffId['passive:3:type based-hp'],
            name: 'Passive Type-Based HP Boost',
            stat: UnitStat.hp,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('HP'),
        },
        'passive:3:type based-atk': {
            id: BuffId['passive:3:type based-atk'],
            name: 'Passive Type-Based Attack Boost',
            stat: UnitStat.atk,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('ATK'),
        },
        'passive:3:type based-def': {
            id: BuffId['passive:3:type based-def'],
            name: 'Passive Type-Based Defense Boost',
            stat: UnitStat.def,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('DEF'),
        },
        'passive:3:type based-rec': {
            id: BuffId['passive:3:type based-rec'],
            name: 'Passive Type-Based Recovery Boost',
            stat: UnitStat.rec,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('REC'),
        },
        'passive:3:type based-crit': {
            id: BuffId['passive:3:type based-crit'],
            name: 'Passive Type-Based Critical Hit Rate Boost',
            stat: UnitStat.crit,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('CRTRATE'),
        },
    };
})()), { 'passive:4:resist-poison': {
        id: BuffId['passive:4:resist-poison'],
        name: 'Passive Poison Resistance',
        stat: UnitStat.poisonResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_POISONBLK],
    }, 'passive:4:resist-weak': {
        id: BuffId['passive:4:resist-weak'],
        name: 'Passive Weak Resistance',
        stat: UnitStat.weakResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WEAKBLK],
    }, 'passive:4:resist-sick': {
        id: BuffId['passive:4:resist-sick'],
        name: 'Passive Sick Resistance',
        stat: UnitStat.sickResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SICKBLK],
    }, 'passive:4:resist-injury': {
        id: BuffId['passive:4:resist-injury'],
        name: 'Passive Injury Resistance',
        stat: UnitStat.injuryResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_INJURYBLK],
    }, 'passive:4:resist-curse': {
        id: BuffId['passive:4:resist-curse'],
        name: 'Passive Curse Resistance',
        stat: UnitStat.curseResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CURSEBLK],
    }, 'passive:4:resist-paralysis': {
        id: BuffId['passive:4:resist-paralysis'],
        name: 'Passive Paralysis Resistance',
        stat: UnitStat.paralysisResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_PARALYSISBLK],
    }, 'passive:5:mitigate-fire': {
        id: BuffId['passive:5:mitigate-fire'],
        name: 'Passive Fire Damage Reduction',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'passive:5:mitigate-water': {
        id: BuffId['passive:5:mitigate-water'],
        name: 'Passive Water Damage Reduction',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'passive:5:mitigate-earth': {
        id: BuffId['passive:5:mitigate-earth'],
        name: 'Passive Earth Damage Reduction',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'passive:5:mitigate-thunder': {
        id: BuffId['passive:5:mitigate-thunder'],
        name: 'Passive Thunder Damage Reduction',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'passive:5:mitigate-light': {
        id: BuffId['passive:5:mitigate-light'],
        name: 'Passive Light Damage Reduction',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'passive:5:mitigate-dark': {
        id: BuffId['passive:5:mitigate-dark'],
        name: 'Passive Dark Damage Reduction',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'passive:5:mitigate-unknown': {
        id: BuffId['passive:5:mitigate-unknown'],
        name: 'Passive Elemental Damage Reduction (Unspecified Element)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'passive:8:mitigation': {
        id: BuffId['passive:8:mitigation'],
        name: 'Passive Damage Reduction',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGECUT],
    }, 'passive:9:gradual bc fill': {
        id: BuffId['passive:9:gradual bc fill'],
        name: 'Passive Gradual BC Fill',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:10:hc efficacy': {
        id: BuffId['passive:10:hc efficacy'],
        name: 'Passive HC Efficacy',
        stat: UnitStat.hcEfficacy,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HCREC],
    }, 'passive:11:hp conditional-atk': {
        id: BuffId['passive:11:hp conditional-atk'],
        name: 'Passive HP-Conditional Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHATKDOWN : IconId.BUFF_HPTHRESHATKUP],
    }, 'passive:11:hp conditional-def': {
        id: BuffId['passive:11:hp conditional-def'],
        name: 'Passive HP-Conditional Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHDEFDOWN : IconId.BUFF_HPTHRESHDEFUP],
    }, 'passive:11:hp conditional-rec': {
        id: BuffId['passive:11:hp conditional-rec'],
        name: 'Passive HP-Conditional Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHRECDOWN : IconId.BUFF_HPTHRESHRECUP],
    }, 'passive:11:hp conditional-crit': {
        id: BuffId['passive:11:hp conditional-crit'],
        name: 'Passive HP-Conditional Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHCRTRATEDOWN : IconId.BUFF_HPTHRESHCRTRATEUP],
    }, 'passive:12:hp conditional drop boost-bc': {
        id: BuffId['passive:12:hp conditional drop boost-bc'],
        name: 'Passive HP-Conditional Battle Crystal Drop Rate Boost',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHBCDOWN : IconId.BUFF_HPTHRESHBCDROP],
    }, 'passive:12:hp conditional drop boost-hc': {
        id: BuffId['passive:12:hp conditional drop boost-hc'],
        name: 'Passive HP-Conditional Heart Crystal Drop Rate Boost',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHHCDOWN : IconId.BUFF_HPTHRESHHCDROP],
    }, 'passive:12:hp conditional drop boost-item': {
        id: BuffId['passive:12:hp conditional drop boost-item'],
        name: 'Passive HP-Conditional Item Drop Rate Boost',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHITEMDOWN : IconId.BUFF_HPTHRESHITEMDROP],
    }, 'passive:12:hp conditional drop boost-zel': {
        id: BuffId['passive:12:hp conditional drop boost-zel'],
        name: 'Passive HP-Conditional Zel Drop Rate Boost',
        stat: UnitStat.zelDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHZELDOWN : IconId.BUFF_HPTHRESHZELDROP],
    }, 'passive:12:hp conditional drop boost-karma': {
        id: BuffId['passive:12:hp conditional drop boost-karma'],
        name: 'Passive HP-Conditional Karma Drop Rate Boost',
        stat: UnitStat.karmaDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHKARMADOWN : IconId.BUFF_HPTHRESHKARMADROP],
    }, 'passive:13:bc fill on enemy defeat': {
        id: BuffId['passive:13:bc fill on enemy defeat'],
        name: 'Passive BC Fill on Enemy Defeat',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:14:chance mitigation': {
        id: BuffId['passive:14:chance mitigation'],
        name: 'Passive Damage Reduction (Chance)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGECUT],
    }, 'passive:15:heal on enemy defeat': {
        id: BuffId['passive:15:heal on enemy defeat'],
        name: 'Passive Heal on Enemy Defeat',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HPREC],
    }, 'passive:16:heal on win': {
        id: BuffId['passive:16:heal on win'],
        name: 'Passive Heal on Battle Win',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HPREC],
    }, 'passive:17:hp absorb': {
        id: BuffId['passive:17:hp absorb'],
        name: 'Passive HP Absorption',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HPABS],
    }, 'passive:19:drop boost-bc': {
        id: BuffId['passive:19:drop boost-bc'],
        name: 'Passive Battle Crystal Drop Rate Boost',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
    }, 'passive:19:drop boost-hc': {
        id: BuffId['passive:19:drop boost-hc'],
        name: 'Passive Heart Crystal Drop Rate Boost',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
    }, 'passive:19:drop boost-item': {
        id: BuffId['passive:19:drop boost-item'],
        name: 'Passive Item Drop Rate Boost',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
    }, 'passive:19:drop boost-zel': {
        id: BuffId['passive:19:drop boost-zel'],
        name: 'Passive Zel Drop Rate Boost',
        stat: UnitStat.zelDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_ZELDROP],
    }, 'passive:19:drop boost-karma': {
        id: BuffId['passive:19:drop boost-karma'],
        name: 'Passive Karma Drop Rate Boost',
        stat: UnitStat.karmaDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_KARMADROP],
    }, 'passive:20:chance inflict-poison': {
        id: BuffId['passive:20:chance inflict-poison'],
        name: 'Passive Poison Infliction',
        stat: UnitStat.poisonInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDPOISON],
    }, 'passive:20:chance inflict-weak': {
        id: BuffId['passive:20:chance inflict-weak'],
        name: 'Passive Weak Infliction',
        stat: UnitStat.weakInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDWEAK],
    }, 'passive:20:chance inflict-sick': {
        id: BuffId['passive:20:chance inflict-sick'],
        name: 'Passive Sick Infliction',
        stat: UnitStat.sickInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDSICK],
    }, 'passive:20:chance inflict-injury': {
        id: BuffId['passive:20:chance inflict-injury'],
        name: 'Passive Injury Infliction',
        stat: UnitStat.injuryInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDINJURY],
    }, 'passive:20:chance inflict-curse': {
        id: BuffId['passive:20:chance inflict-curse'],
        name: 'Passive Curse Infliction',
        stat: UnitStat.curseInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDCURSE],
    }, 'passive:20:chance inflict-paralysis': {
        id: BuffId['passive:20:chance inflict-paralysis'],
        name: 'Passive Paralysis Infliction',
        stat: UnitStat.paralysisInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDPARA],
    }, 'passive:20:chance inflict-atk down': {
        id: BuffId['passive:20:chance inflict-atk down'],
        name: 'Passive Attack Reduction Infliction',
        stat: UnitStat.atkDownInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDATKDOWN],
    }, 'passive:20:chance inflict-def down': {
        id: BuffId['passive:20:chance inflict-def down'],
        name: 'Passive Defense Reduction Infliction',
        stat: UnitStat.defDownInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDDEFDOWN],
    }, 'passive:20:chance inflict-rec down': {
        id: BuffId['passive:20:chance inflict-rec down'],
        name: 'Passive Recovery Reduction Infliction',
        stat: UnitStat.recDownInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDRECDOWN],
    }, 'passive:20:chance inflict-unknown': {
        id: BuffId['passive:20:chance inflict-unknown'],
        name: 'Passive Unknown Ailment Infliction',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.BUFF_ADDAILMENT],
    }, 'passive:21:first turn-atk': {
        id: BuffId['passive:21:first turn-atk'],
        name: 'Attack Boost for X Turns',
        stat: UnitStat.atk,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
    }, 'passive:21:first turn-def': {
        id: BuffId['passive:21:first turn-def'],
        name: 'Defense Boost for X Turns',
        stat: UnitStat.def,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
    }, 'passive:21:first turn-rec': {
        id: BuffId['passive:21:first turn-rec'],
        name: 'Recovery Boost for X Turns',
        stat: UnitStat.rec,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
    }, 'passive:21:first turn-crit': {
        id: BuffId['passive:21:first turn-crit'],
        name: 'Critical Hit Rate Boost for X Turns',
        stat: UnitStat.crit,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
    }, 'passive:23:bc fill on win': {
        id: BuffId['passive:23:bc fill on win'],
        name: 'Passive BC Fill on Battle Win',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:24:heal on hit': {
        id: BuffId['passive:24:heal on hit'],
        name: 'Passive Heal when Attacked (Chance)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BEENATK_HPREC],
    }, 'passive:25:bc fill on hit': {
        id: BuffId['passive:25:bc fill on hit'],
        name: 'Passive BC Fill when Attacked',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'passive:26:chance damage reflect': {
        id: BuffId['passive:26:chance damage reflect'],
        name: 'Passive Damage Counter (Chance)',
        stat: UnitStat.damageReflect,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_COUNTERDAMAGE],
    }, 'passive:27:target chance change': {
        id: BuffId['passive:27:target chance change'],
        name: 'Passive Target Chance Modification',
        stat: UnitStat.targetingModification,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_REPENEATT : IconId.BUFF_GETENEATT],
    }, 'passive:28:hp conditional target chance change': {
        id: BuffId['passive:28:hp conditional target chance change'],
        name: 'Passive HP-Conditional Target Chance Modification',
        stat: UnitStat.targetingModification,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHREPENEATT : IconId.BUFF_HPTHRESHGETENEATT],
    }, 'passive:29:chance def ignore': {
        id: BuffId['passive:29:chance def ignore'],
        name: 'Passive Defense Ignore (Chance)',
        stat: UnitStat.defenseIgnore,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_IGNOREDEF],
    }, 'passive:30:bb gauge conditional-atk': {
        id: BuffId['passive:30:bb gauge conditional-atk'],
        name: 'Passive BB Gauge Conditional Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHATKDOWN : IconId.BUFF_BBGAUGETHRESHATKUP],
    }, 'passive:30:bb gauge conditional-def': {
        id: BuffId['passive:30:bb gauge conditional-def'],
        name: 'Passive BB Gauge Conditional Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHDEFDOWN : IconId.BUFF_BBGAUGETHRESHDEFUP],
    }, 'passive:30:bb gauge conditional-rec': {
        id: BuffId['passive:30:bb gauge conditional-rec'],
        name: 'Passive BB Gauge Conditional Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHRECDOWN : IconId.BUFF_BBGAUGETHRESHRECUP],
    }, 'passive:30:bb gauge conditional-crit': {
        id: BuffId['passive:30:bb gauge conditional-crit'],
        name: 'Passive BB Gauge Conditional Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN : IconId.BUFF_BBGAUGETHRESHCRTRATEUP],
    }, 'passive:31:spark-damage': {
        id: BuffId['passive:31:spark-damage'],
        name: 'Passive Spark Damage Boost',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
    }, 'passive:31:spark-bc': {
        id: BuffId['passive:31:spark-bc'],
        name: 'Passive Battle Crystal Drop Rate Boost during Spark',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_SPARKBC],
    }, 'passive:31:spark-hc': {
        id: BuffId['passive:31:spark-hc'],
        name: 'Passive Heart Crystal Drop Rate Boost during Spark',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_SPARKHC],
    }, 'passive:31:spark-item': {
        id: BuffId['passive:31:spark-item'],
        name: 'Passive Item Drop Rate Boost during Spark',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_SPARKITEM],
    }, 'passive:31:spark-zel': {
        id: BuffId['passive:31:spark-zel'],
        name: 'Passive Zel Drop Rate Boost during Spark',
        stat: UnitStat.zelDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_SPARKZEL],
    }, 'passive:31:spark-karma': {
        id: BuffId['passive:31:spark-karma'],
        name: 'Passive Karma Drop Rate Boost during Spark',
        stat: UnitStat.karmaDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_SPARKKARMA],
    }, 'passive:32:bc efficacy': {
        id: BuffId['passive:32:bc efficacy'],
        name: 'Passive BC Efficacy',
        stat: UnitStat.bcEfficacy,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBFILL],
    }, 'passive:33:gradual heal': {
        id: BuffId['passive:33:gradual heal'],
        name: 'Passive Gradual Heal',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HPREC],
    }, 'passive:34:critical damage': {
        id: BuffId['passive:34:critical damage'],
        name: 'Passive Critical Damage Boost',
        stat: UnitStat.criticalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTUP],
    }, 'passive:35:bc fill on normal attack': {
        id: BuffId['passive:35:bc fill on normal attack'],
        name: 'Passive BC Fill when Normal Attacking',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:36:extra action': {
        id: BuffId['passive:36:extra action'],
        name: 'Passive Extra Action',
        stat: UnitStat.extraAction,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DBLSTRIKE],
    }, 'passive:37:hit count boost': {
        id: BuffId['passive:37:hit count boost'],
        name: 'Passive Hit Count Boost',
        stat: UnitStat.hitCountModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_HITUP],
    }, 'passive:40:converted-atk': {
        id: BuffId['passive:40:converted-atk'],
        name: 'Passive Converted Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
    }, 'passive:40:converted-def': {
        id: BuffId['passive:40:converted-def'],
        name: 'Passive Converted Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
    }, 'passive:40:converted-rec': {
        id: BuffId['passive:40:converted-rec'],
        name: 'Passive Converted Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
    }, 'passive:41:unique element count-hp': {
        id: BuffId['passive:41:unique element count-hp'],
        name: 'Passive Element Squad-based HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTHPDOWN : IconId.BUFF_UNIQUEELEMENTHPUP],
    }, 'passive:41:unique element count-atk': {
        id: BuffId['passive:41:unique element count-atk'],
        name: 'Passive Element Squad-based Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTATKDOWN : IconId.BUFF_UNIQUEELEMENTATKUP],
    }, 'passive:41:unique element count-def': {
        id: BuffId['passive:41:unique element count-def'],
        name: 'Passive Element Squad-based Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTDEFDOWN : IconId.BUFF_UNIQUEELEMENTDEFUP],
    }, 'passive:41:unique element count-rec': {
        id: BuffId['passive:41:unique element count-rec'],
        name: 'Passive Element Squad-based Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTRECDOWN : IconId.BUFF_UNIQUEELEMENTRECUP],
    }, 'passive:41:unique element count-crit': {
        id: BuffId['passive:41:unique element count-crit'],
        name: 'Passive Element Squad-based Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTCRTRATEDOWN : IconId.BUFF_UNIQUEELEMENTCRTRATEUP],
    } }), (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'passive:42:gender-hp': {
            id: BuffId['passive:42:gender-hp'],
            name: 'Passive Gender-Based HP Boost',
            stat: UnitStat.hp,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('HP'),
        },
        'passive:42:gender-atk': {
            id: BuffId['passive:42:gender-atk'],
            name: 'Passive Gender-Based Attack Boost',
            stat: UnitStat.atk,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('ATK'),
        },
        'passive:42:gender-def': {
            id: BuffId['passive:42:gender-def'],
            name: 'Passive Gender-Based Defense Boost',
            stat: UnitStat.def,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('DEF'),
        },
        'passive:42:gender-rec': {
            id: BuffId['passive:42:gender-rec'],
            name: 'Passive Gender-Based Recovery Boost',
            stat: UnitStat.rec,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('REC'),
        },
        'passive:42:gender-crit': {
            id: BuffId['passive:42:gender-crit'],
            name: 'Passive Gender-Based Critical Hit Rate Boost',
            stat: UnitStat.crit,
            stackType: BuffStackType.Passive,
            icons: createIconGetterForStat('CRTRATE'),
        },
    };
})()), { 'passive:43:chance damage to one': {
        id: BuffId['passive:43:chance damage to one'],
        name: 'Passive Damage Reduction To One (Chance)',
        stat: UnitStat.reduceDamageToOne,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGECUTTOONE],
    }, 'passive:44:flat-hp': {
        id: BuffId['passive:44:flat-hp'],
        name: 'Passive Flat HP Boost',
        stat: UnitStat.hp,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP],
    }, 'passive:44:flat-atk': {
        id: BuffId['passive:44:flat-atk'],
        name: 'Passive Flat Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
    }, 'passive:44:flat-def': {
        id: BuffId['passive:44:flat-def'],
        name: 'Passive Flat Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
    }, 'passive:44:flat-rec': {
        id: BuffId['passive:44:flat-rec'],
        name: 'Passive Flat Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
    }, 'passive:44:flat-crit': {
        id: BuffId['passive:44:flat-crit'],
        name: 'Passive Flat Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
    }, 'passive:45:critical damage reduction-base': {
        id: BuffId['passive:45:critical damage reduction-base'],
        name: 'Passive Base Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:45:critical damage reduction-buff': {
        id: BuffId['passive:45:critical damage reduction-buff'],
        name: 'Passive Buffed Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:46:hp scaled-atk': {
        id: BuffId['passive:46:hp scaled-atk'],
        name: 'Passive Attack Boost Relative to HP',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.addedValue && buff.value.addedValue < 0) ? IconId.BUFF_HPSCALEDATKDOWN : IconId.BUFF_HPSCALEDATKUP],
    }, 'passive:46:hp scaled-def': {
        id: BuffId['passive:46:hp scaled-def'],
        name: 'Passive Defense Boost Relative to HP',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.addedValue && buff.value.addedValue < 0) ? IconId.BUFF_HPSCALEDDEFDOWN : IconId.BUFF_HPSCALEDDEFUP],
    }, 'passive:46:hp scaled-rec': {
        id: BuffId['passive:46:hp scaled-rec'],
        name: 'Passive Recovery Boost Relative to HP',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => [(buff && buff.value && buff.value.addedValue && buff.value.addedValue < 0) ? IconId.BUFF_HPSCALEDRECDOWN : IconId.BUFF_HPSCALEDRECUP],
    }, 'passive:47:bc fill on spark': {
        id: BuffId['passive:47:bc fill on spark'],
        name: 'Passive BC Fill on Spark',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARKBBUP],
    }, 'passive:48:bc cost reduction': {
        id: BuffId['passive:48:bc cost reduction'],
        name: 'Passive BC Cost Reduction',
        stat: UnitStat.bcCostReduction,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBCOST_REDUCTION],
    }, 'passive:49:bb gauge consumption reduction': {
        id: BuffId['passive:49:bb gauge consumption reduction'],
        name: 'Passive BB Gauge Consumption Reduction',
        stat: UnitStat.bbGaugeConsumptionReduction,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:50:elemental weakness damage-fire': {
        id: BuffId['passive:50:elemental weakness damage-fire'],
        name: 'Passive Fire Elemental Damage Boost',
        stat: UnitStat.fireElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_FIREDMGUP],
    }, 'passive:50:elemental weakness damage-water': {
        id: BuffId['passive:50:elemental weakness damage-water'],
        name: 'Passive Water Elemental Damage Boost',
        stat: UnitStat.waterElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WATERDMGUP],
    }, 'passive:50:elemental weakness damage-earth': {
        id: BuffId['passive:50:elemental weakness damage-earth'],
        name: 'Passive Earth Elemental Damage Boost',
        stat: UnitStat.earthElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_EARTHDMGUP],
    }, 'passive:50:elemental weakness damage-thunder': {
        id: BuffId['passive:50:elemental weakness damage-thunder'],
        name: 'Passive Thunder Elemental Damage Boost',
        stat: UnitStat.thunderElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_THUNDERDMGUP],
    }, 'passive:50:elemental weakness damage-light': {
        id: BuffId['passive:50:elemental weakness damage-light'],
        name: 'Passive Light Elemental Damage Boost',
        stat: UnitStat.lightElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_LIGHTDMGUP],
    }, 'passive:50:elemental weakness damage-dark': {
        id: BuffId['passive:50:elemental weakness damage-dark'],
        name: 'Passive Dark Elemental Damage Boost',
        stat: UnitStat.darkElementalDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DARKDMGUP],
    }, 'passive:50:elemental weakness damage-unknown': {
        id: BuffId['passive:50:elemental weakness damage-unknown'],
        name: 'Passive Elemental Damage Boost (Unspecified Element)',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ELEMENTDMGUP],
    }, 'passive:53:critical damage-base': {
        id: BuffId['passive:53:critical damage-base'],
        name: 'Passive Base Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:53:critical damage-buff': {
        id: BuffId['passive:53:critical damage-buff'],
        name: 'Passive Buffed Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:53:element damage-base': {
        id: BuffId['passive:53:element damage-base'],
        name: 'Passive Base Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'passive:53:element damage-buff': {
        id: BuffId['passive:53:element damage-buff'],
        name: 'Passive Buffed Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'passive:53:critical rate-base': {
        id: BuffId['passive:53:critical rate-base'],
        name: 'Passive Base Critical Hit Rate Reduction',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:53:critical rate-buff': {
        id: BuffId['passive:53:critical rate-buff'],
        name: 'Passive Buffed Critical Hit Rate Reduction',
        stat: UnitStat.crit,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'passive:55:hp conditional': {
        id: BuffId['passive:55:hp conditional'],
        name: 'Passive Conditional Effect based on HP Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_HPTHRESH],
    }, 'passive:58:guard mitigation': {
        id: BuffId['passive:58:guard mitigation'],
        name: 'Passive Guard Damage Reduction',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_GUARDCUT],
    }, 'passive:59:bc fill when attacked on guard-percent': {
        id: BuffId['passive:59:bc fill when attacked on guard-percent'],
        name: 'Passive BC Fill when Attacked and Guarding (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'passive:59:bc fill when attacked on guard-flat': {
        id: BuffId['passive:59:bc fill when attacked on guard-flat'],
        name: 'Passive BC Fill when Attacked and Guarding (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'passive:61:bc fill on guard-percent': {
        id: BuffId['passive:61:bc fill on guard-percent'],
        name: 'Passive BC Fill on Guard (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'passive:61:bc fill on guard-flat': {
        id: BuffId['passive:61:bc fill on guard-flat'],
        name: 'Passive BC Fill on Guard (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'passive:62:mitigate-fire': {
        id: BuffId['passive:62:mitigate-fire'],
        name: 'Passive Fire Damage Reduction',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'passive:62:mitigate-water': {
        id: BuffId['passive:62:mitigate-water'],
        name: 'Passive Water Damage Reduction',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'passive:62:mitigate-earth': {
        id: BuffId['passive:62:mitigate-earth'],
        name: 'Passive Earth Damage Reduction',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'passive:62:mitigate-thunder': {
        id: BuffId['passive:62:mitigate-thunder'],
        name: 'Passive Thunder Damage Reduction',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'passive:62:mitigate-light': {
        id: BuffId['passive:62:mitigate-light'],
        name: 'Passive Light Damage Reduction',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'passive:62:mitigate-dark': {
        id: BuffId['passive:62:mitigate-dark'],
        name: 'Passive Dark Damage Reduction',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'passive:62:mitigate-unknown': {
        id: BuffId['passive:62:mitigate-unknown'],
        name: 'Passive Elemental Damage Reduction (Unspecified Element)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'passive:63:first turn mitigate-fire': {
        id: BuffId['passive:63:first turn mitigate-fire'],
        name: 'Fire Damage Reduction for First X Turns',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'passive:63:first turn mitigate-water': {
        id: BuffId['passive:63:first turn mitigate-water'],
        name: 'Water Damage Reduction for First X Turns',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'passive:63:first turn mitigate-earth': {
        id: BuffId['passive:63:first turn mitigate-earth'],
        name: 'Earth Damage Reduction for First X Turns',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'passive:63:first turn mitigate-thunder': {
        id: BuffId['passive:63:first turn mitigate-thunder'],
        name: 'Thunder Damage Reduction for First X Turns',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'passive:63:first turn mitigate-light': {
        id: BuffId['passive:63:first turn mitigate-light'],
        name: 'Light Damage Reduction for First X Turns',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'passive:63:first turn mitigate-dark': {
        id: BuffId['passive:63:first turn mitigate-dark'],
        name: 'Dark Damage Reduction for First X Turns',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'passive:63:first turn mitigate-unknown': {
        id: BuffId['passive:63:first turn mitigate-unknown'],
        name: 'Elemental Damage Reduction (Unspecified Element) for First X Turns',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'passive:64:attack boost-bb': {
        id: BuffId['passive:64:attack boost-bb'],
        name: 'Passive BB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBATKUP],
    }, 'passive:64:attack boost-sbb': {
        id: BuffId['passive:64:attack boost-sbb'],
        name: 'Passive SBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SBBATKUP],
    }, 'passive:64:attack boost-ubb': {
        id: BuffId['passive:64:attack boost-ubb'],
        name: 'Passive UBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_UBBATKUP],
    }, 'passive:65:bc fill on crit': {
        id: BuffId['passive:65:bc fill on crit'],
        name: 'Passive BC Fill on Critical Hit',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:66:add effect to skill-bb': {
        id: BuffId['passive:66:add effect to skill-bb'],
        name: 'Passive Added Effect to Brave Burst',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTO_BB],
    }, 'passive:66:add effect to skill-sbb': {
        id: BuffId['passive:66:add effect to skill-sbb'],
        name: 'Passive Added Effect to Super Brave Burst',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTO_SBB],
    }, 'passive:66:add effect to skill-ubb': {
        id: BuffId['passive:66:add effect to skill-ubb'],
        name: 'Passive Added Effect to Ultimate Brave Burst',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTO_UBB],
    }, 'passive:69:chance ko resistance': {
        id: BuffId['passive:69:chance ko resistance'],
        name: 'Passive KO Resistance (Chance)',
        stat: UnitStat.koResistance,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_KOBLOCK],
    }, 'passive:70:od fill rate': {
        id: BuffId['passive:70:od fill rate'],
        name: 'Passive OD Gauge Fill Rate',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_OVERDRIVEUP],
    }, 'passive:71:inflict on hit-poison': {
        id: BuffId['passive:71:inflict on hit-poison'],
        name: 'Passive Poison Counter',
        stat: UnitStat.poisonCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_POISONCOUNTER],
    }, 'passive:71:inflict on hit-weak': {
        id: BuffId['passive:71:inflict on hit-weak'],
        name: 'Passive Weak Counter',
        stat: UnitStat.weakCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WEAKCOUNTER],
    }, 'passive:71:inflict on hit-sick': {
        id: BuffId['passive:71:inflict on hit-sick'],
        name: 'Passive Sick Counter',
        stat: UnitStat.sickCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SICKCOUNTER],
    }, 'passive:71:inflict on hit-injury': {
        id: BuffId['passive:71:inflict on hit-injury'],
        name: 'Passive Injury Counter',
        stat: UnitStat.injuryCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_INJCONTER],
    }, 'passive:71:inflict on hit-curse': {
        id: BuffId['passive:71:inflict on hit-curse'],
        name: 'Passive Curse Counter',
        stat: UnitStat.curseCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CURSECOUNTER],
    }, 'passive:71:inflict on hit-paralysis': {
        id: BuffId['passive:71:inflict on hit-paralysis'],
        name: 'Passive Paralysis Counter',
        stat: UnitStat.paralysisCounter,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_PARALYCOUNTER],
    }, 'passive:72:effect at turn start-hp': {
        id: BuffId['passive:72:effect at turn start-hp'],
        name: 'Gradual HP Effects Occur at Turn Start',
        stat: UnitStat.effectOccurrenceShift,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_HPTURNSTART],
    }, 'passive:72:effect at turn start-bc': {
        id: BuffId['passive:72:effect at turn start-bc'],
        name: 'Gradual Battle Crystal Effects Occur at Turn Start',
        stat: UnitStat.effectOccurrenceShift,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_BCTURNSTART],
    }, 'passive:73:resist-poison': {
        id: BuffId['passive:73:resist-poison'],
        name: 'Passive Poison Resistance',
        stat: UnitStat.poisonResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_POISONBLK],
    }, 'passive:73:resist-weak': {
        id: BuffId['passive:73:resist-weak'],
        name: 'Passive Weak Resistance',
        stat: UnitStat.weakResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_WEAKBLK],
    }, 'passive:73:resist-sick': {
        id: BuffId['passive:73:resist-sick'],
        name: 'Passive Sick Resistance',
        stat: UnitStat.sickResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SICKBLK],
    }, 'passive:73:resist-injury': {
        id: BuffId['passive:73:resist-injury'],
        name: 'Passive Injury Resistance',
        stat: UnitStat.injuryResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_INJURYBLK],
    }, 'passive:73:resist-curse': {
        id: BuffId['passive:73:resist-curse'],
        name: 'Passive Curse Resistance',
        stat: UnitStat.curseResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CURSEBLK],
    }, 'passive:73:resist-paralysis': {
        id: BuffId['passive:73:resist-paralysis'],
        name: 'Passive Paralysis Resistance',
        stat: UnitStat.paralysisResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_PARALYSISBLK],
    }, 'passive:73:resist-atk down': {
        id: BuffId['passive:73:resist-atk down'],
        name: 'Passive Attack Reduction Resistance',
        stat: UnitStat.atkDownResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_RESISTATKDOWN],
    }, 'passive:73:resist-def down': {
        id: BuffId['passive:73:resist-def down'],
        name: 'Passive Defense Reduction Resistance',
        stat: UnitStat.defDownResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_RESISTDEFDOWN],
    }, 'passive:73:resist-rec down': {
        id: BuffId['passive:73:resist-rec down'],
        name: 'Passive Recovery Reduction Resistance',
        stat: UnitStat.recDownResist,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_RESISTRECDOWN],
    }, 'passive:74:ailment attack boost': {
        id: BuffId['passive:74:ailment attack boost'],
        name: 'Passive Attack Boost on Status Afflicted Foes',
        stat: UnitStat.ailmentAttackBoost,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_AILDMGUP],
    }, 'passive:75:spark vulnerability': {
        id: BuffId['passive:75:spark vulnerability'],
        name: 'Passive Spark Vulnerability',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARKDMGUP],
    }, 'passive:77:spark damage reduction-base': {
        id: BuffId['passive:77:spark damage reduction-base'],
        name: 'Passive Base Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'passive:77:spark damage reduction-buff': {
        id: BuffId['passive:77:spark damage reduction-buff'],
        name: 'Passive Buffed Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'passive:78:damage taken conditional': {
        id: BuffId['passive:78:damage taken conditional'],
        name: 'Passive Conditional Effect after Damage Received Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_DAMAGETAKENTHRESH],
    }, 'passive:79:bc fill after damage taken conditional-flat': {
        id: BuffId['passive:79:bc fill after damage taken conditional-flat'],
        name: 'Passive Flat BC Fill after Damage Taken Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'passive:79:bc fill after damage taken conditional-percent': {
        id: BuffId['passive:79:bc fill after damage taken conditional-percent'],
        name: 'Passive Percent BC Fill after Damage Taken Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'passive:80:damage dealt conditional': {
        id: BuffId['passive:80:damage dealt conditional'],
        name: 'Passive Conditional Effect after Damage Dealt Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_DAMAGEDEALTTHRESH],
    }, 'passive:81:bc fill after damage dealt conditional-flat': {
        id: BuffId['passive:81:bc fill after damage dealt conditional-flat'],
        name: 'Passive Flat BC Fill after Damage Dealt Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'passive:81:bc fill after damage dealt conditional-percent': {
        id: BuffId['passive:81:bc fill after damage dealt conditional-percent'],
        name: 'Passive Percent BC Fill after Damage Dealt Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'passive:82:bc received conditional': {
        id: BuffId['passive:82:bc received conditional'],
        name: 'Passive Conditional Effect after BC Received Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_BCRECEIVEDTHRESH],
    }, 'passive:83:bc fill after bc received conditional-flat': {
        id: BuffId['passive:83:bc fill after bc received conditional-flat'],
        name: 'Passive Flat BC Fill after BC Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:83:bc fill after bc received conditional-percent': {
        id: BuffId['passive:83:bc fill after bc received conditional-percent'],
        name: 'Passive Percent BC Fill after BC Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:84:hc received conditional': {
        id: BuffId['passive:84:hc received conditional'],
        name: 'Passive Conditional Effect after HC Received Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_HCRECEIVEDTHRESH],
    }, 'passive:85:bc fill after hc received conditional-flat': {
        id: BuffId['passive:85:bc fill after hc received conditional-flat'],
        name: 'Passive Flat BC Fill after HC Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:85:bc fill after hc received conditional-percent': {
        id: BuffId['passive:85:bc fill after hc received conditional-percent'],
        name: 'Passive Percent BC Fill after HC Received Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:86:spark count conditional': {
        id: BuffId['passive:86:spark count conditional'],
        name: 'Passive Conditional Effect after Spark Count Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_SPARKCOUNTTHRESH],
    }, 'passive:87:bc fill after spark count conditional-flat': {
        id: BuffId['passive:87:bc fill after spark count conditional-flat'],
        name: 'Passive Flat BC Fill after Spark Count Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:87:bc fill after spark count conditional-percent': {
        id: BuffId['passive:87:bc fill after spark count conditional-percent'],
        name: 'Passive Percent BC Fill after Spark Count Threshold',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBREC],
    }, 'passive:88:on guard conditional': {
        id: BuffId['passive:88:on guard conditional'],
        name: 'Passive Conditional Effect on Guard (Chance)',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_GUARD],
    }, 'passive:89:on critical hit conditional': {
        id: BuffId['passive:89:on critical hit conditional'],
        name: 'Passive Conditional Effect on Critical Hit (Chance)',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_CRIT],
    }, 'passive:90:inflict on crit-poison': {
        id: BuffId['passive:90:inflict on crit-poison'],
        name: 'Passive Poison Infliction on Critical Hit (Chance)',
        stat: UnitStat.poisonInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDPOISON],
    }, 'passive:90:inflict on crit-weak': {
        id: BuffId['passive:90:inflict on crit-weak'],
        name: 'Passive Weak Infliction on Critical Hit (Chance)',
        stat: UnitStat.weakInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDWEAK],
    }, 'passive:90:inflict on crit-sick': {
        id: BuffId['passive:90:inflict on crit-sick'],
        name: 'Passive Sick Infliction on Critical Hit (Chance)',
        stat: UnitStat.sickInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDSICK],
    }, 'passive:90:inflict on crit-injury': {
        id: BuffId['passive:90:inflict on crit-injury'],
        name: 'Passive Injury Infliction on Critical Hit (Chance)',
        stat: UnitStat.injuryInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDINJURY],
    }, 'passive:90:inflict on crit-curse': {
        id: BuffId['passive:90:inflict on crit-curse'],
        name: 'Passive Curse Infliction on Critical Hit (Chance)',
        stat: UnitStat.curseInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDCURSE],
    }, 'passive:90:inflict on crit-paralysis': {
        id: BuffId['passive:90:inflict on crit-paralysis'],
        name: 'Passive Paralysis Infliction on Critical Hit (Chance)',
        stat: UnitStat.paralysisInflict,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDPARA],
    }, 'passive:91:first turn spark': {
        id: BuffId['passive:91:first turn spark'],
        name: 'Spark Damage Boost for First X Turns',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
    }, 'passive:92:negate defense ignore': {
        id: BuffId['passive:92:negate defense ignore'],
        name: 'Passive Defense Ignore Negation (Chance)',
        stat: UnitStat.defenseIgnoreMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_IGNOREDEFBLK],
    }, 'passive:93:add element-fire': {
        id: BuffId['passive:93:add element-fire'],
        name: 'Passive Added Element to Attack (Fire)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDFIRE],
    }, 'passive:93:add element-water': {
        id: BuffId['passive:93:add element-water'],
        name: 'Passive Added Element to Attack (Water)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDWATER],
    }, 'passive:93:add element-earth': {
        id: BuffId['passive:93:add element-earth'],
        name: 'Passive Added Element to Attack (Earth)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDEARTH],
    }, 'passive:93:add element-thunder': {
        id: BuffId['passive:93:add element-thunder'],
        name: 'Passive Added Element to Attack (Thunder)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTHUNDER],
    }, 'passive:93:add element-light': {
        id: BuffId['passive:93:add element-light'],
        name: 'Passive Added Element to Attack (Light)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDLIGHT],
    }, 'passive:93:add element-dark': {
        id: BuffId['passive:93:add element-dark'],
        name: 'Passive Added Element to Attack (Dark)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDDARK],
    }, 'passive:93:add element-unknown': {
        id: BuffId['passive:93:add element-unknown'],
        name: 'Passive Added Element to Attack (Unspecified Element)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDELEMENT],
    }, 'passive:96:aoe normal attack': {
        id: BuffId['passive:96:aoe normal attack'],
        name: 'Passive Normal Attacks Hit All Foes',
        stat: UnitStat.aoeNormalAttack,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_AOEATK],
    }, 'passive:97:player exp boost': {
        id: BuffId['passive:97:player exp boost'],
        name: 'Passive Player EXP Boost',
        stat: UnitStat.expModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_PLAYEREXP],
    }, 'passive:100:spark critical': {
        id: BuffId['passive:100:spark critical'],
        name: 'Passive Spark Critical',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARKCRTACTIVATED],
    }, 'passive:101:heal on spark': {
        id: BuffId['passive:101:heal on spark'],
        name: 'Passive Heal on Spark (Chance)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SPARK_HPREC],
    }, 'passive:102:add element-fire': {
        id: BuffId['passive:102:add element-fire'],
        name: 'Passive Added Element to Attack (Fire)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDFIRE],
    }, 'passive:102:add element-water': {
        id: BuffId['passive:102:add element-water'],
        name: 'Passive Added Element to Attack (Water)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDWATER],
    }, 'passive:102:add element-earth': {
        id: BuffId['passive:102:add element-earth'],
        name: 'Passive Added Element to Attack (Earth)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDEARTH],
    }, 'passive:102:add element-thunder': {
        id: BuffId['passive:102:add element-thunder'],
        name: 'Passive Added Element to Attack (Thunder)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTHUNDER],
    }, 'passive:102:add element-light': {
        id: BuffId['passive:102:add element-light'],
        name: 'Passive Added Element to Attack (Light)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDLIGHT],
    }, 'passive:102:add element-dark': {
        id: BuffId['passive:102:add element-dark'],
        name: 'Passive Added Element to Attack (Dark)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDDARK],
    }, 'passive:102:add element-unknown': {
        id: BuffId['passive:102:add element-unknown'],
        name: 'Passive Added Element to Attack (Unspecified Element)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDELEMENT],
    }, 'passive:103:hp conditional attack boost-bb': {
        id: BuffId['passive:103:hp conditional attack boost-bb'],
        name: 'Passive BB ATK Boost when HP Passes Threshold',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBATKUP],
    }, 'passive:103:hp conditional attack boost-sbb': {
        id: BuffId['passive:103:hp conditional attack boost-sbb'],
        name: 'Passive SBB ATK Boost when HP Passes Threshold',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SBBATKUP],
    }, 'passive:103:hp conditional attack boost-ubb': {
        id: BuffId['passive:103:hp conditional attack boost-ubb'],
        name: 'Passive UBB ATK Boost when HP Passes Threshold',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_UBBATKUP],
    }, 'passive:104:hp conditional spark-damage': {
        id: BuffId['passive:104:hp conditional spark-damage'],
        name: 'Passive Spark Damage Boost when HP Passes Threshold',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
    }, 'passive:104:hp conditional spark-bc': {
        id: BuffId['passive:104:hp conditional spark-bc'],
        name: 'Passive Battle Crystal Drop Rate Boost during Spark when HP Passes Threshold',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_SPARKBC],
    }, 'passive:104:hp conditional spark-hc': {
        id: BuffId['passive:104:hp conditional spark-hc'],
        name: 'Passive Heart Crystal Drop Rate Boost during Spark when HP Passes Threshold',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_SPARKHC],
    }, 'passive:104:hp conditional spark-item': {
        id: BuffId['passive:104:hp conditional spark-item'],
        name: 'Passive Item Drop Rate Boost during Spark when HP Passes Threshold',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_SPARKITEM],
    }, 'passive:104:hp conditional spark-zel': {
        id: BuffId['passive:104:hp conditional spark-zel'],
        name: 'Passive Zel Drop Rate Boost during Spark when HP Passes Threshold',
        stat: UnitStat.zelDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_SPARKZEL],
    }, 'passive:104:hp conditional spark-karma': {
        id: BuffId['passive:104:hp conditional spark-karma'],
        name: 'Passive Karma Drop Rate Boost during Spark when HP Passes Threshold',
        stat: UnitStat.karmaDropRate,
        stackType: BuffStackType.Passive,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_SPARKKARMA],
    }, 'passive:105:turn scaled-atk': {
        id: BuffId['passive:105:turn scaled-atk'],
        name: 'Passive Turn-Scaled Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Passive,
        icons: (buff) => {
            let icon = IconId.BUFF_TURNSCALEDATKUP;
            if (buff && buff.value) {
                const buffValue = buff.value;
                if (buffValue['startingValue%'] > buffValue['endingValue%']) {
                    icon = IconId.BUFF_TURNSCALEDATKDOWN;
                }
            }
            return [icon];
        },
    }, 'passive:105:turn scaled-def': {
        id: BuffId['passive:105:turn scaled-def'],
        name: 'Passive Turn-Scaled Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Passive,
        icons: (buff) => {
            let icon = IconId.BUFF_TURNSCALEDDEFUP;
            if (buff && buff.value) {
                const buffValue = buff.value;
                if (buffValue['startingValue%'] > buffValue['endingValue%']) {
                    icon = IconId.BUFF_TURNSCALEDDEFDOWN;
                }
            }
            return [icon];
        },
    }, 'passive:105:turn scaled-rec': {
        id: BuffId['passive:105:turn scaled-rec'],
        name: 'Passive Turn-Scaled Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Passive,
        icons: (buff) => {
            let icon = IconId.BUFF_TURNSCALEDRECUP;
            if (buff && buff.value) {
                const buffValue = buff.value;
                if (buffValue['startingValue%'] > buffValue['endingValue%']) {
                    icon = IconId.BUFF_TURNSCALEDRECDOWN;
                }
            }
            return [icon];
        },
    }, 'passive:106:on overdrive conditional': {
        id: BuffId['passive:106:on overdrive conditional'],
        name: 'Passive Conditional Effect on Overdrive (Chance)',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_OD],
    }, 'passive:107:add effect to leader skill': {
        id: BuffId['passive:107:add effect to leader skill'],
        name: 'Passive Added Effect to Leader Skill',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ADDTO_LS],
    }, 'passive:109:bc efficacy reduction': {
        id: BuffId['passive:109:bc efficacy reduction'],
        name: 'Passive BC Efficacy Reduction (Chance)',
        stat: UnitStat.bcEfficacy,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'passive:110:bc drain-flat': {
        id: BuffId['passive:110:bc drain-flat'],
        name: 'Passive BB Gauge Drain (Chance) (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'passive:110:bc drain-percent': {
        id: BuffId['passive:110:bc drain-percent'],
        name: 'Passive BB Gauge Drain (Chance) (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'passive:111:skill activation rate boost': {
        id: BuffId['passive:111:skill activation rate boost'],
        name: 'Passive Brave Burst Activation Rate Boost',
        stat: UnitStat.skillActivationRate,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_SKILLACTIVATIONRATEUP],
    }, 'passive:112:point gain boost-arena': {
        id: BuffId['passive:112:point gain boost-arena'],
        name: 'Passive Arena Battle Point Boost',
        stat: UnitStat.arenaBattlePointModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ABPUP],
    }, 'passive:112:point gain boost-colo': {
        id: BuffId['passive:112:point gain boost-colo'],
        name: 'Passive Colosseum Battle Point Boost',
        stat: UnitStat.coloBattlePointModification,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_CBPUP],
    }, 'passive:113:hp conditional': {
        id: BuffId['passive:113:hp conditional'],
        name: 'Passive Conditional Persistent Effect based on HP Threshold',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_HPTHRESH],
    }, 'passive:114:when attacked conditional': {
        id: BuffId['passive:114:when attacked conditional'],
        name: 'Passive Inflict Conditional Effect when Attacked (Chance)',
        stackType: BuffStackType.Passive,
        icons: () => [IconId.CONDITIONALBUFF_WHENHIT],
    }, 'passive:127:damage over time reduction': {
        id: BuffId['passive:127:damage over time reduction'],
        name: 'Passive Damage Over Time Reduction',
        stat: UnitStat.damageOverTimeMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_ATKREDUC],
    }, 'passive:128:normal attack mitigation': {
        id: BuffId['passive:128:normal attack mitigation'],
        name: 'Passive Damage Reduction from Normal Attacks',
        stat: UnitStat.normalAttackMitigation,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_NORMALATTACKREDUCTION],
    }, 'passive:143:atk limit break': {
        id: BuffId['passive:143:atk limit break'],
        name: 'Passive Attack Parameter Limit Break',
        stat: UnitStat.attackLimitBreak,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_PARAMBREAK_ATK],
    }, UNKNOWN_PROC_EFFECT_ID: {
        id: BuffId.UNKNOWN_PROC_EFFECT_ID,
        name: 'Unknown Proc Effect',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, UNKNOWN_PROC_BUFF_PARAMS: {
        id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
        name: 'Unknown Proc Buff Parameters',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, 'proc:1:attack': {
        id: BuffId['proc:1:attack'],
        name: 'Regular Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
    }, 'proc:2:burst heal': {
        id: BuffId['proc:2:burst heal'],
        name: 'Burst Heal',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_HPREC],
    }, 'proc:3:gradual heal': {
        id: BuffId['proc:3:gradual heal'],
        name: 'Active Gradual Heal',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_HPREC],
    }, 'proc:4:bc fill-flat': {
        id: BuffId['proc:4:bc fill-flat'],
        name: 'Burst BC Fill (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBREC],
    }, 'proc:4:bc fill-percent': {
        id: BuffId['proc:4:bc fill-percent'],
        name: 'Burst BC Fill (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBREC],
    } }), (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'proc:5:regular or elemental-atk': {
            id: BuffId['proc:5:regular or elemental-atk'],
            name: 'Active Regular/Elemental Attack Boost',
            stat: UnitStat.atk,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('ATK'),
        },
        'proc:5:regular or elemental-def': {
            id: BuffId['proc:5:regular or elemental-def'],
            name: 'Active Regular/Elemental Defense Boost',
            stat: UnitStat.def,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('DEF'),
        },
        'proc:5:regular or elemental-rec': {
            id: BuffId['proc:5:regular or elemental-rec'],
            name: 'Active Regular/Elemental Recovery Boost',
            stat: UnitStat.rec,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('REC'),
        },
        'proc:5:regular or elemental-crit': {
            id: BuffId['proc:5:regular or elemental-crit'],
            name: 'Active Regular/Elemental Critical Hit Rate Boost',
            stat: UnitStat.crit,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('CRTRATE'),
        },
    };
})()), { 'proc:6:drop boost-bc': {
        id: BuffId['proc:6:drop boost-bc'],
        name: 'Active Battle Crystal Drop Rate Boost',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Active,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
    }, 'proc:6:drop boost-hc': {
        id: BuffId['proc:6:drop boost-hc'],
        name: 'Active Heart Crystal Drop Rate Boost',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Active,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
    }, 'proc:6:drop boost-item': {
        id: BuffId['proc:6:drop boost-item'],
        name: 'Active Item Drop Rate Boost',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Active,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
    }, 'proc:7:guaranteed ko resistance': {
        id: BuffId['proc:7:guaranteed ko resistance'],
        name: 'Guaranteed KO Resistance',
        stat: UnitStat.koResistance,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_KOBLK],
    }, 'proc:8:max hp boost-flat': {
        id: BuffId['proc:8:max hp boost-flat'],
        name: 'Max HP Boost (Flat Amount)',
        stat: UnitStat.hp,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_HPUP],
    }, 'proc:8:max hp boost-percent': {
        id: BuffId['proc:8:max hp boost-percent'],
        name: 'Max HP Boost (Percentage)',
        stat: UnitStat.hp,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_HPUP],
    } }), (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'proc:9:regular or elemental reduction-atk': {
            id: BuffId['proc:9:regular or elemental reduction-atk'],
            name: 'Active Regular/Elemental Attack Reduction',
            stat: UnitStat.atk,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('ATK'),
        },
        'proc:9:regular or elemental reduction-def': {
            id: BuffId['proc:9:regular or elemental reduction-def'],
            name: 'Active Regular/Elemental Defense Reduction',
            stat: UnitStat.def,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('DEF'),
        },
        'proc:9:regular or elemental reduction-rec': {
            id: BuffId['proc:9:regular or elemental reduction-rec'],
            name: 'Active Regular/Elemental Recovery Reduction',
            stat: UnitStat.rec,
            stackType: BuffStackType.Active,
            icons: createIconGetterForStat('REC'),
        },
        'proc:9:regular or elemental reduction-unknown': {
            id: BuffId['proc:9:regular or elemental reduction-unknown'],
            name: 'Active Regular/Elemental Unknown Stat Reduction',
            stackType: BuffStackType.Active,
            icons: () => [IconId.UNKNOWN],
        },
    };
})()), { 'proc:10:cleanse-poison': {
        id: BuffId['proc:10:cleanse-poison'],
        name: 'Poison Cleanse',
        stat: UnitStat.poisonResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_POISONBLK],
    }, 'proc:10:cleanse-weak': {
        id: BuffId['proc:10:cleanse-weak'],
        name: 'Weak Cleanse',
        stat: UnitStat.weakResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_WEAKBLK],
    }, 'proc:10:cleanse-sick': {
        id: BuffId['proc:10:cleanse-sick'],
        name: 'Sick Cleanse',
        stat: UnitStat.sickResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_SICKBLK],
    }, 'proc:10:cleanse-injury': {
        id: BuffId['proc:10:cleanse-injury'],
        name: 'Injury Cleanse',
        stat: UnitStat.injuryResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_INJURYBLK],
    }, 'proc:10:cleanse-curse': {
        id: BuffId['proc:10:cleanse-curse'],
        name: 'Curse Cleanse',
        stat: UnitStat.curseResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_CURSEBLK],
    }, 'proc:10:cleanse-paralysis': {
        id: BuffId['proc:10:cleanse-paralysis'],
        name: 'Paralysis Cleanse',
        stat: UnitStat.paralysisResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_PARALYSISBLK],
    }, 'proc:10:cleanse-atk down': {
        id: BuffId['proc:10:cleanse-atk down'],
        name: 'Attack Reduction Cleanse',
        stat: UnitStat.atkDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTATKDOWN],
    }, 'proc:10:cleanse-def down': {
        id: BuffId['proc:10:cleanse-def down'],
        name: 'Defense Reduction Cleanse',
        stat: UnitStat.defDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTDEFDOWN],
    }, 'proc:10:cleanse-rec down': {
        id: BuffId['proc:10:cleanse-rec down'],
        name: 'Recovery Reduction Cleanse',
        stat: UnitStat.recDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTRECDOWN],
    }, 'proc:10:cleanse-unknown': {
        id: BuffId['proc:10:cleanse-unknown'],
        name: 'Unknown Ailment Cleanse',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.BUFF_AILMENTBLK],
    }, 'proc:11:chance inflict-poison': {
        id: BuffId['proc:11:chance inflict-poison'],
        name: 'Poison Infliction',
        stat: UnitStat.poisonInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_POISON],
    }, 'proc:11:chance inflict-weak': {
        id: BuffId['proc:11:chance inflict-weak'],
        name: 'Weak Infliction',
        stat: UnitStat.weakInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_WEAK],
    }, 'proc:11:chance inflict-sick': {
        id: BuffId['proc:11:chance inflict-sick'],
        name: 'Sick Infliction',
        stat: UnitStat.sickInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_SICK],
    }, 'proc:11:chance inflict-injury': {
        id: BuffId['proc:11:chance inflict-injury'],
        name: 'Injury Infliction',
        stat: UnitStat.injuryInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_INJURY],
    }, 'proc:11:chance inflict-curse': {
        id: BuffId['proc:11:chance inflict-curse'],
        name: 'Curse Infliction',
        stat: UnitStat.curseInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_CURSE],
    }, 'proc:11:chance inflict-paralysis': {
        id: BuffId['proc:11:chance inflict-paralysis'],
        name: 'Paralysis Infliction',
        stat: UnitStat.paralysisInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.DEBUFF_PARALYSIS],
    }, 'proc:11:chance inflict-atk down': {
        id: BuffId['proc:11:chance inflict-atk down'],
        name: 'Attack Reduction Infliction',
        stat: UnitStat.atkDownInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_ATKDOWN],
    }, 'proc:11:chance inflict-def down': {
        id: BuffId['proc:11:chance inflict-def down'],
        name: 'Defense Reduction Infliction',
        stat: UnitStat.defDownInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_DEFDOWN],
    }, 'proc:11:chance inflict-rec down': {
        id: BuffId['proc:11:chance inflict-rec down'],
        name: 'Recovery Reduction Infliction',
        stat: UnitStat.recDownInflict,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RECDOWN],
    }, 'proc:11:chance inflict-unknown': {
        id: BuffId['proc:11:chance inflict-unknown'],
        name: 'Unknown Ailment Infliction',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.DEBUFF_AILMENT],
    }, 'proc:12:guaranteed revive': {
        id: BuffId['proc:12:guaranteed revive'],
        name: 'Instant Revive (Guaranteed)',
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_KOBLK],
    }, 'proc:13:random attack': {
        id: BuffId['proc:13:random attack'],
        name: 'Random Target Damage',
        stackType: BuffStackType.Attack,
        icons: () => [IconId.ATK_RT],
    }, 'proc:14:hp absorb attack': {
        id: BuffId['proc:14:hp absorb attack'],
        name: 'Lifesteal Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPREC : IconId.ATK_AOE_HPREC],
    }, 'proc:16:mitigate-fire': {
        id: BuffId['proc:16:mitigate-fire'],
        name: 'Active Fire Damage Reduction',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'proc:16:mitigate-water': {
        id: BuffId['proc:16:mitigate-water'],
        name: 'Active Water Damage Reduction',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'proc:16:mitigate-earth': {
        id: BuffId['proc:16:mitigate-earth'],
        name: 'Active Earth Damage Reduction',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'proc:16:mitigate-thunder': {
        id: BuffId['proc:16:mitigate-thunder'],
        name: 'Active Thunder Damage Reduction',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'proc:16:mitigate-light': {
        id: BuffId['proc:16:mitigate-light'],
        name: 'Active Light Damage Reduction',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'proc:16:mitigate-dark': {
        id: BuffId['proc:16:mitigate-dark'],
        name: 'Active Dark Damage Reduction',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'proc:16:mitigate-all': {
        id: BuffId['proc:16:mitigate-all'],
        name: 'Active Elemental Damage Reduction (All Elements)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'proc:16:mitigate-unknown': {
        id: BuffId['proc:16:mitigate-unknown'],
        name: 'Active Elemental Damage Reduction (Unspecified Element)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'proc:17:resist-poison': {
        id: BuffId['proc:17:resist-poison'],
        name: 'Active Poison Resistance',
        stat: UnitStat.poisonResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_POISONBLK],
    }, 'proc:17:resist-weak': {
        id: BuffId['proc:17:resist-weak'],
        name: 'Active Weak Resistance',
        stat: UnitStat.weakResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_WEAKBLK],
    }, 'proc:17:resist-sick': {
        id: BuffId['proc:17:resist-sick'],
        name: 'Active Sick Resistance',
        stat: UnitStat.sickResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SICKBLK],
    }, 'proc:17:resist-injury': {
        id: BuffId['proc:17:resist-injury'],
        name: 'Active Injury Resistance',
        stat: UnitStat.injuryResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_INJURYBLK],
    }, 'proc:17:resist-curse': {
        id: BuffId['proc:17:resist-curse'],
        name: 'Active Curse Resistance',
        stat: UnitStat.curseResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_CURSEBLK],
    }, 'proc:17:resist-paralysis': {
        id: BuffId['proc:17:resist-paralysis'],
        name: 'Active Paralysis Resistance',
        stat: UnitStat.paralysisResist,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_PARALYSISBLK],
    }, 'proc:18:mitigation': {
        id: BuffId['proc:18:mitigation'],
        name: 'Active Damage Reduction',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DAMAGECUT],
    }, 'proc:19:gradual bc fill': {
        id: BuffId['proc:19:gradual bc fill'],
        name: 'Active Gradual BC Fill',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBREC],
    }, 'proc:20:bc fill on hit': {
        id: BuffId['proc:20:bc fill on hit'],
        name: 'Active BC Fill when attacked',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DAMAGEBB],
    }, 'proc:22:defense ignore': {
        id: BuffId['proc:22:defense ignore'],
        name: 'Active Defense Ignore',
        stat: UnitStat.defenseIgnore,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_IGNOREDEF],
    }, 'proc:23:spark damage': {
        id: BuffId['proc:23:spark damage'],
        name: 'Active Spark Damage Boost',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Active,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
    }, 'proc:24:converted-atk': {
        id: BuffId['proc:24:converted-atk'],
        name: 'Active Converted Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
    }, 'proc:24:converted-def': {
        id: BuffId['proc:24:converted-def'],
        name: 'Active Converted Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
    }, 'proc:24:converted-rec': {
        id: BuffId['proc:24:converted-rec'],
        name: 'Active Converted Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
    }, 'proc:26:hit count boost': {
        id: BuffId['proc:26:hit count boost'],
        name: 'Active Hit Count Boost',
        stat: UnitStat.hitCountModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_HITUP],
    }, 'proc:27:proportional attack': {
        id: BuffId['proc:27:proportional attack'],
        name: 'Proportional Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
    }, 'proc:28:fixed attack': {
        id: BuffId['proc:28:fixed attack'],
        name: 'Fixed Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_FIXED : IconId.ATK_AOE_FIXED],
    }, 'proc:29:multi-element attack': {
        id: BuffId['proc:29:multi-element attack'],
        name: 'Multi-Element Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_MULTIELEMENT : IconId.ATK_AOE_MULTIELEMENT],
    }, 'proc:30:add element-fire': {
        id: BuffId['proc:30:add element-fire'],
        name: 'Active Added Element to Attack (Fire)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDFIRE],
    }, 'proc:30:add element-water': {
        id: BuffId['proc:30:add element-water'],
        name: 'Active Added Element to Attack (Water)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDWATER],
    }, 'proc:30:add element-earth': {
        id: BuffId['proc:30:add element-earth'],
        name: 'Active Added Element to Attack (Earth)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDEARTH],
    }, 'proc:30:add element-thunder': {
        id: BuffId['proc:30:add element-thunder'],
        name: 'Active Added Element to Attack (Thunder)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDTHUNDER],
    }, 'proc:30:add element-light': {
        id: BuffId['proc:30:add element-light'],
        name: 'Active Added Element to Attack (Light)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDLIGHT],
    }, 'proc:30:add element-dark': {
        id: BuffId['proc:30:add element-dark'],
        name: 'Active Added Element to Attack (Dark)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDDARK],
    }, 'proc:30:add element-unknown': {
        id: BuffId['proc:30:add element-unknown'],
        name: 'Active Added Element to Attack (Unspecified Element)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDELEMENT],
    }, 'proc:31:bc fill-flat': {
        id: BuffId['proc:31:bc fill-flat'],
        name: 'Burst BC Fill (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBREC],
    }, 'proc:31:bc fill-percent': {
        id: BuffId['proc:31:bc fill-percent'],
        name: 'Burst BC Fill (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBREC],
    }, 'proc:32:element shift-fire': {
        id: BuffId['proc:32:element shift-fire'],
        name: 'Element Shift (Fire)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTFIRE],
    }, 'proc:32:element shift-water': {
        id: BuffId['proc:32:element shift-water'],
        name: 'Element Shift (Water)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTWATER],
    }, 'proc:32:element shift-earth': {
        id: BuffId['proc:32:element shift-earth'],
        name: 'Element Shift (Earth)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTEARTH],
    }, 'proc:32:element shift-thunder': {
        id: BuffId['proc:32:element shift-thunder'],
        name: 'Element Shift (Thunder)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTTHUNDER],
    }, 'proc:32:element shift-light': {
        id: BuffId['proc:32:element shift-light'],
        name: 'Element Shift (Light)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTLIGHT],
    }, 'proc:32:element shift-dark': {
        id: BuffId['proc:32:element shift-dark'],
        name: 'Element Shift (Dark)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTDARK],
    }, 'proc:32:element shift-unknown': {
        id: BuffId['proc:32:element shift-unknown'],
        name: 'Element Shift (Unspecified Element)',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SHIFTELEMENT],
    }, 'proc:33:buff wipe': {
        id: BuffId['proc:33:buff wipe'],
        name: 'Buff Removal',
        stat: UnitStat.buffStabilityModification,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_REMOVEBUFF],
    }, 'proc:34:bc drain-flat': {
        id: BuffId['proc:34:bc drain-flat'],
        name: 'Burst BB Gauge Drain (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'proc:34:bc drain-percent': {
        id: BuffId['proc:34:bc drain-percent'],
        name: 'Burst BB Gauge Drain (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'proc:36:ls lock': {
        id: BuffId['proc:36:ls lock'],
        name: 'Active Leader Skill Lock',
        stat: UnitStat.buffStabilityModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DISABLELS],
    }, 'proc:37:summon': {
        id: BuffId['proc:37:summon'],
        name: 'Summon Unit',
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_SUMMONUNIT],
    }, 'proc:38:cleanse-poison': {
        id: BuffId['proc:38:cleanse-poison'],
        name: 'Poison Cleanse',
        stat: UnitStat.poisonResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_POISONBLK],
    }, 'proc:38:cleanse-weak': {
        id: BuffId['proc:38:cleanse-weak'],
        name: 'Weak Cleanse',
        stat: UnitStat.weakResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_WEAKBLK],
    }, 'proc:38:cleanse-sick': {
        id: BuffId['proc:38:cleanse-sick'],
        name: 'Sick Cleanse',
        stat: UnitStat.sickResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_SICKBLK],
    }, 'proc:38:cleanse-injury': {
        id: BuffId['proc:38:cleanse-injury'],
        name: 'Injury Cleanse',
        stat: UnitStat.injuryResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_INJURYBLK],
    }, 'proc:38:cleanse-curse': {
        id: BuffId['proc:38:cleanse-curse'],
        name: 'Curse Cleanse',
        stat: UnitStat.curseResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_CURSEBLK],
    }, 'proc:38:cleanse-paralysis': {
        id: BuffId['proc:38:cleanse-paralysis'],
        name: 'Paralysis Cleanse',
        stat: UnitStat.paralysisResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_PARALYSISBLK],
    }, 'proc:38:cleanse-atk down': {
        id: BuffId['proc:38:cleanse-atk down'],
        name: 'Attack Reduction Cleanse',
        stat: UnitStat.atkDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTATKDOWN],
    }, 'proc:38:cleanse-def down': {
        id: BuffId['proc:38:cleanse-def down'],
        name: 'Defense Reduction Cleanse',
        stat: UnitStat.defDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTDEFDOWN],
    }, 'proc:38:cleanse-rec down': {
        id: BuffId['proc:38:cleanse-rec down'],
        name: 'Recovery Reduction Cleanse',
        stat: UnitStat.recDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTRECDOWN],
    }, 'proc:38:cleanse-unknown': {
        id: BuffId['proc:38:cleanse-unknown'],
        name: 'Unknown Ailment Cleanse',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.BUFF_AILMENTBLK],
    }, 'proc:39:mitigate-fire': {
        id: BuffId['proc:39:mitigate-fire'],
        name: 'Active Fire Damage Reduction',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'proc:39:mitigate-water': {
        id: BuffId['proc:39:mitigate-water'],
        name: 'Active Water Damage Reduction',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'proc:39:mitigate-earth': {
        id: BuffId['proc:39:mitigate-earth'],
        name: 'Active Earth Damage Reduction',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'proc:39:mitigate-thunder': {
        id: BuffId['proc:39:mitigate-thunder'],
        name: 'Active Thunder Damage Reduction',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'proc:39:mitigate-light': {
        id: BuffId['proc:39:mitigate-light'],
        name: 'Active Light Damage Reduction',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'proc:39:mitigate-dark': {
        id: BuffId['proc:39:mitigate-dark'],
        name: 'Active Dark Damage Reduction',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'proc:39:mitigate-unknown': {
        id: BuffId['proc:39:mitigate-unknown'],
        name: 'Active Elemental Damage Reduction (Unspecified Element)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
    }, 'proc:40:add ailment-poison': {
        id: BuffId['proc:40:add ailment-poison'],
        name: 'Active Poison Infliction Added to Attack',
        stat: UnitStat.poisonInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDPOISON],
    }, 'proc:40:add ailment-weak': {
        id: BuffId['proc:40:add ailment-weak'],
        name: 'Active Weak Infliction Added to Attack',
        stat: UnitStat.weakInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDWEAK],
    }, 'proc:40:add ailment-sick': {
        id: BuffId['proc:40:add ailment-sick'],
        name: 'Active Sick Infliction Added to Attack',
        stat: UnitStat.sickInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDSICK],
    }, 'proc:40:add ailment-injury': {
        id: BuffId['proc:40:add ailment-injury'],
        name: 'Active Injury Infliction Added to Attack',
        stat: UnitStat.injuryInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDINJURY],
    }, 'proc:40:add ailment-curse': {
        id: BuffId['proc:40:add ailment-curse'],
        name: 'Active Curse Infliction Added to Attack',
        stat: UnitStat.curseInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDCURSE],
    }, 'proc:40:add ailment-paralysis': {
        id: BuffId['proc:40:add ailment-paralysis'],
        name: 'Active Paralysis Infliction Added to Attack',
        stat: UnitStat.paralysisInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDPARA],
    }, 'proc:40:add ailment-atk down': {
        id: BuffId['proc:40:add ailment-atk down'],
        name: 'Active Attack Reduction Infliction Added to Attack',
        stat: UnitStat.atkDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDATKDOWN],
    }, 'proc:40:add ailment-def down': {
        id: BuffId['proc:40:add ailment-def down'],
        name: 'Active Defense Reduction Infliction Added to Attack',
        stat: UnitStat.defDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDDEFDOWN],
    }, 'proc:40:add ailment-rec down': {
        id: BuffId['proc:40:add ailment-rec down'],
        name: 'Active Recovery Reduction Infliction Added to Attack',
        stat: UnitStat.recDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDRECDOWN],
    }, 'proc:40:add ailment-unknown': {
        id: BuffId['proc:40:add ailment-unknown'],
        name: 'Active Unknown Ailment Infliction Added to Attack',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.BUFF_ADDAILMENT],
    }, 'proc:42:sacrificial attack': {
        id: BuffId['proc:42:sacrificial attack'],
        name: 'Sacrificial Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL],
    }, 'proc:42:instant death': {
        id: BuffId['proc:42:instant death'],
        name: 'Instant Death to Self (Post-Attack)',
        stackType: BuffStackType.Burst,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL, IconId.BUFF_KO],
    }, 'proc:43:burst od fill': {
        id: BuffId['proc:43:burst od fill'],
        name: 'Burst OD Gauge Fill (Percentage)',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_ODFILLBOOST],
    }, 'proc:44:damage over time': {
        id: BuffId['proc:44:damage over time'],
        name: 'Active Damage over Time',
        stat: UnitStat.damageOverTime,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_TURNDMG],
    }, 'proc:45:attack boost-bb': {
        id: BuffId['proc:45:attack boost-bb'],
        name: 'Active BB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBATKUP],
    }, 'proc:45:attack boost-sbb': {
        id: BuffId['proc:45:attack boost-sbb'],
        name: 'Active SBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SBBATKUP],
    }, 'proc:45:attack boost-ubb': {
        id: BuffId['proc:45:attack boost-ubb'],
        name: 'Active UBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_UBBATKUP],
    }, 'proc:46:non-lethal proportional attack': {
        id: BuffId['proc:46:non-lethal proportional attack'],
        name: 'Non-Lethal Proportional Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
    }, 'proc:47:hp scaled attack': {
        id: BuffId['proc:47:hp scaled attack'],
        name: 'HP Scaled Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPSCALED : IconId.ATK_AOE_HPSCALED],
    }, 'proc:48:piercing attack-base': {
        id: BuffId['proc:48:piercing attack-base'],
        name: 'Piercing Proportional Damage (Base HP)',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
    }, 'proc:48:piercing attack-current': {
        id: BuffId['proc:48:piercing attack-current'],
        name: 'Piercing Proportional Damage (Current HP)',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
    }, 'proc:48:piercing attack-fixed': {
        id: BuffId['proc:48:piercing attack-fixed'],
        name: 'Piercing Fixed Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_FIXED : IconId.ATK_AOE_PIERCING_FIXED],
    }, 'proc:48:piercing attack-unknown': {
        id: BuffId['proc:48:piercing attack-unknown'],
        name: 'Unknown Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
    }, 'proc:49:chance instant death': {
        id: BuffId['proc:49:chance instant death'],
        name: 'Instant Death (Chance)',
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_KO],
    }, 'proc:50:chance damage reflect': {
        id: BuffId['proc:50:chance damage reflect'],
        name: 'Active Damage Reflect (Chance)',
        stat: UnitStat.damageReflect,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_COUNTERDAMAGE],
    }, 'proc:51:add to attack-atk down': {
        id: BuffId['proc:51:add to attack-atk down'],
        name: 'Active Attack Reduction Infliction Added to Attack',
        stat: UnitStat.atkDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDATKDOWN],
    }, 'proc:51:add to attack-def down': {
        id: BuffId['proc:51:add to attack-def down'],
        name: 'Active Defense Reduction Infliction Added to Attack',
        stat: UnitStat.defDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDDEFDOWN],
    }, 'proc:51:add to attack-rec down': {
        id: BuffId['proc:51:add to attack-rec down'],
        name: 'Active Recovery Reduction Infliction Added to Attack',
        stat: UnitStat.recDownInflict,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ADDRECDOWN],
    }, 'proc:52:bc efficacy': {
        id: BuffId['proc:52:bc efficacy'],
        name: 'Active BC Efficacy',
        stat: UnitStat.bcEfficacy,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBFILL],
    }, 'proc:53:inflict on hit-poison': {
        id: BuffId['proc:53:inflict on hit-poison'],
        name: 'Active Poison Counter',
        stat: UnitStat.poisonCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_POISONCOUNTER],
    }, 'proc:53:inflict on hit-weak': {
        id: BuffId['proc:53:inflict on hit-weak'],
        name: 'Active Weak Counter',
        stat: UnitStat.weakCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_WEAKCOUNTER],
    }, 'proc:53:inflict on hit-sick': {
        id: BuffId['proc:53:inflict on hit-sick'],
        name: 'Active Sick Counter',
        stat: UnitStat.sickCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SICKCOUNTER],
    }, 'proc:53:inflict on hit-injury': {
        id: BuffId['proc:53:inflict on hit-injury'],
        name: 'Active Injury Counter',
        stat: UnitStat.injuryCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_INJCONTER],
    }, 'proc:53:inflict on hit-curse': {
        id: BuffId['proc:53:inflict on hit-curse'],
        name: 'Active Curse Counter',
        stat: UnitStat.curseCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_CURSECOUNTER],
    }, 'proc:53:inflict on hit-paralysis': {
        id: BuffId['proc:53:inflict on hit-paralysis'],
        name: 'Active Paralysis Counter',
        stat: UnitStat.paralysisCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_PARALYCOUNTER],
    }, 'proc:54:critical damage boost': {
        id: BuffId['proc:54:critical damage boost'],
        name: 'Active Critical Damage Boost',
        stat: UnitStat.criticalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_CRTUP],
    }, 'proc:55:elemental weakness damage-fire': {
        id: BuffId['proc:55:elemental weakness damage-fire'],
        name: 'Active Fire Elemental Damage Boost',
        stat: UnitStat.fireElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_FIREDMGUP],
    }, 'proc:55:elemental weakness damage-water': {
        id: BuffId['proc:55:elemental weakness damage-water'],
        name: 'Active Water Elemental Damage Boost',
        stat: UnitStat.waterElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_WATERDMGUP],
    }, 'proc:55:elemental weakness damage-earth': {
        id: BuffId['proc:55:elemental weakness damage-earth'],
        name: 'Active Earth Elemental Damage Boost',
        stat: UnitStat.earthElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_EARTHDMGUP],
    }, 'proc:55:elemental weakness damage-thunder': {
        id: BuffId['proc:55:elemental weakness damage-thunder'],
        name: 'Active Thunder Elemental Damage Boost',
        stat: UnitStat.thunderElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_THUNDERDMGUP],
    }, 'proc:55:elemental weakness damage-light': {
        id: BuffId['proc:55:elemental weakness damage-light'],
        name: 'Active Light Elemental Damage Boost',
        stat: UnitStat.lightElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_LIGHTDMGUP],
    }, 'proc:55:elemental weakness damage-dark': {
        id: BuffId['proc:55:elemental weakness damage-dark'],
        name: 'Active Dark Elemental Damage Boost',
        stat: UnitStat.darkElementalDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DARKDMGUP],
    }, 'proc:55:elemental weakness damage-unknown': {
        id: BuffId['proc:55:elemental weakness damage-unknown'],
        name: 'Active Elemental Damage Boost (Unspecified Element)',
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDMGUP],
    }, 'proc:56:chance ko resistance': {
        id: BuffId['proc:56:chance ko resistance'],
        name: 'KO Resistance (Chance)',
        stat: UnitStat.koResistance,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_KOBLOCK],
    }, 'proc:57:bc drop resistance-base': {
        id: BuffId['proc:57:bc drop resistance-base'],
        name: 'Active Base Battle Crystal Drop Rate Reduction',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BCDOWN],
    }, 'proc:57:bc drop resistance-buff': {
        id: BuffId['proc:57:bc drop resistance-buff'],
        name: 'Active Buffed Battle Crystal Drop Rate Reduction',
        stat: UnitStat.bcDropRate,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BCDOWN],
    }, 'proc:57:hc drop resistance-base': {
        id: BuffId['proc:57:hc drop resistance-base'],
        name: 'Active Base Heart Crystal Drop Rate Reduction',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_HCDOWN],
    }, 'proc:57:hc drop resistance-buff': {
        id: BuffId['proc:57:hc drop resistance-buff'],
        name: 'Active Buffed Heart Crystal Drop Rate Reduction',
        stat: UnitStat.hcDropRate,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_HCDOWN],
    }, 'proc:58:spark vulnerability': {
        id: BuffId['proc:58:spark vulnerability'],
        name: 'Active Spark Vulnerability',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKDMGUP],
    }, 'proc:59:attack reduction-bb': {
        id: BuffId['proc:59:attack reduction-bb'],
        name: 'Active BB ATK Reduction',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBATKDOWN],
    }, 'proc:59:attack reduction-sbb': {
        id: BuffId['proc:59:attack reduction-sbb'],
        name: 'Active SBB ATK Reduction',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SBBATKDOWN],
    }, 'proc:59:attack reduction-ubb': {
        id: BuffId['proc:59:attack reduction-ubb'],
        name: 'Active UBB ATK Reduction',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_UBBATKDOWN],
    }, 'proc:61:party bb gauge-scaled attack': {
        id: BuffId['proc:61:party bb gauge-scaled attack'],
        name: 'Party BB Gauge-Scaled Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_BBGAUGESCALED : IconId.ATK_AOE_BBGAUGESCALED],
    }, 'proc:61:party bc drain': {
        id: BuffId['proc:61:party bc drain'],
        name: 'Party BB Gauge Drain (Post-Attack)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Burst,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_BBGAUGESCALED : IconId.ATK_AOE_BBGAUGESCALED, IconId.BUFF_BBFILLDOWN],
    }, 'proc:62:barrier-fire': {
        id: BuffId['proc:62:barrier-fire'],
        name: 'Fire Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_FIRESHIELD],
    }, 'proc:62:barrier-water': {
        id: BuffId['proc:62:barrier-water'],
        name: 'Water Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_WATERSHIELD],
    }, 'proc:62:barrier-earth': {
        id: BuffId['proc:62:barrier-earth'],
        name: 'Earth Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_EARTHSHIELD],
    }, 'proc:62:barrier-thunder': {
        id: BuffId['proc:62:barrier-thunder'],
        name: 'Thunder Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_THUNDERSHIELD],
    }, 'proc:62:barrier-light': {
        id: BuffId['proc:62:barrier-light'],
        name: 'Light Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_LIGHTSHIELD],
    }, 'proc:62:barrier-dark': {
        id: BuffId['proc:62:barrier-dark'],
        name: 'Dark Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_DARKSHIELD],
    }, 'proc:62:barrier-all': {
        id: BuffId['proc:62:barrier-all'],
        name: 'Barrier (All Elements)',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_ELEMENTSHIELD],
    }, 'proc:62:barrier-unknown': {
        id: BuffId['proc:62:barrier-unknown'],
        name: 'Barrier (Unspecified Element)',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_ELEMENTSHIELD],
    }, 'proc:64:consecutive usage attack': {
        id: BuffId['proc:64:consecutive usage attack'],
        name: 'Consecutive Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_USAGESCALED : IconId.ATK_AOE_USAGESCALED],
    }, 'proc:65:ailment attack boost': {
        id: BuffId['proc:65:ailment attack boost'],
        name: 'Active Attack Boost on Status Afflicted Foes',
        stat: UnitStat.ailmentAttackBoost,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_AILDMGUP],
    }, 'proc:66:chance revive': {
        id: BuffId['proc:66:chance revive'],
        name: 'Instant Revive (Chance)',
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_KOBLOCK],
    }, 'proc:67:bc fill on spark': {
        id: BuffId['proc:67:bc fill on spark'],
        name: 'Active BC Fill on Spark',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKBBUP],
    }, 'proc:68:guard mitigation': {
        id: BuffId['proc:68:guard mitigation'],
        name: 'Active Guard Damage Reduction',
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_GUARDCUT],
    }, 'proc:69:bc fill on guard-percent': {
        id: BuffId['proc:69:bc fill on guard-percent'],
        name: 'Active BC Fill on Guard (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'proc:69:bc fill on guard-flat': {
        id: BuffId['proc:69:bc fill on guard-flat'],
        name: 'Active BC Fill on Guard (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_GUARDBBUP],
    }, 'proc:71:bc efficacy reduction': {
        id: BuffId['proc:71:bc efficacy reduction'],
        name: 'Active BC Efficacy Reduction',
        stat: UnitStat.bcEfficacy,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'proc:73:resist-atk down': {
        id: BuffId['proc:73:resist-atk down'],
        name: 'Active Attack Reduction Resistance',
        stat: UnitStat.atkDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTATKDOWN],
    }, 'proc:73:resist-def down': {
        id: BuffId['proc:73:resist-def down'],
        name: 'Active Defense Reduction Resistance',
        stat: UnitStat.defDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTDEFDOWN],
    }, 'proc:73:resist-rec down': {
        id: BuffId['proc:73:resist-rec down'],
        name: 'Active Recovery Reduction Resistance',
        stat: UnitStat.recDownResist,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RESISTRECDOWN],
    }, 'proc:75:element squad-scaled attack': {
        id: BuffId['proc:75:element squad-scaled attack'],
        name: 'Element Squad-Scaled Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_ELEMENTSCALED : IconId.ATK_AOE_ELEMENTSCALED],
    }, 'proc:76:extra action': {
        id: BuffId['proc:76:extra action'],
        name: 'Active Extra Action',
        stat: UnitStat.extraAction,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_DBLSTRIKE],
    }, 'proc:78:self stat boost-atk': {
        id: BuffId['proc:78:self stat boost-atk'],
        name: 'Active Self Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWNLOCK : IconId.BUFF_SELFATKUP],
    }, 'proc:78:self stat boost-def': {
        id: BuffId['proc:78:self stat boost-def'],
        name: 'Active Self Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWNLOCK : IconId.BUFF_SELFDEFUP],
    }, 'proc:78:self stat boost-rec': {
        id: BuffId['proc:78:self stat boost-rec'],
        name: 'Active Self Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWNLOCK : IconId.BUFF_SELFRECUP],
    }, 'proc:78:self stat boost-crit': {
        id: BuffId['proc:78:self stat boost-crit'],
        name: 'Active Self Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWNLOCK : IconId.BUFF_SELFCRTRATEUP],
    }, 'proc:79:player exp boost': {
        id: BuffId['proc:79:player exp boost'],
        name: 'Active Player EXP Boost',
        stat: UnitStat.expModification,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_PLAYEREXP],
    }, 'proc:82:resummon': {
        id: BuffId['proc:82:resummon'],
        name: 'Resummon Unit',
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_SUMMONUNIT],
    }, 'proc:83:spark critical': {
        id: BuffId['proc:83:spark critical'],
        name: 'Active Spark Critical',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKCRTACTIVATED],
    }, 'proc:84:od fill rate': {
        id: BuffId['proc:84:od fill rate'],
        name: 'Active OD Gauge Fill Rate',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_OVERDRIVEUP],
    }, 'proc:85:heal on hit': {
        id: BuffId['proc:85:heal on hit'],
        name: 'Active Heal when Attacked (Chance)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BEENATK_HPREC],
    }, 'proc:86:hp absorb': {
        id: BuffId['proc:86:hp absorb'],
        name: 'Active HP Absorption',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_HPABS],
    }, 'proc:87:heal on spark': {
        id: BuffId['proc:87:heal on spark'],
        name: 'Active Heal on Spark (Chance)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARK_HPREC],
    }, 'proc:88:self spark damage': {
        id: BuffId['proc:88:self spark damage'],
        name: 'Active Self Spark Damage Boost',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.Active,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDMGDOWN2 : IconId.BUFF_SPARKDMGUP2],
    }, 'proc:89:self converted-atk': {
        id: BuffId['proc:89:self converted-atk'],
        name: 'Active Self Converted Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_SELFCONVERTATKDOWN : IconId.BUFF_SELFCONVERTATKUP],
    }, 'proc:89:self converted-def': {
        id: BuffId['proc:89:self converted-def'],
        name: 'Active Self Converted Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_SELFCONVERTDEFDOWN : IconId.BUFF_SELFCONVERTDEFUP],
    }, 'proc:89:self converted-rec': {
        id: BuffId['proc:89:self converted-rec'],
        name: 'Active Self Converted Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: (buff) => [(buff && buff.value && buff.value.value && buff.value.value < 0) ? IconId.BUFF_SELFCONVERTRECDOWN : IconId.BUFF_SELFCONVERTRECUP],
    }, 'proc:92:self max hp boost-flat': {
        id: BuffId['proc:92:self max hp boost-flat'],
        name: 'Self Max HP Boost (Flat Amount)',
        stat: UnitStat.hp,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SELFHPUP],
    }, 'proc:92:self max hp boost-percent': {
        id: BuffId['proc:92:self max hp boost-percent'],
        name: 'Self Max HP Boost (Percentage)',
        stat: UnitStat.hp,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_SELFHPUP],
    }, 'proc:93:critical damage resistance-base': {
        id: BuffId['proc:93:critical damage resistance-base'],
        name: 'Active Base Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'proc:93:critical damage resistance-buff': {
        id: BuffId['proc:93:critical damage resistance-buff'],
        name: 'Active Buffed Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'proc:93:element damage resistance-base': {
        id: BuffId['proc:93:element damage resistance-base'],
        name: 'Active Base Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'proc:93:element damage resistance-buff': {
        id: BuffId['proc:93:element damage resistance-buff'],
        name: 'Active Buffed Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'proc:93:spark damage resistance-base': {
        id: BuffId['proc:93:spark damage resistance-base'],
        name: 'Active Base Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'proc:93:spark damage resistance-buff': {
        id: BuffId['proc:93:spark damage resistance-buff'],
        name: 'Active Buffed Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'proc:94:aoe normal attack': {
        id: BuffId['proc:94:aoe normal attack'],
        name: 'Active Normal Attacks Hit All Foes',
        stat: UnitStat.aoeNormalAttack,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_AOEATK],
    }, 'proc:95:sphere lock': {
        id: BuffId['proc:95:sphere lock'],
        name: 'Active Sphere Lock',
        stat: UnitStat.buffStabilityModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_NULLSPHERE],
    }, 'proc:96:es lock': {
        id: BuffId['proc:96:es lock'],
        name: 'Active Extra Skill Lock',
        stat: UnitStat.buffStabilityModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_NULLES],
    }, 'proc:97:element specific attack': {
        id: BuffId['proc:97:element specific attack'],
        name: 'Element Target Damage',
        stackType: BuffStackType.Attack,
        icons: (buff) => {
            let elements;
            if (buff && buff.conditions && buff.conditions.targetElements && buff.conditions.targetElements.length > 0) {
                elements = buff.conditions.targetElements;
            }
            else {
                elements = [BuffConditionElement.Unknown];
            }
            const elementalIconKeys = elements.map((inputElement) => {
                const element = typeof inputElement === 'string' ? inputElement : '';
                let iconKey = `BUFF_${element.toUpperCase()}DMGUP`;
                if (!(iconKey in IconId)) {
                    iconKey = 'BUFF_ELEMENTDMGUP';
                }
                return IconId[iconKey];
            });
            return [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE].concat(elementalIconKeys);
        },
    }, 'proc:113:gradual od fill': {
        id: BuffId['proc:113:gradual od fill'],
        name: 'Active Gradual OD Gauge Fill (Flat Amount)',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ODFILLBOOST],
    }, 'proc:119:gradual bc drain-flat': {
        id: BuffId['proc:119:gradual bc drain-flat'],
        name: 'Active Gradual BB Gauge Drain (Chance) (Flat Amount)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBREDUC],
    }, 'proc:119:gradual bc drain-percent': {
        id: BuffId['proc:119:gradual bc drain-percent'],
        name: 'Active Gradual BB Gauge Drain (Chance) (Percentage)',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_BBREDUC],
    }, 'proc:123:od gauge drain': {
        id: BuffId['proc:123:od gauge drain'],
        name: 'Burst OD Gauge Drain',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_ODFILLDRAIN],
    }, 'proc:126:damage over time reduction': {
        id: BuffId['proc:126:damage over time reduction'],
        name: 'Active Damage Over Time Reduction',
        stat: UnitStat.damageOverTimeMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_ATKREDUC],
    }, 'proc:127:lock on': {
        id: BuffId['proc:127:lock on'],
        name: 'Active Lock On',
        stat: UnitStat.targetingModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_TARGETED],
    }, 'proc:130:inflict on hit-atk down': {
        id: BuffId['proc:130:inflict on hit-atk down'],
        name: 'Active Attack Reduction Counter (Chance)',
        stat: UnitStat.atkDownCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_PROB_ATKREDUC],
    }, 'proc:130:inflict on hit-def down': {
        id: BuffId['proc:130:inflict on hit-def down'],
        name: 'Active Defense Reduction Counter (Chance)',
        stat: UnitStat.defDownCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_PROB_DEFREDUC],
    }, 'proc:130:inflict on hit-rec down': {
        id: BuffId['proc:130:inflict on hit-rec down'],
        name: 'Active Recovery Reduction Counter (Chance)',
        stat: UnitStat.recDownCounter,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_PROB_RECREDUC],
    }, 'proc:131:spark damage mitigation': {
        id: BuffId['proc:131:spark damage mitigation'],
        name: 'Active Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'proc:132:chance inflict vulnerability-critical': {
        id: BuffId['proc:132:chance inflict vulnerability-critical'],
        name: 'Critical Damage Vulnerability Infliction (Chance)',
        stat: UnitStat.criticalDamageVulnerability,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_CRITDMG_VUL],
    }, 'proc:132:chance inflict vulnerability-elemental': {
        id: BuffId['proc:132:chance inflict vulnerability-elemental'],
        name: 'Elemental Damage Vulnerability Infliction (Chance)',
        stat: UnitStat.elementalDamageVulnerability,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_ELEDMG_VUL],
    }, 'proc:901:raid burst heal': {
        id: BuffId['proc:901:raid burst heal'],
        name: 'Burst Heal (Raid)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RAIDHPREC],
    }, 'proc:902:raid stat boost-atk': {
        id: BuffId['proc:902:raid stat boost-atk'],
        name: 'Active Attack Boost (Raid)',
        stat: UnitStat.atk,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAIDATKUP],
    }, 'proc:902:raid stat boost-def': {
        id: BuffId['proc:902:raid stat boost-def'],
        name: 'Active Defense Boost (Raid)',
        stat: UnitStat.def,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAIDDEFUP],
    }, 'proc:902:raid stat boost-rec': {
        id: BuffId['proc:902:raid stat boost-rec'],
        name: 'Active Recovery Boost (Raid)',
        stat: UnitStat.rec,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAIDRECUP],
    }, 'proc:902:raid stat boost-crit': {
        id: BuffId['proc:902:raid stat boost-crit'],
        name: 'Active Critical Hit Rate Boost (Raid)',
        stat: UnitStat.crit,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAIDCRTUP],
    }, 'proc:903:boss location reveal': {
        id: BuffId['proc:903:boss location reveal'],
        name: 'Active Boss Location Reveal (Raid)',
        stat: UnitStat.mapModification,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAID_BOSS_REVEAL],
    }, 'proc:905:teleport to camp': {
        id: BuffId['proc:905:teleport to camp'],
        name: 'Teleport Player to Camp (Raid)',
        stat: UnitStat.mapModification,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RAID_TELEPORT],
    }, 'proc:906:flee battle': {
        id: BuffId['proc:906:flee battle'],
        name: 'Flee Battle (Raid)',
        stat: UnitStat.battleModification,
        stackType: BuffStackType.Burst,
        icons: () => [IconId.BUFF_RAID_FLEE],
    }, 'proc:907:raid mitigation': {
        id: BuffId['proc:907:raid mitigation'],
        name: 'Active Damage Reduction (Raid)',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.Active,
        icons: () => [IconId.BUFF_RAID_DAMAGECUT],
    }, 'proc:908:raid drop rate multiplier': {
        id: BuffId['proc:908:raid drop rate multiplier'],
        name: 'Item Drop Rate Boost (Raid)',
        stat: UnitStat.itemDropRate,
        stackType: BuffStackType.Passive,
        icons: () => [IconId.BUFF_RAID_ITEMDROP],
    }, UNKNOWN_CONDITIONAL_EFFECT_ID: {
        id: BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID,
        name: 'Unknown Conditional Effect',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, UNKNOWN_CONDITIONAL_BUFF_PARAMS: {
        id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
        name: 'Unknown Conditional Buff Parameters',
        stackType: BuffStackType.Unknown,
        icons: () => [IconId.UNKNOWN],
    }, 'conditional:1:attack buff': {
        id: BuffId['conditional:1:attack buff'],
        name: 'Conditional Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
    }, 'conditional:3:defense buff': {
        id: BuffId['conditional:3:defense buff'],
        name: 'Conditional Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
    }, 'conditional:5:recovery buff': {
        id: BuffId['conditional:5:recovery buff'],
        name: 'Conditional Recovery Boost',
        stat: UnitStat.rec,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
    }, 'conditional:7:critical hit rate buff': {
        id: BuffId['conditional:7:critical hit rate buff'],
        name: 'Conditional Critical Hit Rate Boost',
        stat: UnitStat.crit,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
    }, 'conditional:8:gradual heal': {
        id: BuffId['conditional:8:gradual heal'],
        name: 'Conditional Gradual Heal',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_HPREC],
    }, 'conditional:12:guaranteed ko resistance': {
        id: BuffId['conditional:12:guaranteed ko resistance'],
        name: 'Conditional Guaranteed KO Resistance',
        stat: UnitStat.koResistance,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_KOBLK],
    } }), (() => {
    const createIconGetterForStat = (stat) => {
        return (buff) => {
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
        'conditional:13:elemental attack buff': {
            id: BuffId['conditional:13:elemental attack buff'],
            name: 'Passive Elemental Attack Boost',
            stat: UnitStat.atk,
            stackType: BuffStackType.ConditionalTimed,
            icons: createIconGetterForStat('ATK'),
        },
        'conditional:14:elemental defense buff': {
            id: BuffId['conditional:14:elemental defense buff'],
            name: 'Passive Elemental Defense Boost',
            stat: UnitStat.def,
            stackType: BuffStackType.ConditionalTimed,
            icons: createIconGetterForStat('DEF'),
        },
    };
})()), { 'conditional:21:fire mitigation': {
        id: BuffId['conditional:21:fire mitigation'],
        name: 'Conditional Fire Damage Reduction',
        stat: UnitStat.fireMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_FIREDMGDOWN],
    }, 'conditional:22:water mitigation': {
        id: BuffId['conditional:22:water mitigation'],
        name: 'Conditional Water Damage Reduction',
        stat: UnitStat.waterMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_WATERDMGDOWN],
    }, 'conditional:23:earth mitigation': {
        id: BuffId['conditional:23:earth mitigation'],
        name: 'Conditional Earth Damage Reduction',
        stat: UnitStat.earthMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_EARTHDMGDOWN],
    }, 'conditional:24:thunder mitigation': {
        id: BuffId['conditional:24:thunder mitigation'],
        name: 'Conditional Thunder Damage Reduction',
        stat: UnitStat.thunderMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_THUNDERDMGDOWN],
    }, 'conditional:25:light mitigation': {
        id: BuffId['conditional:25:light mitigation'],
        name: 'Conditional Light Damage Reduction',
        stat: UnitStat.lightMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_LIGHTDMGDOWN],
    }, 'conditional:26:dark mitigation': {
        id: BuffId['conditional:26:dark mitigation'],
        name: 'Conditional Dark Damage Reduction',
        stat: UnitStat.darkMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_DARKDMGDOWN],
    }, 'conditional:36:mitigation': {
        id: BuffId['conditional:36:mitigation'],
        name: 'Conditional Damage Reduction',
        stat: UnitStat.mitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_DAMAGECUT],
    }, 'conditional:37:gradual bc fill': {
        id: BuffId['conditional:37:gradual bc fill'],
        name: 'Conditional Gradual BC Fill',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_BBREC],
    }, 'conditional:40:spark damage': {
        id: BuffId['conditional:40:spark damage'],
        name: 'Conditional Spark Damage Boost',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
    }, 'conditional:51:add fire element': {
        id: BuffId['conditional:51:add fire element'],
        name: 'Conditional Added Fire Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDFIRE],
    }, 'conditional:52:add water element': {
        id: BuffId['conditional:52:add water element'],
        name: 'Conditional Added Water Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDWATER],
    }, 'conditional:53:add earth element': {
        id: BuffId['conditional:53:add earth element'],
        name: 'Conditional Added Earth Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDEARTH],
    }, 'conditional:54:add thunder element': {
        id: BuffId['conditional:54:add thunder element'],
        name: 'Conditional Added Thunder Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDTHUNDER],
    }, 'conditional:55:add light element': {
        id: BuffId['conditional:55:add light element'],
        name: 'Conditional Added Light Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDLIGHT],
    }, 'conditional:56:add dark element': {
        id: BuffId['conditional:56:add dark element'],
        name: 'Conditional Added Dark Element to Attack',
        stat: UnitStat.elementModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDDARK],
    }, 'conditional:72:attack boost-bb': {
        id: BuffId['conditional:72:attack boost-bb'],
        name: 'Conditional BB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_BBATKUP],
    }, 'conditional:72:attack boost-sbb': {
        id: BuffId['conditional:72:attack boost-sbb'],
        name: 'Conditional SBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_SBBATKUP],
    }, 'conditional:72:attack boost-ubb': {
        id: BuffId['conditional:72:attack boost-ubb'],
        name: 'Conditional UBB ATK Boost',
        stat: UnitStat.bbAtk,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_UBBATKUP],
    }, 'conditional:74:add atk down to attack': {
        id: BuffId['conditional:74:add atk down to attack'],
        name: 'Conditional Attack Reduction Infliction Added to Attack',
        stat: UnitStat.atkDownInflict,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDATKDOWN],
    }, 'conditional:75:add def down to attack': {
        id: BuffId['conditional:75:add def down to attack'],
        name: 'Conditional Defense Reduction Infliction Added to Attack',
        stat: UnitStat.defDownInflict,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ADDDEFDOWN],
    }, 'conditional:84:critical damage': {
        id: BuffId['conditional:84:critical damage'],
        name: 'Conditional Critical Damage Boost',
        stat: UnitStat.criticalDamage,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_CRTUP],
    }, 'conditional:91:chance ko resistance': {
        id: BuffId['conditional:91:chance ko resistance'],
        name: 'Conditional KO Resistance (Chance)',
        stat: UnitStat.koResistance,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_KOBLOCK],
    }, 'conditional:95:fire barrier': {
        id: BuffId['conditional:95:fire barrier'],
        name: 'Conditional Fire Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_FIRESHIELD],
    }, 'conditional:96:water barrier': {
        id: BuffId['conditional:96:water barrier'],
        name: 'Conditional Water Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_WATERSHIELD],
    }, 'conditional:97:earth barrier': {
        id: BuffId['conditional:97:earth barrier'],
        name: 'Conditional Earth Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_EARTHSHIELD],
    }, 'conditional:98:thunder barrier': {
        id: BuffId['conditional:98:thunder barrier'],
        name: 'Conditional Thunder Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_THUNDERSHIELD],
    }, 'conditional:99:light barrier': {
        id: BuffId['conditional:99:light barrier'],
        name: 'Conditional Light Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_LIGHTSHIELD],
    }, 'conditional:100:dark barrier': {
        id: BuffId['conditional:100:dark barrier'],
        name: 'Conditional Dark Barrier',
        stat: UnitStat.barrier,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.BUFF_DARKSHIELD],
    }, 'conditional:111:bc fill on spark': {
        id: BuffId['conditional:111:bc fill on spark'],
        name: 'Conditional BC Fill on Spark',
        stat: UnitStat.bbGauge,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_SPARKBBUP],
    }, 'conditional:112:bc efficacy reduction': {
        id: BuffId['conditional:112:bc efficacy reduction'],
        name: 'Conditional BC Efficacy Reduction',
        stat: UnitStat.bcEfficacy,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_BBFILLDOWN],
    }, 'conditional:124:self attack buff': {
        id: BuffId['conditional:124:self attack buff'],
        name: 'Conditional Self Attack Boost',
        stat: UnitStat.atk,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWNLOCK : IconId.BUFF_SELFATKUP],
    }, 'conditional:125:self defense buff': {
        id: BuffId['conditional:125:self defense buff'],
        name: 'Conditional Self Defense Boost',
        stat: UnitStat.def,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWNLOCK : IconId.BUFF_SELFDEFUP],
    }, 'conditional:131:spark critical': {
        id: BuffId['conditional:131:spark critical'],
        name: 'Conditional Spark Critical',
        stat: UnitStat.sparkDamage,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_SPARKCRTACTIVATED],
    }, 'conditional:132:od fill rate': {
        id: BuffId['conditional:132:od fill rate'],
        name: 'Conditional OD Gauge Fill Rate',
        stat: UnitStat.odGauge,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_OVERDRIVEUP],
    }, 'conditional:133:heal on hit': {
        id: BuffId['conditional:133:heal on hit'],
        name: 'Conditional Heal when Attacked (Chance)',
        stat: UnitStat.hpRecovery,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_BEENATK_HPREC],
    }, 'conditional:143:critical damage reduction-base': {
        id: BuffId['conditional:143:critical damage reduction-base'],
        name: 'Conditional Base Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'conditional:143:critical damage reduction-buff': {
        id: BuffId['conditional:143:critical damage reduction-buff'],
        name: 'Conditional Buffed Critical Damage Reduction',
        stat: UnitStat.criticalDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_CRTDOWN],
    }, 'conditional:144:spark damage reduction-base': {
        id: BuffId['conditional:144:spark damage reduction-base'],
        name: 'Conditional Base Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'conditional:144:spark damage reduction-buff': {
        id: BuffId['conditional:144:spark damage reduction-buff'],
        name: 'Conditional Buffed Spark Damage Reduction',
        stat: UnitStat.sparkDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_SPARKDMGDOWN],
    }, 'conditional:145:elemental weakness damage reduction-base': {
        id: BuffId['conditional:145:elemental weakness damage reduction-base'],
        name: 'Conditional Base Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'conditional:145:elemental weakness damage reduction-buff': {
        id: BuffId['conditional:145:elemental weakness damage reduction-buff'],
        name: 'Conditional Buffed Elemental Weakness Damage Reduction',
        stat: UnitStat.elementalWeaknessDamageMitigation,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_ELEMENTDOWN],
    }, 'conditional:153:chance inflict atk down on hit': {
        id: BuffId['conditional:153:chance inflict atk down on hit'],
        name: 'Conditional Attack Reduction Counter (Chance)',
        stat: UnitStat.atkDownCounter,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.BUFF_PROB_ATKREDUC],
    }, 'conditional:10001:stealth': {
        id: BuffId['conditional:10001:stealth'],
        name: 'Conditional Stealth',
        stat: UnitStat.targetingModification,
        stackType: BuffStackType.ConditionalTimed,
        icons: () => [IconId.SG_BUFF_STEALTH],
    }, 'conditional:10001:stealth-atk': {
        id: BuffId['conditional:10001:stealth-atk'],
        name: 'Conditional Attack Boost (from Stealth)',
        stat: UnitStat.atk,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [IconId.SG_BUFF_STEALTH, (buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
    }, 'conditional:10001:stealth-def': {
        id: BuffId['conditional:10001:stealth-def'],
        name: 'Conditional Defense Boost (from Stealth)',
        stat: UnitStat.def,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [IconId.SG_BUFF_STEALTH, (buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
    }, 'conditional:10001:stealth-rec': {
        id: BuffId['conditional:10001:stealth-rec'],
        name: 'Conditional Recovery Boost (from Stealth)',
        stat: UnitStat.rec,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [IconId.SG_BUFF_STEALTH, (buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
    }, 'conditional:10001:stealth-crit': {
        id: BuffId['conditional:10001:stealth-crit'],
        name: 'Conditional Critical Hit Rate Boost (from Stealth)',
        stat: UnitStat.crit,
        stackType: BuffStackType.ConditionalTimed,
        icons: (buff) => [IconId.SG_BUFF_STEALTH, (buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
    }, 'conditional:10500:shield-all': {
        id: BuffId['conditional:10500:shield-all'],
        name: 'Non-Elemental Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_ALL],
    }, 'conditional:10500:shield-fire': {
        id: BuffId['conditional:10500:shield-fire'],
        name: 'Fire Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_FIRE],
    }, 'conditional:10500:shield-water': {
        id: BuffId['conditional:10500:shield-water'],
        name: 'Water Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_WATER],
    }, 'conditional:10500:shield-earth': {
        id: BuffId['conditional:10500:shield-earth'],
        name: 'Earth Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_EARTH],
    }, 'conditional:10500:shield-thunder': {
        id: BuffId['conditional:10500:shield-thunder'],
        name: 'Thunder Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_THUNDER],
    }, 'conditional:10500:shield-light': {
        id: BuffId['conditional:10500:shield-light'],
        name: 'Light Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_LIGHT],
    }, 'conditional:10500:shield-dark': {
        id: BuffId['conditional:10500:shield-dark'],
        name: 'Dark Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_DARK],
    }, 'conditional:10500:shield-unknown': {
        id: BuffId['conditional:10500:shield-unknown'],
        name: 'Dark Shield',
        stat: UnitStat.shield,
        stackType: BuffStackType.Singleton,
        icons: () => [IconId.SG_BUFF_UNKNOWN],
    } }));

/**
 * @description Get the associated metadata entry for a given buff ID.
 * @param id Buff ID to get metadata for.
 * @param metadata Optional source to use as metadata; defaults to internal buff metadata.
 * @returns Corresponding buff metadata entry if it exists, undefined otherwise.
 */
function getMetadataForBuff(id, metadata = BUFF_METADATA) {
    return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
        ? metadata[id]
        : (void 0);
}

var index$6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    convertProcEffectToBuffs: convertProcEffectToBuffs,
    convertPassiveEffectToBuffs: convertPassiveEffectToBuffs,
    convertConditionalEffectToBuffs: convertConditionalEffectToBuffs,
    get BuffSource () { return BuffSource; },
    get BuffStackType () { return BuffStackType; },
    BUFF_METADATA: BUFF_METADATA,
    getMetadataForBuff: getMetadataForBuff
});

var index$5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    constants: constants,
    parsers: index$6,
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
    get ProcBuffType () { return ProcBuffType; },
    PASSIVE_METADATA: PASSIVE_METADATA,
    PROC_METADATA: PROC_METADATA
});

/**
 * @description Get the effects of a given extra skill.
 * @param skill Extra skill to get the effects of.
 * @returns Effects of the given extra skill if they exist, an empty array otherwise.
 */
function getEffectsForExtraSkill(skill) {
    return (skill && Array.isArray(skill.effects)) ? skill.effects : [];
}

var index$4 = /*#__PURE__*/Object.freeze({
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
        }
        else if (Array.isArray(item.effect.effect)) {
            const { effect, target_area: targetArea, target_type: targetType } = item.effect;
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

var index$3 = /*#__PURE__*/Object.freeze({
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

var index$2 = /*#__PURE__*/Object.freeze({
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
        fullIllustration: `unit_ills_full_${fileNameSuffix}`,
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

var index$1 = /*#__PURE__*/Object.freeze({
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
                const unwrappedEffect = Object.assign(Object.assign({}, originalEffect), { sp_type: spType });
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
        if (index >= 0 && index <= 25) { // A-Z
            correspondingCharacterCode = index + CHARACTER_CODE_FOR_UPPERCASE_A;
        }
        else if (index >= 26 && index <= 51) { // a-z
            correspondingCharacterCode = (index - 26) + CHARACTER_CODE_FOR_LOWERCASE_A;
        }
        else if (index >= 52 && index <= 61) { // 0-9
            correspondingCharacterCode = (index - 52) + CHARACTER_CODE_FOR_NUMBER_0;
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
        }
        else if (code >= 'a' && code <= 'z') {
            characterCodeOffset = CHARACTER_CODE_FOR_LOWERCASE_A - 26;
        }
        else if (code >= '0' && code <= '9') {
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
    return (typeof id === 'string' && id.split('@')[1]) || id;
}

/**
 * @description Get the first SP Enhancement Entry that matches the given SP Entry ID, if it exists.
 * @param id SP Enhancement entry ID.
 * @param entries Collection of SP Enhancement entries to search in.
 * @returns Corresponding SP Enhancement entry with the given SP ID, undefined otherwise.
 */
function getSpEntryWithId(id, entries) {
    const spId = getSpEntryId(id);
    return (id && Array.isArray(entries) && entries.find(e => getSpEntryId(e && e.id) === spId)) || void 0;
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
        dependents = allEntries
            .filter(s => {
            return s.dependency &&
                s.dependency.includes(entryId) &&
                !addedEntries.has(s);
        });
        dependents.forEach(dependent => {
            addedEntries.add(dependent);
            const subDependents = getAllEntriesThatDependOnSpEntry(dependent, allEntries, addedEntries);
            dependents = dependents.concat(subDependents);
        });
    }
    return dependents;
}

var index = /*#__PURE__*/Object.freeze({
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

exports.buffs = index$5;
exports.bursts = index$7;
exports.datamineTypes = datamineTypes;
exports.extraSkills = index$4;
exports.items = index$3;
exports.leaderSkills = index$2;
exports.spEnhancements = index;
exports.units = index$1;
exports.version = version;
