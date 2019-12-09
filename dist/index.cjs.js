'use strict';

var ProcBuffType;
(function (ProcBuffType) {
    ProcBuffType["Attack"] = "Attack";
})(ProcBuffType || (ProcBuffType = {}));
/* eslint-disable */
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

var ArenaCondition;
(function (ArenaCondition) {
    /* eslint-disable @typescript-eslint/camelcase */
    ArenaCondition["hp_50pr_under"] = "hp_50pr_under";
    ArenaCondition["hp_50pr_over"] = "hp_50pr_over";
    ArenaCondition["hp_75pr_under"] = "hp_75pr_under";
    ArenaCondition["hp_25pr_under"] = "hp_25pr_under";
    ArenaCondition["hp_min"] = "hp_min";
    ArenaCondition["hp_max"] = "hp_max";
    ArenaCondition["atk_max"] = "atk_max";
    ArenaCondition["random"] = "random";
    /* eslint-enable @typescript-eslint/camelcase */
})(ArenaCondition || (ArenaCondition = {}));
var MoveType;
(function (MoveType) {
    MoveType[MoveType["Moving"] = 1] = "Moving";
    MoveType[MoveType["Teleporting"] = 2] = "Teleporting";
    MoveType[MoveType["NonMoving"] = 3] = "NonMoving";
})(MoveType || (MoveType = {}));
var TargetArea;
(function (TargetArea) {
    TargetArea["Aoe"] = "aoe";
    TargetArea["Single"] = "single";
    TargetArea["Random"] = "random";
})(TargetArea || (TargetArea = {}));
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
})(UnitGettingType || (UnitGettingType = {}));
var UnitKind;
(function (UnitKind) {
    UnitKind["Normal"] = "normal";
    UnitKind["Evolution"] = "evo";
    UnitKind["Enhancing"] = "enhancing";
    UnitKind["Sale"] = "sale";
})(UnitKind || (UnitKind = {}));
var ItemType;
(function (ItemType) {
    ItemType["Consumable"] = "consumable";
    ItemType["Material"] = "material";
    ItemType["Sphere"] = "sphere";
    ItemType["EvolutionMaterial"] = "evomat";
    ItemType["SummonerConsumable"] = "summoner_consumable";
    ItemType["LeaderSkillSphere"] = "ls_sphere";
})(ItemType || (ItemType = {}));

/**
 * @description Determine if a given proc ID's type is an attack
 * @param id proc ID to check
 */
function isAttackingProcId(id) {
    const metadataEntry = Object.hasOwnProperty.call(PROC_METADATA, id) && PROC_METADATA[id];
    return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
}
/**
 * @description Create a list of objects that contain both the effect data and its corresponding damage frame
 * @param effects List of proc effects to combine; must be the same length as the `damageFrames`
 * @param damageFrames List of damage frames whose index corresponds with the effect in the `effects` list
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
function getEffectId(effect) {
    let resultId = '';
    if (effect) {
        resultId = effect['proc id'] || effect['unknown proc id'] ||
            effect['passive id'] || effect['unknown passive id'] || '';
    }
    return resultId;
}

var buffs = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isAttackingProcId: isAttackingProcId,
    combineEffectsAndDamageFrames: combineEffectsAndDamageFrames,
    getEffectId: getEffectId
});

var KNOWN_PROC_ID;
(function (KNOWN_PROC_ID) {
    KNOWN_PROC_ID["BurstHeal"] = "2";
})(KNOWN_PROC_ID || (KNOWN_PROC_ID = {}));
var KNOWN_PASSIVE_ID;
(function (KNOWN_PASSIVE_ID) {
    KNOWN_PASSIVE_ID["TriggeredEffect"] = "66";
})(KNOWN_PASSIVE_ID || (KNOWN_PASSIVE_ID = {}));

/**
 * @description Grab the level entry of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get level entry from
 * @param level Optional 1-indexed level to get; if not specified, the last level of the burst is used.
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
 * @description Grab the effects at the level entry of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get effects from
 * @param level Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used.
 */
function getEffectsForBurst(burst, level) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    return (levelEntry && Array.isArray(levelEntry.effects)) ? levelEntry.effects : [];
}
function getExtraAttackDamageFramesEntry(damageFrames, effectDelay = '0.0/0') {
    // relevant frames are all effects for healing or attacking
    const inputFrames = Array.isArray(damageFrames) ? damageFrames : [];
    const relevantFrames = inputFrames.filter(frame => {
        const procId = getEffectId(frame);
        return procId === KNOWN_PROC_ID.BurstHeal || isAttackingProcId(procId);
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

var bursts = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getLevelEntryForBurst: getLevelEntryForBurst,
    getEffectsForBurst: getEffectsForBurst,
    getExtraAttackDamageFramesEntry: getExtraAttackDamageFramesEntry
});

/**
 * @description Get the effects of a given extra skill
 * @param skill extra skill to get the effects of
 */
function getEffectsForExtraSkill(skill) {
    return (skill && Array.isArray(skill.effects)) ? skill.effects : [];
}

var extraSkills = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForExtraSkill: getEffectsForExtraSkill
});

/**
 * @description Get the effects of a given item
 * @param item item to get the effects of, if any are present
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

var items = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForItem: getEffectsForItem
});

/**
 * @description Get the effects of a given leader skill
 * @param skill leader skill to get the effects of
 */
function getEffectsForLeaderSkill(skill) {
    return skill && Array.isArray(skill.effects) ? skill.effects : [];
}

var leaderSkills = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getEffectsForLeaderSkill: getEffectsForLeaderSkill
});

var index = {
    buffs,
    bursts,
    extraSkills,
    items,
    leaderSkills,
};

module.exports = index;
