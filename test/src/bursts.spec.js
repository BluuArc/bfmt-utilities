const burstUtilites = require('../../src/bursts');

describe('burst utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getLevelEntryForBurst',
			'getEffectsForBurst',
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
});