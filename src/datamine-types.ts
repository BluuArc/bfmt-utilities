/**
 * @author BluuArc
 */
export interface IBfmtMetadata {
	createdAt: string;
	updatedAt: string;

	/**
	 * @description whether or not the entry has been removed from the datamine
	 */
	removed?: boolean;
}

export enum ArenaCondition {
	/* eslint-disable @typescript-eslint/camelcase */
	hp_50pr_under = 'hp_50pr_under',
	hp_50pr_over = 'hp_50pr_over',
	hp_75pr_under = 'hp_75pr_under',
	hp_25pr_under = 'hp_25pr_under',
	hp_min = 'hp_min',
	hp_max = 'hp_max',
	atk_max = 'atk_max',
	random = 'random',
	/* eslint-enable @typescript-eslint/camelcase */
}

export interface IUnitArenaAiEntry {
	action: 'skill' | 'attack';
	'chance%': number;
	'target conditions': ArenaCondition;
	'target type': 'party' | 'enemy';
}

export enum MoveType {
	Moving = 1,
	Teleporting = 2,
	NonMoving = 3,
}

export interface IUnitMovementEntry {
	'move speed': number;
	'move speed type': string;
	'move type': MoveType;
}

export interface IUnitStatsEntry {
	hp: number;
	atk: number;
	def: number;
	rec: number;
}

export enum TargetArea {
	Aoe = 'aoe',
	Single = 'single',
	Random = 'random',
}

export enum TargetAreaShorthand {
	Aoe = 'AOE',
	Single = 'ST',
	Random = 'RT',
}

export enum TargetType {
	Self = 'self',
	Party = 'party',
	Enemy = 'enemy',
}

export interface IBaseProcEffect {
	'effect delay time(ms)/frame': string;
	'target area': TargetArea;
	'target type': TargetType;
	params?: string;
}

export interface IProcEffect extends IBaseProcEffect {
	'proc id': string;
	[key: string]: any;
}

export interface IUnknownProcEffect extends IBaseProcEffect {
	'unknown proc id': string;
	'unknown proc param': string;
	[key: string]: any;
}

export type ProcEffect = IProcEffect | IUnknownProcEffect;

export interface IPassiveEffect {
	'passive id': string;
	[key: string]: any;
	/**
	 * @author BluuArc
	 */
	params?: string;
}

export interface ITriggeredEffect {
	'passive id': '66';
	'passive target': TargetType;
	'trigger on bb'?: boolean;
	'trigger on sbb'?: boolean;
	'trigger on ubb'?: boolean;
	'triggered effect': ProcEffect[];
	/**
	 * @author BluuArc
	 */
	params?: string;
}

export interface IUnknownPassiveEffect {
	'unknown passive id': string;
	'unknown passive params': string;
}

export type PassiveEffect = IPassiveEffect | IUnknownPassiveEffect | ITriggeredEffect;

export enum SpPassiveType {
	AddPassive = 'passive',
	EnhanceBb = 'add to bb',
	EnhanceSbb = 'add to sbb',
	EnhanceUbb = 'add to ubb',
	EnhancePassive = 'add to passive',
}

export interface ISpEnhancementPassiveEffect extends IPassiveEffect {
	sp_type: SpPassiveType;
}

export interface ISpEnhancementUnknownPassiveEffect extends IUnknownPassiveEffect {
	sp_type: SpPassiveType;
}

export interface ISpEnhancementTriggeredEffect extends ITriggeredEffect {
	sp_type: SpPassiveType;
}

export type SpEnhancementEffect = ISpEnhancementPassiveEffect | ISpEnhancementUnknownPassiveEffect | ISpEnhancementTriggeredEffect;

export interface IDamageFramesEntry {
	'effect delay time(ms)/frame': string;
	'frame times': number[];
	'hit dmg% distribution': number[];
	'hit dmg% distribution (total)': number;
	hits: number;
}

export interface IBurstLevelEntry {
	'bc cost': number;
	effects: ProcEffect[];
}

export interface IBurstDamageFramesEntry extends IDamageFramesEntry {
	'unknown proc id'?: string;
	'proc id'?: string;
}

/**
 * @author BluuArc
 */
export interface IAttackInfo {
	id: string;
	target: TargetAreaShorthand;
	'bb'?: boolean;
	'sbb'?: boolean;
	'ubb'?: boolean;
	sourcePath?: string;
	hits: number;
}

export interface IBraveBurst {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;
	attackInfo?: IAttackInfo[];

