const baseSettings = require('../.eslintrc.js');

const env = Object.assign({}, baseSettings.env);
env.jasmine = true;
module.exports = {
	...baseSettings,
	env: env,
};
