/**
 * @description Determine if a given effect object is a passive effect based on existing properties.
 * Do note that it does not check the validity of each property, only the existence.
 * @param effect object to check
 * @returns whether the given effect object is considered a passive effect based on its properties
 */
export default function isPassiveEffect (effect: {
	'passive id'?: string;
	'unknown passive id'?: string;
}): boolean {
	return !!effect &&
		typeof effect === 'object' &&
		(Object.hasOwnProperty.call(effect, 'passive id') || Object.hasOwnProperty.call(effect, 'unknown passive id'));
}
