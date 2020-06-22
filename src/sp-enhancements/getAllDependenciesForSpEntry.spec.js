const getAllDependenciesForSpEntry = require('./getAllDependenciesForSpEntry').default;

describe('getAllDependenciesForSpEntry method', () => {
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
				name: 'is an object where obj.dependency does not exist',
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
				name: 'is not an array of objects with an ID property',
				value: ['some string', 123, void 0, null, [], { some: 'value' }],
			},
		];

		invalidEntryCases.forEach(entryCase => {
			invalidEntriesCases.forEach(allEntriesCase => {
				it(`returns an empty array when entry ${entryCase.name} and allEntries ${allEntriesCase.name}`, () => {
					const result = getAllDependenciesForSpEntry(entryCase.value, allEntriesCase.value);
					expect(result).toEqual([]);
				});
			});
		});
	});

	it('returns an empty array if the dependent skill is not in the allEntries array', () => {
		const entry = { dependency: '123' };
		const allEntries = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }));
		const result = getAllDependenciesForSpEntry(entry, allEntries);
		expect(result).toEqual([]);
	});

	it('returns an array with the corresponding entry that has the input entry\'s dependency ID', () => {
		const entry = { dependency: '1' };
		const allEntries = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }));
		const result = getAllDependenciesForSpEntry(entry, allEntries);

		expect(result).toEqual([allEntries[1]]);
	});

	it('returns nested dependencies', () => {
		const entry = { dependency: '1' };
		const allEntries = [
			{
				id: '0',
			},
			{
				id: '1',
				dependency: '2',
			},
			{
				id: '2',
				dependency: '0',
			},
			{
				id: '3',
				dependency: '0',
			},
		];
		const result = getAllDependenciesForSpEntry(entry, allEntries);

		expect(result).toEqual([
			allEntries[1],
			allEntries[2],
			allEntries[0],
		]);
	});

	it('only includes dependencies once (i.e. no circular dependencies)', () => {
		const entry = { dependency: '1' };
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
		const result = getAllDependenciesForSpEntry(entry, allEntries);

		expect(result).toEqual([
			allEntries[1],
			allEntries[0],
		]);
	});
});
