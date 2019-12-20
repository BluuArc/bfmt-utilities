const bfmtUtilities = require('../../dist/index.cjs');
const fetch = require('node-fetch');

/**
 * @typedef {{ [key: string]: import('../../src/datamine-types').IUnit}} UnitData
 */

/**
 * @returns {Promise<UnitData>}
 */
function loadDatamineData () {
	const BASE_DATAMINE_URL = 'https://raw.githubusercontent.com/cheahjs/bravefrontier_data/master';
	const unitDataPromise = fetch(`${BASE_DATAMINE_URL}/info.json`)
		.then(r => r.ok ? r.json() : ({}));
	const spDataPromise = fetch(`${BASE_DATAMINE_URL}/feskills.json`)
		.then(r => r.ok ? r.json() : ({}));

	return Promise.all([unitDataPromise, spDataPromise])
		.then(([unitData = {}, spData = {}]) => {
			// add SP data to each unit
			Object.keys(spData).forEach(spKey => {
				if (Object.prototype.hasOwnProperty.call(unitData, spKey)) {
					unitData[spKey].feskills = spData[spKey].skills;
				}
			});
			return unitData;
		});
}

/**
 * @param {string} sectionName
 * @param {string} name
 * @param {Array<import('../../src/datamine-types').PassiveEffect | import('../../src/datamine-types').ProcEffect>} effects
 * @returns {string[]}
 */
function getDisplayDataForSection (sectionName, name, effects) {
	let entries = [];
	if (effects.length > 0) {
		entries = effects.map(effect => `${bfmtUtilities.buffs.getEffectName(effect)}: ${JSON.stringify(effect)}`);
	} else {
		entries.push('None');
	}
	return [
		`${sectionName}: ${name || 'None'}`,
		...entries.map(e => `* ${e}`),
		'',
	];
}

/**
 * @param {import('../../src/datamine-types').ISpEnhancementEntry[]} spEntries
 * @returns {string[]}
 */
function getDisplayDataForSp (spEntries) {
	let entries = [];
	if (spEntries.length > 0) {
		entries = spEntries.reduce((acc, spEntry, index) => {
			const title = spEntry.skill.name || spEntry.skill.desc;

			const effects = bfmtUtilities.spEnhancements.getEffectsForSpEnhancement(spEntry);
			return acc.concat([`${index}: ${title}`].concat(effects.map(e => `  * ${JSON.stringify(e)}`)));
		}, []);
	} else {
		entries.push('None');
	}
	return [
		'SP Enhancements',
		...entries,
		'',
	];
}

/**
 * @param {import('../../src/datamine-types').IUnit} unit
 */
function displayDataForUnit (unit) {
	const dataToDisplay = [];
	dataToDisplay.push(`\n[Effects for ${unit.name}]\n`);

	dataToDisplay.push(...getDisplayDataForSection('Leader Skill', unit['leader skill'] && unit['leader skill'].name, bfmtUtilities.leaderSkills.getEffectsForLeaderSkill(unit['leader skill'])));
	if (unit['extra skill']) {
		dataToDisplay.push(...getDisplayDataForSection('Extra Skill', unit['extra skill'] && unit['extra skill'].name, bfmtUtilities.extraSkills.getEffectsForExtraSkill(unit['extra skill'])));
	}

	dataToDisplay.push(...getDisplayDataForSection('Brave Burst', unit.bb && unit.bb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.bb)));
	if (unit.sbb) {
		dataToDisplay.push(...getDisplayDataForSection('Super Brave Burst', unit.sbb && unit.sbb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.sbb)));
	}
	if (unit.ubb) {
		dataToDisplay.push(...getDisplayDataForSection('Ultimate Brave Burst', unit.ubb && unit.ubb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.ubb)));
	}

	if (unit.feskills) {
		dataToDisplay.push(...getDisplayDataForSp(unit.feskills));
	}

	dataToDisplay.forEach(dataEntry => {
		console.log(dataEntry);
	});
}

Promise.resolve()
	.then(() => {
		console.log('Fetching datamine data...');
		return loadDatamineData();
	}).then(unitData => {
		const allKeys = Object.keys(unitData);
		const randomKey = allKeys[Math.floor((allKeys.length + 1) * Math.random())];
		console.log(`Selected random ID to display: ${randomKey}`);
		return {
			unitData,
			id: randomKey,
		};
	}).then(({ unitData, id }) => {
		displayDataForUnit(unitData[id]);
	});
