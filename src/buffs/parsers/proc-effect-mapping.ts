import { ProcEffect, UnitElement } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, IGenericBuffValue, BuffId, BuffConditionElement } from './buff-types';
import { IProcBuffProcessingInjectionContext, getProcTargetData, createSourcesFromContext, parseNumberOrDefault, createUnknownParamsValue, ITargetData } from './_helpers';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns Converted buff(s) from the given proc effect.
 */
export type ProcEffectToBuffFunction = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext) => IBuff[];

let mapping: Map<string, ProcEffectToBuffFunction>;

/**
 * @description Retrieve the proc-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of proc IDs to functions.
 */
export function getProcEffectToBuffMapping (reload?: boolean): Map<string, ProcEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, ProcEffectToBuffFunction>();
		setMapping(mapping);
	}

	return mapping;
}

/**
 * @description Apply the mapping of proc effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping (map: Map<string, ProcEffectToBuffFunction>): void {
	const ELEMENT_MAPPING: { [key: string]: UnitElement | BuffConditionElement } = {
		0: BuffConditionElement.All,
		1: UnitElement.Fire,
		2: UnitElement.Water,
		3: UnitElement.Earth,
		4: UnitElement.Thunder,
		5: UnitElement.Light,
		6: UnitElement.Dark,
	};

	const retrieveCommonInfoForEffects = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext) => {
		const targetData = ((injectionContext && injectionContext.getProcTargetData) || getProcTargetData)(effect);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
		const effectDelay = effect['effect delay time(ms)/frame'];

		return { targetData, sources, effectDelay };
	};

	const splitEffectParams = (effect: ProcEffect): string[] => effect.params!.split(',');

	interface IUnknownParamsContext {
		originalId: string;
		sources: string[];
		targetData: ITargetData;
		effectDelay: string;
	}

	const createUnknownParamsEntry = (
		unknownParams: IGenericBuffValue | undefined,
		{
			originalId,
			sources,
			targetData,
			effectDelay,
		}: IUnknownParamsContext,
	): IBuff => ({
		id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
		originalId,
		effectDelay,
		sources,
		value: unknownParams,
		...targetData,
	});

	const createUnknownParamsEntryFromExtraParams = (extraParams: string[], startIndex: number, injectionContext?: IProcBuffProcessingInjectionContext): IGenericBuffValue | undefined => {
		let unknownParams: IGenericBuffValue | undefined;
		if (extraParams && extraParams.length > 0) {
			unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
		}
		return unknownParams;
	};

	map.set('1', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const hits = +((context.damageFrames && context.damageFrames.hits) || 0);
		const distribution = +((context.damageFrames && context.damageFrames['hit dmg% distribution (total)']) || 0);
		const params : { [param: string]: string | number } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			[params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			params['dmg%'] = (effect['bb dmg%'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([,value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = +value;
				return acc;
			}, {});

		const results: IBuff[] = [{
			id: 'proc:1',
			originalId: '1',
			sources,
			effectDelay,
			value: {
				...filteredValue,
				hits,
				distribution,
			},
			...targetData,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '1',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('2', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const params = {
			healLow: '0' as string | number,
			healHigh: '0' as string | number,
			'healerRec%': 0,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let recX: string, recY: string;
			let extraParams: string[];
			[params.healLow, params.healHigh, recX, recY, ...extraParams] = splitEffectParams(effect);
			params['healerRec%'] = ((100 + parseNumberOrDefault(recX)) * (1 + parseNumberOrDefault(recY) / 100)) / 10;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			params.healLow = (effect['heal low'] as number);
			params.healHigh = (effect['heal high'] as number);
			params['healerRec%'] = (effect['rec added% (from healer)'] as number);
		}

		// ensure every property is a number
		Object.keys(params).forEach((key) => {
			params[key as 'healLow' | 'healHigh' | 'healerRec%'] = parseNumberOrDefault(params[key as 'healLow' | 'healHigh' | 'healerRec%']);
		});

		const results: IBuff[] = [{
			id: 'proc:2',
			originalId: '2',
			sources,
			effectDelay,
			value: params,
			...targetData,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '2',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('3', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const params = {
			healLow: '0' as string | number,
			healHigh: '0' as string | number,
			'targetRec%': 0,
			turnDuration: '0' as string | number,
			// TODO: handle unknown 5th parameter once it's figured out
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let rec: string;
			let extraParams: string[];
			[params.healLow, params.healHigh, rec, params.turnDuration, ...extraParams] = splitEffectParams(effect);
			params['targetRec%'] = (1 + parseNumberOrDefault(rec) / 100) * 10;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			params.healLow = (effect['gradual heal low'] as number);
			params.healHigh = (effect['gradual heal high'] as number);
			params['targetRec%'] = (effect['rec added% (from target)'] as number);
			params.turnDuration = (effect['gradual heal turns (8)'] as number);
		}

		// ensure every property is a number
		Object.keys(params).forEach((key) => {
			params[key as 'healLow' | 'healHigh' | 'targetRec%' | 'turnDuration'] = parseNumberOrDefault(params[key as 'healLow' | 'healHigh' | 'targetRec%' | 'turnDuration']);
		});

		const results: IBuff[] = [{
			id: 'proc:3',
			originalId: '3',
			sources,
			effectDelay,
			duration: params.turnDuration as number,
			value: {
				healLow: params.healLow,
				healHigh: params.healHigh,
				'targetRec%': params['targetRec%'],
			},
			...targetData,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '3',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('4', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatFill = 0;
		let percentFill = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
			flatFill = parseNumberOrDefault(rawFlatFill);
			percentFill = parseNumberOrDefault(rawPercentFill);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			if ('bb bc fill' in effect) {
				flatFill = parseNumberOrDefault(effect['bb bc fill'] as number);
			}
			if ('bb bc fill%' in effect) {
				percentFill = parseNumberOrDefault(effect['bb bc fill%'] as number);
			}
		}

		const results: IBuff[] = [];
		if (flatFill !== 0) {
			results.push({
				id: 'proc:4:flat',
				originalId: '4',
				sources,
				effectDelay,
				value: flatFill,
				...targetData,
			});
		}

		if (percentFill !== 0) {
			results.push({
				id: 'proc:4:percent',
				originalId: '4',
				sources,
				effectDelay,
				value: percentFill,
				...targetData,
			});
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '4',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('5', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const params = {
			element: BuffConditionElement.All as (UnitElement | BuffConditionElement),
			atk: '0' as string | number,
			def: '0' as string | number,
			rec: '0' as string | number,
			crit: '0' as string | number,
			turnDuration: '0' as string | number,
			// TODO: handle unknown 7th parameter once it's figured out
		};
		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'crit';
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec', 'crit'];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawElement: string;
			[rawElement, params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
			params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			const effectElement = effect['element buffed'] as string;
			if (effectElement === 'all') {
				params.element = BuffConditionElement.All;
			} else if (!effectElement) {
				params.element = BuffConditionElement.Unknown;
			} else {
				params.element = effectElement as UnitElement;
			}

			const keys = Object.keys(effect);
			coreStatProperties.forEach((statType) => {
				const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
				if (effectKey) {
					params[statType] = effect[effectKey] as number;
				}
			});

			params.turnDuration = effect['buff turns'] as number;
		}

		// ensure numerical properties are actually numbers
		(coreStatProperties as string[]).concat(['turnDuration']).forEach((prop) => {
			params[prop as CoreStatProperty | 'turnDuration'] = parseNumberOrDefault(params[prop as CoreStatProperty | 'turnDuration']);
		});
		const hasAnyStats = coreStatProperties.some((statKey) => params[statKey] !== 0);

		const results: IBuff[] = [];
		if (hasAnyStats) {
			coreStatProperties.forEach((statKey) => {
				const value = params[statKey];
				if (value !== 0) {
					results.push({
						id: `proc:5:${statKey}`,
						originalId: '5',
						sources,
						effectDelay,
						duration: params.turnDuration as number,
						value,
						conditions: {
							targetElements: [params.element],
						},
						...targetData,
					});
				}
			});
		} else {
			results.push({
				id: BuffId.TURN_DURATION_MODIFICATION,
				originalId: '5',
				sources,
				value: {
					buffs: coreStatProperties.map((statKey) => `proc:5:${statKey}`),
					duration: params.turnDuration as number,
				},
				...targetData,
			});
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '3',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});
}
