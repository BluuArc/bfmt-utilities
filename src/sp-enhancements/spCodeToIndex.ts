import {
	CHARACTER_CODE_FOR_UPPERCASE_A,
	CHARACTER_CODE_FOR_NUMBER_0,
	CHARACTER_CODE_FOR_LOWERCASE_A,
} from './_constants';

/**
 * @description Get the corresponding index for a given character code.
 * It expects an alphanumeric character and will return -1 otherwise.
 * @param code Character code an SP entry in a given skills array.
 * @returns Corresponding index to the given character or -1 if the
 * character is invalid.
 */
export default function spCodeToIndex (code: string): number {
	let result = -1;
	let characterCodeOffset = -1;
	if (!!code && typeof code === 'string' && code.length === 1) {
		if (code >= 'A' && code <= 'Z') {
			characterCodeOffset = CHARACTER_CODE_FOR_UPPERCASE_A;
		} else if (code >= 'a' && code <= 'z') {
			characterCodeOffset = CHARACTER_CODE_FOR_LOWERCASE_A - 26;
		} else if (code >= '0' && code <= '9') {
			characterCodeOffset = CHARACTER_CODE_FOR_NUMBER_0 - 52;
		}
	}

	if (characterCodeOffset !== -1) {
		result = code.charCodeAt(0) - characterCodeOffset;
	}
	return result;
}
