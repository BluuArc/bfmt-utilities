// based off of https://github.com/Asmor/gs-loader
const { createInstance } = require('./puppeteer-wrapper');
const { createLogger } = require('./logger');

function getGoogleSpreadsheetContents (url, logger = createLogger('GS-Scraper')) {
	const instance = createInstance();
	logger.log(`fetching contents for ${url}`);
	return instance.getPageInstanceToUrl({ url })
		.then(page => {
			return page.evaluate(() => {
				return new Promise((fulfill, reject) => {
					/* global document */
					function onReady () {
						try {
							const sheets = Array.from(document.querySelectorAll('ul#sheet-menu li')).map(listElem => {
								return {
									name: listElem.innerText,
									id: listElem.id.split('button-')[1], // sheet-button-<sheet-id>
								};
							});
							const sheetMapping = {};
							sheets.forEach(sheet => {
								// assumption: one table per sheet
								const rows = [];
								const sheetTable = document.getElementById(sheet.id);
								const [headerRow, ...tableRows] = Array.from(sheetTable.querySelectorAll('tbody tr'));
	
								const columnMapping = Array.from(headerRow.querySelectorAll('td'))
									.map((elem, i) => elem.innerText.trim() || `col-${i}`);
								const createRowDataObject = (row) => {
									const dataCells = Array.from(row.querySelectorAll('td')).map(e => e.innerText.trim());
									return columnMapping.reduce((acc, columnName, index) => {
										acc[columnName] = dataCells[index];
										return acc;
									}, {});
								};
	
								tableRows.forEach(row => {
									rows.push(createRowDataObject(row));
								});
	
								sheetMapping[`${sheet.name}|${sheet.id}`] = rows;
							});
							fulfill(sheetMapping);
						} catch (err) {
							reject(err);
						}
					}
					if (document.readyState === 'complete') {
						onReady();
					} else {
						document.onreadystatechange = () => onReady();
					}
				});
			});
		}).then(contents => {
			logger.log(`fetched contents for ${url}`);
			return contents;
		}).finally(result => {
			return instance.closeBrowserInstance()
				.catch((err) => { logger.error(err); })
				.then(() => result);
		});
}

module.exports = {
	getGoogleSpreadsheetContents,
};
