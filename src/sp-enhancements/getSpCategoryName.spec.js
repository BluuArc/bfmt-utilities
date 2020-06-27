const getSpCategoryName = require('./getSpCategoryName').default;

describe('getSpCategoryName method', () => {
	describe('for invalid values for categoryId', () => {
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
				name: 'is not a string or a number',
				value: { some: 'property' },
			},
			{
				name: 'is not a numerical string',
				value: 'some string',
			},
			{
				name: 'is a number that doesn\'t have an associated entry',
				value: 0,
			},
			{
				name: 'is a string that doesn\'t have an associated entry',
				value: '0',
			},
		].forEach(testCase => {
			it(`returns 'Unknown' if categoryId ${testCase.name}`, () => {
				expect(getSpCategoryName(testCase.value)).toBe('Unknown');
			});
		});
	});

	describe('for valid values for categoryId', () => {
		const EXPECTED_NAME_MAPPING = {
			'1': 'Parameter Boost',
			'2': 'Spark',
			'3': 'Critical Hits',
			'4': 'Attack Boost',
			'5': 'BB Gauge',
			'6': 'HP Recovery',
			'7': 'Drops',
			'8': 'Ailment Resistance',
			'9': 'Ailment Infliction',
			'10': 'Damage Reduction',
			'11': 'Special',
		};

		Object.entries(EXPECTED_NAME_MAPPING).forEach(([categoryId, expectedName]) => {
			it(`returns '${expectedName}' when categoryId is number ${categoryId}`, () => {
				expect(getSpCategoryName(+categoryId)).toBe(expectedName);
			});

			it(`returns '${expectedName}' when categoryId is string ${categoryId}`, () => {
				expect(getSpCategoryName(`${categoryId}`)).toBe(expectedName);
			});
		});
	});
});
