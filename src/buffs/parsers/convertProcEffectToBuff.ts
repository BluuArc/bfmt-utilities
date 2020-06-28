import { ProcEffect } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext, BuffStackType } from './buff-types';
import { getProcMapping } from './procMapping';
import getEffectId from '../getEffectId';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given proc effect.
 */
function defaultConversionFunction (effect: ProcEffect, context: IEffectToBuffConversionContext): IBuff[] {
	const id = getEffectId(effect);

	return [{
		id,
		originalId: id,
		stackType: BuffStackType.Unknown,
		effectDelay: effect['effect delay time(ms)/frame'],
		targetType: effect['target type'],
		targetArea: effect['target area'],
		sources: [`${context.source}-${context.sourceId}`],
	}];
}

export default function convertProcEffectToBuff (effect: ProcEffect, context: IEffectToBuffConversionContext): IBuff[] {
	const id = getEffectId(effect);
	const conversionFunction = (id && getProcMapping().get(id)) || defaultConversionFunction;
	return conversionFunction(effect, context);
}
