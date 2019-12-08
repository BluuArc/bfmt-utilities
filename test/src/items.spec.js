const itemUtilities = require('../../src/items');

describe('item utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getEffectsForItem',
		].sort();
		expect(Object.keys(itemUtilities).sort()).toEqual(expectedSurface);
	});
});