	associated_units? : string[];
	'damage frames': IBurstDamageFramesEntry[];
	desc: string;
	'drop check count': number;
	id: string;
	name: string;
	levels: IBurstLevelEntry[];
}

export enum SphereTypeName {
	None = 'None',
	'Status Enhancing' = 'Status Enhancing',
	Critical = 'Critical',
	Drop = 'Drop',
	'Ailment Inducing' = 'Ailment Inducing',
	'Element Fusion' = 'Element Fusion',
	'BB Gauge' = 'BB Gauge',
	'HP Recovery' = 'HP Recovery',
	'Target Setting' = 'Target Setting',
	'Damage Deflecting' = 'Damage Deflecting',
	'Damage Reducing' = 'Damage Reducing',
	Spark = 'Spark',
	'Defense Piercing' = 'Defense Piercing',
	'Attack Boosting' = 'Attack Boosting',
	Special = 'Special',
}

export enum SphereTypeId {
	'None' = 0,
	'Status Enhancing' = 1,
	'Critical' = 2,
	'Drop' = 3,
	'Ailment Inducing' = 4,
	'Element Fusion' = 5,
	'BB Gauge' = 6,
	'HP Recovery' = 7,
	'Target Setting' = 8,
	'Damage Deflecting' = 9,
	'Damage Reducing' = 10,
	'Spark' = 11,
	'Defense Piercing' = 12,
	'Attack Boosting' = 13,
	'Special' = 14,
}

export interface IExtraSkillCondition {
	'item required'?: string[];
	'sphere category required'?: SphereTypeName;
	'sphere category required (raw)'?: SphereTypeId;
	'unit required'?: { id: number; name?: string }[];
}

export interface IExtraSkillPassiveEffect extends IPassiveEffect {
	conditions: IExtraSkillCondition[];
	'passive target': TargetType;
	/**
	 * @author BluuArc
	 */
	conditionParams?: string;
}

export interface IExtraSkillUnknownPassiveEffect extends IUnknownPassiveEffect {
	conditions: IExtraSkillCondition[];
	'passive target': TargetType;
}

export type ExtraSkillPassiveEffect = IExtraSkillPassiveEffect | IExtraSkillUnknownPassiveEffect;

export interface IExtraSkill {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;

	/**
	 * @description List of units that use this extra skill
	 * @author BluuArc
	 */
	associated_units?: string[];

	/**
	 * @description Array of mission IDs where this extra skill is a reward
	 * @author BluuArc
	 */
	first_clear_missions?: string[];

	desc: string;
	effects: ExtraSkillPassiveEffect[];
	id: string;
	name: string;
	rarity?: string;
	target: TargetType;
}

export enum SpCategoryName {
	'Parameter Boost' = 'Parameter Boost',
	Spark = 'Spark',
	'Critical Hits' = 'Critical Hits',
	'Attack Boost' = 'Attack Boost',
	'BB Gauge' = 'BB Gauge',
	'HP Recovery' = 'HP Recovery',
	Drops = 'Drops',
	'Ailment Resistance' = 'Ailment Resistance',
	'Ailment Infliction' = 'Ailment Infliction',
	'Damage Reduction' = 'Damage Reduction',
	Special = 'Special',
	Unknown = 'Unknown',
}

export enum SpCategoryId {
	'Parameter Boost' = '1',
	Spark = '2',
	'Critical Hits' = '3',
	'Attack Boost' = '4',
	'BB Gauge' = '5',
	'HP Recovery' = '6',
	Drops = '7',
	'Ailment Resistance' = '8',
	'Ailment Infliction' = '9',
	'Damage Reduction' = '10',
	Special = '11',
}

export interface ISpEnhancementEffectWrapper {
	/**
	 * @description used to add an entirely new effect
	 */
	passive?: PassiveEffect;

	/**
	 * @description used when enhancing an existing effect on LS
	 */
	'add to passive'?: PassiveEffect;

	/**
	 * @description used when enhancing an existing BB
	 */
	'add to bb'?: ProcEffect;

	/**
	 * @description used when enhancing an existing SBB
	 */
	'add to sbb'?: ProcEffect;

	/**
	 * @description used when enhancing an existing UBB
	 */
	'add to ubb'?: ProcEffect;
}

export interface ISpEnhancementSkill {
	bp: number;
	desc: string;
	effects: ISpEnhancementEffectWrapper[];
	id: string;
	level: number;
	name: string;
	series: string;
}

export interface ISpEnhancementEntry {
	category: SpCategoryId;
	dependency?: string;
	'dependency comment'?: string;
	id: string;
	skill: ISpEnhancementSkill;
}

export interface ILeaderSkill {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;

