import { IConsumableItem, ISphere, PassiveEffect, ProcEffect } from './datamine-types';

/**
 * @description Get the effects of a given item
 * @param item item to get the effects of, if any are present
 */
export function getEffectsForItem (item: IConsumableItem | ISphere): (PassiveEffect | ProcEffect)[] {
	let result: (ProcEffect | PassiveEffect)[] = [];
	if (item && item.effect) {
		if (Array.isArray((item as ISphere).effect)) {
			result = (item as ISphere).effect;
		} else if (Array.isArray((item as IConsumableItem).effect.effect)) {
			const { effect, target_area: targetArea, target_type: targetType } = (item as IConsumableItem).effect;
			result = effect.map(e => {
				// apply target data to each effect
				const fullProcEffect = { ...e };
				fullProcEffect['target area'] = targetArea;
				fullProcEffect['target type'] = targetType;
				return fullProcEffect;
			});
		}
	}

	return result;
}

/**
 * @description Generate a URL to display the image with the given item thumbnail filename
 * @param baseContentUrl Base URL of the server
 * @param fileName name of the file that represents the thumbnail image for a given item
 */
export function getImageUrl (baseContentUrl: string, fileName: string): string {
	return `${baseContentUrl || ''}/item/${fileName || ''}`;
}
