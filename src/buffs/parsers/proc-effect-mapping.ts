import { ProcEffect } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, IGenericBuffValue, BuffId } from './buff-types';
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
	const retrieveCommonInfoForEffects = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext) => {
		const targetData = ((injectionContext && injectionContext.getProcTargetData) || getProcTargetData)(effect);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
		const effectDelay = effect['effect delay time(ms)/frame'];

		return { targetData, sources, effectDelay };
	};

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
			[params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = effect.params.split(',');

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
			[params.healLow, params.healHigh, recX, recY, ...extraParams] = effect.params.split(',');
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
			[params.healLow, params.healHigh, rec, params.turnDuration, ...extraParams] = effect.params.split(',');
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
}
