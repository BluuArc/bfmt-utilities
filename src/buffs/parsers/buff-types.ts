import { TargetType, TargetArea, SphereTypeId, IBurstDamageFramesEntry, UnitElement, UnitType, UnitGender, Ailment } from '../../datamine-types';

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

/**
 * @description Object representing the ID and parameters of a conditional effect triggered by a passive condition.
 */
export interface IConditionalEffect {
	id: string;
	params: string;
	turnDuration: number;
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
	targetGender?: UnitGender | 'unknown';

	hpGreaterThanOrEqualTo?: number;
	hpLessThanOrEqualTo?: number;
	bbGaugeGreaterThanOrEqualTo?: number;
	bbGaugeLessThanOrEqualTo?: number;
	damageTakenExceeds?: number;
	damageDealtExceeds?: number;
	bcReceivedExceeds?: number;

	onEnemyDefeat?: boolean;
	onBattleWin?: boolean;
	whenAttacked?: boolean;
	onNormalAttack?: boolean;
	onGuard?: boolean;
	onCriticalHit?: boolean;

	minimumUniqueElements?: number;
	targetHasAnyOfGivenAilments?: Ailment[];
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

	// TODO: specific type for triggered buffs?
	value?: string | number | IBuff[] | IGenericBuffValue | any;
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
	odGauge = 'odGauge',

	bcDropRate = 'bcDropRate',
	hcDropRate = 'hcDropRate',
	itemDropRate = 'itemDropRate',
	zelDropRate = 'zelDropRate',
	karmaDropRate = 'karmaDropRate',

	bcEfficacy = 'bcEfficacy',
	hcEfficacy = 'hcEfficacy',

	bcCostReduction = 'bcCostReduction',
	bbGaugeConsumptionReduction = 'bbGaugeConsumptionReduction',

	ailmentAttackBoost = 'ailmentAttackBoost',

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

	poisonCounter = 'poisonCounter',
	weakCounter = 'weakCounter',
	sickCounter = 'sickCounter',
	injuryCounter = 'injuryCounter',
	curseCounter = 'curseCounter',
	paralysisCounter = 'paralysisCounter',

	atkDownResist = 'atkDownResist',
	defDownResist = 'defDownResist',
	recDownResist = 'recDownResist',

	atkDownInflict = 'atkDownInflict',
	defDownInflict = 'defDownInflict',
	recDownInflict = 'recDownInflict',

	atkDownCounter = 'atkDownCounter',
	defDownCounter = 'defDownCounter',
	recDownCounter = 'recDownCounter',

	mitigation = 'mitigation',
	fireMitigation = 'fireMitigation',
	waterMitigation = 'waterMitigation',
	earthMitigation = 'earthMitigation',
	thunderMitigation = 'thunderMitigation',
	lightMitigation = 'lightMitigation',
	darkMitigation = 'darkMitigation',
	reduceDamageToOne = 'reduceDamageToOne',
	guardMitigation = 'guardMitigation',

	barrier = 'barrier',

	fireElementalDamage = 'fireElementalDamage',
	waterElementalDamage = 'waterElementalDamage',
	earthElementalDamage = 'earthElementalDamage',
	thunderElementalDamage = 'thunderElementalDamage',
	lightElementalDamage = 'lightElementalDamage',
	darkElementalDamage = 'darkElementalDamage',
	elementalWeaknessDamageMitigation = 'elementalWeaknessDamageMitigation',

	turnDurationModification = 'turnDurationModification',

	koResistance = 'koResistance',
	revive = 'revive',

	defenseIgnore = 'defenseIgnore',

	criticalDamage = 'criticalDamage',
	criticalDamageMitigation = 'criticalDamageMitigation',

	sparkDamage = 'sparkDamage',
	sparkDamageMitigation = 'sparkDamageMitigation',

	bbAtk = 'bbAtk',

	hitCountModification = 'hitCountModification',

	damageReflect = 'damageReflect',

	targetingModification = 'targetingModification',

	elementModification = 'elementModification',

	buffStabilityModification = 'buffStabilityModification',

	extraAction = 'extraAction',

	damageOverTime = 'damageOverTime',

	effectOccurrenceShift = 'effectOccurrenceShift',

	expModification = 'expModification',

	shield = 'shield',
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
	odGauge: IBuff[];

	bcDropRate: IBuff[];
	hcDropRate: IBuff[];
	itemDropRate: IBuff[];
	zelDropRate: IBuff[];
	karmaDropRate: IBuff[];

	bcEfficacy: IBuff[];
	hcEfficacy: IBuff[];

	bcCostReduction: IBuff[];
	bbGaugeConsumptionReduction: IBuff[];

	ailmentAttackBoost: IBuff[];

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

	poisonCounter: IBuff[];
	weakCounter: IBuff[];
	sickCounter: IBuff[];
	injuryCounter: IBuff[];
	curseCounter: IBuff[];
	paralysisCounter: IBuff[];

	atkDownResist: IBuff[];
	defDownResist: IBuff[];
	recDownResist: IBuff[];

	atkDownInflict: IBuff[];
	defDownInflict: IBuff[];
	recDownInflict: IBuff[];

	atkDownCounter: IBuff[];
	defDownCounter: IBuff[];
	recDownCounter: IBuff[];

	mitigation: IBuff[];
	fireMitigation: IBuff[];
	waterMitigation: IBuff[];
	earthMitigation: IBuff[];
	thunderMitigation: IBuff[];
	lightMitigation: IBuff[];
	darkMitigation: IBuff[];
	reduceDamageToOne: IBuff[];
	guardMitigation: IBuff[];

	barrier: IBuff[];

	fireElementalDamage: IBuff[];
	waterElementalDamage: IBuff[];
	earthElementalDamage: IBuff[];
	thunderElementalDamage: IBuff[];
	lightElementalDamage: IBuff[];
	darkElementalDamage: IBuff[];
	elementalWeaknessDamageMitigation: IBuff[];

	turnDurationModification: IBuff[];

	koResistance: IBuff[];
	revive: IBuff[];

	defenseIgnore: IBuff[];

	criticalDamage: IBuff[];
	criticalDamageMitigation: IBuff[];

	sparkDamage: IBuff[];
	sparkDamageMitigation: IBuff[];

	bbAtk: IBuff[];

	hitCountModification: IBuff[];

	damageReflect: IBuff[];

	targetingModification: IBuff[];

	elementModification: IBuff[];

	buffStabilityModification: IBuff[];

	extraAction: IBuff[];

	damageOverTime: IBuff[];

	effectOccurrenceShift: IBuff[];

	expModification: IBuff[];

	shield: IBuff[];
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
	CONDITIONALBUFF_HPTHRESH = 'CONDITIONALBUFF_HPTHRESH',
	CONDITIONALBUFF_DAMAGETAKENTHRESH = 'CONDITIONALBUFF_DAMAGETAKENTHRESH',
	CONDITIONALBUFF_DAMAGEDEALTTHRESH = 'CONDITIONALBUFF_DAMAGEDEALTTHRESH',
	CONDITIONALBUFF_BCRECEIVEDTHRESH = 'CONDITIONALBUFF_BCRECEIVEDTHRESH',

	BUFF_ADDTO_BB = 'BUFF_ADDTO_BB',
	BUFF_ADDTO_SBB = 'BUFF_ADDTO_SBB',
	BUFF_ADDTO_UBB = 'BUFF_ADDTO_UBB',

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

