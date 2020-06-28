import getEffectId from './getEffectId';
import isPassiveEffect from './isPassiveEffect';
import getNameForPassive from './getNameForPassive';
import isProcEffect from './isProcEffect';
import getNameForProc from './getNameForProc';
import { IPassiveMetadataEntry, IProcMetadataEntry } from './buff-metadata';

/**
 * @description Get the name of a given object.
 * @param effect Object to get the name from.
 * @param metadata Optional sources of metadata for procs and passives; defaults to internal metadata for respective types.
 * @returns Name of the input effect if it exists; empty string otherwise.
 */
export default function getEffectName (
	effect: {
		'proc id'?: string;
		'unknown proc id'?: string;
		'passive id'?: string;
		'unknown passive id'?: string;
	},
	metadata: {
		passive?: { [id: string]: IPassiveMetadataEntry },
		proc?: { [id: string]: IProcMetadataEntry }
	} = {},
): string {
	let resultName = '';
	const effectId = getEffectId(effect);
	if (isPassiveEffect(effect)) {
		resultName = getNameForPassive(effectId, metadata && metadata.passive);
	} else if (isProcEffect(effect)) {
		resultName = getNameForProc(effectId, metadata && metadata.proc);
	}
	return resultName;
}
