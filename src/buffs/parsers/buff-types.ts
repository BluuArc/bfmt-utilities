import { TargetType, TargetArea, SphereTypeId, IBurstDamageFramesEntry, UnitElement, UnitType } from '../../datamine-types';

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

/**
 * @description Extra element values that can be used in addition to {@link UnitElement}.
 */
export enum BuffConditionElement {
	Unknown = 'unknown',
	OmniParadigm = 'omniParadigm',
	All = 'all',
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

	/**
	 * @description Array of elements required for this buff to activate.
	 */
	targetElements?: (UnitElement | BuffConditionElement)[];

	targetUnitType?: UnitType | 'unknown';

	hpGreaterThanOrEqualTo?: number;
	hpLessThanOrEqualTo?: number;

	onEnemyDefeat?: boolean;
	onBattleWin?: boolean;
	whenAttacked?: boolean;
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
	duration?: number;

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
 * @description Stats on a unit that a buff can affect.
 */
export enum UnitStat {
	hp = 'hp',
	atk = 'atk',
	def = 'def',
	rec = 'rec',
	crit = 'crit',

	hpRecovery = 'hpRecovery',
	bbGauge = 'bbGauge',

	bcDropRate = 'bcDropRate',
	hcDropRate = 'hcDropRate',
	itemDropRate = 'itemDropRate',
	zelDropRate = 'zelDropRate',
	karmaDropRate = 'karmaDropRate',

	hcEfficacy = 'hcEfficacy',

	poisonResist = 'poisonResist',
	weakResist = 'weakResist',
	sickResist = 'sickResist',
	injuryResist = 'injuryResist',
	curseResist = 'curseResist',
	paralysisResist = 'paralysisResist',

	poisonInflict = 'poisonInflict',
	weakInflict = 'weakInflict',
	sickInflict = 'sickInflict',
	injuryInflict = 'injuryInflict',
	curseInflict = 'curseInflict',
	paralysisInflict = 'paralysisInflict',

	atkDownResist = 'atkDownResist',
	defDownResist = 'defDownResist',
	recDownResist = 'recDownResist',

	atkDownInflict = 'atkDownInflict',
	defDownInflict = 'defDownInflict',
	recDownInflict = 'recDownInflict',

	mitigation = 'mitigation',
	fireMitigation = 'fireMitigation',
	waterMitigation = 'waterMitigation',
	earthMitigation = 'earthMitigation',
	thunderMitigation = 'thunderMitigation',
	lightMitigation = 'lightMitigation',
	darkMitigation = 'darkMitigation',

	turnDurationModification = 'turnDurationModification',

	koResistance = 'koResistance',
	revive = 'revive',

	defenseIgnore = 'defenseIgnore',
	sparkDamage = 'sparkDamage',

	hitCountModification = 'hitCountModification',

	damageReflect = 'damageReflect',

	targetingModification = 'targetingModification',
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

	hpRecovery: IBuff[];
	bbGauge: IBuff[];

	bcDropRate: IBuff[];
	hcDropRate: IBuff[];
	itemDropRate: IBuff[];
	zelDropRate: IBuff[];
	karmaDropRate: IBuff[];

	hcEfficacy: IBuff[];

	poisonResist: IBuff[];
	weakResist: IBuff[];
	sickResist: IBuff[];
	injuryResist: IBuff[];
	curseResist: IBuff[];
	paralysisResist: IBuff[];

	poisonInflict: IBuff[];
	weakInflict: IBuff[];
	sickInflict: IBuff[];
	injuryInflict: IBuff[];
	curseInflict: IBuff[];
	paralysisInflict: IBuff[];

	atkDownResist: IBuff[];
	defDownResist: IBuff[];
	recDownResist: IBuff[];

	atkDownInflict: IBuff[];
	defDownInflict: IBuff[];
	recDownInflict: IBuff[];

