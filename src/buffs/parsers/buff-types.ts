import { TargetType, TargetArea, SphereTypeId, IBurstDamageFramesEntry } from '../../datamine-types';

/**
 * @description Provides info at a glance regarding a buff's source and how it stacks.
 */
export enum BuffStackType {
	/**
	 * @description The buff is activated via some skill and lasts for a number of turns.
	 * Sometimes referred to as procs. Buffs of the same type do not stack unless if they're
	 * from different levels. Two possible levels of sources are:
	 * 1. Brave Burst or Super Brave Burst (also includes enemy skills)
	 * 2. Ultimate Brave Burst or Dual Brave Burst
	 */
	Active = 'active',

	/**
	 * @description The buff is always active provided that the source is not nullified.
	 * Most passive buffs can stack with themselves.
	 */
	Passive = 'passive',

	/**
	 * @description The buff is applied for a number of turns once a certain condition is met.
	 * Buffs of the same type are not able to stack.
	 */
	ConditionalTimed = 'conditionalTimed',

	/**
	 * @description Only one instance of the buff can be active at a time and can last indefinitely.
	 * A couple examples of this are Barrier and Max HP Boost.
	 */
	Singleton = 'singleton',

	/**
	 * @description The buff's effects immediately apply to the target(s). This differs from singleton
	 * in that these values aren't permanent and some effects can "stack" (e.g. using two burst heals results
	 * in the HP bar filling by the sum of those burst heals).
	 */
	Burst = 'burst',

	/**
	 * @description A specific subset of `Burst` type buffs that deal damage to the target.
	 */
	Attack = 'attack',

	/**
	 * @description Only for buffs that cannot be processed by the library yet.
	 */
	Unknown = 'unknown',
}

export enum BuffSource {
	BraveBurst = 'bb',
	SuperBraveBurst = 'sbb',
	UltimateBraveBurst = 'ubb',

	DualBraveBurst = 'dbb',
	BondedBraveBurst = 'bbb',
	BondedSuperBraveBurst = 'dsbb',
	SpEnhancement = 'sp',

	Item = 'item',
	LeaderSkill = 'ls',
	ExtraSkill = 'es',

	/**
	 * @description Buffs that result of having a number of OE+ units in the squad.
	 */
	OmniParadigm = 'omniParadigm',

	/**
	 * @description Buffs based on a units type. See {@link UnitType}.
	 */
	UnitTypeBonus = 'unitTypeBonus',

	/**
	 * @description Examples include the passive bonuses available in Frontier Gates and Frontier Rifts
	 * as well as ambient turn reductions present in some late-game quests.
	 */
	Quest = 'quest',
}

export interface IBuffConditions {
	/**
	 * @description Array of unit IDs
	 */
	units?: string[];

	/**
	 * @description Array of item IDs
	 */
	items?: string[];

	/**
	 * @description Array of sphere type IDs
	 */
	sphereTypes?: SphereTypeId[];

	/**
	 * @description Array of unprocessed conditions in the format
	 * of `type:<typeId>,condition:<conditionId>`.
	 */
	unknowns?: string[];
}

/**
 * @description Interface for buffs that have unknown parameters (but can still be
 * partially processed). The format of the name for these unknown parameter properties
 * is `param_<index>`, where `index` is the index of that property in the `effect.params` string.
 */
export interface IGenericBuffValue {
	[param: string]: string;
}

export interface IBuff {
	id: BuffId | string;

	/**
	 * @description The original proc/passive ID of the buff. This should only differ from the `id`
	 * property if a proc/passive ID contains multiple buffs.
	 */
	originalId: string;

	targetType?: TargetType;
	targetArea?: TargetArea;
	effectDelay?: string;

	/**
	 * @description Ordered from the skill that immediately grants the buff on use to
	 * the original source providing that buff. Typically for active buffs whose sources
	 * are items or extra skills and SP enhancements that enhance existing skills.It is
	 * ordered such that the entry at index 0 is the immediate source of the buff while
	 * the entry at the last index is the original source of the buff.
	 *
	 * Each entry should be in the format of `<BuffSource>-<ID of Buff Source>`. See {@link BuffSource}
	 * for possible types of sources.
	 */
	sources: string[];

