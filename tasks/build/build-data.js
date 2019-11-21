const { getGoogleSpreadsheetContents } = require('../utils/gs-scraper');
const { createLogger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const PUBLIC_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQq5h9NWuJ-1N--XE1Opd3f-0RrvSIxkANGuv05HdfV4FiRAi65mvdY7E9MwV08GwGeV_xLfxMVnNoe/pubhtml#';

function updateBuffMetadata (done) {
	const logger = createLogger('getBuffMetadata');
	return getGoogleSpreadsheetContents(PUBLIC_SPREADSHEET_URL)
		.then(sheetData => {
			if (sheetData) {
				logger.log('storing buff metadata');
				const addTableDataToMapping = (tableData = [], mapping = {}, columnKeyName, columnsToStore = []) => {
					const getAllColumns = columnsToStore.length === 0;
					tableData.forEach(entry => {
						let entryToStore;
						if (getAllColumns) {
							entryToStore = entry;
						} else {
							entryToStore = columnsToStore.reduce((acc, key) => {
								// eslint-disable-next-line no-prototype-builtins
								if (entry.hasOwnProperty(key)) {
									acc[key] = entry[key];
								}
								return acc;
							}, {});
						}

						mapping[entry[columnKeyName]] = entryToStore;
					});
				};

				const mapping = {
					passive: {},
					proc: {},
				};
				const passiveTable = sheetData[Object.keys(sheetData).find(k => k.startsWith('Passive'))];
				addTableDataToMapping(passiveTable, mapping.passive, 'ID', ['ID', 'Name']);

				const procTable = sheetData[Object.keys(sheetData).find(k => k.startsWith('Proc'))];
				addTableDataToMapping(procTable, mapping.proc, 'ID', ['ID', 'Name', 'Type']);

				fs.writeFileSync(path.join(__dirname, '..', '..', 'src', 'buff-metadata.json'), JSON.stringify(mapping, null, 2), 'utf8');
			} else {
				logger.error('no metadata retrieved');
			}
			done();
		});
}

module.exports = {
	updateBuffMetadata,
};
