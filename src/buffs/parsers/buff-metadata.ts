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
	TURN_DURATION_MODIFICATION: {
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
	NO_PARAMS_SPECIFIED: {
		id: BuffId.NO_PARAMS_SPECIFIED,
		name: 'No Parameters Specified',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	UNKNOWN_PASSIVE_EFFECT_ID: {
		id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
		name: 'Unknown Passive Effect',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	UNKNOWN_PASSIVE_BUFF_PARAMS: {
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
	})(),
	'passive:4:resist-poison': {
		id: BuffId['passive:4:resist-poison'],
		name: 'Passive Poison Resistance',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'passive:4:resist-weak': {
		id: BuffId['passive:4:resist-weak'],
		name: 'Passive Weak Resistance',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'passive:4:resist-sick': {
		id: BuffId['passive:4:resist-sick'],
		name: 'Passive Sick Resistance',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'passive:4:resist-injury': {
		id: BuffId['passive:4:resist-injury'],
		name: 'Passive Injury Resistance',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'passive:4:resist-curse': {
		id: BuffId['passive:4:resist-curse'],
		name: 'Passive Curse Resistance',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'passive:4:resist-paralysis': {
		id: BuffId['passive:4:resist-paralysis'],
		name: 'Passive Paralysis Resistance',
		stat: UnitStat.paralysisResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'passive:5:mitigate-fire': {
		id: BuffId['passive:5:mitigate-fire'],
		name: 'Passive Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'passive:5:mitigate-water': {
		id: BuffId['passive:5:mitigate-water'],
		name: 'Passive Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'passive:5:mitigate-earth': {
		id: BuffId['passive:5:mitigate-earth'],
		name: 'Passive Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'passive:5:mitigate-thunder': {
		id: BuffId['passive:5:mitigate-thunder'],
		name: 'Passive Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'passive:5:mitigate-light': {
		id: BuffId['passive:5:mitigate-light'],
		name: 'Passive Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'passive:5:mitigate-dark': {
		id: BuffId['passive:5:mitigate-dark'],
		name: 'Passive Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'passive:5:mitigate-unknown': {
		id: BuffId['passive:5:mitigate-unknown'],
		name: 'Passive Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'passive:8:mitigation': {
		id: BuffId['passive:8:mitigation'],
		name: 'Passive Damage Reduction',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'passive:9:gradual bc fill': {
		id: BuffId['passive:9:gradual bc fill'],
		name: 'Passive Gradual BC Fill',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:10:hc efficacy': {
		id: BuffId['passive:10:hc efficacy'],
		name: 'Passive HC Efficacy',
		stat: UnitStat.hcEfficacy,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HCREC],
	},
	'passive:11:hp conditional-atk': {
		id: BuffId['passive:11:hp conditional-atk'],
		name: 'Passive HP-Conditional Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHATKDOWN : IconId.BUFF_HPTHRESHATKUP],
	},
	'passive:11:hp conditional-def': {
		id: BuffId['passive:11:hp conditional-def'],
		name: 'Passive HP-Conditional Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHDEFDOWN : IconId.BUFF_HPTHRESHDEFUP],
	},
	'passive:11:hp conditional-rec': {
		id: BuffId['passive:11:hp conditional-rec'],
		name: 'Passive HP-Conditional Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHRECDOWN : IconId.BUFF_HPTHRESHRECUP],
	},
	'passive:11:hp conditional-crit': {
		id: BuffId['passive:11:hp conditional-crit'],
		name: 'Passive HP-Conditional Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHCRTRATEDOWN : IconId.BUFF_HPTHRESHCRTRATEUP],
	},
	'passive:12:hp conditional drop boost-bc': {
		id: BuffId['passive:12:hp conditional drop boost-bc'],
		name: 'Passive HP-Conditional Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHBCDOWN : IconId.BUFF_HPTHRESHBCDROP],
	},
	'passive:12:hp conditional drop boost-hc': {
		id: BuffId['passive:12:hp conditional drop boost-hc'],
		name: 'Passive HP-Conditional Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHHCDOWN : IconId.BUFF_HPTHRESHHCDROP],
	},
	'passive:12:hp conditional drop boost-item': {
		id: BuffId['passive:12:hp conditional drop boost-item'],
		name: 'Passive HP-Conditional Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHITEMDOWN : IconId.BUFF_HPTHRESHITEMDROP],
	},
	'passive:12:hp conditional drop boost-zel': {
		id: BuffId['passive:12:hp conditional drop boost-zel'],
		name: 'Passive HP-Conditional Zel Drop Rate Boost',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHZELDOWN : IconId.BUFF_HPTHRESHZELDROP],
	},
	'passive:12:hp conditional drop boost-karma': {
		id: BuffId['passive:12:hp conditional drop boost-karma'],
		name: 'Passive HP-Conditional Karma Drop Rate Boost',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HPTHRESHKARMADOWN : IconId.BUFF_HPTHRESHKARMADROP],
	},
	'passive:13:bc fill on enemy defeat': {
		id: BuffId['passive:13:bc fill on enemy defeat'],
		name: 'Passive BC Fill on Enemy Defeat',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:14:chance mitigation': {
		id: BuffId['passive:14:chance mitigation'],
		name: 'Passive Damage Reduction (Chance)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'passive:15:heal on enemy defeat': {
		id: BuffId['passive:15:heal on enemy defeat'],
		name: 'Passive Heal on Enemy Defeat',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:16:heal on win': {
		id: BuffId['passive:16:heal on win'],
		name: 'Passive Heal on Battle Win',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:17:hp absorb': {
		id: BuffId['passive:17:hp absorb'],
		name: 'HP Absorption',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPABS],
	},
	'passive:19:drop boost-bc': {
		id: BuffId['passive:19:drop boost-bc'],
		name: 'Passive Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
	},
	'passive:19:drop boost-hc': {
		id: BuffId['passive:19:drop boost-hc'],
		name: 'Passive Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
	},
	'passive:19:drop boost-item': {
		id: BuffId['passive:19:drop boost-item'],
		name: 'Passive Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
	},
	'passive:19:drop boost-zel': {
		id: BuffId['passive:19:drop boost-zel'],
		name: 'Passive Zel Drop Rate Boost',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_ZELDROP],
	},
	'passive:19:drop boost-karma': {
		id: BuffId['passive:19:drop boost-karma'],
		name: 'Passive Karma Drop Rate Boost',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_KARMADROP],
	},
	'passive:20:chance inflict-poison': {
		id: BuffId['passive:20:chance inflict-poison'],
		name: 'Passive Poison Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDPOISON],
	},
	'passive:20:chance inflict-weak': {
		id: BuffId['passive:20:chance inflict-weak'],
		name: 'Passive Weak Infliction',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDWEAK],
	},
	'passive:20:chance inflict-sick': {
		id: BuffId['passive:20:chance inflict-sick'],
		name: 'Passive Sick Infliction',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDSICK],
	},
	'passive:20:chance inflict-injury': {
		id: BuffId['passive:20:chance inflict-injury'],
		name: 'Passive Injury Infliction',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDINJURY],
	},
	'passive:20:chance inflict-curse': {
		id: BuffId['passive:20:chance inflict-curse'],
		name: 'Passive Curse Infliction',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDCURSE],
	},
	'passive:20:chance inflict-paralysis': {
		id: BuffId['passive:20:chance inflict-paralysis'],
		name: 'Passive Paralysis Infliction',
		stat: UnitStat.paralysisInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDPARA],
	},
	'passive:20:chance inflict-atk down': {
		id: BuffId['passive:20:chance inflict-atk down'],
		name: 'Passive Attack Reduction Infliction',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'passive:20:chance inflict-def down': {
		id: BuffId['passive:20:chance inflict-def down'],
		name: 'Passive Defense Reduction Infliction',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDDEFDOWN],
	},
	'passive:20:chance inflict-rec down': {
		id: BuffId['passive:20:chance inflict-rec down'],
		name: 'Passive Recovery Reduction Infliction',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDRECDOWN],
	},
	'passive:20:chance inflict-unknown': {
		id: BuffId['passive:20:chance inflict-unknown'],
		name: 'Passive Unknown Ailment Infliction',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_ADDAILMENT],
	},
	'passive:21:first turn-atk': {
		id: BuffId['passive:21:first turn-atk'],
		name: 'Attack Boost for X Turns',
		stat: UnitStat.atk,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'passive:21:first turn-def': {
		id: BuffId['passive:21:first turn-def'],
		name: 'Defense Boost for X Turns',
		stat: UnitStat.def,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'passive:21:first turn-rec': {
		id: BuffId['passive:21:first turn-rec'],
		name: 'Recovery Boost for X Turns',
		stat: UnitStat.rec,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'passive:21:first turn-crit': {
		id: BuffId['passive:21:first turn-crit'],
		name: 'Critical Hit Rate Boost for X Turns',
		stat: UnitStat.crit,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
	},
	'passive:23:bc fill on win': {
		id: BuffId['passive:23:bc fill on win'],
		name: 'Passive BC Fill on Battle Win',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:24:heal on hit': {
		id: BuffId['passive:24:heal on hit'],
		name: 'Passive Heal when Attacked (Chance)',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BEENATK_HPREC],
	},
	'passive:25:bc fill on hit': {
		id: BuffId['passive:25:bc fill on hit'],
		name: 'Passive BC Fill when Attacked',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGEBB],
	},
	'passive:26:chance damage reflect': {
		id: BuffId['passive:26:chance damage reflect'],
		name: 'Passive Damage Counter (Chance)',
		stat: UnitStat.damageReflect,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_COUNTERDAMAGE],
	},
	'passive:27:target chance change': {
		id: BuffId['passive:27:target chance change'],
		name: 'Passive Target Chance Modification',
		stat: UnitStat.targetingModification,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_REPENEATT : IconId.BUFF_GETENEATT],
	},
	'passive:28:hp conditional target chance change': {
		id: BuffId['passive:28:hp conditional target chance change'],
		name: 'Passive HP-Conditional Target Chance Modification',
		stat: UnitStat.targetingModification,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPTHRESHREPENEATT : IconId.BUFF_HPTHRESHGETENEATT],
	},
	'passive:29:chance def ignore': {
		id: BuffId['passive:29:chance def ignore'],
		name: 'Passive Defense Ignore (Chance)',
		stat: UnitStat.defenseIgnore,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_IGNOREDEF],
	},
	'passive:30:bb gauge conditional-atk': {
		id: BuffId['passive:30:bb gauge conditional-atk'],
		name: 'Passive BB Gauge Conditional Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHATKDOWN : IconId.BUFF_BBGAUGETHRESHATKUP],
	},
	'passive:30:bb gauge conditional-def': {
		id: BuffId['passive:30:bb gauge conditional-def'],
		name: 'Passive BB Gauge Conditional Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHDEFDOWN : IconId.BUFF_BBGAUGETHRESHDEFUP],
	},
	'passive:30:bb gauge conditional-rec': {
		id: BuffId['passive:30:bb gauge conditional-rec'],
		name: 'Passive BB Gauge Conditional Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHRECDOWN : IconId.BUFF_BBGAUGETHRESHRECUP],
	},
	'passive:30:bb gauge conditional-crit': {
		id: BuffId['passive:30:bb gauge conditional-crit'],
		name: 'Passive BB Gauge Conditional Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN : IconId.BUFF_BBGAUGETHRESHCRTRATEUP],
	},
	'passive:31:spark-damage': {
		id: BuffId['passive:31:spark-damage'],
		name: 'Passive Spark Damage Boost',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
	},
	'passive:31:spark-bc': {
		id: BuffId['passive:31:spark-bc'],
		name: 'Passive Battle Crystal Drop Rate Boost during Spark',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_SPARKBC],
	},
	'passive:31:spark-hc': {
		id: BuffId['passive:31:spark-hc'],
		name: 'Passive Heart Crystal Drop Rate Boost during Spark',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_SPARKHC],
	},
	'passive:31:spark-item': {
		id: BuffId['passive:31:spark-item'],
		name: 'Passive Item Drop Rate Boost during Spark',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_SPARKITEM],
	},
	'passive:31:spark-zel': {
		id: BuffId['passive:31:spark-zel'],
		name: 'Passive Zel Drop Rate Boost during Spark',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_SPARKZEL],
	},
	'passive:31:spark-karma': {
		id: BuffId['passive:31:spark-karma'],
		name: 'Passive Karma Drop Rate Boost during Spark',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_SPARKKARMA],
	},
	'passive:32:bc efficacy': {
		id: BuffId['passive:32:bc efficacy'],
		name: 'Passive BC Efficacy',
		stat: UnitStat.bcEfficacy,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBFILL],
	},
	'passive:33:gradual heal': {
		id: BuffId['passive:33:gradual heal'],
		name: 'Passive Gradual Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HPREC],
	},
	'passive:34:critical damage': {
		id: BuffId['passive:34:critical damage'],
		name: 'Passive Critical Damage Boost',
		stat: UnitStat.criticalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTUP],
	},
	'passive:35:bc fill on normal attack': {
		id: BuffId['passive:35:bc fill on normal attack'],
		name: 'Passive BC Fill when Normal Attacking',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:36:extra action': {
		id: BuffId['passive:36:extra action'],
		name: 'Passive Extra Action',
		stat: UnitStat.extraAction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DBLSTRIKE],
	},
	'passive:37:hit count boost': {
		id: BuffId['passive:37:hit count boost'],
		name: 'Passive Hit Count Boost',
		stat: UnitStat.hitCountModification,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_HITUP],
	},
	'passive:40:converted-atk': {
		id: BuffId['passive:40:converted-atk'],
		name: 'Passive Converted Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
	},
	'passive:40:converted-def': {
		id: BuffId['passive:40:converted-def'],
		name: 'Passive Converted Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
	},
	'passive:40:converted-rec': {
		id: BuffId['passive:40:converted-rec'],
		name: 'Passive Converted Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
	},
	'passive:41:unique element count-hp': {
		id: BuffId['passive:41:unique element count-hp'],
		name: 'Passive Element Squad-based HP Boost',
		stat: UnitStat.hp,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTHPDOWN : IconId.BUFF_UNIQUEELEMENTHPUP],
	},
	'passive:41:unique element count-atk': {
		id: BuffId['passive:41:unique element count-atk'],
		name: 'Passive Element Squad-based Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTATKDOWN : IconId.BUFF_UNIQUEELEMENTATKUP],
	},
	'passive:41:unique element count-def': {
		id: BuffId['passive:41:unique element count-def'],
		name: 'Passive Element Squad-based Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTDEFDOWN : IconId.BUFF_UNIQUEELEMENTDEFUP],
	},
	'passive:41:unique element count-rec': {
		id: BuffId['passive:41:unique element count-rec'],
		name: 'Passive Element Squad-based Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_UNIQUEELEMENTRECDOWN : IconId.BUFF_UNIQUEELEMENTRECUP],
	},
	'passive:41:unique element count-crit': {
		id: BuffId['passive:41:unique element count-crit'],
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
	})(),
	'passive:43:chance damage to one': {
		id: BuffId['passive:43:chance damage to one'],
		name: 'Passive Damage Reduction To One (Chance)',
		stat: UnitStat.reduceDamageToOne,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGECUTTOONE],
	},
	'passive:44:flat-hp': {
		id: BuffId['passive:44:flat-hp'],
		name: 'Passive Flat HP Boost',
		stat: UnitStat.hp,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_HPDOWN : IconId.BUFF_HPUP],
	},
	'passive:44:flat-atk': {
		id: BuffId['passive:44:flat-atk'],
		name: 'Passive Flat Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'passive:44:flat-def': {
		id: BuffId['passive:44:flat-def'],
		name: 'Passive Flat Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'passive:44:flat-rec': {
		id: BuffId['passive:44:flat-rec'],
		name: 'Passive Flat Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'passive:44:flat-crit': {
		id: BuffId['passive:44:flat-crit'],
		name: 'Passive Flat Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWN : IconId.BUFF_CRTRATEUP],
	},
	'passive:45:critical damage reduction-base': {
		id: BuffId['passive:45:critical damage reduction-base'],
		name: 'Passive Base Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:45:critical damage reduction-buff': {
		id: BuffId['passive:45:critical damage reduction-buff'],
		name: 'Passive Buffed Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:46:hp scaled-atk': {
		id: BuffId['passive:46:hp scaled-atk'],
		name: 'Passive Attack Boost Relative to HP',
		stat: UnitStat.atk,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDATKDOWN : IconId.BUFF_HPSCALEDATKUP],
	},
	'passive:46:hp scaled-def': {
		id: BuffId['passive:46:hp scaled-def'],
		name: 'Passive Defense Boost Relative to HP',
		stat: UnitStat.def,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDDEFDOWN : IconId.BUFF_HPSCALEDDEFUP],
	},
	'passive:46:hp scaled-rec': {
		id: BuffId['passive:46:hp scaled-rec'],
		name: 'Passive Recovery Boost Relative to HP',
		stat: UnitStat.rec,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { addedValue: number }).addedValue && (buff.value as { addedValue: number }).addedValue < 0) ? IconId.BUFF_HPSCALEDRECDOWN : IconId.BUFF_HPSCALEDRECUP],
	},
	'passive:47:bc fill on spark': {
		id: BuffId['passive:47:bc fill on spark'],
		name: 'Passive BC Fill on Spark',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SPARKBBUP],
	},
	'passive:48:bc cost reduction': {
		id: BuffId['passive:48:bc cost reduction'],
		name: 'Passive BC Cost Reduction',
		stat: UnitStat.bcCostReduction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBCOST_REDUCTION],
	},
	'passive:49:bb gauge consumption reduction': {
		id: BuffId['passive:49:bb gauge consumption reduction'],
		name: 'Passive BB Gauge Consumption Reduction',
		stat: UnitStat.bbGaugeConsumptionReduction,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:50:elemental weakness damage-fire': {
		id: BuffId['passive:50:elemental weakness damage-fire'],
		name: 'Passive Fire Elemental Damage Boost',
		stat: UnitStat.fireElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_FIREDMGUP],
	},
	'passive:50:elemental weakness damage-water': {
		id: BuffId['passive:50:elemental weakness damage-water'],
		name: 'Passive Water Elemental Damage Boost',
		stat: UnitStat.waterElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WATERDMGUP],
	},
	'passive:50:elemental weakness damage-earth': {
		id: BuffId['passive:50:elemental weakness damage-earth'],
		name: 'Passive Earth Elemental Damage Boost',
		stat: UnitStat.earthElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_EARTHDMGUP],
	},
	'passive:50:elemental weakness damage-thunder': {
		id: BuffId['passive:50:elemental weakness damage-thunder'],
		name: 'Passive Thunder Elemental Damage Boost',
		stat: UnitStat.thunderElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_THUNDERDMGUP],
	},
	'passive:50:elemental weakness damage-light': {
		id: BuffId['passive:50:elemental weakness damage-light'],
		name: 'Passive Light Elemental Damage Boost',
		stat: UnitStat.lightElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_LIGHTDMGUP],
	},
	'passive:50:elemental weakness damage-dark': {
		id: BuffId['passive:50:elemental weakness damage-dark'],
		name: 'Passive Dark Elemental Damage Boost',
		stat: UnitStat.darkElementalDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DARKDMGUP],
	},
	'passive:50:elemental weakness damage-unknown': {
		id: BuffId['passive:50:elemental weakness damage-unknown'],
		name: 'Passive Elemental Damage Boost (Unspecified Element)',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDMGUP],
	},
	'passive:53:critical damage-base': {
		id: BuffId['passive:53:critical damage-base'],
		name: 'Passive Base Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:critical damage-buff': {
		id: BuffId['passive:53:critical damage-buff'],
		name: 'Passive Buffed Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:element damage-base': {
		id: BuffId['passive:53:element damage-base'],
		name: 'Passive Base Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'passive:53:element damage-buff': {
		id: BuffId['passive:53:element damage-buff'],
		name: 'Passive Buffed Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'passive:53:critical rate-base': {
		id: BuffId['passive:53:critical rate-base'],
		name: 'Passive Base Critical Hit Rate Reduction',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:53:critical rate-buff': {
		id: BuffId['passive:53:critical rate-buff'],
		name: 'Passive Buffed Critical Hit Rate Reduction',
		stat: UnitStat.crit,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'passive:55:hp conditional': {
		id: BuffId['passive:55:hp conditional'],
		name: 'Passive Conditional Effect based on HP Threshold',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.CONDITIONALBUFF_HPTHRESH],
	},
	'passive:58:guard mitigation': {
		id: BuffId['passive:58:guard mitigation'],
		name: 'Passive Guard Damage Reduction',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_GUARDCUT],
	},
	'passive:59:bc fill when attacked on guard-percent': {
		id: BuffId['passive:59:bc fill when attacked on guard-percent'],
		name: 'Passive BC Fill when Attacked and Guarding (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'passive:59:bc fill when attacked on guard-flat': {
		id: BuffId['passive:59:bc fill when attacked on guard-flat'],
		name: 'Passive BC Fill when Attacked and Guarding (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'passive:61:bc fill on guard-percent': {
		id: BuffId['passive:61:bc fill on guard-percent'],
		name: 'Passive BC Fill on Guard (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'passive:61:bc fill on guard-flat': {
		id: BuffId['passive:61:bc fill on guard-flat'],
		name: 'Passive BC Fill on Guard (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'passive:62:mitigate-fire': {
		id: BuffId['passive:62:mitigate-fire'],
		name: 'Passive Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'passive:62:mitigate-water': {
		id: BuffId['passive:62:mitigate-water'],
		name: 'Passive Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'passive:62:mitigate-earth': {
		id: BuffId['passive:62:mitigate-earth'],
		name: 'Passive Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'passive:62:mitigate-thunder': {
		id: BuffId['passive:62:mitigate-thunder'],
		name: 'Passive Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'passive:62:mitigate-light': {
		id: BuffId['passive:62:mitigate-light'],
		name: 'Passive Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'passive:62:mitigate-dark': {
		id: BuffId['passive:62:mitigate-dark'],
		name: 'Passive Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'passive:62:mitigate-unknown': {
		id: BuffId['passive:62:mitigate-unknown'],
		name: 'Passive Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'passive:63:first turn mitigate-fire': {
		id: BuffId['passive:63:first turn mitigate-fire'],
		name: 'Fire Damage Reduction for First X Turns',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'passive:63:first turn mitigate-water': {
		id: BuffId['passive:63:first turn mitigate-water'],
		name: 'Water Damage Reduction for First X Turns',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'passive:63:first turn mitigate-earth': {
		id: BuffId['passive:63:first turn mitigate-earth'],
		name: 'Earth Damage Reduction for First X Turns',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'passive:63:first turn mitigate-thunder': {
		id: BuffId['passive:63:first turn mitigate-thunder'],
		name: 'Thunder Damage Reduction for First X Turns',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'passive:63:first turn mitigate-light': {
		id: BuffId['passive:63:first turn mitigate-light'],
		name: 'Light Damage Reduction for First X Turns',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'passive:63:first turn mitigate-dark': {
		id: BuffId['passive:63:first turn mitigate-dark'],
		name: 'Dark Damage Reduction for First X Turns',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'passive:63:first turn mitigate-unknown': {
		id: BuffId['passive:63:first turn mitigate-unknown'],
		name: 'Elemental Damage Reduction (Unspecified Element) for First X Turns',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'passive:64:attack boost-bb': {
		id: BuffId['passive:64:attack boost-bb'],
		name: 'Passive BB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBATKUP],
	},
	'passive:64:attack boost-sbb': {
		id: BuffId['passive:64:attack boost-sbb'],
		name: 'Passive SBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SBBATKUP],
	},
	'passive:64:attack boost-ubb': {
		id: BuffId['passive:64:attack boost-ubb'],
		name: 'Passive UBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_UBBATKUP],
	},
	'passive:65:bc fill on crit': {
		id: BuffId['passive:65:bc fill on crit'],
		name: 'Passive BC Fill on Critical Hit',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_BBREC],
	},
	'passive:66:add effect to skill-bb': {
		id: BuffId['passive:66:add effect to skill-bb'],
		name: 'Passive Added Effect to Brave Burst',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDTO_BB],
	},
	'passive:66:add effect to skill-sbb': {
		id: BuffId['passive:66:add effect to skill-sbb'],
		name: 'Passive Added Effect to Super Brave Burst',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDTO_SBB],
	},
	'passive:66:add effect to skill-ubb': {
		id: BuffId['passive:66:add effect to skill-ubb'],
		name: 'Passive Added Effect to Ultimate Brave Burst',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ADDTO_UBB],
	},
	'passive:69:chance ko resistance': {
		id: BuffId['passive:69:chance ko resistance'],
		name: 'Passive KO Resistance (Chance)',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_KOBLOCK],
	},
	'passive:70:od fill rate': {
		id: BuffId['passive:70:od fill rate'],
		name: 'Passive OD Gauge Fill Rate',
		stat: UnitStat.odGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_ODFILLBOOST],
	},
	'passive:71:inflict on hit-poison': {
		id: BuffId['passive:71:inflict on hit-poison'],
		name: 'Passive Poison Counter',
		stat: UnitStat.poisonCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_POISONCOUNTER],
	},
	'passive:71:inflict on hit-weak': {
		id: BuffId['passive:71:inflict on hit-weak'],
		name: 'Passive Weak Counter',
		stat: UnitStat.weakCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WEAKCOUNTER],
	},
	'passive:71:inflict on hit-sick': {
		id: BuffId['passive:71:inflict on hit-sick'],
		name: 'Passive Sick Counter',
		stat: UnitStat.sickCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SICKCOUNTER],
	},
	'passive:71:inflict on hit-injury': {
		id: BuffId['passive:71:inflict on hit-injury'],
		name: 'Passive Injury Counter',
		stat: UnitStat.injuryCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_INJCONTER],
	},
	'passive:71:inflict on hit-curse': {
		id: BuffId['passive:71:inflict on hit-curse'],
		name: 'Passive Curse Counter',
		stat: UnitStat.curseCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CURSECOUNTER],
	},
	'passive:71:inflict on hit-paralysis': {
		id: BuffId['passive:71:inflict on hit-paralysis'],
		name: 'Passive Paralysis Counter',
		stat: UnitStat.paralysisCounter,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_PARALYCOUNTER],
	},
	'passive:72:effect at turn start-hp': {
		id: BuffId['passive:72:effect at turn start-hp'],
		name: 'Gradual HP Effects Occur at Turn Start',
		stat: UnitStat.effectOccurrenceShift,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_HPTURNSTART],
	},
	'passive:72:effect at turn start-bc': {
		id: BuffId['passive:72:effect at turn start-bc'],
		name: 'Gradual Battle Crystal Effects Occur at Turn Start',
		stat: UnitStat.effectOccurrenceShift,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_BCTURNSTART],
	},
	'passive:73:resist-poison': {
		id: BuffId['passive:73:resist-poison'],
		name: 'Passive Poison Resistance',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'passive:73:resist-weak': {
		id: BuffId['passive:73:resist-weak'],
		name: 'Passive Weak Resistance',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'passive:73:resist-sick': {
		id: BuffId['passive:73:resist-sick'],
		name: 'Passive Sick Resistance',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'passive:73:resist-injury': {
		id: BuffId['passive:73:resist-injury'],
		name: 'Passive Injury Resistance',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'passive:73:resist-curse': {
		id: BuffId['passive:73:resist-curse'],
		name: 'Passive Curse Resistance',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'passive:73:resist-paralysis': {
		id: BuffId['passive:73:resist-paralysis'],
		name: 'Passive Paralysis Resistance',
		stat: UnitStat.paralysisResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'passive:73:resist-atk down': {
		id: BuffId['passive:73:resist-atk down'],
		name: 'Passive Attack Reduction Resistance',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_RESISTATKDOWN],
	},
	'passive:73:resist-def down': {
		id: BuffId['passive:73:resist-def down'],
		name: 'Passive Defense Reduction Resistance',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_RESISTDEFDOWN],
	},
	'passive:73:resist-rec down': {
		id: BuffId['passive:73:resist-rec down'],
		name: 'Passive Recovery Reduction Resistance',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_RESISTRECDOWN],
	},
	'passive:74:ailment attack boost': {
		id: BuffId['passive:74:ailment attack boost'],
		name: 'Passive Attack Boost on Status Afflicted Foes',
		stat: UnitStat.ailmentAttackBoost,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_AILDMGUP],
	},
	'passive:75:spark vulnerability': {
		id: BuffId['passive:75:spark vulnerability'],
		name: 'Passive Spark Vulnerability',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SPARKDMGUP],
	},
	'passive:77:spark damage reduction-base': {
		id: BuffId['passive:77:spark damage reduction-base'],
		name: 'Passive Base Spark Damage Reduction',
		stat: UnitStat.sparkDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SPARKDMGDOWN],
	},
	'passive:77:spark damage reduction-buff': {
		id: BuffId['passive:77:spark damage reduction-buff'],
		name: 'Passive Buffed Spark Damage Reduction',
		stat: UnitStat.sparkDamageMitigation,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_SPARKDMGDOWN],
	},
	'passive:78:damage taken conditional': {
		id: BuffId['passive:78:damage taken conditional'],
		name: 'Passive Conditional Effect after Damage Received Threshold',
		stackType: BuffStackType.Passive,
		icons: () => [IconId.CONDITIONALBUFF_DAMAGETAKENTHRESH],
	},
	'passive:79:bc fill after damage taken conditional': {
		id: BuffId['passive:79:bc fill after damage taken conditional'],
		name: 'Passive BC Fill after Damage Taken Received Threshold',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Passive,
		icons: () => [IconId.BUFF_DAMAGEBB],
	},
	UNKNOWN_PROC_EFFECT_ID: {
		id: BuffId.UNKNOWN_PROC_EFFECT_ID,
		name: 'Unknown Proc Effect',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	UNKNOWN_PROC_BUFF_PARAMS: {
		id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
		name: 'Unknown Proc Buff Parameters',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'proc:1:attack': {
		id: BuffId['proc:1:attack'],
		name: 'Regular Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
	},
	'proc:2:burst heal': {
		id: BuffId['proc:2:burst heal'],
		name: 'Burst Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:3:gradual heal': {
		id: BuffId['proc:3:gradual heal'],
		name: 'Active Gradual Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:4:bc fill-flat': {
		id: BuffId['proc:4:bc fill-flat'],
		name: 'Burst BC Fill (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:4:bc fill-percent': {
		id: BuffId['proc:4:bc fill-percent'],
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
	})(),
	'proc:6:drop boost-bc': {
		id: BuffId['proc:6:drop boost-bc'],
		name: 'Active Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
	},
	'proc:6:drop boost-hc': {
		id: BuffId['proc:6:drop boost-hc'],
		name: 'Active Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
	},
	'proc:6:drop boost-item': {
		id: BuffId['proc:6:drop boost-item'],
		name: 'Active Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
	},
	'proc:7:guaranteed ko resistance': {
		id: BuffId['proc:7:guaranteed ko resistance'],
		name: 'Guaranteed KO Resistance',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_KOBLK],
	},
	'proc:8:max hp boost-flat': {
		id: BuffId['proc:8:max hp boost-flat'],
		name: 'Max HP Boost (Flat Amount)',
		stat: UnitStat.hp,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_HPUP],
	},
	'proc:8:max hp boost-percent': {
		id: BuffId['proc:8:max hp boost-percent'],
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
	})(),
	'proc:10:cleanse-poison': {
		id: BuffId['proc:10:cleanse-poison'],
		name: 'Poison Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:10:cleanse-weak': {
		id: BuffId['proc:10:cleanse-weak'],
		name: 'Weak Cleanse',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:10:cleanse-sick': {
		id: BuffId['proc:10:cleanse-sick'],
		name: 'Sick Cleanse',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:10:cleanse-injury': {
		id: BuffId['proc:10:cleanse-injury'],
		name: 'Injury Cleanse',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:10:cleanse-curse': {
		id: BuffId['proc:10:cleanse-curse'],
		name: 'Curse Cleanse',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:10:cleanse-paralysis': {
		id: BuffId['proc:10:cleanse-paralysis'],
		name: 'Paralysis Cleanse',
		stat: UnitStat.paralysisResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:10:cleanse-atk down': {
		id: BuffId['proc:10:cleanse-atk down'],
		name: 'Attack Reduction Cleanse',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTATKDOWN],
	},
	'proc:10:cleanse-def down': {
		id: BuffId['proc:10:cleanse-def down'],
		name: 'Defense Reduction Cleanse',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTDEFDOWN],
	},
	'proc:10:cleanse-rec down': {
		id: BuffId['proc:10:cleanse-rec down'],
		name: 'Recovery Reduction Cleanse',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTRECDOWN],
	},
	'proc:10:cleanse-unknown': {
		id: BuffId['proc:10:cleanse-unknown'],
		name: 'Unknown Ailment Cleanse',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_AILMENTBLK],
	},
	'proc:11:chance inflict-poison': {
		id: BuffId['proc:11:chance inflict-poison'],
		name: 'Poison Infliction',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_POISON],
	},
	'proc:11:chance inflict-weak': {
		id: BuffId['proc:11:chance inflict-weak'],
		name: 'Weak Infliction',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_WEAK],
	},
	'proc:11:chance inflict-sick': {
		id: BuffId['proc:11:chance inflict-sick'],
		name: 'Sick Infliction',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_SICK],
	},
	'proc:11:chance inflict-injury': {
		id: BuffId['proc:11:chance inflict-injury'],
		name: 'Injury Infliction',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_INJURY],
	},
	'proc:11:chance inflict-curse': {
		id: BuffId['proc:11:chance inflict-curse'],
		name: 'Curse Infliction',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_CURSE],
	},
	'proc:11:chance inflict-paralysis': {
		id: BuffId['proc:11:chance inflict-paralysis'],
		name: 'Paralysis Infliction',
		stat: UnitStat.paralysisInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.DEBUFF_PARALYSIS],
	},
	'proc:11:chance inflict-atk down': {
		id: BuffId['proc:11:chance inflict-atk down'],
		name: 'Attack Reduction Infliction',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_ATKDOWN],
	},
	'proc:11:chance inflict-def down': {
		id: BuffId['proc:11:chance inflict-def down'],
		name: 'Defense Reduction Infliction',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_DEFDOWN],
	},
	'proc:11:chance inflict-rec down': {
		id: BuffId['proc:11:chance inflict-rec down'],
		name: 'Recovery Reduction Infliction',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RECDOWN],
	},
	'proc:11:chance inflict-unknown': {
		id: BuffId['proc:11:chance inflict-unknown'],
		name: 'Unknown Ailment Infliction',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.DEBUFF_AILMENT],
	},
	'proc:12:guaranteed revive': {
		id: BuffId['proc:12:guaranteed revive'],
		name: 'Instant Revive (Guaranteed)',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_KOBLK],
	},
	'proc:13:random attack': {
		id: BuffId['proc:13:random attack'],
		name: 'Random Target Damage',
		stackType: BuffStackType.Attack,
		icons: () => [IconId.ATK_RT],
	},
	'proc:14:hp absorb attack': {
		id: BuffId['proc:14:hp absorb attack'],
		name: 'Lifesteal Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPREC : IconId.ATK_AOE_HPREC],
	},
	'proc:16:mitigate-fire': {
		id: BuffId['proc:16:mitigate-fire'],
		name: 'Active Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'proc:16:mitigate-water': {
		id: BuffId['proc:16:mitigate-water'],
		name: 'Active Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'proc:16:mitigate-earth': {
		id: BuffId['proc:16:mitigate-earth'],
		name: 'Active Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'proc:16:mitigate-thunder': {
		id: BuffId['proc:16:mitigate-thunder'],
		name: 'Active Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'proc:16:mitigate-light': {
		id: BuffId['proc:16:mitigate-light'],
		name: 'Active Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'proc:16:mitigate-dark': {
		id: BuffId['proc:16:mitigate-dark'],
		name: 'Active Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'proc:16:mitigate-all': {
		id: BuffId['proc:16:mitigate-all'],
		name: 'Active Elemental Damage Reduction (All Elements)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:16:mitigate-unknown': {
		id: BuffId['proc:16:mitigate-unknown'],
		name: 'Active Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:17:resist-poison': {
		id: BuffId['proc:17:resist-poison'],
		name: 'Active Poison Resistance',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:17:resist-weak': {
		id: BuffId['proc:17:resist-weak'],
		name: 'Active Weak Resistance',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:17:resist-sick': {
		id: BuffId['proc:17:resist-sick'],
		name: 'Active Sick Resistance',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:17:resist-injury': {
		id: BuffId['proc:17:resist-injury'],
		name: 'Active Injury Resistance',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:17:resist-curse': {
		id: BuffId['proc:17:resist-curse'],
		name: 'Active Curse Resistance',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:17:resist-paralysis': {
		id: BuffId['proc:17:resist-paralysis'],
		name: 'Active Paralysis Resistance',
		stat: UnitStat.paralysisResist,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:18:mitigation': {
		id: BuffId['proc:18:mitigation'],
		name: 'Active Damage Reduction',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'proc:19:gradual bc fill': {
		id: BuffId['proc:19:gradual bc fill'],
		name: 'Active Gradual BC Fill',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:20:bc fill on hit': {
		id: BuffId['proc:20:bc fill on hit'],
		name: 'Active BC Fill when attacked',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DAMAGEBB],
	},
	'proc:22:defense ignore': {
		id: BuffId['proc:22:defense ignore'],
		name: 'Active Defense Ignore',
		stat: UnitStat.defenseIgnore,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_IGNOREDEF],
	},
	'proc:23:spark damage': {
		id: BuffId['proc:23:spark damage'],
		name: 'Active Spark Damage Boost',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
	},
	'proc:24:converted-atk': {
		id: BuffId['proc:24:converted-atk'],
		name: 'Active Converted Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTATKDOWN : IconId.BUFF_CONVERTATKUP],
	},
	'proc:24:converted-def': {
		id: BuffId['proc:24:converted-def'],
		name: 'Active Converted Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTDEFDOWN : IconId.BUFF_CONVERTDEFUP],
	},
	'proc:24:converted-rec': {
		id: BuffId['proc:24:converted-rec'],
		name: 'Active Converted Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && (buff.value as { value: number }).value && (buff.value as { value: number }).value < 0) ? IconId.BUFF_CONVERTRECDOWN : IconId.BUFF_CONVERTRECUP],
	},
	'proc:26:hit count boost': {
		id: BuffId['proc:26:hit count boost'],
		name: 'Active Hit Count Boost',
		stat: UnitStat.hitCountModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HITUP],
	},
	'proc:27:proportional attack': {
		id: BuffId['proc:27:proportional attack'],
		name: 'Proportional Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
	},
	'proc:28:fixed attack': {
		id: BuffId['proc:28:fixed attack'],
		name: 'Fixed Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_FIXED : IconId.ATK_AOE_FIXED],
	},
	'proc:29:multi-element attack': {
		id: BuffId['proc:29:multi-element attack'],
		name: 'Multi-Element Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_MULTIELEMENT : IconId.ATK_AOE_MULTIELEMENT],
	},
	'proc:30:add element-fire': {
		id: BuffId['proc:30:add element-fire'],
		name: 'Active Added Element to Attack (Fire)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDFIRE],
	},
	'proc:30:add element-water': {
		id: BuffId['proc:30:add element-water'],
		name: 'Active Added Element to Attack (Water)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDWATER],
	},
	'proc:30:add element-earth': {
		id: BuffId['proc:30:add element-earth'],
		name: 'Active Added Element to Attack (Earth)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDEARTH],
	},
	'proc:30:add element-thunder': {
		id: BuffId['proc:30:add element-thunder'],
		name: 'Active Added Element to Attack (Thunder)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDTHUNDER],
	},
	'proc:30:add element-light': {
		id: BuffId['proc:30:add element-light'],
		name: 'Active Added Element to Attack (Light)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDLIGHT],
	},
	'proc:30:add element-dark': {
		id: BuffId['proc:30:add element-dark'],
		name: 'Active Added Element to Attack (Dark)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDDARK],
	},
	'proc:30:add element-unknown': {
		id: BuffId['proc:30:add element-unknown'],
		name: 'Active Added Element to Attack (Unspecified Element)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDELEMENT],
	},
	'proc:31:bc fill-flat': {
		id: BuffId['proc:31:bc fill-flat'],
		name: 'Burst BC Fill (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:31:bc fill-percent': {
		id: BuffId['proc:31:bc fill-percent'],
		name: 'Burst BC Fill (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:32:element shift-fire': {
		id: BuffId['proc:32:element shift-fire'],
		name: 'Element Shift (Fire)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTFIRE],
	},
	'proc:32:element shift-water': {
		id: BuffId['proc:32:element shift-water'],
		name: 'Element Shift (Water)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTWATER],
	},
	'proc:32:element shift-earth': {
		id: BuffId['proc:32:element shift-earth'],
		name: 'Element Shift (Earth)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTEARTH],
	},
	'proc:32:element shift-thunder': {
		id: BuffId['proc:32:element shift-thunder'],
		name: 'Element Shift (Thunder)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTTHUNDER],
	},
	'proc:32:element shift-light': {
		id: BuffId['proc:32:element shift-light'],
		name: 'Element Shift (Light)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTLIGHT],
	},
	'proc:32:element shift-dark': {
		id: BuffId['proc:32:element shift-dark'],
		name: 'Element Shift (Dark)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTDARK],
	},
	'proc:32:element shift-unknown': {
		id: BuffId['proc:32:element shift-unknown'],
		name: 'Element Shift (Unspecified Element)',
		stat: UnitStat.elementModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_SHIFTELEMENT],
	},
	'proc:33:buff wipe': {
		id: BuffId['proc:33:buff wipe'],
		name: 'Buff Removal',
		stat: UnitStat.buffStabilityModification,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_REMOVEBUFF],
	},
	'proc:34:bc drain-flat': {
		id: BuffId['proc:34:bc drain-flat'],
		name: 'Burst BB Gauge Drain (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBFILLDOWN],
	},
	'proc:34:bc drain-percent': {
		id: BuffId['proc:34:bc drain-percent'],
		name: 'Burst BB Gauge Drain (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBFILLDOWN],
	},
	'proc:36:ls lock': {
		id: BuffId['proc:36:ls lock'],
		name: 'Active Leader Skill Lock',
		stat: UnitStat.buffStabilityModification,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DISABLELS],
	},
	'proc:37:summon': {
		id: BuffId['proc:37:summon'],
		name: 'Summon Unit',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SUMMONUNIT],
	},
	'proc:38:cleanse-poison': {
		id: BuffId['proc:38:cleanse-poison'],
		name: 'Poison Cleanse',
		stat: UnitStat.poisonResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_POISONBLK],
	},
	'proc:38:cleanse-weak': {
		id: BuffId['proc:38:cleanse-weak'],
		name: 'Weak Cleanse',
		stat: UnitStat.weakResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_WEAKBLK],
	},
	'proc:38:cleanse-sick': {
		id: BuffId['proc:38:cleanse-sick'],
		name: 'Sick Cleanse',
		stat: UnitStat.sickResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_SICKBLK],
	},
	'proc:38:cleanse-injury': {
		id: BuffId['proc:38:cleanse-injury'],
		name: 'Injury Cleanse',
		stat: UnitStat.injuryResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_INJURYBLK],
	},
	'proc:38:cleanse-curse': {
		id: BuffId['proc:38:cleanse-curse'],
		name: 'Curse Cleanse',
		stat: UnitStat.curseResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_CURSEBLK],
	},
	'proc:38:cleanse-paralysis': {
		id: BuffId['proc:38:cleanse-paralysis'],
		name: 'Paralysis Cleanse',
		stat: UnitStat.paralysisResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_PARALYSISBLK],
	},
	'proc:38:cleanse-atk down': {
		id: BuffId['proc:38:cleanse-atk down'],
		name: 'Attack Reduction Cleanse',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTATKDOWN],
	},
	'proc:38:cleanse-def down': {
		id: BuffId['proc:38:cleanse-def down'],
		name: 'Defense Reduction Cleanse',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTDEFDOWN],
	},
	'proc:38:cleanse-rec down': {
		id: BuffId['proc:38:cleanse-rec down'],
		name: 'Recovery Reduction Cleanse',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTRECDOWN],
	},
	'proc:38:cleanse-unknown': {
		id: BuffId['proc:38:cleanse-unknown'],
		name: 'Unknown Ailment Cleanse',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_AILMENTBLK],
	},
	'proc:39:mitigate-fire': {
		id: BuffId['proc:39:mitigate-fire'],
		name: 'Active Fire Damage Reduction',
		stat: UnitStat.fireMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_FIREDMGDOWN],
	},
	'proc:39:mitigate-water': {
		id: BuffId['proc:39:mitigate-water'],
		name: 'Active Water Damage Reduction',
		stat: UnitStat.waterMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WATERDMGDOWN],
	},
	'proc:39:mitigate-earth': {
		id: BuffId['proc:39:mitigate-earth'],
		name: 'Active Earth Damage Reduction',
		stat: UnitStat.earthMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_EARTHDMGDOWN],
	},
	'proc:39:mitigate-thunder': {
		id: BuffId['proc:39:mitigate-thunder'],
		name: 'Active Thunder Damage Reduction',
		stat: UnitStat.thunderMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_THUNDERDMGDOWN],
	},
	'proc:39:mitigate-light': {
		id: BuffId['proc:39:mitigate-light'],
		name: 'Active Light Damage Reduction',
		stat: UnitStat.lightMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_LIGHTDMGDOWN],
	},
	'proc:39:mitigate-dark': {
		id: BuffId['proc:39:mitigate-dark'],
		name: 'Active Dark Damage Reduction',
		stat: UnitStat.darkMitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DARKDMGDOWN],
	},
	'proc:39:mitigate-unknown': {
		id: BuffId['proc:39:mitigate-unknown'],
		name: 'Active Elemental Damage Reduction (Unspecified Element)',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGDOWN],
	},
	'proc:40:add ailment-poison': {
		id: BuffId['proc:40:add ailment-poison'],
		name: 'Active Poison Infliction Added to Attack',
		stat: UnitStat.poisonInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDPOISON],
	},
	'proc:40:add ailment-weak': {
		id: BuffId['proc:40:add ailment-weak'],
		name: 'Active Weak Infliction Added to Attack',
		stat: UnitStat.weakInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDWEAK],
	},
	'proc:40:add ailment-sick': {
		id: BuffId['proc:40:add ailment-sick'],
		name: 'Active Sick Infliction Added to Attack',
		stat: UnitStat.sickInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDSICK],
	},
	'proc:40:add ailment-injury': {
		id: BuffId['proc:40:add ailment-injury'],
		name: 'Active Injury Infliction Added to Attack',
		stat: UnitStat.injuryInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDINJURY],
	},
	'proc:40:add ailment-curse': {
		id: BuffId['proc:40:add ailment-curse'],
		name: 'Active Curse Infliction Added to Attack',
		stat: UnitStat.curseInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDCURSE],
	},
	'proc:40:add ailment-paralysis': {
		id: BuffId['proc:40:add ailment-paralysis'],
		name: 'Active Paralysis Infliction Added to Attack',
		stat: UnitStat.paralysisInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDPARA],
	},
	'proc:40:add ailment-atk down': {
		id: BuffId['proc:40:add ailment-atk down'],
		name: 'Active Attack Reduction Infliction Added to Attack',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'proc:40:add ailment-def down': {
		id: BuffId['proc:40:add ailment-def down'],
		name: 'Active Defense Reduction Infliction Added to Attack',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDDEFDOWN],
	},
	'proc:40:add ailment-rec down': {
		id: BuffId['proc:40:add ailment-rec down'],
		name: 'Active Recovery Reduction Infliction Added to Attack',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDRECDOWN],
	},
	'proc:40:add ailment-unknown': {
		id: BuffId['proc:40:add ailment-unknown'],
		name: 'Active Unknown Ailment Infliction Added to Attack',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.BUFF_ADDAILMENT],
	},
	'proc:42:sacrificial attack': {
		id: BuffId['proc:42:sacrificial attack'],
		name: 'Sacrificial Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL],
	},
	'proc:42:instant death': {
		id: BuffId['proc:42:instant death'],
		name: 'Instant Death to Self (Post-Attack)',
		stackType: BuffStackType.Burst,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_SACRIFICIAL : IconId.ATK_AOE_SACRIFICIAL, IconId.BUFF_KO],
	},
	'proc:43:burst od fill': {
		id: BuffId['proc:43:burst od fill'],
		name: 'Burst OD Gauge Fill (Percentage)',
		stat: UnitStat.odGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_OVERDRIVEUP],
	},
	'proc:44:damage over time': {
		id: BuffId['proc:44:damage over time'],
		name: 'Active Damage over Time',
		stat: UnitStat.damageOverTime,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_TURNDMG],
	},
	'proc:45:attack boost-bb': {
		id: BuffId['proc:45:attack boost-bb'],
		name: 'Active BB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBATKUP],
	},
	'proc:45:attack boost-sbb': {
		id: BuffId['proc:45:attack boost-sbb'],
		name: 'Active SBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SBBATKUP],
	},
	'proc:45:attack boost-ubb': {
		id: BuffId['proc:45:attack boost-ubb'],
		name: 'Active UBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_UBBATKUP],
	},
	'proc:46:non-lethal proportional attack': {
		id: BuffId['proc:46:non-lethal proportional attack'],
		name: 'Non-Lethal Proportional Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PROPORTIONAL : IconId.ATK_AOE_PROPORTIONAL],
	},
	'proc:47:hp scaled attack': {
		id: BuffId['proc:47:hp scaled attack'],
		name: 'HP Scaled Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_HPSCALED : IconId.ATK_AOE_HPSCALED],
	},
	'proc:48:piercing attack-base': {
		id: BuffId['proc:48:piercing attack-base'],
		name: 'Piercing Proportional Damage (Base HP)',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
	},
	'proc:48:piercing attack-current': {
		id: BuffId['proc:48:piercing attack-current'],
		name: 'Piercing Proportional Damage (Current HP)',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_PROPORTIONAL : IconId.ATK_AOE_PIERCING_PROPORTIONAL],
	},
	'proc:48:piercing attack-fixed': {
		id: BuffId['proc:48:piercing attack-fixed'],
		name: 'Piercing Fixed Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_PIERCING_FIXED : IconId.ATK_AOE_PIERCING_FIXED],
	},
	'proc:48:piercing attack-unknown': {
		id: BuffId['proc:48:piercing attack-unknown'],
		name: 'Unknown Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST : IconId.ATK_AOE],
	},
	'proc:49:chance instant death': {
		id: BuffId['proc:49:chance instant death'],
		name: 'Instant Death (Chance)',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_KO],
	},
	'proc:50:chance damage reflect': {
		id: BuffId['proc:50:chance damage reflect'],
		name: 'Active Damage Reflect (Chance)',
		stat: UnitStat.damageReflect,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_COUNTERDAMAGE],
	},
	'proc:51:add to attack-atk down': {
		id: BuffId['proc:51:add to attack-atk down'],
		name: 'Active Attack Reduction Infliction Added to Attack',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'proc:51:add to attack-def down': {
		id: BuffId['proc:51:add to attack-def down'],
		name: 'Active Defense Reduction Infliction Added to Attack',
		stat: UnitStat.defDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDDEFDOWN],
	},
	'proc:51:add to attack-rec down': {
		id: BuffId['proc:51:add to attack-rec down'],
		name: 'Active Recovery Reduction Infliction Added to Attack',
		stat: UnitStat.recDownInflict,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ADDRECDOWN],
	},
	'proc:52:bc efficacy': {
		id: BuffId['proc:52:bc efficacy'],
		name: 'Active BC Efficacy',
		stat: UnitStat.bcEfficacy,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBFILL],
	},
	'proc:53:inflict on hit-poison': {
		id: BuffId['proc:53:inflict on hit-poison'],
		name: 'Active Poison Counter',
		stat: UnitStat.poisonCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_POISONCOUNTER],
	},
	'proc:53:inflict on hit-weak': {
		id: BuffId['proc:53:inflict on hit-weak'],
		name: 'Active Weak Counter',
		stat: UnitStat.weakCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WEAKCOUNTER],
	},
	'proc:53:inflict on hit-sick': {
		id: BuffId['proc:53:inflict on hit-sick'],
		name: 'Active Sick Counter',
		stat: UnitStat.sickCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SICKCOUNTER],
	},
	'proc:53:inflict on hit-injury': {
		id: BuffId['proc:53:inflict on hit-injury'],
		name: 'Active Injury Counter',
		stat: UnitStat.injuryCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_INJCONTER],
	},
	'proc:53:inflict on hit-curse': {
		id: BuffId['proc:53:inflict on hit-curse'],
		name: 'Active Curse Counter',
		stat: UnitStat.curseCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_CURSECOUNTER],
	},
	'proc:53:inflict on hit-paralysis': {
		id: BuffId['proc:53:inflict on hit-paralysis'],
		name: 'Active Paralysis Counter',
		stat: UnitStat.paralysisCounter,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_PARALYCOUNTER],
	},
	'proc:54:critical damage boost': {
		id: BuffId['proc:54:critical damage boost'],
		name: 'Active Critical Damage Boost',
		stat: UnitStat.criticalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_CRTUP],
	},
	'proc:55:elemental weakness damage-fire': {
		id: BuffId['proc:55:elemental weakness damage-fire'],
		name: 'Active Fire Elemental Damage Boost',
		stat: UnitStat.fireElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_FIREDMGUP],
	},
	'proc:55:elemental weakness damage-water': {
		id: BuffId['proc:55:elemental weakness damage-water'],
		name: 'Active Water Elemental Damage Boost',
		stat: UnitStat.waterElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_WATERDMGUP],
	},
	'proc:55:elemental weakness damage-earth': {
		id: BuffId['proc:55:elemental weakness damage-earth'],
		name: 'Active Earth Elemental Damage Boost',
		stat: UnitStat.earthElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_EARTHDMGUP],
	},
	'proc:55:elemental weakness damage-thunder': {
		id: BuffId['proc:55:elemental weakness damage-thunder'],
		name: 'Active Thunder Elemental Damage Boost',
		stat: UnitStat.thunderElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_THUNDERDMGUP],
	},
	'proc:55:elemental weakness damage-light': {
		id: BuffId['proc:55:elemental weakness damage-light'],
		name: 'Active Light Elemental Damage Boost',
		stat: UnitStat.lightElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_LIGHTDMGUP],
	},
	'proc:55:elemental weakness damage-dark': {
		id: BuffId['proc:55:elemental weakness damage-dark'],
		name: 'Active Dark Elemental Damage Boost',
		stat: UnitStat.darkElementalDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DARKDMGUP],
	},
	'proc:55:elemental weakness damage-unknown': {
		id: BuffId['proc:55:elemental weakness damage-unknown'],
		name: 'Active Elemental Damage Boost (Unspecified Element)',
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_ELEMENTDMGUP],
	},
	'proc:56:chance ko resistance': {
		id: BuffId['proc:56:chance ko resistance'],
		name: 'KO Resistance (Chance)',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_KOBLOCK],
	},
	'proc:57:bc drop resistance-base': {
		id: BuffId['proc:57:bc drop resistance-base'],
		name: 'Active Base Battle Crystal Drop Rate Reduction',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BCDOWN],
	},
	'proc:57:bc drop resistance-buff': {
		id: BuffId['proc:57:bc drop resistance-buff'],
		name: 'Active Buffed Battle Crystal Drop Rate Reduction',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BCDOWN],
	},
	'proc:57:hc drop resistance-base': {
		id: BuffId['proc:57:hc drop resistance-base'],
		name: 'Active Base Heart Crystal Drop Rate Reduction',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HCDOWN],
	},
	'proc:57:hc drop resistance-buff': {
		id: BuffId['proc:57:hc drop resistance-buff'],
		name: 'Active Buffed Heart Crystal Drop Rate Reduction',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HCDOWN],
	},
	'proc:58:spark vulnerability': {
		id: BuffId['proc:58:spark vulnerability'],
		name: 'Active Spark Vulnerability',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SPARKDMGUP],
	},
	'proc:59:attack reduction-bb': {
		id: BuffId['proc:59:attack reduction-bb'],
		name: 'Active BB ATK Reduction',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBATKDOWN],
	},
	'proc:59:attack reduction-sbb': {
		id: BuffId['proc:59:attack reduction-sbb'],
		name: 'Active SBB ATK Reduction',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SBBATKDOWN],
	},
	'proc:59:attack reduction-ubb': {
		id: BuffId['proc:59:attack reduction-ubb'],
		name: 'Active UBB ATK Reduction',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_UBBATKDOWN],
	},
	'proc:61:party bb gauge-scaled attack': {
		id: BuffId['proc:61:party bb gauge-scaled attack'],
		name: 'Party BB Gauge-Scaled Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_BBGAUGESCALED : IconId.ATK_AOE_BBGAUGESCALED],
	},
	'proc:61:party bc drain': {
		id: BuffId['proc:61:party bc drain'],
		name: 'Party BB Gauge Drain (Post-Attack)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_BBGAUGESCALED : IconId.ATK_AOE_BBGAUGESCALED, IconId.BUFF_BBFILLDOWN],
	},
	'proc:62:barrier-fire': {
		id: BuffId['proc:62:barrier-fire'],
		name: 'Fire Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_FIRESHIELD],
	},
	'proc:62:barrier-water': {
		id: BuffId['proc:62:barrier-water'],
		name: 'Water Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_WATERSHIELD],
	},
	'proc:62:barrier-earth': {
		id: BuffId['proc:62:barrier-earth'],
		name: 'Earth Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_EARTHSHIELD],
	},
	'proc:62:barrier-thunder': {
		id: BuffId['proc:62:barrier-thunder'],
		name: 'Thunder Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_THUNDERSHIELD],
	},
	'proc:62:barrier-light': {
		id: BuffId['proc:62:barrier-light'],
		name: 'Light Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_LIGHTSHIELD],
	},
	'proc:62:barrier-dark': {
		id: BuffId['proc:62:barrier-dark'],
		name: 'Dark Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_DARKSHIELD],
	},
	'proc:62:barrier-all': {
		id: BuffId['proc:62:barrier-all'],
		name: 'Barrier (All Elements)',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_ELEMENTSHIELD],
	},
	'proc:62:barrier-unknown': {
		id: BuffId['proc:62:barrier-unknown'],
		name: 'Barrier (Unspecified Element)',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_ELEMENTSHIELD],
	},
	'proc:64:consecutive usage attack': {
		id: BuffId['proc:64:consecutive usage attack'],
		name: 'Consecutive Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_USAGESCALED : IconId.ATK_AOE_USAGESCALED],
	},
	'proc:65:ailment attack boost': {
		id: BuffId['proc:65:ailment attack boost'],
		name: 'Active Attack Boost on Status Afflicted Foes',
		stat: UnitStat.ailmentAttackBoost,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_AILDMGUP],
	},
	'proc:66:chance revive': {
		id: BuffId['proc:66:chance revive'],
		name: 'Instant Revive (Chance)',
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_KOBLOCK],
	},
	'proc:67:bc fill on spark': {
		id: BuffId['proc:67:bc fill on spark'],
		name: 'Active BC Fill on Spark',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_SPARKBBUP],
	},
	'proc:68:guard mitigation': {
		id: BuffId['proc:68:guard mitigation'],
		name: 'Active Guard Damage Reduction',
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_GUARDCUT],
	},
	'proc:69:bc fill on guard-percent': {
		id: BuffId['proc:69:bc fill on guard-percent'],
		name: 'Active BC Fill on Guard (Percentage)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'proc:69:bc fill on guard-flat': {
		id: BuffId['proc:69:bc fill on guard-flat'],
		name: 'Active BC Fill on Guard (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_GUARDBBUP],
	},
	'proc:71:bc efficacy reduction': {
		id: BuffId['proc:71:bc efficacy reduction'],
		name: 'Active BC Efficacy Reduction',
		stat: UnitStat.bcEfficacy,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_BBFILLDOWN],
	},
	'proc:73:resist-atk down': {
		id: BuffId['proc:73:resist-atk down'],
		name: 'Active Attack Reduction Resistance',
		stat: UnitStat.atkDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTATKDOWN],
	},
	'proc:73:resist-def down': {
		id: BuffId['proc:73:resist-def down'],
		name: 'Active Defense Reduction Resistance',
		stat: UnitStat.defDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTDEFDOWN],
	},
	'proc:73:resist-rec down': {
		id: BuffId['proc:73:resist-rec down'],
		name: 'Active Recovery Reduction Resistance',
		stat: UnitStat.recDownResist,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_RESISTRECDOWN],
	},
	'proc:75:element squad-scaled attack': {
		id: BuffId['proc:75:element squad-scaled attack'],
		name: 'Element Squad-Scaled Damage',
		stackType: BuffStackType.Attack,
		icons: (buff: IBuff) => [(buff && buff.targetArea === TargetArea.Single) ? IconId.ATK_ST_ELEMENTSCALED : IconId.ATK_AOE_ELEMENTSCALED],
	},
	'proc:76:extra action': {
		id: BuffId['proc:76:extra action'],
		name: 'Active Extra Action',
		stat: UnitStat.extraAction,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_DBLSTRIKE],
	},
	'proc:78:self stat boost-atk': {
		id: BuffId['proc:78:self stat boost-atk'],
		name: 'Active Self Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWNLOCK : IconId.BUFF_SELFATKUP],
	},
	'proc:78:self stat boost-def': {
		id: BuffId['proc:78:self stat boost-def'],
		name: 'Active Self Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWNLOCK : IconId.BUFF_SELFDEFUP],
	},
	'proc:78:self stat boost-rec': {
		id: BuffId['proc:78:self stat boost-rec'],
		name: 'Active Self Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWNLOCK : IconId.BUFF_SELFRECUP],
	},
	'proc:78:self stat boost-crit': {
		id: BuffId['proc:78:self stat boost-crit'],
		name: 'Active Self Critical Hit Rate Boost',
		stat: UnitStat.crit,
		stackType: BuffStackType.Active,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_CRTRATEDOWNLOCK : IconId.BUFF_SELFCRTRATEUP],
	},
	'proc:79:player exp boost': {
		id: BuffId['proc:79:player exp boost'],
		name: 'Active Player EXP Boost',
		stat: UnitStat.expModification,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_PLAYEREXP],
	},
	UNKNOWN_CONDITIONAL_EFFECT_ID: {
		id: BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID,
		name: 'Unknown Conditional Effect',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	UNKNOWN_CONDITIONAL_BUFF_PARAMS: {
		id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
		name: 'Unknown Conditional Buff Parameters',
		stackType: BuffStackType.Unknown,
		icons: () => [IconId.UNKNOWN],
	},
	'conditional:1:attack buff': {
		id: BuffId['conditional:1:attack buff'],
		name: 'Conditional Attack Boost',
		stat: UnitStat.atk,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_ATKDOWN : IconId.BUFF_ATKUP],
	},
	'conditional:3:defense buff': {
		id: BuffId['conditional:3:defense buff'],
		name: 'Conditional Defense Boost',
		stat: UnitStat.def,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_DEFDOWN : IconId.BUFF_DEFUP],
	},
	'conditional:5:recovery buff': {
		id: BuffId['conditional:5:recovery buff'],
		name: 'Conditional Recovery Boost',
		stat: UnitStat.rec,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [(buff && buff.value && buff.value < 0) ? IconId.BUFF_RECDOWN : IconId.BUFF_RECUP],
	},
	'conditional:8:gradual heal': {
		id: BuffId['conditional:8:gradual heal'],
		name: 'Conditional Gradual Heal',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_HPREC],
	},
	'conditional:12:guaranteed ko resistance': {
		id: BuffId['conditional:12:guaranteed ko resistance'],
		name: 'Conditional Guaranteed KO Resistance',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_KOBLK],
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
	})(),
	'conditional:36:mitigation': {
		id: BuffId['conditional:36:mitigation'],
		name: 'Conditional Damage Reduction',
		stat: UnitStat.mitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_DAMAGECUT],
	},
	'conditional:37:gradual bc fill': {
		id: BuffId['conditional:37:gradual bc fill'],
		name: 'Conditional Gradual BC Fill',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_BBREC],
	},
	'conditional:40:spark damage': {
		id: BuffId['conditional:40:spark damage'],
		name: 'Conditional Spark Damage Boost',
		stat: UnitStat.sparkDamage,
		stackType: BuffStackType.ConditionalTimed,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_SPARKDOWN : IconId.BUFF_SPARKUP],
	},
	'conditional:72:attack boost-bb': {
		id: BuffId['conditional:72:attack boost-bb'],
		name: 'Conditional BB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_BBATKUP],
	},
	'conditional:72:attack boost-sbb': {
		id: BuffId['conditional:72:attack boost-sbb'],
		name: 'Conditional SBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_SBBATKUP],
	},
	'conditional:72:attack boost-ubb': {
		id: BuffId['conditional:72:attack boost-ubb'],
		name: 'Conditional UBB ATK Boost',
		stat: UnitStat.bbAtk,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_UBBATKUP],
	},
	'conditional:74:add atk down to attack': {
		id: BuffId['conditional:74:add atk down to attack'],
		name: 'Conditional Attack Reduction Infliction Added to Attack',
		stat: UnitStat.atkDownInflict,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_ADDATKDOWN],
	},
	'conditional:84:critical damage': {
		id: BuffId['conditional:84:critical damage'],
		name: 'Conditional Critical Damage Boost',
		stat: UnitStat.criticalDamage,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_CRTUP],
	},
	'conditional:91:chance ko resistance': {
		id: BuffId['conditional:91:chance ko resistance'],
		name: 'Conditional KO Resistance (Chance)',
		stat: UnitStat.koResistance,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_KOBLOCK],
	},
	'conditional:98:thunder barrier': {
		id: BuffId['conditional:98:thunder barrier'],
		name: 'Thunder Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_THUNDERSHIELD],
	},
	'conditional:99:light barrier': {
		id: BuffId['conditional:99:light barrier'],
		name: 'Conditional Light Barrier',
		stat: UnitStat.barrier,
		stackType: BuffStackType.Singleton,
		icons: () => [IconId.BUFF_LIGHTSHIELD],
	},
	'conditional:132:od fill rate': {
		id: BuffId['conditional:132:od fill rate'],
		name: 'Conditional OD Gauge Fill Rate',
		stat: UnitStat.odGauge,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_ODFILLBOOST],
	},
	'conditional:133:heal on hit': {
		id: BuffId['conditional:133:heal on hit'],
		name: 'Conditional Heal when Attacked (Chance)',
		stat: UnitStat.hpRecovery,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_BEENATK_HPREC],
	},
	'conditional:143:critical damage reduction-base': {
		id: BuffId['conditional:143:critical damage reduction-base'],
		name: 'Conditional Base Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'conditional:143:critical damage reduction-buff': {
		id: BuffId['conditional:143:critical damage reduction-buff'],
		name: 'Conditional Buffed Critical Damage Reduction',
		stat: UnitStat.criticalDamageMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_CRTDOWN],
	},
	'conditional:145:elemental weakness damage reduction-base': {
		id: BuffId['conditional:145:elemental weakness damage reduction-base'],
		name: 'Conditional Base Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'conditional:145:elemental weakness damage reduction-buff': {
		id: BuffId['conditional:145:elemental weakness damage reduction-buff'],
		name: 'Conditional Buffed Elemental Weakness Damage Reduction',
		stat: UnitStat.elementalWeaknessDamageMitigation,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_ELEMENTDOWN],
	},
	'conditional:153:chance inflict atk down on hit': {
		id: BuffId['conditional:153:chance inflict atk down on hit'],
		name: 'Conditional Attack Reduction Counter (Chance)',
		stat: UnitStat.atkDownCounter,
		stackType: BuffStackType.ConditionalTimed,
		icons: () => [IconId.BUFF_PROB_ATKREDUC],
	},
});