	BUFF_BBGAUGETHRESHATKUP = 'BUFF_BBGAUGETHRESHATKUP',
	BUFF_BBGAUGETHRESHATKDOWN = 'BUFF_BBGAUGETHRESHATKDOWN',
	BUFF_BBGAUGETHRESHDEFUP = 'BUFF_BBGAUGETHRESHDEFUP',
	BUFF_BBGAUGETHRESHDEFDOWN = 'BUFF_BBGAUGETHRESHDEFDOWN',
	BUFF_BBGAUGETHRESHRECUP = 'BUFF_BBGAUGETHRESHRECUP',
	BUFF_BBGAUGETHRESHRECDOWN = 'BUFF_BBGAUGETHRESHRECDOWN',
	BUFF_BBGAUGETHRESHCRTRATEUP = 'BUFF_BBGAUGETHRESHCRTRATEUP',
	BUFF_BBGAUGETHRESHCRTRATEDOWN = 'BUFF_BBGAUGETHRESHCRTRATEDOWN',

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

	BUFF_UNIQUEELEMENTHPUP = 'BUFF_UNIQUEELEMENTHPUP',
	BUFF_UNIQUEELEMENTHPDOWN = 'BUFF_UNIQUEELEMENTHPDOWN',
	BUFF_UNIQUEELEMENTATKUP = 'BUFF_UNIQUEELEMENTATKUP',
	BUFF_UNIQUEELEMENTATKDOWN = 'BUFF_UNIQUEELEMENTATKDOWN',
	BUFF_UNIQUEELEMENTDEFUP = 'BUFF_UNIQUEELEMENTDEFUP',
	BUFF_UNIQUEELEMENTDEFDOWN = 'BUFF_UNIQUEELEMENTDEFDOWN',
	BUFF_UNIQUEELEMENTRECUP = 'BUFF_UNIQUEELEMENTRECUP',
	BUFF_UNIQUEELEMENTRECDOWN = 'BUFF_UNIQUEELEMENTRECDOWN',
	BUFF_UNIQUEELEMENTCRTRATEUP = 'BUFF_UNIQUEELEMENTCRTRATEUP',
	BUFF_UNIQUEELEMENTCRTRATEDOWN = 'BUFF_UNIQUEELEMENTCRTRATEDOWN',

	BUFF_MALEHPUP = 'BUFF_MALEHPUP',
	BUFF_MALEHPDOWN = 'BUFF_MALEHPDOWN',
	BUFF_MALEATKUP = 'BUFF_MALEATKUP',
	BUFF_MALEATKDOWN = 'BUFF_MALEATKDOWN',
	BUFF_MALEDEFUP = 'BUFF_MALEDEFUP',
	BUFF_MALEDEFDOWN = 'BUFF_MALEDEFDOWN',
	BUFF_MALERECUP = 'BUFF_MALERECUP',
	BUFF_MALERECDOWN = 'BUFF_MALERECDOWN',
	BUFF_MALECRTRATEUP = 'BUFF_MALECRTRATEUP',
	BUFF_MALECRTRATEDOWN = 'BUFF_MALECRTRATEDOWN',
	BUFF_FEMALEHPUP = 'BUFF_FEMALEHPUP',
	BUFF_FEMALEHPDOWN = 'BUFF_FEMALEHPDOWN',
	BUFF_FEMALEATKUP = 'BUFF_FEMALEATKUP',
	BUFF_FEMALEATKDOWN = 'BUFF_FEMALEATKDOWN',
	BUFF_FEMALEDEFUP = 'BUFF_FEMALEDEFUP',
	BUFF_FEMALEDEFDOWN = 'BUFF_FEMALEDEFDOWN',
	BUFF_FEMALERECUP = 'BUFF_FEMALERECUP',
	BUFF_FEMALERECDOWN = 'BUFF_FEMALERECDOWN',
	BUFF_FEMALECRTRATEUP = 'BUFF_FEMALECRTRATEUP',
	BUFF_FEMALECRTRATEDOWN = 'BUFF_FEMALECRTRATEDOWN',
	BUFF_OTHERHPUP = 'BUFF_OTHERHPUP',
	BUFF_OTHERHPDOWN = 'BUFF_OTHERHPDOWN',
	BUFF_OTHERATKUP = 'BUFF_OTHERATKUP',
	BUFF_OTHERATKDOWN = 'BUFF_OTHERATKDOWN',
	BUFF_OTHERDEFUP = 'BUFF_OTHERDEFUP',
	BUFF_OTHERDEFDOWN = 'BUFF_OTHERDEFDOWN',
	BUFF_OTHERRECUP = 'BUFF_OTHERRECUP',
	BUFF_OTHERRECDOWN = 'BUFF_OTHERRECDOWN',
	BUFF_OTHERCRTRATEUP = 'BUFF_OTHERCRTRATEUP',
	BUFF_OTHERCRTRATEDOWN = 'BUFF_OTHERCRTRATEDOWN',
	BUFF_GENDERHPUP = 'BUFF_GENDERHPUP',
	BUFF_GENDERHPDOWN = 'BUFF_GENDERHPDOWN',
	BUFF_GENDERATKUP = 'BUFF_GENDERATKUP',
	BUFF_GENDERATKDOWN = 'BUFF_GENDERATKDOWN',
	BUFF_GENDERDEFUP = 'BUFF_GENDERDEFUP',
	BUFF_GENDERDEFDOWN = 'BUFF_GENDERDEFDOWN',
	BUFF_GENDERRECUP = 'BUFF_GENDERRECUP',
	BUFF_GENDERRECDOWN = 'BUFF_GENDERRECDOWN',
	BUFF_GENDERCRTRATEUP = 'BUFF_GENDERCRTRATEUP',
	BUFF_GENDERCRTRATEDOWN = 'BUFF_GENDERCRTRATEDOWN',

	BUFF_CONVERTATKUP = 'BUFF_CONVERTATKUP',
	BUFF_CONVERTATKDOWN = 'BUFF_CONVERTATKDOWN',
	BUFF_CONVERTDEFUP = 'BUFF_CONVERTDEFUP',
	BUFF_CONVERTDEFDOWN = 'BUFF_CONVERTDEFDOWN',
	BUFF_CONVERTRECUP = 'BUFF_CONVERTRECUP',
	BUFF_CONVERTRECDOWN = 'BUFF_CONVERTRECDOWN',

	BUFF_HPSCALEDATKUP = 'BUFF_HPSCALEDATKUP',
	BUFF_HPSCALEDATKDOWN = 'BUFF_HPSCALEDATKDOWN',
	BUFF_HPSCALEDDEFUP = 'BUFF_HPSCALEDDEFUP',
	BUFF_HPSCALEDDEFDOWN = 'BUFF_HPSCALEDDEFDOWN',
	BUFF_HPSCALEDRECUP = 'BUFF_HPSCALEDRECUP',
	BUFF_HPSCALEDRECDOWN = 'BUFF_HPSCALEDRECDOWN',

	BUFF_SELFATKUP = 'BUFF_SELFATKUP',
	BUFF_ATKDOWNLOCK = 'BUFF_ATKDOWNLOCK',
	BUFF_SELFDEFUP = 'BUFF_SELFDEFUP',
	BUFF_DEFDOWNLOCK = 'BUFF_DEFDOWNLOCK',
	BUFF_SELFRECUP = 'BUFF_SELFRECUP',
	BUFF_RECDOWNLOCK = 'BUFF_RECDOWNLOCK',
	BUFF_SELFCRTRATEUP = 'BUFF_SELFCRTRATEUP',
	BUFF_CRTRATEDOWNLOCK = 'BUFF_CRTRATEDOWNLOCK',

	BUFF_POISONBLK = 'BUFF_POISONBLK',
	BUFF_WEAKBLK = 'BUFF_WEAKBLK',
	BUFF_SICKBLK = 'BUFF_SICKBLK',
	BUFF_INJURYBLK = 'BUFF_INJURYBLK',
	BUFF_CURSEBLK = 'BUFF_CURSEBLK',
	BUFF_PARALYSISBLK = 'BUFF_PARALYSISBLK',

	BUFF_RESISTATKDOWN = 'BUFF_RESISTATKDOWN',
	BUFF_RESISTDEFDOWN = 'BUFF_RESISTDEFDOWN',
	BUFF_RESISTRECDOWN = 'BUFF_RESISTRECDOWN',
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

