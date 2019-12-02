const burstUtilites = require('../../src/bursts');
const { getStringValueForLog } = require('../helpers/utils');
const { generateDamageFramesList } = require('../helpers/dataFactories');
const testConstants = require('../helpers/constants');
const appConstants = require('../../src/constants');

describe('burst utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getLevelEntryForBurst',
			'getEffectsForBurst',
			'getExtraAttackDamageFramesEntry',
		].sort();
		expect(Object.keys(burstUtilites).sort()).toEqual(expectedSurface);
	});

	describe('getLevelEntryForBurst method', () => {
		const generateBurstWithLevelEntries = (numEntries) => ({
			levels: Array.from({ length: numEntries }, (_, index) => ({ index })),
		});

		describe('for invalid values for burst', () => {
			[
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: void 0,
				},
				{
					name: 'is not an object',
					value: 'some string',
				},
				{
					name: 'is an object without a levels property',
					value: {},
				},
				{
					name: 'is an object with a levels property that is not an array',
					value: { levels: 'something' },
				},
			].forEach(testCase => {
				it(`returns undefined if burst parameter ${testCase.name}`, () => {
					expect(burstUtilites.getLevelEntryForBurst(testCase.value)).toBeUndefined();
				});
			});
		});

		it('returns the last level entry of the burst if no level is defined', () => {
			const numEntries = 3;
			const inputBurst = generateBurstWithLevelEntries(numEntries);
			const expectedLevelEntry = inputBurst.levels[numEntries - 1];
			const result = burstUtilites.getLevelEntryForBurst(inputBurst);
			expect(result).toBe(expectedLevelEntry);
		});

		describe('when level parameter is defined', () => {
			[
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: void 0,
				},
				{
					name: 'is not a number',
					value: 'some string',
				},
			].forEach((testCase) => {
				it(`returns the last level entry of the burst if burst level ${testCase.name}`, () => {
					const numEntries = 3;
					const inputBurst = generateBurstWithLevelEntries(numEntries);
					const expectedLevelEntry = inputBurst.levels[numEntries - 1];
					const result = burstUtilites.getLevelEntryForBurst(inputBurst, testCase.value);
					expect(result).toBe(expectedLevelEntry);
				});
			});

			it('returns the 0-indexed version of level parameter', () => {
				const numEntries = 3;
				const inputBurst = generateBurstWithLevelEntries(numEntries);
				const inputLevel = 2;
				const expectedLevelEntry = inputBurst.levels[inputLevel - 1];
				const result = burstUtilites.getLevelEntryForBurst(inputBurst, inputLevel);
				expect(result).toBe(expectedLevelEntry);
			});

			it('returns undefined if level is out of bounds', () => {
				const numEntries = 3;
				const inputBurst = generateBurstWithLevelEntries(numEntries);
				const inputLevel = 0;
				const result = burstUtilites.getLevelEntryForBurst(inputBurst, inputLevel);
				expect(result).toBeUndefined();
			});
		});
	});

	describe('getEffectsForBurst method', () => {
		const generateBurstWithLevelEntries = (numEntries) => ({
			levels: Array.from({ length: numEntries }, (_, index) => ({ effects: [ index ] })),
		});

		describe('for invalid values for burst', () => {
			[
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: void 0,
				},
				{
					name: 'is not an object',
					value: 'some string',
				},
				{
					name: 'is an object without a levels property',
					value: {},
				},
				{
					name: 'is an object without an effects property at the specified level',
					value: { level: [{ some: 'property' }]},
					level: 1,
				},
				{
					name: 'is an object an effects property that is not an array at the specified level',
					value: { level: [{ effects: 'some string' }]},
					level: 1,
				},
			].forEach(testCase => {
				it(`returns an empty array if burst parameter ${testCase.name}`, () => {
					expect(burstUtilites.getEffectsForBurst(testCase.value, testCase.level)).toEqual([]);
				});
			});
		});

		describe('when level parameter is defined', () => {
			[
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: void 0,
				},
				{
					name: 'is not a number',
					value: 'some string',
				},
			].forEach((testCase) => {
				it(`returns the effects property of the last level entry of the burst if burst level ${testCase.name}`, () => {
					const numEntries = 3;
					const inputBurst = generateBurstWithLevelEntries(numEntries);
					const expectedLevelEntry = inputBurst.levels[numEntries - 1];
					const result = burstUtilites.getEffectsForBurst(inputBurst, testCase.value);
					expect(result).toBe(expectedLevelEntry.effects);
				});
			});

			it('returns the 0-indexed version of level parameter', () => {
				const numEntries = 3;
				const inputBurst = generateBurstWithLevelEntries(numEntries);
				const inputLevel = 2;
				const expectedLevelEntry = inputBurst.levels[inputLevel - 1];
				const result = burstUtilites.getEffectsForBurst(inputBurst, inputLevel);
				expect(result).toBe(expectedLevelEntry.effects);
			});

			it('returns empty array if level is out of bounds', () => {
				const numEntries = 3;
				const inputBurst = generateBurstWithLevelEntries(numEntries);
				const inputLevel = 0;
				const result = burstUtilites.getEffectsForBurst(inputBurst, inputLevel);
				expect(result).toEqual([]);
			});
		});
	});

	describe('getExtraAttackDamageFramesEntry method', () => {
		const arbitraryDelay = 'arbitrary delay';
		/**
		 * @param {import('../../src/datamine-types').IDamageFramesEntry} result
		 * @param {import('../../src/datamine-types').IDamageFramesEntry} expected
		 */
		const assertDamageFramesEntry = (result, expected) => {
			const isPopulatedObject = !!result && typeof result === 'object';
			expect(isPopulatedObject).withContext(`Result [${getStringValueForLog(result)}] is not a populated object`).toBe(true);
			if (isPopulatedObject) {
				expect(result['effect delay time(ms)/frame']).withContext('effect delay time/frame mismatch').toBe(expected['effect delay time(ms)/frame']);
				expect(result['frame times']).withContext('frame time array mismatch').toEqual(expected['frame times']);
				expect(result['hit dmg% distribution']).withContext('damage distribution array mismatch').toEqual(expected['hit dmg% distribution']);
				expect(result['hit dmg% distribution (total)']).withContext('total damage distribution mismatch').toEqual(expected['hit dmg% distribution (total)']);
				expect(result.hits).withContext('hit count mismatch').toBe(expected.hits);
			}
		};

		/**
		 * @param {object} args
		 * @param {string?} args.delay
		 * @param {number[]?} args.frames
		 * @param {number[]?} args.damageDistribution
		 * @param {number?} args.damageTotal
		 * @param {number?} args.hits
		 * @returns {import('../../src/datamine-types').IDamageFramesEntry}
		 */
		const createDamageFramesEntry = ({ delay = '', frames = [], damageDistribution = [], damageTotal = 0, hits = 0 }) => ({
			'effect delay time(ms)/frame': delay,
			'frame times': frames,
			'hit dmg% distribution': damageDistribution,
			'hit dmg% distribution (total)': damageTotal,
			hits,
		});
		const emptyDamageFramesEntry = createDamageFramesEntry(({
			delay: arbitraryDelay,
			frames: [],
			damageDistribution: [],
			damageTotal: 0,
			hits: 0,
		}));

		describe('for invalid values for damageFrames', () => {
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
					value: 'some string',
				},
				{
					name: 'is an object but not an array',
					value: { some: 'property' },
				},
				{
					name: 'is an array but has no valid ID properties in its entries',
					value: [{ some: 'property' }, { some: 'other property' }],
				},
			].forEach(testCase => {
				it(`returns an empty damage frames entry if damageFrames ${testCase.name}`, () => {
					const result = burstUtilites.getExtraAttackDamageFramesEntry(testCase.value, arbitraryDelay);
					assertDamageFramesEntry(result, emptyDamageFramesEntry);
				});
			});
		});

		describe('for the effectDelay parameter', () => {
			it('defaults to a delay of 0.0/0 if a value is passed in for effectDelay', () => {
				const expectedResult = createDamageFramesEntry({ delay: '0.0/0' });
				const result = burstUtilites.getExtraAttackDamageFramesEntry([]);
				assertDamageFramesEntry(result, expectedResult);
			});

			it('uses the passed in value for effectDelay', () => {
				const expectedResult = createDamageFramesEntry({ delay: arbitraryDelay });
				const result = burstUtilites.getExtraAttackDamageFramesEntry([], arbitraryDelay);
				assertDamageFramesEntry(result, expectedResult);
			});
		});

		describe('when the damageFrames parameter is a non-empty array', () => {
			describe('for when there is one applicable frame entry', () => {
				[
					{
						name: 'an attacking proc ID',
						index: 1,
						key: 'proc id',
						valueAtIndex: testConstants.ARBITRARY_ATTACKING_PROC_ID,
						valueAtOtherIndices: testConstants.ARBITRARY_NON_ATTACKING_PROC_ID,
					},
					{
						name: 'an attacking proc ID that is considered unknown',
						index: 2,
						key: 'unknown proc id',
						valueAtIndex: testConstants.ARBITRARY_ATTACKING_PROC_ID,
						valueAtOtherIndices: testConstants.ARBITRARY_NON_ATTACKING_PROC_ID,
					},
					{
						name: 'the burst heal proc ID',
						index: 1,
						key: 'proc id',
						valueAtIndex: appConstants.KNOWN_PROC_ID.BurstHeal,
						valueAtOtherIndices: testConstants.ARBITRARY_NON_ATTACKING_PROC_ID,
					},
				].forEach(testCase => {
					it(`returns an identical result when the applicable frame entry has ${testCase.name}`, () => {
						const inputFrames = generateDamageFramesList(10, undefined, (obj, index) => {
							if (index === testCase.index) {
								obj[testCase.key] = testConstants.ARBITRARY_ATTACKING_PROC_ID;
							} else {
								obj[testCase.key] = testConstants.ARBITRARY_NON_ATTACKING_PROC_ID;
							}
							return obj;
						});
						const expectedResult = {
							...inputFrames[testCase.index],
							'effect delay time(ms)/frame': arbitraryDelay,
						};
						const result = burstUtilites.getExtraAttackDamageFramesEntry(inputFrames, arbitraryDelay);
						assertDamageFramesEntry(result, expectedResult);
					});
				});
			});

			it('returns an empty damage frames entry if there are no applicable frame entries', () => {
				const inputFrames = generateDamageFramesList(10, undefined, (obj) => {
					obj['proc id'] = testConstants.ARBITRARY_NON_ATTACKING_PROC_ID;
					return obj;
				});
				const result = burstUtilites.getExtraAttackDamageFramesEntry(inputFrames, arbitraryDelay);
				assertDamageFramesEntry(result, emptyDamageFramesEntry);
			});
		});
	});
});
