const spEnhancementUtilities = require('../../src/sp-enhancements');

describe('SP Enhancement utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getEffectsForSpEnhancement',
		].sort();
		expect(Object.keys(spEnhancementUtilities).sort()).toEqual(expectedSurface);
	});
});