	BUFF_POISONCOUNTER = 'BUFF_POISONCOUNTER',
	BUFF_POISIONCOUNTER = 'BUFF_POISONCOUNTER', // in-game it's a typo, so this corrects it
	BUFF_WEAKCOUNTER = 'BUFF_WEAKCOUNTER',
	BUFF_SICKCOUNTER = 'BUFF_SICKCOUNTER',
	BUFF_INJCONTER = 'BUFF_INJCONTER',
	BUFF_CURSECOUNTER = 'BUFF_CURSECOUNTER',
	BUFF_PARALYCOUNTER = 'BUFF_PARALYCOUNTER',

	BUFF_PROB_ATKREDUC = 'BUFF_PROB_ATKREDUC',
	BUFF_PROB_DEFREDUC = 'BUFF_PROB_DEFREDUC',
	BUFF_PROB_RECREDUC = 'BUFF_PROB_RECREDUC',

	BUFF_DAMAGECUT = 'BUFF_DAMAGECUT',
	BUFF_DAMAGECUTTOONE = 'BUFF_DAMAGECUTTOONE',

	// elemental damage reduction buffs
	BUFF_FIREDMGDOWN = 'BUFF_FIREDMGDOWN',
	BUFF_WATERDMGDOWN = 'BUFF_WATERDMGDOWN',
	BUFF_EARTHDMGDOWN = 'BUFF_EARTHDMGDOWN',
	BUFF_THUNDERDMGDOWN = 'BUFF_THUNDERDMGDOWN',
	BUFF_LIGHTDMGDOWN = 'BUFF_LIGHTDMGDOWN',
	BUFF_DARKDMGDOWN = 'BUFF_DARKDMGDOWN',
	BUFF_ELEMENTDMGDOWN = 'BUFF_ELEMENTDMGDOWN',

	// elemental weakness buffs
	BUFF_FIREDMGUP = 'BUFF_FIREDMGUP',
	BUFF_WATERDMGUP = 'BUFF_WATERDMGUP',
	BUFF_WATERMDGUP = 'BUFF_WATERDMGUP', // in-game it's a typo, so this corrects it
	BUFF_EARTHDMGUP = 'BUFF_EARTHDMGUP',
	BUFF_THUNDERDMGUP = 'BUFF_THUNDERDMGUP',
	BUFF_LIGHTDMGUP = 'BUFF_LIGHTDMGUP',
	BUFF_DARKDMGUP = 'BUFF_DARKDMGUP',
	BUFF_ELEMENTDMGUP = 'BUFF_ELEMENTDMGUP',

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

	BUFF_HPTHRESHHCDROP = 'BUFF_HPTHRESHHCDROP',
	BUFF_HPTHRESHHCDOWN = 'BUFF_HPTHRESHHCDOWN',
	BUFF_HPTHRESHBCDROP = 'BUFF_HPTHRESHBCDROP',
	BUFF_HPTHRESHBCDOWN = 'BUFF_HPTHRESHBCDOWN',
	BUFF_HPTHRESHITEMDROP = 'BUFF_HPTHRESHITEMDROP',
	BUFF_HPTHRESHITEMDOWN = 'BUFF_HPTHRESHITEMDOWN',
	BUFF_HPTHRESHZELDROP = 'BUFF_HPTHRESHZELDROP',
	BUFF_HPTHRESHZELDOWN = 'BUFF_HPTHRESHZELDOWN',
	BUFF_HPTHRESHKARMADROP = 'BUFF_HPTHRESHKARMADROP',
	BUFF_HPTHRESHKARMADOWN = 'BUFF_HPTHRESHKARMADOWN',

	BUFF_BBFILL = 'BUFF_BBFILL',
	BUFF_BBFILLDOWN = 'BUFF_BBFILLDOWN',
	BUFF_HCREC = 'BUFF_HCREC',

	BUFF_KOBLK = 'BUFF_KOBLK', // guaranteed AI
	BUFF_KO = 'BUFF_KO', // instant death
	BUFF_KOBLOCK = 'BUFF_KOBLOCK', // chance AI

	BUFF_HPABS = 'BUFF_HPABS',

	BUFF_IGNOREDEF = 'BUFF_IGNOREDEF',

	BUFF_CRTUP = 'BUFF_CRTUP', // critical damage boost
	BUFF_CRTDOWN = 'BUFF_CRTDOWN', // critical damage reduction

	BUFF_ELEMENTDOWN = 'BUFF_ELEMENTDOWN', // EWD reduction (not to be confused with elemental mitigation)

	BUFF_SPARKUP = 'BUFF_SPARKUP',
	BUFF_SPARKDOWN = 'BUFF_SPARKDOWN',
	BUFF_SPARKDMGUP = 'BUFF_SPARKDMGUP', // spark vulnerability
	BUFF_SPARKDMGDOWN = 'BUFF_SPARKDMGDOWN', // spark damage reduction

	BUFF_SPARKHC = 'BUFF_SPARKHC',
	BUFF_SPARKBC = 'BUFF_SPARKBC',
	BUFF_SPARKITEM = 'BUFF_SPARKITEM',
	BUFF_SPARKZEL = 'BUFF_SPARKZEL',
	BUFF_SPARKKARMA = 'BUFF_SPARKKARMA',

	BUFF_SPARKBBUP = 'BUFF_SPARKBBUP',

	BUFF_HITUP = 'BUFF_HITUP',

	BUFF_COUNTERDAMAGE = 'BUFF_COUNTERDAMAGE',

	BUFF_GETENEATT = 'BUFF_GETENEATT',
	BUFF_REPENEATT = 'BUFF_REPENEATT',
	BUFF_HPTHRESHGETENEATT = 'BUFF_HPTHRESHGETENEATT',
	BUFF_HPTHRESHREPENEATT = 'BUFF_HPTHRESHREPENEATT',

	BUFF_ADDFIRE = 'BUFF_ADDFIRE',
	BUFF_ADDWATER = 'BUFF_ADDWATER',
	BUFF_ADDEARTH = 'BUFF_ADDEARTH',
	BUFF_ADDTHUNDER = 'BUFF_ADDTHUNDER',
	BUFF_ADDLIGHT = 'BUFF_ADDLIGHT',
	BUFF_ADDDARK = 'BUFF_ADDDARK',
	BUFF_ADDELEMENT = 'BUFF_ADDELEMENT',

	BUFF_SHIFTFIRE = 'BUFF_SHIFTFIRE',
	BUFF_SHIFTWATER = 'BUFF_SHIFTWATER',
	BUFF_SHIFTEARTH = 'BUFF_SHIFTEARTH',
	BUFF_SHIFTTHUNDER = 'BUFF_SHIFTTHUNDER',
	BUFF_SHIFTLIGHT = 'BUFF_SHIFTLIGHT',
	BUFF_SHIFTDARK = 'BUFF_SHIFTDARK',
	BUFF_SHIFTELEMENT = 'BUFF_SHIFTELEMENT',

	BUFF_REMOVEBUFF = 'BUFF_REMOVEBUFF',
	BUFF_DISABLELS = 'BUFF_DISABLELS',

	BUFF_SUMMONUNIT = 'BUFF_SUMMONUNIT',

	BUFF_DBLSTRIKE = 'BUFF_DBLSTRIKE',

	BUFF_OVERDRIVEUP = 'BUFF_OVERDRIVEUP', // gradual OD fill
	BUFF_ODFILLBOOST = 'BUFF_ODFILLBOOST', // OD fill rate

	BUFF_TURNDMG = 'BUFF_TURNDMG',

	BUFF_BBATKUP = 'BUFF_BBATKUP',
	BUFF_SBBATKUP = 'BUFF_SBBATKUP',
	BUFF_UBBATKUP = 'BUFF_UBBATKUP',

	BUFF_BBATKDOWN = 'BUFF_BBATKDOWN',
	BUFF_SBBATKDOWN = 'BUFF_SBBATKDOWN',
	BUFF_UBBATKDOWN = 'BUFF_UBBATKDOWN',

