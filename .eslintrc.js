module.exports = {
	env: {
		es6: true,
		node: true,
		jasmine: true,
	},
	extends: [
		'eslint:recommended',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		eqeqeq: [
			'error',
			'always',
		],
		indent: [
			'error',
			'tab',
			{ SwitchCase: 1 },
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'always',
		],
		'comma-dangle': [
			'error',
			'always-multiline',
		],
	},
};
