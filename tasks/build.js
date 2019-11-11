const path = require('path');
const { src, dest, series } = require('gulp');
const ts = require('gulp-typescript');

function transpileToJs () {
	const tsProject = ts.createProject('../tsconfig.json');
	return src('../src/**/*.ts')
		.pipe(tsProject())
		.pipe(dest(path.join('../dist')));
}

function copyTypeDefinitions () {
	return src('../src/**/*.d.ts')
		.pipe(dest(path.join('../dist')));
}

module.exports = {
	build: series(copyTypeDefinitions, transpileToJs),
};
