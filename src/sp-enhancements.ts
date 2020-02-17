import {
	ISpEnhancementEntry,
	SpEnhancementEffect,
	PassiveEffect,
	SpPassiveType,
	SpCategoryName,
} from './datamine-types';

/**
 * @description Get the effects of a given SP Enhancement Entry
 * @param entry SP Enhancement Entry to get the effects of
 * @returns the effects of the given SP Enhancement Entry if they exist, an empty array otherwise
 */
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

/**
 * @description Get the associated category name with a given category ID.
 * @param categoryId Category ID to get the name of
 * @returns The name of the given category ID or the string 'Unknown'.
 */
export function getSpCategoryName (categoryId: string|number): SpCategoryName {
	let result: SpCategoryName;
	const numericalCategoryId = +categoryId;
	switch (numericalCategoryId) {
	case 1: result = SpCategoryName['Parameter Boost']; break;
	case 2: result = SpCategoryName.Spark; break;
	case 3: result = SpCategoryName['Critical Hits']; break;
	case 4: result = SpCategoryName['Attack Boost']; break;
	case 5: result = SpCategoryName['BB Gauge']; break;
	case 6: result = SpCategoryName['HP Recovery']; break;
	case 7: result = SpCategoryName.Drops; break;
	case 8: result = SpCategoryName['Ailment Resistance']; break;
	case 9: result = SpCategoryName['Ailment Infliction']; break;
	case 10: result = SpCategoryName['Damage Reduction']; break;
	case 11: result = SpCategoryName.Special; break;
	default: result = SpCategoryName.Unknown; break;
	}
	return result;
}
