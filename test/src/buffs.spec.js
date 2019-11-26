const buffUtilities = require('../../src/buffs');
const datamineTypes = require('../../src/datamine-types');
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

	describe('combineEffectsAndDamageFrames method', () => {
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

		describe('when both effects array and damage frame arrays are the same length and correct shape', () => {
			const expectedResultKeys = ['delay', 'effect', 'frames', 'id', 'targetArea', 'targetType'].sort();
			/**
			 * @param {import('../../src/buffs').IProcEffectFrameComposite[]} result
			 * @param {import('../../src/datamine-types').ProcEffect[]} inputEffects
			 * @param {import('../../src/datamine-types').IDamageFramesEntry[]} damageFrames
			 */
			const assertResult = (result = [], inputEffects = [], inputDamageFrames = []) => {
				expect(result.length).toBe(inputEffects.length, `Length of result array [${result.length}] did not match length of input effects array [${inputEffects.length}]`);
				expect(result.length).toBe(inputDamageFrames.length, `Length of result array [${result.length}] did not match length of input damage frames array [${inputDamageFrames.length}]`);
				result.forEach((entry, index) => {
					const correspondingEffect = inputEffects[index];
					const correspondingDamageFrame = inputDamageFrames[index];

					expect(Object.keys(entry).sort()).toEqual(expectedResultKeys);
					expect(entry.delay).toBe(correspondingEffect['effect delay time(ms)/frame']);
					expect(entry.effect).toBe(correspondingEffect);
					expect(entry.frames).toBe(correspondingDamageFrame);

					if (correspondingEffect['proc id']) {
						expect(entry.id).toBe(correspondingEffect['proc id']);
					} else {
						expect(entry.id).toBe(correspondingEffect['unknown proc id']);
					}

					if (correspondingEffect['random attack']) {
						expect(entry.targetArea).toBe(datamineTypes.TargetArea.Random);
					} else {
						expect(entry.targetArea).toBe(correspondingEffect['target area']);
					}

					expect(entry.targetType).toBe(correspondingEffect['target type']);
				});
			};

			it('returns the expected composite values when using proc id', () => {
				const effectsList = generateEffectsList(10);
				const damageFramesList = generateDamageFramesList(10);
				const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
				assertResult(result, effectsList, damageFramesList);
			});

			it('returns the expected composite values when using unknown proc id', () => {
				const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
					switch (propName) {
					case 'unknown proc id':
						return `id-${index}`;
					case 'proc id':
						return undefined;
					default:
						return defaultValue;
					}
				});
				const damageFramesList = generateDamageFramesList(10);
				const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
				assertResult(result, effectsList, damageFramesList);
			});

			it('returns the expected composite values when using a mix of unknown proc id and proc id', () => {
				const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
					switch (propName) {
					case 'unknown proc id':
						return (index % 2 === 0) ? `id-${index}` : undefined;
					case 'proc id':
						return (index % 2 === 1) ? `id-${index}` : undefined;
					default:
						return defaultValue;
					}
				});
				const damageFramesList = generateDamageFramesList(10);
				const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
				assertResult(result, effectsList, damageFramesList);
			});

			it('returns the expected composite values when using effects with a target area of random attack', () => {
				const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
					switch (propName) {
					case 'random attack':
						return true;
					default:
						return defaultValue;
					}
				});
				const damageFramesList = generateDamageFramesList(10);
				const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
				assertResult(result, effectsList, damageFramesList);
			});

			it('returns the expected composite values when using effects with a mix of target areas including random attack', () => {
				const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
					switch (propName) {
					case 'random attack':
						return index % 2 === 0;
					default:
						return defaultValue;
					}
				});
				const damageFramesList = generateDamageFramesList(10);
				const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
				assertResult(result, effectsList, damageFramesList);
			});
		});
	});
});