	/**
	 * @description List of units that use this leader skill
	 * @author BluuArc
	 */
	associated_units?: string[];

	desc: string;
	effects: PassiveEffect[];
	id: string;
	name: string;
}

export enum UnitAnimationKey {
	Attack = 'attack',
	Idle = 'idle',
	Move = 'move',
}

export interface IUnitAnimationEntry {
	'total number of frames': number;
}

export enum UnitElement {
	Fire = 'fire',
	Water = 'water',
	Earth = 'earth',
	Thunder = 'thunder',
	Light = 'light',
	Dark = 'dark',
}

export enum UnitGender {
	Male = 'male',
	Female = 'female',
	Other = 'other',
}

export enum UnitGettingType {
	Ineligible = 'not eligible for achievement',
	Farmable = 'farmable',
	RareSummon = 'rare summon',
}

export enum UnitKind {
	Normal = 'normal',
	Evolution = 'evo',
	Enhancing = 'enhancing',
	Sale = 'sale',
}

export interface IEvolutionMaterial {
	id: string;
	name: string;
	type: 'unit'|'item';
}

/**
 * @author BluuArc
 */
export interface IUnitBond {
	/**
	 * @description Unit ID of bond partner
	 */
	partner: number;
	dbb: IBraveBurst;
}

export enum UnitType {
	Lord = 'lord',
	Anima = 'anima',
	Breaker = 'breaker',
	Guardian = 'guardian',
	Oracle = 'oracle',
	Rex = 'rex',
}

export interface IUnit {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;

	/**
	 * @description Arena AI; determines chances for different actions in Arena.
	 */
	ai?: IUnitArenaAiEntry[];
	ai_id?: string;
	animations?: {
		[UnitAnimationKey.Attack]?: IUnitAnimationEntry;
		[UnitAnimationKey.Idle]?: IUnitAnimationEntry;
		[UnitAnimationKey.Move]?: IUnitAnimationEntry;
	};
	bb?: IBraveBurst;
	sbb?: IBraveBurst;
	ubb?: IBraveBurst;

	bonds?: {
		[dbbId: string]: IUnitBond;
	};

	/**
	 * @description Effects that apply only during Guild Raid
	 * @author BluuArc
	 */
	guild_raid?: {
		'leader skill'?: ILeaderSkill;
		'extra skill?': IExtraSkill;
	};

	/**
	 * @description Typically used to identify an evolution line of units.
	 */
	category?: number;
	cost: number;

	/**
	 * @description Damage frames for a unit's normal attack.
	 */
	'damage frames': IDamageFramesEntry;

	/**
	 * @author BluuArc
	 */
	dictionary?: {
		description?: string;
		evolution?: string;
		fusion?: string;
		summon?: string;
	};

	/**
	 * @author BluuArc
	 */
	evolution?: {
		mats?: IEvolutionMaterial[];
		// cost?: number;
		zel?: number;
		karma?: number;

		/**
		 * @description unit ID of next evolution
		 */
		next?: string;

		/**
		 * @description unit ID of pre-evolution
		 */
		prev?: string[];
	};

	/**
	 * @description Array of mission IDs where this unit is a reward
	 * @author BluuArc
	 */
	first_clear_missions?: string[];

	/**
	 * @description Maximum number of battle crystals dropped per hit on normal attack.
	 */
	'drop check count': number;
	element: UnitElement;

	/**
	 * @description Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.
	 */
	exp_pattern: number;
	'extra skill'?: IExtraSkill;

	/**
	 * @author BluuArc
	 */
	feskills?: ISpEnhancementEntry[];
	gender: UnitGender;

	/**
	 * @description Helps determine merit value in exchange hall
	 */
	'getting type': UnitGettingType;
	guide_id: number;
	id: number;
	imp: {
		'max hp': string;
		'max atk': string;
		'max def': string;
		'max rec': string;
	};
	/**
	 * @description Tells what this unit can be used for. In Deathmax's datamine, the types for
	 * evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
	 * unit while a burst frog is marked as an evolution unit.
	 */
	kind: UnitKind | null;

	'leader skill'?: ILeaderSkill;

	/**
	 * @description format of `minvalue~maxvalue`
	 */
	'lord damage range': string;

