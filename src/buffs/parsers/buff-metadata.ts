import {
	BuffId,
	UnitStat,
	BuffStackType,
	IconId,
	IBuff,
	BuffConditionElement,
} from './buff-types';
import { TargetArea, UnitElement, UnitType } from '../../datamine-types';

export interface IBuffMetadata {
	id: BuffId;
	name: string;

	/**
	 * @description Unit stat that the given buff affects
	 */
	stat?: UnitStat;

	stackType: BuffStackType;

	icons: (buff: IBuff) => IconId[];
	// TODO: value schema for filters?
}

export const BUFF_METADATA: Readonly<{ [id: string]: IBuffMetadata }> = Object.freeze({
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
		name: 'Passive Gradual BB Gauge Fill',
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
		name: 'Passive Battle Crystal Drop Rate Boost',
		stat: UnitStat.bcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_BCDOWN : IconId.BUFF_BCDROP],
	},
	'passive:12:hc': {
		id: BuffId['passive:12:hc'],
		name: 'Passive Heart Crystal Drop Rate Boost',
		stat: UnitStat.hcDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_HCDOWN : IconId.BUFF_HCDROP],
	},
	'passive:12:item': {
		id: BuffId['passive:12:item'],
		name: 'Passive Item Drop Rate Boost',
		stat: UnitStat.itemDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ITEMDOWN : IconId.BUFF_ITEMDROP],
	},
	'passive:12:zel': {
		id: BuffId['passive:12:zel'],
		name: 'Passive Zel Drop Rate Boost',
		stat: UnitStat.zelDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_ZELDOWN : IconId.BUFF_ZELDROP],
	},
	'passive:12:karma': {
		id: BuffId['passive:12:karma'],
		name: 'Passive Karma Drop Rate Boost',
		stat: UnitStat.karmaDropRate,
		stackType: BuffStackType.Passive,
		icons: (buff: IBuff) => [buff && buff.value && buff.value < 0 ? IconId.BUFF_KARMADOWN : IconId.BUFF_KARMADROP],
	},
	'passive:13': {
		id: BuffId['passive:13'],
		name: 'BB Gauge Fill on Enemy Defeat',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
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
		name: 'Heal on Enemy Defeat',
		stat: UnitStat.hp,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_HPREC],
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
		stat: UnitStat.hp,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:3': {
		id: BuffId['proc:3'],
		name: 'Active Gradual Heal',
		stat: UnitStat.hp,
		stackType: BuffStackType.Active,
		icons: () => [IconId.BUFF_HPREC],
	},
	'proc:4:flat': {
		id: BuffId['proc:4:flat'],
		name: 'Burst BB Gauge Fill (Flat Amount)',
		stat: UnitStat.bbGauge,
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_BBREC],
	},
	'proc:4:percent': {
		id: BuffId['proc:4:percent'],
		name: 'Burst BB Gauge Fill (Percentage)',
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
});
