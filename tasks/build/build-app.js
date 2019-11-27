const path = require('path');
const { src, dest, series } = require('gulp');
const ts = require('gulp-typescript');
const rollup = require('rollup');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

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
			sourcemap: true,
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
		.pipe(sourcemaps.init({ loadMaps: true }))
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
		.pipe(sourcemaps.write('../dist'))
		.pipe(dest('../dist'));
}

function minifyBrowserBuild () {
	return src('../dist/index.browser.js')
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(rename((filePath) => {
			filePath.basename = filePath.basename.replace('.browser', '.browser.min');
		}))
		.pipe(terser())
		.pipe(sourcemaps.write('../dist'))
		.pipe(dest('../dist'));
}

function copyTypeDefinitions () {
	return src('../src/**/*.d.ts')
		.pipe(dest(path.join('../dist')));
}

module.exports = {
	buildApp: series(copyTypeDefinitions, transpileToJs, compileWithRollup, transpileRollupBrowserBuild, minifyBrowserBuild),
};
