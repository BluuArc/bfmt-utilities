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

export interface IPassiveEffect {
	'passive id': string;
	[key: string]: any;
}

export interface IUnknownPassiveEffect {
	'unknown passive id': string;
	'unknown passive params': string;
}
