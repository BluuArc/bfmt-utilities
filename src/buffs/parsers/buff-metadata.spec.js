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

	const STAT_TO_ICON_KEY_MAPPING = {
		hp: 'HP',
		atk: 'ATK',
		def: 'DEF',
		rec: 'REC',
		crit: 'CRTRATE',
	};
	const POSSIBLE_KNOWN_ELEMENTS = [
		UnitElement.Fire,
		UnitElement.Water,
		UnitElement.Earth,
		UnitElement.Thunder,
		UnitElement.Light,
		UnitElement.Dark,
	];
	/**
	 * @description This set of tests are for buffs that are purely elemental (i.e. not mixed between non-elemental and elemental)
	 * @param {string} buffId
	 * @param {string} iconStatKey
	 */
	const testElementalVariantsAndPolaritiesOfElementalStatBuff = (buffId, iconStatKey) => {
		[-1, 1].forEach((polarityValue) => {
			const polarityKey = polarityValue < 0 ? 'DOWN' : 'UP';
			const polarityCase = polarityValue < 0 ? 'negative' : 'positive';
			POSSIBLE_KNOWN_ELEMENTS.forEach((element) => {
				testIconResultWithBuff(
					BuffId[buffId],
					[IconId[`BUFF_${element.toUpperCase()}${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: [element] } },
					`buff value is ${polarityCase} and first target element condition is ${element}`,
				);
			});

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue },
				`buff value is ${polarityCase} and no conditions are given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: {} },
				`buff value is ${polarityCase} and no target element conditions are given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetConditions: [] } },
				`buff value is ${polarityCase} and target element conditions array is empty`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetElements: [{ arbitrary: 'value' }] } },
				`buff value is ${polarityCase} and a non-string element is given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetElements: ['a fake element'] } },
				`buff value is ${polarityCase} and an invalid target condition element is given`,
			);
		});
	};

	/**
	 * @description This set of tests are for buffs that are can be non-elemental or elemental
	 * @param {string} buffId
	 * @param {string} iconStatKey
	 */
	const testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff = (buffId, iconStatKey) => {
		[-1, 1].forEach((polarityValue) => {
			const polarityKey = polarityValue < 0 ? 'DOWN' : 'UP';
			const polarityCase = polarityValue < 0 ? 'negative' : 'positive';
			POSSIBLE_KNOWN_ELEMENTS.forEach((element) => {
				testIconResultWithBuff(
					BuffId[buffId],
					[IconId[`BUFF_${element.toUpperCase()}${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetElements: [element] } },
					`buff value is ${polarityCase} and first target element condition is ${element}`,
				);
			});

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
				{ value: polarityValue },
				`buff value is ${polarityCase} and no conditions are given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: {} },
				`buff value is ${polarityCase} and no target element conditions are given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetConditions: [] } },
				`buff value is ${polarityCase} and target element conditions array is empty`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetElements: [{ arbitrary: 'value' }] } },
				`buff value is ${polarityCase} and a non-string element is given`,
			);

			testIconResultWithBuff(
				BuffId[buffId],
				[IconId[`BUFF_ELEMENT${iconStatKey}${polarityKey}`]],
				{ value: polarityValue, conditions: { targetElements: ['a fake element'] } },
				`buff value is ${polarityCase} and an invalid target condition element is given`,
			);
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
		describe('passive:2:elemental-hp', () => {
			testDefaultIconResult(BuffId['passive:2:elemental-hp'], [IconId.BUFF_ELEMENTHPUP]);
			testElementalVariantsAndPolaritiesOfElementalStatBuff('passive:2:elemental-hp', STAT_TO_ICON_KEY_MAPPING.hp);
		});

		describe('passive:2:elemental-atk', () => {
			testDefaultIconResult(BuffId['passive:2:elemental-atk'], [IconId.BUFF_ELEMENTATKUP]);
			testElementalVariantsAndPolaritiesOfElementalStatBuff('passive:2:elemental-atk', STAT_TO_ICON_KEY_MAPPING.atk);
		});

		describe('passive:2:elemental-def', () => {
			testDefaultIconResult(BuffId['passive:2:elemental-def'], [IconId.BUFF_ELEMENTDEFUP]);
			testElementalVariantsAndPolaritiesOfElementalStatBuff('passive:2:elemental-def', STAT_TO_ICON_KEY_MAPPING.def);
		});

		describe('passive:2:elemental-rec', () => {
			testDefaultIconResult(BuffId['passive:2:elemental-rec'], [IconId.BUFF_ELEMENTRECUP]);
			testElementalVariantsAndPolaritiesOfElementalStatBuff('passive:2:elemental-rec', STAT_TO_ICON_KEY_MAPPING.rec);
		});

		describe('passive:2:elemental-crit', () => {
			testDefaultIconResult(BuffId['passive:2:elemental-crit'], [IconId.BUFF_ELEMENTCRTRATEUP]);
			testElementalVariantsAndPolaritiesOfElementalStatBuff('passive:2:elemental-crit', STAT_TO_ICON_KEY_MAPPING.crit);
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
						BuffId[`passive:3:type based-${stat}`],
						[IconId[`BUFF_${unitType.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetUnitType: unitType } },
						`buff value is ${polarityCase} and target unit type is ${unitType}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`passive:3:type based-${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:type based-${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no unit type conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:type based-${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: '' } },
					`buff value is ${polarityCase} and unit type condition is empty`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:type based-${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: { arbitrary: 'value' } } },
					`buff value is ${polarityCase} and a non-string unit type is given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:3:type based-${stat}`],
					[IconId[`BUFF_UNITTYPE${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetUnitType: 'a fake type' } },
					`buff value is ${polarityCase} and an invalid target unit type is given`,
				);
			});
		};

		describe('passive:3:type based-hp', () => {
			testDefaultIconResult(BuffId['passive:3:type based-hp'], [IconId.BUFF_UNITTYPEHPUP]);
			testUnitTypeVariantsAndPolarities('hp');
		});

		describe('passive:3:type based-atk', () => {
			testDefaultIconResult(BuffId['passive:3:type based-atk'], [IconId.BUFF_UNITTYPEATKUP]);
			testUnitTypeVariantsAndPolarities('atk');
		});

		describe('passive:3:type based-def', () => {
			testDefaultIconResult(BuffId['passive:3:type based-def'], [IconId.BUFF_UNITTYPEDEFUP]);
			testUnitTypeVariantsAndPolarities('def');
		});

		describe('passive:3:type based-rec', () => {
			testDefaultIconResult(BuffId['passive:3:type based-rec'], [IconId.BUFF_UNITTYPERECUP]);
			testUnitTypeVariantsAndPolarities('rec');
		});

		describe('passive:3:type based-crit', () => {
			testDefaultIconResult(BuffId['passive:3:type based-crit'], [IconId.BUFF_UNITTYPECRTRATEUP]);
			testUnitTypeVariantsAndPolarities('crit');
		});
	});

	describe('passive 4 buffs', () => {
		describe('passive:4:resist-poison', () => {
			testDefaultIconResult(BuffId['passive:4:resist-poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('passive:4:resist-weak', () => {
			testDefaultIconResult(BuffId['passive:4:resist-weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('passive:4:resist-sick', () => {
			testDefaultIconResult(BuffId['passive:4:resist-sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('passive:4:resist-injury', () => {
			testDefaultIconResult(BuffId['passive:4:resist-injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('passive:4:resist-curse', () => {
			testDefaultIconResult(BuffId['passive:4:resist-curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('passive:4:resist-paralysis', () => {
			testDefaultIconResult(BuffId['passive:4:resist-paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});
	});

	describe('passive 5 buffs', () => {
		describe('passive:5:mitigate-fire', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('passive:5:mitigate-water', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('passive:5:mitigate-earth', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('passive:5:mitigate-thunder', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('passive:5:mitigate-light', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('passive:5:mitigate-dark', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('passive:5:mitigate-unknown', () => {
			testDefaultIconResult(BuffId['passive:5:mitigate-unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('passive:8:mitigation', () => {
		testDefaultIconResult(BuffId['passive:8:mitigation'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('passive:9:gradual bc fill', () => {
		testDefaultIconResult(BuffId['passive:9:gradual bc fill'], [IconId.BUFF_BBREC]);
	});

	describe('passive:10:hc efficacy', () => {
		testDefaultIconResult(BuffId['passive:10:hc efficacy'], [IconId.BUFF_HCREC]);
	});

	describe('passive 11 buffs', () => {
		describe('passive:11:hp conditional-atk', () => {
			testDefaultIconResult(BuffId['passive:11:hp conditional-atk'], [IconId.BUFF_HPTHRESHATKUP]);
			testIconResultWithBuff(BuffId['passive:11:hp conditional-atk'], [IconId.BUFF_HPTHRESHATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:hp conditional-def', () => {
			testDefaultIconResult(BuffId['passive:11:hp conditional-def'], [IconId.BUFF_HPTHRESHDEFUP]);
			testIconResultWithBuff(BuffId['passive:11:hp conditional-def'], [IconId.BUFF_HPTHRESHDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:hp conditional-rec', () => {
			testDefaultIconResult(BuffId['passive:11:hp conditional-rec'], [IconId.BUFF_HPTHRESHRECUP]);
			testIconResultWithBuff(BuffId['passive:11:hp conditional-rec'], [IconId.BUFF_HPTHRESHRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:11:hp conditional-crit', () => {
			testDefaultIconResult(BuffId['passive:11:hp conditional-crit'], [IconId.BUFF_HPTHRESHCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:11:hp conditional-crit'], [IconId.BUFF_HPTHRESHCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 12 buffs', () => {
		describe('passive:12:hp conditional drop boost-bc', () => {
			testDefaultIconResult(BuffId['passive:12:hp conditional drop boost-bc'], [IconId.BUFF_HPTHRESHBCDROP]);
			testIconResultWithBuff(BuffId['passive:12:hp conditional drop boost-bc'], [IconId.BUFF_HPTHRESHBCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hp conditional drop boost-hc', () => {
			testDefaultIconResult(BuffId['passive:12:hp conditional drop boost-hc'], [IconId.BUFF_HPTHRESHHCDROP]);
			testIconResultWithBuff(BuffId['passive:12:hp conditional drop boost-hc'], [IconId.BUFF_HPTHRESHHCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hp conditional drop boost-item', () => {
			testDefaultIconResult(BuffId['passive:12:hp conditional drop boost-item'], [IconId.BUFF_HPTHRESHITEMDROP]);
			testIconResultWithBuff(BuffId['passive:12:hp conditional drop boost-item'], [IconId.BUFF_HPTHRESHITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hp conditional drop boost-zel', () => {
			testDefaultIconResult(BuffId['passive:12:hp conditional drop boost-zel'], [IconId.BUFF_HPTHRESHZELDROP]);
			testIconResultWithBuff(BuffId['passive:12:hp conditional drop boost-zel'], [IconId.BUFF_HPTHRESHZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:12:hp conditional drop boost-karma', () => {
			testDefaultIconResult(BuffId['passive:12:hp conditional drop boost-karma'], [IconId.BUFF_HPTHRESHKARMADROP]);
			testIconResultWithBuff(BuffId['passive:12:hp conditional drop boost-karma'], [IconId.BUFF_HPTHRESHKARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:13:bc fill on enemy defeat', () => {
		testDefaultIconResult(BuffId['passive:13:bc fill on enemy defeat'], [IconId.BUFF_BBREC]);
	});

	describe('passive:14:chance mitigation', () => {
		testDefaultIconResult(BuffId['passive:14:chance mitigation'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('passive:15:heal on enemy defeat', () => {
		testDefaultIconResult(BuffId['passive:15:heal on enemy defeat'], [IconId.BUFF_HPREC]);
	});

	describe('passive:16:heal on win', () => {
		testDefaultIconResult(BuffId['passive:16:heal on win'], [IconId.BUFF_HPREC]);
	});

	describe('passive:17:hp absorb', () => {
		testDefaultIconResult(BuffId['passive:17:hp absorb'], [IconId.BUFF_HPABS]);
	});

	describe('passive 19 buffs', () => {
		describe('passive:19:drop boost-bc', () => {
			testDefaultIconResult(BuffId['passive:19:drop boost-bc'], [IconId.BUFF_BCDROP]);
			testIconResultWithBuff(BuffId['passive:19:drop boost-bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:drop boost-hc', () => {
			testDefaultIconResult(BuffId['passive:19:drop boost-hc'], [IconId.BUFF_HCDROP]);
			testIconResultWithBuff(BuffId['passive:19:drop boost-hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:drop boost-item', () => {
			testDefaultIconResult(BuffId['passive:19:drop boost-item'], [IconId.BUFF_ITEMDROP]);
			testIconResultWithBuff(BuffId['passive:19:drop boost-item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:drop boost-zel', () => {
			testDefaultIconResult(BuffId['passive:19:drop boost-zel'], [IconId.BUFF_ZELDROP]);
			testIconResultWithBuff(BuffId['passive:19:drop boost-zel'], [IconId.BUFF_ZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:19:drop boost-karma', () => {
			testDefaultIconResult(BuffId['passive:19:drop boost-karma'], [IconId.BUFF_KARMADROP]);
			testIconResultWithBuff(BuffId['passive:19:drop boost-karma'], [IconId.BUFF_KARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 20 buffs', () => {
		describe('passive:20:chance inflict-poison', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-poison'], [IconId.BUFF_ADDPOISON]);
		});

		describe('passive:20:chance inflict-weak', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-weak'], [IconId.BUFF_ADDWEAK]);
		});

		describe('passive:20:chance inflict-sick', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-sick'], [IconId.BUFF_ADDSICK]);
		});

		describe('passive:20:chance inflict-injury', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-injury'], [IconId.BUFF_ADDINJURY]);
		});

		describe('passive:20:chance inflict-curse', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-curse'], [IconId.BUFF_ADDCURSE]);
		});

		describe('passive:20:chance inflict-paralysis', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-paralysis'], [IconId.BUFF_ADDPARA]);
		});

		describe('passive:20:chance inflict-atk down', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('passive:20:chance inflict-def down', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('passive:20:chance inflict-rec down', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-rec down'], [IconId.BUFF_ADDRECDOWN]);
		});

		describe('passive:20:chance inflict-unknown', () => {
			testDefaultIconResult(BuffId['passive:20:chance inflict-unknown'], [IconId.BUFF_ADDAILMENT]);
		});
	});

	describe('passive 21 buffs', () => {
		describe('passive:21:first turn-atk', () => {
			testDefaultIconResult(BuffId['passive:21:first turn-atk'], [IconId.BUFF_ATKUP]);
			testIconResultWithBuff(BuffId['passive:21:first turn-atk'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:first turn-def', () => {
			testDefaultIconResult(BuffId['passive:21:first turn-def'], [IconId.BUFF_DEFUP]);
			testIconResultWithBuff(BuffId['passive:21:first turn-def'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:first turn-rec', () => {
			testDefaultIconResult(BuffId['passive:21:first turn-rec'], [IconId.BUFF_RECUP]);
			testIconResultWithBuff(BuffId['passive:21:first turn-rec'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:21:first turn-crit', () => {
			testDefaultIconResult(BuffId['passive:21:first turn-crit'], [IconId.BUFF_CRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:21:first turn-crit'], [IconId.BUFF_CRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:23:bc fill on win', () => {
		testDefaultIconResult(BuffId['passive:23:bc fill on win'], [IconId.BUFF_BBREC]);
	});

	describe('passive:24:heal on hit', () => {
		testDefaultIconResult(BuffId['passive:24:heal on hit'], [IconId.BUFF_BEENATK_HPREC]);
	});

	describe('passive:25:bc fill on hit', () => {
		testDefaultIconResult(BuffId['passive:25:bc fill on hit'], [IconId.BUFF_DAMAGEBB]);
	});

	describe('passive:26:chance damage reflect', () => {
		testDefaultIconResult(BuffId['passive:26:chance damage reflect'], [IconId.BUFF_COUNTERDAMAGE]);
	});

	describe('passive:27:target chance change', () => {
		testDefaultIconResult(BuffId['passive:27:target chance change'], [IconId.BUFF_GETENEATT]);
		testIconResultWithBuff(BuffId['passive:27:target chance change'], [IconId.BUFF_REPENEATT], { value: -1 }, 'buff value is less than 0');
	});

	describe('passive:28:hp conditional target chance change', () => {
		testDefaultIconResult(BuffId['passive:28:hp conditional target chance change'], [IconId.BUFF_HPTHRESHGETENEATT]);
		testIconResultWithBuff(BuffId['passive:28:hp conditional target chance change'], [IconId.BUFF_HPTHRESHREPENEATT], { value: -1 }, 'buff value is less than 0');
	});

	describe('passive:29:chance def ignore', () => {
		testDefaultIconResult(BuffId['passive:29:chance def ignore'], [IconId.BUFF_IGNOREDEF]);
	});

	describe('passive 30 buffs', () => {
		describe('passive:30:bb gauge conditional-atk', () => {
			testDefaultIconResult(BuffId['passive:30:bb gauge conditional-atk'], [IconId.BUFF_BBGAUGETHRESHATKUP]);
			testIconResultWithBuff(BuffId['passive:30:bb gauge conditional-atk'], [IconId.BUFF_BBGAUGETHRESHATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:bb gauge conditional-def', () => {
			testDefaultIconResult(BuffId['passive:30:bb gauge conditional-def'], [IconId.BUFF_BBGAUGETHRESHDEFUP]);
			testIconResultWithBuff(BuffId['passive:30:bb gauge conditional-def'], [IconId.BUFF_BBGAUGETHRESHDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:bb gauge conditional-rec', () => {
			testDefaultIconResult(BuffId['passive:30:bb gauge conditional-rec'], [IconId.BUFF_BBGAUGETHRESHRECUP]);
			testIconResultWithBuff(BuffId['passive:30:bb gauge conditional-rec'], [IconId.BUFF_BBGAUGETHRESHRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:30:bb gauge conditional-crit', () => {
			testDefaultIconResult(BuffId['passive:30:bb gauge conditional-crit'], [IconId.BUFF_BBGAUGETHRESHCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:30:bb gauge conditional-crit'], [IconId.BUFF_BBGAUGETHRESHCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 31 buffs', () => {
		describe('passive:31:spark-damage', () => {
			testDefaultIconResult(BuffId['passive:31:spark-damage'], [IconId.BUFF_SPARKUP]);
			testIconResultWithBuff(BuffId['passive:31:spark-damage'], [IconId.BUFF_SPARKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:spark-bc', () => {
			testDefaultIconResult(BuffId['passive:31:spark-bc'], [IconId.BUFF_SPARKBC]);
			testIconResultWithBuff(BuffId['passive:31:spark-bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:spark-hc', () => {
			testDefaultIconResult(BuffId['passive:31:spark-hc'], [IconId.BUFF_SPARKHC]);
			testIconResultWithBuff(BuffId['passive:31:spark-hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:spark-item', () => {
			testDefaultIconResult(BuffId['passive:31:spark-item'], [IconId.BUFF_SPARKITEM]);
			testIconResultWithBuff(BuffId['passive:31:spark-item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:spark-zel', () => {
			testDefaultIconResult(BuffId['passive:31:spark-zel'], [IconId.BUFF_SPARKZEL]);
			testIconResultWithBuff(BuffId['passive:31:spark-zel'], [IconId.BUFF_ZELDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:31:spark-karma', () => {
			testDefaultIconResult(BuffId['passive:31:spark-karma'], [IconId.BUFF_SPARKKARMA]);
			testIconResultWithBuff(BuffId['passive:31:spark-karma'], [IconId.BUFF_KARMADOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive:32:bc efficacy', () => {
		testDefaultIconResult(BuffId['passive:32:bc efficacy'], [IconId.BUFF_BBFILL]);
	});

	describe('passive:33:gradual heal', () => {
		testDefaultIconResult(BuffId['passive:33:gradual heal'], [IconId.BUFF_HPREC]);
	});

	describe('passive:34:critical damage', () => {
		testDefaultIconResult(BuffId['passive:34:critical damage'], [IconId.BUFF_CRTUP]);
	});

	describe('passive:35:bc fill on normal attack', () => {
		testDefaultIconResult(BuffId['passive:35:bc fill on normal attack'], [IconId.BUFF_BBREC]);
	});

	describe('passive:36:extra action', () => {
		testDefaultIconResult(BuffId['passive:36:extra action'], [IconId.BUFF_DBLSTRIKE]);
	});

	describe('passive:37:hit count boost', () => {
		testDefaultIconResult(BuffId['passive:37:hit count boost'], [IconId.BUFF_HITUP]);
	});

	describe('passive 40 buffs', () => {
		describe('passive:40:converted-atk', () => {
			testDefaultIconResult(BuffId['passive:40:converted-atk'], [IconId.BUFF_CONVERTATKUP]);
			testIconResultWithBuff(BuffId['passive:40:converted-atk'], [IconId.BUFF_CONVERTATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:converted-atk'], [IconId.BUFF_CONVERTATKDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('passive:40:converted-def', () => {
			testDefaultIconResult(BuffId['passive:40:converted-def'], [IconId.BUFF_CONVERTDEFUP]);
			testIconResultWithBuff(BuffId['passive:40:converted-def'], [IconId.BUFF_CONVERTDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:converted-def'], [IconId.BUFF_CONVERTDEFDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('passive:40:converted-rec', () => {
			testDefaultIconResult(BuffId['passive:40:converted-rec'], [IconId.BUFF_CONVERTRECUP]);
			testIconResultWithBuff(BuffId['passive:40:converted-rec'], [IconId.BUFF_CONVERTRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:40:converted-rec'], [IconId.BUFF_CONVERTRECDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});
	});

	describe('passive 41 buffs', () => {
		describe('passive:41:unique element count-hp', () => {
			testDefaultIconResult(BuffId['passive:41:unique element count-hp'], [IconId.BUFF_UNIQUEELEMENTHPUP]);
			testIconResultWithBuff(BuffId['passive:41:unique element count-hp'], [IconId.BUFF_UNIQUEELEMENTHPDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:unique element count-atk', () => {
			testDefaultIconResult(BuffId['passive:41:unique element count-atk'], [IconId.BUFF_UNIQUEELEMENTATKUP]);
			testIconResultWithBuff(BuffId['passive:41:unique element count-atk'], [IconId.BUFF_UNIQUEELEMENTATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:unique element count-def', () => {
			testDefaultIconResult(BuffId['passive:41:unique element count-def'], [IconId.BUFF_UNIQUEELEMENTDEFUP]);
			testIconResultWithBuff(BuffId['passive:41:unique element count-def'], [IconId.BUFF_UNIQUEELEMENTDEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:unique element count-rec', () => {
			testDefaultIconResult(BuffId['passive:41:unique element count-rec'], [IconId.BUFF_UNIQUEELEMENTRECUP]);
			testIconResultWithBuff(BuffId['passive:41:unique element count-rec'], [IconId.BUFF_UNIQUEELEMENTRECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:41:unique element count-crit', () => {
			testDefaultIconResult(BuffId['passive:41:unique element count-crit'], [IconId.BUFF_UNIQUEELEMENTCRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:41:unique element count-crit'], [IconId.BUFF_UNIQUEELEMENTCRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
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
						BuffId[`passive:42:gender-${stat}`],
						[IconId[`BUFF_${gender.toUpperCase()}${iconStatKey}${polarityKey}`]],
						{ value: polarityValue, conditions: { targetGender: gender } },
						`buff value is ${polarityCase} and target gender is ${gender}`,
					);
				});

				testIconResultWithBuff(
					BuffId[`passive:42:gender-${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue },
					`buff value is ${polarityCase} and no conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:gender-${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: {} },
					`buff value is ${polarityCase} and no gender conditions are given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:gender-${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: '' } },
					`buff value is ${polarityCase} and gender condition is empty`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:gender-${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: { arbitrary: 'value' } } },
					`buff value is ${polarityCase} and a non-string gender is given`,
				);

				testIconResultWithBuff(
					BuffId[`passive:42:gender-${stat}`],
					[IconId[`BUFF_GENDER${iconStatKey}${polarityKey}`]],
					{ value: polarityValue, conditions: { targetGender: 'a fake value' } },
					`buff value is ${polarityCase} and an invalid target gender is given`,
				);
			});
		};

		describe('passive:42:gender-hp', () => {
			testDefaultIconResult(BuffId['passive:42:gender-hp'], [IconId.BUFF_GENDERHPUP]);
			testGenderVariantsAndPolarities('hp');
		});

		describe('passive:42:gender-atk', () => {
			testDefaultIconResult(BuffId['passive:42:gender-atk'], [IconId.BUFF_GENDERATKUP]);
			testGenderVariantsAndPolarities('atk');
		});

		describe('passive:42:gender-def', () => {
			testDefaultIconResult(BuffId['passive:42:gender-def'], [IconId.BUFF_GENDERDEFUP]);
			testGenderVariantsAndPolarities('def');
		});

		describe('passive:42:gender-rec', () => {
			testDefaultIconResult(BuffId['passive:42:gender-rec'], [IconId.BUFF_GENDERRECUP]);
			testGenderVariantsAndPolarities('rec');
		});

		describe('passive:42:gender-crit', () => {
			testDefaultIconResult(BuffId['passive:42:gender-crit'], [IconId.BUFF_GENDERCRTRATEUP]);
			testGenderVariantsAndPolarities('crit');
		});
	});

	describe('passive:43:chance damage to one', () => {
		testDefaultIconResult(BuffId['passive:43:chance damage to one'], [IconId.BUFF_DAMAGECUTTOONE]);
	});

	describe('passive 44 buffs', () => {
		describe('passive:44:flat-hp', () => {
			testDefaultIconResult(BuffId['passive:44:flat-hp'], [IconId.BUFF_HPUP]);
			testIconResultWithBuff(BuffId['passive:44:flat-hp'], [IconId.BUFF_HPDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:flat-atk', () => {
			testDefaultIconResult(BuffId['passive:44:flat-atk'], [IconId.BUFF_ATKUP]);
			testIconResultWithBuff(BuffId['passive:44:flat-atk'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:flat-def', () => {
			testDefaultIconResult(BuffId['passive:44:flat-def'], [IconId.BUFF_DEFUP]);
			testIconResultWithBuff(BuffId['passive:44:flat-def'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:flat-rec', () => {
			testDefaultIconResult(BuffId['passive:44:flat-rec'], [IconId.BUFF_RECUP]);
			testIconResultWithBuff(BuffId['passive:44:flat-rec'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('passive:44:flat-crit', () => {
			testDefaultIconResult(BuffId['passive:44:flat-crit'], [IconId.BUFF_CRTRATEUP]);
			testIconResultWithBuff(BuffId['passive:44:flat-crit'], [IconId.BUFF_CRTRATEDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('passive 45 buffs', () => {
		describe('passive:45:critical damage reduction-base', () => {
			testDefaultIconResult(BuffId['passive:45:critical damage reduction-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:45:critical damage reduction-buff', () => {
			testDefaultIconResult(BuffId['passive:45:critical damage reduction-buff'], [IconId.BUFF_CRTDOWN]);
		});
	});

	describe('passive 46 buffs', () => {
		describe('passive:46:hp scaled-atk', () => {
			testDefaultIconResult(BuffId['passive:46:hp scaled-atk'], [IconId.BUFF_HPSCALEDATKUP]);
			testIconResultWithBuff(BuffId['passive:46:hp scaled-atk'], [IconId.BUFF_HPSCALEDATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:hp scaled-atk'], [IconId.BUFF_HPSCALEDATKDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});

		describe('passive:46:hp scaled-def', () => {
			testDefaultIconResult(BuffId['passive:46:hp scaled-def'], [IconId.BUFF_HPSCALEDDEFUP]);
			testIconResultWithBuff(BuffId['passive:46:hp scaled-def'], [IconId.BUFF_HPSCALEDDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:hp scaled-def'], [IconId.BUFF_HPSCALEDDEFDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});

		describe('passive:46:hp scaled-rec', () => {
			testDefaultIconResult(BuffId['passive:46:hp scaled-rec'], [IconId.BUFF_HPSCALEDRECUP]);
			testIconResultWithBuff(BuffId['passive:46:hp scaled-rec'], [IconId.BUFF_HPSCALEDRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['passive:46:hp scaled-rec'], [IconId.BUFF_HPSCALEDRECDOWN], { value: { addedValue: -1 } }, 'buff value is less than 0');
		});
	});

	describe('passive:47:bc fill on spark', () => {
		testDefaultIconResult(BuffId['passive:47:bc fill on spark'], [IconId.BUFF_SPARKBBUP]);
	});

	describe('passive:48:bc cost reduction', () => {
		testDefaultIconResult(BuffId['passive:48:bc cost reduction'], [IconId.BUFF_BBCOST_REDUCTION]);
	});

	describe('passive:49:bb gauge consumption reduction', () => {
		testDefaultIconResult(BuffId['passive:49:bb gauge consumption reduction'], [IconId.BUFF_BBREC]);
	});

	describe('passive 50 buffs', () => {
		describe('passive:50:elemental weakness damage-fire', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-fire'], [IconId.BUFF_FIREDMGUP]);
		});

		describe('passive:50:elemental weakness damage-water', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-water'], [IconId.BUFF_WATERDMGUP]);
		});

		describe('passive:50:elemental weakness damage-earth', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-earth'], [IconId.BUFF_EARTHDMGUP]);
		});

		describe('passive:50:elemental weakness damage-thunder', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-thunder'], [IconId.BUFF_THUNDERDMGUP]);
		});

		describe('passive:50:elemental weakness damage-light', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-light'], [IconId.BUFF_LIGHTDMGUP]);
		});

		describe('passive:50:elemental weakness damage-dark', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-dark'], [IconId.BUFF_DARKDMGUP]);
		});

		describe('passive:50:elemental weakness damage-unknown', () => {
			testDefaultIconResult(BuffId['passive:50:elemental weakness damage-unknown'], [IconId.BUFF_ELEMENTDMGUP]);
		});
	});

	describe('passive 53 buffs', () => {
		describe('passive:53:critical damage-base', () => {
			testDefaultIconResult(BuffId['passive:53:critical damage-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:critical damage-buff', () => {
			testDefaultIconResult(BuffId['passive:53:critical damage-buff'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:element damage-base', () => {
			testDefaultIconResult(BuffId['passive:53:element damage-base'], [IconId.BUFF_ELEMENTDOWN]);
		});

		describe('passive:53:element damage-buff', () => {
			testDefaultIconResult(BuffId['passive:53:element damage-buff'], [IconId.BUFF_ELEMENTDOWN]);
		});

		describe('passive:53:critical rate-base', () => {
			testDefaultIconResult(BuffId['passive:53:critical rate-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('passive:53:critical rate-buff', () => {
			testDefaultIconResult(BuffId['passive:53:critical rate-buff'], [IconId.BUFF_CRTDOWN]);
		});
	});

	describe('passive:55:hp conditional', () => {
		testDefaultIconResult(BuffId['passive:55:hp conditional'], [IconId.CONDITIONALBUFF_HPTHRESH]);
	});

	describe('passive:58:guard mitigation', () => {
		testDefaultIconResult(BuffId['passive:58:guard mitigation'], [IconId.BUFF_GUARDCUT]);
	});

	describe('passive 59 buffs', () => {
		describe('passive:59:bc fill when attacked on guard-flat', () => {
			testDefaultIconResult(BuffId['passive:59:bc fill when attacked on guard-flat'], [IconId.BUFF_GUARDBBUP]);
		});

		describe('passive:59:bc fill when attacked on guard-percent', () => {
			testDefaultIconResult(BuffId['passive:59:bc fill when attacked on guard-percent'], [IconId.BUFF_GUARDBBUP]);
		});
	});

	describe('passive 61 buffs', () => {
		describe('passive:61:bc fill on guard-flat', () => {
			testDefaultIconResult(BuffId['passive:61:bc fill on guard-flat'], [IconId.BUFF_GUARDBBUP]);
		});

		describe('passive:61:bc fill on guard-percent', () => {
			testDefaultIconResult(BuffId['passive:61:bc fill on guard-percent'], [IconId.BUFF_GUARDBBUP]);
		});
	});

	describe('passive 62 buffs', () => {
		describe('passive:62:mitigate-fire', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('passive:62:mitigate-water', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('passive:62:mitigate-earth', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('passive:62:mitigate-thunder', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('passive:62:mitigate-light', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('passive:62:mitigate-dark', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('passive:62:mitigate-unknown', () => {
			testDefaultIconResult(BuffId['passive:62:mitigate-unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('passive 63 buffs', () => {
		describe('passive:63:first turn mitigate-fire', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-water', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-earth', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-thunder', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-light', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-dark', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('passive:63:first turn mitigate-unknown', () => {
			testDefaultIconResult(BuffId['passive:63:first turn mitigate-unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('passive 64', () => {
		describe('passive:64:attack boost-bb', () => {
			testDefaultIconResult(BuffId['passive:64:attack boost-bb'], [IconId.BUFF_BBATKUP]);
		});

		describe('passive:64:attack boost-sbb', () => {
			testDefaultIconResult(BuffId['passive:64:attack boost-sbb'], [IconId.BUFF_SBBATKUP]);
		});

		describe('passive:64:attack boost-ubb', () => {
			testDefaultIconResult(BuffId['passive:64:attack boost-ubb'], [IconId.BUFF_UBBATKUP]);
		});
	});

	describe('passive:65:bc fill on crit', () => {
		testDefaultIconResult(BuffId['passive:65:bc fill on crit'], [IconId.BUFF_BBREC]);
	});

	describe('passive 66', () => {
		describe('passive:66:add effect to skill-bb', () => {
			testDefaultIconResult(BuffId['passive:66:add effect to skill-bb'], [IconId.BUFF_ADDTO_BB]);
		});

		describe('passive:66:add effect to skill-sbb', () => {
			testDefaultIconResult(BuffId['passive:66:add effect to skill-sbb'], [IconId.BUFF_ADDTO_SBB]);
		});

		describe('passive:66:add effect to skill-ubb', () => {
			testDefaultIconResult(BuffId['passive:66:add effect to skill-ubb'], [IconId.BUFF_ADDTO_UBB]);
		});
	});

	describe('passive:69:chance ko resistance', () => {
		testDefaultIconResult(BuffId['passive:69:chance ko resistance'], [IconId.BUFF_KOBLOCK]);
	});

	describe('passive:70:od fill rate', () => {
		testDefaultIconResult(BuffId['passive:70:od fill rate'], [IconId.BUFF_ODFILLBOOST]);
	});

	describe('passive 71 buffs', () => {
		describe('passive:71:inflict on hit-poison', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-poison'], [IconId.BUFF_POISONCOUNTER]);
		});

		describe('passive:71:inflict on hit-weak', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-weak'], [IconId.BUFF_WEAKCOUNTER]);
		});

		describe('passive:71:inflict on hit-sick', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-sick'], [IconId.BUFF_SICKCOUNTER]);
		});

		describe('passive:71:inflict on hit-injury', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-injury'], [IconId.BUFF_INJCONTER]);
		});

		describe('passive:71:inflict on hit-curse', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-curse'], [IconId.BUFF_CURSECOUNTER]);
		});

		describe('passive:71:inflict on hit-paralysis', () => {
			testDefaultIconResult(BuffId['passive:71:inflict on hit-paralysis'], [IconId.BUFF_PARALYCOUNTER]);
		});
	});

	describe('passive 72 buffs', () => {
		describe('passive:72:effect at turn start-hp', () => {
			testDefaultIconResult(BuffId['passive:72:effect at turn start-hp'], [IconId.BUFF_HPTURNSTART]);
		});

		describe('passive:72:effect at turn start-bc', () => {
			testDefaultIconResult(BuffId['passive:72:effect at turn start-bc'], [IconId.BUFF_BCTURNSTART]);
		});
	});

	describe('passive 73 buffs', () => {
		describe('passive:73:resist-poison', () => {
			testDefaultIconResult(BuffId['passive:73:resist-poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('passive:73:resist-weak', () => {
			testDefaultIconResult(BuffId['passive:73:resist-weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('passive:73:resist-sick', () => {
			testDefaultIconResult(BuffId['passive:73:resist-sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('passive:73:resist-injury', () => {
			testDefaultIconResult(BuffId['passive:73:resist-injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('passive:73:resist-curse', () => {
			testDefaultIconResult(BuffId['passive:73:resist-curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('passive:73:resist-paralysis', () => {
			testDefaultIconResult(BuffId['passive:73:resist-paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});

		describe('passive:73:resist-atk down', () => {
			testDefaultIconResult(BuffId['passive:73:resist-atk down'], [IconId.BUFF_RESISTATKDOWN]);
		});

		describe('passive:73:resist-def down', () => {
			testDefaultIconResult(BuffId['passive:73:resist-def down'], [IconId.BUFF_RESISTDEFDOWN]);
		});

		describe('passive:73:resist-rec down', () => {
			testDefaultIconResult(BuffId['passive:73:resist-rec down'], [IconId.BUFF_RESISTRECDOWN]);
		});
	});

	describe('passive:74:ailment attack boost', () => {
		testDefaultIconResult(BuffId['passive:74:ailment attack boost'], [IconId.BUFF_AILDMGUP]);
	});

	describe('passive:75:spark vulnerability', () => {
		testDefaultIconResult(BuffId['passive:75:spark vulnerability'], [IconId.BUFF_SPARKDMGUP]);
	});

	describe('passive 77 buffs', () => {
		describe('passive:77:spark damage reduction-base', () => {
			testDefaultIconResult(BuffId['passive:77:spark damage reduction-base'], [IconId.BUFF_SPARKDMGDOWN]);
		});

		describe('passive:77:spark damage reduction-buff', () => {
			testDefaultIconResult(BuffId['passive:77:spark damage reduction-buff'], [IconId.BUFF_SPARKDMGDOWN]);
		});
	});

	describe('passive:78:damage taken conditional', () => {
		testDefaultIconResult(BuffId['passive:78:damage taken conditional'], [IconId.CONDITIONALBUFF_DAMAGETAKENTHRESH]);
	});

	describe('passive 79 buffs', () => {
		describe('passive:79:bc fill after damage taken conditional-flat', () => {
			testDefaultIconResult(BuffId['passive:79:bc fill after damage taken conditional-flat'], [IconId.BUFF_DAMAGEBB]);
		});

		describe('passive:79:bc fill after damage taken conditional-percent', () => {
			testDefaultIconResult(BuffId['passive:79:bc fill after damage taken conditional-percent'], [IconId.BUFF_DAMAGEBB]);
		});
	});

	describe('passive:80:damage dealt conditional', () => {
		testDefaultIconResult(BuffId['passive:80:damage dealt conditional'], [IconId.CONDITIONALBUFF_DAMAGEDEALTTHRESH]);
	});

	describe('passive 81 buffs', () => {
		describe('passive:81:bc fill after damage dealt conditional-flat', () => {
			testDefaultIconResult(BuffId['passive:81:bc fill after damage dealt conditional-flat'], [IconId.BUFF_DAMAGEBB]);
		});

		describe('passive:81:bc fill after damage dealt conditional-percent', () => {
			testDefaultIconResult(BuffId['passive:81:bc fill after damage dealt conditional-percent'], [IconId.BUFF_DAMAGEBB]);
		});
	});

	describe('passive:82:bc received conditional', () => {
		testDefaultIconResult(BuffId['passive:82:bc received conditional'], [IconId.CONDITIONALBUFF_BCRECEIVEDTHRESH]);
	});

	describe('passive 83 buffs', () => {
		describe('passive:83:bc fill after bc received conditional-flat', () => {
			testDefaultIconResult(BuffId['passive:83:bc fill after bc received conditional-flat'], [IconId.BUFF_BBREC]);
		});

		describe('passive:83:bc fill after bc received conditional-percent', () => {
			testDefaultIconResult(BuffId['passive:83:bc fill after bc received conditional-percent'], [IconId.BUFF_BBREC]);
		});
	});

	describe('UNKNOWN_PROC_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_PROC_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_PROC_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('proc:1:attack', () => {
		testDefaultIconResult(BuffId['proc:1:attack'], [IconId.ATK_AOE]);
		testIconResultWithBuff(BuffId['proc:1:attack'], [IconId.ATK_ST], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:2:burst heal', () => {
		testDefaultIconResult(BuffId['proc:2:burst heal'], [IconId.BUFF_HPREC]);
	});

	describe('proc:3:gradual heal', () => {
		testDefaultIconResult(BuffId['proc:3:gradual heal'], [IconId.BUFF_HPREC]);
	});

	describe('proc 4 buffs', () => {
		describe('proc:4:bc fill-flat', () => {
			testDefaultIconResult(BuffId['proc:4:bc fill-flat'], [IconId.BUFF_BBREC]);
		});

		describe('proc:4:bc fill-percent', () => {
			testDefaultIconResult(BuffId['proc:4:bc fill-percent'], [IconId.BUFF_BBREC]);
		});
	});

	describe('proc 5 buffs', () => {
		describe('proc:5:regular or elemental-atk', () => {
			testDefaultIconResult(BuffId['proc:5:regular or elemental-atk'], [IconId.BUFF_ATKUP]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:5:regular or elemental-atk', STAT_TO_ICON_KEY_MAPPING.atk);
		});

		describe('proc:5:regular or elemental-def', () => {
			testDefaultIconResult(BuffId['proc:5:regular or elemental-def'], [IconId.BUFF_DEFUP]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:5:regular or elemental-def', STAT_TO_ICON_KEY_MAPPING.def);
		});

		describe('proc:5:regular or elemental-rec', () => {
			testDefaultIconResult(BuffId['proc:5:regular or elemental-rec'], [IconId.BUFF_RECUP]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:5:regular or elemental-rec', STAT_TO_ICON_KEY_MAPPING.rec);
		});

		describe('proc:5:regular or elemental-crit', () => {
			testDefaultIconResult(BuffId['proc:5:regular or elemental-crit'], [IconId.BUFF_CRTRATEUP]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:5:regular or elemental-crit', STAT_TO_ICON_KEY_MAPPING.crit);
		});
	});

	describe('proc 6 buffs', () => {
		describe('proc:6:drop boost-bc', () => {
			testDefaultIconResult(BuffId['proc:6:drop boost-bc'], [IconId.BUFF_BCDROP]);
			testIconResultWithBuff(BuffId['proc:6:drop boost-bc'], [IconId.BUFF_BCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:6:drop boost-hc', () => {
			testDefaultIconResult(BuffId['proc:6:drop boost-hc'], [IconId.BUFF_HCDROP]);
			testIconResultWithBuff(BuffId['proc:6:drop boost-hc'], [IconId.BUFF_HCDOWN], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:6:drop boost-item', () => {
			testDefaultIconResult(BuffId['proc:6:drop boost-item'], [IconId.BUFF_ITEMDROP]);
			testIconResultWithBuff(BuffId['proc:6:drop boost-item'], [IconId.BUFF_ITEMDOWN], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('proc:7:guaranteed ko resistance', () => {
		testDefaultIconResult(BuffId['proc:7:guaranteed ko resistance'], [IconId.BUFF_KOBLK]);
	});

	describe('proc 8 buffs', () => {
		describe('proc:8:max hp boost-flat', () => {
			testDefaultIconResult(BuffId['proc:8:max hp boost-flat'], [IconId.BUFF_HPUP]);
		});

		describe('proc:8:max hp boost-percent', () => {
			testDefaultIconResult(BuffId['proc:8:max hp boost-percent'], [IconId.BUFF_HPUP]);
		});
	});

	describe('proc 9 buffs', () => {
		describe('proc:9:regular or elemental reduction-atk', () => {
			testDefaultIconResult(BuffId['proc:9:regular or elemental reduction-atk'], [IconId.BUFF_ATKDOWN]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:9:regular or elemental reduction-atk', STAT_TO_ICON_KEY_MAPPING.atk);
		});

		describe('proc:9:regular or elemental reduction-def', () => {
			testDefaultIconResult(BuffId['proc:9:regular or elemental reduction-def'], [IconId.BUFF_DEFDOWN]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:9:regular or elemental reduction-def', STAT_TO_ICON_KEY_MAPPING.def);
		});

		describe('proc:9:regular or elemental reduction-rec', () => {
			testDefaultIconResult(BuffId['proc:9:regular or elemental reduction-rec'], [IconId.BUFF_RECDOWN]);
			testElementalVariantsAndPolaritiesOfRegularOrElementalStatBuff('proc:9:regular or elemental reduction-rec', STAT_TO_ICON_KEY_MAPPING.rec);
		});

		describe('proc:9:regular or elemental reduction-unknown', () => {
			testDefaultIconResult(BuffId['proc:9:regular or elemental reduction-unknown'], [IconId.UNKNOWN]);
		});
	});

	describe('proc 10 buffs', () => {
		describe('proc:10:cleanse-poison', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:10:cleanse-weak', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:10:cleanse-sick', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:10:cleanse-injury', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:10:cleanse-curse', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:10:cleanse-paralysis', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});

		describe('proc:10:cleanse-atk down', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-atk down'], [IconId.BUFF_RESISTATKDOWN]);
		});

		describe('proc:10:cleanse-def down', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-def down'], [IconId.BUFF_RESISTDEFDOWN]);
		});

		describe('proc:10:cleanse-rec down', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-rec down'], [IconId.BUFF_RESISTRECDOWN]);
		});

		describe('proc:10:cleanse-unknown', () => {
			testDefaultIconResult(BuffId['proc:10:cleanse-unknown'], [IconId.BUFF_AILMENTBLK]);
		});
	});

	describe('proc 11 buffs', () => {
		describe('proc:11:chance inflict-poison', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-poison'], [IconId.DEBUFF_POISON]);
		});

		describe('proc:11:chance inflict-weak', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-weak'], [IconId.DEBUFF_WEAK]);
		});

		describe('proc:11:chance inflict-sick', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-sick'], [IconId.DEBUFF_SICK]);
		});

		describe('proc:11:chance inflict-injury', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-injury'], [IconId.DEBUFF_INJURY]);
		});

		describe('proc:11:chance inflict-curse', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-curse'], [IconId.DEBUFF_CURSE]);
		});

		describe('proc:11:chance inflict-paralysis', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-paralysis'], [IconId.DEBUFF_PARALYSIS]);
		});

		describe('proc:11:chance inflict-atk down', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-atk down'], [IconId.BUFF_ATKDOWN]);
		});

		describe('proc:11:chance inflict-def down', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-def down'], [IconId.BUFF_DEFDOWN]);
		});

		describe('proc:11:chance inflict-rec down', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-rec down'], [IconId.BUFF_RECDOWN]);
		});

		describe('proc:11:chance inflict-unknown', () => {
			testDefaultIconResult(BuffId['proc:11:chance inflict-unknown'], [IconId.DEBUFF_AILMENT]);
		});
	});

	describe('proc:12:guaranteed revive', () => {
		testDefaultIconResult(BuffId['proc:12:guaranteed revive'], [IconId.BUFF_KOBLK]);
	});

	describe('proc:13:random attack', () => {
		testDefaultIconResult(BuffId['proc:13:random attack'], [IconId.ATK_RT]);
	});

	describe('proc:14:hp absorb attack', () => {
		testDefaultIconResult(BuffId['proc:14:hp absorb attack'], [IconId.ATK_AOE_HPREC]);
		testIconResultWithBuff(BuffId['proc:14:hp absorb attack'], [IconId.ATK_ST_HPREC], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 16 buffs', () => {
		describe('proc:16:mitigate-fire', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('proc:16:mitigate-water', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('proc:16:mitigate-earth', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('proc:16:mitigate-thunder', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('proc:16:mitigate-light', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('proc:16:mitigate-dark', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('proc:16:mitigate-all', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-all'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});

		describe('proc:16:mitigate-unknown', () => {
			testDefaultIconResult(BuffId['proc:16:mitigate-unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('proc 17 buffs', () => {
		describe('proc:17:resist-poison', () => {
			testDefaultIconResult(BuffId['proc:17:resist-poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:17:resist-weak', () => {
			testDefaultIconResult(BuffId['proc:17:resist-weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:17:resist-sick', () => {
			testDefaultIconResult(BuffId['proc:17:resist-sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:17:resist-injury', () => {
			testDefaultIconResult(BuffId['proc:17:resist-injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:17:resist-curse', () => {
			testDefaultIconResult(BuffId['proc:17:resist-curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:17:resist-paralysis', () => {
			testDefaultIconResult(BuffId['proc:17:resist-paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});
	});

	describe('proc:18:mitigation', () => {
		testDefaultIconResult(BuffId['proc:18:mitigation'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('proc:19:gradual bc fill', () => {
		testDefaultIconResult(BuffId['proc:19:gradual bc fill'], [IconId.BUFF_BBREC]);
	});

	describe('proc:20:bc fill on hit', () => {
		testDefaultIconResult(BuffId['proc:20:bc fill on hit'], [IconId.BUFF_DAMAGEBB]);
	});

	describe('proc:22:defense ignore', () => {
		testDefaultIconResult(BuffId['proc:22:defense ignore'], [IconId.BUFF_IGNOREDEF]);
	});

	describe('proc:23:spark damage', () => {
		testDefaultIconResult(BuffId['proc:23:spark damage'], [IconId.BUFF_SPARKUP]);
		testIconResultWithBuff(BuffId['proc:23:spark damage'], [IconId.BUFF_SPARKDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('proc 24 buffs', () => {
		describe('proc:24:converted-atk', () => {
			testDefaultIconResult(BuffId['proc:24:converted-atk'], [IconId.BUFF_CONVERTATKUP]);
			testIconResultWithBuff(BuffId['proc:24:converted-atk'], [IconId.BUFF_CONVERTATKUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:converted-atk'], [IconId.BUFF_CONVERTATKDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('proc:24:converted-def', () => {
			testDefaultIconResult(BuffId['proc:24:converted-def'], [IconId.BUFF_CONVERTDEFUP]);
			testIconResultWithBuff(BuffId['proc:24:converted-def'], [IconId.BUFF_CONVERTDEFUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:converted-def'], [IconId.BUFF_CONVERTDEFDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});

		describe('proc:24:converted-rec', () => {
			testDefaultIconResult(BuffId['proc:24:converted-rec'], [IconId.BUFF_CONVERTRECUP]);
			testIconResultWithBuff(BuffId['proc:24:converted-rec'], [IconId.BUFF_CONVERTRECUP], { value: {} }, 'buff value is not present');
			testIconResultWithBuff(BuffId['proc:24:converted-rec'], [IconId.BUFF_CONVERTRECDOWN], { value: { value: -1 } }, 'buff value is less than 0');
		});
	});

	describe('proc:26:hit count boost', () => {
		testDefaultIconResult(BuffId['proc:26:hit count boost'], [IconId.BUFF_HITUP]);
	});

	describe('proc:27:proportional attack', () => {
		testDefaultIconResult(BuffId['proc:27:proportional attack'], [IconId.ATK_AOE_PROPORTIONAL]);
		testIconResultWithBuff(BuffId['proc:27:proportional attack'], [IconId.ATK_ST_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:28:fixed attack', () => {
		testDefaultIconResult(BuffId['proc:28:fixed attack'], [IconId.ATK_AOE_FIXED]);
		testIconResultWithBuff(BuffId['proc:28:fixed attack'], [IconId.ATK_ST_FIXED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:29:multi-element attack', () => {
		testDefaultIconResult(BuffId['proc:29:multi-element attack'], [IconId.ATK_AOE_MULTIELEMENT]);
		testIconResultWithBuff(BuffId['proc:29:multi-element attack'], [IconId.ATK_ST_MULTIELEMENT], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 30 buffs', () => {
		describe('proc:30:add element-fire', () => {
			testDefaultIconResult(BuffId['proc:30:add element-fire'], [IconId.BUFF_ADDFIRE]);
		});

		describe('proc:30:add element-water', () => {
			testDefaultIconResult(BuffId['proc:30:add element-water'], [IconId.BUFF_ADDWATER]);
		});

		describe('proc:30:add element-earth', () => {
			testDefaultIconResult(BuffId['proc:30:add element-earth'], [IconId.BUFF_ADDEARTH]);
		});

		describe('proc:30:add element-thunder', () => {
			testDefaultIconResult(BuffId['proc:30:add element-thunder'], [IconId.BUFF_ADDTHUNDER]);
		});

		describe('proc:30:add element-light', () => {
			testDefaultIconResult(BuffId['proc:30:add element-light'], [IconId.BUFF_ADDLIGHT]);
		});

		describe('proc:30:add element-dark', () => {
			testDefaultIconResult(BuffId['proc:30:add element-dark'], [IconId.BUFF_ADDDARK]);
		});

		describe('proc:30:add element-unknown', () => {
			testDefaultIconResult(BuffId['proc:30:add element-unknown'], [IconId.BUFF_ADDELEMENT]);
		});
	});

	describe('proc 31 buffs', () => {
		describe('proc:31:bc fill-flat', () => {
			testDefaultIconResult(BuffId['proc:31:bc fill-flat'], [IconId.BUFF_BBREC]);
		});

		describe('proc:31:bc fill-percent', () => {
			testDefaultIconResult(BuffId['proc:31:bc fill-percent'], [IconId.BUFF_BBREC]);
		});
	});

	describe('proc 32 buffs', () => {
		describe('proc:32:element shift-fire', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-fire'], [IconId.BUFF_SHIFTFIRE]);
		});

		describe('proc:32:element shift-water', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-water'], [IconId.BUFF_SHIFTWATER]);
		});

		describe('proc:32:element shift-earth', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-earth'], [IconId.BUFF_SHIFTEARTH]);
		});

		describe('proc:32:element shift-thunder', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-thunder'], [IconId.BUFF_SHIFTTHUNDER]);
		});

		describe('proc:32:element shift-light', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-light'], [IconId.BUFF_SHIFTLIGHT]);
		});

		describe('proc:32:element shift-dark', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-dark'], [IconId.BUFF_SHIFTDARK]);
		});

		describe('proc:32:element shift-unknown', () => {
			testDefaultIconResult(BuffId['proc:32:element shift-unknown'], [IconId.BUFF_SHIFTELEMENT]);
		});
	});

	describe('proc:33:buff wipe', () => {
		testDefaultIconResult(BuffId['proc:33:buff wipe'], [IconId.BUFF_REMOVEBUFF]);
	});

	describe('proc 34 buffs', () => {
		describe('proc:34:bc drain-flat', () => {
			testDefaultIconResult(BuffId['proc:34:bc drain-flat'], [IconId.BUFF_BBFILLDOWN]);
		});

		describe('proc:34:bc drain-percent', () => {
			testDefaultIconResult(BuffId['proc:34:bc drain-percent'], [IconId.BUFF_BBFILLDOWN]);
		});
	});

	describe('proc:36:ls lock', () => {
		testDefaultIconResult(BuffId['proc:36:ls lock'], [IconId.BUFF_DISABLELS]);
	});

	describe('proc:37:summon', () => {
		testDefaultIconResult(BuffId['proc:37:summon'], [IconId.BUFF_SUMMONUNIT]);
	});

	describe('proc 38 buffs', () => {
		describe('proc:38:cleanse-poison', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-poison'], [IconId.BUFF_POISONBLK]);
		});

		describe('proc:38:cleanse-weak', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-weak'], [IconId.BUFF_WEAKBLK]);
		});

		describe('proc:38:cleanse-sick', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-sick'], [IconId.BUFF_SICKBLK]);
		});

		describe('proc:38:cleanse-injury', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-injury'], [IconId.BUFF_INJURYBLK]);
		});

		describe('proc:38:cleanse-curse', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-curse'], [IconId.BUFF_CURSEBLK]);
		});

		describe('proc:38:cleanse-paralysis', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-paralysis'], [IconId.BUFF_PARALYSISBLK]);
		});

		describe('proc:38:cleanse-atk down', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-atk down'], [IconId.BUFF_RESISTATKDOWN]);
		});

		describe('proc:38:cleanse-def down', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-def down'], [IconId.BUFF_RESISTDEFDOWN]);
		});

		describe('proc:38:cleanse-rec down', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-rec down'], [IconId.BUFF_RESISTRECDOWN]);
		});

		describe('proc:38:cleanse-unknown', () => {
			testDefaultIconResult(BuffId['proc:38:cleanse-unknown'], [IconId.BUFF_AILMENTBLK]);
		});
	});

	describe('proc 39 buffs', () => {
		describe('proc:39:mitigate-fire', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-fire'], [IconId.BUFF_FIREDMGDOWN]);
		});

		describe('proc:39:mitigate-water', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-water'], [IconId.BUFF_WATERDMGDOWN]);
		});

		describe('proc:39:mitigate-earth', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-earth'], [IconId.BUFF_EARTHDMGDOWN]);
		});

		describe('proc:39:mitigate-thunder', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-thunder'], [IconId.BUFF_THUNDERDMGDOWN]);
		});

		describe('proc:39:mitigate-light', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-light'], [IconId.BUFF_LIGHTDMGDOWN]);
		});

		describe('proc:39:mitigate-dark', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-dark'], [IconId.BUFF_DARKDMGDOWN]);
		});

		describe('proc:39:mitigate-unknown', () => {
			testDefaultIconResult(BuffId['proc:39:mitigate-unknown'], [IconId.BUFF_ELEMENTDMGDOWN]);
		});
	});

	describe('proc 40 buffs', () => {
		describe('proc:40:add ailment-poison', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-poison'], [IconId.BUFF_ADDPOISON]);
		});

		describe('proc:40:add ailment-weak', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-weak'], [IconId.BUFF_ADDWEAK]);
		});

		describe('proc:40:add ailment-sick', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-sick'], [IconId.BUFF_ADDSICK]);
		});

		describe('proc:40:add ailment-injury', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-injury'], [IconId.BUFF_ADDINJURY]);
		});

		describe('proc:40:add ailment-curse', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-curse'], [IconId.BUFF_ADDCURSE]);
		});

		describe('proc:40:add ailment-paralysis', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-paralysis'], [IconId.BUFF_ADDPARA]);
		});

		describe('proc:40:add ailment-atk down', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('proc:40:add ailment-def down', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('proc:40:add ailment-rec down', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-rec down'], [IconId.BUFF_ADDRECDOWN]);
		});

		describe('proc:40:add ailment-unknown', () => {
			testDefaultIconResult(BuffId['proc:40:add ailment-unknown'], [IconId.BUFF_ADDAILMENT]);
		});
	});

	describe('proc 42 buffs', () => {
		describe('proc:42:sacrificial attack', () => {
			testDefaultIconResult(BuffId['proc:42:sacrificial attack'], [IconId.ATK_AOE_SACRIFICIAL]);
			testIconResultWithBuff(BuffId['proc:42:sacrificial attack'], [IconId.ATK_ST_SACRIFICIAL], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:42:instant death', () => {
			testDefaultIconResult(BuffId['proc:42:instant death'], [IconId.ATK_AOE_SACRIFICIAL, IconId.BUFF_KO]);
			testIconResultWithBuff(BuffId['proc:42:instant death'], [IconId.ATK_ST_SACRIFICIAL, IconId.BUFF_KO], { targetArea: TargetArea.Single }, 'target area is single');
		});
	});

	describe('proc:43:burst od fill', () => {
		testDefaultIconResult(BuffId['proc:43:burst od fill'], [IconId.BUFF_OVERDRIVEUP]);
	});

	describe('proc:44:damage over time', () => {
		testDefaultIconResult(BuffId['proc:44:damage over time'], [IconId.BUFF_TURNDMG]);
	});

	describe('proc 45', () => {
		describe('proc:45:attack boost-bb', () => {
			testDefaultIconResult(BuffId['proc:45:attack boost-bb'], [IconId.BUFF_BBATKUP]);
		});

		describe('proc:45:attack boost-sbb', () => {
			testDefaultIconResult(BuffId['proc:45:attack boost-sbb'], [IconId.BUFF_SBBATKUP]);
		});

		describe('proc:45:attack boost-ubb', () => {
			testDefaultIconResult(BuffId['proc:45:attack boost-ubb'], [IconId.BUFF_UBBATKUP]);
		});
	});

	describe('proc:46:non-lethal proportional attack', () => {
		testDefaultIconResult(BuffId['proc:46:non-lethal proportional attack'], [IconId.ATK_AOE_PROPORTIONAL]);
		testIconResultWithBuff(BuffId['proc:46:non-lethal proportional attack'], [IconId.ATK_ST_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:47:hp scaled attack', () => {
		testDefaultIconResult(BuffId['proc:47:hp scaled attack'], [IconId.ATK_AOE_HPSCALED]);
		testIconResultWithBuff(BuffId['proc:47:hp scaled attack'], [IconId.ATK_ST_HPSCALED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc 48 buffs', () => {
		describe('proc:48:piercing attack-base', () => {
			testDefaultIconResult(BuffId['proc:48:piercing attack-base'], [IconId.ATK_AOE_PIERCING_PROPORTIONAL]);
			testIconResultWithBuff(BuffId['proc:48:piercing attack-base'], [IconId.ATK_ST_PIERCING_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:piercing attack-current', () => {
			testDefaultIconResult(BuffId['proc:48:piercing attack-current'], [IconId.ATK_AOE_PIERCING_PROPORTIONAL]);
			testIconResultWithBuff(BuffId['proc:48:piercing attack-current'], [IconId.ATK_ST_PIERCING_PROPORTIONAL], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:piercing attack-fixed', () => {
			testDefaultIconResult(BuffId['proc:48:piercing attack-fixed'], [IconId.ATK_AOE_PIERCING_FIXED]);
			testIconResultWithBuff(BuffId['proc:48:piercing attack-fixed'], [IconId.ATK_ST_PIERCING_FIXED], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:48:piercing attack-unknown', () => {
			testDefaultIconResult(BuffId['proc:48:piercing attack-unknown'], [IconId.ATK_AOE]);
			testIconResultWithBuff(BuffId['proc:48:piercing attack-unknown'], [IconId.ATK_ST], { targetArea: TargetArea.Single }, 'target area is single');
		});
	});

	describe('proc:49:chance instant death', () => {
		testDefaultIconResult(BuffId['proc:49:chance instant death'], [IconId.BUFF_KO]);
	});

	describe('proc:50:chance damage reflect', () => {
		testDefaultIconResult(BuffId['proc:50:chance damage reflect'], [IconId.BUFF_COUNTERDAMAGE]);
	});

	describe('proc 51 buffs', () => {
		describe('proc:51:add to attack-atk down', () => {
			testDefaultIconResult(BuffId['proc:51:add to attack-atk down'], [IconId.BUFF_ADDATKDOWN]);
		});

		describe('proc:51:add to attack-def down', () => {
			testDefaultIconResult(BuffId['proc:51:add to attack-def down'], [IconId.BUFF_ADDDEFDOWN]);
		});

		describe('proc:51:add to attack-rec down', () => {
			testDefaultIconResult(BuffId['proc:51:add to attack-rec down'], [IconId.BUFF_ADDRECDOWN]);
		});
	});

	describe('proc:52:bc efficacy', () => {
		testDefaultIconResult(BuffId['proc:52:bc efficacy'], [IconId.BUFF_BBFILL]);
	});

	describe('proc 53 buffs', () => {
		describe('proc:53:inflict on hit-poison', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-poison'], [IconId.BUFF_POISONCOUNTER]);
		});

		describe('proc:53:inflict on hit-weak', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-weak'], [IconId.BUFF_WEAKCOUNTER]);
		});

		describe('proc:53:inflict on hit-sick', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-sick'], [IconId.BUFF_SICKCOUNTER]);
		});

		describe('proc:53:inflict on hit-injury', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-injury'], [IconId.BUFF_INJCONTER]);
		});

		describe('proc:53:inflict on hit-curse', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-curse'], [IconId.BUFF_CURSECOUNTER]);
		});

		describe('proc:53:inflict on hit-paralysis', () => {
			testDefaultIconResult(BuffId['proc:53:inflict on hit-paralysis'], [IconId.BUFF_PARALYCOUNTER]);
		});
	});

	describe('proc:54:critical damage boost', () => {
		testDefaultIconResult(BuffId['proc:54:critical damage boost'], [IconId.BUFF_CRTUP]);
	});

	describe('proc 55 buffs', () => {
		describe('proc:55:elemental weakness damage-fire', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-fire'], [IconId.BUFF_FIREDMGUP]);
		});

		describe('proc:55:elemental weakness damage-water', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-water'], [IconId.BUFF_WATERDMGUP]);
		});

		describe('proc:55:elemental weakness damage-earth', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-earth'], [IconId.BUFF_EARTHDMGUP]);
		});

		describe('proc:55:elemental weakness damage-thunder', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-thunder'], [IconId.BUFF_THUNDERDMGUP]);
		});

		describe('proc:55:elemental weakness damage-light', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-light'], [IconId.BUFF_LIGHTDMGUP]);
		});

		describe('proc:55:elemental weakness damage-dark', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-dark'], [IconId.BUFF_DARKDMGUP]);
		});

		describe('proc:55:elemental weakness damage-unknown', () => {
			testDefaultIconResult(BuffId['proc:55:elemental weakness damage-unknown'], [IconId.BUFF_ELEMENTDMGUP]);
		});
	});

	describe('proc:56:chance ko resistance', () => {
		testDefaultIconResult(BuffId['proc:56:chance ko resistance'], [IconId.BUFF_KOBLOCK]);
	});

	describe('proc 57 buffs', () => {
		describe('proc:57:bc drop resistance-base', () => {
			testDefaultIconResult(BuffId['proc:57:bc drop resistance-base'], [IconId.BUFF_BCDOWN]);
		});

		describe('proc:57:bc drop resistance-buff', () => {
			testDefaultIconResult(BuffId['proc:57:bc drop resistance-buff'], [IconId.BUFF_BCDOWN]);
		});
		describe('proc:57:hc drop resistance-base', () => {
			testDefaultIconResult(BuffId['proc:57:hc drop resistance-base'], [IconId.BUFF_HCDOWN]);
		});

		describe('proc:57:hc drop resistance-buff', () => {
			testDefaultIconResult(BuffId['proc:57:hc drop resistance-buff'], [IconId.BUFF_HCDOWN]);
		});
	});

	describe('proc:58:spark vulnerability', () => {
		testDefaultIconResult(BuffId['proc:58:spark vulnerability'], [IconId.BUFF_SPARKDMGUP]);
	});

	describe('proc 59', () => {
		describe('proc:59:attack reduction-bb', () => {
			testDefaultIconResult(BuffId['proc:59:attack reduction-bb'], [IconId.BUFF_BBATKDOWN]);
		});

		describe('proc:59:attack reduction-sbb', () => {
			testDefaultIconResult(BuffId['proc:59:attack reduction-sbb'], [IconId.BUFF_SBBATKDOWN]);
		});

		describe('proc:59:attack reduction-ubb', () => {
			testDefaultIconResult(BuffId['proc:59:attack reduction-ubb'], [IconId.BUFF_UBBATKDOWN]);
		});
	});

	describe('proc 61 buffs', () => {
		describe('proc:61:party bb gauge-scaled attack', () => {
			testDefaultIconResult(BuffId['proc:61:party bb gauge-scaled attack'], [IconId.ATK_AOE_BBGAUGESCALED]);
			testIconResultWithBuff(BuffId['proc:61:party bb gauge-scaled attack'], [IconId.ATK_ST_BBGAUGESCALED], { targetArea: TargetArea.Single }, 'target area is single');
		});

		describe('proc:61:party bc drain', () => {
			testDefaultIconResult(BuffId['proc:61:party bc drain'], [IconId.ATK_AOE_BBGAUGESCALED, IconId.BUFF_BBFILLDOWN]);
			testIconResultWithBuff(BuffId['proc:61:party bc drain'], [IconId.ATK_ST_BBGAUGESCALED, IconId.BUFF_BBFILLDOWN], { targetArea: TargetArea.Single }, 'target area is single');
		});
	});

	describe('proc 62 buffs', () => {
		describe('proc:62:barrier-fire', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-fire'], [IconId.BUFF_FIRESHIELD]);
		});

		describe('proc:62:barrier-water', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-water'], [IconId.BUFF_WATERSHIELD]);
		});

		describe('proc:62:barrier-earth', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-earth'], [IconId.BUFF_EARTHSHIELD]);
		});

		describe('proc:62:barrier-thunder', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-thunder'], [IconId.BUFF_THUNDERSHIELD]);
		});

		describe('proc:62:barrier-light', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-light'], [IconId.BUFF_LIGHTSHIELD]);
		});

		describe('proc:62:barrier-dark', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-dark'], [IconId.BUFF_DARKSHIELD]);
		});

		describe('proc:62:barrier-all', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-all'], [IconId.BUFF_ELEMENTSHIELD]);
		});

		describe('proc:62:barrier-unknown', () => {
			testDefaultIconResult(BuffId['proc:62:barrier-unknown'], [IconId.BUFF_ELEMENTSHIELD]);
		});
	});

	describe('proc:64:consecutive usage attack', () => {
		testDefaultIconResult(BuffId['proc:64:consecutive usage attack'], [IconId.ATK_AOE_USAGESCALED]);
		testIconResultWithBuff(BuffId['proc:64:consecutive usage attack'], [IconId.ATK_ST_USAGESCALED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:65:ailment attack boost', () => {
		testDefaultIconResult(BuffId['proc:65:ailment attack boost'], [IconId.BUFF_AILDMGUP]);
	});

	describe('proc:66:chance revive', () => {
		testDefaultIconResult(BuffId['proc:66:chance revive'], [IconId.BUFF_KOBLOCK]);
	});

	describe('proc:67:bc fill on spark', () => {
		testDefaultIconResult(BuffId['proc:67:bc fill on spark'], [IconId.BUFF_SPARKBBUP]);
	});

	describe('proc:68:guard mitigation', () => {
		testDefaultIconResult(BuffId['proc:68:guard mitigation'], [IconId.BUFF_GUARDCUT]);
	});

	describe('proc 69 buffs', () => {
		describe('proc:69:bc fill on guard-flat', () => {
			testDefaultIconResult(BuffId['proc:69:bc fill on guard-flat'], [IconId.BUFF_GUARDBBUP]);
		});

		describe('proc:69:bc fill on guard-percent', () => {
			testDefaultIconResult(BuffId['proc:69:bc fill on guard-percent'], [IconId.BUFF_GUARDBBUP]);
		});
	});

	describe('proc:71:bc efficacy reduction', () => {
		testDefaultIconResult(BuffId['proc:71:bc efficacy reduction'], [IconId.BUFF_BBFILLDOWN]);
	});

	describe('proc 73 buffs', () => {
		describe('proc:73:resist-atk down', () => {
			testDefaultIconResult(BuffId['proc:73:resist-atk down'], [IconId.BUFF_RESISTATKDOWN]);
		});

		describe('proc:73:resist-def down', () => {
			testDefaultIconResult(BuffId['proc:73:resist-def down'], [IconId.BUFF_RESISTDEFDOWN]);
		});

		describe('proc:73:resist-rec down', () => {
			testDefaultIconResult(BuffId['proc:73:resist-rec down'], [IconId.BUFF_RESISTRECDOWN]);
		});
	});

	describe('proc:75:element squad-scaled attack', () => {
		testDefaultIconResult(BuffId['proc:75:element squad-scaled attack'], [IconId.ATK_AOE_ELEMENTSCALED]);
		testIconResultWithBuff(BuffId['proc:75:element squad-scaled attack'], [IconId.ATK_ST_ELEMENTSCALED], { targetArea: TargetArea.Single }, 'target area is single');
	});

	describe('proc:76:extra action', () => {
		testDefaultIconResult(BuffId['proc:76:extra action'], [IconId.BUFF_DBLSTRIKE]);
	});

	describe('proc 78 buffs', () => {
		describe('proc:78:self stat boost-atk', () => {
			testDefaultIconResult(BuffId['proc:78:self stat boost-atk'], [IconId.BUFF_SELFATKUP]);
			testIconResultWithBuff(BuffId['proc:78:self stat boost-atk'], [IconId.BUFF_ATKDOWNLOCK], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:78:self stat boost-def', () => {
			testDefaultIconResult(BuffId['proc:78:self stat boost-def'], [IconId.BUFF_SELFDEFUP]);
			testIconResultWithBuff(BuffId['proc:78:self stat boost-def'], [IconId.BUFF_DEFDOWNLOCK], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:78:self stat boost-rec', () => {
			testDefaultIconResult(BuffId['proc:78:self stat boost-rec'], [IconId.BUFF_SELFRECUP]);
			testIconResultWithBuff(BuffId['proc:78:self stat boost-rec'], [IconId.BUFF_RECDOWNLOCK], { value: -1 }, 'buff value is less than 0');
		});

		describe('proc:78:self stat boost-crit', () => {
			testDefaultIconResult(BuffId['proc:78:self stat boost-crit'], [IconId.BUFF_SELFCRTRATEUP]);
			testIconResultWithBuff(BuffId['proc:78:self stat boost-crit'], [IconId.BUFF_CRTRATEDOWNLOCK], { value: -1 }, 'buff value is less than 0');
		});
	});

	describe('proc:79:player exp boost', () => {
		testDefaultIconResult(BuffId['proc:79:player exp boost'], [IconId.BUFF_PLAYEREXP]);
	});

	describe('proc:82:resummon', () => {
		testDefaultIconResult(BuffId['proc:82:resummon'], [IconId.BUFF_SUMMONUNIT]);
	});

	describe('proc:83:spark critical', () => {
		testDefaultIconResult(BuffId['proc:83:spark critical'], [IconId.BUFF_SPARKCRTACTIVATED]);
	});

	describe('proc:84:od fill rate', () => {
		testDefaultIconResult(BuffId['proc:84:od fill rate'], [IconId.BUFF_ODFILLBOOST]);
	});

	describe('UNKNOWN_CONDITIONAL_EFFECT_ID', () => {
		testDefaultIconResult(BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID, [IconId.UNKNOWN]);
	});

	describe('UNKNOWN_CONDITIONAL_BUFF_PARAMS', () => {
		testDefaultIconResult(BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS, [IconId.UNKNOWN]);
	});

	describe('conditional:1:attack buff', () => {
		testDefaultIconResult(BuffId['conditional:1:attack buff'], [IconId.BUFF_ATKUP]);
		testIconResultWithBuff(BuffId['conditional:1:attack buff'], [IconId.BUFF_ATKDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('conditional:3:defense buff', () => {
		testDefaultIconResult(BuffId['conditional:3:defense buff'], [IconId.BUFF_DEFUP]);
		testIconResultWithBuff(BuffId['conditional:3:defense buff'], [IconId.BUFF_DEFDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('conditional:5:recovery buff', () => {
		testDefaultIconResult(BuffId['conditional:5:recovery buff'], [IconId.BUFF_RECUP]);
		testIconResultWithBuff(BuffId['conditional:5:recovery buff'], [IconId.BUFF_RECDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('conditional:8:gradual heal', () => {
		testDefaultIconResult(BuffId['conditional:8:gradual heal'], [IconId.BUFF_HPREC]);
	});

	describe('conditional:12:guaranteed ko resistance', () => {
		testDefaultIconResult(BuffId['conditional:12:guaranteed ko resistance'], [IconId.BUFF_KOBLK]);
	});

	describe('conditional:13:elemental attack buff', () => {
		testDefaultIconResult(BuffId['conditional:13:elemental attack buff'], [IconId.BUFF_ELEMENTATKUP]);
		testElementalVariantsAndPolaritiesOfElementalStatBuff('conditional:13:elemental attack buff', STAT_TO_ICON_KEY_MAPPING.atk);
	});

	describe('conditional:14:elemental defense buff', () => {
		testDefaultIconResult(BuffId['conditional:14:elemental defense buff'], [IconId.BUFF_ELEMENTDEFUP]);
		testElementalVariantsAndPolaritiesOfElementalStatBuff('conditional:14:elemental defense buff', STAT_TO_ICON_KEY_MAPPING.def);
	});

	describe('conditional:21:fire mitigation', () => {
		testDefaultIconResult(BuffId['conditional:21:fire mitigation'], [IconId.BUFF_FIREDMGDOWN]);
	});

	describe('conditional:22:water mitigation', () => {
		testDefaultIconResult(BuffId['conditional:22:water mitigation'], [IconId.BUFF_WATERDMGDOWN]);
	});

	describe('conditional:23:earth mitigation', () => {
		testDefaultIconResult(BuffId['conditional:23:earth mitigation'], [IconId.BUFF_EARTHDMGDOWN]);
	});

	describe('conditional:24:thunder mitigation', () => {
		testDefaultIconResult(BuffId['conditional:24:thunder mitigation'], [IconId.BUFF_THUNDERDMGDOWN]);
	});

	describe('conditional:25:light mitigation', () => {
		testDefaultIconResult(BuffId['conditional:25:light mitigation'], [IconId.BUFF_LIGHTDMGDOWN]);
	});

	describe('conditional:26:dark mitigation', () => {
		testDefaultIconResult(BuffId['conditional:26:dark mitigation'], [IconId.BUFF_DARKDMGDOWN]);
	});

	describe('conditional:36:mitigation', () => {
		testDefaultIconResult(BuffId['conditional:36:mitigation'], [IconId.BUFF_DAMAGECUT]);
	});

	describe('conditional:37:gradual bc fill', () => {
		testDefaultIconResult(BuffId['conditional:37:gradual bc fill'], [IconId.BUFF_BBREC]);
	});

	describe('conditional:40:spark damage', () => {
		testDefaultIconResult(BuffId['conditional:40:spark damage'], [IconId.BUFF_SPARKUP]);
		testIconResultWithBuff(BuffId['conditional:40:spark damage'], [IconId.BUFF_SPARKDOWN], { value: -1 }, 'buff value is less than 0');
	});

	describe('conditional:51:add fire element', () => {
		testDefaultIconResult(BuffId['conditional:51:add fire element'], [IconId.BUFF_ADDFIRE]);
	});

	describe('conditional:52:add water element', () => {
		testDefaultIconResult(BuffId['conditional:52:add water element'], [IconId.BUFF_ADDWATER]);
	});

	describe('conditional:53:add earth element', () => {
		testDefaultIconResult(BuffId['conditional:53:add earth element'], [IconId.BUFF_ADDEARTH]);
	});

	describe('conditional:54:add thunder element', () => {
		testDefaultIconResult(BuffId['conditional:54:add thunder element'], [IconId.BUFF_ADDTHUNDER]);
	});

	describe('conditional:55:add light element', () => {
		testDefaultIconResult(BuffId['conditional:55:add light element'], [IconId.BUFF_ADDLIGHT]);
	});

	describe('conditional:56:add dark element', () => {
		testDefaultIconResult(BuffId['conditional:56:add dark element'], [IconId.BUFF_ADDDARK]);
	});

	describe('conditional 72', () => {
		describe('conditional:72:attack boost-bb', () => {
			testDefaultIconResult(BuffId['conditional:72:attack boost-bb'], [IconId.BUFF_BBATKUP]);
		});

		describe('conditional:72:attack boost-sbb', () => {
			testDefaultIconResult(BuffId['conditional:72:attack boost-sbb'], [IconId.BUFF_SBBATKUP]);
		});

		describe('conditional:72:attack boost-ubb', () => {
			testDefaultIconResult(BuffId['conditional:72:attack boost-ubb'], [IconId.BUFF_UBBATKUP]);
		});
	});

	describe('conditional:74:add atk down to attack', () => {
		testDefaultIconResult(BuffId['conditional:74:add atk down to attack'], [IconId.BUFF_ADDATKDOWN]);
	});

	describe('conditional:75:add def down to attack', () => {
		testDefaultIconResult(BuffId['conditional:75:add def down to attack'], [IconId.BUFF_ADDDEFDOWN]);
	});

	describe('conditional:84:critical damage', () => {
		testDefaultIconResult(BuffId['conditional:84:critical damage'], [IconId.BUFF_CRTUP]);
	});

	describe('conditional:91:chance ko resistance', () => {
		testDefaultIconResult(BuffId['conditional:91:chance ko resistance'], [IconId.BUFF_KOBLOCK]);
	});

	describe('conditional:98:thunder barrier', () => {
		testDefaultIconResult(BuffId['conditional:98:thunder barrier'], [IconId.BUFF_THUNDERSHIELD]);
	});

	describe('conditional:99:light barrier', () => {
		testDefaultIconResult(BuffId['conditional:99:light barrier'], [IconId.BUFF_LIGHTSHIELD]);
	});

	describe('conditional:131:spark critical', () => {
		testDefaultIconResult(BuffId['conditional:131:spark critical'], [IconId.BUFF_SPARKCRTACTIVATED]);
	});

	describe('conditional:132:od fill rate', () => {
		testDefaultIconResult(BuffId['conditional:132:od fill rate'], [IconId.BUFF_ODFILLBOOST]);
	});

	describe('conditional:133:heal on hit', () => {
		testDefaultIconResult(BuffId['conditional:133:heal on hit'], [IconId.BUFF_BEENATK_HPREC]);
	});

	describe('conditional 143 buffs', () => {
		describe('conditional:143:critical damage reduction-base', () => {
			testDefaultIconResult(BuffId['conditional:143:critical damage reduction-base'], [IconId.BUFF_CRTDOWN]);
		});

		describe('conditional:143:critical damage reduction-buff', () => {
			testDefaultIconResult(BuffId['conditional:143:critical damage reduction-buff'], [IconId.BUFF_CRTDOWN]);
		});
	});

	describe('conditional 145 buffs', () => {
		describe('conditional:145:elemental weakness damage reduction-base', () => {
			testDefaultIconResult(BuffId['conditional:145:elemental weakness damage reduction-base'], [IconId.BUFF_ELEMENTDOWN]);
		});

		describe('conditional:145:elemental weakness damage reduction-buff', () => {
			testDefaultIconResult(BuffId['conditional:145:elemental weakness damage reduction-buff'], [IconId.BUFF_ELEMENTDOWN]);
		});
	});

	describe('conditional:153:chance inflict atk down on hit', () => {
		testDefaultIconResult(BuffId['conditional:153:chance inflict atk down on hit'], [IconId.BUFF_PROB_ATKREDUC]);
	});

	describe('conditional 10500 buffs', () => {
		describe('conditional:10500:shield-fire', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-fire'], [IconId.SG_BUFF_FIRE]);
		});

		describe('conditional:10500:shield-water', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-water'], [IconId.SG_BUFF_WATER]);
		});

		describe('conditional:10500:shield-earth', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-earth'], [IconId.SG_BUFF_EARTH]);
		});

		describe('conditional:10500:shield-thunder', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-thunder'], [IconId.SG_BUFF_THUNDER]);
		});

		describe('conditional:10500:shield-light', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-light'], [IconId.SG_BUFF_LIGHT]);
		});

		describe('conditional:10500:shield-dark', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-dark'], [IconId.SG_BUFF_DARK]);
		});

		describe('conditional:10500:shield-all', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-all'], [IconId.SG_BUFF_ALL]);
		});

		describe('conditional:10500:shield-unknown', () => {
			testDefaultIconResult(BuffId['conditional:10500:shield-unknown'], [IconId.SG_BUFF_UNKNOWN]);
		});
	});
});
