import { PassiveEffect } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff } from './buff-types';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given passive effect.
 */
export type PassiveEffectToBuffFunction = (effect: PassiveEffect, context: IEffectToBuffConversionContext) => IBuff[];

let mapping: Map<string, PassiveEffectToBuffFunction>;

export function getPassiveEffectToBuffMapping (reload?: boolean): Map<string, PassiveEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, PassiveEffectToBuffFunction>();

		// TODO: processing functions here
	}

	return mapping;
}