	value?: string | number | IGenericBuffValue | any;
	conditions?: IBuffConditions;
}

/**
 * @description Stats that a unit can have.
 */
export enum UnitStat {
	hp = 'hp',
	atk = 'atk',
	def = 'def',
	rec = 'rec',
	crit = 'crit',
}

/**
 * @description Dictionary representing a unit's stats and what buffs are affecting each stat.
 */
export interface IUnitState {
	hp: IBuff[];
	atk: IBuff[];
	def: IBuff[];
	rec: IBuff[];
	crit: IBuff[];

	// TODO: add more as needed
}

/**
 * @description Aggregate object to encapsulate information not in the effect used in the conversion process.
 */
export interface IEffectToBuffConversionContext {
	source: BuffSource,
	sourceId: string;

	/**
	 * @description Recreate the mapping of effect ID to conversion function before
	 * converting the given effect. Useful if the internal mapping is somehow in a
	 * bad state.
	 */
	reloadMapping?: boolean;

	previousSources?: string[];

	damageFrames?: IBurstDamageFramesEntry;
}

export enum IconId {
	UNKNOWN = 'UNKNOWN',
	BUFF_HPUP = 'BUFF_HPUP',
	BUFF_HPDOWN = 'BUFF_HPDOWN',
	BUFF_ATKUP = 'BUFF_ATKUP',
  BUFF_ATKDOWN = 'BUFF_ATKDOWN',
  BUFF_DEFUP = 'BUFF_DEFUP',
  BUFF_DEFDOWN = 'BUFF_DEFDOWN',
  BUFF_RECUP = 'BUFF_RECUP',
  BUFF_RECDOWN = 'BUFF_RECDOWN',
	BUFF_CRTRATEUP = 'BUFF_CRTRATEUP',
	BUFF_CRTRATEDOWN = 'BUFF_CRTRATEDOWN',
	BUFF_HPREC = 'BUFF_HPREC',