	BUFF_BBCOST_REDUCTION = 'BUFF_BBCOST_REDUCTION',

	BUFF_GUARDCUT = 'BUFF_GUARDCUT',

	BUFF_GUARDBBUP = 'BUFF_GUARDBBUP',

	BUFF_FIRESHIELD = 'BUFF_FIRESHIELD', // barrier
	BUFF_WATERSHIELD = 'BUFF_WATERSHIELD',
	BUFF_EARTHSHIELD = 'BUFF_EARTHSHIELD',
	BUFF_THUNDERSHIELD = 'BUFF_THUNDERSHIELD',
	BUFF_LIGHTSHIELD = 'BUFF_LIGHTSHIELD',
	BUFF_DARKSHIELD = 'BUFF_DARKSHIELD',
	BUFF_ELEMENTSHIELD = 'BUFF_ELEMENTSHIELD',

	BUFF_AILDMGUP = 'BUFF_AILDMGUP',

	BUFF_HPTURNSTART = 'BUFF_HPTURNSTART',
	BUFF_BCTURNSTART = 'BUFF_BCTURNSTART',

	BUFF_PLAYEREXP = 'BUFF_PLAYEREXP',

	BUFF_SPARKCRTACTIVATED = 'BUFF_SPARKCRTACTIVATED',

	SG_BUFF_ALL = 'SG_BUFF_ALL', // shield
	SG_BUFF_FIRE = 'SG_BUFF_FIRE',
	SG_BUFF_WATER = 'SG_BUFF_WATER',
	SG_BUFF_EARTH = 'SG_BUFF_EARTH',
	SG_BUFF_THUNDER = 'SG_BUFF_THUNDER',
	SG_BUFF_LIGHT = 'SG_BUFF_LIGHT',
	SG_BUFF_DARK = 'SG_BUFF_DARK',
	SG_BUFF_UNKNOWN = 'SG_BUFF_UNKNOWN',

	ATK_ST = 'ATK_ST',
	ATK_AOE = 'ATK_AOE',
	ATK_RT = 'ATK_RT',
	ATK_ST_HPREC = 'ATK_ST_HPREC',
	ATK_AOE_HPREC = 'ATK_AOE_HPREC',
	ATK_ST_PROPORTIONAL = 'ATK_ST_PROPORTIONAL',
	ATK_AOE_PROPORTIONAL = 'ATK_AOE_PROPORTIONAL',
	ATK_ST_PIERCING_PROPORTIONAL = 'ATK_ST_PIERCING_PROPORTIONAL',
	ATK_AOE_PIERCING_PROPORTIONAL = 'ATK_AOE_PIERCING_PROPORTIONAL',
	ATK_ST_FIXED = 'ATK_ST_FIXED',
	ATK_AOE_FIXED = 'ATK_AOE_FIXED',
	ATK_ST_PIERCING_FIXED = 'ATK_ST_PIERCING_FIXED',
	ATK_AOE_PIERCING_FIXED = 'ATK_AOE_PIERCING_FIXED',
	ATK_ST_MULTIELEMENT = 'ATK_ST_MULTIELEMENT',
	ATK_AOE_MULTIELEMENT = 'ATK_AOE_MULTIELEMENT',
	ATK_ST_SACRIFICIAL = 'ATK_ST_SACRIFICIAL',
	ATK_AOE_SACRIFICIAL = 'ATK_AOE_SACRIFICIAL',
	ATK_ST_HPSCALED = 'ATK_ST_HPSCALED',
	ATK_AOE_HPSCALED = 'ATK_AOE_HPSCALED',
	ATK_ST_BBGAUGESCALED = 'ATK_ST_BBGAUGESCALED',
	ATK_AOE_BBGAUGESCALED = 'ATK_AOE_BBGAUGESCALED',
	ATK_ST_USAGESCALED = 'ATK_ST_USAGESCALED',
	ATK_AOE_USAGESCALED = 'ATK_AOE_USAGESCALED',
	ATK_ST_ELEMENTSCALED = 'ATK_ST_ELEMENTSCALED',
	ATK_AOE_ELEMENTSCALED = 'ATK_AOE_ELEMENTSCALED',
}

/**
 * @description Format of these IDs are `<passive|proc|conditional>:<original effect ID>:<stat>`.
 * Usage of passive/proc and original effect ID are for easy tracking of the original effect
 * source of a given buff.
 */
export enum BuffId {
	TURN_DURATION_MODIFICATION = 'TURN_DURATION_MODIFICATION',
	NO_PARAMS_SPECIFIED = 'NO_PARAMS_SPECIFIED',

	UNKNOWN_PASSIVE_EFFECT_ID = 'UNKNOWN_PASSIVE_EFFECT_ID',
	UNKNOWN_PASSIVE_BUFF_PARAMS = 'UNKNOWN_PASSIVE_BUFF_PARAMS',

	'passive:1:hp' = 'passive:1:hp',
	'passive:1:atk' = 'passive:1:atk',
	'passive:1:def' = 'passive:1:def',
	'passive:1:rec' = 'passive:1:rec',
	'passive:1:crit' = 'passive:1:crit',

	'passive:2:elemental-hp' = 'passive:2:elemental-hp',
	'passive:2:elemental-atk' = 'passive:2:elemental-atk',
	'passive:2:elemental-def' = 'passive:2:elemental-def',
	'passive:2:elemental-rec' = 'passive:2:elemental-rec',
	'passive:2:elemental-crit' = 'passive:2:elemental-crit',

	'passive:3:type based-hp' = 'passive:3:type based-hp',
	'passive:3:type based-atk' = 'passive:3:type based-atk',
	'passive:3:type based-def' = 'passive:3:type based-def',
	'passive:3:type based-rec' = 'passive:3:type based-rec',
	'passive:3:type based-crit' = 'passive:3:type based-crit',

	'passive:4:resist-poison' = 'passive:4:resist-poison',
	'passive:4:resist-weak' = 'passive:4:resist-weak',
	'passive:4:resist-sick' = 'passive:4:resist-sick',
	'passive:4:resist-injury' = 'passive:4:resist-injury',
	'passive:4:resist-curse' = 'passive:4:resist-curse',
	'passive:4:resist-paralysis' = 'passive:4:resist-paralysis',

	'passive:5:mitigate-fire' = 'passive:5:mitigate-fire',
	'passive:5:mitigate-water' = 'passive:5:mitigate-water',
	'passive:5:mitigate-earth' = 'passive:5:mitigate-earth',
	'passive:5:mitigate-thunder' = 'passive:5:mitigate-thunder',
	'passive:5:mitigate-light' = 'passive:5:mitigate-light',
	'passive:5:mitigate-dark' = 'passive:5:mitigate-dark',
	'passive:5:mitigate-unknown' = 'passive:5:mitigate-unknown',

	'passive:8:mitigation' = 'passive:8:mitigation',
	'passive:9:gradual bc fill' = 'passive:9:gradual bc fill',
	'passive:10:hc efficacy' = 'passive:10:hc efficacy',

	'passive:11:hp conditional-atk' = 'passive:11:hp conditional-atk',
	'passive:11:hp conditional-def' = 'passive:11:hp conditional-def',
	'passive:11:hp conditional-rec' = 'passive:11:hp conditional-rec',
	'passive:11:hp conditional-crit' = 'passive:11:hp conditional-crit',

	'passive:12:hp conditional drop boost-bc' = 'passive:12:hp conditional drop boost-bc',
	'passive:12:hp conditional drop boost-hc' = 'passive:12:hp conditional drop boost-hc',
	'passive:12:hp conditional drop boost-item' = 'passive:12:hp conditional drop boost-item',
	'passive:12:hp conditional drop boost-zel' = 'passive:12:hp conditional drop boost-zel',
	'passive:12:hp conditional drop boost-karma' = 'passive:12:hp conditional drop boost-karma',

