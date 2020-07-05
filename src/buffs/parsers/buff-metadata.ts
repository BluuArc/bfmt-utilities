import {
	BuffId,
	UnitStat,
	BuffStackType,
	IconId,
	IBuff,
} from './buff-types';
import { TargetArea } from '../../datamine-types';

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
		let elementalStatBoosts: { [id: string]: IBuffMetadata } = {};
		['fire', 'water', 'earth', 'thunder', 'light', 'dark', 'omniParadigm', 'unknown'].forEach((element) => {
			const buffElementKey = element !== 'omniParadigm'
				? element
				: 'element';
			const iconElementKey = (element !== 'omniParadigm' && element !== 'unknown')
				? element.toUpperCase()
				: 'ELEMENT';
			elementalStatBoosts = {
				...elementalStatBoosts,
				[`passive:2:${buffElementKey},hp`]: {
					id: `passive:2:${element},hp` as BuffId,
					name: 'Passive HP Boost',
					stat: UnitStat.hp,
					stackType: BuffStackType.Passive,
					icons: (buff: IBuff) => [((buff && buff.value && buff.value < 0) ? `BUFF_${iconElementKey}HPDOWN`: `BUFF_${iconElementKey}HPUP`) as IconId],
				},
				[`passive:2:${buffElementKey},atk`]: {
					id: `passive:2:${buffElementKey},atk` as BuffId,
					name: 'Passive Attack Boost',
					stat: UnitStat.atk,
					stackType: BuffStackType.Passive,
					icons: (buff: IBuff) => [((buff && buff.value && buff.value < 0) ? `BUFF_${iconElementKey}ATKDOWN`: `BUFF_${iconElementKey}ATKUP`) as IconId],
				},
				[`passive:2:${buffElementKey},def`]: {
					id: `passive:2:${buffElementKey},def` as BuffId,
					name: 'Passive Defense Boost',
					stat: UnitStat.def,
					stackType: BuffStackType.Passive,
					icons: (buff: IBuff) => [((buff && buff.value && buff.value < 0) ? `BUFF_${iconElementKey}DEFDOWN`: `BUFF_${iconElementKey}DEFUP`) as IconId],
				},
				[`passive:2:${buffElementKey},rec`]: {
					id: `passive:2:${buffElementKey},rec` as BuffId,
					name: 'Passive Recovery Boost',
					stat: UnitStat.rec,
					stackType: BuffStackType.Passive,
					icons: (buff: IBuff) => [((buff && buff.value && buff.value < 0) ? `BUFF_${iconElementKey}RECDOWN`: `BUFF_${iconElementKey}RECUP`) as IconId],
				},
				[`passive:2:${buffElementKey},crit`]: {
					id: `passive:2:${buffElementKey},crit` as BuffId,
					name: 'Passive Critical Hit Rate Boost',
					stat: UnitStat.crit,
					stackType: BuffStackType.Passive,
					icons: (buff: IBuff) => [((buff && buff.value && buff.value < 0) ? `BUFF_${iconElementKey}CRTRATEDOWN`: `BUFF_${iconElementKey}CRTRATEUP`) as IconId],
				},
			};
		});
		return elementalStatBoosts;
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
});