	mitigation: IBuff[],
	fireMitigation: IBuff[],
	waterMitigation: IBuff[],
	earthMitigation: IBuff[],
	thunderMitigation: IBuff[],
	lightMitigation: IBuff[],
	darkMitigation: IBuff[],

	turnDurationModification: IBuff[];

	koResistance: IBuff[];
	revive: IBuff[];

	defenseIgnore: IBuff[];
	sparkDamage: IBuff[];

	hitCountModification: IBuff[];

	damageReflect: IBuff[];

	targetingModification: IBuff[];
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
	TURN_DURATION_UP = 'TURN_DURATION_UP',
	TURN_DURATION_DOWN = 'TURN_DURATION_DOWN',

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

	BUFF_HPTHRESHATKUP = 'BUFF_HPTHRESHATKUP',
	BUFF_HPTHRESHATKDOWN = 'BUFF_HPTHRESHATKDOWN',
	BUFF_HPTHRESHDEFUP = 'BUFF_HPTHRESHDEFUP',
	BUFF_HPTHRESHDEFDOWN = 'BUFF_HPTHRESHDEFDOWN',
	BUFF_HPTHRESHRECUP = 'BUFF_HPTHRESHRECUP',
	BUFF_HPTHRESHRECDOWN = 'BUFF_HPTHRESHRECDOWN',
	BUFF_HPTHRESHCRTRATEUP = 'BUFF_HPTHRESHCRTRATEUP',
	BUFF_HPTHRESHCRTRATEDOWN = 'BUFF_HPTHRESHCRTRATEDOWN',

	BUFF_HPREC = 'BUFF_HPREC',
	BUFF_BBREC = 'BUFF_BBREC',

	BUFF_DAMAGEBB = 'BUFF_DAMAGEBB',
	BUFF_BEENATK_HPREC = 'BUFF_BEENATK_HPREC',