	'passive:13:bc fill on enemy defeat' = 'passive:13:bc fill on enemy defeat',
	'passive:14:chance mitigation' = 'passive:14:chance mitigation',
	'passive:15:heal on enemy defeat' = 'passive:15:heal on enemy defeat',
	'passive:16:heal on win' = 'passive:16:heal on win',
	'passive:17:hp absorb' = 'passive:17:hp absorb',

	'passive:19:drop boost-bc' = 'passive:19:drop boost-bc',
	'passive:19:drop boost-hc' = 'passive:19:drop boost-hc',
	'passive:19:drop boost-item' = 'passive:19:drop boost-item',
	'passive:19:drop boost-zel' = 'passive:19:drop boost-zel',
	'passive:19:drop boost-karma' = 'passive:19:drop boost-karma',

	'passive:20:chance inflict-poison' = 'passive:20:chance inflict-poison',
	'passive:20:chance inflict-weak' = 'passive:20:chance inflict-weak',
	'passive:20:chance inflict-sick' = 'passive:20:chance inflict-sick',
	'passive:20:chance inflict-injury' = 'passive:20:chance inflict-injury',
	'passive:20:chance inflict-curse' = 'passive:20:chance inflict-curse',
	'passive:20:chance inflict-paralysis' = 'passive:20:chance inflict-paralysis',
	'passive:20:chance inflict-atk down' = 'passive:20:chance inflict-atk down',
	'passive:20:chance inflict-def down' = 'passive:20:chance inflict-def down',
	'passive:20:chance inflict-rec down' = 'passive:20:chance inflict-rec down',
	'passive:20:chance inflict-unknown' = 'passive:20:chance inflict-unknown',

	'passive:21:first turn-atk' = 'passive:21:first turn-atk',
	'passive:21:first turn-def' = 'passive:21:first turn-def',
	'passive:21:first turn-rec' = 'passive:21:first turn-rec',
	'passive:21:first turn-crit' = 'passive:21:first turn-crit',

	'passive:23:bc fill on win' = 'passive:23:bc fill on win',
	'passive:24:heal on hit' = 'passive:24:heal on hit',
	'passive:25:bc fill on hit' = 'passive:25:bc fill on hit',
	'passive:26:chance damage reflect' = 'passive:26:chance damage reflect',
	'passive:27:target chance change' = 'passive:27:target chance change',
	'passive:28:hp conditional target chance change' = 'passive:28:hp conditional target chance change',
	'passive:29:chance def ignore' = 'passive:29:chance def ignore',

	'passive:30:bb gauge conditional-atk' = 'passive:30:bb gauge conditional-atk',
	'passive:30:bb gauge conditional-def' = 'passive:30:bb gauge conditional-def',
	'passive:30:bb gauge conditional-rec' = 'passive:30:bb gauge conditional-rec',
	'passive:30:bb gauge conditional-crit' = 'passive:30:bb gauge conditional-crit',

	'passive:31:spark-damage' = 'passive:31:spark-damage',
	'passive:31:spark-bc' = 'passive:31:spark-bc',
	'passive:31:spark-hc' = 'passive:31:spark-hc',
	'passive:31:spark-item' = 'passive:31:spark-item',
	'passive:31:spark-zel' = 'passive:31:spark-zel',
	'passive:31:spark-karma' = 'passive:31:spark-karma',

	'passive:32:bc efficacy' = 'passive:32:bc efficacy',
	'passive:33:gradual heal' = 'passive:33:gradual heal',
	'passive:34:critical damage' = 'passive:34:critical damage',
	'passive:35:bc fill on normal attack' = 'passive:35:bc fill on normal attack',
	'passive:36:extra action' = 'passive:36:extra action',
	'passive:37:hit count boost' = 'passive:37:hit count boost',

	'passive:40:converted-atk' = 'passive:40:converted-atk',
	'passive:40:converted-def' = 'passive:40:converted-def',
	'passive:40:converted-rec' = 'passive:40:converted-rec',

	'passive:41:unique element count-hp' = 'passive:41:unique element count-hp',
	'passive:41:unique element count-atk' = 'passive:41:unique element count-atk',
	'passive:41:unique element count-def' = 'passive:41:unique element count-def',
	'passive:41:unique element count-rec' = 'passive:41:unique element count-rec',
	'passive:41:unique element count-crit' = 'passive:41:unique element count-crit',

	'passive:42:gender-hp' = 'passive:42:gender-hp',
	'passive:42:gender-atk' = 'passive:42:gender-atk',
	'passive:42:gender-def' = 'passive:42:gender-def',
	'passive:42:gender-rec' = 'passive:42:gender-rec',
	'passive:42:gender-crit' = 'passive:42:gender-crit',

	'passive:43:chance damage to one' = 'passive:43:chance damage to one',

	'passive:44:flat-hp' = 'passive:44:flat-hp',
	'passive:44:flat-atk' = 'passive:44:flat-atk',
	'passive:44:flat-def' = 'passive:44:flat-def',
	'passive:44:flat-rec' = 'passive:44:flat-rec',
	'passive:44:flat-crit' = 'passive:44:flat-crit',

	'passive:45:critical damage reduction-base' = 'passive:45:critical damage reduction-base',
	'passive:45:critical damage reduction-buff' = 'passive:45:critical damage reduction-buff',

	'passive:46:hp scaled-atk' = 'passive:46:hp scaled-atk',
	'passive:46:hp scaled-def' = 'passive:46:hp scaled-def',
	'passive:46:hp scaled-rec' = 'passive:46:hp scaled-rec',

	'passive:47:bc fill on spark' = 'passive:47:bc fill on spark',
	'passive:48:bc cost reduction' = 'passive:48:bc cost reduction',
	'passive:49:bb gauge consumption reduction' = 'passive:49:bb gauge consumption reduction',

	'passive:50:elemental weakness damage-fire' = 'passive:50:elemental weakness damage-fire',
	'passive:50:elemental weakness damage-water' = 'passive:50:elemental weakness damage-water',
	'passive:50:elemental weakness damage-earth' = 'passive:50:elemental weakness damage-earth',
	'passive:50:elemental weakness damage-thunder' = 'passive:50:elemental weakness damage-thunder',
	'passive:50:elemental weakness damage-light' = 'passive:50:elemental weakness damage-light',
	'passive:50:elemental weakness damage-dark' = 'passive:50:elemental weakness damage-dark',
	'passive:50:elemental weakness damage-unknown' = 'passive:50:elemental weakness damage-unknown',

	'passive:53:critical damage-base' = 'passive:53:critical damage-base',
	'passive:53:critical damage-buff' = 'passive:53:critical damage-buff',
	'passive:53:element damage-base' = 'passive:53:element damage-base',
	'passive:53:element damage-buff' = 'passive:53:element damage-buff',
	'passive:53:critical rate-base' = 'passive:53:critical rate-base',
	'passive:53:critical rate-buff' = 'passive:53:critical rate-buff',

	'passive:55:hp conditional' = 'passive:55:hp conditional',

	'passive:58:guard mitigation' = 'passive:58:guard mitigation',

	'passive:59:bc fill when attacked on guard-percent' = 'passive:59:bc fill when attacked on guard-percent',
	'passive:59:bc fill when attacked on guard-flat' = 'passive:59:bc fill when attacked on guard-flat',

	'passive:61:bc fill on guard-percent' = 'passive:61:bc fill on guard-percent',
	'passive:61:bc fill on guard-flat' = 'passive:61:bc fill on guard-flat',

	'passive:62:mitigate-fire' = 'passive:62:mitigate-fire',
	'passive:62:mitigate-water' = 'passive:62:mitigate-water',
	'passive:62:mitigate-earth' = 'passive:62:mitigate-earth',
	'passive:62:mitigate-thunder' = 'passive:62:mitigate-thunder',
	'passive:62:mitigate-light' = 'passive:62:mitigate-light',
	'passive:62:mitigate-dark' = 'passive:62:mitigate-dark',
	'passive:62:mitigate-unknown' = 'passive:62:mitigate-unknown',

