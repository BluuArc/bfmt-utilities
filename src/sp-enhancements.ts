import { ISpEnhancementEntry, SpEnhancementEffect, PassiveEffect, SpPassiveType } from './datamine-types';

export function getEffectsForSpEnhancement (entry: ISpEnhancementEntry): SpEnhancementEffect[] {
	const result: SpEnhancementEffect[] = [];
	if (entry && entry.skill && Array.isArray(entry.skill.effects)) {
		const effectWrappers = entry.skill.effects;
		effectWrappers.forEach(effectWrapper => {
			Object.keys(effectWrapper).forEach(spType => {
				const originalEffect = (effectWrapper[spType as SpPassiveType] as PassiveEffect);
				const unwrappedEffect: SpEnhancementEffect = {
					...originalEffect,
					sp_type: (spType as SpPassiveType), // eslint-disable-line @typescript-eslint/camelcase
				};
				result.push(unwrappedEffect);
			});
		});
	}
	return result;
}
