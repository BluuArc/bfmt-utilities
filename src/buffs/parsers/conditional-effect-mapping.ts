import { IEffectToBuffConversionContext, IBuff, IGenericBuffValue, BuffId, IConditionalEffect, BuffConditionElement } from './buff-types';
import { IBaseBuffProcessingInjectionContext, createSourcesFromContext, parseNumberOrDefault, createUnknownParamsEntryFromExtraParams, createNoParamsEntry, ITargetData } from './_helpers';
import { TargetType, TargetArea, UnitElement } from '../../datamine-types';

/**
 * @description Type representing a function that can parse a conditional effect into an array of buffs.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns Converted buff(s) from the given passive effect.
 */
export type ConditionalEffectToBuffFunction = (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext) => IBuff[];

let mapping: Map<string, ConditionalEffectToBuffFunction>;

/**
 * @description Retrieve the conditional-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of conditional IDs to functions.
 */
export function getConditionalEffectToBuffMapping (reload?: boolean): Map<string, ConditionalEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, ConditionalEffectToBuffFunction>();
		setMapping(mapping);
	}

	return mapping;
}

/**
 * @description Apply the mapping of conditional effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping(map: Map<string, ConditionalEffectToBuffFunction>): void {
	const ELEMENT_MAPPING: { [key: string]: UnitElement | BuffConditionElement } = {
		0: BuffConditionElement.All,
		1: UnitElement.Fire,
		2: UnitElement.Water,
		3: UnitElement.Earth,
		4: UnitElement.Thunder,
		5: UnitElement.Light,
		6: UnitElement.Dark,
	};

	interface ILocalParamsContext {
		originalId: string;
		sources: string[];
		targetData: ITargetData;
	}

	const createUnknownParamsEntry = (
		unknownParams: IGenericBuffValue | undefined,
		{
			originalId,
			sources,
			targetData,
		}: ILocalParamsContext,
	): IBuff => ({
		id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
		originalId,
		sources,
		value: unknownParams,
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
		}: ILocalParamsContext,
	): void => {
		if (results.length === 0) {
			results.push(createNoParamsEntry({ originalId, sources }));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId,
				sources,
				targetData,
			}));
		}
	};

	const getDefaultTargetData = (): ITargetData => ({ targetType: TargetType.Self, targetArea: TargetArea.Single });

	const retrieveCommonInfoForEffects = (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext) => {
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);
		const splitParams = typeof effect.params === 'string' ? effect.params.split('&') : [];
		const targetData = getDefaultTargetData();
		const turnDuration = parseNumberOrDefault(effect.turnDuration);

		return { targetData, sources, splitParams, turnDuration };
	};

	interface IConditionalWithSingleNumericalParameterContext {
		effect: IConditionalEffect;
		context: IEffectToBuffConversionContext;
		injectionContext?: IBaseBuffProcessingInjectionContext;
		originalId: string;
		buffId: string;

		/**
		 * @description This determines whether to return a `NO_PARAMS_BUFF`or the buff
		 * with the given `buffId` if the parsed value is 0. Defaults to false.
		 */
		returnBuffWithValueOfZero?: boolean;

		parseParamValue?: (rawValue: string) => number;
	}
	const parseConditionalWithSingleNumericalParameter = ({
		effect,
		context,
		injectionContext,
		originalId,
		buffId,
		returnBuffWithValueOfZero = false,
		parseParamValue = (rawValue: string) => parseNumberOrDefault(rawValue),
	}: IConditionalWithSingleNumericalParameterContext): IBuff[] => {
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawValue, ...extraParams] = splitParams;
		const value = parseParamValue(rawValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);

		const results: IBuff[] = [];
		if (returnBuffWithValueOfZero || value !== 0) {
			results.push({
				id: buffId,
				originalId,
				sources,
				duration: turnDuration,
				value,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	};

	map.set('1', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '1',
			buffId: 'conditional:1:attack buff',
		});
	});

	map.set('3', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '3',
			buffId: 'conditional:3:defense buff',
		});
	});

	map.set('8', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '8';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawHealLow, rawHealHigh, rawAddedRec, ...extraParams] = splitParams;
		const healLow = parseNumberOrDefault(rawHealLow);
		const healHigh = parseNumberOrDefault(rawHealHigh);
		const addedRec = (1 + parseNumberOrDefault(rawAddedRec) / 100) * 10;

		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);

		const results: IBuff[] = [];
		if (healLow !== 0 || healHigh !== 0) {
			results.push({
				id: 'conditional:8:gradual heal',
				originalId,
				sources,
				duration: turnDuration,
				value: {
					healLow,
					healHigh,
					'addedRec%': addedRec,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('12', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '12',
			buffId: 'conditional:12:guaranteed ko resistance',
			returnBuffWithValueOfZero: true,
		});
	});

	map.set('13', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '13';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawElement, rawValue, ...extraParams] = splitParams;
		const element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
		const value = parseNumberOrDefault(rawValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'conditional:13:elemental attack buff',
				originalId,
				sources,
				duration: turnDuration,
				value,
				conditions: {
					targetElements: [element],
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('14', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '14';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawElement, rawValue, ...extraParams] = splitParams;
		const element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
		const value = parseNumberOrDefault(rawValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'conditional:14:elemental defense buff',
				originalId,
				sources,
				duration: turnDuration,
				value,
				conditions: {
					targetElements: [element],
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('36', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '36',
			buffId: 'conditional:36:mitigation',
		});
	});

	map.set('37', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '37',
			buffId: 'conditional:37:gradual bc fill',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
		});
	});

	map.set('40', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '40',
			buffId: 'conditional:40:spark damage',
		});
	});

	map.set('72', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '72';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawBb, rawSbb, rawUbb, ...extraParams] = splitParams;
		const bb = parseNumberOrDefault(rawBb);
		const sbb = parseNumberOrDefault(rawSbb);
		const ubb = parseNumberOrDefault(rawUbb);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);

		const results: IBuff[] = [];
		if (bb !== 0) {
			results.push({
				id: 'conditional:72:attack boost-bb',
				originalId,
				sources,
				duration: turnDuration,
				value: bb,
				...targetData,
			});
		}

		if (sbb !== 0) {
			results.push({
				id: 'conditional:72:attack boost-sbb',
				originalId,
				sources,
				duration: turnDuration,
				value: sbb,
				...targetData,
			});
		}

		if (ubb !== 0) {
			results.push({
				id: 'conditional:72:attack boost-ubb',
				originalId,
				sources,
				duration: turnDuration,
				value: ubb,
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('84', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '84',
			buffId: 'conditional:84:critical damage',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) * 100,
		});
	});

	map.set('91', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '91';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawChance, rawHpRecover, ...extraParams] = splitParams;
		const chance = parseNumberOrDefault(rawChance);
		const hpRecover = parseNumberOrDefault(rawHpRecover);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'conditional:91:chance ko resistance',
				originalId,
				sources,
				duration: turnDuration,
				value: {
					'hpRecover%': hpRecover,
					chance,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('132', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			originalId: '132',
			buffId: 'conditional:132:od fill rate',
		});
	});

	map.set('133', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '133';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawHealLow, rawHealHigh, rawChance, ...extraParams] = splitParams;
		const healLow = parseNumberOrDefault(rawHealLow);
		const healHigh = parseNumberOrDefault(rawHealHigh);
		const chance = parseNumberOrDefault(rawChance);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);

		const results: IBuff[] = [];
		if (healLow !== 0 || healHigh !== 0 || chance !== 0) {
			results.push({
				id: 'conditional:133:heal on hit',
				originalId,
				sources,
				duration: turnDuration,
				value: {
					healLow,
					healHigh,
					chance,
				},
				conditions: { whenAttacked: true },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('153', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '153';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawReductionValue, rawChance, rawDebuffTurnDuration, ...extraParams] = splitParams;
		const reductionValue = parseNumberOrDefault(rawReductionValue);
		const chance = parseNumberOrDefault(rawChance);
		const debuffTurnDuration = parseNumberOrDefault(rawDebuffTurnDuration);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);

		const results: IBuff[] = [];
		if (reductionValue !== 0 || chance !== 0) {
			results.push({
				id: 'conditional:153:chance inflict atk down on hit',
				originalId,
				sources,
				duration: turnDuration,
				value: {
					reductionValue,
					chance,
					debuffTurnDuration,
				},
				conditions: { whenAttacked: true },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});
}
