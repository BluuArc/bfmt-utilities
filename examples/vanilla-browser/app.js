(function(inputWindow) {
	const BASE_DATAMINE_URL = 'https://joshuacastor.me/bfmt-data/gl';

	function fetchJson (url) {
		return inputWindow.fetch(url)
			.then(r => r.ok ? r.json() : (void 0));
	}

	/**
	 * @type {import('../../src/index')}
	 */
	const bfmtUtilities = inputWindow.bfmtUtilities;

	/**
	 * @typedef {{ [key: string]: import('../../src/datamine-types').IUnit}} UnitData
	 */

	/**
	 * @param {HTMLSelectElement} selectElement
	 * @param {Array<{ label: string, value: string }>} options
	 */
	function setOptionsOnSelectElement (selectElement, options = []) {
		selectElement.querySelectorAll('option').forEach(option => {
			option.remove();
		});
		const optionElements = options.map(config => {
			const optionElement = inputWindow.document.createElement('option');
			optionElement.value = config.value;
			optionElement.innerText = config.label;
			return optionElement;
		});
		selectElement.append.apply(selectElement, optionElements);
	}

	/**
	 * @param {UnitData} unitData
	 */
	function initializeSelect (unitData = {}) {
		const ids = Object.keys(unitData);
		const unitSelectorElement = inputWindow.document.querySelector('select[name="unit-selector"]');
		let options = [];
		if (ids.length === 0) {
			options.push({ label: 'Error getting units.', value: '' });
		} else {
			options = [{ label: 'Select a unit.', value: '' }]
				.concat(ids.map(id => {
					const unit = unitData[id];
					return {
						label: unit.name,
						value: id,
					};
				}));
		}
		setOptionsOnSelectElement(unitSelectorElement, options);
		unitSelectorElement.disabled = false;
		unitSelectorElement.addEventListener('change', (event) => onSelectedElementChange(event, unitData));
	}

	/**
	 * @param {Event} event
	 */
	async function onSelectedElementChange (event, unitData) {
		const unitDetailsArea = inputWindow.document.querySelector('.unit-details');
		if (!unitDetailsArea) {
			return;
		}

		const detailSections = {
			name: unitDetailsArea.querySelector('.unit-name'),
			ls: unitDetailsArea.querySelector('.leader-skill-details'),
			es: unitDetailsArea.querySelector('.extra-skill-details'),
			bb: unitDetailsArea.querySelector('.brave-burst-details'),
			sbb: unitDetailsArea.querySelector('.super-brave-burst-details'),
			ubb: unitDetailsArea.querySelector('.ultimate-brave-burst-details'),
			sp: unitDetailsArea.querySelector('.enhancement-details'),
		};
		const selectedId = event && event.target && event.target.value;
		/**
		 * @type {import('../../src/datamine-types').IUnit}
		 */
		const unit = !!selectedId && unitData[selectedId] && await fetchJson(`${BASE_DATAMINE_URL}/unit/${selectedId}.json`);
		if (unit) {
			console.info('selected unit', unit);
			detailSections.name.innerText = unit.name;
			setEffectsListForSection(
				detailSections.ls,
				unit['leader skill'] && unit['leader skill'].name,
				bfmtUtilities.leaderSkills.getEffectsForLeaderSkill(unit['leader skill']),
				{
					source: bfmtUtilities.buffs.parsers.BuffSource.LeaderSkill,
					sourceId: unit['leader skill'].id,
				},
			);
			if (unit['extra skill']) {
				setEffectsListForSection(
					detailSections.es,
					unit['extra skill'].name,
					bfmtUtilities.extraSkills.getEffectsForExtraSkill(unit['extra skill']),
					{
						source: bfmtUtilities.buffs.parsers.BuffSource.ExtraSkill,
						sourceId: unit['extra skill'].id,
					},
				);
				detailSections.es.removeAttribute('hidden');
			} else {
				detailSections.es.setAttribute('hidden', '');
			}

			setEffectsListForSection(
				detailSections.bb,
				unit.bb && unit.bb.name,
				bfmtUtilities.bursts.getEffectsForBurst(unit.bb),
				{
					source: bfmtUtilities.buffs.parsers.BuffSource.BraveBurst,
					sourceId: unit.bb.id,
					damageFrames: unit.bb["damage frames"],
				},
			);
			if (unit.sbb) {
				setEffectsListForSection(
					detailSections.sbb,
					unit.sbb.name,
					bfmtUtilities.bursts.getEffectsForBurst(unit.sbb),
					{
						source: bfmtUtilities.buffs.parsers.BuffSource.SuperBraveBurst,
						sourceId: unit.sbb.id,
						damageFrames: unit.sbb["damage frames"],
					},
				);
				detailSections.sbb.removeAttribute('hidden');
			} else {
				detailSections.sbb.setAttribute('hidden', '');
			}
			if (unit.ubb) {
				setEffectsListForSection(
					detailSections.ubb,
					unit.ubb.name,
					bfmtUtilities.bursts.getEffectsForBurst(unit.ubb),
					{
						source: bfmtUtilities.buffs.parsers.BuffSource.UltimateBraveBurst,
						sourceId: unit.ubb.id,
						damageFrames: unit.ubb["damage frames"],
					},
				);
				detailSections.ubb.removeAttribute('hidden');
			} else {
				detailSections.ubb.setAttribute('hidden', '');
			}

			if (unit.feskills) {
				setEffectsForSpSection(detailSections.sp, unit.feskills);
				detailSections.sp.removeAttribute('hidden');
			} else {
				detailSections.sp.setAttribute('hidden', '');
			}

			unitDetailsArea.removeAttribute('hidden');
		} else {
			unitDetailsArea.setAttribute('hidden', '');
		}
	}

	/**
	 * @param {import('../../src/datamine-types').PassiveEffect | import('../../src/datamine-types').ProcEffect} effect
	 * @param {import('../../src/buffs/parsers/buff-types').IEffectToBuffConversionContext} context
	 */
	function generateBuffListForEffect (effect, context) {
		const buffList = document.createElement('ul');
		let buffs;
		if (bfmtUtilities.buffs.isPassiveEffect(effect)) {
			buffs = bfmtUtilities.buffs.parsers.convertPassiveEffectToBuffs(effect, context);
		} else {
			buffs = bfmtUtilities.buffs.parsers.convertProcEffectToBuffs(effect, context);
		}

		buffs.forEach((buff) => {
			const buffEntry = document.createElement('li');
			const metadata = bfmtUtilities.buffs.parsers.getMetadataForBuff(buff.id);
			const name = (metadata && metadata.name) || `Unknown buff ${buff.id}`;
			buffEntry.innerText = `${name}: ${JSON.stringify(buff)}`;
			buffList.appendChild(buffEntry);
		});

		return buffList;
	}

	/**
	 * @param {HTMLElement} section
	 * @param {string} name
	 * @param {Array<import('../../src/datamine-types').PassiveEffect | import('../../src/datamine-types').ProcEffect>} effects
	 * @param {import('../../src/buffs/parsers/buff-types').IEffectToBuffConversionContext} context
	 */
	function setEffectsListForSection (section, name, effects, context) {
		const nameField = section.querySelector('.name');
		if (nameField) {
			nameField.innerText = name || 'None';
		}

		const effectList = section.querySelector('ul');
		if (effectList) {
			effectList.innerHTML = '';
			let entries = [];
			if (effects.length > 0) {
				const hasMultipleDamageFrames = Array.isArray(context.damageFrames);
				entries = effects.map((effect, index) => {
					let localContext;
					if (hasMultipleDamageFrames) {
						localContext = {
							...context,
							damageFrames: context.damageFrames[index],
						};
					} else {
						localContext = context;
					}
					const entry = inputWindow.document.createElement('li');
					entry.innerText = `${bfmtUtilities.buffs.getEffectName(effect)}: ${JSON.stringify(effect)}`;
					entry.appendChild(generateBuffListForEffect(effect, localContext));
					return entry;
				});
			} else {
				const noEffectsEntry = inputWindow.document.createElement('li');
				noEffectsEntry.innerText = 'None';
				entries.push(noEffectsEntry);
			}
			effectList.append.apply(effectList, entries);
		}
	}

	/**
	 * @param {HTMLElement} section
	 * @param {import('../../src/datamine-types').ISpEnhancementEntry[]} spEntries
	 * @param {import('../../src/buffs/parsers/buff-types').IEffectToBuffConversionContext} context
	 */
	function setEffectsForSpSection (section, spEntries, context) {
		const skillList = section.querySelector('ol');
		if (skillList) {
			skillList.innerHTML = '';
			let entries = [];
			if (spEntries.length > 0) {
				entries = spEntries.map((spEntry, index) => {
					const htmlEntry = inputWindow.document.createElement('li');

					// get effects for current SP entry
					const effectListWrapper = inputWindow.document.createElement('ul');
					const effects = bfmtUtilities.spEnhancements.getEffectsForSpEnhancement(spEntry);
					/**
					 * @type {import('../../src/buffs/parsers/buff-types').IEffectToBuffConversionContext}
					 */
					const localContext = {
						...context,
						source: bfmtUtilities.buffs.parsers.BuffSource.SpEnhancement,
						sourceId: bfmtUtilities.spEnhancements.spIndexToCode(index),
					};
					const effectHtmlEntries = effects.map(effect => {
						const entry = inputWindow.document.createElement('li');
						entry.innerText = `${bfmtUtilities.buffs.getEffectName(effect)}: ${JSON.stringify(effect)}`;
						entry.appendChild(generateBuffListForEffect(effect, localContext));
						return entry;
					});
					effectListWrapper.append.apply(effectListWrapper, effectHtmlEntries);

					// get SP description
					const description = inputWindow.document.createElement('p');
					description.innerText = spEntry.skill.name || spEntry.skill.desc;

					htmlEntry.append.apply(htmlEntry, [description, effectListWrapper]);
					return htmlEntry;
				});
			} else {
				const noneEntry = inputWindow.document.createElement('li');
				noneEntry.innerText = 'None';
				entries.push(noneEntry);
			}
			skillList.append.apply(skillList, entries);
		}
	}

	function initializeApp () {
		const unitSelectorElement = inputWindow.document.querySelector('select[name="unit-selector"]');
		setOptionsOnSelectElement(unitSelectorElement, [{ label: 'Loading data...', value: '' }]);

		fetchJson(`${BASE_DATAMINE_URL}/unit/bfmt_update-stats.json`)
			.then((unitData = {}) => initializeSelect(unitData));
	}

	/**
	 * @type {HTMLButtonElement}
	 */
	const loadButton = document.querySelector('button[name="load-units-button"]');
	if (loadButton) {
		loadButton.addEventListener('click', initializeApp);
	}
})(self);
