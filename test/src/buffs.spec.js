const buffUtilities = require('../../src/buffs');
const testConstants = require('../helpers/constants');
const { getStringValueForLog, createObjectListFactoryFromSchema } = require('../helpers/utils');

describe('buff utilties', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'isAttackingProcId',
			'combineEffectsAndDamageFrames',
		].sort();
		expect(Object.keys(buffUtilities).sort()).toEqual(expectedSurface);
	});

	describe('isAttackingProcId method', () => {
		[
			{
				input: testConstants.ARBITRARY_ATTACKING_PROC_ID,
				name: 'an attacking proc id',
				expectedValue: true,
			},
			{
				input: testConstants.ARBITRARY_NON_ATTACKING_PROC_ID,
				name: 'a valid but non-attacking proc id',
				expectedValue: false,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PROC_ID,
				name: 'an invalid proc id',
				expectedValue: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				expectedValue: false,
			},
			{
				input: null,
				name: 'a null id',
				expectedValue: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.expectedValue} for ${testCase.name}`, () => {
				expect(buffUtilities.isAttackingProcId(testCase.input)).toBe(testCase.expectedValue);
			});
		});
	});

	describe('combineEffectsAndDamageFrames', () => {
		const ARBITRARY_TARGET_AREA = 'arbitrary target area';
		const ARBITRARY_TARGET_TYPE = 'arbitrary target type';
		const assertIsArray = (result) => {
			expect(Array.isArray(result)).toBe(true, `result "${getStringValueForLog(result)}" is not an array`);
		};
		const generateEffectsList = createObjectListFactoryFromSchema({
			'effect delay time(ms)/frame': (index) => `delay-${index}`,
			'proc id': (index) => `id-${index}`,
			'unknown proc id': () => undefined,
			'random attack': () => undefined,
			'target area': () => ARBITRARY_TARGET_AREA,
			'target type': () => ARBITRARY_TARGET_TYPE,
		});

		const generateDamageFramesList = createObjectListFactoryFromSchema({
			'effect delay time(ms)/frame': (index) => `delay-${index}`,
			'frame times': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex),
			'hit dmg% distribution': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1),
			'hit dmg% distribution (total)': (index) => Array.from({ length: index + 1 }, (_, timeIndex) => timeIndex + 1)
				.reduce((acc, val) => acc + val, 0),
			hits: (index) => index + 1,
		});

		describe('for invalid inputs', () => {
			const invalidArrayCases = [
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: (void 0),
				},
				{
					name: 'is not an object',
					value: 'some value',
				},
				{
					name: 'is an object but not an array',
					value: { some: 'value' },
				},
			];
			invalidArrayCases.forEach(effectsCase => {
				invalidArrayCases.forEach(damageFramesCase => {
					it(`returns an empty array if the effects parameter ${effectsCase.name} and the damageFrames parameter ${damageFramesCase.name}`, () => {
						const result = buffUtilities.combineEffectsAndDamageFrames(effectsCase.value, damageFramesCase.value);
						assertIsArray(result);
						expect(result.length).toBe(0);
					});
				});
			});
		});

		it('returns an empty array if the effects array is empty', () => {
			const result = buffUtilities.combineEffectsAndDamageFrames([], []);
			assertIsArray(result);
			expect(result.length).toBe(0);
		});

		it('returns an empty array if the damage frames array is empty', () => {
			const effectsList = generateEffectsList(10);
			const damageFramesList = [];
			const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertIsArray(result);
			expect(result.length).toBe(0);
		});

		it('returns an empty array if the length of the effects array does not match the length of the damage frames array', () => {
			const effectsList = generateEffectsList(10);
			const damageFramesList = generateDamageFramesList(9);
			const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertIsArray(result);
			expect(result.length).toBe(0);
		});
	});
});
