import { PassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, BuffId } from './buff-types';
import isPassiveEffect from '../isPassiveEffect';
import getEffectId from '../getEffectId';
import { KNOWN_PASSIVE_ID } from '../constants';
import { getPassiveEffectToBuffMapping } from './passive-effect-mapping';
import { createSourcesFromContext } from './_helpers';

/**
 * @description Default function for all effects that cannot be processed.
 * @param effect Effect to convert to {@link IBuff} format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given passive effect.
 */
function defaultConversionFunction (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext): IBuff[] {
	const id = (isPassiveEffect(effect) && getEffectId(effect)) || KNOWN_PASSIVE_ID.Unknown;

	return [{
		id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
		originalId: id,
		sources: createSourcesFromContext(context),
	}];
}

/**
 * @description Extract the buff(s) from a given passive effect object.
 * If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see {@link BuffStackType} for more info).
 * @param effect Passive effect object to extract buffs from.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns A collection of one or more buffs found in the given passive effect object.
 */
export default function convertPassiveEffectToBuffs (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext): IBuff[] {
	if (!effect || typeof effect !== 'object') {
		throw new TypeError('effect parameter should be an object');
	}
	if (!context || typeof context !== 'object') {
		throw new TypeError('context parameter should be an object');
	}

	const id = (isPassiveEffect(effect) && getEffectId(effect));
	const conversionFunction = (id && getPassiveEffectToBuffMapping(context.reloadMapping, convertPassiveEffectToBuffs).get(id));
	// TODO: warning if result is empty?
	return typeof conversionFunction === 'function'
		? conversionFunction(effect, context)
		: defaultConversionFunction(effect, context);
}