	BUFF_FIREHPUP ='BUFF_FIREHPUP',
	BUFF_FIREATKUP ='BUFF_FIREATKUP',
	BUFF_FIREDEFUP ='BUFF_FIREDEFUP',
	BUFF_FIRERECUP ='BUFF_FIRERECUP',
	BUFF_FIRECRTRATEUP ='BUFF_FIRECRTRATEUP',
	BUFF_WATERHPUP ='BUFF_WATERHPUP',
	BUFF_WATERATKUP ='BUFF_WATERATKUP',
	BUFF_WATERDEFUP ='BUFF_WATERDEFUP',
	BUFF_WATERRECUP ='BUFF_WATERRECUP',
	BUFF_WATERCRTRATEUP ='BUFF_WATERCRTRATEUP',
	BUFF_EARTHHPUP ='BUFF_EARTHHPUP',
	BUFF_EARTHATKUP ='BUFF_EARTHATKUP',
	BUFF_EARTHDEFUP ='BUFF_EARTHDEFUP',
	BUFF_EARTHRECUP ='BUFF_EARTHRECUP',
	BUFF_EARTHCRTRATEUP ='BUFF_EARTHCRTRATEUP',
	BUFF_THUNDERHPUP ='BUFF_THUNDERHPUP',
	BUFF_THUNDERATKUP ='BUFF_THUNDERATKUP',
	BUFF_THUNDERDEFUP ='BUFF_THUNDERDEFUP',
	BUFF_THUNDERRECUP ='BUFF_THUNDERRECUP',
	BUFF_THUNDERCRTRATEUP ='BUFF_THUNDERCRTRATEUP',
	BUFF_LIGHTHPUP ='BUFF_LIGHTHPUP',
	BUFF_LIGHTATKUP ='BUFF_LIGHTATKUP',
	BUFF_LIGHTDEFUP ='BUFF_LIGHTDEFUP',
	BUFF_LIGHTRECUP ='BUFF_LIGHTRECUP',
	BUFF_LIGHTCRTRATEUP ='BUFF_LIGHTCRTRATEUP',
	BUFF_DARKHPUP ='BUFF_DARKHPUP',
	BUFF_DARKATKUP ='BUFF_DARKATKUP',
	BUFF_DARKDEFUP ='BUFF_DARKDEFUP',
	BUFF_DARKRECUP ='BUFF_DARKRECUP',
	BUFF_DARKCRTRATEUP ='BUFF_DARKCRTRATEUP',
	BUFF_ELEMENTHPUP = 'BUFF_ELEMENTHPUP',
	BUFF_ELEMENTATKUP = 'BUFF_ELEMENTATKUP',
	BUFF_ELEMENTDEFUP = 'BUFF_ELEMENTDEFUP',
	BUFF_ELEMENTRECUP = 'BUFF_ELEMENTRECUP',
	BUFF_ELEMENTCRTRATEUP = 'BUFF_ELEMENTCRTRATEUP',
	BUFF_FIREHPDOWN ='BUFF_FIREHPDOWN',
	BUFF_FIREATKDOWN ='BUFF_FIREATKDOWN',
	BUFF_FIREDEFDOWN ='BUFF_FIREDEFDOWN',
	BUFF_FIRERECDOWN ='BUFF_FIRERECDOWN',
	BUFF_FIRECRTRATEDOWN ='BUFF_FIRECRTRATEDOWN',
	BUFF_WATERHPDOWN ='BUFF_WATERHPDOWN',
	BUFF_WATERATKDOWN ='BUFF_WATERATKDOWN',
	BUFF_WATERDEFDOWN ='BUFF_WATERDEFDOWN',
	BUFF_WATERRECDOWN ='BUFF_WATERRECDOWN',
	BUFF_WATERCRTRATEDOWN ='BUFF_WATERCRTRATEDOWN',
	BUFF_EARTHHPDOWN ='BUFF_EARTHHPDOWN',
	BUFF_EARTHATKDOWN ='BUFF_EARTHATKDOWN',
	BUFF_EARTHDEFDOWN ='BUFF_EARTHDEFDOWN',
	BUFF_EARTHRECDOWN ='BUFF_EARTHRECDOWN',
	BUFF_EARTHCRTRATEDOWN ='BUFF_EARTHCRTRATEDOWN',
	BUFF_THUNDERHPDOWN ='BUFF_THUNDERHPDOWN',
	BUFF_THUNDERATKDOWN ='BUFF_THUNDERATKDOWN',
	BUFF_THUNDERDEFDOWN ='BUFF_THUNDERDEFDOWN',
	BUFF_THUNDERRECDOWN ='BUFF_THUNDERRECDOWN',
	BUFF_THUNDERCRTRATEDOWN ='BUFF_THUNDERCRTRATEDOWN',
	BUFF_LIGHTHPDOWN ='BUFF_LIGHTHPDOWN',
	BUFF_LIGHTATKDOWN ='BUFF_LIGHTATKDOWN',
	BUFF_LIGHTDEFDOWN ='BUFF_LIGHTDEFDOWN',
	BUFF_LIGHTRECDOWN ='BUFF_LIGHTRECDOWN',
	BUFF_LIGHTCRTRATEDOWN ='BUFF_LIGHTCRTRATEDOWN',
	BUFF_DARKHPDOWN ='BUFF_DARKHPDOWN',
	BUFF_DARKATKDOWN ='BUFF_DARKATKDOWN',
	BUFF_DARKDEFDOWN ='BUFF_DARKDEFDOWN',
	BUFF_DARKRECDOWN ='BUFF_DARKRECDOWN',
	BUFF_DARKCRTRATEDOWN ='BUFF_DARKCRTRATEDOWN',
	BUFF_ELEMENTHPDOWN = 'BUFF_ELEMENTHPDOWN',
	BUFF_ELEMENTATKDOWN = 'BUFF_ELEMENTATKDOWN',
	BUFF_ELEMENTDEFDOWN = 'BUFF_ELEMENTDEFDOWN',
	BUFF_ELEMENTRECDOWN = 'BUFF_ELEMENTRECDOWN',
	BUFF_ELEMENTCRTRATEDOWN = 'BUFF_ELEMENTCRTRATEDOWN',

