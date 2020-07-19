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
	// TODO: value schema?
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
		name: 'Gradual Heal',
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
});
