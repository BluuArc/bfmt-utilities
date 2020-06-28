import { ProcEffect } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext } from './buff-types';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given proc effect.
 */
export type ProcToBuffFunction = (effect: ProcEffect, context: IEffectToBuffConversionContext) => IBuff[];

let mapping: Map<string, ProcToBuffFunction>;

export function getProcMapping (reload?: boolean): Map<string, ProcToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map();
	}

	return mapping;
}