	ATK_ST = 'ATK_ST',
	ATK_AOE = 'ATK_AOE',
}

/**
 * @description Format of these IDs are `<passive|proc>:<original effect ID>:<stat>`.
 * Usage of passive/proc and original effect ID are for easy tracking of the original effect
 * source of a given buff.
 */
export enum BuffId {
	UNKNOWN_PASSIVE_EFFECT_ID = 'UNKNOWN_PASSIVE_EFFECT_ID',
	UNKNOWN_PASSIVE_BUFF_PARAMS = 'UNKNOWN_PASSIVE_BUFF_PARAMS',
	'passive:1:hp' = 'passive:1:hp',
	'passive:1:atk' = 'passive:1:atk',
	'passive:1:def' = 'passive:1:def',
	'passive:1:rec' = 'passive:1:rec',
	'passive:1:crit' = 'passive:1:crit',
	'passive:2:fire,hp' = 'passive:2:fire,hp',
	'passive:2:fire,atk' = 'passive:2:fire,atk',
	'passive:2:fire,def' = 'passive:2:fire,def',
	'passive:2:fire,rec' = 'passive:2:fire,rec',
	'passive:2:fire,crit' = 'passive:2:fire,crit',
	'passive:2:water,hp' = 'passive:2:water,hp',
	'passive:2:water,atk' = 'passive:2:water,atk',
	'passive:2:water,def' = 'passive:2:water,def',
	'passive:2:water,rec' = 'passive:2:water,rec',
	'passive:2:water,crit' = 'passive:2:water,crit',
	'passive:2:earth,hp' = 'passive:2:earth,hp',
	'passive:2:earth,atk' = 'passive:2:earth,atk',
	'passive:2:earth,def' = 'passive:2:earth,def',
	'passive:2:earth,rec' = 'passive:2:earth,rec',
	'passive:2:earth,crit' = 'passive:2:earth,crit',
	'passive:2:thunder,hp' = 'passive:2:thunder,hp',
	'passive:2:thunder,atk' = 'passive:2:thunder,atk',
	'passive:2:thunder,def' = 'passive:2:thunder,def',
	'passive:2:thunder,rec' = 'passive:2:thunder,rec',
	'passive:2:thunder,crit' = 'passive:2:thunder,crit',
	'passive:2:light,hp' = 'passive:2:light,hp',
	'passive:2:light,atk' = 'passive:2:light,atk',
	'passive:2:light,def' = 'passive:2:light,def',
	'passive:2:light,rec' = 'passive:2:light,rec',
	'passive:2:light,crit' = 'passive:2:light,crit',
	'passive:2:dark,hp' = 'passive:2:dark,hp',
	'passive:2:dark,atk' = 'passive:2:dark,atk',
	'passive:2:dark,def' = 'passive:2:dark,def',
	'passive:2:dark,rec' = 'passive:2:dark,rec',
	'passive:2:dark,crit' = 'passive:2:dark,crit',
	'passive:2:element,hp' = 'passive:2:element,hp',
	'passive:2:element,atk' = 'passive:2:element,atk',
	'passive:2:element,def' = 'passive:2:element,def',
	'passive:2:element,rec' = 'passive:2:element,rec',
	'passive:2:element,crit' = 'passive:2:element,crit',
	'passive:2:unknown,hp' = 'passive:2:unknown,hp',
	'passive:2:unknown,atk' = 'passive:2:unknown,atk',
	'passive:2:unknown,def' = 'passive:2:unknown,def',
	'passive:2:unknown,rec' = 'passive:2:unknown,rec',
	'passive:2:unknown,crit' = 'passive:2:unknown,crit',
	UNKNOWN_PROC_EFFECT_ID = 'UNKNOWN_PROC_EFFECT_ID',
	UNKNOWN_PROC_BUFF_PARAMS = 'UNKNOWN_PROC_BUFF_PARAMS',
	'proc:1' = 'proc:1',
	'proc:2' = 'proc:2',
}
