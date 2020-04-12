const buffUtilities = require('../../src/buffs');
const datamineTypes = require('../../src/datamine-types');
const testConstants = require('../helpers/constants');
const { assertObjectHasOnlyKeys } = require('../helpers/utils');
const { generateDamageFramesList, generateEffectsList } = require('../helpers/dataFactories');
const { PROC_METADATA, PASSIVE_METADATA } = require('../../src/buff-metadata');

describe('buff utilties', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(buffUtilities, [
			'getMetadataForProc',
			'getMetadataForPassive',
			'isAttackingProcId',
			'getNameForProc',
			'getNameForPassive',
			'isProcEffect',
			'isPassiveEffect',
			'combineEffectsAndDamageFrames',
			'getEffectId',
			'getEffectName',
		]);
	});

	describe('getMetadataForProc method', () => {
		[
			{
				input: testConstants.ARBITRARY_ATTACKING_PROC_ID,
				name: 'a valid proc id',
				shouldHaveEntry: true,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PROC_ID,
				name: 'an invalid proc id',
				shouldHaveEntry: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				shouldHaveEntry: false,
			},
			{
				input: null,
				name: 'a null id',
				shouldHaveEntry: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.shouldHaveEntry ? 'an object' : 'undefined'} for ${testCase.name}`, () => {
				const result = buffUtilities.getMetadataForProc(testCase.input);
				if (testCase.shouldHaveEntry) {
					expect(result)
						.withContext('result does not exist')
						.toBeTruthy();
					expect(typeof result === 'object')
						.withContext('result is not an object')
						.toBe(true);
				} else {
					expect(result)
						.withContext('result is not undefined')
						.toBe(undefined);
				}
			});
		});
	});

	describe('getMetadataForPassive method', () => {
		[
			{
				input: testConstants.ARBITRARY_PASSIVE_ID,
				name: 'a valid passive id',
				shouldHaveEntry: true,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PASSIVE_ID,
				name: 'an invalid passive id',
				shouldHaveEntry: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				shouldHaveEntry: false,
			},
			{
				input: null,
				name: 'a null id',
				shouldHaveEntry: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.shouldHaveEntry ? 'an object' : 'undefined'} for ${testCase.name}`, () => {
				const result = buffUtilities.getMetadataForPassive(testCase.input);
				if (testCase.shouldHaveEntry) {
					expect(result)
						.withContext('result does not exist')
						.toBeTruthy();
					expect(typeof result === 'object')
						.withContext('result is not an object')
						.toBe(true);
				} else {
					expect(result)
						.withContext('result is not undefined')
						.toBe(undefined);
				}
			});
		});
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

	describe('getNameForProc method', () => {
		[
			{
				input: testConstants.ARBITRARY_ATTACKING_PROC_ID,
				name: 'a valid proc id',
				shouldHaveEntry: true,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PROC_ID,
				name: 'an invalid proc id',
				shouldHaveEntry: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				shouldHaveEntry: false,
			},
			{
				input: null,
				name: 'a null id',
				shouldHaveEntry: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.shouldHaveEntry ? 'a string' : 'an empty string'} for ${testCase.name}`, () => {
				const result = buffUtilities.getNameForProc(testCase.input);
				expect(typeof result === 'string')
					.withContext('result is not a string')
					.toBe(true);
				if (testCase.shouldHaveEntry) {
					expect(result.length)
						.withContext('result is an empty etring')
						.toBeGreaterThan(0);
				} else {
					expect(result.length)
						.withContext('result is not an empty string')
						.toBe(0);
				}
			});
		});
	});

	describe('getNameForPassive method', () => {
		[
			{
				input: testConstants.ARBITRARY_PASSIVE_ID,
				name: 'a valid passive id',
				shouldHaveEntry: true,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PASSIVE_ID,
				name: 'an invalid passive id',
				shouldHaveEntry: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				shouldHaveEntry: false,
			},
			{
				input: null,
				name: 'a null id',
				shouldHaveEntry: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.shouldHaveEntry ? 'a string' : 'an empty string'} for ${testCase.name}`, () => {
				const result = buffUtilities.getNameForPassive(testCase.input);
				expect(typeof result === 'string')
					.withContext('result is not a string')
					.toBe(true);
				if (testCase.shouldHaveEntry) {
					expect(result.length)
						.withContext('result is an empty etring')
						.toBeGreaterThan(0);
				} else {
					expect(result.length)
						.withContext('result is not an empty string')
						.toBe(0);
				}
			});
		});
	});

	describe('isProcEffect method', () => {
		[
			{
				name: 'is undefined',
				value: (void 0),
			},
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 123,
			},
			{
				name: 'is an object but it does not have any of the proc ID keys',
				value: { some: 'property' },
			},
		].forEach(testCase => {
			it(`returns false string when the effect parameter ${testCase.name}`, () => {
				expect(buffUtilities.isProcEffect(testCase.value)).toBe(false);
			});
		});

		const ARBITRARY_STRING = 'some string';
		['proc id', 'unknown proc id'].forEach(key => {
			it(`returns true if the effect parameter is an object that has a ${key} property`, () => {
				const inputEffect = { [key]: ARBITRARY_STRING };
				expect(buffUtilities.isProcEffect(inputEffect)).toBe(true);
			});
		});
	});

	describe('isPassiveEffect method', () => {
		[
			{
				name: 'is undefined',
				value: (void 0),
			},
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 123,
			},
			{
				name: 'is an object but it does not have any of the passive ID keys',
				value: { some: 'property' },
			},
		].forEach(testCase => {
			it(`returns false string when the effect parameter ${testCase.name}`, () => {
				expect(buffUtilities.isPassiveEffect(testCase.value)).toBe(false);
			});
		});

		const ARBITRARY_STRING = 'some string';
		['passive id', 'unknown passive id'].forEach(key => {
			it(`returns true if the effect parameter is an object that has a ${key} property`, () => {
				const inputEffect = { [key]: ARBITRARY_STRING };
				expect(buffUtilities.isPassiveEffect(inputEffect)).toBe(true);
			});
		});
	});

	describe('combineEffectsAndDamageFrames method', () => {
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
						expect(result).toEqual([]);
					});
				});
			});
		});

		it('returns an empty array if the effects array is empty', () => {
			const result = buffUtilities.combineEffectsAndDamageFrames([], []);
			expect(result).toEqual([]);
		});

		it('returns an empty array if the damage frames array is empty', () => {
			const effectsList = generateEffectsList(10);
			const damageFramesList = [];
			const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
			expect(result).toEqual([]);
		});

		it('returns an empty array if the length of the effects array does not match the length of the damage frames array', () => {
			const effectsList = generateEffectsList(10);
			const damageFramesList = generateDamageFramesList(9);
			const result = buffUtilities.combineEffectsAndDamageFrames(effectsList, damageFramesList);
			expect(result).toEqual([]);
		});

		describe('when both effects array and damage frame arrays are the same length and correct shape', () => {
			const expectedResultKeys = ['delay', 'effect', 'frames', 'id', 'targetArea', 'targetType'].sort();
			/**
			 * @param {import('../../src/buffs').IProcEffectFrameComposite[]} result
			 * @param {import('../../src/datamine-types').ProcEffect[]} inputEffects
			 * @param {import('../../src/datamine-types').IDamageFramesEntry[]} damageFrames
			 */
			const assertResult = (result = [], inputEffects = [], inputDamageFrames = []) => {
				expect(result.length)
					.withContext(`Length of result array [${result.length}] did not match length of input effects array [${inputEffects.length}]`)
					.toBe(inputEffects.length);
				expect(result.length)
					.withContext(`Length of result array [${result.length}] did not match length of input damage frames array [${inputDamageFrames.length}]`)
					.toBe(inputDamageFrames.length);
				result.forEach((entry, index) => {
					const correspondingEffect = inputEffects[index];
					const correspondingDamageFrame = inputDamageFrames[index];

					expect(Object.keys(entry).sort())
						.withContext('key mismatch')
						.toEqual(expectedResultKeys);
					expect(entry.delay)
						.withContext('delay mismatch')
						.toBe(correspondingEffect['effect delay time(ms)/frame']);
					expect(entry.effect)
						.withContext('effect mismatch')
						.toBe(correspondingEffect);
					expect(entry.frames)
						.withContext('frames mismatch')
						.toBe(correspondingDamageFrame);

					if (correspondingEffect['proc id']) {
						expect(entry.id)
							.withContext('proc id mismatch')
							.toBe(correspondingEffect['proc id']);
					} else {
						expect(entry.id)
							.withContext('unknown proc id mismatch')
							.toBe(correspondingEffect['unknown proc id']);
					}

					if (correspondingEffect['random attack']) {
						expect(entry.targetArea)
							.withContext('target area mismatch')
							.toBe(datamineTypes.TargetArea.Random);
					} else {
						expect(entry.targetArea)
							.withContext('target area mismatch')
							.toBe(correspondingEffect['target area']);
					}

					expect(entry.targetType)
						.withContext('target type mismatch')
						.toBe(correspondingEffect['target type']);
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

	describe('getEffectId method', () => {
		[
			{
				name: 'is undefined',
				value: (void 0),
			},
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 123,
			},
			{
				name: 'is an object but it does not have any of the ID keys',
				value: { some: 'property' },
			},
		].forEach(testCase => {
			it(`returns an empty string when the effect parameter ${testCase.name}`, () => {
				expect(buffUtilities.getEffectId(testCase.value)).toBe('');
			});
		});

		const ARBITRARY_STRING = 'some string';
		['proc id', 'unknown proc id', 'passive id', 'unknown passive id'].forEach(key => {
			it(`returns the value for ${key} if the effect parameter is an object that has a ${key} property`, () => {
				const inputEffect = { [key]: ARBITRARY_STRING };
				expect(buffUtilities.getEffectId(inputEffect)).toBe(ARBITRARY_STRING);
			});
		});
	});

	describe('getEffectName method', () => {
		[
			{
				name: 'is undefined',
				value: (void 0),
			},
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 123,
			},
			{
				name: 'is an object but it does not have any of the ID keys',
				value: { some: 'property' },
			},
		].forEach(testCase => {
			it(`returns an empty string when the effect parameter ${testCase.name}`, () => {
				expect(buffUtilities.getEffectName(testCase.value)).toBe('');
			});
		});

		[
			['proc id', testConstants.ARBITRARY_ATTACKING_PROC_ID, PROC_METADATA[testConstants.ARBITRARY_ATTACKING_PROC_ID].Name],
			['unknown proc id', testConstants.ARBITRARY_ATTACKING_PROC_ID, PROC_METADATA[testConstants.ARBITRARY_ATTACKING_PROC_ID].Name],
			['passive id', testConstants.ARBITRARY_PASSIVE_ID, PASSIVE_METADATA[testConstants.ARBITRARY_PASSIVE_ID].Name],
			['unknown passive id', testConstants.ARBITRARY_PASSIVE_ID, PASSIVE_METADATA[testConstants.ARBITRARY_PASSIVE_ID].Name],
		].forEach(([key, value, expectedName]) => {
			it(`returns the value for ${key} if the effect parameter is an object that has a ${key} property`, () => {
				const inputEffect = { [key]: value };
				expect(expectedName.length)
					.withContext('expected name is empty')
					.toBeGreaterThan(0);
				expect(buffUtilities.getEffectName(inputEffect)).toBe(expectedName);
			});
		});
	});
});
