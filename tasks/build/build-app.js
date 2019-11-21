const path = require('path');
const { src, dest, series } = require('gulp');
const ts = require('gulp-typescript');
const rollup = require('rollup');

function transpileToJs () {
	const tsProject = ts.createProject('../tsconfig.json');
	return src('../src/**/*.ts')
		.pipe(tsProject())
		.pipe(dest(path.join('../dist')));
}

function compileWithRollup () {
	return rollup.rollup({
		input: '../dist/index.js',
	}).then(bundle => bundle.write({
		format: 'iife',
		name: 'bfmtUtilities',
		file: '../dist/index.browser.js',
	}));
}

function copyTypeDefinitions () {
	return src('../src/**/*.d.ts')
		.pipe(dest(path.join('../dist')));
}

module.exports = {
	buildApp: series(copyTypeDefinitions, transpileToJs, compileWithRollup),
};
