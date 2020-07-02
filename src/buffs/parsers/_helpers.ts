import { IEffectToBuffConversionContext } from './buff-types';

/**
 * @description Helper function for creating an entry to be used in the `sources`
 * property of {@link IBuff}.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Entry in the format of `<BuffSource>-<ID of Buff Source>`.
 */
export function createSourceEntryFromContext (context: IEffectToBuffConversionContext): string {
	return `${context.source}-${context.sourceId}`;
}

/**
 * @description Helper function for creating an entries array to be used in the `sources`
 * property of {@link IBuff}. It handles setting the order of the sources.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns List of entries in the format of `<BuffSource>-<ID of Buff Source>`.
 */
export function createSourcesFromContext (context: IEffectToBuffConversionContext): string[] {
	const resultArray = Array.isArray(context.previousSources)
		? context.previousSources.slice()
		: [];

		// Ensure that the current source is at the beginning of the array
		resultArray.unshift(createSourceEntryFromContext(context));
		return resultArray;
}
