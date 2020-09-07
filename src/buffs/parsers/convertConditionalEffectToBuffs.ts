import { IEffectToBuffConversionContext, IBuff, BuffId, IConditionalEffect } from './buff-types';
import { getConditionalEffectToBuffMapping } from './conditional-effect-mapping';
import { KNOWN_CONDITIONAL_ID } from '../constants';
import { createSourcesFromContext } from './_helpers';

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given conditional effect.
 */
function defaultConversionFunction (effect: IConditionalEffect, context: IEffectToBuffConversionContext): IBuff[] {
	const id = effect.id || KNOWN_CONDITIONAL_ID.Unknown;

	return [{
		id: BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID,
		originalId: id,
		sources: createSourcesFromContext(context),
	}];
}

/**
 * @description Extract the buff(s) from a given conditional effect object.
 * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
 * @param effect Conditional effect to extract buffs from
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns A collection of one or more buffs found in the given passive effect object.
 */
export default function convertConditionalEffectToBuffs (effect: IConditionalEffect, context: IEffectToBuffConversionContext): IBuff[] {
	if (!effect || typeof effect !== 'object') {
		throw new TypeError('effect parameter should be an object');
	}
	if (!context || typeof context !== 'object') {
		throw new TypeError('context parameter should be an object');
	}

	const conversionFunction = getConditionalEffectToBuffMapping(context.reloadMapping).get(effect.id);
	// TODO: warning if result is empty?
	return typeof conversionFunction === 'function'
		? conversionFunction(effect, context)
		: defaultConversionFunction(effect, context);
}
