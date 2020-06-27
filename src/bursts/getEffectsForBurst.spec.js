const getEffectsForBurst = require('./getEffectsForBurst').default;

describe('getEffectsForBurst method', () => {
	const generateBurstWithLevelEntries = (numEntries) => ({
		levels: Array.from({ length: numEntries }, (_, index) => ({ effects: [index] })),
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
				value: { some: 'property' },
			},
			{
				name: 'is an object without an effects property at the specified level',
				value: { level: [{ some: 'property' }] },
				level: 1,
			},
			{
				name: 'is an object with an effects property that is not an array at the specified level',
				value: { level: [{ effects: 'some string' }] },
				level: 1,
			},
		].forEach(testCase => {
			it(`returns an empty array if burst parameter ${testCase.name}`, () => {
				expect(getEffectsForBurst(testCase.value, testCase.level)).toEqual([]);
			});
		});
	});

	describe('when level parameter is a specified value', () => {
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
				const result = getEffectsForBurst(inputBurst, testCase.value);
				expect(result).toBe(expectedLevelEntry.effects);
			});
		});

		it('returns the 0-indexed version of level parameter', () => {
			const numEntries = 3;
			const inputBurst = generateBurstWithLevelEntries(numEntries);
			const inputLevel = 2;
			const expectedLevelEntry = inputBurst.levels[inputLevel - 1];
			const result = getEffectsForBurst(inputBurst, inputLevel);
			expect(result).toBe(expectedLevelEntry.effects);
		});

		it('returns empty array if level is out of bounds', () => {
			const numEntries = 3;
			const inputBurst = generateBurstWithLevelEntries(numEntries);
			const inputLevel = 0;
			const result = getEffectsForBurst(inputBurst, inputLevel);
			expect(result).toEqual([]);
		});
	});
});
