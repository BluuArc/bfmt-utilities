import { ProcEffect, UnitElement, Ailment, TargetArea } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, IGenericBuffValue, BuffId, BuffConditionElement } from './buff-types';
import { IProcBuffProcessingInjectionContext, getProcTargetData, createSourcesFromContext, parseNumberOrDefault, createUnknownParamsValue, ITargetData, buffSourceIsBurstType } from './_helpers';

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

	const AILMENT_MAPPING: { [param: string]: Ailment } = {
		1: Ailment.Poison,
		2: Ailment.Weak,
		3: Ailment.Sick,
		4: Ailment.Injury,
		5: Ailment.Curse,
		6: Ailment.Paralysis,
		7: Ailment.AttackReduction,
		8: Ailment.DefenseReduction,
		9: Ailment.RecoveryReduction,
	};

	const retrieveCommonInfoForEffects = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext) => {
		const targetData = ((injectionContext && injectionContext.getProcTargetData) || getProcTargetData)(effect);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
		const effectDelay = effect['effect delay time(ms)/frame'];

		return { targetData, sources, effectDelay };
	};

	type AlphaNumeric = string | number;

	// Disable rule as this function is only called once it's confirmed that `effect.params` exists
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const splitEffectParams = (effect: ProcEffect): string[] => effect.params!.split(',');

	interface IUnknownParamsContext {
		originalId: string;
		sources: string[];
		targetData: ITargetData;
		effectDelay: string;
	}

	interface ITurnDurationContext {
		originalId: string;
		sources: string[];
		targetData: ITargetData;
		buffs: (string | BuffId)[],
		duration: number,
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

	const createTurnDurationEntry = (
		{
			originalId,
			sources,
			buffs,
			duration,
			targetData,
		}: ITurnDurationContext,
	): IBuff => ({
		id: BuffId.TURN_DURATION_MODIFICATION,
		originalId,
		sources,
		value: {
			buffs,
			duration: duration,
		},
		...targetData,
	});

	const createUnknownParamsEntryFromExtraParams = (extraParams: string[], startIndex: number, injectionContext?: IProcBuffProcessingInjectionContext): IGenericBuffValue | undefined => {
		let unknownParams: IGenericBuffValue | undefined;
		if (extraParams && extraParams.length > 0) {
			unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
		}
		return unknownParams;
	};

	/**
	 * @description Decide whether the effect being parsed is a turn duration buff. This should only be
	 * checked if all other known values in the effect are 0.
	 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
	 * @param turnDuration Parsed turn duration value to check.
	 * @param injectionContext Object whose main use is for injecting methods in testing.
	 * @returns True if the turn duration value is non-zero and the source type is not a burst type.
	 */
	const isTurnDurationBuff = (context: IEffectToBuffConversionContext, turnDuration: number, injectionContext?: IProcBuffProcessingInjectionContext): boolean => {
		let result = turnDuration !== 0;
		if (result) {
			result = !((injectionContext && injectionContext.buffSourceIsBurstType) || buffSourceIsBurstType)(context.source);
		}
		return result;
	};

	/**
	 * @description Helper function to get attack information common across most attacks from the conversion context.
	 * @param context Given context that may contain attack information like damage frames.
	 * @returns Extracted attack information from the context (with defaults where applicable).
	 */
	const getAttackInformationFromContext = (context: IEffectToBuffConversionContext): { hits: number, distribution: number } => {
		const hits = parseNumberOrDefault(context.damageFrames && context.damageFrames.hits || 0);
		const distribution = parseNumberOrDefault(context.damageFrames && context.damageFrames['hit dmg% distribution (total)']);
		return {
			hits,
			distribution,
		};
	};

	interface IProcWithSingleNumericalParameterAndTurnDurationContext {
		effect: ProcEffect;
		context: IEffectToBuffConversionContext,
		injectionContext?: IProcBuffProcessingInjectionContext;
		effectValueKey: string;
		effectTurnDurationKey: string;
		parseParamValue?: (rawValue: string) => number,
		buffId: string;
		originalId: string;
	}
	const parseProcWithSingleNumericalParameterAndTurnDuration = ({
		effect,
		context,
		injectionContext,
		effectValueKey,
		effectTurnDurationKey,
		parseParamValue = (rawValue: string) => parseNumberOrDefault(rawValue),
		buffId,
		originalId,
	}: IProcWithSingleNumericalParameterAndTurnDurationContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let value = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawValue, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			value = parseParamValue(rawValue);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			value = parseNumberOrDefault(effect[effectValueKey] as number);
			turnDuration = parseNumberOrDefault(effect[effectTurnDurationKey] as number);
		}

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: buffId,
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value,
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: [buffId],
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId,
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	};

	map.set('1', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
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
				acc[key] = parseNumberOrDefault(value);
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
			healLow: '0' as AlphaNumeric,
			healHigh: '0' as AlphaNumeric,
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
			healLow: '0' as AlphaNumeric,
			healHigh: '0' as AlphaNumeric,
			'targetRec%': 0,
			turnDuration: '0' as AlphaNumeric,
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

		const hasAnyHealValues = params.healLow !== 0 || params.healHigh !== 0;
		const results: IBuff[] = [];
		if (hasAnyHealValues) {
			results.push({
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
			});
		} else if (isTurnDurationBuff(context, params.turnDuration as number, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '3',
				sources,
				buffs: ['proc:3'],
				duration: params.turnDuration as number,
				targetData,
			}));
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
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			turnDuration: '0' as AlphaNumeric,
		};
		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'crit';
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec', 'crit'];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawElement: string;
			[rawElement, params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);
			params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
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
					params[statType] = parseNumberOrDefault(effect[effectKey] as number);
				}
			});

			params.turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
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
					const buffEntry: IBuff = {
						id: `proc:5:${statKey}`,
						originalId: '5',
						sources,
						effectDelay,
						duration: params.turnDuration as number,
						value,
						...targetData,
					};
					if (params.element !== BuffConditionElement.All) {
						buffEntry.conditions = {
							targetElements: [params.element],
						};
					}
					results.push(buffEntry);
				}
			});
		} else if (isTurnDurationBuff(context, params.turnDuration as number, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '5',
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:5:${statKey}`),
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '5',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('6', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const params = {
			bc: '0' as AlphaNumeric,
			hc: '0' as AlphaNumeric,
			item: '0' as AlphaNumeric,
			turnDuration: '0' as AlphaNumeric,
		};
		type DropRateProperty = 'bc' | 'hc' | 'item';
		const dropRateProperties: DropRateProperty[] = ['bc', 'hc', 'item'];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			[params.bc, params.hc, params.item, params.turnDuration, ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			params.bc = (effect['bc drop rate% buff (10)'] as number);
			params.hc = (effect['hc drop rate% buff (9)'] as number);
			params.item = (effect['item drop rate% buff (11)'] as number);
			params.turnDuration = (effect['drop buff rate turns'] as number);
		}

		(dropRateProperties as string[]).concat(['turnDuration']).forEach((prop) => {
			params[prop as DropRateProperty | 'turnDuration'] = parseNumberOrDefault(params[prop as DropRateProperty | 'turnDuration']);
		});

		const hasAnyRates = dropRateProperties.some((key) => params[key] !== 0);
		const results: IBuff[] = [];
		if (hasAnyRates) {
			dropRateProperties.forEach((key) => {
				const value = params[key];
				if (value !== 0) {
					results.push({
						id: `proc:6:${key}`,
						originalId: '6',
						sources,
						effectDelay,
						duration: params.turnDuration as number,
						value,
						...targetData,
					});
				}
			});
		} else if (isTurnDurationBuff(context, params.turnDuration as number, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '6',
				sources,
				buffs: dropRateProperties.map((key) => `proc:6:${key}`),
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '6',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('7', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let recoveredHpPercent = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawRecoveredHp, ...extraParams] = splitEffectParams(effect);
			recoveredHpPercent = parseNumberOrDefault(rawRecoveredHp);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			recoveredHpPercent = parseNumberOrDefault(effect['angel idol recover hp%']);
		}

		const results: IBuff[] = [{
			id: 'proc:7',
			originalId: '7',
			sources,
			effectDelay,
			value: recoveredHpPercent,
			...targetData,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '7',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('8', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatHpBoost = 0;
		let percentHpBoost = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatBoost, rawPercentBoost, ...extraParams] = splitEffectParams(effect);
			flatHpBoost = parseNumberOrDefault(rawFlatBoost);
			percentHpBoost = parseNumberOrDefault(rawPercentBoost);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			if ('max hp increase' in effect) {
				flatHpBoost = parseNumberOrDefault(effect['max hp increase'] as number);
			}
			if ('max hp% increase' in effect) {
				percentHpBoost = parseNumberOrDefault(effect['max hp% increase'] as number);
			}
		}

		const results: IBuff[] = [];
		if (flatHpBoost !== 0) {
			results.push({
				id: 'proc:8:flat',
				originalId: '8',
				sources,
				effectDelay,
				value: flatHpBoost,
				...targetData,
			});
		}

		if (percentHpBoost !== 0) {
			results.push({
				id: 'proc:8:percent',
				originalId: '8',
				sources,
				effectDelay,
				value: percentHpBoost,
				...targetData,
			});
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '8',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('9', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const STAT_TYPE_MAPPING = {
			0: 'atk',
			1: 'def',
			2: 'rec',
		};
		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'unknown';
		interface IStatReductionEntry {
			stat: CoreStatProperty;
			value: number,
			chance: number;
		}
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec'];

		const params = {
			element: BuffConditionElement.All as (UnitElement | BuffConditionElement),
			statReductionEntries: [] as IStatReductionEntry[],
			turnDuration: 0,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawElement, statType1, value1, procChance1, statType2, value2, procChance2, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			params.element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
			params.turnDuration = parseNumberOrDefault(rawTurnDuration);

			[
				[statType1, value1, procChance1],
				[statType2, value2, procChance2],
			].forEach(([rawStatType, rawValue, rawProcChance]) => {
				const statType = parseNumberOrDefault(rawStatType) - 1;
				const value = parseNumberOrDefault(rawValue);
				const chance = parseNumberOrDefault(rawProcChance);

				if (statType === 3) { // all stats
					params.statReductionEntries.push(...coreStatProperties.map((stat) => ({
						stat,
						value,
						chance,
					})));
				} else {
					params.statReductionEntries.push({
						stat: (STAT_TYPE_MAPPING[statType as 0 | 1 | 2] as CoreStatProperty) || 'unknown',
						value,
						chance,
					});
				}
			});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			const effectElement = effect['element buffed'] as string;
			if (effectElement === 'all') {
				params.element = BuffConditionElement.All;
			} else if (!effectElement) {
				params.element = BuffConditionElement.Unknown;
			} else {
				params.element = effectElement as UnitElement;
			}

			['buff #1', 'buff #2'].forEach((buffKey) => {
				const entry = effect[buffKey] as { [key: string]: number };
				if (entry) {
					const chance = parseNumberOrDefault(entry['proc chance%']);
					const keys = Object.keys(entry);
					coreStatProperties.forEach((statType) => {
						const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
						if (effectKey) {
							params.statReductionEntries.push({
								stat: statType,
								value: parseNumberOrDefault(entry[effectKey]),
								chance,
							});
						}
					});
				}
			});

			params.turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = [];
		let hasAnyValues = false;
		params.statReductionEntries.forEach(({ stat, value, chance }) => {
			if (value !== 0 || chance !== 0) {
				hasAnyValues = true;

				const buffEntry: IBuff = {
					id: `proc:9:${stat}`,
					originalId: '9',
					sources,
					effectDelay,
					duration: params.turnDuration,
					value: { value, chance },
					...targetData,
				};

				if (params.element !== BuffConditionElement.All) {
					buffEntry.conditions = {
						targetElements: [params.element],
					};
				}
				results.push(buffEntry);
			}
		});

		if (!hasAnyValues && isTurnDurationBuff(context, params.turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '9',
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:9:${statKey}`),
				duration: params.turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '9',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('10', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const curedAilments: Ailment[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const splitParams = splitEffectParams(effect);
			const knownParams = splitParams.slice(0, 8);
			const extraParams = splitParams.slice(8);

			knownParams
				.filter((p) => p !== '0')
				.forEach((param) => {
					curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
				});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			Object.values(AILMENT_MAPPING).forEach((ailment) => {
				if (`remove ${ailment}` in effect) { // mainly for items
					curedAilments.push(ailment);
				}
			});

			if ('remove all status ailments' in effect) {
				curedAilments.push(Ailment.Unknown); // generic value for skills; unknown at a glance which ailments are cured
			}
		}

		const results: IBuff[] = curedAilments.map((ailment) => ({
			id: `proc:10:${ailment}`,
			originalId: '10',
			sources,
			effectDelay,
			value: true,
			...targetData,
		}));

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '10',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('11', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		interface IAilmentInflictionPair {
			ailment: Ailment;
			chance: number;
		}
		const inflictedAilments: IAilmentInflictionPair[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let params = splitEffectParams(effect);
			if (params.length % 2 !== 0 && params[params.length - 1] !== '0') {
				unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(-1), params.length - 1, injectionContext);
				params = params.slice(0, params.length - 1);
			}

			const numParams = params.length;
			for (let index = 0; index < numParams; index += 2) {
				const ailmentValue = params[index];
				const chance = parseNumberOrDefault(params[index + 1]);
				if (ailmentValue !== '0' || chance !== 0) {
					const ailmentType = AILMENT_MAPPING[ailmentValue] || Ailment.Unknown;
					inflictedAilments.push({
						ailment: ailmentType,
						chance,
					});
				}
			}
		} else {
			Object.values(AILMENT_MAPPING).forEach((ailment) => {
				let effectKey: string;
				if (ailment === Ailment.Weak) {
					effectKey = 'weaken%';
				} else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
					effectKey = ailment;
				} else {
					effectKey = `${ailment}%`;
				}

				if (effectKey in effect) {
					inflictedAilments.push({
						ailment,
						chance: parseNumberOrDefault(effect[effectKey] as number),
					});
				}
			});
		}

		const results: IBuff[] = inflictedAilments.map(({ ailment, chance }) => ({
			id: `proc:11:${ailment}`,
			originalId: '11',
			sources,
			effectDelay,
			value: chance,
			...targetData,
		}));

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '11',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('12', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let reviveToHp = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawReviveToHp, ...extraParams] = splitEffectParams(effect);
			reviveToHp = parseNumberOrDefault(rawReviveToHp);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			reviveToHp = parseNumberOrDefault(effect['revive to hp%']);
		}

		const results: IBuff[] = [{
			id: 'proc:12',
			originalId: '12',
			sources,
			effectDelay,
			value: reviveToHp,
			...targetData,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '12',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('13', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let hits = 0;
		const { distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawHits: string;
			[params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], rawHits, ...extraParams] = splitEffectParams(effect);
			hits = parseNumberOrDefault(rawHits);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			hits = parseNumberOrDefault(effect.hits as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [{
			id: 'proc:13',
			originalId: '13',
			sources,
			effectDelay,
			value: {
				...filteredValue,
				hits,
				distribution,
			},
			targetType: targetData.targetType,
			targetArea: TargetArea.Random,
		}];

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '13',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('14', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
			'drainLow%': '0',
			'drainHigh%': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			[params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], params['drainLow%'], params['drainHigh%'], ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			params['dmg%'] = (effect['bb dmg%'] as number);
			params['drainLow%'] = (effect['hp drain% low'] as number);
			params['drainHigh%'] = (effect['hp drain% high'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [{
			id: 'proc:14',
			originalId: '14',
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
				originalId: '14',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('16', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let mitigation = 0;
		let element: UnitElement | BuffConditionElement;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawElement, rawMitigation, rawTurnDuration, ...extraParams] = splitEffectParams(effect);

			element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
			mitigation = parseNumberOrDefault(rawMitigation);
			turnDuration = parseNumberOrDefault(rawTurnDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			const mitigationKey = Object.keys(effect).find((k) => k.startsWith('mitigate'));
			element = (mitigationKey && Object.values(ELEMENT_MAPPING).find((e) => mitigationKey.includes(e))) || BuffConditionElement.Unknown;
			if (mitigationKey) {
				mitigation = parseNumberOrDefault(effect[mitigationKey] as number);
			}

			turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = [];
		if (mitigation !== 0) {
			results.push({
				id: `proc:16:${element}`,
				originalId: '16',
				sources,
				effectDelay,
				duration: turnDuration,
				value: mitigation,
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '16',
				sources,
				buffs: Object.values(ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:16:${e}`),
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '16',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('17', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
		const resistances: { [ailment: string]: AlphaNumeric } = {
			poison: '0',
			weak: '0',
			sick: '0',
			injury: '0',
			curse: '0',
			paralysis: '0',
		};
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let rawDuration: string, extraParams: string[];
			[resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, rawDuration, ...extraParams] = splitEffectParams(effect);
			turnDuration = parseNumberOrDefault(rawDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('resist'));
			AILMENTS_ORDER.forEach((ailment) => {
				const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
				if (correspondingKey) {
					resistances[ailment] = effect[correspondingKey] as number;
				}
			});
			turnDuration = parseNumberOrDefault(effect['resist status ails turns'] as number);
		}

		const results: IBuff[] = [];
		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(resistances[ailment]);
			if (value !== 0) {
				results.push({
					id: `proc:17:${ailment}`,
					originalId: '17',
					sources,
					effectDelay,
					value,
					duration: turnDuration,
					...targetData,
				});
			}
		});

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '17',
				sources,
				buffs: AILMENTS_ORDER.map((a) => `proc:17:${a}`),
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '17',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('18', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'dmg% reduction',
			effectTurnDurationKey: 'dmg% reduction turns (36)',
			buffId: 'proc:18',
			originalId: '18',
		});
	});

	map.set('19', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'increase bb gauge gradual',
			effectTurnDurationKey: 'increase bb gauge gradual turns (37)',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			buffId: 'proc:19',
			originalId: '19',
		});
	});

	map.set('20', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let fillLow = 0;
		let fillHigh = 0;
		let chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFillLow, rawFillHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			fillLow = parseNumberOrDefault(rawFillLow) / 100;
			fillHigh = parseNumberOrDefault(rawFillHigh) / 100;
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			fillLow = parseNumberOrDefault(effect['bc fill when attacked low'] as number);
			fillHigh = parseNumberOrDefault(effect['bc fill when attacked high'] as number);
			chance = parseNumberOrDefault(effect['bc fill when attacked%'] as number);
			turnDuration = parseNumberOrDefault(effect['bc fill when attacked turns (38)'] as number);
		}

		const hasAnyFillValues = fillLow !== 0 || fillHigh !== 0;
		const results: IBuff[] = [];
		if (hasAnyFillValues) {
			results.push({
				id: 'proc:20',
				originalId: '20',
				sources,
				effectDelay,
				duration: turnDuration,
				conditions: {
					whenAttacked: true,
				},
				value: {
					fillLow,
					fillHigh,
					chance,
				},
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '20',
				sources,
				buffs: ['proc:20'],
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '20',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('22', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'defense% ignore',
			effectTurnDurationKey: 'defense% ignore turns (39)',
			buffId: 'proc:22',
			originalId: '22',
		});
	});

	map.set('23', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let value = 0, turnDuration = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			value = parseNumberOrDefault(params[0]);
			turnDuration = parseNumberOrDefault(params[6]);

			const extraParams = ['0', ...params.slice(1, 6), '0', ...params.slice(7)];
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
		} else {
			value = parseNumberOrDefault(effect['spark dmg% buff (40)'] as number);
			turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'proc:23',
				originalId: '23',
				sources,
				effectDelay,
				duration: turnDuration,
				value,
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '23',
				sources,
				buffs: ['proc:23'],
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '23',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('24', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'hp' | 'unknown';
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec'];
		const coreStatPropertyMapping: { [key: string]: CoreStatProperty } = {
			1: 'atk',
			2: 'def',
			3: 'rec',
			4: 'hp',
		};
		const effectToCoreStatMapping = {
			attack: 'atk',
			defense: 'def',
			recovery: 'rec',
			hp: 'hp',
		};
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
		};
		let turnDuration = 0;
		let convertedStat: CoreStatProperty = 'unknown';

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawConvertedStat: string, rawTurnDuration: string;
			[rawConvertedStat, stats.atk, stats.def, stats.rec, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			convertedStat = coreStatPropertyMapping[rawConvertedStat] || 'unknown';
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			const rawConvertedStat = effect['converted attribute'] as string;
			if (rawConvertedStat in effectToCoreStatMapping) {
				convertedStat = effectToCoreStatMapping[rawConvertedStat as 'attack' | 'defense' | 'recovery' | 'hp'] as CoreStatProperty;
			} else {
				convertedStat = 'unknown';
			}

			const keys = Object.keys(effect);
			coreStatProperties.forEach((statType) => {
				const effectKey = keys.find((k) => k.startsWith(`${statType}% buff`));
				if (effectKey) {
					stats[statType as 'atk' | 'def' | 'rec'] = parseNumberOrDefault(effect[effectKey] as number);
				}
			});

			turnDuration = parseNumberOrDefault(effect['% converted turns'] as number);
		}

		const results: IBuff[] = [];
		coreStatProperties.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec']);
			if (value !== 0) {
				results.push({
					id: `proc:24:${stat}`,
					originalId: '24',
					sources,
					effectDelay,
					duration: turnDuration,
					value: {
						convertedStat,
						value,
					},
					...targetData,
				});
			}
		});

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '24',
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:24:${statKey}`),
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '24',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('26', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let hitIncreasePerHit = 0, extraHitDamage = 0, turnDuration = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			hitIncreasePerHit = parseNumberOrDefault(params[0]);
			extraHitDamage = parseNumberOrDefault(params[2]);
			turnDuration = parseNumberOrDefault(params[7]);

			const extraParams = ['0', params[1], '0', ...params.slice(3, 7), '0', ...params.slice(8)];
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
		} else {
			hitIncreasePerHit = parseNumberOrDefault(effect['hit increase/hit'] as number);
			extraHitDamage = parseNumberOrDefault(effect['extra hits dmg%'] as number);
			turnDuration = parseNumberOrDefault(effect['hit increase buff turns (50)'] as number);
		}

		const results: IBuff[] = [];
		if (hitIncreasePerHit !== 0 || extraHitDamage !== 0) {
			results.push({
				id: 'proc:26',
				originalId: '26',
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					hitIncreasePerHit,
					extraHitDamage,
				},
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId: '26',
				sources,
				buffs: ['proc:26'],
				duration: turnDuration,
				targetData,
			}));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '26',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('27', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'hpDamageLow%': '0',
			'hpDamageHigh%': '0',
			'hpDamageChance%': '0',
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
			[params['hpDamageLow%'], params['hpDamageHigh%'], params['hpDamageChance%'], params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
		} else {
			params['hpDamageLow%'] = (effect['hp% damage low'] as number);
			params['hpDamageHigh%'] = (effect['hp% damage high'] as number);
			params['hpDamageChance%'] = (effect['hp% damage chance%'] as number);
			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			params['dmg%'] = (effect['bb dmg%'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [{
			id: 'proc:27',
			originalId: '27',
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
				originalId: '27',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('28', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const { hits, distribution } = getAttackInformationFromContext(context);
		let value = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawValue, ...extraParams] = splitEffectParams(effect);
			value = parseNumberOrDefault(rawValue);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			value = parseNumberOrDefault(effect['fixed damage'] as number);
		}

		const results: IBuff[] = [{
			id: 'proc:28',
			originalId: '28',
			sources,
			effectDelay,
			value: {
				hits,
				distribution,
			},
			...targetData,
		}];

		if (value !== 0) {
			(results[0].value as { value: number }).value = value;
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '28',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});

	map.set('29', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};
		let attackElements: (UnitElement | BuffConditionElement)[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let element1: string, element2: string, element3: string;
			let extraParams: string[];
			[element1, element2, element3, params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			[element1, element2, element3].forEach((rawElement) => {
				if (rawElement !== '0') {
					attackElements.push(ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
				}

				unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
			});
		} else {
			if (Array.isArray(effect['bb elements'] as UnitElement[])) {
				attackElements = (effect['bb elements'] as UnitElement[]).slice();
			}

			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			params['dmg%'] = (effect['bb dmg%'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [{
			id: 'proc:29',
			originalId: '29',
			sources,
			effectDelay,
			value: {
				...filteredValue,
				hits,
				distribution,
			},
			...targetData,
		}];
		if (attackElements.length > 0) {
			(results[0].value as { elements: (UnitElement | BuffConditionElement)[] }).elements = attackElements;
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId: '29',
				sources,
				targetData,
				effectDelay,
			}));
		}

		return results;
	});
}