	BUFF_FIREHPUP = 'BUFF_FIREHPUP',
	BUFF_FIREHPDOWN = 'BUFF_FIREHPDOWN',
	BUFF_FIREATKUP = 'BUFF_FIREATKUP',
	BUFF_FIREATKDOWN = 'BUFF_FIREATKDOWN',
	BUFF_FIREDEFUP = 'BUFF_FIREDEFUP',
	BUFF_FIREDEFDOWN = 'BUFF_FIREDEFDOWN',
	BUFF_FIRERECUP = 'BUFF_FIRERECUP',
	BUFF_FIRERECDOWN = 'BUFF_FIRERECDOWN',
	BUFF_FIRECRTRATEUP = 'BUFF_FIRECRTRATEUP',
	BUFF_FIRECRTRATEDOWN = 'BUFF_FIRECRTRATEDOWN',
	BUFF_WATERHPUP = 'BUFF_WATERHPUP',
	BUFF_WATERHPDOWN = 'BUFF_WATERHPDOWN',
	BUFF_WATERATKUP = 'BUFF_WATERATKUP',
	BUFF_WATERATKDOWN = 'BUFF_WATERATKDOWN',
	BUFF_WATERDEFUP = 'BUFF_WATERDEFUP',
	BUFF_WATERDEFDOWN = 'BUFF_WATERDEFDOWN',
	BUFF_WATERRECUP = 'BUFF_WATERRECUP',
	BUFF_WATERRECDOWN = 'BUFF_WATERRECDOWN',
	BUFF_WATERCRTRATEUP = 'BUFF_WATERCRTRATEUP',
	BUFF_WATERCRTRATEDOWN = 'BUFF_WATERCRTRATEDOWN',
	BUFF_EARTHHPUP = 'BUFF_EARTHHPUP',
	BUFF_EARTHHPDOWN = 'BUFF_EARTHHPDOWN',
	BUFF_EARTHATKUP = 'BUFF_EARTHATKUP',
	BUFF_EARTHATKDOWN = 'BUFF_EARTHATKDOWN',
	BUFF_EARTHDEFUP = 'BUFF_EARTHDEFUP',
	BUFF_EARTHDEFDOWN = 'BUFF_EARTHDEFDOWN',
	BUFF_EARTHRECUP = 'BUFF_EARTHRECUP',
	BUFF_EARTHRECDOWN = 'BUFF_EARTHRECDOWN',
	BUFF_EARTHCRTRATEUP = 'BUFF_EARTHCRTRATEUP',
	BUFF_EARTHCRTRATEDOWN = 'BUFF_EARTHCRTRATEDOWN',
	BUFF_THUNDERHPUP = 'BUFF_THUNDERHPUP',
	BUFF_THUNDERHPDOWN = 'BUFF_THUNDERHPDOWN',
	BUFF_THUNDERATKUP = 'BUFF_THUNDERATKUP',
	BUFF_THUNDERATKDOWN = 'BUFF_THUNDERATKDOWN',
	BUFF_THUNDERDEFUP = 'BUFF_THUNDERDEFUP',
	BUFF_THUNDERDEFDOWN = 'BUFF_THUNDERDEFDOWN',
	BUFF_THUNDERRECUP = 'BUFF_THUNDERRECUP',
	BUFF_THUNDERRECDOWN = 'BUFF_THUNDERRECDOWN',
	BUFF_THUNDERCRTRATEUP = 'BUFF_THUNDERCRTRATEUP',
	BUFF_THUNDERCRTRATEDOWN = 'BUFF_THUNDERCRTRATEDOWN',
	BUFF_LIGHTHPUP = 'BUFF_LIGHTHPUP',
	BUFF_LIGHTHPDOWN = 'BUFF_LIGHTHPDOWN',
	BUFF_LIGHTATKUP = 'BUFF_LIGHTATKUP',
	BUFF_LIGHTATKDOWN = 'BUFF_LIGHTATKDOWN',
	BUFF_LIGHTDEFUP = 'BUFF_LIGHTDEFUP',
	BUFF_LIGHTDEFDOWN = 'BUFF_LIGHTDEFDOWN',
	BUFF_LIGHTRECUP = 'BUFF_LIGHTRECUP',
	BUFF_LIGHTRECDOWN = 'BUFF_LIGHTRECDOWN',
	BUFF_LIGHTCRTRATEUP = 'BUFF_LIGHTCRTRATEUP',
	BUFF_LIGHTCRTRATEDOWN = 'BUFF_LIGHTCRTRATEDOWN',
	BUFF_DARKHPUP = 'BUFF_DARKHPUP',
	BUFF_DARKHPDOWN = 'BUFF_DARKHPDOWN',
	BUFF_DARKATKUP = 'BUFF_DARKATKUP',
	BUFF_DARKATKDOWN = 'BUFF_DARKATKDOWN',
	BUFF_DARKDEFUP = 'BUFF_DARKDEFUP',
	BUFF_DARKDEFDOWN = 'BUFF_DARKDEFDOWN',
	BUFF_DARKRECUP = 'BUFF_DARKRECUP',
	BUFF_DARKRECDOWN = 'BUFF_DARKRECDOWN',
	BUFF_DARKCRTRATEUP = 'BUFF_DARKCRTRATEUP',
	BUFF_DARKCRTRATEDOWN = 'BUFF_DARKCRTRATEDOWN',
	BUFF_ELEMENTHPUP = 'BUFF_ELEMENTHPUP',
	BUFF_ELEMENTHPDOWN = 'BUFF_ELEMENTHPDOWN',
	BUFF_ELEMENTATKUP = 'BUFF_ELEMENTATKUP',
	BUFF_ELEMENTATKDOWN = 'BUFF_ELEMENTATKDOWN',
	BUFF_ELEMENTDEFUP = 'BUFF_ELEMENTDEFUP',
	BUFF_ELEMENTDEFDOWN = 'BUFF_ELEMENTDEFDOWN',
	BUFF_ELEMENTRECUP = 'BUFF_ELEMENTRECUP',
	BUFF_ELEMENTRECDOWN = 'BUFF_ELEMENTRECDOWN',
	BUFF_ELEMENTCRTRATEUP = 'BUFF_ELEMENTCRTRATEUP',
	BUFF_ELEMENTCRTRATEDOWN = 'BUFF_ELEMENTCRTRATEDOWN',

