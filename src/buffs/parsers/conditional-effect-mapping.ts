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

		return { targetData, sources, splitParams };
	};

	map.set('12', (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IBaseBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '12';
		const { targetData, sources, splitParams } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawRecoverValue, ...extraParams] = splitParams;
		const recoverValue = parseNumberOrDefault(rawRecoverValue);
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);

		const results: IBuff[] = [{
			id: 'conditional:12:ko resistance',
			originalId,
			sources,
			duration: parseNumberOrDefault(effect.turnDuration),
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
}
