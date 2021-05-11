const puppeteer = require('puppeteer');

function createInstance () {
	const instances = {
		browser: null,
		page: null,
	};

	function getBrowserInstance ({ headless = true } = {}) {
		return Promise.resolve()
			.then(() => instances.browser || puppeteer.launch({ headless: !!headless }))
			.then(browser => {
				instances.browser = browser;
				return browser;
			});
	}

	function getPageInstanceToUrl ({ url, headless, timeout = 60 * 10000 } = {}) {
		return getBrowserInstance({ headless })
			.then(browser => instances.page || browser.newPage())
			.then(page => {
				instances.page = page;
				return page.goto(url, { timeout });
			})
			.then(() => instances.page);
	}

	function closeBrowserInstance () {
		return Promise.resolve()
			.then(() => instances.browser && instances.browser.close())
			.then(() => { instances.browser = null; instances.page = null; });
	}

	return {
		getBrowserInstance,
		getPageInstanceToUrl,
		closeBrowserInstance,
	};
}

module.exports = {
	createInstance,
};
