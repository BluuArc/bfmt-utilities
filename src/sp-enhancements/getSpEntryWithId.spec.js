const getSpEntryWithId = require('./getSpEntryWithId').default;

describe('getSpEntryWithId method', () => {
	describe('for invalid inputs', () => {
		const invalidIdCases = [
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is undefined',
				value: void 0,
			},
			{
				name: 'is an object',
				value: { some: 'property' },
			},
			{
				name: 'is a number',
				value: 5,
			},
		];

		const invalidSpArrayCases = [
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
				name: 'is an object that is not an array',
				value: { some: 'property' },
			},
			{
				name: 'is an array of non-objects',
				value: [undefined, null, 0, 'some string'],
			},
			{
				name: 'is an array of objects without an ID property',
				value: [{ some: 'property' }, { some: 'other property' }],
			},
		];
		invalidIdCases.forEach(idCase => {
			invalidSpArrayCases.forEach(spCase => {
				it(`returns undefined when id ${idCase.name} and entries ${spCase.name}`, () => {
					expect(getSpEntryWithId(idCase.value, spCase.value)).toBe(void 0);
				});
			});
		});
	});

	it('returns undefined when entries is empty', () => {
		expect(getSpEntryWithId('1', [])).toBeUndefined();
	});

	it('returns undefined when there are no entries with a matching ID', () => {
		const id = '1';
		const entries = [{ id: '2' }, { id: '3' }];
		const result = getSpEntryWithId(id, entries);
		expect(result).toBeUndefined();
	});

	describe('cases when entries should be found', () => {
		it('returns the first entry that matches a given ID', () => {
			const id = '12345';
			const entries = [{ id: 'something else' }, { id }, { id }];
			const result = getSpEntryWithId(id, entries);
			expect(entries.indexOf(result))
				.withContext('result was not first entry with matching ID')
				.toBe(1);
		});

		[
			['12345', '12345', 'the non-@ version of SP entry IDs when both the ID and entries do not use @'],
			['1@2345', '2345', 'the @ version of SP entry IDs when the ID uses @ and entries do not'],
			['2345', '1@2345', 'the @ version of SP entry IDs when the ID does not use @ and entries do use @'],
			['1@2345', '1@2345', 'the @ version of SP entry IDs when both the ID and entries use @'],
		].forEach(([inputId, entriesId, name]) => {
			it(`correctly processes ${name}`, () => {
				const entries = [{ id: entriesId }];
				const result = getSpEntryWithId(inputId, entries);
				expect(result)
					.withContext('result was not first entry with matching ID')
					.toBe(entries[0]);
			});
		});
	});
});
