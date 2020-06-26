/**
 * @description Determine if a given effect object is a proc effect based on existing properties.
 * Do note that it does not check the validity of each property, only the existence.
 * @param effect Object to check.
 * @returns Whether the given effect object is considered a proc effect based on its properties.
 */
export default function isProcEffect (effect: {
	'proc id'?: string;
	'unknown proc id'?: string;
}): boolean {
	return !!effect &&
		typeof effect === 'object' &&
		(Object.hasOwnProperty.call(effect, 'proc id') || Object.hasOwnProperty.call(effect, 'unknown proc id'));
}
