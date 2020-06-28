const testConstants = require('../_test-helpers/constants');
const getNameForPassive = require('./getNameForPassive').default;
const { PASSIVE_METADATA } = require('./buff-metadata');

describe('getNameForPassive method', () => {
	describe('for invalid metadata inputs', () => {
		[
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 'some value',
			},
		].forEach(testCase => {
			it(`returns empty string if the metadata parameter ${testCase.name}`, () => {
				const result = getNameForPassive(testConstants.KNOWN_ARBITRARY_PASSIVE_ID, testCase.value);

				expect(typeof result === 'string')
					.withContext('result is not a string')
					.toBe(true);
				expect(result.length)
					.withContext('result is not an empty string')
					.toBe(0);
			});
		});
	});

	describe('when a valid metadata object is passed in', () => {
		const arbitraryId = 'arbitrary id';
		const arbitraryName = 'arbitrary name';
		const arbitraryInvalidId = 'arbitrary invalid id';

		const generateMetadata = () => ({ [arbitraryId]: { ID: arbitraryId, Name: arbitraryName } });
		[
			{
				input: arbitraryId,
				name: 'a valid passive id',
				shouldHaveEntry: true,
			},
			{
				input: arbitraryInvalidId,
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
				const metadata = generateMetadata();
				const result = getNameForPassive(testCase.input, metadata);
				expect(typeof result === 'string')
					.withContext('result is not a string')
					.toBe(true);
				if (testCase.shouldHaveEntry) {
					expect(result).toBe(arbitraryName);
				} else {
					expect(result.length)
						.withContext('result is not an empty string')
						.toBe(0);
				}
			});
		});
	});

	it('defaults to PASSIVE_METADATA for metadata is not specified', () => {
		const result = getNameForPassive(testConstants.KNOWN_ARBITRARY_PASSIVE_ID);
		expect(result.length)
			.withContext('result is an empty etring')
			.toBeGreaterThan(0);
		expect(result)
			.withContext('result does not match metadata')
			.toBe(PASSIVE_METADATA[testConstants.KNOWN_ARBITRARY_PASSIVE_ID].Name);
	});
});
