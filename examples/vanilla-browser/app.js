(function(inputWindow) {
	const BASE_DATAMINE_URL = 'https://raw.githubusercontent.com/cheahjs/bravefrontier_data/master';

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
		unitSelectorElement.addEventListener('change', event => onSelectedElementChange(event, unitData));
	}

	/**
	 * @param {Event} event
	 * @param {UnitData} unitData
	 */
	function onSelectedElementChange (event, unitData) {
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
		const unit = !!selectedId && unitData[selectedId];
		if (unit) {
			console.info('selected unit', unit);
			detailSections.name.innerText = unit.name;
			setEffectsListForSection(detailSections.ls, unit['leader skill'] && unit['leader skill'].name, bfmtUtilities.leaderSkills.getEffectsForLeaderSkill(unit['leader skill']));
			if (unit['extra skill']) {
				setEffectsListForSection(detailSections.es, unit['extra skill'].name, bfmtUtilities.extraSkills.getEffectsForExtraSkill(unit['extra skill']));
				detailSections.es.removeAttribute('hidden');
			} else {
				detailSections.es.setAttribute('hidden', '');
			}

			setEffectsListForSection(detailSections.bb, unit.bb && unit.bb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.bb));
			if (unit.sbb) {
				setEffectsListForSection(detailSections.sbb, unit.sbb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.sbb));
				detailSections.sbb.removeAttribute('hidden');
			} else {
				detailSections.sbb.setAttribute('hidden', '');
			}
			if (unit.ubb) {
				setEffectsListForSection(detailSections.ubb, unit.ubb.name, bfmtUtilities.bursts.getEffectsForBurst(unit.ubb));
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
	 * @param {HTMLElement} section
	 * @param {string} name
	 * @param {Array<import('../../src/datamine-types').PassiveEffect | import('../../src/datamine-types').ProcEffect>} effects
	 */
	function setEffectsListForSection (section, name, effects) {
		const nameField = section.querySelector('.name');
		if (nameField) {
			nameField.innerText = name || 'None';
		}

		const effectList = section.querySelector('ul');
		if (effectList) {
			effectList.querySelectorAll('li').forEach(entry => entry.remove());
			let entries = [];
			if (effects.length > 0) {
				entries = effects.map(effect => {
					const entry = inputWindow.document.createElement('li');
					entry.innerText = `${bfmtUtilities.buffs.getEffectName(effect)}: ${JSON.stringify(effect)}`;
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
	 */
	function setEffectsForSpSection (section, spEntries) {
		const skillList = section.querySelector('ol');
		if (skillList) {
			skillList.querySelectorAll('li').forEach(entry => entry.remove());
			let entries = [];
			if (spEntries.length > 0) {
				entries = spEntries.map(spEntry => {
					const htmlEntry = inputWindow.document.createElement('li');

					// get effects for current SP entry
					const effectListWrapper = inputWindow.document.createElement('ul');
					const effects = bfmtUtilities.spEnhancements.getEffectsForSpEnhancement(spEntry);
					const effectHtmlEntries = effects.map(effect => {
						const entry = inputWindow.document.createElement('li');
						entry.innerText = `${bfmtUtilities.buffs.getEffectName(effect)}: ${JSON.stringify(effect)}`;
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

		const unitDataPromise = inputWindow.fetch(`${BASE_DATAMINE_URL}/info.json`)
			.then(r => r.ok ? r.json() : ({}));
		const enhancementDataPromise = inputWindow.Promise.resolve().then(() => {
			/**
			 * @type {HTMLInputElement}
			 */
			const spCheckbox = inputWindow.document.querySelector('input[name="load-sp-checkbox"]');
			const loadSp = !!spCheckbox && !!spCheckbox.checked;
			return loadSp ? inputWindow.fetch(`${BASE_DATAMINE_URL}/feskills.json`).then(r => r.ok ? r.json() : ({})) : {};
		}).catch(() => ({}));

		inputWindow.Promise.all([unitDataPromise, enhancementDataPromise])
			.then(([unitData = {}, spData = {}]) => {
				// add SP data to each unit
				Object.keys(spData).forEach(spKey => {
					if (unitData.hasOwnProperty(spKey)) {
						unitData[spKey].feskills = spData[spKey].skills;
					}
				});

				return initializeSelect(unitData);
			});
	}

	/**
	 * @type {HTMLButtonElement}
	 */
	const loadButton = document.querySelector('button[name="load-units-button"]');
	if (loadButton) {
		loadButton.addEventListener('click', initializeApp);
	}
})(self);
