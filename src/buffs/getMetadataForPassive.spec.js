const testConstants = require('../_test-helpers/constants');
const getMetadataForPassive = require('./getMetadataForPassive').default;
const { PASSIVE_METADATA } = require('./effect-metadata');

describe('getMetadataForPassive method', () => {
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
			it(`returns undefined if the metadata parameter ${testCase.name}`, () => {
				expect(getMetadataForPassive(testConstants.KNOWN_ARBITRARY_PASSIVE_ID, testCase.value)).toBeUndefined();
			});
		});
	});

	describe('when a valid metadata object is passed in', () => {
		const arbitraryId = 'arbitrary id';
		const arbitraryInvalidId = 'arbitrary invalid id';

		const generateMetadata = () => ({ [arbitraryId]: { some: 'object' } });
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
				const result = getMetadataForPassive(testCase.input, metadata);
				if (testCase.shouldHaveEntry) {
					expect(typeof result)
						.withContext('result is not an object')
						.toBe('object');
					expect(result)
						.withContext('result does not match metadata')
						.toBe(metadata[testCase.input]);
				} else {
					expect(result)
						.withContext('result is not undefined')
						.toBe(undefined);
				}
			});
		});
	});

	it('defaults to PASSIVE_METADATA when metadata is not specified', () => {
		const result = getMetadataForPassive(testConstants.KNOWN_ARBITRARY_PASSIVE_ID);
		expect(result)
			.withContext('result does not exist')
			.toBeTruthy();
		expect(result)
			.withContext('result does not match metadata')
			.toBe(PASSIVE_METADATA[testConstants.KNOWN_ARBITRARY_PASSIVE_ID]);
	});
});
