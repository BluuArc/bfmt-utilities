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
		stackType: BuffStackType.Burst,
		icons: () => [IconId.BUFF_HPREC],
	},
});
