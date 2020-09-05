import {
	BuffId,
	UnitStat,
	BuffStackType,
	IconId,
	IBuff,
	BuffConditionElement,
} from './buff-types';
import { TargetArea, UnitElement, UnitType, UnitGender } from '../../datamine-types';

export interface IBuffMetadata {
	id: BuffId;
	name: string;

	/**
	 * @description Unit stat that the given buff affects
	 */
	stat?: UnitStat;

	stackType: BuffStackType;

	/**
	 * @description Retrieves set of icons that represents this specific buff. Most buffs have a single icon, but
	 * more can be specified if an effect affects multiple parts of a unit state. For example, the stealth effect affects both targeting
	 * and self-stats but in-game it only shows a single icon; implementation in this library is such that there is a stealth entry
	 * and separate stat entries that a given stealth effect may change, and those separate stat entries have two icons: the stealth
	 * icon and the self-boost stat icon. On the contrary, the add elements effect can add multiple elements, but because it shows
	 * up as individual buffs in-game, there is a separate buff entry for each added element.
	 */
	icons: (buff: IBuff) => IconId[];
	// TODO: value schema for filters?
}

export const BUFF_METADATA: Readonly<{ [id: string]: IBuffMetadata }> = Object.freeze({
	'TURN_DURATION_MODIFICATION': {
		id: BuffId.TURN_DURATION_MODIFICATION,
		name: 'Passive Turn Duration Modification',
		stat: UnitStat.turnDurationModification,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [
			(buff && buff.value &&
				(buff.value as { duration?: number }).duration &&
				(buff.value as { duration: number }).duration < 0) ?
				IconId.TURN_DURATION_DOWN : IconId.TURN_DURATION_UP],
	},
	'NO_PARAMS_SPECIFIED': {
		id: BuffId.NO_PARAMS_SPECIFIED,
		name: 'No Parameters Specified',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'UNKNOWN_PASSIVE_EFFECT_ID': {
		id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
		name: 'Unknown Passive Effect',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'UNKNOWN_PASSIVE_BUFF_PARAMS': {
		id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
		name: 'Unknown Passive Buff Parameters',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'passive:1:hp': {
		id: BuffId['passive:1:hp'],
		name: 'Passive HP Boost',
		stat: UnitStat.hp,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP],
	},
	'passive:1:atk': {
		id: BuffId['passive:1:atk'],
		name: 'Passive Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'passive:1:def': {
		id: BuffId['passive:1:def'],
		name: 'Passive Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'passive:1:rec': {
		id: BuffId['passive:1:rec'],
		name: 'Passive Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'passive:1:crit': {
		id: BuffId['passive:1:crit'],
		name: 'Passive Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
	},
	...(() => {
		const createIconGetterForStat = (stat: string) => {
			return (buff: IBuff) => {
				let element: UnitElement | BuffConditionElement | string = '';
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
				return [IconId[iconKey as IconId]];
			};
		};

		return {
			'passive:2:hp': {
				id: BuffId['passive:2:hp'],
				name: 'Passive Elemental HP Boost',
				stat: UnitStat.hp,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('HP'),
			},
			'passive:2:atk': {
				id: BuffId['passive:2:atk'],
				name: 'Passive Elemental Attack Boost',
				stat: UnitStat.atk,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('ATK'),
			},
			'passive:2:def': {
				id: BuffId['passive:2:def'],
				name: 'Passive Elemental Defense Boost',
				stat: UnitStat.def,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('DEF'),
			},
			'passive:2:rec': {
				id: BuffId['passive:2:rec'],
				name: 'Passive Elemental Recovery Boost',
				stat: UnitStat.rec,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('REC'),
			},
			'passive:2:crit': {
				id: BuffId['passive:2:crit'],
				name: 'Passive Elemental Critical Hit Rate Boost',
				stat: UnitStat.crit,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('CRTRATE'),
			},
		};
	})(),
	...(() => {
		const createIconGetterForStat = (stat: string) => {
			return (buff: IBuff) => {
				let unitType: UnitType | 'unknown' | string = '';
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
				return [IconId[iconKey as IconId]];
			};
		};

		return {
			'passive:3:hp': {
				id: BuffId['passive:3:hp'],
				name: 'Passive Type-Based HP Boost',
				stat: UnitStat.hp,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('HP'),
			},
			'passive:3:atk': {
				id: BuffId['passive:3:atk'],
				name: 'Passive Type-Based Attack Boost',
				stat: UnitStat.atk,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('ATK'),
			},
			'passive:3:def': {
				id: BuffId['passive:3:def'],
				name: 'Passive Type-Based Defense Boost',
				stat: UnitStat.def,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('DEF'),
			},
			'passive:3:rec': {
				id: BuffId['passive:3:rec'],
				name: 'Passive Type-Based Recovery Boost',
				stat: UnitStat.rec,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('REC'),
			},
			'passive:3:crit': {
				id: BuffId['passive:3:crit'],
				name: 'Passive Type-Based Critical Hit Rate Boost',
				stat: UnitStat.crit,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('CRTRATE'),
			},
		};
	})(),
	'passive:4:poison': {
		id: BuffId['passive:4:poison'],
		name: 'Passive Poison Resist',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'passive:4:weak': {
		id: BuffId['passive:4:weak'],
		name: 'Passive Weak Resist',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'passive:4:sick': {
		id: BuffId['passive:4:sick'],
		name: 'Passive Sick Resist',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'passive:4:injury': {
		id: BuffId['passive:4:injury'],
		name: 'Passive Injury Resist',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'passive:4:curse': {
		id: BuffId['passive:4:curse'],
		name: 'Passive Curse Resist',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'passive:4:paralysis': {
		id: BuffId['passive:4:paralysis'],
		name: 'Passive Paralysis Resist',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'passive:5:fire': {
		id: BuffId['passive:5:fire'],
		name: 'Passive Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'passive:5:water': {
		id: BuffId['passive:5:water'],
		name: 'Passive Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'passive:5:earth': {
		id: BuffId['passive:5:earth'],
		name: 'Passive Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'passive:5:thunder': {
		id: BuffId['passive:5:thunder'],
		name: 'Passive Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'passive:5:light': {
		id: BuffId['passive:5:light'],
		name: 'Passive Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'passive:5:dark': {
		id: BuffId['passive:5:dark'],
		name: 'Passive Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'passive:5:unknown': {
		id: BuffId['passive:5:unknown'],
		name: 'Passive Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'passive:8': {
		id: BuffId['passive:8'],
		name: 'Passive Damage Reduction',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'passive:9': {
		id: BuffId['passive:9'],
		name: 'Passive Gradual BC Fill',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:10': {
		id: BuffId['passive:10'],
		name: 'Passive HC Efficacy',
		stat: UnitStat.hcEfficacy,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HCREC],
	},
	'passive:11:atk': {
		id: BuffId['passive:11:atk'],
		name: 'Passive HP-Conditional Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHATKDOWN : IconId.BUFF_HPTHRESHATKUP],
	},
	'passive:11:def': {
		id: BuffId['passive:11:def'],
		name: 'Passive HP-Conditional Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHDEFDOWN : IconId.BUFF_HPTHRESHDEFUP],
	},
	'passive:11:rec': {
		id: BuffId['passive:11:rec'],
		name: 'Passive HP-Conditional Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHRECDOWN : IconId.BUFF_HPTHRESHRECUP],
	},
	'passive:11:crit': {
		id: BuffId['passive:11:crit'],
		name: 'Passive HP-Conditional Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHCRTRATEDOWN : IconId.BUFF_HPTHRESHCRTRATEUP],
	},
	'passive:12:bc': {
		id: BuffId['passive:12:bc'],
		name: 'Passive HP-Conditional Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHBCDOWN : IconId.BUFF_HPTHRESHBCDROP],
	},
	'passive:12:hc': {
		id: BuffId['passive:12:hc'],
		name: 'Passive HP-Conditional Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHHCDOWN : IconId.BUFF_HPTHRESHHCDROP],
	},
	'passive:12:item': {
		id: BuffId['passive:12:item'],
		name: 'Passive HP-Conditional Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHITEMDOWN : IconId.BUFF_HPTHRESHITEMDROP],
	},
	'passive:12:zel': {
		id: BuffId['passive:12:zel'],
		name: 'Passive HP-Conditional Zel Drop Rate Boost',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHZELDOWN : IconId.BUFF_HPTHRESHZELDROP],
	},
	'passive:12:karma': {
		id: BuffId['passive:12:karma'],
		name: 'Passive HP-Conditional Karma Drop Rate Boost',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHKARMADOWN : IconId.BUFF_HPTHRESHKARMADROP],
	},
	'passive:13': {
		id: BuffId['passive:13'],
		name: 'Passive BC Fill on Enemy Defeat',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:14': {
		id: BuffId['passive:14'],
		name: 'Passive Damage Reduction (Chance)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'passive:15': {
		id: BuffId['passive:15'],
		name: 'Passive Heal on Enemy Defeat',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:16': {
		id: BuffId['passive:16'],
		name: 'Passive Heal on Battle Win',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:17': {
		id: BuffId['passive:17'],
		name: 'HP Absorption',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPABS],
	},
	'passive:19:bc': {
		id: BuffId['passive:19:bc'],
		name: 'Passive Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
	},
	'passive:19:hc': {
		id: BuffId['passive:19:hc'],
		name: 'Passive Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
	},
	'passive:19:item': {
		id: BuffId['passive:19:item'],
		name: 'Passive Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
	},
	'passive:19:zel': {
		id: BuffId['passive:19:zel'],
		name: 'Passive Zel Drop Rate Boost',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_ZELDROP],
	},
	'passive:19:karma': {
		id: BuffId['passive:19:karma'],
		name: 'Passive Karma Drop Rate Boost',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_KARMADROP],
	},
	'passive:20:poison': {
		id: BuffId['passive:20:poison'],
		name: 'Passive Poison Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDPOISON],
	},
	'passive:20:weak': {
		id: BuffId['passive:20:weak'],
		name: 'Passive Weak Infliction',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDWEAK],
	},
	'passive:20:sick': {
		id: BuffId['passive:20:sick'],
		name: 'Passive Sick Infliction',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDSICK],
	},
	'passive:20:injury': {
		id: BuffId['passive:20:injury'],
		name: 'Passive Injury Infliction',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDINJURY],
	},
	'passive:20:curse': {
		id: BuffId['passive:20:curse'],
		name: 'Passive Curse Infliction',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDCURSE],
	},
	'passive:20:paralysis': {
		id: BuffId['passive:20:paralysis'],
		name: 'Passive Paralysis Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDPARA],
	},
	'passive:20:atk down': {
		id: BuffId['passive:20:atk down'],
		name: 'Passive Attack Reduction Infliction',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'passive:20:def down': {
		id: BuffId['passive:20:def down'],
		name: 'Passive Defense Reduction Infliction',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDDEFDOWN],
	},
	'passive:20:rec down': {
		id: BuffId['passive:20:rec down'],
		name: 'Passive Recovery Reduction Infliction',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDRECDOWN],
	},
	'passive:20:unknown': {
		id: BuffId['passive:20:unknown'],
		name: 'Passive Unknown Ailment Infliction',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_ADDAILMENT],
	},
	'passive:21:atk': {
		id: BuffId['passive:21:atk'],
		name: 'Attack Boost for X Turns',
		stat: UnitStat.atk,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'passive:21:def': {
		id: BuffId['passive:21:def'],
		name: 'Defense Boost for X Turns',
		stat: UnitStat.def,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'passive:21:rec': {
		id: BuffId['passive:21:rec'],
		name: 'Recovery Boost for X Turns',
		stat: UnitStat.rec,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'passive:21:crit': {
		id: BuffId['passive:21:crit'],
		name: 'Critical Hit Rate Boost for X Turns',
		stat: UnitStat.crit,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
	},
	'passive:23': {
		id: BuffId['passive:23'],
		name: 'Passive BC Fill on Battle Win',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:24': {
		id: BuffId['passive:24'],
		name: 'Passive Heal when Attacked',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BEENATK_HPREC],
	},
	'passive:25': {
		id: BuffId['passive:25'],
		name: 'Passive BC Fill when Attacked',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGEBB],
	},
	'passive:26': {
		id: BuffId['passive:26'],
		name: 'Passive Damage Counter (Chance)',
		stat: UnitStat.damageReflect,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_COUNTERDAMAGE],
	},
	'passive:27': {
		id: BuffId['passive:27'],
		name: 'Passive Target Chance Modification',
		stat: UnitStat.targetingModification,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_REPENEATT : IconId.BUFF_GETENEATT],
	},
	'passive:28': {
		id: BuffId['passive:28'],
		name: 'Passive HP-Conditional Target Chance Modification',
		stat: UnitStat.targetingModification,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHREPENEATT : IconId.BUFF_HPTHRESHGETENEATT],
	},
	'passive:29': {
		id: BuffId['passive:29'],
		name: 'Passive Defense Ignore (Chance)',
		stat: UnitStat.defenseIgnore,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_IGNOREDEF],
	},
	'passive:30:atk': {
		id: BuffId['passive:30:atk'],
		name: 'Passive BB Gauge Conditional Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHATKDOWN : IconId.BUFF_BBGAUGETHRESHATKUP],
	},
	'passive:30:def': {
		id: BuffId['passive:30:def'],
		name: 'Passive BB Gauge Conditional Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHDEFDOWN : IconId.BUFF_BBGAUGETHRESHDEFUP],
	},
	'passive:30:rec': {
		id: BuffId['passive:30:rec'],
		name: 'Passive BB Gauge Conditional Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHRECDOWN : IconId.BUFF_BBGAUGETHRESHRECUP],
	},
	'passive:30:crit': {
		id: BuffId['passive:30:crit'],
		name: 'Passive BB Gauge Conditional Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN : IconId.BUFF_BBGAUGETHRESHCRTRATEUP],
	},
	'passive:31:damage': {
		id: BuffId['passive:31:damage'],
		name: 'Passive Spark Damage Boost',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
	},
	'passive:31:bc': {
		id: BuffId['passive:31:bc'],
		name: 'Passive Battle Crystal Drop Rate Boost during Spark',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_SPARKBC],
	},
	'passive:31:hc': {
		id: BuffId['passive:31:hc'],
		name: 'Passive Heart Crystal Drop Rate Boost during Spark',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_SPARKHC],
	},
	'passive:31:item': {
		id: BuffId['passive:31:item'],
		name: 'Passive Item Drop Rate Boost during Spark',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_SPARKITEM],
	},
	'passive:31:zel': {
		id: BuffId['passive:31:zel'],
		name: 'Passive Zel Drop Rate Boost during Spark',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_SPARKZEL],
	},
	'passive:31:karma': {
		id: BuffId['passive:31:karma'],
		name: 'Passive Karma Drop Rate Boost during Spark',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_SPARKKARMA],
	},
	'passive:32': {
		id: BuffId['passive:32'],
		name: 'Passive BC Efficacy',
		stat: UnitStat.bcEfficacy,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBFILL],
	},
	'passive:33': {
		id: BuffId['passive:33'],
		name: 'Passive Gradual Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:34': {
		id: BuffId['passive:34'],
		name: 'Passive Critical Damage Boost',
		stat: UnitStat.criticalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTUP],
	},
	'passive:35': {
		id: BuffId['passive:35'],
		name: 'Passive BC Fill when Normal Attacking',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:36': {
		id: BuffId['passive:36'],
		name: 'Passive Extra Action',
		stat: UnitStat.extraAction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DBLSTRIKE],
	},
	'passive:37': {
		id: BuffId['passive:37'],
		name: 'Passive Hit Count Boost',
		stat: UnitStat.hitCountModification,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HITUP],
	},
	'passive:40:atk': {
		id: BuffId['passive:40:atk'],
		name: 'Passive Converted Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
	},
	'passive:40:def': {
		id: BuffId['passive:40:def'],
		name: 'Passive Converted Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
	},
	'passive:40:rec': {
		id: BuffId['passive:40:rec'],
		name: 'Passive Converted Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
	},
	'passive:41:hp': {
		id: BuffId['passive:41:hp'],
		name: 'Passive Element Squad-based HP Boost',
		stat: UnitStat.hp,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTHPDOWN : IconId.BUFF_UNIQUEELEMENTHPUP],
	},
	'passive:41:atk': {
		id: BuffId['passive:41:atk'],
		name: 'Passive Element Squad-based Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTATKDOWN : IconId.BUFF_UNIQUEELEMENTATKUP],
	},
	'passive:41:def': {
		id: BuffId['passive:41:def'],
		name: 'Passive Element Squad-based Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTDEFDOWN : IconId.BUFF_UNIQUEELEMENTDEFUP],
	},
	'passive:41:rec': {
		id: BuffId['passive:41:rec'],
		name: 'Passive Element Squad-based Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTRECDOWN : IconId.BUFF_UNIQUEELEMENTRECUP],
	},
	'passive:41:crit': {
		id: BuffId['passive:41:crit'],
		name: 'Passive Element Squad-based Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTCRTRATEDOWN : IconId.BUFF_UNIQUEELEMENTCRTRATEUP],
	},
	...(() => {
		const createIconGetterForStat = (stat: string) => {
			return (buff: IBuff) => {
				let gender: UnitGender | 'unknown' | string = '';
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
				return [IconId[iconKey as IconId]];
			};
		};

		return {
			'passive:42:hp': {
				id: BuffId['passive:42:hp'],
				name: 'Passive Gender-Based HP Boost',
				stat: UnitStat.hp,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('HP'),
			},
			'passive:42:atk': {
				id: BuffId['passive:42:atk'],
				name: 'Passive Gender-Based Attack Boost',
				stat: UnitStat.atk,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('ATK'),
			},
			'passive:42:def': {
				id: BuffId['passive:42:def'],
				name: 'Passive Gender-Based Defense Boost',
				stat: UnitStat.def,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('DEF'),
			},
			'passive:42:rec': {
				id: BuffId['passive:42:rec'],
				name: 'Passive Gender-Based Recovery Boost',
				stat: UnitStat.rec,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('REC'),
			},
			'passive:42:crit': {
				id: BuffId['passive:42:crit'],
				name: 'Passive Gender-Based Critical Hit Rate Boost',
				stat: UnitStat.crit,
				stackType: BuffStackType.Passive,
				icons: createIconGetterForStat('CRTRATE'),
			},
		};
	})(),
	'passive:43': {
		id: BuffId['passive:43'],
		name: 'Passive Damage Reduction To One (Chance)',
		stat: UnitStat.reduceDamageToOne,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUTTOONE],
	},
	'passive:44:hp': {
		id: BuffId['passive:44:hp'],
		name: 'Passive Flat HP Boost',
		stat: UnitStat.hp,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP],
	},
	'passive:44:atk': {
		id: BuffId['passive:44:atk'],
		name: 'Passive Flat Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'passive:44:def': {
		id: BuffId['passive:44:def'],
		name: 'Passive Flat Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'passive:44:rec': {
		id: BuffId['passive:44:rec'],
		name: 'Passive Flat Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'passive:44:crit': {
		id: BuffId['passive:44:crit'],
		name: 'Passive Flat Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
	},
	'passive:45:base': {
		id: BuffId['passive:45:base'],
		name: 'Passive Base Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:45:buff': {
		id: BuffId['passive:45:buff'],
		name: 'Passive Buffed Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:46:atk': {
		id: BuffId['passive:46:atk'],
		name: 'Passive Attack Boost Relative to HP',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDATKDOWN : IconId.BUFF_HPSCALEDATKUP],
	},
	'passive:46:def': {
		id: BuffId['passive:46:def'],
		name: 'Passive Defense Boost Relative to HP',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDDEFDOWN : IconId.BUFF_HPSCALEDDEFUP],
	},
	'passive:46:rec': {
		id: BuffId['passive:46:rec'],
		name: 'Passive Recovery Boost Relative to HP',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDRECDOWN : IconId.BUFF_HPSCALEDRECUP],
	},
	'passive:47': {
		id: BuffId['passive:47'],
		name: 'Passive BC Fill on Spark',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SPARKBBUP],
	},
	'passive:48': {
		id: BuffId['passive:48'],
		name: 'Passive BC Cost Reduction',
		stat: UnitStat.bcCostReduction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBCOST_REDUCTION],
	},
	'passive:49': {
		id: BuffId['passive:49'],
		name: 'Passive BB Gauge Consumption Reduction',
		stat: UnitStat.bbGaugeConsumptionReduction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:50:fire': {
		id: BuffId['passive:50:fire'],
		name: 'Passive Fire Elemental Damage Boost',
		stat: UnitStat.fireElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_FIREDMGUP],
	},
	'passive:50:water': {
		id: BuffId['passive:50:water'],
		name: 'Passive Water Elemental Damage Boost',
		stat: UnitStat.waterElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WATERDMGUP],
	},
	'passive:50:earth': {
		id: BuffId['passive:50:earth'],
		name: 'Passive Earth Elemental Damage Boost',
		stat: UnitStat.earthElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_EARTHDMGUP],
	},
	'passive:50:thunder': {
		id: BuffId['passive:50:thunder'],
		name: 'Passive Thunder Elemental Damage Boost',
		stat: UnitStat.thunderElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_THUNDERDMGUP],
	},
	'passive:50:light': {
		id: BuffId['passive:50:light'],
		name: 'Passive Light Elemental Damage Boost',
		stat: UnitStat.lightElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_LIGHTDMGUP],
	},
	'passive:50:dark': {
		id: BuffId['passive:50:dark'],
		name: 'Passive Dark Elemental Damage Boost',
		stat: UnitStat.darkElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DARKDMGUP],
	},
	'passive:50:unknown': {
		id: BuffId['passive:50:unknown'],
		name: 'Passive Elemental Damage Boost (Unspecified Element)',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDMGUP],
	},
	'passive:53:critical-damage-base': {
		id: BuffId['passive:53:critical-damage-base'],
		name: 'Passive Base Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:critical-damage-buff': {
		id: BuffId['passive:53:critical-damage-buff'],
		name: 'Passive Buffed Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:element-damage-base': {
		id: BuffId['passive:53:element-damage-base'],
		name: 'Passive Base Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'passive:53:element-damage-buff': {
		id: BuffId['passive:53:element-damage-buff'],
		name: 'Passive Buffed Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'passive:53:critical-rate-base': {
		id: BuffId['passive:53:critical-rate-base'],
		name: 'Passive Base Critical Hit Rate Reduction',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:critical-rate-buff': {
		id: BuffId['passive:53:critical-rate-buff'],
		name: 'Passive Buffed Critical Hit Rate Reduction',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'UNKNOWN_PROC_EFFECT_ID': {
		id: BuffId.UNKNOWN_PROC_EFFECT_ID,
		name: 'Unknown Proc Effect',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'UNKNOWN_PROC_BUFF_PARAMS': {
		id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
		name: 'Unknown Proc Buff Parameters',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'proc:1': {
		id: BuffId['proc:1'],
		name: 'Regular Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
	},
	'proc:2': {
		id: BuffId['proc:2'],
		name: 'Burst Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:3': {
		id: BuffId['proc:3'],
		name: 'Active Gradual Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:4:flat': {
		id: BuffId['proc:4:flat'],
		name: 'Burst BC Fill (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:4:percent': {
		id: BuffId['proc:4:percent'],
		name: 'Burst BC Fill (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	...(() => {
		const createIconGetterForStat = (stat: string) => {
			return (buff: IBuff) => {
				let element: UnitElement | BuffConditionElement | string = '';
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
				return [IconId[iconKey as IconId]];
			};
		};

		return {
			'proc:5:atk': {
				id: BuffId['proc:5:atk'],
				name: 'Active Regular/Elemental Attack Boost',
				stat: UnitStat.atk,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('ATK'),
			},
			'proc:5:def': {
				id: BuffId['proc:5:def'],
				name: 'Active Regular/Elemental Defense Boost',
				stat: UnitStat.def,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('DEF'),
			},
			'proc:5:rec': {
				id: BuffId['proc:5:rec'],
				name: 'Active Regular/Elemental Recovery Boost',
				stat: UnitStat.rec,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('REC'),
			},
			'proc:5:crit': {
				id: BuffId['proc:5:crit'],
				name: 'Active Regular/Elemental Critical Hit Rate Boost',
				stat: UnitStat.crit,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('CRTRATE'),
			},
		};
	})(),
	'proc:6:bc': {
		id: BuffId['proc:6:bc'],
		name: 'Active Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
	},
	'proc:6:hc': {
		id: BuffId['proc:6:hc'],
		name: 'Active Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
	},
	'proc:6:item': {
		id: BuffId['proc:6:item'],
		name: 'Active Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
	},
	'proc:7': {
		id: BuffId['proc:7'],
		name: 'Guaranteed KO Resistance',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_KOBLK],
	},
	'proc:8:flat': {
		id: BuffId['proc:8:flat'],
		name: 'Max HP Boost (Flat Amount)',
		stat: UnitStat.hp,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_HPUP],
	},
	'proc:8:percent': {
		id: BuffId['proc:8:percent'],
		name: 'Max HP Boost (Percentage)',
		stat: UnitStat.hp,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_HPUP],
	},
	...(() => {
		const createIconGetterForStat = (stat: string) => {
			return (buff: IBuff) => {
				let element: UnitElement | BuffConditionElement | string = '';
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
				return [IconId[iconKey as IconId]];
			};
		};

		return {
			'proc:9:atk': {
				id: BuffId['proc:9:atk'],
				name: 'Active Regular/Elemental Attack Reduction',
				stat: UnitStat.atk,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('ATK'),
			},
			'proc:9:def': {
				id: BuffId['proc:9:def'],
				name: 'Active Regular/Elemental Defense Reduction',
				stat: UnitStat.def,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('DEF'),
			},
			'proc:9:rec': {
				id: BuffId['proc:9:rec'],
				name: 'Active Regular/Elemental Recovery Reduction',
				stat: UnitStat.rec,
				stackType: BuffStackType.Active,
				icons: createIconGetterForStat('REC'),
			},
			'proc:9:unknown': {
				id: BuffId['proc:9:unknown'],
				name: 'Active Regular/Elemental Unknown Stat Reduction',
				stackType: BuffStackType.Active,
				icons: () => [IconId.UNKNOWN],
			},
		};
	})(),
	'proc:10:poison': {
		id: BuffId['proc:10:poison'],
		name: 'Poison Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:10:weak': {
		id: BuffId['proc:10:weak'],
		name: 'Weak Cleanse',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:10:sick': {
		id: BuffId['proc:10:sick'],
		name: 'Sick Cleanse',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:10:injury': {
		id: BuffId['proc:10:injury'],
		name: 'Injury Cleanse',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:10:curse': {
		id: BuffId['proc:10:curse'],
		name: 'Curse Cleanse',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:10:paralysis': {
		id: BuffId['proc:10:paralysis'],
		name: 'Paralysis Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:10:atk down': {
		id: BuffId['proc:10:atk down'],
		name: 'Attack Reduction Cleanse',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_ATKDOWNBLK],
	},
	'proc:10:def down': {
		id: BuffId['proc:10:def down'],
		name: 'Defense Reduction Cleanse',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_DEFDOWNBLK],
	},
	'proc:10:rec down': {
		id: BuffId['proc:10:rec down'],
		name: 'Recovery Reduction Cleanse',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RECDOWNBLK],
	},
	'proc:10:unknown': {
		id: BuffId['proc:10:unknown'],
		name: 'Unknown Ailment Cleanse',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_AILMENTBLK],
	},
	'proc:11:poison': {
		id: BuffId['proc:11:poison'],
		name: 'Poison Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_POISON],
	},
	'proc:11:weak': {
		id: BuffId['proc:11:weak'],
		name: 'Weak Infliction',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_WEAK],
	},
	'proc:11:sick': {
		id: BuffId['proc:11:sick'],
		name: 'Sick Infliction',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_SICK],
	},
	'proc:11:injury': {
		id: BuffId['proc:11:injury'],
		name: 'Injury Infliction',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_INJURY],
	},
	'proc:11:curse': {
		id: BuffId['proc:11:curse'],
		name: 'Curse Infliction',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_CURSE],
	},
	'proc:11:paralysis': {
		id: BuffId['proc:11:paralysis'],
		name: 'Paralysis Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_PARALYSIS],
	},
	'proc:11:atk down': {
		id: BuffId['proc:11:atk down'],
		name: 'Attack Reduction Infliction',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_ATKDOWN],
	},
	'proc:11:def down': {
		id: BuffId['proc:11:def down'],
		name: 'Defense Reduction Infliction',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_DEFDOWN],
	},
	'proc:11:rec down': {
		id: BuffId['proc:11:rec down'],
		name: 'Recovery Reduction Infliction',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RECDOWN],
	},
	'proc:11:unknown': {
		id: BuffId['proc:11:unknown'],
		name: 'Unknown Ailment Infliction',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.DEBUFF_AILMENT],
	},
	'proc:12': {
		id: BuffId['proc:12'],
		name: 'Instant Revive (Guaranteed)',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_KOBLK],
	},
	'proc:13': {
		id: BuffId['proc:13'],
		name: 'Random Target Damage',
		stackType: BuffStackType.Attack,
		icons: () => [IconId.ATK_RT],
	},
	'proc:14': {
		id: BuffId['proc:14'],
		name: 'Lifesteal Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPREC : IconId.ATK_AOE_HPREC],
	},
	'proc:16:fire': {
		id: BuffId['proc:16:fire'],
		name: 'Active Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'proc:16:water': {
		id: BuffId['proc:16:water'],
		name: 'Active Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'proc:16:earth': {
		id: BuffId['proc:16:earth'],
		name: 'Active Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'proc:16:thunder': {
		id: BuffId['proc:16:thunder'],
		name: 'Active Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'proc:16:light': {
		id: BuffId['proc:16:light'],
		name: 'Active Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'proc:16:dark': {
		id: BuffId['proc:16:dark'],
		name: 'Active Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'proc:16:all': {
		id: BuffId['proc:16:all'],
		name: 'Active Elemental Damage Reduction (All Elements)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:16:unknown': {
		id: BuffId['proc:16:unknown'],
		name: 'Active Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:17:poison': {
		id: BuffId['proc:17:poison'],
		name: 'Active Poison Resist',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:17:weak': {
		id: BuffId['proc:17:weak'],
		name: 'Active Weak Resist',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:17:sick': {
		id: BuffId['proc:17:sick'],
		name: 'Active Sick Resist',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:17:injury': {
		id: BuffId['proc:17:injury'],
		name: 'Active Injury Resist',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:17:curse': {
		id: BuffId['proc:17:curse'],
		name: 'Active Curse Resist',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:17:paralysis': {
		id: BuffId['proc:17:paralysis'],
		name: 'Active Paralysis Resist',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:18': {
		id: BuffId['proc:18'],
		name: 'Active Damage Reduction',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'proc:19': {
		id: BuffId['proc:19'],
		name: 'Active Gradual BC Fill',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:20': {
		id: BuffId['proc:20'],
		name: 'Active BC Fill when attacked',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DAMAGEBB],
	},
	'proc:22': {
		id: BuffId['proc:22'],
		name: 'Active Defense Ignore',
		stat: UnitStat.defenseIgnore,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_IGNOREDEF],
	},
	'proc:23': {
		id: BuffId['proc:23'],
		name: 'Active Spark Damage Boost',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
	},
	'proc:24:atk': {
		id: BuffId['proc:24:atk'],
		name: 'Active Converted Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
	},
	'proc:24:def': {
		id: BuffId['proc:24:def'],
		name: 'Active Converted Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
	},
	'proc:24:rec': {
		id: BuffId['proc:24:rec'],
		name: 'Active Converted Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
	},
	'proc:26': {
		id: BuffId['proc:26'],
		name: 'Active Hit Count Boost',
		stat: UnitStat.hitCountModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HITUP],
	},
	'proc:27': {
		id: BuffId['proc:27'],
		name: 'Proportional Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
	},
	'proc:28': {
		id: BuffId['proc:28'],
		name: 'Fixed Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_FIXED : IconId.ATK_AOE_FIXED],
	},
	'proc:29': {
		id: BuffId['proc:29'],
		name: 'Multi-Element Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_MULTIELEMENT : IconId.ATK_AOE_MULTIELEMENT],
	},
	'proc:30:fire': {
		id: BuffId['proc:30:fire'],
		name: 'Active Added Element to Attack (Fire)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDFIRE],
	},
	'proc:30:water': {
		id: BuffId['proc:30:water'],
		name: 'Active Added Element to Attack (Water)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDWATER],
	},
	'proc:30:earth': {
		id: BuffId['proc:30:earth'],
		name: 'Active Added Element to Attack (Earth)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDEARTH],
	},
	'proc:30:thunder': {
		id: BuffId['proc:30:thunder'],
		name: 'Active Added Element to Attack (Thunder)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDTHUNDER],
	},
	'proc:30:light': {
		id: BuffId['proc:30:light'],
		name: 'Active Added Element to Attack (Light)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDLIGHT],
	},
	'proc:30:dark': {
		id: BuffId['proc:30:dark'],
		name: 'Active Added Element to Attack (Dark)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDDARK],
	},
	'proc:30:unknown': {
		id: BuffId['proc:30:unknown'],
		name: 'Active Added Element to Attack (Unspecified Element)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDELEMENT],
	},
	'proc:31:flat': {
		id: BuffId['proc:31:flat'],
		name: 'Burst BC Fill (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:31:percent': {
		id: BuffId['proc:31:percent'],
		name: 'Burst BC Fill (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:32:fire': {
		id: BuffId['proc:32:fire'],
		name: 'Element Shift (Fire)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTFIRE],
	},
	'proc:32:water': {
		id: BuffId['proc:32:water'],
		name: 'Element Shift (Water)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTWATER],
	},
	'proc:32:earth': {
		id: BuffId['proc:32:earth'],
		name: 'Element Shift (Earth)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTEARTH],
	},
	'proc:32:thunder': {
		id: BuffId['proc:32:thunder'],
		name: 'Element Shift (Thunder)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTTHUNDER],
	},
	'proc:32:light': {
		id: BuffId['proc:32:light'],
		name: 'Element Shift (Light)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTLIGHT],
	},
	'proc:32:dark': {
		id: BuffId['proc:32:dark'],
		name: 'Element Shift (Dark)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTDARK],
	},
	'proc:32:unknown': {
		id: BuffId['proc:32:unknown'],
		name: 'Element Shift (Unspecified Element)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTELEMENT],
	},
	'proc:33': {
		id: BuffId['proc:33'],
		name: 'Buff Removal',
		stat: UnitStat.buffStabilityModification,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_REMOVEBUFF],
	},
	'proc:34:flat': {
		id: BuffId['proc:34:flat'],
		name: 'Burst BB Gauge Drain (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBFILLDOWN],
	},
	'proc:34:percent': {
		id: BuffId['proc:34:percent'],
		name: 'Burst BB Gauge Drain (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBFILLDOWN],
	},
	'proc:36': {
		id: BuffId['proc:36'],
		name: 'Active Leader Skill Lock',
		stat: UnitStat.buffStabilityModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DISABLELS],
	},
	'proc:37': {
		id: BuffId['proc:37'],
		name: 'Summon Unit',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SUMMONUNIT],
	},
	'proc:38:poison': {
		id: BuffId['proc:38:poison'],
		name: 'Poison Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:38:weak': {
		id: BuffId['proc:38:weak'],
		name: 'Weak Cleanse',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:38:sick': {
		id: BuffId['proc:38:sick'],
		name: 'Sick Cleanse',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:38:injury': {
		id: BuffId['proc:38:injury'],
		name: 'Injury Cleanse',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:38:curse': {
		id: BuffId['proc:38:curse'],
		name: 'Curse Cleanse',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:38:paralysis': {
		id: BuffId['proc:38:paralysis'],
		name: 'Paralysis Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:38:atk down': {
		id: BuffId['proc:38:atk down'],
		name: 'Attack Reduction Cleanse',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_ATKDOWNBLK],
	},
	'proc:38:def down': {
		id: BuffId['proc:38:def down'],
		name: 'Defense Reduction Cleanse',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_DEFDOWNBLK],
	},
	'proc:38:rec down': {
		id: BuffId['proc:38:rec down'],
		name: 'Recovery Reduction Cleanse',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RECDOWNBLK],
	},
	'proc:38:unknown': {
		id: BuffId['proc:38:unknown'],
		name: 'Unknown Ailment Cleanse',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_AILMENTBLK],
	},
	'proc:39:fire': {
		id: BuffId['proc:39:fire'],
		name: 'Active Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'proc:39:water': {
		id: BuffId['proc:39:water'],
		name: 'Active Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'proc:39:earth': {
		id: BuffId['proc:39:earth'],
		name: 'Active Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'proc:39:thunder': {
		id: BuffId['proc:39:thunder'],
		name: 'Active Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'proc:39:light': {
		id: BuffId['proc:39:light'],
		name: 'Active Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'proc:39:dark': {
		id: BuffId['proc:39:dark'],
		name: 'Active Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'proc:39:unknown': {
		id: BuffId['proc:39:unknown'],
		name: 'Active Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:40:poison': {
		id: BuffId['proc:40:poison'],
		name: 'Active Poison Infliction Added to Attack',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDPOISON],
	},
	'proc:40:weak': {
		id: BuffId['proc:40:weak'],
		name: 'Active Weak Infliction Added to Attack',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDWEAK],
	},
	'proc:40:sick': {
		id: BuffId['proc:40:sick'],
		name: 'Active Sick Infliction Added to Attack',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDSICK],
	},
	'proc:40:injury': {
		id: BuffId['proc:40:injury'],
		name: 'Active Injury Infliction Added to Attack',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDINJURY],
	},
	'proc:40:curse': {
		id: BuffId['proc:40:curse'],
		name: 'Active Curse Infliction Added to Attack',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDCURSE],
	},
	'proc:40:paralysis': {
		id: BuffId['proc:40:paralysis'],
		name: 'Active Paralysis Infliction Added to Attack',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDPARA],
	},
	'proc:40:atk down': {
		id: BuffId['proc:40:atk down'],
		name: 'Active Attack Reduction Infliction Added to Attack',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'proc:40:def down': {
		id: BuffId['proc:40:def down'],
		name: 'Active Defense Reduction Infliction Added to Attack',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDDEFDOWN],
	},
	'proc:40:rec down': {
		id: BuffId['proc:40:rec down'],
		name: 'Active Recovery Reduction Infliction Added to Attack',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDRECDOWN],
	},
	'proc:40:unknown': {
		id: BuffId['proc:40:unknown'],
		name: 'Active Unknown Ailment Infliction Added to Attack',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_ADDAILMENT],
	},
	'proc:42': {
		id: BuffId['proc:42'],
		name: 'Sacrificial Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL],
	},
	'proc:43': {
		id: BuffId['proc:43'],
		name: 'Burst OD Gauge Fill (Percentage)',
		stat: UnitStat.odGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_OVERDRIVEUP],
	},
	'proc:44': {
		id: BuffId['proc:44'],
		name: 'Active Damage over Time',
		stat: UnitStat.damageOverTime,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_TURNDMG],
	},
	'proc:45:bb': {
		id: BuffId['proc:45:bb'],
		name: 'Active BB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBATKUP],
	},
	'proc:45:sbb': {
		id: BuffId['proc:45:sbb'],
		name: 'Active SBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SBBATKUP],
	},
	'proc:45:ubb': {
		id: BuffId['proc:45:ubb'],
		name: 'Active UBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_UBBATKUP],
	},
	'proc:46': {
		id: BuffId['proc:46'],
		name: 'Non-Lethal Proportional Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
	},
	'proc:47': {
		id: BuffId['proc:47'],
		name: 'HP Scaled Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPSCALED : IconId.ATK_AOE_HPSCALED],
	},
	'proc:48:base': {
		id: BuffId['proc:48:base'],
		name: 'Piercing Proportional Damage (Base HP)',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
	},
	'proc:48:current': {
		id: BuffId['proc:48:current'],
		name: 'Piercing Proportional Damage (Current HP)',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
	},
	'proc:48:fixed': {
		id: BuffId['proc:48:fixed'],
		name: 'Piercing Fixed Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_FIXED : IconId.ATK_AOE_PIERCING_FIXED],
	},
	'proc:48:unknown': {
		id: BuffId['proc:48:unknown'],
		name: 'Unknown Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
	},
	'proc:49': {
		id: BuffId['proc:49'],
		name: 'Instant Death (Chance)',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_KO],
	},
	'proc:50': {
		id: BuffId['proc:50'],
		name: 'Active Damage Reflect (Chance)',
		stat: UnitStat.damageReflect,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_COUNTERDAMAGE],
	},
});