	BUFF_LORDHPUP = 'BUFF_LORDHPUP',
	BUFF_LORDHPDOWN = 'BUFF_LORDHPDOWN',
	BUFF_LORDATKUP = 'BUFF_LORDATKUP',
	BUFF_LORDATKDOWN = 'BUFF_LORDATKDOWN',
	BUFF_LORDDEFUP = 'BUFF_LORDDEFUP',
	BUFF_LORDDEFDOWN = 'BUFF_LORDDEFDOWN',
	BUFF_LORDRECUP = 'BUFF_LORDRECUP',
	BUFF_LORDRECDOWN = 'BUFF_LORDRECDOWN',
	BUFF_LORDCRTRATEUP = 'BUFF_LORDCRTRATEUP',
	BUFF_LORDCRTRATEDOWN = 'BUFF_LORDCRTRATEDOWN',
	BUFF_ANIMAHPUP = 'BUFF_ANIMAHPUP',
	BUFF_ANIMAHPDOWN = 'BUFF_ANIMAHPDOWN',
	BUFF_ANIMAATKUP = 'BUFF_ANIMAATKUP',
	BUFF_ANIMAATKDOWN = 'BUFF_ANIMAATKDOWN',
	BUFF_ANIMADEFUP = 'BUFF_ANIMADEFUP',
	BUFF_ANIMADEFDOWN = 'BUFF_ANIMADEFDOWN',
	BUFF_ANIMARECUP = 'BUFF_ANIMARECUP',
	BUFF_ANIMARECDOWN = 'BUFF_ANIMARECDOWN',
	BUFF_ANIMACRTRATEUP = 'BUFF_ANIMACRTRATEUP',
	BUFF_ANIMACRTRATEDOWN = 'BUFF_ANIMACRTRATEDOWN',
	BUFF_BREAKERHPUP = 'BUFF_BREAKERHPUP',
	BUFF_BREAKERHPDOWN = 'BUFF_BREAKERHPDOWN',
	BUFF_BREAKERATKUP = 'BUFF_BREAKERATKUP',
	BUFF_BREAKERATKDOWN = 'BUFF_BREAKERATKDOWN',
	BUFF_BREAKERDEFUP = 'BUFF_BREAKERDEFUP',
	BUFF_BREAKERDEFDOWN = 'BUFF_BREAKERDEFDOWN',
	BUFF_BREAKERRECUP = 'BUFF_BREAKERRECUP',
	BUFF_BREAKERRECDOWN = 'BUFF_BREAKERRECDOWN',
	BUFF_BREAKERCRTRATEUP = 'BUFF_BREAKERCRTRATEUP',
	BUFF_BREAKERCRTRATEDOWN = 'BUFF_BREAKERCRTRATEDOWN',
	BUFF_GUARDIANHPUP = 'BUFF_GUARDIANHPUP',
	BUFF_GUARDIANHPDOWN = 'BUFF_GUARDIANHPDOWN',
	BUFF_GUARDIANATKUP = 'BUFF_GUARDIANATKUP',
	BUFF_GUARDIANATKDOWN = 'BUFF_GUARDIANATKDOWN',
	BUFF_GUARDIANDEFUP = 'BUFF_GUARDIANDEFUP',
	BUFF_GUARDIANDEFDOWN = 'BUFF_GUARDIANDEFDOWN',
	BUFF_GUARDIANRECUP = 'BUFF_GUARDIANRECUP',
	BUFF_GUARDIANRECDOWN = 'BUFF_GUARDIANRECDOWN',
	BUFF_GUARDIANCRTRATEUP = 'BUFF_GUARDIANCRTRATEUP',
	BUFF_GUARDIANCRTRATEDOWN = 'BUFF_GUARDIANCRTRATEDOWN',
	BUFF_ORACLEHPUP = 'BUFF_ORACLEHPUP',
	BUFF_ORACLEHPDOWN = 'BUFF_ORACLEHPDOWN',
	BUFF_ORACLEATKUP = 'BUFF_ORACLEATKUP',
	BUFF_ORACLEATKDOWN = 'BUFF_ORACLEATKDOWN',
	BUFF_ORACLEDEFUP = 'BUFF_ORACLEDEFUP',
	BUFF_ORACLEDEFDOWN = 'BUFF_ORACLEDEFDOWN',
	BUFF_ORACLERECUP = 'BUFF_ORACLERECUP',
	BUFF_ORACLERECDOWN = 'BUFF_ORACLERECDOWN',
	BUFF_ORACLECRTRATEUP = 'BUFF_ORACLECRTRATEUP',
	BUFF_ORACLECRTRATEDOWN = 'BUFF_ORACLECRTRATEDOWN',
	BUFF_REXHPUP = 'BUFF_REXHPUP',
	BUFF_REXHPDOWN = 'BUFF_REXHPDOWN',
	BUFF_REXATKUP = 'BUFF_REXATKUP',
	BUFF_REXATKDOWN = 'BUFF_REXATKDOWN',
	BUFF_REXDEFUP = 'BUFF_REXDEFUP',
	BUFF_REXDEFDOWN = 'BUFF_REXDEFDOWN',
	BUFF_REXRECUP = 'BUFF_REXRECUP',
	BUFF_REXRECDOWN = 'BUFF_REXRECDOWN',
	BUFF_REXCRTRATEUP = 'BUFF_REXCRTRATEUP',
	BUFF_REXCRTRATEDOWN = 'BUFF_REXCRTRATEDOWN',
	BUFF_UNITTYPEHPUP = 'BUFF_UNITTYPEHPUP',
	BUFF_UNITTYPEHPDOWN = 'BUFF_UNITTYPEHPDOWN',
	BUFF_UNITTYPEATKUP = 'BUFF_UNITTYPEATKUP',
	BUFF_UNITTYPEATKDOWN = 'BUFF_UNITTYPEATKDOWN',
	BUFF_UNITTYPEDEFUP = 'BUFF_UNITTYPEDEFUP',
	BUFF_UNITTYPEDEFDOWN = 'BUFF_UNITTYPEDEFDOWN',
	BUFF_UNITTYPERECUP = 'BUFF_UNITTYPERECUP',
	BUFF_UNITTYPERECDOWN = 'BUFF_UNITTYPERECDOWN',
	BUFF_UNITTYPECRTRATEUP = 'BUFF_UNITTYPECRTRATEUP',
	BUFF_UNITTYPECRTRATEDOWN = 'BUFF_UNITTYPECRTRATEDOWN',

