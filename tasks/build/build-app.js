const path = require('path');
const { src, dest, series } = require('gulp');
const ts = require('gulp-typescript');
const rollup = require('rollup');
const terser = require('gulp-terser');
const babel = require('gulp-babel');

function transpileToJs () {
	const tsProject = ts.createProject('../tsconfig.json');
	return src('../src/**/*.ts')
		.pipe(tsProject())
		.pipe(dest(path.join('../dist')));
}

function compileWithRollup () {
	return rollup.rollup({
		input: '../dist/index.js',
	}).then(bundle => Promise.all([
		bundle.write({
			format: 'iife',
			name: 'bfmtUtilities',
			file: '../dist/index.browser.js',
		}),
		bundle.write({
			format: 'cjs',
			name: 'bfmtUtilities',
			file: '../dist/index.cjs.js',
		}),
	]));
}

function transpileRollupBrowserBuild () {
	return src('../dist/index.browser.js')
		.pipe(babel({
			presets: [
				[
					'@babel/preset-env',
					{
						targets: 'last 2 Firefox versions or last 2 Chrome versions or last 2 Safari versions',
					},
				],
			],
		}))
		.pipe(terser())
		.pipe(dest('../dist'));
}

function copyTypeDefinitions () {
	return src('../src/**/*.d.ts')
		.pipe(dest(path.join('../dist')));
}

module.exports = {
	buildApp: series(copyTypeDefinitions, transpileToJs, compileWithRollup, transpileRollupBrowserBuild),
};
