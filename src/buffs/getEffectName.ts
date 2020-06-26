import getEffectId from './getEffectId';
import isPassiveEffect from './isPassiveEffect';
import getNameForPassive from './getNameForPassive';
import isProcEffect from './isProcEffect';
import getNameForProc from './getNameForProc';

/**
 * @description Get the name of a given object.
 * @param effect Object to get the name from.
 * @returns Name of the input effect if it exists; empty string otherwise.
 */
export default function getEffectName (effect: {
	'proc id'?: string;
	'unknown proc id'?: string;
	'passive id'?: string;
	'unknown passive id'?: string;
}): string {
	let resultName = '';
	const effectId = getEffectId(effect);
	if (isPassiveEffect(effect)) {
		resultName = getNameForPassive(effectId);
	} else if (isProcEffect(effect)) {
		resultName = getNameForProc(effectId);
	}
	return resultName;
}
