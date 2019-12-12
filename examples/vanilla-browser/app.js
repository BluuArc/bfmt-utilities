(function(inputWindow) {
	const BASE_DATAMINE_URL = 'https://raw.githubusercontent.com/cheahjs/bravefrontier_data/master';
	const unitDataPromise = inputWindow.fetch(`${BASE_DATAMINE_URL}/info.json`).then(r => r.ok ? r.json() : {});

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
	 * @param {{ [key: string]: import('../../src/datamine-types').IUnit}} unitData 
	 */
	function initializeSelect (unitData = {}) {
		const ids = Object.keys(unitData);
		const unitSelectorElement = inputWindow.document.querySelector('select[name="Unit Selector"]');
		let options = [];
		if (ids.length > 0) {
			options.push({ label: 'Error getting units.', value: '' });
		} else {
			options = ids.map(id => {
				const unit = unitData[id];
				return {
					label: unit.name,
					value: id,
				};
			});
		}
		setOptionsOnSelectElement(unitSelectorElement, options);
	}

	unitDataPromise.then(initializeSelect);
})(self);