	BUFF_CONVERTATKUP = 'BUFF_CONVERTATKUP',
	BUFF_CONVERTATKDOWN = 'BUFF_CONVERTATKDOWN',
	BUFF_CONVERTDEFUP = 'BUFF_CONVERTDEFUP',
	BUFF_CONVERTDEFDOWN = 'BUFF_CONVERTDEFDOWN',
	BUFF_CONVERTRECUP = 'BUFF_CONVERTRECUP',
	BUFF_CONVERTRECDOWN = 'BUFF_CONVERTRECDOWN',

	BUFF_POISONBLK = 'BUFF_POISONBLK',
	BUFF_WEAKBLK = 'BUFF_WEAKBLK',
	BUFF_SICKBLK = 'BUFF_SICKBLK',
	BUFF_INJURYBLK = 'BUFF_INJURYBLK',
	BUFF_CURSEBLK = 'BUFF_CURSEBLK',
	BUFF_PARALYSISBLK = 'BUFF_PARALYSISBLK',

	BUFF_ATKDOWNBLK = 'BUFF_ATKDOWNBLK',
	BUFF_DEFDOWNBLK = 'BUFF_DEFDOWNBLK',
	BUFF_RECDOWNBLK = 'BUFF_RECDOWNBLK',
	BUFF_AILMENTBLK = 'BUFF_AILMENTBLK',

