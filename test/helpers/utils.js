
/**
 * @description Convert a given input to a string value for logging purposes
 * @param {any} input input value to convert to a string
 * @returns {string}
 */
function getStringValueForLog (input) {
	return (input && typeof input === 'object') ? JSON.stringify(input) : `${input}`;
}

/**
 * @description Create an object list factory function with the given object schema and options
 * @param {{ [key: string]: (index: number) => any }} schema an object that tells what top-level keys the resulting object should contain and the default getters for each property
 * @param {object} options options used to customize factory behavior
 * @param {boolean?} options.deleteUndefined whether to delete `undefined` values from the resulting object
 * @returns {(numEntries: number, valueGetter?: (propName: string, index: number, defaultValue: any) => any,  objectExtender?: (obj: object) => object) => any[]} resulting factory function
 */
function createObjectListFactoryFromSchema (schema, { deleteUndefined = true } = {}) {
	const keys = Object.keys(schema);

	/**
	 * @param {number} numEntries number of entries to generate
	 * @param {(propName: string, index: number, defaultValue: any) => any} valueGetter function used to get the value for a given property name and index
	 * @param {(obj: object) => object} objectExtender function used to modify the given object beyond the original schema and return the modified object
	 */
	return function (numEntries, valueGetter, objectExtender) {
		const valueGetterIsFunction = typeof valueGetter === 'function';
		const objectExtenderIsFunction = typeof objectExtender === 'function';
		const getValueOrDefault = (propName, index, defaultValue) => valueGetterIsFunction ? valueGetter(propName, index, defaultValue) : defaultValue;
		const result = Array.from(
			{ length: numEntries },
			(_, index) => {
				const initialObject = keys.reduce((obj, key) => {
					const value = getValueOrDefault(key, index, schema[key](index));
					if (!deleteUndefined || typeof value !== 'undefined') {
						obj[key] = value;
					}
					return obj;
				}, {});
				return objectExtenderIsFunction ? objectExtender(initialObject) : initialObject;
			},
		);

		return result;
	};
}

module.exports = {
	getStringValueForLog,
	createObjectListFactoryFromSchema,
};
