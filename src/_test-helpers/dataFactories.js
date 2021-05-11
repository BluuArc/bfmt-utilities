const { createObjectListFactoryFromSchema } = require('./utils');
const constants = require('./constants');

/**
 * @type {function(numEntries: number, valueGetter?: (propName: string, index: number, defaultValue: any) => any,  objectExtender?: (obj: object, index: number) => object): import('../datamine-types').IProcEffect[]}
 */
const generateProcEffectsList = createObjectListFactoryFromSchema({
	'effect delay time(ms)/frame': (index) => `delay-${index}`,
	'proc id': (index) => `id-${index}`,
	'unknown proc id': () => undefined,
	'random attack': () => undefined,
	'target area': () => constants.ARBITRARY_TARGET_AREA,
	'target type': () => constants.ARBITRARY_TARGET_TYPE,
});

/**
 * @type {function(numEntries: number, valueGetter?: (propName: string, index: number, defaultValue: any) => any,  objectExtender?: (obj: object, index: number) => object): import('../datamine-types').IBurstDamageFramesEntry[]}
 */
const generateDamageFramesList = createObjectListFactoryFromSchema({
	'effect delay time(ms)/frame': (index) => `delay-${index}`,
	'frame times': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex),
	'hit dmg% distribution': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1),
	'hit dmg% distribution (total)': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1)
		.reduce((acc, val) => acc + val, 0),
	hits: (index) => index + 1,
});

/**
 * @type {function(numEntries: number, valueGetter?: (propName: string, index: number, defaultValue: any) => any,  objectExtender?: (obj: object, index: number) => object): { [id: string]: import('../buffs/effect-metadata').IPassiveMetadataEntry }}
 */
const generatePassiveMetadataObject = (...args) => createObjectListFactoryFromSchema({
	ID: (index) => `${index}`,
	Name: (index) => `passive-entry-name-${index}`,
})(...args).reduce((acc, entry) => {
	acc[entry.ID] = entry;
	return entry;
}, {});

const generateNonArrayTestCases = (nonObjectValue = 'some value') => [
	{
		desc: 'is null',
		value: null,
	},
	{
		desc: 'is undefined',
		value: (void 0),
	},
	{
		desc: 'is not an object',
		value: nonObjectValue,
	},
	{
		desc: 'is an object but not an array',
		value: { some: 'value' },
	},
];

const generateNonObjectTestCases = (nonObjectValue = 123) => [
	{
		desc: 'is undefined',
		value: (void 0),
	},
	{
		desc: 'is null',
		value: null,
	},
	{
		desc: 'is not an object',
		value: nonObjectValue,
	},
];

module.exports = {
	generateDamageFramesList,
	generateProcEffectsList,
	generatePassiveMetadataObject,
	generateNonArrayTestCases,
	generateNonObjectTestCases,
};
