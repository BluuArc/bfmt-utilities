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

export interface IUnitMovemmentEntry {
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

export enum TargetType {
	Self = 'self',
	Party = 'party',
	Enemy = 'enemy',
}

export interface IBaseProcEffect {
	'effect delay time(ms)/frame': string;
	'target area': TargetArea;
	'target type': TargetType;
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
}

export interface IUnknownPassiveEffect {
	'unknown passive id': string;
	'unknown passive params': string;
}

export type PassiveEffect = IPassiveEffect | IUnknownPassiveEffect;

export interface IDamageFramesEntry {
	'effect delay time(ms)/frame': string;
	'frame times': number[];
	'hit dmg% distribution': number;
}

export interface IBurstLevelEntry {
	'bc cost': number;
	effects: ProcEffect[];
}

export interface IBurstDamageFramesEntry extends IDamageFramesEntry {
	'unknown proc id'?: string;
	'proc id'?: string;
	hits: number;
}

export interface IBraveBurst {
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
	'unit required'?: { id: number; name: string }[];
}

export interface IExtraSkillPassiveEffect extends IPassiveEffect {
	conditions: IExtraSkillCondition[];
	'passive target': TargetType;
}

export interface IExtraSkillUnknownPassiveEffect extends IUnknownPassiveEffect {
	conditions: IExtraSkillCondition[];
	'passive target': TargetType;
}

export type ExtraSkillPassiveEffect = IExtraSkillPassiveEffect | IExtraSkillUnknownPassiveEffect;

export interface IExtraSkill {
	desc: string;
	effects: ExtraSkillPassiveEffect[];
	is: string;
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

export interface ISpEnhancementEffect {
	passive?: PassiveEffect;
	'add to bb'?: ProcEffect;
	'add to sbb'?: ProcEffect;
	'add to ubb': ProcEffect;
}

export interface ISpEnhancementSkill {
	bp: number;
	desc: string;
	effects: ISpEnhancementEffect[];
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