	movement: {
		attack: IUnitMovementEntry;
		skill?: IUnitMovementEntry;
	};
	name: string;
	'overdrive stats': {
		'atk%': number;
		'def%': number;
		'rec%': number;
	};
	rarity: number;
	'sell caution': boolean;
	sell_price?: number;
	stats: {
		anima?: {
			atk: number;
			def: number;
			'hp max': number;
			'hp min': number;
			'rec max': number;
			'rec min': number;
		};
		breaker?: {
			hp: number;
			rec: number;
			'atk max': number;
			'atk min': number;
			'def max': number;
			'def min': number;
		};
		guardian?: {
			hp: number;
			atk: number;
			'def max': number;
			'def min': number;
			'rec max': number;
			'rec min': number;
		};
		oracle?: {
			atk: number;
			def: number;
			'hp max': number;
			'hp min': number;
			'rec max': number;
			'rec min': number;
		};
		_base: IUnitStatsEntry;
		_lord: IUnitStatsEntry;
	};
}

export enum ItemType {
	Consumable = 'consumable',
	Material = 'material',
	Sphere = 'sphere',
	EvolutionMaterial = 'evomat',
	SummonerConsumable = 'summoner_consumable',
	LeaderSkillSphere = 'ls_sphere',
}

export interface IItemRecipeMaterial {
	count: number;
	id: number;
	name: string;
}

export interface IItemRecipe {
	karma: string;
	materials: IItemRecipeMaterial[];
}

/**
 * @author BluuArc
 */
export interface IItemUsageEntry {
	id: number;
	name: string;
}

export interface IItem {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;

	desc: string;
	id: number;
	max_stack: number;
	name: string;
	raid: boolean;
	rarity: number;
	sell_price: number;
	thumbnail: string;
	type: ItemType;
	/**
	 * @description If the source is from Deathmax, then it is an object. If the source is from BluuArc, then it is an array.
	 */
	recipe?: IItemRecipe | IItemRecipe[];

	/**
	 * @description List of other items that use the current item in their recipe
	 * @author BluuArc
	 */
	usage?: IItemUsageEntry[];

	/**
	 * @author BluuArc
	 */
	dictionary?: {
		lore?: string;
	};

	/**
	 * @description List of units that use this item
	 * @author BluuArc
	 */
	associated_units?: string[];

	/**
	 * @description Array of mission IDs where this item is a reward
	 * @author BluuArc
	 */
	first_clear_missions?: string[];

	'sell caution'?: boolean;
}

export interface IConsumableItem extends IItem {
	'max equipped': number;
	effect: {
		effect: ProcEffect[];
		target_area: TargetArea;
		target_type: TargetType;
	};
}

export interface ISphere extends IItem {
	effect: PassiveEffect[];
	'sphere type': SphereTypeId;
	'sphere type text'?: SphereTypeName;
}

export enum MimicUnitIds {
	Mimic = '60142',
	BatMimic = '60143',
	DragonMimic = '60144',
	MetalMimic = '60224',
}

/**
 * @description Known values for the monster groups used in {@link IMimicInfo}
 */
export const MimicMonsterGroupMapping = {
	'1000': MimicUnitIds.Mimic,
	'1100': MimicUnitIds.BatMimic,
	'1101': MimicUnitIds.BatMimic,
	'1200': MimicUnitIds.DragonMimic,
	'1300': MimicUnitIds.MetalMimic,
};

export interface IMimicInfo {
	group_1_chance: string;

	/**
	 * @description Known mappings can be found at {@link MimicMonsterGroupMapping}
	 */
	group_1_monster_group: string;
	group_2_chance: string;

	/**
	 * @description Known mappings can be found at {@link MimicMonsterGroupMapping}
	 */
	group_2_monster_group: string;
	spawn_chance_range_maybe: string;
}

export interface IGemClearBonus {
	gem: string;
}

export interface IUnitClearBonus {
	unit: {
		count: string;
		id: string;
		/**
		 * @author BluuArc
		 */
		elgif?: string;
	};
}

export interface IItemClearBonus {
	item: {
		count: string;
		id: string;
	};
}

export interface IZelClearBonus {
	zel: string;
}

export interface IKarmaClearBonus {
	karma: string;
}

export type ClearBonus = IGemClearBonus | IUnitClearBonus | IItemClearBonus | IZelClearBonus | IKarmaClearBonus;

export interface IMission {
	/**
	 * @author BluuArc
	 */
	bfmtMetadata?: IBfmtMetadata;

	area: string;
	battle_count: number;
	clear_bonus: ClearBonus[];
	continue: boolean;
	desc: string;
	difficulty: number;
	dungeon: string;
	energy_use: number;
	id: string;
	karma: number;
	land: string;
	mimic_info: IMimicInfo;
	mimic_info_params?: string;
	name: string;
	xp: number;
	zel: number;

	/**
	 * @description comma delimited list of mission IDs
	 */
	requires?: string;
}
