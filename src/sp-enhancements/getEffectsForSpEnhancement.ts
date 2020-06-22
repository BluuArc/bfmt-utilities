import {
	ISpEnhancementEntry,
	SpEnhancementEffect,
	SpPassiveType,
	PassiveEffect,
} from '../datamine-types';

/**
 * @description Get the effects of a given SP Enhancement Entry
 * @param entry SP Enhancement Entry to get the effects of
 * @returns the effects of the given SP Enhancement Entry if they exist, an empty array otherwise
 */
export default function getEffectsForSpEnhancement (entry: ISpEnhancementEntry): SpEnhancementEffect[] {
	const result: SpEnhancementEffect[] = [];
	if (entry && entry.skill && Array.isArray(entry.skill.effects)) {
		const effectWrappers = entry.skill.effects;
		effectWrappers.forEach(effectWrapper => {
			Object.keys(effectWrapper).forEach(spType => {
				const originalEffect = (effectWrapper[spType as SpPassiveType] as PassiveEffect);
				const unwrappedEffect: SpEnhancementEffect = {
					...originalEffect,
					sp_type: (spType as SpPassiveType),
				};
				result.push(unwrappedEffect);
			});
		});
	}
	return result;
}
