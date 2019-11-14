const baseSettings = require('../.eslintrc.js');

module.exports = {
	...baseSettings,
	env: {
		...baseSettings,
		jasmine: true,
	},
};
