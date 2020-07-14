const { BUFF_METADATA } = require('./buff-metadata');
const { BuffId, IconId } = require('./buff-types');
const { getStringValueForLog } = require('../../_test-helpers/utils');
const { TargetArea, UnitElement, UnitType } = require('../../datamine-types');

describe('BUFF_METADATA entries', () => {
	const expectIconsToBeValid = (icons = []) => {
		icons.forEach((icon) => {
			expect(icon in IconId)
				.withContext(`"${icon}" should be in IconId enum`)
				.toBeTrue();
		});
	};

	const testDefaultIconResult = (buffId, expectedIcons) => {
		it(`returns ${getStringValueForLog(expectedIcons)} for icons`, () => {
			expect(BUFF_METADATA[buffId].icons()).toEqual(expectedIcons);
			expectIconsToBeValid(expectedIcons);
		});
	};

	const testIconResultWithBuff = (buffId, expectedIcons, buff, caseName) => {
		it(`returns ${getStringValueForLog(expectedIcons)} for icons when ${caseName}`, () => {
			expect(BUFF_METADATA[buffId].icons(buff)).toEqual(expectedIcons);
			expectIconsToBeValid(expectedIcons);
		});
	};

	it('all have functions for their "icons" property', () => {
		Object.values(BUFF_METADATA).forEach((entry) => {
			expect(typeof entry.icons)
				.withContext(`${entry.id} should have function for icons property`)
				.toBe('function');
		});
	});

	describe('UNKNOWN_PASSIVE_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PASSIVE_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_PASSIVE_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('passive 1 buffs', () => {
		describe('passive:1:hp', () => {
			testDefaultIconResult(BuffId['passive:1:hp'], [IconId.BUFF_HPUP]);
			testIconResultWithBuff(BuffId['passive:1:hp'], [IconId.BUFF_HPDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:1:atk', () => {
			testDefaultIconResult(BuffId['passive:1:atk'], [IconId.BUFF_ATKUP]);
			testIconResultWithBuff(BuffId['passive:1:atk'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:1:def', () => {
			testDefaultIconResult(BuffId['passive:1:def'], [IconId.BUFF_DEFUP]);
			testIconResultWithBuff(BuffId['passive:1:def'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:1:rec', () => {
			testDefaultIconResult(BuffId['passive:1:rec'], [IconId.BUFF_RECUP]);
			testIconResultWithBuff(BuffId['passive:1:rec'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:1:crit', () => {
			testDefaultIconResult(BuffId['passive:1:crit'], [IconId.BUFF_CRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:1:crit'], [IconId.BUFF_CRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 2 buffs', () => {
		const POSSIBLE_KNOWN_ELEMENTS = [
			UnitElement.Fire,
			UnitElement.Water,
			UnitElement.Earth,
			UnitElement.Thunder,
			UnitElement.Light,
			UnitElement.Dark,
		];
		/**
		 * @param {string} stat
		 */
		const testElementalVariantsAndPolarities = (stat) => {
			[-1, 1].forEach((polarityValue) => {
				const polarityKey = polarityValue < 0 ? 'DOWN' : 'UP';
				const polarityCase = polarityValue < 0 ? 'negative' : 'positive';
				const iconStatKey = stat !== 'crit' ? stat.toUpperCase() : 'CRTRATE';
				POSSIBLE_KNOWN_ELEMENTS.forEach((element) => {
					testIconResultWithBuff(
						BuffId[`passive:2:${stat}`],
						[IconId[`BUFF_${element.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetElements: [element] }},
						`buff value is ${polarityCase} and first target element condition is ${element}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`passive:2:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:2:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no target element conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:2:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetConditions: [] } },
					`buff value is ${polarityCase} and target element conditions array is empty`,
				);

				testIconResultWithBuff(
					BuffId[`passive:2:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: [{ arbitrary: 'value' }] } },
					`buff value is ${polarityCase} and a non-string element is given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:2:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: ['a fake element']} },
					`buff value is ${polarityCase} and an invalid target condition element is given`,
				);
			});
		};

		describe('passive:2:hp', () => {
			testDefaultIconResult(BuffId['passive:2:hp'], [IconId.BUFF_ELEMENTHPUP]);
			testElementalVariantsAndPolarities('hp');
		});

		describe('passive:2:atk', () => {
			testDefaultIconResult(BuffId['passive:2:atk'], [IconId.BUFF_ELEMENTATKUP]);
			testElementalVariantsAndPolarities('atk');
		});

		describe('passive:2:def', () => {
			testDefaultIconResult(BuffId['passive:2:def'], [IconId.BUFF_ELEMENTDEFUP]);
			testElementalVariantsAndPolarities('def');
		});

		describe('passive:2:rec', () => {
			testDefaultIconResult(BuffId['passive:2:rec'], [IconId.BUFF_ELEMENTRECUP]);
			testElementalVariantsAndPolarities('rec');
		});

		describe('passive:2:crit', () => {
			testDefaultIconResult(BuffId['passive:2:crit'], [IconId.BUFF_ELEMENTCRTRATEUP]);
			testElementalVariantsAndPolarities('crit');
		});
	});

	describe('passive 3 buffs', () => {
		const POSSIBLE_KNOWN_UNIT_TYPES = [
			UnitType.Lord,
			UnitType.Anima,
			UnitType.Breaker,
			UnitType.Guardian,
			UnitType.Oracle,
			UnitType.Rex,
		];

		/**
		 * @param {string} stat
		 */
		const testUnitTypeVariantsAndPolarities = (stat) => {
			[-1, 1].forEach((polarityValue) => {
				const polarityKey = polarityValue < 0 ? 'DOWN' : 'UP';
				const polarityCase = polarityValue < 0 ? 'negative' : 'positive';
				const iconStatKey = stat !== 'crit' ? stat.toUpperCase() : 'CRTRATE';
				POSSIBLE_KNOWN_UNIT_TYPES.forEach((unitType) => {
					testIconResultWithBuff(
						BuffId[`passive:3:${stat}`],
						[IconId[`BUFF_${unitType.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetUnitType: unitType } },
						`buff value is ${polarityCase} and target unit type is ${unitType}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`passive:3:${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no unit type conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: '' } },
					`buff value is ${polarityCase} and unit type condition is empty`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: { arbitrary: 'value' } } },
					`buff value is ${polarityCase} and a non-string unit type is given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: 'a fake type' } },
					`buff value is ${polarityCase} and an invalid target unit type is given`,
				);
			});
		};

		describe('passive:3:hp', () => {
			testDefaultIconResult(BuffId['passive:3:hp'], [IconId.BUFF_UNITTYPEHPUP]);
			testUnitTypeVariantsAndPolarities('hp');
		});

		describe('passive:3:atk', () => {
			testDefaultIconResult(BuffId['passive:3:atk'], [IconId.BUFF_UNITTYPEATKUP]);
			testUnitTypeVariantsAndPolarities('atk');
		});

		describe('passive:3:def', () => {
			testDefaultIconResult(BuffId['passive:3:def'], [IconId.BUFF_UNITTYPEDEFUP]);
			testUnitTypeVariantsAndPolarities('def');
		});

		describe('passive:3:rec', () => {
			testDefaultIconResult(BuffId['passive:3:rec'], [IconId.BUFF_UNITTYPERECUP]);
			testUnitTypeVariantsAndPolarities('rec');
		});

		describe('passive:3:crit', () => {
			testDefaultIconResult(BuffId['passive:3:crit'], [IconId.BUFF_UNITTYPECRTRATEUP]);
			testUnitTypeVariantsAndPolarities('crit');
		});
	});

	describe('UNKNOWN_PROC_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_PROC_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('proc:1', () => {
		testDefaultIconResult(BuffId['proc:1'], [IconId.ATK_AOE]);
		testIconResultWithBuff(BuffId['proc:1'], [IconId.ATK_ST], { targetArea: TargetArea.Single });
	});

	describe('proc:2', () => {
		testDefaultIconResult(BuffId['proc:2'], [IconId.BUFF_HPREC]);
	});
});
