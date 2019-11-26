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
