/**
 * @description Get the proc/passive ID of a given object
 * @param effect Object to get the effect ID from
 * @returns The proc/passive ID of the input effect if it exists; empty string otherwise
 */
export default function getEffectId (effect: {
	'proc id'?: string;
	'unknown proc id'?: string;
	'passive id'?: string;
	'unknown passive id'?: string;
}): string {
	let resultId = '';
	if (effect) {
		resultId = effect['proc id'] || effect['unknown proc id'] ||
			effect['passive id'] || effect['unknown passive id'] || '';
	}
	return resultId;
}
