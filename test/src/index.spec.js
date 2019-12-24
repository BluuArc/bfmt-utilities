const appExport = require('../../src/index');
const app = appExport.default;

describe('application entry point', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'bursts',
			'buffs',
			'extraSkills',
			'items',
			'leaderSkills',
			'units',
			'spEnhancements',
			'version',
		].sort();
		expect(Object.keys(app).sort()).toEqual(expectedSurface);
	});
});
