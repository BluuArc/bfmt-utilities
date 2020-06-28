const testConstants = require('../_test-helpers/constants');
const getNameForPassive = require('./getNameForPassive').default;
const { PASSIVE_METADATA } = require('./buff-metadata');

describe('getNameForPassive method', () => {
	const expectEmptyString = (result) => {
		expect(result)
			.withContext('result is not an empty string')
			.toBe('');
	};

	const expectNonEmptyString = (result, expected) => {
		// use 2 expects to guard against result or expected being an empty string
		expect(result.length)
			.withContext('result is an empty etring')
			.toBeGreaterThan(0);
		expect(result).toBe(expected);
	};

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
				expectEmptyString(result);
			});
		});
	});

	describe('when a valid metadata object is passed in', () => {
		const arbitraryId = 'arbitrary id';
		const arbitraryMissingId = 'arbitrary missing id';

		[
			{
				input: void 0,
				name: 'an undefined id',
			},
			{
				input: null,
				name: 'a null id',
			},
			{
				input: arbitraryMissingId,
				name: 'a passive id not in the metadata',
			},
			{
				input: arbitraryId,
				name: 'a passive id without a Name',
			},
		].forEach(testCase => {
			it(`returns an empty string for ${testCase.name}`, () => {
				const metadata = { [arbitraryId]: { ID: arbitraryId } };
				const result = getNameForPassive(testCase.input, metadata);
				expectEmptyString(result);
			});
		});

		it('returns the Name field is of a given metadata entry', () => {
			const arbitraryName = 'arbitrary name';
			const metadata = { [arbitraryId]: { ID: arbitraryId, Name: arbitraryName } };
			const result = getNameForPassive(arbitraryId, metadata);
			expectNonEmptyString(result, arbitraryName);
		});
	});

	it('defaults to PASSIVE_METADATA when metadata is not specified', () => {
		const result = getNameForPassive(testConstants.KNOWN_ARBITRARY_PASSIVE_ID);
		expectNonEmptyString(result, PASSIVE_METADATA[testConstants.KNOWN_ARBITRARY_PASSIVE_ID].Name);
	});
});
