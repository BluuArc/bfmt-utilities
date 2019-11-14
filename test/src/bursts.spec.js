import * as burstUtilites from '../../src/bursts';

describe('bursts utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getLevelEntryForBurst',
		];
		expect(Object.keys(burstUtilites)).toEqual(expectedSurface);
	});
});
