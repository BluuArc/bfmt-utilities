module.exports = {
	excludeExternals: true,
	excludePrivate: true,
	target: 'ES5',
	tsconfig: 'tsconfig.json',
	readme: 'README.md',
	exclude: ['src/index.ts', 'src/sp-enhancements/_constants.ts', 'src/buffs/parsers/_helpers.ts'],
	theme: 'markdown',
	out: 'docs',
	gitRevision: 'master',
	includeVersion: true,
};
