import {
	ISpEnhancementEntry,
	SpEnhancementEffect,
	PassiveEffect,
	SpPassiveType,
	SpCategoryName,
} from './datamine-types';

/**
 * @ignore
 */
const CHARACTER_CODE_FOR_UPPERCASE_A = 'A'.charCodeAt(0);
/**
 * @ignore
 */
const CHARACTER_CODE_FOR_LOWERCASE_A = 'a'.charCodeAt(0);
/**
 * @ignore
 */
const CHARACTER_CODE_FOR_NUMBER_0 = '0'.charCodeAt(0);

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

/**
 * @description Get the corresponding character code for a given index.
 * It expects an index between 0 and 61 inclusive; will return an empty string if
 * the given value is outside of the range.
 * @param index Index of an SP entry in a given skills array
 * @returns The corresponding single alpha-numeric character to the given index
 * or an empty string if the index is invalid.
 */
export function spIndexToCode (index: number): string {
	let result = '';
	let correspondingCharacterCode = -1;
	if (Number.isInteger(index)) {
		if (index >= 0 && index <= 25) { // A-Z
			correspondingCharacterCode = index + CHARACTER_CODE_FOR_UPPERCASE_A;
		} else if (index >= 26 && index <= 51) { // a-z
			correspondingCharacterCode = (index - 26) + CHARACTER_CODE_FOR_LOWERCASE_A;
		} else if (index >= 52 && index <= 61) { // 0-9
			correspondingCharacterCode = (index - 52) + CHARACTER_CODE_FOR_NUMBER_0;
		}
	}

	if (correspondingCharacterCode !== -1) {
		result = String.fromCharCode(correspondingCharacterCode);
	}
	return result;
}