	'passive:63:first turn mitigate-fire' = 'passive:63:first turn mitigate-fire',
	'passive:63:first turn mitigate-water' = 'passive:63:first turn mitigate-water',
	'passive:63:first turn mitigate-earth' = 'passive:63:first turn mitigate-earth',
	'passive:63:first turn mitigate-thunder' = 'passive:63:first turn mitigate-thunder',
	'passive:63:first turn mitigate-light' = 'passive:63:first turn mitigate-light',
	'passive:63:first turn mitigate-dark' = 'passive:63:first turn mitigate-dark',
	'passive:63:first turn mitigate-unknown' = 'passive:63:first turn mitigate-unknown',

	'passive:64:attack boost-bb' = 'passive:64:attack boost-bb',
	'passive:64:attack boost-sbb' = 'passive:64:attack boost-sbb',
	'passive:64:attack boost-ubb' = 'passive:64:attack boost-ubb',

	'passive:65:bc fill on crit' = 'passive:65:bc fill on crit',

	'passive:66:add effect to skill-bb' = 'passive:66:add effect to skill-bb',
	'passive:66:add effect to skill-sbb' = 'passive:66:add effect to skill-sbb',
	'passive:66:add effect to skill-ubb' = 'passive:66:add effect to skill-ubb',

	'passive:69:chance ko resistance' = 'passive:69:chance ko resistance',
	'passive:70:od fill rate' = 'passive:70:od fill rate',

	'passive:71:inflict on hit-poison' = 'passive:71:inflict on hit-poison',
	'passive:71:inflict on hit-weak' = 'passive:71:inflict on hit-weak',
	'passive:71:inflict on hit-sick' = 'passive:71:inflict on hit-sick',
	'passive:71:inflict on hit-injury' = 'passive:71:inflict on hit-injury',
	'passive:71:inflict on hit-curse' = 'passive:71:inflict on hit-curse',
	'passive:71:inflict on hit-paralysis' = 'passive:71:inflict on hit-paralysis',

	'passive:72:effect at turn start-hp' = 'passive:72:effect at turn start-hp',
	'passive:72:effect at turn start-bc' = 'passive:72:effect at turn start-bc',

	'passive:73:resist-poison' = 'passive:73:resist-poison',
	'passive:73:resist-weak' = 'passive:73:resist-weak',
	'passive:73:resist-sick' = 'passive:73:resist-sick',
	'passive:73:resist-injury' = 'passive:73:resist-injury',
	'passive:73:resist-curse' = 'passive:73:resist-curse',
	'passive:73:resist-paralysis' = 'passive:73:resist-paralysis',
	'passive:73:resist-atk down' = 'passive:73:resist-atk down',
	'passive:73:resist-def down' = 'passive:73:resist-def down',
	'passive:73:resist-rec down' = 'passive:73:resist-rec down',

	'passive:74:ailment attack boost' = 'passive:74:ailment attack boost',
	'passive:75:spark vulnerability' = 'passive:75:spark vulnerability',

	'passive:77:spark damage reduction-base' = 'passive:77:spark damage reduction-base',
	'passive:77:spark damage reduction-buff' = 'passive:77:spark damage reduction-buff',

	'passive:78:damage taken conditional' = 'passive:78:damage taken conditional',
	'passive:79:bc fill after damage taken conditional-flat' = 'passive:79:bc fill after damage taken conditional-flat',
	'passive:79:bc fill after damage taken conditional-percent' = 'passive:79:bc fill after damage taken conditional-percent',

	'passive:80:damage dealt conditional' = 'passive:80:damage dealt conditional',
	'passive:81:bc fill after damage dealt conditional-flat' = 'passive:81:bc fill after damage dealt conditional-flat',
	'passive:81:bc fill after damage dealt conditional-percent' = 'passive:81:bc fill after damage dealt conditional-percent',

	'passive:82:bc received conditional' = 'passive:82:bc received conditional',
	'passive:83:bc fill after bc received conditional-flat' = 'passive:83:bc fill after bc received conditional-flat',
	'passive:83:bc fill after bc received conditional-percent' = 'passive:83:bc fill after bc received conditional-percent',

	UNKNOWN_PROC_EFFECT_ID = 'UNKNOWN_PROC_EFFECT_ID',
	UNKNOWN_PROC_BUFF_PARAMS = 'UNKNOWN_PROC_BUFF_PARAMS',

	'proc:1:attack' = 'proc:1:attack',
	'proc:2:burst heal' = 'proc:2:burst heal',
	'proc:3:gradual heal' = 'proc:3:gradual heal',

	'proc:4:bc fill-flat' = 'proc:4:bc fill-flat',
	'proc:4:bc fill-percent' = 'proc:4:bc fill-percent',

	'proc:5:regular or elemental-atk' = 'proc:5:regular or elemental-atk',
	'proc:5:regular or elemental-def' = 'proc:5:regular or elemental-def',
	'proc:5:regular or elemental-rec' = 'proc:5:regular or elemental-rec',
	'proc:5:regular or elemental-crit' = 'proc:5:regular or elemental-crit',

	'proc:6:drop boost-bc' = 'proc:6:drop boost-bc',
	'proc:6:drop boost-hc' = 'proc:6:drop boost-hc',
	'proc:6:drop boost-item' = 'proc:6:drop boost-item',

	'proc:7:guaranteed ko resistance' = 'proc:7:guaranteed ko resistance',

	'proc:8:max hp boost-flat' = 'proc:8:max hp boost-flat',
	'proc:8:max hp boost-percent' = 'proc:8:max hp boost-percent',

	'proc:9:regular or elemental reduction-atk' = 'proc:9:regular or elemental reduction-atk',
	'proc:9:regular or elemental reduction-def' = 'proc:9:regular or elemental reduction-def',
	'proc:9:regular or elemental reduction-rec' = 'proc:9:regular or elemental reduction-rec',
	'proc:9:regular or elemental reduction-unknown' = 'proc:9:regular or elemental reduction-unknown',

	'proc:10:cleanse-poison' = 'proc:10:cleanse-poison',
	'proc:10:cleanse-weak' = 'proc:10:cleanse-weak',
	'proc:10:cleanse-sick' = 'proc:10:cleanse-sick',
	'proc:10:cleanse-injury' = 'proc:10:cleanse-injury',
	'proc:10:cleanse-curse' = 'proc:10:cleanse-curse',
	'proc:10:cleanse-paralysis' = 'proc:10:cleanse-paralysis',
	'proc:10:cleanse-atk down' = 'proc:10:cleanse-atk down',
	'proc:10:cleanse-def down' = 'proc:10:cleanse-def down',
	'proc:10:cleanse-rec down' = 'proc:10:cleanse-rec down',
	'proc:10:cleanse-unknown' = 'proc:10:cleanse-unknown',

	'proc:11:chance inflict-poison' = 'proc:11:chance inflict-poison',
	'proc:11:chance inflict-weak' = 'proc:11:chance inflict-weak',
	'proc:11:chance inflict-sick' = 'proc:11:chance inflict-sick',
	'proc:11:chance inflict-injury' = 'proc:11:chance inflict-injury',
	'proc:11:chance inflict-curse' = 'proc:11:chance inflict-curse',
	'proc:11:chance inflict-paralysis' = 'proc:11:chance inflict-paralysis',
	'proc:11:chance inflict-atk down' = 'proc:11:chance inflict-atk down',
	'proc:11:chance inflict-def down' = 'proc:11:chance inflict-def down',
	'proc:11:chance inflict-rec down' = 'proc:11:chance inflict-rec down',
	'proc:11:chance inflict-unknown' = 'proc:11:chance inflict-unknown',

	'proc:12:guaranteed revive' = 'proc:12:guaranteed revive',
	'proc:13:random attack' = 'proc:13:random attack',
	'proc:14:hp absorb attack' = 'proc:14:hp absorb attack',

