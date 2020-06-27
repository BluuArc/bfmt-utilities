[@bluuarc/bfmt-utilities - v0.7.0](README.md) › [Globals](globals.md)

# @bluuarc/bfmt-utilities - v0.7.0

# bfmt-utilities

![](https://github.com/BluuArc/bfmt-utilities/workflows/Node%20CI/badge.svg)

## Description

NPM module that contains a set of utility functions used by the [BFMT project](https://github.com/BluuArc/bf-mt). This is a separate repository for them because they are usable outside of BFMT.

## Documentation

Full type documentation can be found by looking in the `/docs` folder of the repository. The [`/docs/globals.md` file](https://github.com/BluuArc/bfmt-utilities/blob/master/docs/globals.md) is a good place to start, as it represents the entry point of the library.

## Build

* Clone/download the repository
* Install dependencies with `npm install`
* Build with `npm run build`
	* Doumentation is built automatically with this command.
	* Local documentation can be generated from current code separately from the build command via `npm run build-docs`

## Run Tests

* Run tests with `npm run test`
* Run tests with coverage checking with `npm run coverage`

## Usage

### In the browser

1. Within your page, import the `index.browser.min.js` file in the `dist` folder within your page via a `script` tag.
	* One URL you might be able to use is [`https://joshuacastor.me/bfmt-utilities/dist/index.browser.min.js`](https://joshuacastor.me/bfmt-utilities/dist/index.browser.min.js).
	* Alternatively, you can import `index.browser.js` if you want a more decompiled version and source maps aren't available (bigger file, but more readable build code).
2. The variable `bfmtUtilities` should be available to use within your code.

Note: Should be compatible with the 2 latest versions of Firefox, Chrome, and Safari.

### Within a Module-based Environment (Node.js, Webpack, Rollup, etc.)

* `import` syntax:`import * as bfmtUtilities from '@bluuarc/bfmt-utilities'`
* `require` syntax: `const bfmtUtilities = require('@bluuarc/bfmt-utilities')`
* The main entry point is an object whose keys represent the type of functions each corresponding object has.
	* For example, `bfmtUtilities.bursts` would give you access to all the functions within the `bursts.ts` file.

### Examples

Refer to the [`/examples` folder](https://github.com/BluuArc/bfmt-utilities/blob/master/examples) for examples on using the library.

## License

MIT
