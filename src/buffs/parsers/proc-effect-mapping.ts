import { ProcEffect, UnitElement, Ailment, TargetArea, TargetType } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, IGenericBuffValue, BuffId, BuffConditionElement, IBuffConditions } from './buff-types';
import { IProcBuffProcessingInjectionContext, getProcTargetData, createSourcesFromContext, parseNumberOrDefault, ITargetData, buffSourceIsBurstType, createUnknownParamsEntryFromExtraParams, createNoParamsEntry } from './_helpers';

/**
 * @description Type representing a function that can parse a proc effect into an array of buffs.
 * @param effect Effect to convert to {@link IBuff} format.
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
	const UNKNOWN_PROC_PARAM_EFFECT_KEY = 'unknown proc param';
	const ELEMENT_MAPPING: { [key: string]: UnitElement | BuffConditionElement } = {
		0: BuffConditionElement.All,
		1: UnitElement.Fire,
		2: UnitElement.Water,
		3: UnitElement.Earth,
		4: UnitElement.Thunder,
		5: UnitElement.Light,
		6: UnitElement.Dark,
	};

	const NON_ZERO_ELEMENT_MAPPING: { [key: string]: UnitElement | BuffConditionElement } = {
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
	type ProportionalMode = 'lost' | 'remaining' | 'unknown';

	// Disable rule as this function is only called once it's confirmed that `effect.params` exists
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const splitEffectParams = (effect: ProcEffect): string[] => effect.params!.split(',');

	const splitEffectWithUnknownProcParamsProperty = (effect: ProcEffect): string[] => {
		const rawParams: string = effect.params || (effect[UNKNOWN_PROC_PARAM_EFFECT_KEY] as string) || '';
		return splitEffectParams({ params: rawParams } as ProcEffect);
	};

	interface IBaseLocalParamsContext {
		originalId: string;
		sources: string[];
		targetData?: ITargetData;
	}

	interface IUnknownParamsContext extends IBaseLocalParamsContext {
		effectDelay: string;
		targetData: ITargetData;
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

	interface ITurnDurationContext extends IBaseLocalParamsContext {
		buffs: (string | BuffId)[];
		duration: number;
	}

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
			duration,
		},
		...targetData,
	});

	/**
	 * @description Common checks that are run for most effects after the params have been parsed
	 * into an array of {@link IBuff} but before said array is returned.
	 * @param results List of buffs from the given effect.
	 * @param unknownParams Any unknown parameters from the given effect.
	 * @param parsingContext Extra metadata extracted from the given effect.
	 * @returns {undefined} No value is returned, but it does update the `results` array.
	 */
	const handlePostParse = (
		results: IBuff[],
		unknownParams: IGenericBuffValue | undefined,
		{
			originalId,
			sources,
			targetData,
			effectDelay,
		}: IUnknownParamsContext,
	): void => {
		if (results.length === 0) {
			results.push(createNoParamsEntry({ originalId, sources }));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId,
				sources,
				targetData,
				effectDelay,
			}));
		}
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

	interface ITemplatedParsingFunctionContext {
		effect: ProcEffect;
		context: IEffectToBuffConversionContext,
		injectionContext?: IProcBuffProcessingInjectionContext;
		effectTurnDurationKey?: string;
		buffId: string;
		parseParamValue?: (rawValue: string) => number,
		originalId: string;
	}

	interface IProcWithSingleNumericalParameterAndTurnDurationContext extends ITemplatedParsingFunctionContext {
		effectValueKey?: string;
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
		} else if (effectValueKey && effectTurnDurationKey) {
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

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	};

	interface IProcWithNumericalValueRangeAndChanceAndTurnDurationContext extends ITemplatedParsingFunctionContext {
		effectKeyLow: string;
		effectKeyHigh: string;
		effectKeyChance: string;
		effectTurnDurationKey: string;

		buffKeyLow: string;
		buffKeyHigh: string;

		generateConditions?: () => IBuffConditions,
	}
	const parseProcWithNumericalValueRangeAndChanceAndTurnDuration = ({
		effect,
		context,
		injectionContext,
		originalId,
		buffId,
		effectKeyLow,
		effectKeyHigh,
		effectKeyChance,
		effectTurnDurationKey,
		buffKeyLow,
		buffKeyHigh,
		parseParamValue = (rawValue: string) => parseNumberOrDefault(rawValue),
		generateConditions,
	}: IProcWithNumericalValueRangeAndChanceAndTurnDurationContext): IBuff[] => {
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let valueLow = 0;
		let valueHigh = 0;
		let chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawValueLow, rawValueHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			valueLow = parseParamValue(rawValueLow);
			valueHigh = parseParamValue(rawValueHigh);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			valueLow = parseNumberOrDefault(effect[effectKeyLow] as number);
			valueHigh = parseNumberOrDefault(effect[effectKeyHigh] as number);
			chance = parseNumberOrDefault(effect[effectKeyChance] as number);
			turnDuration = parseNumberOrDefault(effect[effectTurnDurationKey] as number);
		}

		const hasAnyValues = valueLow !== 0 || valueHigh !== 0 || chance !== 0;
		const results: IBuff[] = [];
		if (hasAnyValues) {
			const entry: IBuff = {
				id: buffId,
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					[buffKeyLow]: valueLow,
					[buffKeyHigh]: valueHigh,
					chance,
				},
				...targetData,
			};
			if (generateConditions) {
				entry.conditions = generateConditions();
			}
			results.push(entry);
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: [buffId],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	};

	map.set('1', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '1';
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
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:1:attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('2', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '2';
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

		const results: IBuff[] = [];
		if (params.healHigh !== 0 || params.healLow !== 0) {
			results.push({
				id: 'proc:2:burst heal',
				originalId,
				sources,
				effectDelay,
				value: params,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('3', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '3';
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
				id: 'proc:3:gradual heal',
				originalId,
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
				originalId,
				sources,
				buffs: ['proc:3:gradual heal'],
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('4', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '4';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatFill = 0;
		let percentFill = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
			flatFill = parseNumberOrDefault(rawFlatFill) / 100;
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
				id: 'proc:4:bc fill-flat',
				originalId,
				sources,
				effectDelay,
				value: flatFill,
				...targetData,
			});
		}

		if (percentFill !== 0) {
			results.push({
				id: 'proc:4:bc fill-percent',
				originalId,
				sources,
				effectDelay,
				value: percentFill,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('5', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '5';
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
					const buffEntry: IBuff = {
						id: `proc:5:regular or elemental-${statKey}`,
						originalId,
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
				originalId,
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:5:regular or elemental-${statKey}`),
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('6', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '6';
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
						id: `proc:6:drop boost-${key}`,
						originalId,
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
				originalId,
				sources,
				buffs: dropRateProperties.map((key) => `proc:6:drop boost-${key}`),
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('7', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '7';
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
			id: 'proc:7:guaranteed ko resistance',
			originalId,
			sources,
			effectDelay,
			value: recoveredHpPercent,
			...targetData,
		}];

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('8', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '8';
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
				id: 'proc:8:max hp boost-flat',
				originalId,
				sources,
				effectDelay,
				value: flatHpBoost,
				...targetData,
			});
		}

		if (percentHpBoost !== 0) {
			results.push({
				id: 'proc:8:max hp boost-percent',
				originalId,
				sources,
				effectDelay,
				value: percentHpBoost,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('9', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '9';
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
					id: `proc:9:regular or elemental reduction-${stat}`,
					originalId,
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
				originalId,
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:9:regular or elemental reduction-${statKey}`),
				duration: params.turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('10', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '10';
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
			id: `proc:10:cleanse-${ailment}`,
			originalId,
			sources,
			effectDelay,
			value: true,
			...targetData,
		}));

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('11', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '11';
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
			id: `proc:11:chance inflict-${ailment}`,
			originalId,
			sources,
			effectDelay,
			value: chance,
			...targetData,
		}));

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('12', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '12';
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
			id: 'proc:12:guaranteed revive',
			originalId,
			sources,
			effectDelay,
			value: reviveToHp,
			...targetData,
		}];

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('13', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '13';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:13:random attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				targetType: targetData.targetType,
				targetArea: TargetArea.Random,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('14', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '14';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:14:hp absorb attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('16', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '16';
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
				id: `proc:16:mitigate-${element}`,
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: mitigation,
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: Object.values(ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:16:mitigate-${e}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('17', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '17';
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
					id: `proc:17:resist-${ailment}`,
					originalId,
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
				originalId,
				sources,
				buffs: AILMENTS_ORDER.map((a) => `proc:17:resist-${a}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('18', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'dmg% reduction',
			effectTurnDurationKey: 'dmg% reduction turns (36)',
			buffId: 'proc:18:mitigation',
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
			buffId: 'proc:19:gradual bc fill',
			originalId: '19',
		});
	});

	map.set('20', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
			effect,
			context,
			injectionContext,
			originalId: '20',
			buffId: 'proc:20:bc fill on hit',
			effectKeyLow: 'bc fill when attacked low',
			effectKeyHigh: 'bc fill when attacked high',
			effectKeyChance: 'bc fill when attacked%',
			effectTurnDurationKey: 'bc fill when attacked turns (38)',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			generateConditions: () => ({ whenAttacked: true }),
		});
	});

	map.set('22', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'defense% ignore',
			effectTurnDurationKey: 'defense% ignore turns (39)',
			buffId: 'proc:22:defense ignore',
			originalId: '22',
		});
	});

	map.set('23', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '23';
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
				id: 'proc:23:spark damage',
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
				buffs: ['proc:23:spark damage'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('24', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '24';
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
					stats[statType as 'atk' | 'def' | 'rec'] = (effect[effectKey] as number);
				}
			});

			turnDuration = parseNumberOrDefault(effect['% converted turns'] as number);
		}

		const results: IBuff[] = [];
		coreStatProperties.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec']);
			if (value !== 0) {
				results.push({
					id: `proc:24:converted-${stat}`,
					originalId,
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
				originalId,
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:24:converted-${statKey}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('26', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '26';
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
				id: 'proc:26:hit count boost',
				originalId,
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
				originalId,
				sources,
				buffs: ['proc:26:hit count boost'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('27', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '27';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:27:proportional attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('28', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '28';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || value !== 0) {
			const entry: IBuff = {
				id: 'proc:28:fixed attack',
				originalId,
				sources,
				effectDelay,
				value: {
					hits,
					distribution,
				},
				...targetData,
			};
			if (value !== 0) {
				(entry.value as { value: number }).value = value;
			}
			results.push(entry);
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('29', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '29';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || attackElements.length > 0 || Object.keys(filteredValue).length > 0) {
			const entry: IBuff = {
				id: 'proc:29:multi-element attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				...targetData,
			};
			if (attackElements.length > 0) {
				(entry.value as { elements: (UnitElement | BuffConditionElement)[] }).elements = attackElements;
			}
			results.push(entry);
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('30', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '30';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let elements: (UnitElement | BuffConditionElement)[] = [];
		let turnDuration = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			elements = params
				.slice(0, 6)
				.filter((p) => p !== '0')
				.map((p) => ELEMENT_MAPPING[p] || BuffConditionElement.Unknown);
			turnDuration = parseNumberOrDefault(params[6]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
		} else {
			if ('elements added' in effect) {
				if (Array.isArray(effect['elements added'] as (UnitElement | BuffConditionElement)[])) {
					elements = (effect['elements added'] as (UnitElement | BuffConditionElement)[]);
				} else {
					elements = [BuffConditionElement.Unknown];
				}
			}
			turnDuration = parseNumberOrDefault(effect['elements added turns'] as number);
		}

		const results: IBuff[] = [];
		const validElements = Object.values(ELEMENT_MAPPING).filter((e) => e !== BuffConditionElement.All);
		if (elements.length > 0) {
			elements.forEach((inputElement) => {
				const sanitizedElement = validElements.includes(inputElement) ? inputElement : BuffConditionElement.Unknown;
				results.push({
					id: `proc:30:add element-${sanitizedElement}`,
					originalId,
					sources,
					effectDelay,
					duration: turnDuration,
					value: true,
					...targetData,
				});
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: validElements.concat([BuffConditionElement.Unknown]).map((e) => `proc:30:add element-${e}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('31', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '31';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatFill = 0;
		let percentFill = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatFill, rawPercentFill, ...extraParams] = splitEffectParams(effect);
			flatFill = parseNumberOrDefault(rawFlatFill) / 100;
			percentFill = parseNumberOrDefault(rawPercentFill);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			if ('increase bb gauge' in effect) {
				flatFill = parseNumberOrDefault(effect['increase bb gauge'] as number);
			}
			// NOTE: Deathmax's datamine only recognizes one value. We think the second parameter is percent fill
			// due to it being tied to a Tilith skill (a unit who's known for BC filling skillsets)
		}

		const results: IBuff[] = [];
		if (flatFill !== 0) {
			results.push({
				id: 'proc:31:bc fill-flat',
				originalId,
				sources,
				effectDelay,
				value: flatFill,
				...targetData,
			});
		}

		if (percentFill !== 0) {
			results.push({
				id: 'proc:31:bc fill-percent',
				originalId,
				sources,
				effectDelay,
				value: percentFill,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('32', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '32';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let element: UnitElement | BuffConditionElement | undefined;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawElement, ...extraParams] = splitEffectParams(effect);
			if (rawElement && rawElement !== '0') {
				element = NON_ZERO_ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
			}

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			const effectElement = effect['set attack element attribute'] as string;
			if (effectElement) {
				const sanitizedElement = Object.values(NON_ZERO_ELEMENT_MAPPING).find((e) => effectElement === e);
				if (sanitizedElement && sanitizedElement !== BuffConditionElement.All) {
					element = sanitizedElement;
				} else {
					element = BuffConditionElement.Unknown;
				}
			}
		}

		const results: IBuff[] = [];
		if (element) {
			results.push({
				id: `proc:32:element shift-${element}`,
				originalId,
				sources,
				effectDelay,
				value: true,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('33', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '33';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let chance = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawValue, ...extraParams] = splitEffectParams(effect);
			chance = parseNumberOrDefault(rawValue);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			chance = parseNumberOrDefault(effect['clear buff chance%'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:33:buff wipe',
				originalId,
				sources,
				effectDelay,
				value: chance,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('34', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '34';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatDrainLow = 0, flatDrainHigh = 0;
		let percentDrainLow = 0, percentDrainHigh = 0;
		let chance = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatLow, rawFlatHigh, rawPercentLow, rawPercentHigh, rawChance, ...extraParams] = splitEffectParams(effect);
			flatDrainLow = parseNumberOrDefault(rawFlatLow) / 100;
			flatDrainHigh = parseNumberOrDefault(rawFlatHigh) / 100;
			percentDrainLow = parseNumberOrDefault(rawPercentLow);
			percentDrainHigh = parseNumberOrDefault(rawPercentHigh);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			flatDrainLow = parseNumberOrDefault(effect['base bb gauge reduction low'] as number);
			flatDrainHigh = parseNumberOrDefault(effect['base bb gauge reduction high'] as number);
			percentDrainLow = parseNumberOrDefault(effect['bb gauge% reduction low'] as number);
			percentDrainHigh = parseNumberOrDefault(effect['bb gauge% reduction high'] as number);
			chance = parseNumberOrDefault(effect['bb gauge reduction chance%'] as number);
		}

		const results: IBuff[] = [];
		if (flatDrainLow !== 0 || flatDrainHigh !== 0) {
			results.push({
				id: 'proc:34:bc drain-flat',
				originalId,
				sources,
				effectDelay,
				value: {
					drainLow: flatDrainLow,
					drainHigh: flatDrainHigh,
					chance,
				},
				...targetData,
			});
		}

		if (percentDrainLow !== 0 || percentDrainHigh !== 0) {
			results.push({
				id: 'proc:34:bc drain-percent',
				originalId,
				sources,
				effectDelay,
				value: {
					drainLow: percentDrainLow,
					drainHigh: percentDrainHigh,
					chance,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('36', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'invalidate LS chance%',
			effectTurnDurationKey: 'invalidate LS turns (60)',
			buffId: 'proc:36:ls lock',
			originalId: '36',
		});
	});

	map.set('37', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '37';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [summonGroup, summonId = '', rawPositionX, rawPositionY, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const positionX = parseNumberOrDefault(rawPositionX);
		const positionY = parseNumberOrDefault(rawPositionY);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);

		const results: IBuff[] = [];
		if (summonGroup || summonId) {
			results.push({
				id: 'proc:37:summon',
				originalId,
				sources,
				effectDelay,
				value: {
					summonGroup,
					summonId,
					positionX,
					positionY,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('38', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '38';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const curedAilments: Ailment[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const splitParams = splitEffectParams(effect);
			const knownParams = splitParams.slice(0, 9);
			const extraParams = splitParams.slice(9);

			knownParams
				.filter((p) => p !== '0')
				.forEach((param) => {
					curedAilments.push(AILMENT_MAPPING[param] || Ailment.Unknown);
				});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
		} else if (Array.isArray(effect['ailments cured'] as string[])) {
			const effectAilmentsCured = effect['ailments cured'] as string[];
			Object.values(AILMENT_MAPPING).forEach((ailment) => {
				const effectKey = ailment !== Ailment.Weak ? ailment : 'weaken';
				if (effectAilmentsCured.includes(effectKey)) {
					curedAilments.push(ailment);
				}
			});
			if (effectAilmentsCured.length > curedAilments.length) {
				const unknownAilmentCount = effectAilmentsCured.length - curedAilments.length;
				for (let i = 0; i < unknownAilmentCount; ++i) {
					curedAilments.push(Ailment.Unknown);
				}
			}
		}

		const results: IBuff[] = curedAilments.map((ailment) => ({
			id: `proc:38:cleanse-${ailment}`,
			originalId,
			sources,
			effectDelay,
			value: true,
			...targetData,
		}));

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('39', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '39';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const elements: (UnitElement | BuffConditionElement)[] = [];
		let mitigation = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			const rawElementsMitigated = params.slice(0, 6);
			mitigation = parseNumberOrDefault(params[6]);
			turnDuration = parseNumberOrDefault(params[7]);

			rawElementsMitigated.forEach((rawElement) => {
				if (rawElement !== '0') {
					elements.push(NON_ZERO_ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown);
				}
			});

			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
		} else {
			Object.values(NON_ZERO_ELEMENT_MAPPING).forEach((element) => {
				if (effect[`mitigate ${element} attacks`]) {
					elements.push(element);
				}
			});

			mitigation = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks'] as number);
			turnDuration = parseNumberOrDefault(effect['dmg% mitigation for elemental attacks buff turns'] as number);
		}

		const results: IBuff[] = [];
		if (elements.length > 0) {
			elements.forEach((element) => {
				results.push({
					id: `proc:39:mitigate-${element}`,
					originalId,
					sources,
					effectDelay,
					duration: turnDuration,
					value: mitigation,
					...targetData,
				});
			});
		} else if (mitigation !== 0) {
			results.push({
				id: 'proc:39:mitigate-unknown',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: mitigation,
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:39:mitigate-${e}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('40', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '40';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		interface IAilmentInflictionPair {
			ailment: Ailment;
			chance: number;
		}
		const inflictedAilments: IAilmentInflictionPair[] = [];
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			for (let index = 0; index < 8; index += 2) {
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

			turnDuration = parseNumberOrDefault(params[8]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(9), 9, injectionContext);
		} else {
			Object.values(AILMENT_MAPPING).forEach((ailment) => {
				let effectKey: string;
				if (ailment === Ailment.Weak) {
					effectKey = 'weaken% buff';
				} else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
					effectKey = `${ailment} buff`;
				} else {
					effectKey = `${ailment}% buff`;
				}

				if (effectKey in effect) {
					inflictedAilments.push({
						ailment,
						chance: parseNumberOrDefault(effect[effectKey] as number),
					});
				}

			});
			turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = inflictedAilments.map(({ ailment, chance }) => ({
			id: `proc:40:add ailment-${ailment}`,
			originalId,
			sources,
			effectDelay,
			duration: turnDuration,
			value: chance,
			...targetData,
		}));

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				duration: turnDuration,
				buffs: Object.values(AILMENT_MAPPING).concat([Ailment.Unknown]).map((a) => `proc:40:add ailment-${a}`),
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('42', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '42';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const { hits, distribution } = getAttackInformationFromContext(context);

		const [rawModLow, rawModHigh, rawFlatAtk, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const params: { [param: string]: AlphaNumeric } = {
			'atkLow%': rawModLow,
			'atkHigh%': rawModHigh,
			flatAtk: rawFlatAtk,
		};
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		let results: IBuff[];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results = [
				{
					id: 'proc:42:sacrificial attack',
					originalId,
					sources,
					effectDelay,
					value: {
						...filteredValue,
						hits,
						distribution,
					},
					...targetData,
				},
				{
					id: 'proc:42:instant death',
					originalId,
					sources,
					effectDelay,
					value: true,
					targetArea: TargetArea.Single,
					targetType: TargetType.Self,
				},
			];
		} else {
			results = [];
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('43', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '43';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let overdriveFill = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawOverdriveFill, ...extraParams] = splitEffectParams(effect);
			overdriveFill = parseNumberOrDefault(rawOverdriveFill);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			overdriveFill = parseNumberOrDefault(effect['increase od gauge%'] as number);
		}

		const results: IBuff[] = [];
		if (overdriveFill !== 0) {
			results.push({
				id: 'proc:43:burst od fill',
				originalId,
				sources,
				effectDelay,
				value: overdriveFill,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('44', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '44';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const damageParams: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			flatAtk: '0',
			'dmg%': '0',
		};
		let affectsElement = false, unitIndex = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawAffectsElement: string, rawUnitIndex: string, rawTurnDuration: string;
			[damageParams['atk%'], damageParams.flatAtk, damageParams['dmg%'], rawAffectsElement, rawUnitIndex, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			affectsElement = rawAffectsElement !== '1'; // NOTE: not sure about this value
			unitIndex = parseNumberOrDefault(rawUnitIndex);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			damageParams['atk%'] = (effect['dot atk%'] as number);
			damageParams.flatAtk = (effect['dot flat atk'] as number);
			damageParams['dmg%'] = (effect['dot dmg%'] as number);
			affectsElement = !!(effect['dot element affected']);
			unitIndex = parseNumberOrDefault(effect['dot unit index'] as number);
			turnDuration = parseNumberOrDefault(effect['dot turns (71)'] as number);
		}

		const filteredDamageParams = Object.entries(damageParams)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [];
		if (Object.keys(filteredDamageParams).length > 0) {
			results.push({
				id: 'proc:44:damage over time',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					...filteredDamageParams,
					affectsElement,
					unitIndex,
				},
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:44:damage over time'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('45', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '45';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let bb = 0, sbb = 0, ubb = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawBb, rawSbb, rawUbb, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			bb = parseNumberOrDefault(rawBb);
			sbb = parseNumberOrDefault(rawSbb);
			ubb = parseNumberOrDefault(rawUbb);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			bb = parseNumberOrDefault(effect['bb atk% buff'] as number);
			sbb = parseNumberOrDefault(effect['sbb atk% buff'] as number);
			ubb = parseNumberOrDefault(effect['ubb atk% buff'] as number);
			turnDuration = parseNumberOrDefault(effect['buff turns (72)'] as number);
		}

		const results: IBuff[] = [];
		if (bb !== 0) {
			results.push({
				id: 'proc:45:attack boost-bb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: bb,
				...targetData,
			});
		}

		if (sbb !== 0) {
			results.push({
				id: 'proc:45:attack boost-sbb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: sbb,
				...targetData,
			});
		}

		if (ubb !== 0) {
			results.push({
				id: 'proc:45:attack boost-ubb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: ubb,
				...targetData,
			});
		}

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['bb', 'sbb', 'ubb'].map((type) => `proc:45:attack boost-${type}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('46', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '46';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const { hits, distribution } = getAttackInformationFromContext(context);

		const [rawHpLow, rawHpHigh, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const hpLow = parseNumberOrDefault(rawHpLow);
		const hpHigh = parseNumberOrDefault(rawHpHigh);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (hpLow !== 0 || hpHigh !== 0 || hits !== 0 || distribution !== 0) {
			const entry: IBuff = {
				id: 'proc:46:non-lethal proportional attack',
				originalId,
				sources,
				effectDelay,
				value: {
					hits,
					distribution,
				},
				...targetData,
			};

			if (hpLow !== 0 || hpHigh !== 0) {
				entry.value = {
					'hpDamageLow%': hpLow,
					'hpDamageHigh%': hpHigh,
					hits,
					distribution,
				};
			}
			results.push(entry);
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('47', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '47';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'baseAtk%': '0',
			'maxAddedAtk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};
		let proportionalMode: ProportionalMode = 'unknown';

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawMaxAttackValue: string, rawProportionalMode: string;
			[params['baseAtk%'], rawMaxAttackValue, rawProportionalMode, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			params['maxAddedAtk%'] = parseNumberOrDefault(rawMaxAttackValue) - parseNumberOrDefault(params['baseAtk%']);
			proportionalMode = rawProportionalMode === '1' ? 'lost' : 'remaining';
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			params['baseAtk%'] = (effect['bb base atk%'] as number);
			params['maxAddedAtk%'] = (effect['bb added atk% based on hp'] as number);
			proportionalMode = (effect['bb added atk% proportional to hp'] as ProportionalMode) || 'unknown';
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:47:hp scaled attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					proportionalMode,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('48', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '48';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const { hits, distribution } = getAttackInformationFromContext(context);

		const [rawBasePercentHpLow, rawBasePercentHpHigh, rawCurrentPercentHpLow, rawCurrentPercentHpHigh, rawFixedDamage, rawChance, rawIsLethal, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const basePercentHpLow = parseNumberOrDefault(rawBasePercentHpLow);
		const basePercentHpHigh = parseNumberOrDefault(rawBasePercentHpHigh);
		const currentPercentHpLow = parseNumberOrDefault(rawCurrentPercentHpLow);
		const currentPercentHpHigh = parseNumberOrDefault(rawCurrentPercentHpHigh);
		const fixedDamage = parseNumberOrDefault(rawFixedDamage);
		const chance = parseNumberOrDefault(rawChance);
		const isLethal = rawIsLethal === '1';
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);

		/**
		 * Current assumption is that each set of parameters results in a separate attack
		 * due to no known skills having more than one of each variant.
		 */
		const results: IBuff[] = [];
		const createAttackOfType = (type: string, valueProperties: { [key: string]: number }): IBuff => ({
			id: `proc:48:piercing attack-${type}`,
			originalId,
			sources,
			effectDelay,
			value: {
				...valueProperties,
				isLethal,
				chance,
				hits,
				distribution,
			},
			...targetData,
		});
		if (basePercentHpLow !== 0 || basePercentHpHigh !== 0) {
			results.push(createAttackOfType('base', {
				'hpDamageLow%': basePercentHpLow,
				'hpDamageHigh%': basePercentHpHigh,
			}));
		}
		if (currentPercentHpLow !== 0 || currentPercentHpHigh !== 0) {
			results.push(createAttackOfType('current', {
				'hpDamageLow%': currentPercentHpLow,
				'hpDamageHigh%': currentPercentHpHigh,
			}));
		}
		if (fixedDamage !== 0) {
			results.push(createAttackOfType('fixed', {
				value: fixedDamage,
			}));
		}
		if (results.length === 0 && (hits !== 0 || distribution !== 0)) {
			results.push(createAttackOfType('unknown', {}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('49', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '49';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawChance, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const chance = parseNumberOrDefault(rawChance);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:49:chance instant death',
				originalId,
				sources,
				effectDelay,
				value: chance,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('50', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '50';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const [rawDamageLow, rawDamageHigh, rawChance, rawTurnDuration, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const reflectedDamageLow = parseNumberOrDefault(rawDamageLow);
		const reflectedDamageHigh = parseNumberOrDefault(rawDamageHigh);
		const chance = parseNumberOrDefault(rawChance);
		const turnDuration = parseNumberOrDefault(rawTurnDuration);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);

		const hasAnyRangeValues = reflectedDamageLow !== 0 || reflectedDamageHigh !== 0;
		const results: IBuff[] = [];
		if (hasAnyRangeValues) {
			results.push({
				id: 'proc:50:chance damage reflect',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					'reflectedDamageLow%': reflectedDamageLow,
					'reflectedDamageHigh%': reflectedDamageHigh,
					chance,
				},
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:50:chance damage reflect'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('51', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '51';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		interface IStatReductionInfo {
			type: Ailment;
			reductionValue: number;
			chance: number;
		}
		const inflictedReductions: IStatReductionInfo[] = [];
		let debuffTurnDuration = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			[
				{ type: Ailment.AttackReduction, reductionValue: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[3]) },
				{ type: Ailment.DefenseReduction, reductionValue: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[4]) },
				{ type: Ailment.RecoveryReduction, reductionValue: parseNumberOrDefault(params[2]), chance: parseNumberOrDefault(params[5]) },
			].forEach(({ type, reductionValue, chance }) => {
				if (reductionValue !== 0 || chance !== 0) {
					inflictedReductions.push({ type, reductionValue, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(params[6]);
			turnDuration = parseNumberOrDefault(params[7]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
		} else {
			[
				{ type: Ailment.AttackReduction, reductionValueKey: 'inflict atk% debuff (2)', chanceKey: 'inflict atk% debuff chance% (74)' },
				{ type: Ailment.DefenseReduction, reductionValueKey: 'inflict def% debuff (4)', chanceKey: 'inflict def% debuff chance% (75)' },
				{ type: Ailment.RecoveryReduction, reductionValueKey: 'inflict rec% debuff (6)', chanceKey: 'inflict rec% debuff chance% (76)' },
			].forEach(({ type, reductionValueKey, chanceKey }) => {
				const reductionValue = parseNumberOrDefault(effect[reductionValueKey] as number);
				const chance = parseNumberOrDefault(effect[chanceKey] as number);
				if (reductionValue !== 0 || chance !== 0) {
					inflictedReductions.push({ type, reductionValue, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(effect['stat% debuff turns']);
			turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = inflictedReductions.map(({ type, reductionValue, chance }) => ({
			id: `proc:51:add to attack-${type}`,
			originalId,
			sources,
			effectDelay,
			duration: turnDuration,
			value: {
				reductionValue,
				chance,
				debuffTurnDuration,
			},
			...targetData,
		}));

		if (results.length === 0 && (isTurnDurationBuff(context, turnDuration, injectionContext) || isTurnDurationBuff(context, debuffTurnDuration, injectionContext))) {
			// manually create turn duration buff to account for debuff turn duration
			results.push({
				id: BuffId.TURN_DURATION_MODIFICATION,
				originalId,
				sources,
				value: {
					buffs: [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction].map((a) => `proc:51:add to attack-${a}`),
					duration: turnDuration,
					debuffTurnDuration: debuffTurnDuration,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('52', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'bb gauge fill rate% buff',
			effectTurnDurationKey: 'buff turns (77)',
			buffId: 'proc:52:bc efficacy',
			originalId: '52',
		});
	});

	map.set('53', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '53';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
		const inflictionChances: { [ailment: string]: AlphaNumeric } = {
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
			[inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, rawDuration, ...extraParams] = splitEffectParams(effect);
			turnDuration = parseNumberOrDefault(rawDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('counter inflict'));
			AILMENTS_ORDER.forEach((ailment) => {
				const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
				if (correspondingKey) {
					inflictionChances[ailment] = effect[correspondingKey] as number;
				}
			});
			turnDuration = parseNumberOrDefault(effect['counter inflict ailment turns'] as number);
		}

		const results: IBuff[] = [];
		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(inflictionChances[ailment]);
			if (value !== 0) {
				results.push({
					id: `proc:53:inflict on hit-${ailment}`,
					originalId,
					sources,
					effectDelay,
					value,
					duration: turnDuration,
					conditions: { whenAttacked: true },
					...targetData,
				});
			}
		});

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: AILMENTS_ORDER.map((a) => `proc:53:inflict on hit-${a}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('54', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'crit multiplier%',
			effectTurnDurationKey: 'buff turns (84)',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) * 100,
			buffId: 'proc:54:critical damage boost',
			originalId: '54',
		});
	});

	map.set('55', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '55';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let elements: (UnitElement | BuffConditionElement)[];
		let damageBoost = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => NON_ZERO_ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			damageBoost = parseNumberOrDefault(params[6]) * 100;
			turnDuration = parseNumberOrDefault(params[7]);

			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
		} else {
			elements = Object.values(NON_ZERO_ELEMENT_MAPPING).filter((element) => !!effect[`${element} units do extra elemental weakness dmg`]);
			damageBoost = parseNumberOrDefault(effect['elemental weakness multiplier%'] as number);
			turnDuration = parseNumberOrDefault(effect['elemental weakness buff turns'] as number);
		}

		let results: IBuff[] = [];
		if (damageBoost !== 0) {
			results = elements.map((element) => ({
				id: `proc:55:elemental weakness damage-${element}`,
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: damageBoost,
				...targetData,
			}));

			if (results.length === 0) {
				results.push({
					id: 'proc:55:elemental weakness damage-unknown',
					originalId,
					sources,
					effectDelay,
					duration: turnDuration,
					value: damageBoost,
					...targetData,
				});
			}
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat([BuffConditionElement.Unknown]).map((e) => `proc:55:elemental weakness damage-${e}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('56', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '56';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let chance = 0, recoveredHpPercent = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawChance, rawRecoverHp, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			chance = parseNumberOrDefault(rawChance);
			recoveredHpPercent = parseNumberOrDefault(rawRecoverHp);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			chance = parseNumberOrDefault(effect['angel idol recover chance%'] as number);
			recoveredHpPercent= parseNumberOrDefault(effect['angel idol recover hp%'] as number);
			turnDuration = parseNumberOrDefault(effect['angel idol buff turns (91)'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:56:chance ko resistance',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: { 'recoveredHp%': recoveredHpPercent, chance },
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:56:chance ko resistance'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('57', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '57';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let bcBaseResist = 0, bcBuffResist = 0;
		let hcBaseResist = 0, hcBuffResist = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawBcBaseResist, rawBcBuffResist, rawHcBaseResist, rawHcBuffResist, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			bcBaseResist = parseNumberOrDefault(rawBcBaseResist);
			bcBuffResist = parseNumberOrDefault(rawBcBuffResist);
			hcBaseResist = parseNumberOrDefault(rawHcBaseResist);
			hcBuffResist = parseNumberOrDefault(rawHcBuffResist);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			// Deathmax's datamine doesn't parse HC drop resistance
			bcBaseResist = parseNumberOrDefault(effect['base bc drop% resist buff'] as number);
			bcBuffResist = parseNumberOrDefault(effect['buffed bc drop% resist buff'] as number);
			turnDuration = parseNumberOrDefault(effect['bc drop% resist buff turns (92)'] as number);
		}

		const results: IBuff[] = [];
		if (bcBaseResist !== 0) {
			results.push({
				id: 'proc:57:bc drop resistance-base',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: bcBaseResist,
				...targetData,
			});
		}

		if (bcBuffResist !== 0) {
			results.push({
				id: 'proc:57:bc drop resistance-buff',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: bcBuffResist,
				...targetData,
			});
		}

		if (hcBaseResist !== 0) {
			results.push({
				id: 'proc:57:hc drop resistance-base',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: hcBaseResist,
				...targetData,
			});
		}

		if (hcBuffResist !== 0) {
			results.push({
				id: 'proc:57:hc drop resistance-buff',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: hcBuffResist,
				...targetData,
			});
		}

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: [
					'proc:57:bc drop resistance-base',
					'proc:57:bc drop resistance-buff',
					'proc:57:hc drop resistance-base',
					'proc:57:hc drop resistance-buff',
				],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('58', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '58';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let damageIncrease = 0, chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			damageIncrease = parseNumberOrDefault(rawDamageIncrease);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			damageIncrease = parseNumberOrDefault(effect['spark dmg% received'] as number);
			chance = parseNumberOrDefault(effect['spark dmg received apply%'] as number);
			turnDuration = parseNumberOrDefault(effect['spark dmg received debuff turns (94)'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:58:spark vulnerability',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: { 'sparkDamage%': damageIncrease, chance },
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:58:spark vulnerability'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('59', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '59';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const [rawBb, rawSbb, rawUbb, rawTurnDuration, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const bb = parseNumberOrDefault(rawBb);
		const sbb = parseNumberOrDefault(rawSbb);
		const ubb = parseNumberOrDefault(rawUbb);
		const turnDuration = parseNumberOrDefault(rawTurnDuration);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);

		const results: IBuff[] = [];
		if (bb !== 0) {
			results.push({
				id: 'proc:59:attack reduction-bb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: bb,
				...targetData,
			});
		}

		if (sbb !== 0) {
			results.push({
				id: 'proc:59:attack reduction-sbb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: sbb,
				...targetData,
			});
		}

		if (ubb !== 0) {
			results.push({
				id: 'proc:59:attack reduction-ubb',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: ubb,
				...targetData,
			});
		}

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['bb', 'sbb', 'ubb'].map((type) => `proc:59:attack reduction-${type}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('61', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '61';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'baseAtk%': '0',
			'maxAddedAtk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			let rawMaxAttackValue: string;
			[params['baseAtk%'], rawMaxAttackValue, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			params['maxAddedAtk%'] = parseNumberOrDefault(rawMaxAttackValue);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			params['baseAtk%'] = (effect['bb base atk%'] as number);
			params['maxAddedAtk%'] = (effect['bb max atk% based on ally bb gauge and clear bb gauges'] as number);
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

		let results: IBuff[];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results = [
				{
					id: 'proc:61:party bb gauge-scaled attack',
					originalId,
					sources,
					effectDelay,
					value: {
						...filteredValue,
						hits,
						distribution,
					},
					...targetData,
				},
				{
					id: 'proc:61:party bc drain',
					originalId,
					sources,
					effectDelay,
					value: true,
					targetArea: TargetArea.Aoe,
					targetType: TargetType.Party,
				},
			];
		} else {
			results = [];
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('62', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '62';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let element: UnitElement | BuffConditionElement;
		let hp = 0, defense = 0, damageAbsorption = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawElement, rawHp, rawDefense, rawDamageAbsorption, ...extraParams] = splitEffectParams(effect);

			element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
			hp = parseNumberOrDefault(rawHp);
			defense = parseNumberOrDefault(rawDefense);
			damageAbsorption = parseNumberOrDefault(rawDamageAbsorption);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			const effectElement = effect['elemental barrier element'] as UnitElement;
			element = (effectElement && Object.values(ELEMENT_MAPPING).find((e) => e === effectElement)) || BuffConditionElement.Unknown;

			hp = parseNumberOrDefault(effect['elemental barrier hp'] as number);
			defense = parseNumberOrDefault(effect['elemental barrier def'] as number);
			damageAbsorption = parseNumberOrDefault(effect['elemental barrier absorb dmg%'] as number);
		}

		const results: IBuff[] = [];
		if (hp !== 0 || defense !== 0 || damageAbsorption !== 0) {
			results.push({
				id: `proc:62:barrier-${element}`,
				originalId,
				sources,
				effectDelay,
				value: {
					hp,
					defense,
					'damageAbsorption%': damageAbsorption,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('64', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '64';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			'addedAtkPerUse%': '0',
			maxIncreases: '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[];
			[params['atk%'], params['addedAtkPerUse%'], params.maxIncreases, params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			params['atk%'] = (effect['bb atk%'] as number);
			params['addedAtkPerUse%'] = (effect['bb atk% inc per use'] as number);
			params.maxIncreases = (effect['bb atk% max number of inc'] as number);
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:64:consecutive usage attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('65', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'atk% buff when enemy has ailment',
			effectTurnDurationKey: 'atk% buff turns (110)',
			buffId: 'proc:65:ailment attack boost',
			originalId: '65',
		});
	});

	map.set('66', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '66';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let recoveredHp = 0, chance = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawRecoveredHp, rawChance, ...extraParams] = splitEffectParams(effect);
			recoveredHp = parseNumberOrDefault(rawRecoveredHp);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			recoveredHp = parseNumberOrDefault(effect['revive unit hp%'] as number);
			chance = parseNumberOrDefault(effect['revive unit chance%'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:66:chance revive',
				originalId,
				sources,
				effectDelay,
				value: { 'reviveToHp%': recoveredHp, chance },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('67', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
			effect,
			context,
			injectionContext,
			originalId: '67',
			buffId: 'proc:67:bc fill on spark',
			effectKeyLow: 'bc fill on spark low',
			effectKeyHigh: 'bc fill on spark high',
			effectKeyChance: 'bc fill on spark%',
			effectTurnDurationKey: 'bc fill on spark buff turns (111)',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
		});
	});

	map.set('68', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'guard increase mitigation%',
			effectTurnDurationKey: 'guard increase mitigation buff turns (113)',
			buffId: 'proc:68:guard mitigation',
			originalId: '68',
		});
	});

	map.set('69', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '69';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatFill = 0;
		let percentFill = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatFill, rawPercentFill, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			flatFill = parseNumberOrDefault(rawFlatFill) / 100;
			percentFill = parseNumberOrDefault(rawPercentFill);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			if ('bb bc fill on guard' in effect) {
				flatFill = parseNumberOrDefault(effect['bb bc fill on guard'] as number);
			}
			if ('bb bc fill% on guard' in effect) {
				percentFill = parseNumberOrDefault(effect['bb bc fill% on guard'] as number);
			}

			turnDuration = parseNumberOrDefault(effect['bb bc fill on guard buff turns (114)']);
		}

		const results: IBuff[] = [];
		if (flatFill !== 0) {
			results.push({
				id: 'proc:69:bc fill on guard-flat',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: flatFill,
				conditions: {
					onGuard: true,
				},
				...targetData,
			});
		}

		if (percentFill !== 0) {
			results.push({
				id: 'proc:69:bc fill on guard-percent',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: percentFill,
				conditions: {
					onGuard: true,
				},
				...targetData,
			});
		}

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:69:bc fill on guard-flat', 'proc:69:bc fill on guard-percent'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('71', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'bb fill inc%',
			effectTurnDurationKey: 'bb fill inc buff turns (112)',
			buffId: 'proc:71:bc efficacy reduction',
			originalId: '71',
		});
	});

	map.set('73', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '73';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const AILMENTS_ORDER = [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
		const resistances: { [ailment: string]: AlphaNumeric } = {
			[Ailment.AttackReduction]: '0',
			[Ailment.DefenseReduction]: '0',
			[Ailment.RecoveryReduction]: '0',
		};
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let rawDuration: string, extraParams: string[];
			[resistances[Ailment.AttackReduction], resistances[Ailment.DefenseReduction], resistances[Ailment.RecoveryReduction], rawDuration, ...extraParams] = splitEffectParams(effect);
			turnDuration = parseNumberOrDefault(rawDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.includes('resist%'));
			AILMENTS_ORDER.forEach((ailment) => {
				const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
				if (correspondingKey) {
					resistances[ailment] = effect[correspondingKey] as number;
				}
			});
			turnDuration = parseNumberOrDefault(effect['stat down immunity buff turns'] as number);
		}

		const results: IBuff[] = [];
		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(resistances[ailment]);
			if (value !== 0) {
				results.push({
					id: `proc:73:resist-${ailment}`,
					originalId,
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
				originalId,
				sources,
				buffs: AILMENTS_ORDER.map((a) => `proc:73:resist-${a}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('75', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '75';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'baseAtk%': '0',
			'addedAttackPerUnitWithMatchingElement%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};
		let element: UnitElement | BuffConditionElement;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[], rawElement: string;
			[rawElement, params['baseAtk%'], params['addedAttackPerUnitWithMatchingElement%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
			element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			// in Deathmax's datamine, this proc is incorrectly parsed as a tri-stat buff
			const effectElement = effect['counted element for buff multiplier'] as string;
			if (!effectElement) {
				element = BuffConditionElement.Unknown;
			} else {
				element = effectElement as UnitElement;
			}
			params['baseAtk%'] = (effect['atk% buff (1)'] as number);
			params['addedAttackPerUnitWithMatchingElement%'] = (effect['def% buff (3)'] as number);
			params.flatAtk = (effect['rec% buff (5)'] as number);
			params['crit%'] = (effect['crit% buff (7)'] as number);
			params['bc%'] = (effect['buff turns'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([, value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = parseNumberOrDefault(value);
				return acc;
			}, {});

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:75:element squad-scaled attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					elementToMatch: element,
					hits,
					distribution,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('76', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '76';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let maxExtraActions = 0, chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawMaxExtraActions, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			maxExtraActions = parseNumberOrDefault(rawMaxExtraActions);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			maxExtraActions = parseNumberOrDefault(effect['max number of extra actions'] as number);
			chance = parseNumberOrDefault(effect['chance% for extra action'] as number);
			turnDuration = parseNumberOrDefault(effect['extra action buff turns (123)'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:76:extra action',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: { maxExtraActions, chance },
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:76:extra action'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('78', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '78';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const params = {
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
			[params.atk, params.def, params.rec, params.crit, params.turnDuration, ...extraParams] = splitEffectParams(effect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			coreStatProperties.forEach((statType) => {
				const effectKey = `self ${statType}% buff`;
				if (effectKey in effect) {
					params[statType] = effect[effectKey] as number;
				}
			});

			params.turnDuration = effect['self stat buff turns'] as number;
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
						id: `proc:78:self stat boost-${statKey}`,
						originalId,
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
				originalId,
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:78:self stat boost-${statKey}`),
				duration: params.turnDuration as number,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('79', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '79';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawExpBoost, rawDurationInMinutes = '', ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const expBoost = parseNumberOrDefault(rawExpBoost);
		const durationInMinutes = parseNumberOrDefault(rawDurationInMinutes);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (expBoost !== 0) {
			results.push({
				id: 'proc:79:player exp boost',
				originalId,
				sources,
				effectDelay,
				value: { 'expBoost%': expBoost, durationInMinutes },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('82', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '82';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [summonGroup, rawPercentHp, ...extraParams] = splitEffectWithUnknownProcParamsProperty(effect);
		const percentHp = parseNumberOrDefault(rawPercentHp);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (summonGroup) {
			results.push({
				id: 'proc:82:resummon',
				originalId,
				sources,
				effectDelay,
				value: {
					summonGroup,
					'startingHp%': percentHp,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('83', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '83';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let chance = 0, sparkDamage = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawChance, rawSparkDamage, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			chance = parseNumberOrDefault(rawChance);
			sparkDamage = parseNumberOrDefault(rawSparkDamage);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			chance = parseNumberOrDefault(effect['spark dmg inc chance%'] as number);
			sparkDamage = parseNumberOrDefault(effect['spark dmg inc% buff'] as number);
			turnDuration = parseNumberOrDefault(effect['spark dmg inc buff turns (131)'] as number);
		}

		const results: IBuff[] = [];
		if (sparkDamage !== 0 || chance !== 0) {
			results.push({
				id: 'proc:83:spark critical',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: { 'sparkDamage%': sparkDamage, chance },
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:83:spark critical'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('84', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			effectValueKey: 'od fill rate% buff',
			effectTurnDurationKey: 'od fill rate buff turns (132)',
			buffId: 'proc:84:od fill rate',
			originalId: '84',
		});
	});

	map.set('85', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
			effect,
			context,
			injectionContext,
			originalId: '85',
			buffId: 'proc:85:heal on hit',
			effectKeyLow: 'hp recover from dmg% low',
			effectKeyHigh: 'hp recover from dmg% high',
			effectKeyChance: 'hp recover from dmg chance',
			effectTurnDurationKey: 'hp recover from dmg buff turns (133)',
			buffKeyLow: 'healLow',
			buffKeyHigh: 'healHigh',
			generateConditions: () => ({ whenAttacked: true }),
		});
	});

	map.set('86', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
			effect,
			context,
			injectionContext,
			originalId: '86',
			buffId: 'proc:86:hp absorb',
			effectKeyLow: 'hp drain% low',
			effectKeyHigh: 'hp drain% high',
			effectKeyChance: 'hp drain chance%',
			effectTurnDurationKey: 'hp drain buff turns (134)',
			buffKeyLow: 'drainHealLow%',
			buffKeyHigh: 'drainHealHigh%',
		});
	});

	map.set('87', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithNumericalValueRangeAndChanceAndTurnDuration({
			effect,
			context,
			injectionContext,
			originalId: '87',
			buffId: 'proc:87:heal on spark',
			effectKeyLow: 'spark recover hp low',
			effectKeyHigh: 'spark recover hp high',
			effectKeyChance: 'spark recover hp chance%',
			effectTurnDurationKey: 'spark recover hp buff turns (135)',
			buffKeyLow: 'healLow',
			buffKeyHigh: 'healHigh',
		});
	});

	map.set('88', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '88';
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
			value = parseNumberOrDefault(effect['spark dmg inc%'] as number);
			turnDuration = parseNumberOrDefault(effect['spark dmg inc% turns (136)'] as number);
		}

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'proc:88:self spark damage',
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
				buffs: ['proc:88:self spark damage'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('89', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '89';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'hp' | 'unknown';
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec'];
		const coreStatPropertyMapping: { [key: string]: CoreStatProperty } = {
			1: 'atk',
			2: 'def',
			3: 'rec',
			4: 'hp',
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
		}
		const results: IBuff[] = [];
		coreStatProperties.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec']);
			if (value !== 0) {
				results.push({
					id: `proc:89:self converted-${stat}`,
					originalId,
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
				originalId,
				sources,
				buffs: coreStatProperties.map((statKey) => `proc:89:self converted-${statKey}`),
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('92', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '92';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatHpBoost = 0;
		let percentHpBoost = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlatBoost, rawPercentBoost, ...extraParams] = splitEffectParams(effect);
			flatHpBoost = parseNumberOrDefault(rawFlatBoost);
			percentHpBoost = parseNumberOrDefault(rawPercentBoost);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		}

		const results: IBuff[] = [];
		if (flatHpBoost !== 0) {
			results.push({
				id: 'proc:92:self max hp boost-flat',
				originalId,
				sources,
				effectDelay,
				value: flatHpBoost,
				...targetData,
			});
		}

		if (percentHpBoost !== 0) {
			results.push({
				id: 'proc:92:self max hp boost-percent',
				originalId,
				sources,
				effectDelay,
				value: percentHpBoost,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('93', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '93';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		enum ResistType {
			CriticalDamage = 'critical damage',
			ElementDamage = 'element damage',
			SparkDamage = 'spark damage',
		}
		interface IResistanceInfo {
			resistType: ResistType;
			base: number;
			buff: number;
		}
		const resistances: IResistanceInfo[] = [];
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawBaseCritDamageResist, rawBuffCritDamageResist, rawBaseElementDamageResist, rawBuffElementDamageResist, rawBaseSparkDamageResist, rawBuffSparkDamageResist, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			[
				{ resistType: ResistType.CriticalDamage, base: parseNumberOrDefault(rawBaseCritDamageResist), buff: parseNumberOrDefault(rawBuffCritDamageResist) },
				{ resistType: ResistType.ElementDamage, base: parseNumberOrDefault(rawBaseElementDamageResist), buff: parseNumberOrDefault(rawBuffElementDamageResist) },
				{ resistType: ResistType.SparkDamage, base: parseNumberOrDefault(rawBaseSparkDamageResist), buff: parseNumberOrDefault(rawBuffSparkDamageResist) },
			].forEach(({ resistType, base, buff }) => {
				if (base !== 0 || buff !== 0) {
					resistances.push({ resistType, base, buff });
				}
			});
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			[
				{ resistType: ResistType.CriticalDamage, baseKey: 'crit dmg base damage resist% (143)', buffKey: 'crit dmg buffed damage resist% (143)' },
				{ resistType: ResistType.ElementDamage, baseKey: 'strong base element damage resist% (144)', buffKey: 'strong buffed element damage resist% (144)' },
				{ resistType: ResistType.SparkDamage, baseKey: 'spark dmg base resist% (145)', buffKey: 'spark dmg buffed resist% (145)' },
			].forEach(({ resistType, baseKey, buffKey }) => {
				const base = parseNumberOrDefault(effect[baseKey] as number);
				const buff = parseNumberOrDefault(effect[buffKey] as number);
				if (base !== 0 || buff !== 0) {
					resistances.push({ resistType, base, buff });
				}
			});
			turnDuration = parseNumberOrDefault(effect['dmg resist turns'] as number);
		}

		const results: IBuff[] = [];
		resistances.forEach(({ resistType, base, buff }) => {
			if (base !== 0) {
				results.push({
					id: `proc:93:${resistType} resistance-base`,
					originalId,
					sources,
					effectDelay,
					duration: turnDuration,
					value: base,
					...targetData,
				});
			}

			if (buff !== 0) {
				results.push({
					id: `proc:93:${resistType} resistance-buff`,
					originalId,
					sources,
					effectDelay,
					duration: turnDuration,
					value: buff,
					...targetData,
				});
			}
		});

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			const buffs: string[] = [];
			[ResistType.CriticalDamage, ResistType.ElementDamage, ResistType.SparkDamage].forEach((resistType) => {
				buffs.push(
					`proc:93:${resistType} resistance-base`,
					`proc:93:${resistType} resistance-buff`,
				);
			});
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs,
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('94', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '94';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let damageIncrease = 0, chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			damageIncrease = parseNumberOrDefault(rawDamageIncrease);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			damageIncrease = parseNumberOrDefault(effect['aoe atk inc%'] as number);
			chance = parseNumberOrDefault(effect['chance to aoe'] as number);
			turnDuration = parseNumberOrDefault(effect['aoe atk turns (142)'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'proc:94:aoe normal attack',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: { 'damageModifier%': damageIncrease, chance },
				...targetData,
			});
		} else if (isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:94:aoe normal attack'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('95', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			buffId: 'proc:95:sphere lock',
			originalId: '95',
		});
	});

	map.set('96', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			buffId: 'proc:96:es lock',
			originalId: '96',
		});
	});

	map.set('97', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '97';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		/**
		 * @desc Mapping of a given element to the element that is weak to it. For example, given a key of
		 * `fire`, the corresponding value is `earth` because `earth` units are weak to (i.e. take extra
		 * damage from) `fire` attacks.
		 */
		const weakerElementMapping = {
			[UnitElement.Fire]: UnitElement.Earth,
			[UnitElement.Water]: UnitElement.Fire,
			[UnitElement.Earth]: UnitElement.Thunder,
			[UnitElement.Thunder]: UnitElement.Water,
			[UnitElement.Light]: UnitElement.Dark,
			[UnitElement.Dark]: UnitElement.Light,
		};

		const getOpposingWeakerElement = (inputElement?: UnitElement): UnitElement | BuffConditionElement => {
			return (inputElement && Object.hasOwnProperty.call(weakerElementMapping, inputElement))
				? weakerElementMapping[inputElement]
				: BuffConditionElement.Unknown;
		};

		const { hits, distribution } = getAttackInformationFromContext(context);
		const params: { [param: string]: AlphaNumeric } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};
		const targetElements: (UnitElement | BuffConditionElement)[] = [getOpposingWeakerElement(context.sourceElement)];

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			let extraParams: string[], rawTargetElementsParam: string;
			[rawTargetElementsParam, params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%'], ...extraParams] = splitEffectParams(effect);
			if (rawTargetElementsParam && rawTargetElementsParam !== '0') {
				targetElements.push(getOpposingWeakerElement(ELEMENT_MAPPING[rawTargetElementsParam] as UnitElement));
			}

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			// in Deathmax's datamine, this proc is incorrectly parsed as a tri-stat buff
			const extraTargetElement = effect['additional element used for attack check'] as string;
			if (extraTargetElement && extraTargetElement !== 'self only') {
				targetElements.push(getOpposingWeakerElement(extraTargetElement as UnitElement));
			} else if (!extraTargetElement) {
				targetElements.push(BuffConditionElement.Unknown);
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

		const results: IBuff[] = [];
		if (hits !== 0 || distribution !== 0 || Object.keys(filteredValue).length > 0) {
			results.push({
				id: 'proc:97:element specific attack',
				originalId,
				sources,
				effectDelay,
				value: {
					...filteredValue,
					hits,
					distribution,
				},
				conditions: { targetElements },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('113', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '113';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let value = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			value = parseNumberOrDefault(params[2]);
			turnDuration = parseNumberOrDefault(params[3]);

			unknownParams = createUnknownParamsEntryFromExtraParams([params[0], params[1], '0', '0'].concat(params.slice(4)), 0, injectionContext);
		} else {
			value = parseNumberOrDefault(effect['od fill'] as number);
			turnDuration = parseNumberOrDefault(effect['od fill turns (148)'] as number);
		}

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'proc:113:gradual od fill',
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
				buffs: ['proc:113:gradual od fill'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('119', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '119';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		let flatDrain = 0,  percentDrain = 0;
		let chance = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawFlat, rawPercent, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			flatDrain = parseNumberOrDefault(rawFlat) / 100;
			percentDrain = parseNumberOrDefault(rawPercent);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		}

		const results: IBuff[] = [];
		if (flatDrain !== 0) {
			results.push({
				id: 'proc:119:gradual bc drain-flat',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					drain: flatDrain,
					chance,
				},
				...targetData,
			});
		}

		if (percentDrain !== 0) {
			results.push({
				id: 'proc:119:gradual bc drain-percent',
				originalId,
				sources,
				effectDelay,
				duration: turnDuration,
				value: {
					'drain%': percentDrain,
					chance,
				},
				...targetData,
			});
		}

		if (results.length === 0 && isTurnDurationBuff(context, turnDuration, injectionContext)) {
			results.push(createTurnDurationEntry({
				originalId,
				sources,
				buffs: ['proc:119:gradual bc drain-flat', 'proc:119:gradual bc drain-percent'],
				duration: turnDuration,
				targetData,
			}));
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('123', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '123';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let drainPercent = 0, chance = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawChance, unknownSecondParam, rawDrainPercent, ...extraParams] = splitEffectParams(effect);
			drainPercent = parseNumberOrDefault(rawDrainPercent);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams([unknownSecondParam, '0'].concat(extraParams), 1, injectionContext);
		}
		const results: IBuff[] = [];
		if (chance !== 0 || drainPercent !== 0) {
			results.push({
				id: 'proc:123:od gauge drain',
				originalId,
				sources,
				effectDelay,
				value: { 'drain%': drainPercent, chance },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('126', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			buffId: 'proc:126:damage over time reduction',
			originalId: '126',
		});
	});

	map.set('127', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '127';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const [rawTurnDuration, ...extraParams] = splitEffectParams(effect);
			turnDuration = parseNumberOrDefault(rawTurnDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		}

		const results: IBuff[] = [{
			id: 'proc:127:lock on',
			originalId,
			sources,
			effectDelay,
			duration: turnDuration,
			value: true,
			...targetData,
		}];

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('130', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '130';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		interface IStatReductionInfo {
			type: Ailment;
			reductionValue: number;
			chance: number;
		}
		const inflictedReductions: IStatReductionInfo[] = [];
		let debuffTurnDuration = 0, turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			[
				{ type: Ailment.AttackReduction, reductionValue: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[3]) },
				{ type: Ailment.DefenseReduction, reductionValue: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[4]) },
				{ type: Ailment.RecoveryReduction, reductionValue: parseNumberOrDefault(params[2]), chance: parseNumberOrDefault(params[5]) },
			].forEach(({ type, reductionValue, chance }) => {
				if (reductionValue !== 0 || chance !== 0) {
					inflictedReductions.push({ type, reductionValue, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(params[6]);
			turnDuration = parseNumberOrDefault(params[7]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
		} else {
			[
				{ type: Ailment.AttackReduction, reductionValueKey: 'atk% buff (153)', chanceKey: 'atk buff chance%' },
				{ type: Ailment.DefenseReduction, reductionValueKey: 'def% buff (154)', chanceKey: 'def buff chance%' },
				{ type: Ailment.RecoveryReduction, reductionValueKey: 'rec% buff (155)', chanceKey: 'rec buff chance%' },
			].forEach(({ type, reductionValueKey, chanceKey }) => {
				const reductionValue = parseNumberOrDefault(effect[reductionValueKey] as number);
				const chance = parseNumberOrDefault(effect[chanceKey] as number);
				if (reductionValue !== 0 || chance !== 0) {
					inflictedReductions.push({ type, reductionValue, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(effect['debuff turns']);
			turnDuration = parseNumberOrDefault(effect['buff turns'] as number);
		}

		const results: IBuff[] = inflictedReductions.map(({ type, reductionValue, chance }) => ({
			id: `proc:130:inflict on hit-${type}`,
			originalId,
			sources,
			effectDelay,
			duration: turnDuration,
			value: {
				reductionValue,
				chance,
				debuffTurnDuration,
			},
			...targetData,
		}));

		if (results.length === 0 && (isTurnDurationBuff(context, turnDuration, injectionContext) || isTurnDurationBuff(context, debuffTurnDuration, injectionContext))) {
			// manually create turn duration buff to account for debuff turn duration
			results.push({
				id: BuffId.TURN_DURATION_MODIFICATION,
				originalId,
				sources,
				value: {
					buffs: [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction].map((a) => `proc:130:inflict on hit-${a}`),
					duration: turnDuration,
					debuffTurnDuration: debuffTurnDuration,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});

	map.set('131', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		return parseProcWithSingleNumericalParameterAndTurnDuration({
			effect,
			context,
			injectionContext,
			buffId: 'proc:131:spark damage mitigation',
			originalId: '131',
		});
	});

	map.set('132', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '132';
		const { targetData, sources, effectDelay } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		enum VulnerabilityType {
			Critical = 'critical',
			Elemental = 'elemental',
		}
		interface IVulnerabilityInfo {
			type: VulnerabilityType;
			value: number;
			chance: number;
		}
		const inflictedReductions: IVulnerabilityInfo[] = [];
		let debuffTurnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (effect.params) {
			const params = splitEffectParams(effect);
			[
				{ type: VulnerabilityType.Critical, value: parseNumberOrDefault(params[0]), chance: parseNumberOrDefault(params[2]) },
				{ type: VulnerabilityType.Elemental, value: parseNumberOrDefault(params[1]), chance: parseNumberOrDefault(params[3]) },
			].forEach(({ type, value, chance }) => {
				if (value !== 0 || chance !== 0) {
					inflictedReductions.push({ type, value, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(params[4]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(5), 5, injectionContext);
		} else {
			[
				{ type: VulnerabilityType.Critical, valueKey: 'crit vuln dmg% (157)', chanceKey: 'crit vuln chance%' },
				{ type: VulnerabilityType.Elemental, valueKey: 'elemental vuln dmg% (158)', chanceKey: 'elemental vuln chance%' },
			].forEach(({ type, valueKey, chanceKey }) => {
				const value = parseNumberOrDefault(effect[valueKey] as number);
				const chance = parseNumberOrDefault(effect[chanceKey] as number);
				if (value !== 0 || chance !== 0) {
					inflictedReductions.push({ type, value, chance });
				}
			});

			debuffTurnDuration = parseNumberOrDefault(effect['vuln turns']);
		}

		const results: IBuff[] = inflictedReductions.map(({ type, value, chance }) => ({
			id: `proc:132:chance inflict vulnerability-${type}`,
			originalId,
			sources,
			effectDelay,
			duration: debuffTurnDuration,
			value: {
				'increased dmg%': value,
				chance,
			},
			...targetData,
		}));

		if (results.length === 0 && isTurnDurationBuff(context, debuffTurnDuration, injectionContext)) {
			// manually create turn duration buff to account for debuff turn duration
			results.push({
				id: BuffId.TURN_DURATION_MODIFICATION,
				originalId,
				sources,
				value: {
					buffs: [VulnerabilityType.Critical, VulnerabilityType.Elemental].map((v) => `proc:132:chance inflict vulnerability-${v}`),
					duration: debuffTurnDuration,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			effectDelay,
		});

		return results;
	});
}