	'proc:16:mitigate-fire' = 'proc:16:mitigate-fire',
	'proc:16:mitigate-water' = 'proc:16:mitigate-water',
	'proc:16:mitigate-earth' = 'proc:16:mitigate-earth',
	'proc:16:mitigate-thunder' = 'proc:16:mitigate-thunder',
	'proc:16:mitigate-light' = 'proc:16:mitigate-light',
	'proc:16:mitigate-dark' = 'proc:16:mitigate-dark',
	'proc:16:mitigate-all' = 'proc:16:mitigate-all',
	'proc:16:mitigate-unknown' = 'proc:16:mitigate-unknown',

	'proc:17:resist-poison' = 'proc:17:resist-poison',
	'proc:17:resist-weak' = 'proc:17:resist-weak',
	'proc:17:resist-sick' = 'proc:17:resist-sick',
	'proc:17:resist-injury' = 'proc:17:resist-injury',
	'proc:17:resist-curse' = 'proc:17:resist-curse',
	'proc:17:resist-paralysis' = 'proc:17:resist-paralysis',

	'proc:18:mitigation' = 'proc:18:mitigation',
	'proc:19:gradual bc fill' = 'proc:19:gradual bc fill',
	'proc:20:bc fill on hit' = 'proc:20:bc fill on hit',
	'proc:22:defense ignore' = 'proc:22:defense ignore',
	'proc:23:spark damage' = 'proc:23:spark damage',

	'proc:24:converted-atk' = 'proc:24:converted-atk',
	'proc:24:converted-def' = 'proc:24:converted-def',
	'proc:24:converted-rec' = 'proc:24:converted-rec',

	'proc:26:hit count boost' = 'proc:26:hit count boost',
	'proc:27:proportional attack' = 'proc:27:proportional attack',
	'proc:28:fixed attack' = 'proc:28:fixed attack',
	'proc:29:multi-element attack' = 'proc:29:multi-element attack',

	'proc:30:add element-fire' = 'proc:30:add element-fire',
	'proc:30:add element-water' = 'proc:30:add element-water',
	'proc:30:add element-earth' = 'proc:30:add element-earth',
	'proc:30:add element-thunder' = 'proc:30:add element-thunder',
	'proc:30:add element-light' = 'proc:30:add element-light',
	'proc:30:add element-dark' = 'proc:30:add element-dark',
	'proc:30:add element-unknown' = 'proc:30:add element-unknown',

	'proc:31:bc fill-flat' = 'proc:31:bc fill-flat',
	'proc:31:bc fill-percent' = 'proc:31:bc fill-percent',

	'proc:32:element shift-fire' = 'proc:32:element shift-fire',
	'proc:32:element shift-water' = 'proc:32:element shift-water',
	'proc:32:element shift-earth' = 'proc:32:element shift-earth',
	'proc:32:element shift-thunder' = 'proc:32:element shift-thunder',
	'proc:32:element shift-light' = 'proc:32:element shift-light',
	'proc:32:element shift-dark' = 'proc:32:element shift-dark',
	'proc:32:element shift-unknown' = 'proc:32:element shift-unknown',

	'proc:33:buff wipe' = 'proc:33:buff wipe',

	'proc:34:bc drain-flat' = 'proc:34:bc drain-flat',
	'proc:34:bc drain-percent' = 'proc:34:bc drain-percent',

	'proc:36:ls lock' = 'proc:36:ls lock',
	'proc:37:summon' = 'proc:37:summon',

	'proc:38:cleanse-poison' = 'proc:38:cleanse-poison',
	'proc:38:cleanse-weak' = 'proc:38:cleanse-weak',
	'proc:38:cleanse-sick' = 'proc:38:cleanse-sick',
	'proc:38:cleanse-injury' = 'proc:38:cleanse-injury',
	'proc:38:cleanse-curse' = 'proc:38:cleanse-curse',
	'proc:38:cleanse-paralysis' = 'proc:38:cleanse-paralysis',
	'proc:38:cleanse-atk down' = 'proc:38:cleanse-atk down',
	'proc:38:cleanse-def down' = 'proc:38:cleanse-def down',
	'proc:38:cleanse-rec down' = 'proc:38:cleanse-rec down',
	'proc:38:cleanse-unknown' = 'proc:38:cleanse-unknown',

	'proc:39:mitigate-fire' = 'proc:39:mitigate-fire',
	'proc:39:mitigate-water' = 'proc:39:mitigate-water',
	'proc:39:mitigate-earth' = 'proc:39:mitigate-earth',
	'proc:39:mitigate-thunder' = 'proc:39:mitigate-thunder',
	'proc:39:mitigate-light' = 'proc:39:mitigate-light',
	'proc:39:mitigate-dark' = 'proc:39:mitigate-dark',
	'proc:39:mitigate-unknown' = 'proc:39:mitigate-unknown',

	'proc:40:add ailment-poison' = 'proc:40:add ailment-poison',
	'proc:40:add ailment-weak' = 'proc:40:add ailment-weak',
	'proc:40:add ailment-sick' = 'proc:40:add ailment-sick',
	'proc:40:add ailment-injury' = 'proc:40:add ailment-injury',
	'proc:40:add ailment-curse' = 'proc:40:add ailment-curse',
	'proc:40:add ailment-paralysis' = 'proc:40:add ailment-paralysis',
	'proc:40:add ailment-atk down' = 'proc:40:add ailment-atk down',
	'proc:40:add ailment-def down' = 'proc:40:add ailment-def down',
	'proc:40:add ailment-rec down' = 'proc:40:add ailment-rec down',
	'proc:40:add ailment-unknown' = 'proc:40:add ailment-unknown',

	'proc:42:sacrificial attack' = 'proc:42:sacrificial attack',
	'proc:42:instant death' = 'proc:42:instant death',

	'proc:43:burst od fill' = 'proc:43:burst od fill',
	'proc:44:damage over time' = 'proc:44:damage over time',

	'proc:45:attack boost-bb' = 'proc:45:attack boost-bb',
	'proc:45:attack boost-sbb' = 'proc:45:attack boost-sbb',
	'proc:45:attack boost-ubb' = 'proc:45:attack boost-ubb',

	'proc:46:non-lethal proportional attack' = 'proc:46:non-lethal proportional attack',
	'proc:47:hp scaled attack' = 'proc:47:hp scaled attack',

	'proc:48:piercing attack-base' = 'proc:48:piercing attack-base',
	'proc:48:piercing attack-current' = 'proc:48:piercing attack-current',
	'proc:48:piercing attack-fixed' = 'proc:48:piercing attack-fixed',
	'proc:48:piercing attack-unknown' = 'proc:48:piercing attack-unknown',

	'proc:49:chance instant death' = 'proc:49:chance instant death',
	'proc:50:chance damage reflect' = 'proc:50:chance damage reflect',

	'proc:51:add to attack-atk down' = 'proc:51:add to attack-atk down',
	'proc:51:add to attack-def down' = 'proc:51:add to attack-def down',
	'proc:51:add to attack-rec down' = 'proc:51:add to attack-rec down',

	'proc:52:bc efficacy' = 'proc:52:bc efficacy',

	'proc:53:inflict on hit-poison' = 'proc:53:inflict on hit-poison',
	'proc:53:inflict on hit-weak' = 'proc:53:inflict on hit-weak',
	'proc:53:inflict on hit-sick' = 'proc:53:inflict on hit-sick',
	'proc:53:inflict on hit-injury' = 'proc:53:inflict on hit-injury',
	'proc:53:inflict on hit-curse' = 'proc:53:inflict on hit-curse',
	'proc:53:inflict on hit-paralysis' = 'proc:53:inflict on hit-paralysis',

	'proc:54:critical damage boost' = 'proc:54:critical damage boost',

