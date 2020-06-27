const getAllEntriesThatDependOnSpEntry = require('./getAllEntriesThatDependOnSpEntry').default;

describe('getAllEntriesThatDependOnSpEntry method', () => {
	describe('for invalid inputs', () => {
		const invalidEntryCases = [
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
				name: 'is an object where obj.id does not exist',
				value: { some: 'property' },
			},
		];

		const invalidEntriesCases = [
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
			{
				name: 'is not an array of objects with a dependency property',
				value: ['some string', 123, void 0, null, [], { some: 'value' }],
			},
		];

		invalidEntryCases.forEach(entryCase => {
			invalidEntriesCases.forEach(allEntriesCase => {
				it(`returns an empty array when entry ${entryCase.name} and allEntries ${allEntriesCase.name}`, () => {
					const result = getAllEntriesThatDependOnSpEntry(entryCase.value, allEntriesCase.value);
					expect(result).toEqual([]);
				});
			});
		});
	});

	it('returns an empty array if the skill depending on it is not in the allEntries array', () => {
		const entry = { id: '123' };
		const allEntries = Array.from({ length: 10 }, (_, i) => ({ dependency: `${i}` }));
		const result = getAllEntriesThatDependOnSpEntry(entry, allEntries);
		expect(result).toEqual([]);
	});

	it('returns an array with the corresponding entry that depends on the input entry', () => {
		const entry = { id: '1' };
		const allEntries = Array.from({ length: 10 }, (_, i) => ({ dependency: `${i}` }));
		const result = getAllEntriesThatDependOnSpEntry(entry, allEntries);

		expect(result).toEqual([allEntries[1]]);
	});

	it('returns an array with all entries that depend on the input entry', () => {
		const entry = { id: '1' };
		const allEntries = [
			{
				id: '0',
				dependency: '1',
			},
			{
				id: '1',
			},
			{
				id: '2',
				dependency: '1',
			},
			{
				id: '3',
			},
		];
		const result = getAllEntriesThatDependOnSpEntry(entry, allEntries);

		expect(result).toEqual([
			allEntries[0],
			allEntries[2],
		]);
	});

	it('returns nested dependents', () => {
		const entry = { id: '5' };
		const allEntries = [
			{
				id: '0',
				dependency: '2',
			},
			{
				id: '1',
				dependency: '5',
			},
			{
				id: '2',
				dependency: '1',
			},
			{
				id: '3',
			},
		];
		const result = getAllEntriesThatDependOnSpEntry(entry, allEntries);

		expect(result).toEqual([
			allEntries[1],
			allEntries[2],
			allEntries[0],
		]);
	});

	it('only includes dependents once (i.e. no circular dependents)', () => {
		const entry = { id: '1' };
		const allEntries = [
			{
				id: '0',
				dependency: '1',
			},
			{
				id: '1',
				dependency: '0',
			},
		];
		const result = getAllEntriesThatDependOnSpEntry(entry, allEntries);

		expect(result).toEqual([
			allEntries[0],
			allEntries[1],
		]);
	});
});
