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

	describe('TURN_DURATION_MODIFICATION', () => {
		testDefaultIconResult(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP]);
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP], {}, 'no value property is given');
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP], { value: {} }, 'value property exists but no duration value is given');
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_DOWN], { value: { duration: -1 } }, 'buff duration value is less than 0');
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

	describe('passive 4 buffs', () => {
		describe('passive:4:poison', () => {
			testDefaultIconResult(BuffId['passive:4:poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('passive:4:weak', () => {
			testDefaultIconResult(BuffId['passive:4:weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('passive:4:sick', () => {
			testDefaultIconResult(BuffId['passive:4:sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('passive:4:injury', () => {
			testDefaultIconResult(BuffId['passive:4:injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('passive:4:curse', () => {
			testDefaultIconResult(BuffId['passive:4:curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('passive:4:paralysis', () => {
			testDefaultIconResult(BuffId['passive:4:paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});
	});

	describe('passive 5 buffs', () => {
		describe('passive:5:fire', () => {
			testDefaultIconResult(BuffId['passive:5:fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('passive:5:water', () => {
			testDefaultIconResult(BuffId['passive:5:water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('passive:5:earth', () => {
			testDefaultIconResult(BuffId['passive:5:earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('passive:5:thunder', () => {
			testDefaultIconResult(BuffId['passive:5:thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('passive:5:light', () => {
			testDefaultIconResult(BuffId['passive:5:light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('passive:5:dark', () => {
			testDefaultIconResult(BuffId['passive:5:dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('passive:5:unknown', () => {
			testDefaultIconResult(BuffId['passive:5:unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('passive:8', () => {
		testDefaultIconResult(BuffId['passive:8'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('passive:9', () => {
		testDefaultIconResult(BuffId['passive:9'], [IconId.BUFF_BBREC]);
	});

	describe('passive:10', () => {
		testDefaultIconResult(BuffId['passive:10'], [IconId.BUFF_HCREC]);
	});

	describe('passive 11 buffs', () => {
		describe('passive:11:atk', () => {
			testDefaultIconResult(BuffId['passive:11:atk'], [IconId.BUFF_HPTHRESHATKUP]);
			testIconResultWithBuff(BuffId['passive:11:atk'], [IconId.BUFF_HPTHRESHATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:def', () => {
			testDefaultIconResult(BuffId['passive:11:def'], [IconId.BUFF_HPTHRESHDEFUP]);
			testIconResultWithBuff(BuffId['passive:11:def'], [IconId.BUFF_HPTHRESHDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:rec', () => {
			testDefaultIconResult(BuffId['passive:11:rec'], [IconId.BUFF_HPTHRESHRECUP]);
			testIconResultWithBuff(BuffId['passive:11:rec'], [IconId.BUFF_HPTHRESHRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:crit', () => {
			testDefaultIconResult(BuffId['passive:11:crit'], [IconId.BUFF_HPTHRESHCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:11:crit'], [IconId.BUFF_HPTHRESHCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 12 buffs', () => {
		describe('passive:12:bc', () => {
			testDefaultIconResult(BuffId['passive:12:bc'], [IconId.BUFF_BCDROP]);
			testIconResultWithBuff(BuffId['passive:12:bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hc', () => {
			testDefaultIconResult(BuffId['passive:12:hc'], [IconId.BUFF_HCDROP]);
			testIconResultWithBuff(BuffId['passive:12:hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:item', () => {
			testDefaultIconResult(BuffId['passive:12:item'], [IconId.BUFF_ITEMDROP]);
			testIconResultWithBuff(BuffId['passive:12:item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:zel', () => {
			testDefaultIconResult(BuffId['passive:12:zel'], [IconId.BUFF_ZELDROP]);
			testIconResultWithBuff(BuffId['passive:12:zel'], [IconId.BUFF_ZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:karma', () => {
			testDefaultIconResult(BuffId['passive:12:karma'], [IconId.BUFF_KARMADROP]);
			testIconResultWithBuff(BuffId['passive:12:karma'], [IconId.BUFF_KARMADOWN], { value: -1 }, 'buff value is less than 0');
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

	describe('proc:3', () => {
		testDefaultIconResult(BuffId['proc:3'], [IconId.BUFF_HPREC]);
	});

	describe('proc 4 buffs', () => {
		describe('proc:4:flat', () => {
			testDefaultIconResult(BuffId['proc:4:flat'], [IconId.BUFF_BBREC]);
		});

		describe('proc:4:percent', () => {
			testDefaultIconResult(BuffId['proc:4:percent'], [IconId.BUFF_BBREC]);
		});
	});

	describe('proc 5 buffs', () => {
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
						BuffId[`proc:5:${stat}`],
						[IconId[`BUFF_${element.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetElements: [element] } },
						`buff value is ${polarityCase} and first target element condition is ${element}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`proc:5:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:5:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no target element conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:5:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetConditions: [] } },
					`buff value is ${polarityCase} and target element conditions array is empty`,
				);

				testIconResultWithBuff(
					BuffId[`proc:5:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: [{ arbitrary: 'value' }] } },
					`buff value is ${polarityCase} and a non-string element is given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:5:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: ['a fake element'] } },
					`buff value is ${polarityCase} and an invalid target condition element is given`,
				);
			});
		};

		describe('proc:5:atk', () => {
			testDefaultIconResult(BuffId['proc:5:atk'], [IconId.BUFF_ATKUP]);
			testElementalVariantsAndPolarities('atk');
		});

		describe('proc:5:def', () => {
			testDefaultIconResult(BuffId['proc:5:def'], [IconId.BUFF_DEFUP]);
			testElementalVariantsAndPolarities('def');
		});

		describe('proc:5:rec', () => {
			testDefaultIconResult(BuffId['proc:5:rec'], [IconId.BUFF_RECUP]);
			testElementalVariantsAndPolarities('rec');
		});

		describe('proc:5:crit', () => {
			testDefaultIconResult(BuffId['proc:5:crit'], [IconId.BUFF_CRTRATEUP]);
			testElementalVariantsAndPolarities('crit');
		});
	});

	describe('proc 6 buffs', () => {
		describe('proc:6:bc', () => {
			testDefaultIconResult(BuffId['proc:6:bc'], [IconId.BUFF_BCDROP]);
			testIconResultWithBuff(BuffId['proc:6:bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:6:hc', () => {
			testDefaultIconResult(BuffId['proc:6:hc'], [IconId.BUFF_HCDROP]);
			testIconResultWithBuff(BuffId['proc:6:hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:6:item', () => {
			testDefaultIconResult(BuffId['proc:6:item'], [IconId.BUFF_ITEMDROP]);
			testIconResultWithBuff(BuffId['proc:6:item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('proc:7', () => {
		testDefaultIconResult(BuffId['proc:7'], [IconId.BUFF_KOBLK]);
	});

	describe('proc 8 buffs', () => {
		describe('proc:8:flat', () => {
			testDefaultIconResult(BuffId['proc:8:flat'], [IconId.BUFF_HPUP]);
		});

		describe('proc:8:percent', () => {
			testDefaultIconResult(BuffId['proc:8:percent'], [IconId.BUFF_HPUP]);
		});
	});

	describe('proc 9 buffs', () => {
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
						BuffId[`proc:9:${stat}`],
						[IconId[`BUFF_${element.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetElements: [element] } },
						`buff value is ${polarityCase} and first target element condition is ${element}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`proc:9:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:9:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no target element conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:9:${stat}`],
					[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetConditions: [] } },
					`buff value is ${polarityCase} and target element conditions array is empty`,
				);

				testIconResultWithBuff(
					BuffId[`proc:9:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: [{ arbitrary: 'value' }] } },
					`buff value is ${polarityCase} and a non-string element is given`,
				);

				testIconResultWithBuff(
					BuffId[`proc:9:${stat}`],
					[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: ['a fake element'] } },
					`buff value is ${polarityCase} and an invalid target condition element is given`,
				);
			});
		};

		describe('proc:9:atk', () => {
			testDefaultIconResult(BuffId['proc:9:atk'], [IconId.BUFF_ATKDOWN]);
			testElementalVariantsAndPolarities('atk');
		});

		describe('proc:9:def', () => {
			testDefaultIconResult(BuffId['proc:9:def'], [IconId.BUFF_DEFDOWN]);
			testElementalVariantsAndPolarities('def');
		});

		describe('proc:9:rec', () => {
			testDefaultIconResult(BuffId['proc:9:rec'], [IconId.BUFF_RECDOWN]);
			testElementalVariantsAndPolarities('rec');
		});

		describe('proc:9:unknown', () => {
			testDefaultIconResult(BuffId['proc:9:unknown'], [IconId.UNKNOWN]);
		});
	});

	describe('proc 10 buffs', () => {
		describe('proc:10:poison', () => {
			testDefaultIconResult(BuffId['proc:10:poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:10:weak', () => {
			testDefaultIconResult(BuffId['proc:10:weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:10:sick', () => {
			testDefaultIconResult(BuffId['proc:10:sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:10:injury', () => {
			testDefaultIconResult(BuffId['proc:10:injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:10:curse', () => {
			testDefaultIconResult(BuffId['proc:10:curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:10:paralysis', () => {
			testDefaultIconResult(BuffId['proc:10:paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});

		describe('proc:10:atk down', () => {
			testDefaultIconResult(BuffId['proc:10:atk down'], [IconId.BUFF_ATKDOWNBLK]);
		});

		describe('proc:10:def down', () => {
			testDefaultIconResult(BuffId['proc:10:def down'], [IconId.BUFF_DEFDOWNBLK]);
		});

		describe('proc:10:rec down', () => {
			testDefaultIconResult(BuffId['proc:10:rec down'], [IconId.BUFF_RECDOWNBLK]);
		});

		describe('proc:10:unknown', () => {
			testDefaultIconResult(BuffId['proc:10:unknown'], [IconId.BUFF_AILMENTBLK]);
		});
	});

	describe('proc 11 buffs', () => {
		describe('proc:11:poison', () => {
			testDefaultIconResult(BuffId['proc:11:poison'], [IconId.DEBUFF_POISON]);
		});

		describe('proc:11:weak', () => {
			testDefaultIconResult(BuffId['proc:11:weak'], [IconId.DEBUFF_WEAK]);
		});

		describe('proc:11:sick', () => {
			testDefaultIconResult(BuffId['proc:11:sick'], [IconId.DEBUFF_SICK]);
		});

		describe('proc:11:injury', () => {
			testDefaultIconResult(BuffId['proc:11:injury'], [IconId.DEBUFF_INJURY]);
		});

		describe('proc:11:curse', () => {
			testDefaultIconResult(BuffId['proc:11:curse'], [IconId.DEBUFF_CURSE]);
		});

		describe('proc:11:paralysis', () => {
			testDefaultIconResult(BuffId['proc:11:paralysis'], [IconId.DEBUFF_PARALYSIS]);
		});

		describe('proc:11:atk down', () => {
			testDefaultIconResult(BuffId['proc:11:atk down'], [IconId.BUFF_ATKDOWN]);
		});

		describe('proc:11:def down', () => {
			testDefaultIconResult(BuffId['proc:11:def down'], [IconId.BUFF_DEFDOWN]);
		});

		describe('proc:11:rec down', () => {
			testDefaultIconResult(BuffId['proc:11:rec down'], [IconId.BUFF_RECDOWN]);
		});

		describe('proc:11:unknown', () => {
			testDefaultIconResult(BuffId['proc:11:unknown'], [IconId.DEBUFF_AILMENT]);
		});
	});

	describe('proc:12', () => {
		testDefaultIconResult(BuffId['proc:12'], [IconId.BUFF_KOBLK]);
	});
});
