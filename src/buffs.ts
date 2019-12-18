import {
	PROC_METADATA,
	ProcBuffType,
	IProcMetadataEntry,
	IPassiveMetadataEntry,
	PASSIVE_METADATA,
} from './buff-metadata';
import {
	ProcEffect,
	IDamageFramesEntry,
	TargetArea,
	TargetType,
	IUnknownProcEffect,
} from './datamine-types';

/**
 * @description Get the associated metadata entry for a given proc ID
 * @param id proc ID to get metadata for
 */
export function getMetadataForProc (id: string): IProcMetadataEntry | undefined {
	return Object.hasOwnProperty.call(PROC_METADATA, id)
		? PROC_METADATA[id]
		: (void 0);
}

/**
 * @description Get the associated metadata entry for a given passive ID
 * @param id passive ID to get metadata for
 */
export function getMetadataForPassive (id: string): IPassiveMetadataEntry | undefined {
	return Object.hasOwnProperty.call(PASSIVE_METADATA, id)
		? PASSIVE_METADATA[id]
		: (void 0);
}

/**
 * @description Determine if a given proc ID's type is an attack
 * @param id proc ID to check
 */
export function isAttackingProcId (id: string): boolean {
	const metadataEntry = getMetadataForProc(id);
	return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
}

/**
 * @description Get the associated name for a given proc ID
 * @param id proc ID to get the name of
 */
export function getNameForProc (id: string): string {
	const metadataEntry = getMetadataForProc(id);
	return (!!metadataEntry && metadataEntry.Name) || '';
}

/**
 * @description Get the associated name for a given passive ID
 * @param id passive ID to get the name of
 */
export function getNameForPassive (id: string): string {
	const metadataEntry = getMetadataForPassive(id);
	return (!!metadataEntry && metadataEntry.Name) || '';
}

export interface IProcEffectFrameComposite {
	delay: string;
	effect: ProcEffect;
	frames: IDamageFramesEntry;
	id: string;
	targetArea: TargetArea;
	targetType: TargetType;
}

/**
 * @description Create a list of objects that contain both the effect data and its corresponding damage frame
 * @param effects List of proc effects to combine; must be the same length as the `damageFrames`
 * @param damageFrames List of damage frames whose index corresponds with the effect in the `effects` list
 */
export function combineEffectsAndDamageFrames (effects: ProcEffect[], damageFrames: IDamageFramesEntry[]): IProcEffectFrameComposite[] {
	let combinedEntries: IProcEffectFrameComposite[] = [];
	if (Array.isArray(effects) && effects.length > 0 && Array.isArray(damageFrames) && effects.length === damageFrames.length) {
		combinedEntries = effects.map((effect, i) => {
			const correspondingFrameEntry = damageFrames[i];
			return {
				delay: effect['effect delay time(ms)/frame'],
				effect,
				frames: correspondingFrameEntry,
				id: `${effect['proc id'] || (effect as IUnknownProcEffect)['unknown proc id']}`,
				targetArea: effect['random attack'] ? TargetArea.Random : effect['target area'],
				targetType: effect['target type'],
			};
		});
	}
	return combinedEntries;
}

/**
 * @description Get the proc/passive ID of a given object
 * @param effect Object to get the effect from
 * @returns The proc/passive ID of the input effect if it exists; empty string otherwise
 */
export function getEffectId (effect: {
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
