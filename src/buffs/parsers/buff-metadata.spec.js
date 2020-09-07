const { BUFF_METADATA } = require('./buff-metadata');
const { BuffId, IconId } = require('./buff-types');
const { getStringValueForLog } = require('../../_test-helpers/utils');
const { TargetArea, UnitElement, UnitType, UnitGender } = require('../../datamine-types');

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

	/**
	 * @param {string} buffId
	 * @param {string[]} expectedIcons
	 * @param {import('./buff-types').IBuff} buff
	 * @param {string} caseName
	 */
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

	it('all have IDs matching their key', () => {
		Object.entries(BUFF_METADATA).forEach(([key, entry]) => {
			expect(key).toEqual(entry.id);
		});
	});

	describe('TURN_DURATION_MODIFICATION', () => {
		testDefaultIconResult(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP]);
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP], {}, 'no value property is given');
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_UP], { value: {} }, 'value property exists but no duration value is given');
		testIconResultWithBuff(BuffId.TURN_DURATION_MODIFICATION, [IconId.TURN_DURATION_DOWN], { value: { duration: -1 } }, 'buff duration value is less than 0');
	});

	describe('NO_PARAMS_SPECIFIED', () => {
		testDefaultIconResult(BuffId.NO_PARAMS_SPECIFIED, [IconId.UNKNOWN]);
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
			testDefaultIconResult(BuffId['passive:12:bc'], [IconId.BUFF_HPTHRESHBCDROP]);
			testIconResultWithBuff(BuffId['passive:12:bc'], [IconId.BUFF_HPTHRESHBCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hc', () => {
			testDefaultIconResult(BuffId['passive:12:hc'], [IconId.BUFF_HPTHRESHHCDROP]);
			testIconResultWithBuff(BuffId['passive:12:hc'], [IconId.BUFF_HPTHRESHHCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:item', () => {
			testDefaultIconResult(BuffId['passive:12:item'], [IconId.BUFF_HPTHRESHITEMDROP]);
			testIconResultWithBuff(BuffId['passive:12:item'], [IconId.BUFF_HPTHRESHITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:zel', () => {
			testDefaultIconResult(BuffId['passive:12:zel'], [IconId.BUFF_HPTHRESHZELDROP]);
			testIconResultWithBuff(BuffId['passive:12:zel'], [IconId.BUFF_HPTHRESHZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:karma', () => {
			testDefaultIconResult(BuffId['passive:12:karma'], [IconId.BUFF_HPTHRESHKARMADROP]);
			testIconResultWithBuff(BuffId['passive:12:karma'], [IconId.BUFF_HPTHRESHKARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:13', () => {
		testDefaultIconResult(BuffId['passive:13'], [IconId.BUFF_BBREC]);
	});

	describe('passive:14', () => {
		testDefaultIconResult(BuffId['passive:14'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('passive:15', () => {
		testDefaultIconResult(BuffId['passive:15'], [IconId.BUFF_HPREC]);
	});

	describe('passive:16', () => {
		testDefaultIconResult(BuffId['passive:16'], [IconId.BUFF_HPREC]);
	});

	describe('passive:17', () => {
		testDefaultIconResult(BuffId['passive:17'], [IconId.BUFF_HPABS]);
	});

	describe('passive 19 buffs', () => {
		describe('passive:19:bc', () => {
			testDefaultIconResult(BuffId['passive:19:bc'], [IconId.BUFF_BCDROP]);
			testIconResultWithBuff(BuffId['passive:19:bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:hc', () => {
			testDefaultIconResult(BuffId['passive:19:hc'], [IconId.BUFF_HCDROP]);
			testIconResultWithBuff(BuffId['passive:19:hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:item', () => {
			testDefaultIconResult(BuffId['passive:19:item'], [IconId.BUFF_ITEMDROP]);
			testIconResultWithBuff(BuffId['passive:19:item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:zel', () => {
			testDefaultIconResult(BuffId['passive:19:zel'], [IconId.BUFF_ZELDROP]);
			testIconResultWithBuff(BuffId['passive:19:zel'], [IconId.BUFF_ZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:karma', () => {
			testDefaultIconResult(BuffId['passive:19:karma'], [IconId.BUFF_KARMADROP]);
			testIconResultWithBuff(BuffId['passive:19:karma'], [IconId.BUFF_KARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 20 buffs', () => {
		describe('passive:20:poison', () => {
			testDefaultIconResult(BuffId['passive:20:poison'], [IconId.BUFF_ADDPOISON]);
		});

		describe('passive:20:weak', () => {
			testDefaultIconResult(BuffId['passive:20:weak'], [IconId.BUFF_ADDWEAK]);
		});

		describe('passive:20:sick', () => {
			testDefaultIconResult(BuffId['passive:20:sick'], [IconId.BUFF_ADDSICK]);
		});

		describe('passive:20:injury', () => {
			testDefaultIconResult(BuffId['passive:20:injury'], [IconId.BUFF_ADDINJURY]);
		});

		describe('passive:20:curse', () => {
			testDefaultIconResult(BuffId['passive:20:curse'], [IconId.BUFF_ADDCURSE]);
		});

		describe('passive:20:paralysis', () => {
			testDefaultIconResult(BuffId['passive:20:paralysis'], [IconId.BUFF_ADDPARA]);
		});

		describe('passive:20:atk down', () => {
			testDefaultIconResult(BuffId['passive:20:atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('passive:20:def down', () => {
			testDefaultIconResult(BuffId['passive:20:def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('passive:20:rec down', () => {
			testDefaultIconResult(BuffId['passive:20:rec down'], [IconId.BUFF_ADDRECDOWN]);
		});

		describe('passive:20:unknown', () => {
			testDefaultIconResult(BuffId['passive:20:unknown'], [IconId.BUFF_ADDAILMENT]);
		});
	});

	describe('passive 21 buffs', () => {
		describe('passive:21:atk', () => {
			testDefaultIconResult(BuffId['passive:21:atk'], [IconId.BUFF_ATKUP]);
			testIconResultWithBuff(BuffId['passive:21:atk'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:def', () => {
			testDefaultIconResult(BuffId['passive:21:def'], [IconId.BUFF_DEFUP]);
			testIconResultWithBuff(BuffId['passive:21:def'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:rec', () => {
			testDefaultIconResult(BuffId['passive:21:rec'], [IconId.BUFF_RECUP]);
			testIconResultWithBuff(BuffId['passive:21:rec'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:crit', () => {
			testDefaultIconResult(BuffId['passive:21:crit'], [IconId.BUFF_CRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:21:crit'], [IconId.BUFF_CRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:23', () => {
		testDefaultIconResult(BuffId['passive:23'], [IconId.BUFF_BBREC]);
	});

	describe('passive:24', () => {
		testDefaultIconResult(BuffId['passive:24'], [IconId.BUFF_BEENATK_HPREC]);
	});

	describe('passive:25', () => {
		testDefaultIconResult(BuffId['passive:25'], [IconId.BUFF_DAMAGEBB]);
	});

	describe('passive:26', () => {
		testDefaultIconResult(BuffId['passive:26'], [IconId.BUFF_COUNTERDAMAGE]);
	});

	describe('passive:27', () => {
		testDefaultIconResult(BuffId['passive:27'], [IconId.BUFF_GETENEATT]);
		testIconResultWithBuff(BuffId['passive:27'], [IconId.BUFF_REPENEATT], { value: -1 }, 'buff value is less than 0');
	});

	describe('passive:28', () => {
		testDefaultIconResult(BuffId['passive:28'], [IconId.BUFF_HPTHRESHGETENEATT]);
		testIconResultWithBuff(BuffId['passive:28'], [IconId.BUFF_HPTHRESHREPENEATT], { value: -1 }, 'buff value is less than 0');
	});

	describe('passive:29', () => {
		testDefaultIconResult(BuffId['passive:29'], [IconId.BUFF_IGNOREDEF]);
	});

	describe('passive 30 buffs', () => {
		describe('passive:30:atk', () => {
			testDefaultIconResult(BuffId['passive:30:atk'], [IconId.BUFF_BBGAUGETHRESHATKUP]);
			testIconResultWithBuff(BuffId['passive:30:atk'], [IconId.BUFF_BBGAUGETHRESHATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:def', () => {
			testDefaultIconResult(BuffId['passive:30:def'], [IconId.BUFF_BBGAUGETHRESHDEFUP]);
			testIconResultWithBuff(BuffId['passive:30:def'], [IconId.BUFF_BBGAUGETHRESHDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:rec', () => {
			testDefaultIconResult(BuffId['passive:30:rec'], [IconId.BUFF_BBGAUGETHRESHRECUP]);
			testIconResultWithBuff(BuffId['passive:30:rec'], [IconId.BUFF_BBGAUGETHRESHRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:crit', () => {
			testDefaultIconResult(BuffId['passive:30:crit'], [IconId.BUFF_BBGAUGETHRESHCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:30:crit'], [IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 31 buffs', () => {
		describe('passive:31:damage', () => {
			testDefaultIconResult(BuffId['passive:31:damage'], [IconId.BUFF_SPARKUP]);
			testIconResultWithBuff(BuffId['passive:31:damage'], [IconId.BUFF_SPARKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:bc', () => {
			testDefaultIconResult(BuffId['passive:31:bc'], [IconId.BUFF_SPARKBC]);
			testIconResultWithBuff(BuffId['passive:31:bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:hc', () => {
			testDefaultIconResult(BuffId['passive:31:hc'], [IconId.BUFF_SPARKHC]);
			testIconResultWithBuff(BuffId['passive:31:hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:item', () => {
			testDefaultIconResult(BuffId['passive:31:item'], [IconId.BUFF_SPARKITEM]);
			testIconResultWithBuff(BuffId['passive:31:item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:zel', () => {
			testDefaultIconResult(BuffId['passive:31:zel'], [IconId.BUFF_SPARKZEL]);
			testIconResultWithBuff(BuffId['passive:31:zel'], [IconId.BUFF_ZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:karma', () => {
			testDefaultIconResult(BuffId['passive:31:karma'], [IconId.BUFF_SPARKKARMA]);
			testIconResultWithBuff(BuffId['passive:31:karma'], [IconId.BUFF_KARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:32', () => {
		testDefaultIconResult(BuffId['passive:32'], [IconId.BUFF_BBFILL]);
	});

	describe('passive:33', () => {
		testDefaultIconResult(BuffId['passive:33'], [IconId.BUFF_HPREC]);
	});

	describe('passive:34', () => {
		testDefaultIconResult(BuffId['passive:34'], [IconId.BUFF_CRTUP]);
	});

	describe('passive:35', () => {
		testDefaultIconResult(BuffId['passive:35'], [IconId.BUFF_BBREC]);
	});

	describe('passive:36', () => {
		testDefaultIconResult(BuffId['passive:36'], [IconId.BUFF_DBLSTRIKE]);
	});

	describe('passive:37', () => {
		testDefaultIconResult(BuffId['passive:37'], [IconId.BUFF_HITUP]);
	});

	describe('passive 40 buffs', () => {
		describe('passive:40:atk', () => {
			testDefaultIconResult(BuffId['passive:40:atk'], [IconId.BUFF_CONVERTATKUP]);
			testIconResultWithBuff(BuffId['passive:40:atk'], [IconId.BUFF_CONVERTATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:atk'], [IconId.BUFF_CONVERTATKDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('passive:40:def', () => {
			testDefaultIconResult(BuffId['passive:40:def'], [IconId.BUFF_CONVERTDEFUP]);
			testIconResultWithBuff(BuffId['passive:40:def'], [IconId.BUFF_CONVERTDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:def'], [IconId.BUFF_CONVERTDEFDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('passive:40:rec', () => {
			testDefaultIconResult(BuffId['passive:40:rec'], [IconId.BUFF_CONVERTRECUP]);
			testIconResultWithBuff(BuffId['passive:40:rec'], [IconId.BUFF_CONVERTRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:rec'], [IconId.BUFF_CONVERTRECDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});
	});

	describe('passive 41 buffs', () => {
		describe('passive:41:hp', () => {
			testDefaultIconResult(BuffId['passive:41:hp'], [IconId.BUFF_UNIQUEELEMENTHPUP]);
			testIconResultWithBuff(BuffId['passive:41:hp'], [IconId.BUFF_UNIQUEELEMENTHPDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:atk', () => {
			testDefaultIconResult(BuffId['passive:41:atk'], [IconId.BUFF_UNIQUEELEMENTATKUP]);
			testIconResultWithBuff(BuffId['passive:41:atk'], [IconId.BUFF_UNIQUEELEMENTATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:def', () => {
			testDefaultIconResult(BuffId['passive:41:def'], [IconId.BUFF_UNIQUEELEMENTDEFUP]);
			testIconResultWithBuff(BuffId['passive:41:def'], [IconId.BUFF_UNIQUEELEMENTDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:rec', () => {
			testDefaultIconResult(BuffId['passive:41:rec'], [IconId.BUFF_UNIQUEELEMENTRECUP]);
			testIconResultWithBuff(BuffId['passive:41:rec'], [IconId.BUFF_UNIQUEELEMENTRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:crit', () => {
			testDefaultIconResult(BuffId['passive:41:crit'], [IconId.BUFF_UNIQUEELEMENTCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:41:crit'], [IconId.BUFF_UNIQUEELEMENTCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 42 buffs', () => {
		const POSSIBLE_KNOWN_GENDERS = [
			UnitGender.Male,
			UnitGender.Female,
			UnitGender.Other,
		];

		/**
		 * @param {string} stat
		 */
		const testGenderVariantsAndPolarities = (stat) => {
			[-1, 1].forEach((polarityValue) => {
				const polarityKey = polarityValue < 0 ? 'DOWN' : 'UP';
				const polarityCase = polarityValue < 0 ? 'negative' : 'positive';
				const iconStatKey = stat !== 'crit' ? stat.toUpperCase() : 'CRTRATE';
				POSSIBLE_KNOWN_GENDERS.forEach((gender) => {
					testIconResultWithBuff(
						BuffId[`passive:42:${stat}`],
						[IconId[`BUFF_${gender.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetGender: gender } },
						`buff value is ${polarityCase} and target gender is ${gender}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`passive:42:${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no gender conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: '' } },
					`buff value is ${polarityCase} and gender condition is empty`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: { arbitrary: 'value' } } },
					`buff value is ${polarityCase} and a non-string gender is given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: 'a fake value' } },
					`buff value is ${polarityCase} and an invalid target gender is given`,
				);
			});
		};

		describe('passive:42:hp', () => {
			testDefaultIconResult(BuffId['passive:42:hp'], [IconId.BUFF_GENDERHPUP]);
			testGenderVariantsAndPolarities('hp');
		});

		describe('passive:42:atk', () => {
			testDefaultIconResult(BuffId['passive:42:atk'], [IconId.BUFF_GENDERATKUP]);
			testGenderVariantsAndPolarities('atk');
		});

		describe('passive:42:def', () => {
			testDefaultIconResult(BuffId['passive:42:def'], [IconId.BUFF_GENDERDEFUP]);
			testGenderVariantsAndPolarities('def');
		});

		describe('passive:42:rec', () => {
			testDefaultIconResult(BuffId['passive:42:rec'], [IconId.BUFF_GENDERRECUP]);
			testGenderVariantsAndPolarities('rec');
		});

		describe('passive:42:crit', () => {
			testDefaultIconResult(BuffId['passive:42:crit'], [IconId.BUFF_GENDERCRTRATEUP]);
			testGenderVariantsAndPolarities('crit');
		});
	});

	describe('passive:43', () => {
		testDefaultIconResult(BuffId['passive:43'], [IconId.BUFF_DAMAGECUTTOONE]);
	});

	describe('passive 44 buffs', () => {
		describe('passive:44:hp', () => {
			testDefaultIconResult(BuffId['passive:44:hp'], [IconId.BUFF_HPUP]);
			testIconResultWithBuff(BuffId['passive:44:hp'], [IconId.BUFF_HPDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:atk', () => {
			testDefaultIconResult(BuffId['passive:44:atk'], [IconId.BUFF_ATKUP]);
			testIconResultWithBuff(BuffId['passive:44:atk'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:def', () => {
			testDefaultIconResult(BuffId['passive:44:def'], [IconId.BUFF_DEFUP]);
			testIconResultWithBuff(BuffId['passive:44:def'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:rec', () => {
			testDefaultIconResult(BuffId['passive:44:rec'], [IconId.BUFF_RECUP]);
			testIconResultWithBuff(BuffId['passive:44:rec'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:crit', () => {
			testDefaultIconResult(BuffId['passive:44:crit'], [IconId.BUFF_CRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:44:crit'], [IconId.BUFF_CRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 45 buffs', () => {
		describe('passive:45:base', () => {
			testDefaultIconResult(BuffId['passive:45:base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:45:buff', () => {
			testDefaultIconResult(BuffId['passive:45:buff'], [IconId.BUFF_CRTDOWN]);
		});
	});

	describe('passive 46 buffs', () => {
		describe('passive:46:atk', () => {
			testDefaultIconResult(BuffId['passive:46:atk'], [IconId.BUFF_HPSCALEDATKUP]);
			testIconResultWithBuff(BuffId['passive:46:atk'], [IconId.BUFF_HPSCALEDATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:atk'], [IconId.BUFF_HPSCALEDATKDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});

		describe('passive:46:def', () => {
			testDefaultIconResult(BuffId['passive:46:def'], [IconId.BUFF_HPSCALEDDEFUP]);
			testIconResultWithBuff(BuffId['passive:46:def'], [IconId.BUFF_HPSCALEDDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:def'], [IconId.BUFF_HPSCALEDDEFDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});

		describe('passive:46:rec', () => {
			testDefaultIconResult(BuffId['passive:46:rec'], [IconId.BUFF_HPSCALEDRECUP]);
			testIconResultWithBuff(BuffId['passive:46:rec'], [IconId.BUFF_HPSCALEDRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:rec'], [IconId.BUFF_HPSCALEDRECDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});
	});

	describe('passive:47', () => {
		testDefaultIconResult(BuffId['passive:47'], [IconId.BUFF_SPARKBBUP]);
	});

	describe('passive:48', () => {
		testDefaultIconResult(BuffId['passive:48'], [IconId.BUFF_BBCOST_REDUCTION]);
	});

	describe('passive:49', () => {
		testDefaultIconResult(BuffId['passive:49'], [IconId.BUFF_BBREC]);
	});

	describe('passive 50 buffs', () => {
		describe('passive:50:fire', () => {
			testDefaultIconResult(BuffId['passive:50:fire'], [IconId.BUFF_FIREDMGUP]);
		});

		describe('passive:50:water', () => {
			testDefaultIconResult(BuffId['passive:50:water'], [IconId.BUFF_WATERDMGUP]);
		});

		describe('passive:50:earth', () => {
			testDefaultIconResult(BuffId['passive:50:earth'], [IconId.BUFF_EARTHDMGUP]);
		});

		describe('passive:50:thunder', () => {
			testDefaultIconResult(BuffId['passive:50:thunder'], [IconId.BUFF_THUNDERDMGUP]);
		});

		describe('passive:50:light', () => {
			testDefaultIconResult(BuffId['passive:50:light'], [IconId.BUFF_LIGHTDMGUP]);
		});

		describe('passive:50:dark', () => {
			testDefaultIconResult(BuffId['passive:50:dark'], [IconId.BUFF_DARKDMGUP]);
		});

		describe('passive:50:unknown', () => {
			testDefaultIconResult(BuffId['passive:50:unknown'], [IconId.BUFF_ELEMENTDMGUP]);
		});
	});

	describe('passive 53 buffs', () => {
		describe('passive:53:critical-damage-base', () => {
			testDefaultIconResult(BuffId['passive:53:critical-damage-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:critical-damage-buff', () => {
			testDefaultIconResult(BuffId['passive:53:critical-damage-buff'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:element-damage-base', () => {
			testDefaultIconResult(BuffId['passive:53:element-damage-base'], [IconId.BUFF_ELEMENTDOWN]);
		});

		describe('passive:53:element-damage-buff', () => {
			testDefaultIconResult(BuffId['passive:53:element-damage-buff'], [IconId.BUFF_ELEMENTDOWN]);
		});

		describe('passive:53:critical-rate-base', () => {
			testDefaultIconResult(BuffId['passive:53:critical-rate-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:critical-rate-buff', () => {
			testDefaultIconResult(BuffId['passive:53:critical-rate-buff'], [IconId.BUFF_CRTDOWN]);
		});
	});

	describe('passive:55:hp conditional', () => {
		testDefaultIconResult(BuffId['passive:55:hp conditional'], [IconId.CONDITIONALBUFF_HPTHRESH]);
	});

	describe('UNKNOWN_PROC_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_PROC_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('proc:1', () => {
		testDefaultIconResult(BuffId['proc:1'], [IconId.ATK_AOE]);
		testIconResultWithBuff(BuffId['proc:1'], [IconId.ATK_ST], { targetArea: TargetArea.Single }, 'target area is single');
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

	describe('proc:13', () => {
		testDefaultIconResult(BuffId['proc:13'], [IconId.ATK_RT]);
	});

	describe('proc:14', () => {
		testDefaultIconResult(BuffId['proc:14'], [IconId.ATK_AOE_HPREC]);
		testIconResultWithBuff(BuffId['proc:14'], [IconId.ATK_ST_HPREC], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 16 buffs', () => {
		describe('proc:16:fire', () => {
			testDefaultIconResult(BuffId['proc:16:fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('proc:16:water', () => {
			testDefaultIconResult(BuffId['proc:16:water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('proc:16:earth', () => {
			testDefaultIconResult(BuffId['proc:16:earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('proc:16:thunder', () => {
			testDefaultIconResult(BuffId['proc:16:thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('proc:16:light', () => {
			testDefaultIconResult(BuffId['proc:16:light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('proc:16:dark', () => {
			testDefaultIconResult(BuffId['proc:16:dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('proc:16:all', () => {
			testDefaultIconResult(BuffId['proc:16:all'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});

		describe('proc:16:unknown', () => {
			testDefaultIconResult(BuffId['proc:16:unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('proc 17 buffs', () => {
		describe('proc:17:poison', () => {
			testDefaultIconResult(BuffId['proc:17:poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:17:weak', () => {
			testDefaultIconResult(BuffId['proc:17:weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:17:sick', () => {
			testDefaultIconResult(BuffId['proc:17:sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:17:injury', () => {
			testDefaultIconResult(BuffId['proc:17:injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:17:curse', () => {
			testDefaultIconResult(BuffId['proc:17:curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:17:paralysis', () => {
			testDefaultIconResult(BuffId['proc:17:paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});
	});

	describe('proc:18', () => {
		testDefaultIconResult(BuffId['proc:18'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('proc:19', () => {
		testDefaultIconResult(BuffId['proc:19'], [IconId.BUFF_BBREC]);
	});

	describe('proc:20', () => {
		testDefaultIconResult(BuffId['proc:20'], [IconId.BUFF_DAMAGEBB]);
	});

	describe('proc:22', () => {
		testDefaultIconResult(BuffId['proc:22'], [IconId.BUFF_IGNOREDEF]);
	});

	describe('proc:23', () => {
		testDefaultIconResult(BuffId['proc:23'], [IconId.BUFF_SPARKUP]);
		testIconResultWithBuff(BuffId['proc:23'], [IconId.BUFF_SPARKDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('proc 24 buffs', () => {
		describe('proc:24:atk', () => {
			testDefaultIconResult(BuffId['proc:24:atk'], [IconId.BUFF_CONVERTATKUP]);
			testIconResultWithBuff(BuffId['proc:24:atk'], [IconId.BUFF_CONVERTATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:atk'], [IconId.BUFF_CONVERTATKDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('proc:24:def', () => {
			testDefaultIconResult(BuffId['proc:24:def'], [IconId.BUFF_CONVERTDEFUP]);
			testIconResultWithBuff(BuffId['proc:24:def'], [IconId.BUFF_CONVERTDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:def'], [IconId.BUFF_CONVERTDEFDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('proc:24:rec', () => {
			testDefaultIconResult(BuffId['proc:24:rec'], [IconId.BUFF_CONVERTRECUP]);
			testIconResultWithBuff(BuffId['proc:24:rec'], [IconId.BUFF_CONVERTRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:rec'], [IconId.BUFF_CONVERTRECDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});
	});

	describe('proc:26', () => {
		testDefaultIconResult(BuffId['proc:26'], [IconId.BUFF_HITUP]);
	});

	describe('proc:27', () => {
		testDefaultIconResult(BuffId['proc:27'], [IconId.ATK_AOE_PROPORTIONAL]);
		testIconResultWithBuff(BuffId['proc:27'], [IconId.ATK_ST_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:28', () => {
		testDefaultIconResult(BuffId['proc:28'], [IconId.ATK_AOE_FIXED]);
		testIconResultWithBuff(BuffId['proc:28'], [IconId.ATK_ST_FIXED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:29', () => {
		testDefaultIconResult(BuffId['proc:29'], [IconId.ATK_AOE_MULTIELEMENT]);
		testIconResultWithBuff(BuffId['proc:29'], [IconId.ATK_ST_MULTIELEMENT], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 30 buffs', () => {
		describe('proc:30:fire', () => {
			testDefaultIconResult(BuffId['proc:30:fire'], [IconId.BUFF_ADDFIRE]);
		});

		describe('proc:30:water', () => {
			testDefaultIconResult(BuffId['proc:30:water'], [IconId.BUFF_ADDWATER]);
		});

		describe('proc:30:earth', () => {
			testDefaultIconResult(BuffId['proc:30:earth'], [IconId.BUFF_ADDEARTH]);
		});

		describe('proc:30:thunder', () => {
			testDefaultIconResult(BuffId['proc:30:thunder'], [IconId.BUFF_ADDTHUNDER]);
		});

		describe('proc:30:light', () => {
			testDefaultIconResult(BuffId['proc:30:light'], [IconId.BUFF_ADDLIGHT]);
		});

		describe('proc:30:dark', () => {
			testDefaultIconResult(BuffId['proc:30:dark'], [IconId.BUFF_ADDDARK]);
		});

		describe('proc:30:unknown', () => {
			testDefaultIconResult(BuffId['proc:30:unknown'], [IconId.BUFF_ADDELEMENT]);
		});
	});

	describe('proc 31 buffs', () => {
		describe('proc:31:flat', () => {
			testDefaultIconResult(BuffId['proc:31:flat'], [IconId.BUFF_BBREC]);
		});

		describe('proc:31:percent', () => {
			testDefaultIconResult(BuffId['proc:31:percent'], [IconId.BUFF_BBREC]);
		});
	});

	describe('proc 32 buffs', () => {
		describe('proc:32:fire', () => {
			testDefaultIconResult(BuffId['proc:32:fire'], [IconId.BUFF_SHIFTFIRE]);
		});

		describe('proc:32:water', () => {
			testDefaultIconResult(BuffId['proc:32:water'], [IconId.BUFF_SHIFTWATER]);
		});

		describe('proc:32:earth', () => {
			testDefaultIconResult(BuffId['proc:32:earth'], [IconId.BUFF_SHIFTEARTH]);
		});

		describe('proc:32:thunder', () => {
			testDefaultIconResult(BuffId['proc:32:thunder'], [IconId.BUFF_SHIFTTHUNDER]);
		});

		describe('proc:32:light', () => {
			testDefaultIconResult(BuffId['proc:32:light'], [IconId.BUFF_SHIFTLIGHT]);
		});

		describe('proc:32:dark', () => {
			testDefaultIconResult(BuffId['proc:32:dark'], [IconId.BUFF_SHIFTDARK]);
		});

		describe('proc:32:unknown', () => {
			testDefaultIconResult(BuffId['proc:32:unknown'], [IconId.BUFF_SHIFTELEMENT]);
		});
	});

	describe('proc:33', () => {
		testDefaultIconResult(BuffId['proc:33'], [IconId.BUFF_REMOVEBUFF]);
	});

	describe('proc 34 buffs', () => {
		describe('proc:34:flat', () => {
			testDefaultIconResult(BuffId['proc:34:flat'], [IconId.BUFF_BBFILLDOWN]);
		});

		describe('proc:34:percent', () => {
			testDefaultIconResult(BuffId['proc:34:percent'], [IconId.BUFF_BBFILLDOWN]);
		});
	});

	describe('proc:36', () => {
		testDefaultIconResult(BuffId['proc:36'], [IconId.BUFF_DISABLELS]);
	});

	describe('proc:37', () => {
		testDefaultIconResult(BuffId['proc:37'], [IconId.BUFF_SUMMONUNIT]);
	});

	describe('proc 38 buffs', () => {
		describe('proc:38:poison', () => {
			testDefaultIconResult(BuffId['proc:38:poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:38:weak', () => {
			testDefaultIconResult(BuffId['proc:38:weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:38:sick', () => {
			testDefaultIconResult(BuffId['proc:38:sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:38:injury', () => {
			testDefaultIconResult(BuffId['proc:38:injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:38:curse', () => {
			testDefaultIconResult(BuffId['proc:38:curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:38:paralysis', () => {
			testDefaultIconResult(BuffId['proc:38:paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});

		describe('proc:38:atk down', () => {
			testDefaultIconResult(BuffId['proc:38:atk down'], [IconId.BUFF_ATKDOWNBLK]);
		});

		describe('proc:38:def down', () => {
			testDefaultIconResult(BuffId['proc:38:def down'], [IconId.BUFF_DEFDOWNBLK]);
		});

		describe('proc:38:rec down', () => {
			testDefaultIconResult(BuffId['proc:38:rec down'], [IconId.BUFF_RECDOWNBLK]);
		});

		describe('proc:38:unknown', () => {
			testDefaultIconResult(BuffId['proc:38:unknown'], [IconId.BUFF_AILMENTBLK]);
		});
	});

	describe('proc 39 buffs', () => {
		describe('proc:39:fire', () => {
			testDefaultIconResult(BuffId['proc:39:fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('proc:39:water', () => {
			testDefaultIconResult(BuffId['proc:39:water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('proc:39:earth', () => {
			testDefaultIconResult(BuffId['proc:39:earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('proc:39:thunder', () => {
			testDefaultIconResult(BuffId['proc:39:thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('proc:39:light', () => {
			testDefaultIconResult(BuffId['proc:39:light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('proc:39:dark', () => {
			testDefaultIconResult(BuffId['proc:39:dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('proc:39:unknown', () => {
			testDefaultIconResult(BuffId['proc:39:unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('proc 40 buffs', () => {
		describe('proc:40:poison', () => {
			testDefaultIconResult(BuffId['proc:40:poison'], [IconId.BUFF_ADDPOISON]);
		});

		describe('proc:40:weak', () => {
			testDefaultIconResult(BuffId['proc:40:weak'], [IconId.BUFF_ADDWEAK]);
		});

		describe('proc:40:sick', () => {
			testDefaultIconResult(BuffId['proc:40:sick'], [IconId.BUFF_ADDSICK]);
		});

		describe('proc:40:injury', () => {
			testDefaultIconResult(BuffId['proc:40:injury'], [IconId.BUFF_ADDINJURY]);
		});

		describe('proc:40:curse', () => {
			testDefaultIconResult(BuffId['proc:40:curse'], [IconId.BUFF_ADDCURSE]);
		});

		describe('proc:40:paralysis', () => {
			testDefaultIconResult(BuffId['proc:40:paralysis'], [IconId.BUFF_ADDPARA]);
		});

		describe('proc:40:atk down', () => {
			testDefaultIconResult(BuffId['proc:40:atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('proc:40:def down', () => {
			testDefaultIconResult(BuffId['proc:40:def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('proc:40:rec down', () => {
			testDefaultIconResult(BuffId['proc:40:rec down'], [IconId.BUFF_ADDRECDOWN]);
		});

		describe('proc:40:unknown', () => {
			testDefaultIconResult(BuffId['proc:40:unknown'], [IconId.BUFF_ADDAILMENT]);
		});
	});

	describe('proc:42', () => {
		testDefaultIconResult(BuffId['proc:42'], [IconId.ATK_AOE_SACRIFICIAL]);
		testIconResultWithBuff(BuffId['proc:42'], [IconId.ATK_ST_SACRIFICIAL], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:43', () => {
		testDefaultIconResult(BuffId['proc:43'], [IconId.BUFF_OVERDRIVEUP]);
	});

	describe('proc:44', () => {
		testDefaultIconResult(BuffId['proc:44'], [IconId.BUFF_TURNDMG]);
	});

	describe('proc 45', () => {
		describe('proc:45:bb', () => {
			testDefaultIconResult(BuffId['proc:45:bb'], [IconId.BUFF_BBATKUP]);
		});

		describe('proc:45:sbb', () => {
			testDefaultIconResult(BuffId['proc:45:sbb'], [IconId.BUFF_SBBATKUP]);
		});

		describe('proc:45:ubb', () => {
			testDefaultIconResult(BuffId['proc:45:ubb'], [IconId.BUFF_UBBATKUP]);
		});
	});

	describe('proc:46', () => {
		testDefaultIconResult(BuffId['proc:46'], [IconId.ATK_AOE_PROPORTIONAL]);
		testIconResultWithBuff(BuffId['proc:46'], [IconId.ATK_ST_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:47', () => {
		testDefaultIconResult(BuffId['proc:47'], [IconId.ATK_AOE_HPSCALED]);
		testIconResultWithBuff(BuffId['proc:47'], [IconId.ATK_ST_HPSCALED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 48 buffs', () => {
		describe('proc:48:base', () => {
			testDefaultIconResult(BuffId['proc:48:base'], [IconId.ATK_AOE_PIERCING_PROPORTIONAL]);
			testIconResultWithBuff(BuffId['proc:48:base'], [IconId.ATK_ST_PIERCING_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:current', () => {
			testDefaultIconResult(BuffId['proc:48:current'], [IconId.ATK_AOE_PIERCING_PROPORTIONAL]);
			testIconResultWithBuff(BuffId['proc:48:current'], [IconId.ATK_ST_PIERCING_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:fixed', () => {
			testDefaultIconResult(BuffId['proc:48:fixed'], [IconId.ATK_AOE_PIERCING_FIXED]);
			testIconResultWithBuff(BuffId['proc:48:fixed'], [IconId.ATK_ST_PIERCING_FIXED], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:unknown', () => {
			testDefaultIconResult(BuffId['proc:48:unknown'], [IconId.ATK_AOE]);
			testIconResultWithBuff(BuffId['proc:48:unknown'], [IconId.ATK_ST], { targetArea: TargetArea.Single }, 'target area is single');
		});
	});

	describe('proc:49', () => {
		testDefaultIconResult(BuffId['proc:49'], [IconId.BUFF_KO]);
	});

	describe('proc:50', () => {
		testDefaultIconResult(BuffId['proc:50'], [IconId.BUFF_COUNTERDAMAGE]);
	});

	describe('proc 51 buffs', () => {
		describe('proc:51:atk down', () => {
			testDefaultIconResult(BuffId['proc:51:atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('proc:51:def down', () => {
			testDefaultIconResult(BuffId['proc:51:def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('proc:51:rec down', () => {
			testDefaultIconResult(BuffId['proc:51:rec down'], [IconId.BUFF_ADDRECDOWN]);
		});
	});

	describe('proc:52', () => {
		testDefaultIconResult(BuffId['proc:52'], [IconId.BUFF_BBFILL]);
	});

	describe('proc 53 buffs', () => {
		describe('proc:53:poison', () => {
			testDefaultIconResult(BuffId['proc:53:poison'], [IconId.BUFF_POISONCOUNTER]);
		});

		describe('proc:53:weak', () => {
			testDefaultIconResult(BuffId['proc:53:weak'], [IconId.BUFF_WEAKCOUNTER]);
		});

		describe('proc:53:sick', () => {
			testDefaultIconResult(BuffId['proc:53:sick'], [IconId.BUFF_SICKCOUNTER]);
		});

		describe('proc:53:injury', () => {
			testDefaultIconResult(BuffId['proc:53:injury'], [IconId.BUFF_INJCONTER]);
		});

		describe('proc:53:curse', () => {
			testDefaultIconResult(BuffId['proc:53:curse'], [IconId.BUFF_CURSECOUNTER]);
		});

		describe('proc:53:paralysis', () => {
			testDefaultIconResult(BuffId['proc:53:paralysis'], [IconId.BUFF_PARALYCOUNTER]);
		});
	});

	describe('proc:54', () => {
		testDefaultIconResult(BuffId['proc:54'], [IconId.BUFF_CRTUP]);
	});

	describe('UNKNOWN_CONDITIONAL_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_CONDITIONAL_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('conditional:12:ko resistance', () => {
		testDefaultIconResult(BuffId['conditional:12:ko resistance'], [IconId.BUFF_KOBLK]);
	});
});
