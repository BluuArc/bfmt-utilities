import { TargetType, TargetArea } from '../../datamine-types';

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

export interface IBuff {
	id: string;

	/**
	 * @description The original proc/passive ID of the buff. This should only differ from the `id`
	 * property if a proc/passive ID contains multiple buffs.
	 */
	originalId: string;

	stackType: BuffStackType,
	targetType: TargetType;
	targetArea: TargetArea;
	effectDelay: string;

	/**
	 * @description Ordered from the skill that immediately grants the buff on use to
	 * the original source providing that buff. Typically for active buffs whose sources
	 * are items or extra skills and SP enhancements that enhance existing skills.
	 *
	 * Each entry should be in the format of `<BuffSource>-<ID of Buff Source>`. See {@link BuffSource}
	 * for possible types of sources.
	 */
	sources: string[];

	// TODO: nested buffs, conditions
}

/**
 * @description Dictionary representing a unit's stats and what buffs are affecting each stat.
 */
export interface IUnitState {
	hp: IBuff[];
	atk: IBuff[];
	def: IBuff[];
	rec: IBuff[];

	// TODO: add more as needed
}

export interface IEffectToBuffConversionContext {
	source: BuffSource,
	sourceId: string;

	/**
	 * @description Recreate the mapping of effect ID to conversion function before
	 * converting the given effect. Useful if the internal mapping is somehow in a
	 * bad state.
	 */
	reloadMapping?: boolean;
}