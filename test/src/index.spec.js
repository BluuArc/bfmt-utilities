const appExport = require('../../src/index');
const app = appExport.default;

describe('application entry point', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'bursts',
			'buffs',
			'extraSkills',
			'items',
		].sort();
		expect(Object.keys(app).sort()).toEqual(expectedSurface);
	});
});
