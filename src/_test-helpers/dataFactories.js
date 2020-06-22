const { createObjectListFactoryFromSchema } = require('./utils');
const constants = require('./constants');
const generateEffectsList = createObjectListFactoryFromSchema({
	'effect delay time(ms)/frame': (index) => `delay-${index}`,
	'proc id': (index) => `id-${index}`,
	'unknown proc id': () => undefined,
	'random attack': () => undefined,
	'target area': () => constants.ARBITRARY_TARGET_AREA,
	'target type': () => constants.ARBITRARY_TARGET_TYPE,
});

const generateDamageFramesList = createObjectListFactoryFromSchema({
	'effect delay time(ms)/frame': (index) => `delay-${index}`,
	'frame times': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex),
	'hit dmg% distribution': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1),
	'hit dmg% distribution (total)': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1)
		.reduce((acc, val) => acc + val, 0),
	hits: (index) => index + 1,
});

module.exports = {
	generateDamageFramesList,
	generateEffectsList,
};