	DEBUFF_POISON = 'DEBUFF_POISON',
	DEBUFF_WEAK = 'DEBUFF_WEAK',
	DEBUFF_SICK = 'DEBUFF_SICK',
	DEBUFF_INJURY = 'DEBUFF_INJURY',
	DEBUFF_CURSE = 'DEBUFF_CURSE',
	DEBUFF_PARALYSIS = 'DEBUFF_PARALYSIS',
	DEBUFF_AILMENT = 'DEBUFF_AILMENT',

	BUFF_ADDPOISON = 'BUFF_ADDPOISON',
  BUFF_ADDWEAK = 'BUFF_ADDWEAK',
  BUFF_ADDSICK = 'BUFF_ADDSICK',
  BUFF_ADDINJURY = 'BUFF_ADDINJURY',
  BUFF_ADDCURSE = 'BUFF_ADDCURSE',
	BUFF_ADDPARA = 'BUFF_ADDPARA',
	BUFF_ADDAILMENT = 'BUFF_ADDAILMENT',

	BUFF_ADDATKDOWN = 'BUFF_ADDATKDOWN',
  BUFF_ADDDEFDOWN = 'BUFF_ADDDEFDOWN',
  BUFF_ADDRECDOWN = 'BUFF_ADDRECDOWN',

	BUFF_DAMAGECUT = 'BUFF_DAMAGECUT',

	BUFF_FIREDMGDOWN = 'BUFF_FIREDMGDOWN',
	BUFF_WATERDMGDOWN = 'BUFF_WATERDMGDOWN',
	BUFF_EARTHDMGDOWN = 'BUFF_EARTHDMGDOWN',
	BUFF_THUNDERDMGDOWN = 'BUFF_THUNDERDMGDOWN',
	BUFF_LIGHTDMGDOWN = 'BUFF_LIGHTDMGDOWN',
	BUFF_DARKDMGDOWN = 'BUFF_DARKDMGDOWN',
	BUFF_ELEMENTDMGDOWN = 'BUFF_ELEMENTDMGDOWN',

	BUFF_HCDROP = 'BUFF_HCDROP',
	BUFF_HCDOWN = 'BUFF_HCDOWN',
	BUFF_BCDROP = 'BUFF_BCDROP',
	BUFF_BCDOWN = 'BUFF_BCDOWN',
	BUFF_ITEMDROP = 'BUFF_ITEMDROP',
	BUFF_ITEMDOWN = 'BUFF_ITEMDOWN',
	BUFF_ZELDROP = 'BUFF_ZELDROP',
	BUFF_ZELDOWN = 'BUFF_ZELDOWN',
	BUFF_KARMADROP = 'BUFF_KARMADROP',
	BUFF_KARMADOWN = 'BUFF_KARMADOWN',

	BUFF_HCREC = 'BUFF_HCREC',

	BUFF_KOBLK = 'BUFF_KOBLK', // guaranteed AI

	BUFF_HPABS = 'BUFF_HPABS',

	BUFF_IGNOREDEF = 'BUFF_IGNOREDEF',

	BUFF_SPARKUP = 'BUFF_SPARKUP',

	BUFF_HITUP = 'BUFF_HITUP',

	BUFF_COUNTERDAMAGE = 'BUFF_COUNTERDAMAGE',

	BUFF_GETENEATT = 'BUFF_GETENEATT',
	BUFF_REPENEATT = 'BUFF_REPENEATT',