	'proc:55:elemental weakness damage-fire' = 'proc:55:elemental weakness damage-fire',
	'proc:55:elemental weakness damage-water' = 'proc:55:elemental weakness damage-water',
	'proc:55:elemental weakness damage-earth' = 'proc:55:elemental weakness damage-earth',
	'proc:55:elemental weakness damage-thunder' = 'proc:55:elemental weakness damage-thunder',
	'proc:55:elemental weakness damage-light' = 'proc:55:elemental weakness damage-light',
	'proc:55:elemental weakness damage-dark' = 'proc:55:elemental weakness damage-dark',
	'proc:55:elemental weakness damage-unknown' = 'proc:55:elemental weakness damage-unknown',

	'proc:56:chance ko resistance' = 'proc:56:chance ko resistance',

	'proc:57:bc drop resistance-base' = 'proc:57:bc drop resistance-base',
	'proc:57:bc drop resistance-buff' = 'proc:57:bc drop resistance-buff',
	'proc:57:hc drop resistance-base' = 'proc:57:hc drop resistance-base',
	'proc:57:hc drop resistance-buff' = 'proc:57:hc drop resistance-buff',

	'proc:58:spark vulnerability' = 'proc:58:spark vulnerability',

	'proc:59:attack reduction-bb' = 'proc:59:attack reduction-bb',
	'proc:59:attack reduction-sbb' = 'proc:59:attack reduction-sbb',
	'proc:59:attack reduction-ubb' = 'proc:59:attack reduction-ubb',

	'proc:61:party bb gauge-scaled attack' = 'proc:61:party bb gauge-scaled attack',
	'proc:61:party bc drain' = 'proc:61:party bc drain',

	'proc:62:barrier-all' = 'proc:62:barrier-all',
	'proc:62:barrier-fire' = 'proc:62:barrier-fire',
	'proc:62:barrier-water' = 'proc:62:barrier-water',
	'proc:62:barrier-earth' = 'proc:62:barrier-earth',
	'proc:62:barrier-thunder' = 'proc:62:barrier-thunder',
	'proc:62:barrier-light' = 'proc:62:barrier-light',
	'proc:62:barrier-dark' = 'proc:62:barrier-dark',
	'proc:62:barrier-unknown' = 'proc:62:barrier-unknown',

	'proc:64:consecutive usage attack' = 'proc:64:consecutive usage attack',
	'proc:65:ailment attack boost' = 'proc:65:ailment attack boost',
	'proc:66:chance revive' = 'proc:66:chance revive',
	'proc:67:bc fill on spark' = 'proc:67:bc fill on spark',
	'proc:68:guard mitigation' = 'proc:68:guard mitigation',

	'proc:69:bc fill on guard-flat' = 'proc:69:bc fill on guard-flat',
	'proc:69:bc fill on guard-percent' = 'proc:69:bc fill on guard-percent',

	'proc:71:bc efficacy reduction' = 'proc:71:bc efficacy reduction',

	'proc:73:resist-atk down' = 'proc:73:resist-atk down',
	'proc:73:resist-def down' = 'proc:73:resist-def down',
	'proc:73:resist-rec down' = 'proc:73:resist-rec down',

	'proc:75:element squad-scaled attack' = 'proc:75:element squad-scaled attack',
	'proc:76:extra action' = 'proc:76:extra action',

	'proc:78:self stat boost-atk' = 'proc:78:self stat boost-atk',
	'proc:78:self stat boost-def' = 'proc:78:self stat boost-def',
	'proc:78:self stat boost-rec' = 'proc:78:self stat boost-rec',
	'proc:78:self stat boost-crit' = 'proc:78:self stat boost-crit',

	'proc:79:player exp boost' = 'proc:79:player exp boost',
	'proc:82:resummon' = 'proc:82:resummon',
	'proc:83:spark critical' = 'proc:83:spark critical',
	'proc:84:od fill rate' = 'proc:84:od fill rate',

	UNKNOWN_CONDITIONAL_EFFECT_ID = 'UNKNOWN_CONDITIONAL_EFFECT_ID',
	UNKNOWN_CONDITIONAL_BUFF_PARAMS = 'UNKNOWN_CONDITIONAL_BUFF_PARAMS',

	'conditional:1:attack buff' = 'conditional:1:attack buff',
	'conditional:3:defense buff' = 'conditional:3:defense buff',
	'conditional:5:recovery buff' = 'conditional:5:recovery buff',

	'conditional:8:gradual heal' = 'conditional:8:gradual heal',
	'conditional:12:guaranteed ko resistance' = 'conditional:12:guaranteed ko resistance',
	'conditional:13:elemental attack buff' = 'conditional:13:elemental attack buff',
	'conditional:14:elemental defense buff' = 'conditional:14:elemental defense buff',

	'conditional:21:fire mitigation' = 'conditional:21:fire mitigation',
	'conditional:22:water mitigation' = 'conditional:22:water mitigation',
	'conditional:23:earth mitigation' = 'conditional:23:earth mitigation',
	'conditional:24:thunder mitigation' = 'conditional:24:thunder mitigation',
	'conditional:25:light mitigation' = 'conditional:25:light mitigation',
	'conditional:26:dark mitigation' = 'conditional:26:dark mitigation',

	'conditional:36:mitigation' = 'conditional:36:mitigation',
	'conditional:37:gradual bc fill' = 'conditional:37:gradual bc fill',
	'conditional:40:spark damage' = 'conditional:40:spark damage',

	'conditional:51:add fire element' = 'conditional:51:add fire element',
	'conditional:52:add water element' = 'conditional:52:add water element',
	'conditional:53:add earth element' = 'conditional:53:add earth element',
	'conditional:54:add thunder element' = 'conditional:54:add thunder element',
	'conditional:55:add light element' = 'conditional:55:add light element',
	'conditional:56:add dark element' = 'conditional:56:add dark element',

	'conditional:72:attack boost-bb' = 'conditional:72:attack boost-bb',
	'conditional:72:attack boost-sbb' = 'conditional:72:attack boost-sbb',
	'conditional:72:attack boost-ubb' = 'conditional:72:attack boost-ubb',

	'conditional:74:add atk down to attack' = 'conditional:74:add atk down to attack',
	'conditional:75:add def down to attack' = 'conditional:75:add def down to attack',

	'conditional:84:critical damage' = 'conditional:84:critical damage',
	'conditional:91:chance ko resistance' = 'conditional:91:chance ko resistance',

	'conditional:98:thunder barrier' = 'conditional:98:thunder barrier',
	'conditional:99:light barrier' = 'conditional:99:light barrier',

	'conditional:131:spark critical' = 'conditional:131:spark critical',
	'conditional:132:od fill rate' = 'conditional:132:od fill rate',
	'conditional:133:heal on hit' = 'conditional:133:heal on hit',

	'conditional:143:critical damage reduction-base' = 'conditional:143:critical damage reduction-base',
	'conditional:143:critical damage reduction-buff' = 'conditional:143:critical damage reduction-buff',

	'conditional:145:elemental weakness damage reduction-base' = 'conditional:145:elemental weakness damage reduction-base',
	'conditional:145:elemental weakness damage reduction-buff' = 'conditional:145:elemental weakness damage reduction-buff',

	'conditional:153:chance inflict atk down on hit' = 'conditional:153:chance inflict atk down on hit',

	'conditional:10500:shield-all' = 'conditional:10500:shield-all',
	'conditional:10500:shield-fire' = 'conditional:10500:shield-fire',
	'conditional:10500:shield-water' = 'conditional:10500:shield-water',
	'conditional:10500:shield-earth' = 'conditional:10500:shield-earth',
	'conditional:10500:shield-thunder' = 'conditional:10500:shield-thunder',
	'conditional:10500:shield-light' = 'conditional:10500:shield-light',
	'conditional:10500:shield-dark' = 'conditional:10500:shield-dark',
	'conditional:10500:shield-unknown' = 'conditional:10500:shield-unknown',
}
