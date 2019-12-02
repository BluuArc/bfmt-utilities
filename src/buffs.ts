import {
	PROC_METADATA,
	ProcBuffType,
} from './buff-metadata';
import {
	ProcEffect,
	IDamageFramesEntry,
	TargetArea,
	TargetType,
	IUnknownProcEffect,
} from './datamine-types';

/**
 * @description Determine if a given proc ID's type is an attack
 * @param id proc ID to check
 */
export function isAttackingProcId (id: string): boolean {
	const metadataEntry = Object.hasOwnProperty.call(PROC_METADATA, id) && PROC_METADATA[id];
	return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
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
