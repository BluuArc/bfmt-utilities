import { ProcEffect } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, BuffId } from './buff-types';
import { getProcEffectToBuffMapping } from './proc-effect-mapping';
import getEffectId from '../getEffectId';
import { KNOWN_PROC_ID } from '../constants';
import isProcEffect from '../isProcEffect';
import { createSourcesFromContext } from './_helpers';

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given proc effect.
 */
function defaultConversionFunction (effect: ProcEffect, context: IEffectToBuffConversionContext): IBuff[] {
	const id = (isProcEffect(effect) && getEffectId(effect)) || KNOWN_PROC_ID.Unknown;

	return [{
		id: BuffId.UNKNOWN_PROC_EFFECT_ID,
		originalId: id,
		effectDelay: effect['effect delay time(ms)/frame'],
		targetType: effect['target type'],
		targetArea: effect['target area'],
		sources: createSourcesFromContext(context),
	}];
}

/**
 * @description Extract the buff(s) from a given proc effect object.
 * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
 * @param effect Proc effect object to extract buffs from.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns A collection of one or more buffs found in the given proc effect object.
 */
export default function convertProcEffectToBuffs (effect: ProcEffect, context: IEffectToBuffConversionContext): IBuff[] {
	if (!effect || typeof effect !== 'object') {
		throw new TypeError('effect parameter should be an object');
	}
	if (!context || typeof context !== 'object') {
		throw new TypeError('context parameter should be an object');
	}

	const id = (isProcEffect(effect) && getEffectId(effect));
	const conversionFunction = (id && getProcEffectToBuffMapping(context.reloadMapping).get(id));
	// TODO: warning if result is empty?
	return typeof conversionFunction === 'function'
		? conversionFunction(effect, context)
		: defaultConversionFunction(effect, context);
}
