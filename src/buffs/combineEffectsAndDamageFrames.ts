import {
	ProcEffect,
	IDamageFramesEntry,
	IProcEffect,
	IUnknownProcEffect,
	TargetArea,
} from '../datamine-types';
import IProcEffectFrameComposite from './IProcEffectFrameComposite';

/**
 * @description Create a list of objects that contain both the effect data and its corresponding damage frame
 * @param effects List of proc effects to combine; must be the same length as the `damageFrames`
 * @param damageFrames List of damage frames whose index corresponds with the effect in the `effects` list
 * @returns collection of composite objects that contain the proc effect and the corresponding frames entry
 */
export default function combineEffectsAndDamageFrames (effects: ProcEffect[], damageFrames: IDamageFramesEntry[]): IProcEffectFrameComposite[] {
	let combinedEntries: IProcEffectFrameComposite[] = [];
	if (Array.isArray(effects) && effects.length > 0 && Array.isArray(damageFrames) && effects.length === damageFrames.length) {
		combinedEntries = effects.map((effect, i) => {
			const correspondingFrameEntry = damageFrames[i];
			return {
				delay: effect['effect delay time(ms)/frame'],
				effect,
				frames: correspondingFrameEntry,
				id: `${(effect as IProcEffect)['proc id'] || (effect as IUnknownProcEffect)['unknown proc id']}`,
				targetArea: effect['random attack'] ? TargetArea.Random : effect['target area'],
				targetType: effect['target type'],
			};
		});
	}
	return combinedEntries;
}
