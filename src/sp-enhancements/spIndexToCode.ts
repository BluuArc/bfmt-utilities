import {
	CHARACTER_CODE_FOR_UPPERCASE_A,
	CHARACTER_CODE_FOR_NUMBER_0,
	CHARACTER_CODE_FOR_LOWERCASE_A,
} from './_constants';

/**
 * @description Get the corresponding character code for a given index.
 * It expects an index between 0 and 61 inclusive; will return an empty string if
 * the given value is outside of the range.
 * @param index Index of an SP entry in a given skills array
 * @returns The corresponding single alphanumeric character to the given index
 * or an empty string if the index is invalid.
 */
export default function spIndexToCode (index: number): string {
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
