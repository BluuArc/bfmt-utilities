import { IEffectToBuffConversionContext, IBuff, IGenericBuffValue, BuffId, IConditionalEffect } from './buff-types';
import { IBaseBuffProcessingInjectionContext, createSourcesFromContext, parseNumberOrDefault, createUnknownParamsEntryFromExtraParams, createNoParamsEntry, ITargetData } from './_helpers';
import { TargetType, TargetArea } from '../../datamine-types';

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
		const originalId = '12';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawRecoverValue, ...extraParams] = splitParams;
		const recoverValue = parseNumberOrDefault(rawRecoverValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);

		const results: IBuff[] = [{
			id: 'conditional:12:guaranteed ko resistance',
			originalId,
			sources,
			duration: turnDuration,
			value: recoverValue,
			...targetData,
		}];

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
		});

		return results;
	});

	map.set('36', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '36';
		const { targetData, sources, splitParams, turnDuration } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawMitigationValue, ...extraParams] = splitParams;
		const mitigationValue = parseNumberOrDefault(rawMitigationValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);

		const results: IBuff[] = [];
		if (mitigationValue !== 0) {
			results.push({
				id: 'conditional:36:mitigation',
				originalId,
				sources,
				duration: turnDuration,
				value: mitigationValue,
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
}
