module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		project: 'tsconfig.json',
	},
	plugins: [
		'@typescript-eslint',
	],
	rules: {
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
		'@typescript-eslint/naming-convention': [
			'error',
			// enforce that interface names begin with an `I`
			{
				selector: 'interface',
				format: ['PascalCase'],
				custom: {
					regex: '^I[A-Z]',
					match: true,
				},
			},
		],
		'@typescript-eslint/no-explicit-any': 0,
		'require-jsdoc': 2,
		'valid-jsdoc': [
			2,
			{
				requireParamType: false,
				requireReturnType: false,
			},
		],
	},
};
