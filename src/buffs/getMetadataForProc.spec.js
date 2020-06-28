const testConstants = require('../_test-helpers/constants');
const getMetadataForProc = require('./getMetadataForProc').default;
const { PROC_METADATA } = require('./buff-metadata');

describe('getMetadataForProc method', () => {
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
				expect(getMetadataForProc(testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID, testCase.value)).toBeUndefined();
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
				name: 'a valid proc id',
				shouldHaveEntry: true,
			},
			{
				input: arbitraryInvalidId,
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
				const metadata = generateMetadata();
				const result = getMetadataForProc(testCase.input, metadata);
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

	it('defaults to PROC_METADATA for metadata is not specified', () => {
		const result = getMetadataForProc(testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID);
		expect(result)
			.withContext('result does not exist')
			.toBeTruthy();
		expect(result)
			.withContext('result does not match metadata')
			.toBe(PROC_METADATA[testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID]);
	});
});