	ATK_ST = 'ATK_ST',
	ATK_AOE = 'ATK_AOE',
	ATK_RT = 'ATK_RT',
	ATK_ST_HPREC = 'ATK_ST_HPREC',
	ATK_AOE_HPREC = 'ATK_AOE_HPREC',
}

/**
 * @description Format of these IDs are `<passive|proc>:<original effect ID>:<stat>`.
 * Usage of passive/proc and original effect ID are for easy tracking of the original effect
 * source of a given buff.
 */
export enum BuffId {
	UNKNOWN_PASSIVE_EFFECT_ID = 'UNKNOWN_PASSIVE_EFFECT_ID',
	UNKNOWN_PASSIVE_BUFF_PARAMS = 'UNKNOWN_PASSIVE_BUFF_PARAMS',
	TURN_DURATION_MODIFICATION = 'TURN_DURATION_MODIFICATION',

	'passive:1:hp' = 'passive:1:hp',
	'passive:1:atk' = 'passive:1:atk',
	'passive:1:def' = 'passive:1:def',
	'passive:1:rec' = 'passive:1:rec',
	'passive:1:crit' = 'passive:1:crit',

	'passive:2:hp' = 'passive:2:hp',
	'passive:2:atk' = 'passive:2:atk',
	'passive:2:def' = 'passive:2:def',
	'passive:2:rec' = 'passive:2:rec',
	'passive:2:crit' = 'passive:2:crit',

	'passive:3:hp' = 'passive:3:hp',
	'passive:3:atk' = 'passive:3:atk',
	'passive:3:def' = 'passive:3:def',
	'passive:3:rec' = 'passive:3:rec',
	'passive:3:crit' = 'passive:3:crit',

	'passive:4:poison' = 'passive:4:poison',
	'passive:4:weak' = 'passive:4:weak',
	'passive:4:sick' = 'passive:4:sick',
	'passive:4:injury' = 'passive:4:injury',
	'passive:4:curse' = 'passive:4:curse',
	'passive:4:paralysis' = 'passive:4:paralysis',

	'passive:5:fire' = 'passive:5:fire',
	'passive:5:water' = 'passive:5:water',
	'passive:5:earth' = 'passive:5:earth',
	'passive:5:thunder' = 'passive:5:thunder',
	'passive:5:light' = 'passive:5:light',
	'passive:5:dark' = 'passive:5:dark',
	'passive:5:unknown' = 'passive:5:unknown',

	'passive:8' = 'passive:8',
	'passive:9' = 'passive:9',
	'passive:10' = 'passive:10',

	'passive:11:atk' = 'passive:11:atk',
	'passive:11:def' = 'passive:11:def',
	'passive:11:rec' = 'passive:11:rec',
	'passive:11:crit' = 'passive:11:crit',

	'passive:12:bc' = 'passive:12:bc',
	'passive:12:hc' = 'passive:12:hc',
	'passive:12:item' = 'passive:12:item',
	'passive:12:zel' = 'passive:12:zel',
	'passive:12:karma' = 'passive:12:karma',

	'passive:13' = 'passive:13',
	'passive:14' = 'passive:14',
	'passive:15' = 'passive:15',
	'passive:16' = 'passive:16',
	'passive:17' = 'passive:17',

	'passive:19:bc' = 'passive:19:bc',
	'passive:19:hc' = 'passive:19:hc',
	'passive:19:item' = 'passive:19:item',
	'passive:19:zel' = 'passive:19:zel',
	'passive:19:karma' = 'passive:19:karma',

	'passive:20:poison' = 'passive:20:poison',
	'passive:20:weak' = 'passive:20:weak',
	'passive:20:sick' = 'passive:20:sick',
	'passive:20:injury' = 'passive:20:injury',
	'passive:20:curse' = 'passive:20:curse',
	'passive:20:paralysis' = 'passive:20:paralysis',
	'passive:20:atk down' = 'passive:20:atk down',
	'passive:20:def down' = 'passive:20:def down',
	'passive:20:rec down' = 'passive:20:rec down',
	'passive:20:unknown' = 'passive:20:unknown',

	'passive:21:atk' = 'passive:21:atk',
	'passive:21:def' = 'passive:21:def',
	'passive:21:rec' = 'passive:21:rec',
	'passive:21:crit' = 'passive:21:crit',

	'passive:23' = 'passive:23',
	'passive:24' = 'passive:24',
	'passive:25' = 'passive:25',
	'passive:26' = 'passive:26',
	'passive:27' = 'passive:27',

	UNKNOWN_PROC_EFFECT_ID = 'UNKNOWN_PROC_EFFECT_ID',
	UNKNOWN_PROC_BUFF_PARAMS = 'UNKNOWN_PROC_BUFF_PARAMS',

	'proc:1' = 'proc:1',
	'proc:2' = 'proc:2',
	'proc:3' = 'proc:3',

	'proc:4:flat' = 'proc:4:flat',
	'proc:4:percent' = 'proc:4:percent',

	'proc:5:atk' = 'proc:5:atk',
	'proc:5:def' = 'proc:5:def',
	'proc:5:rec' = 'proc:5:rec',
	'proc:5:crit' = 'proc:5:crit',

	'proc:6:bc' = 'proc:6:bc',
	'proc:6:hc' = 'proc:6:hc',
	'proc:6:item' = 'proc:6:item',

	'proc:7' = 'proc:7',

	'proc:8:flat' = 'proc:8:flat',
	'proc:8:percent' = 'proc:8:percent',

	'proc:9:atk' = 'proc:9:atk',
	'proc:9:def' = 'proc:9:def',
	'proc:9:rec' = 'proc:9:rec',
	'proc:9:unknown' = 'proc:9:unknown',

	'proc:10:poison' = 'proc:10:poison',
	'proc:10:weak' = 'proc:10:weak',
	'proc:10:sick' = 'proc:10:sick',
	'proc:10:injury' = 'proc:10:injury',
	'proc:10:curse' = 'proc:10:curse',
	'proc:10:paralysis' = 'proc:10:paralysis',
	'proc:10:atk down' = 'proc:10:atk down',
	'proc:10:def down' = 'proc:10:def down',
	'proc:10:rec down' = 'proc:10:rec down',
	'proc:10:unknown' = 'proc:10:unknown',

	'proc:11:poison' = 'proc:11:poison',
	'proc:11:weak' = 'proc:11:weak',
	'proc:11:sick' = 'proc:11:sick',
	'proc:11:injury' = 'proc:11:injury',
	'proc:11:curse' = 'proc:11:curse',
	'proc:11:paralysis' = 'proc:11:paralysis',
	'proc:11:atk down' = 'proc:11:atk down',
	'proc:11:def down' = 'proc:11:def down',
	'proc:11:rec down' = 'proc:11:rec down',
	'proc:11:unknown' = 'proc:11:unknown',

	'proc:12' = 'proc:12',
	'proc:13' = 'proc:13',
	'proc:14' = 'proc:14',

	'proc:16:fire' = 'proc:16:fire',
	'proc:16:water' = 'proc:16:water',
	'proc:16:earth' = 'proc:16:earth',
	'proc:16:thunder' = 'proc:16:thunder',
	'proc:16:light' = 'proc:16:light',
	'proc:16:dark' = 'proc:16:dark',
	'proc:16:all' = 'proc:16:all',
	'proc:16:unknown' = 'proc:16:unknown',

	'proc:17:poison' = 'proc:17:poison',
	'proc:17:weak' = 'proc:17:weak',
	'proc:17:sick' = 'proc:17:sick',
	'proc:17:injury' = 'proc:17:injury',
	'proc:17:curse' = 'proc:17:curse',
	'proc:17:paralysis' = 'proc:17:paralysis',

	'proc:18' = 'proc:18',
	'proc:19' = 'proc:19',
	'proc:20' = 'proc:20',
	'proc:22' = 'proc:22',
	'proc:23' = 'proc:23',

	'proc:24:atk' = 'proc:24:atk',
	'proc:24:def' = 'proc:24:def',
	'proc:24:rec' = 'proc:24:rec',

	'proc:26' = 'proc:26',
}
