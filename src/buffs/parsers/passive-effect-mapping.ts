import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect, UnitElement, UnitType, Ailment, UnitGender } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, IGenericBuffValue, BuffId, BuffConditionElement, IBuffConditions } from './buff-types';
import { createSourcesFromContext, processExtraSkillConditions, getPassiveTargetData, IPassiveBuffProcessingInjectionContext, createUnknownParamsValue, ITargetData, parseNumberOrDefault } from './_helpers';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns Converted buff(s) from the given passive effect.
 */
export type PassiveEffectToBuffFunction = (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext) => IBuff[];

let mapping: Map<string, PassiveEffectToBuffFunction>;

/**
 * @description Retrieve the passive-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of passive IDs to functions.
 */
export function getPassiveEffectToBuffMapping (reload?: boolean): Map<string, PassiveEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, PassiveEffectToBuffFunction>();
		setMapping(mapping);
	}

	return mapping;
}

/**
 * @description Apply the mapping of passive effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping (map: Map<string, PassiveEffectToBuffFunction>): void {
	const ELEMENT_MAPPING: { [key: string]: UnitElement | BuffConditionElement } = {
		1: UnitElement.Fire,
		2: UnitElement.Water,
		3: UnitElement.Earth,
		4: UnitElement.Thunder,
		5: UnitElement.Light,
		6: UnitElement.Dark,
		X: BuffConditionElement.OmniParadigm,
	};

	const TYPE_MAPPING: { [key: string]: UnitType } = {
		1: UnitType.Lord,
		2: UnitType.Anima,
		3: UnitType.Breaker,
		4: UnitType.Guardian,
		5: UnitType.Oracle,
		6: UnitType.Rex, // no known entries have this value at the time of writing
	};

	const AILMENT_MAPPING: { [param: string]: Ailment } = {
		1: Ailment.Poison,
		2: Ailment.Weak,
		3: Ailment.Sick,
		4: Ailment.Injury,
		5: Ailment.Curse,
		6: Ailment.Paralysis,
		7: Ailment.AttackReduction,
		8: Ailment.DefenseReduction,
		9: Ailment.RecoveryReduction,
	};

	type AlphaNumeric = string | number;
	type CoreStat = 'hp' | 'atk' | 'def' | 'rec' | 'crit';
	type DropType = 'bc' | 'hc' | 'item' | 'zel' | 'karma';

	const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
	const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];
	const DROP_TYPES_ORDER: DropType[] = ['bc', 'hc', 'item', 'zel', 'karma'];

	const retrieveCommonInfoForEffects = (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext) => {
		const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		return { conditionInfo, targetData, sources };
	};

	// Disable rule as this function is only called once it's confirmed that `effect.params` exists
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const splitEffectParams = (effect: IPassiveEffect): string[] => effect.params!.split(',');

	interface IBaseLocalParamsContext {
		originalId: string;
		sources: string[];
	}

	interface IUnknownParamsContext extends IBaseLocalParamsContext {
		conditionInfo: IBuffConditions;
		targetData: ITargetData;
	}

	const createUnknownParamsEntry = (
		unknownParams: IGenericBuffValue | undefined,
		{
			originalId,
			sources,
			targetData,
			conditionInfo,
		}: IUnknownParamsContext,
	): IBuff => ({
		id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
		originalId,
		sources,
		value: unknownParams,
		conditions: { ...conditionInfo },
		...targetData,
	});

	const createNoParamsEntry = (
		{
			originalId,
			sources,
		}: IBaseLocalParamsContext,
	): IBuff => ({
		id: BuffId.NO_PARAMS_SPECIFIED,
		originalId,
		sources,
	});

	/**
	 * @description Common checks that are run for most effects after the params have been parsed
	 * into an array of {@link IBuff} but before said array is returned.
	 * @param results List of buffs from the given effect.
	 * @param unknownParams Any unknown parameters from the given effect.
	 * @param parsingContext Extra metadata extracted from the given effect.
	 * @returns {undefined} No value is returned, but it does update the `results` array.
	 */
	const handlePostParse = (
		results: IBuff[],
		unknownParams: IGenericBuffValue | undefined,
		{
			originalId,
			sources,
			targetData,
			conditionInfo,
		}: IUnknownParamsContext,
	): void => {
		if (results.length === 0) {
			results.push(createNoParamsEntry({ originalId, sources }));
		}

		if (unknownParams) {
			results.push(createUnknownParamsEntry(unknownParams, {
				originalId,
				sources,
				targetData,
				conditionInfo,
			}));
		}
	};

	const createUnknownParamsEntryFromExtraParams = (extraParams: string[], startIndex: number, injectionContext?: IPassiveBuffProcessingInjectionContext): IGenericBuffValue | undefined => {
		let unknownParams: IGenericBuffValue | undefined;
		if (extraParams && extraParams.length > 0) {
			unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
		}
		return unknownParams;
	};

	enum ThresholdType {
		Hp = 'hp',
		Bb = 'bb gauge',
	}
	interface IThresholdActivationInfo {
		threshold: number;
		requireAbove: boolean;
		type: ThresholdType;
	}

	const parseThresholdValuesFromParamsProperty = (rawThreshold: string, rawRequireAboveFlag: string, thresholdType: ThresholdType): IThresholdActivationInfo => {
		return {
			threshold: parseNumberOrDefault(rawThreshold),
			requireAbove: rawRequireAboveFlag === '1',
			type: thresholdType,
		};
	};

	const parseThresholdValuesFromEffect = (effect: IPassiveEffect, thresholdType: ThresholdType, suffix = 'buff requirement'): IThresholdActivationInfo => {
		let threshold = 0, requireAbove = false;
		if (`${thresholdType} above % ${suffix}` in effect) {
			threshold = parseNumberOrDefault(effect[`${thresholdType} above % ${suffix}`] as string);
			requireAbove = true;
		} else {
			threshold = parseNumberOrDefault(effect[`${thresholdType} below % ${suffix}`] as string);
			requireAbove = false;
		}

		return { threshold, requireAbove, type: thresholdType };
	};

	const getThresholdConditions = ({ threshold, requireAbove, type }: IThresholdActivationInfo): IBuffConditions | undefined => {
		let conditions: IBuffConditions | undefined;
		if (type === ThresholdType.Hp) {
			if (requireAbove) {
				conditions = { hpGreaterThanOrEqualTo: threshold };
			} else {
				conditions = { hpLessThanOrEqualTo: threshold };
			}
		} else if (type === ThresholdType.Bb) {
			if (requireAbove) {
				conditions = { bbGaugeGreaterThanOrEqualTo: threshold };
			} else {
				conditions = { bbGaugeLessThanOrEqualTo: threshold };
			}
		}

		return conditions;
	};

	interface ITemplatedParsingFunctionContext {
		effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect;
		context: IEffectToBuffConversionContext;
		injectionContext?: IPassiveBuffProcessingInjectionContext;
		originalId: string;
	}

	interface IPassiveWithSingleNumericalParameterContext extends ITemplatedParsingFunctionContext {
		effectKey: string;
		buffId: string;
		parseParamValue?: (rawValue: string) => number;
	}
	const parsePassiveWithSingleNumericalParameter = ({
		effect,
		context,
		injectionContext,
		originalId,
		effectKey,
		buffId,
		parseParamValue = (rawValue: string) => parseNumberOrDefault(rawValue),
	}: IPassiveWithSingleNumericalParameterContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let value = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawValue, ...extraParams] = splitEffectParams(typedEffect);
			value = parseParamValue(rawValue);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 1, injectionContext);
		} else {
			value = parseNumberOrDefault(typedEffect[effectKey] as number);
		}

		if (value !== 0) {
			results.push({
				id: buffId,
				originalId,
				sources,
				value,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	};

	interface IPassiveWithNumericalValueRangeAndChanceContext extends ITemplatedParsingFunctionContext {
		effectKeyLow: string;
		effectKeyHigh: string;
		effectKeyChance: string;

		buffKeyLow: string;
		buffKeyHigh: string;

		defaultEffectChance?: number;

		/**
		 * @description this refers to the parsing of low/high values, not chance
		 */
		parseParamValue?: (rawValue: string) => number;
		generateBaseConditions?: () => IBuffConditions,
		buffId: string;
	}
	const parsePassiveWithNumericalValueRangeAndChance = ({
		effect,
		context,
		injectionContext,
		originalId,
		effectKeyLow,
		effectKeyHigh,
		effectKeyChance,
		buffKeyLow,
		buffKeyHigh,
		defaultEffectChance = 0,
		parseParamValue = (rawValue: string) => parseNumberOrDefault(rawValue),
		generateBaseConditions = () => ({}),
		buffId,
	}: IPassiveWithNumericalValueRangeAndChanceContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let valueLow: number, valueHigh: number, chance: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawLowValue, rawHighValue, rawChance, ...extraParams] = splitEffectParams(typedEffect);
			valueLow = parseParamValue(rawLowValue);
			valueHigh = parseParamValue(rawHighValue);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			valueLow = parseNumberOrDefault(typedEffect[effectKeyLow] as number);
			valueHigh = parseNumberOrDefault(typedEffect[effectKeyHigh] as number);
			chance = parseNumberOrDefault(typedEffect[effectKeyChance] as number, defaultEffectChance);
		}

		const results: IBuff[] = [];
		if (valueLow !== 0 || valueHigh !== 0 || chance !== 0) {
			results.push({
				id: buffId,
				originalId,
				sources,
				value: {
					[buffKeyLow]: valueLow,
					[buffKeyHigh]: valueHigh,
					chance,
				},
				conditions: {
					...conditionInfo,
					...generateBaseConditions(),
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	};

	map.set('1', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '1';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as CoreStat]);
			if (value !== 0) {
				results.push({
					id: `passive:1:${stat}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('2', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '2';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			elements: [] as (UnitElement | BuffConditionElement)[],
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let element1: string, element2: string;
			[element1, element2, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			[element1, element2].forEach((elementValue) => {
				if (elementValue && elementValue !== '0') {
					stats.elements.push(ELEMENT_MAPPING[elementValue] || BuffConditionElement.Unknown);
				}
			});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			if (Array.isArray(typedEffect['elements buffed'] as UnitElement[])) {
				stats.elements = (typedEffect['elements buffed'] as UnitElement[]);
			}
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		const createBaseStatObject = (stat: CoreStat) => ({
			id: `passive:2:${stat}`,
			originalId,
			sources,
			value: parseNumberOrDefault(stats[stat]),
			...targetData,
		});
		if (stats.elements.length > 0) {
			stats.elements.forEach((element) => {
				STATS_ORDER.forEach((stat) => {
					const value = parseNumberOrDefault(stats[stat as CoreStat]);
					if (value !== 0) {
						results.push({
							...createBaseStatObject(stat as CoreStat),
							conditions: {
								...conditionInfo,
								targetElements: [element],
							},
						});
					}
				});
			});
		} else {
			STATS_ORDER.forEach((stat) => {
				const value = parseNumberOrDefault(stats[stat as CoreStat]);
				if (value !== 0) {
					results.push({
						...createBaseStatObject(stat as CoreStat),
						conditions: {
							...conditionInfo,
							targetElements: [BuffConditionElement.Unknown],
						},
					});
				}
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('3', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '3';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			unitType: '' as UnitType | 'unknown',
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let unitType: string;
			[unitType, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			if (unitType && unitType !== '0') {
				stats.unitType = TYPE_MAPPING[unitType] || 'unknown';
			}

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			stats.unitType = (typedEffect['unit type buffed'] as UnitType);
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		const targetUnitType = stats.unitType || 'unknown';
		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as CoreStat]);
			if (value !== 0) {
				results.push({
					id: `passive:3:${stat}`,
					originalId,
					sources,
					value: +value,
					conditions: {
						...conditionInfo,
						targetUnitType,
					},
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('4', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '4';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const resistances: { [ailment: string]: AlphaNumeric } = {
			poison: '0',
			weak: '0',
			sick: '0',
			injury: '0',
			curse: '0',
			paralysis: '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			AILMENTS_ORDER.forEach((ailment) => {
				const effectKey = ailment !== 'weak' ? ailment : 'weaken';
				resistances[ailment] = (typedEffect[`${effectKey} resist%`] as string);
			});
		}

		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(resistances[ailment]);
			if (value !== 0) {
				results.push({
					id: `passive:4:${ailment}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('5', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '5';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let element: UnitElement | BuffConditionElement;
		let mitigation: string | number = '0';
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawElement: string;
			[rawElement, mitigation, ...extraParams] = splitEffectParams(typedEffect);

			element = ELEMENT_MAPPING[rawElement] || BuffConditionElement.Unknown;
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			element = Object.values(ELEMENT_MAPPING).find((elem) => `${elem} resist%` in effect) || BuffConditionElement.Unknown;
			if (element !== BuffConditionElement.Unknown) {
				mitigation = (typedEffect[`${element} resist%`] as string);
			}
		}

		const value = parseNumberOrDefault(mitigation);
		if (value !== 0) {
			results.push({
				id: `passive:5:${element}`,
				originalId,
				sources,
				value,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('8', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'dmg% mitigation',
			buffId: 'passive:8',
			originalId: '8',
		});
	});

	map.set('9', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'bc fill per turn',
			buffId: 'passive:9',
			originalId: '9',
		});
	});

	map.set('10', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'hc effectiveness%',
			buffId: 'passive:10',
			originalId: '10',
		});
	});

	map.set('11', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '11';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
		};
		let thresholdInfo: IThresholdActivationInfo;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawRequireAboveFlag: string;
			let rawThreshold: string;
			[stats.atk, stats.def, stats.rec, stats.crit, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
			thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
			thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
		}

		const thresholdConditions = getThresholdConditions(thresholdInfo);
		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec' | 'crit']);
			if (stat !== 'hp' && value !== 0) {
				const entry: IBuff = {
					id: `passive:11:${stat}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo, ...thresholdConditions },
					...targetData,
				};

				results.push(entry);
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('12', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '12';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const dropRates = {
			bc: '0' as AlphaNumeric,
			hc: '0' as AlphaNumeric,
			item: '0' as AlphaNumeric,
			zel: '0' as AlphaNumeric,
			karma: '0' as AlphaNumeric,
		};
		let thresholdInfo: IThresholdActivationInfo;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawRequireAboveFlag: string;
			let rawThreshold: string;
			[dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
			thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			DROP_TYPES_ORDER.forEach((dropType) => {
				dropRates[dropType] = (typedEffect[`${dropType} drop rate% buff`] as string);
			});
			thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp);
		}

		const thresholdConditions = getThresholdConditions(thresholdInfo);
		DROP_TYPES_ORDER.forEach((dropType) => {
			const value = parseNumberOrDefault(dropRates[dropType]);
			if (value !== 0) {
				const entry: IBuff = {
					id: `passive:12:${dropType}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo, ...thresholdConditions },
					...targetData,
				};

				results.push(entry);
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('13', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '13',
			effectKeyLow: 'bc fill on enemy defeat low',
			effectKeyHigh: 'bc fill on enemy defeat high',
			effectKeyChance: 'bc fill on enemy defeat%',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			generateBaseConditions: () => ({ onEnemyDefeat: true }),
			buffId: 'passive:13',
		});
	});

	map.set('14', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '14';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let damageReduction: number, chance: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawReduction, rawChance, ...extraParams] = splitEffectParams(typedEffect);
			damageReduction = parseNumberOrDefault(rawReduction);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			damageReduction = parseNumberOrDefault(typedEffect['dmg reduction%'] as number);
			chance = parseNumberOrDefault(typedEffect['dmg reduction chance%'] as number);
		}

		const results: IBuff[] = [];
		if (damageReduction !== 0 || chance !== 0) {
			results.push({
				id: 'passive:14',
				originalId,
				sources,
				value: {
					value: damageReduction,
					chance,
				},
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('15', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '15',
			effectKeyLow: 'hp% recover on enemy defeat low',
			effectKeyHigh: 'hp% recover on enemy defeat high',
			effectKeyChance: 'hp% recover on enemy defeat chance%',
			buffKeyLow: 'healLow',
			buffKeyHigh: 'healHigh',
			generateBaseConditions: () => ({ onEnemyDefeat: true }),
			defaultEffectChance: 100, // currently deathmax's datamine misses this value, but all known entries have 100% chance
			buffId: 'passive:15',
		});
	});

	map.set('16', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '16';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let healLow: number, healHigh: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawHealLow, rawHealHigh, ...extraParams] = splitEffectParams(typedEffect);
			healLow = parseNumberOrDefault(rawHealLow);
			healHigh = parseNumberOrDefault(rawHealHigh);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			healLow = parseNumberOrDefault(typedEffect['hp% recover on battle win low'] as number);
			healHigh = parseNumberOrDefault(typedEffect['hp% recover on battle win high'] as number);
		}

		const results: IBuff[] = [];
		if (healLow !== 0 || healHigh !== 0) {
			results.push({
				id: 'passive:16',
				originalId,
				sources,
				value: {
					healLow,
					healHigh,
				},
				conditions: {
					...conditionInfo,
					onBattleWin: true,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('17', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '17',
			effectKeyLow: 'hp drain% low',
			effectKeyHigh: 'hp drain% high',
			effectKeyChance: 'hp drain chance%',
			buffKeyLow: 'drainHealLow',
			buffKeyHigh: 'drainHealHigh',
			buffId: 'passive:17',
		});
	});

	map.set('19', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '19';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const dropRates = {
			bc: '0' as AlphaNumeric,
			hc: '0' as AlphaNumeric,
			item: '0' as AlphaNumeric,
			zel: '0' as AlphaNumeric,
			karma: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			DROP_TYPES_ORDER.forEach((dropType) => {
				dropRates[dropType] = (typedEffect[`${dropType} drop rate% buff`] as string);
			});
		}

		DROP_TYPES_ORDER.forEach((dropType) => {
			const value = parseNumberOrDefault(dropRates[dropType]);
			if (value !== 0) {
				results.push({
					id: `passive:19:${dropType}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('20', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '20';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		interface IAilmentInflictionPair {
			ailment: Ailment;
			chance: number;
		}
		const inflictedAilments: IAilmentInflictionPair[] = [];
		const typedEffect = (effect as IPassiveEffect);
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let params = splitEffectParams(typedEffect);
			if (params.length % 2 !== 0 && params[params.length - 1] !== '0') {
				unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(-1), params.length - 1, injectionContext);
				params = params.slice(0, params.length - 1);
			}

			const numParams = params.length;
			for (let index = 0; index < numParams; index += 2) {
				const ailmentValue = params[index];
				const chance = parseNumberOrDefault(params[index + 1]);
				if (ailmentValue !== '0' || chance !== 0) {
					const ailmentType = AILMENT_MAPPING[ailmentValue] || Ailment.Unknown;
					inflictedAilments.push({
						ailment: ailmentType,
						chance,
					});
				}
			}
		} else {
			Object.values(AILMENT_MAPPING).forEach((ailment) => {
				let effectKey: string;
				if (ailment === Ailment.Weak) {
					effectKey = 'weaken%';
				} else if (ailment === Ailment.AttackReduction || ailment === Ailment.DefenseReduction || ailment === Ailment.RecoveryReduction) {
					effectKey = ailment;
				} else {
					effectKey = `${ailment}%`;
				}

				if (effectKey in effect) {
					inflictedAilments.push({
						ailment,
						chance: parseNumberOrDefault(typedEffect[effectKey] as number),
					});
				}
			});
		}

		const results: IBuff[] = [];
		inflictedAilments.forEach(({ ailment, chance }) => {
			if (chance !== 0) {
				results.push({
					id: `passive:20:${ailment}`,
					originalId,
					sources,
					value: chance,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('21', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '21';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
		};
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let rawDuration: string, extraParams: string[];
			[stats.atk, stats.def, stats.rec, stats.crit, rawDuration, ...extraParams] = splitEffectParams(typedEffect);
			turnDuration = parseNumberOrDefault(rawDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			stats.atk = (typedEffect['first x turns atk% (1)'] as string);
			stats.def = (typedEffect['first x turns def% (3)'] as string);
			stats.rec = (typedEffect['first x turns rec% (5)'] as string);
			stats.crit = (typedEffect['first x turns crit% (7)'] as string);
			turnDuration = parseNumberOrDefault(typedEffect['first x turns'] as string);
		}

		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec' | 'crit']);
			if (stat !== 'hp' && value !== 0) {
				const entry: IBuff = {
					id: `passive:21:${stat}`,
					originalId,
					sources,
					value,
					duration: turnDuration,
					conditions: { ...conditionInfo },
					...targetData,
				};

				results.push(entry);
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('23', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '23';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let fillLow: number, fillHigh: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawFillLow, rawFillHigh, ...extraParams] = splitEffectParams(typedEffect);
			fillLow = parseNumberOrDefault(rawFillLow) / 100;
			fillHigh = parseNumberOrDefault(rawFillHigh) / 100;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			fillLow = parseNumberOrDefault(typedEffect['battle end bc fill low'] as number);
			fillHigh = parseNumberOrDefault(typedEffect['battle end bc fill high'] as number);
		}

		const results: IBuff[] = [];
		if (fillLow !== 0 || fillHigh !== 0) {
			results.push({
				id: 'passive:23',
				originalId,
				sources,
				value: {
					fillLow,
					fillHigh,
				},
				conditions: {
					...conditionInfo,
					onBattleWin: true,
				},
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('24', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '24',
			effectKeyLow: 'dmg% to hp when attacked low',
			effectKeyHigh: 'dmg% to hp when attacked high',
			effectKeyChance: 'dmg% to hp when attacked chance%',
			buffKeyLow: 'healLow',
			buffKeyHigh: 'healHigh',
			generateBaseConditions: () => ({ whenAttacked: true }),
			buffId: 'passive:24',
		});
	});

	map.set('25', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '25',
			effectKeyLow: 'bc fill when attacked low',
			effectKeyHigh: 'bc fill when attacked high',
			effectKeyChance: 'bc fill when attacked%',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			generateBaseConditions: () => ({ whenAttacked: true }),
			buffId: 'passive:25',
		});
	});

	map.set('26', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '26',
			effectKeyLow: 'dmg% reflect low',
			effectKeyHigh: 'dmg% reflect high',
			effectKeyChance: 'dmg% reflect chance%',
			buffKeyLow: 'damageReflectLow',
			buffKeyHigh: 'damageReflectHigh',
			generateBaseConditions: () => ({ whenAttacked: true }),
			buffId: 'passive:26',
		});
	});

	map.set('27', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'target% chance',
			buffId: 'passive:27',
			originalId: '27',
		});
	});

	map.set('28', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '28';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const typedEffect = (effect as IPassiveEffect);
		let value = 0;
		let thresholdInfo: IThresholdActivationInfo;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawValue, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
			value = parseNumberOrDefault(rawValue);
			thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			value = parseNumberOrDefault(typedEffect['target% chance'] as string);
			thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Hp, 'passive requirement');
		}

		const results: IBuff[] = [];
		if (value !== 0) {
			const thresholdConditions = getThresholdConditions(thresholdInfo);
			const entry: IBuff = {
				id: 'passive:28',
				originalId,
				sources,
				value,
				conditions: { ...conditionInfo, ...thresholdConditions },
				...targetData,
			};

			results.push(entry);
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('29', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'ignore def%',
			buffId: 'passive:29',
			originalId: '29',
		});
	});

	map.set('30', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '30';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
		};
		let thresholdInfo: IThresholdActivationInfo;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawRequireAboveFlag: string;
			let rawThreshold: string;
			[stats.atk, stats.def, stats.rec, stats.crit, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
			thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Bb);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
			thresholdInfo = parseThresholdValuesFromEffect(typedEffect, ThresholdType.Bb);
		}

		const thresholdConditions = getThresholdConditions(thresholdInfo);
		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec' | 'crit']);
			if (stat !== 'hp' && value !== 0) {
				const entry: IBuff = {
					id: `passive:30:${stat}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo, ...thresholdConditions },
					...targetData,
				};

				results.push(entry);
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('31', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '31';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const dropRates = {
			bc: '0' as AlphaNumeric,
			hc: '0' as AlphaNumeric,
			item: '0' as AlphaNumeric,
			zel: '0' as AlphaNumeric,
			karma: '0' as AlphaNumeric,
		};
		let sparkDamageBoost = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawSparkDamageBoost: string;
			[rawSparkDamageBoost, dropRates.bc, dropRates.hc, dropRates.item, dropRates.zel, dropRates.karma, ...extraParams] = splitEffectParams(typedEffect);
			sparkDamageBoost = parseNumberOrDefault(rawSparkDamageBoost);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			sparkDamageBoost = parseNumberOrDefault(typedEffect['damage% for spark'] as string);
			DROP_TYPES_ORDER.forEach((dropType) => {
				dropRates[dropType] = (typedEffect[`${dropType} drop% for spark`] as string);
			});
		}

		const results: IBuff[] = [];
		if (sparkDamageBoost !== 0) {
			results.push({
				id: 'passive:31:damage',
				originalId,
				sources,
				value: sparkDamageBoost,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		DROP_TYPES_ORDER.forEach((dropType) => {
			const value = parseNumberOrDefault(dropRates[dropType]);
			if (value !== 0) {
				results.push({
					id: `passive:31:${dropType}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('32', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'bb gauge fill rate%',
			buffId: 'passive:32',
			originalId: '32',
		});
	});

	map.set('33', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '33';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let healLow: number, healHigh: number, addedRec: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawHealLow, rawHealHigh, rawAddedRec, ...extraParams] = splitEffectParams(typedEffect);
			healLow = parseNumberOrDefault(rawHealLow);
			healHigh = parseNumberOrDefault(rawHealHigh);
			addedRec = (1 + parseNumberOrDefault(rawAddedRec) / 100) * 10;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			healLow = parseNumberOrDefault(typedEffect['turn heal low'] as number);
			healHigh = parseNumberOrDefault(typedEffect['turn heal high'] as number);
			addedRec = parseNumberOrDefault(typedEffect['rec% added (turn heal)'] as number);
		}

		const results: IBuff[] = [];
		if (healLow !== 0 || healHigh !== 0) {
			results.push({
				id: 'passive:33',
				originalId,
				sources,
				value: {
					healLow,
					healHigh,
					'addedRec%': addedRec,
				},
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('34', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'crit multiplier%',
			buffId: 'passive:34',
			originalId: '34',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) * 100,
		});
	});

	map.set('35', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '35',
			effectKeyLow: 'bc fill when attacking low',
			effectKeyHigh: 'bc fill when attacking high',
			effectKeyChance: 'bc fill when attacking%',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			generateBaseConditions: () => ({ onNormalAttack: true }),
			buffId: 'passive:35',
		});
	});

	map.set('36', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '36';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let additionalActions = 0, damageModifier = 0, chance = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawAdditionalActions, rawDamageModifier, rawChance, ...extraParams] = splitEffectParams(typedEffect);
			additionalActions = parseNumberOrDefault(rawAdditionalActions);
			damageModifier = parseNumberOrDefault(rawDamageModifier);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			additionalActions = parseNumberOrDefault(typedEffect['additional actions'] as number);
		}

		const results: IBuff[] = [];
		if (additionalActions !== 0 || damageModifier !== 0 || chance !== 0) {
			results.push({
				id: 'passive:36',
				originalId,
				sources,
				value: {
					additionalActions,
					damageModifier,
					chance,
				},
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('37', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '37';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let hitIncreasePerHit = 0, extraHitDamage = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			hitIncreasePerHit = parseNumberOrDefault(params[0]);
			extraHitDamage = parseNumberOrDefault(params[2]);

			const extraParams = ['0', params[1], '0', ...params.slice(3)];
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 0, injectionContext);
		} else {
			hitIncreasePerHit = parseNumberOrDefault(typedEffect['hit increase/hit'] as number);
			extraHitDamage = parseNumberOrDefault(typedEffect['extra hits dmg%'] as number);
		}

		const results: IBuff[] = [];
		if (hitIncreasePerHit !==0 || extraHitDamage !== 0) {
			results.push({
				id: 'passive:37',
				originalId,
				sources,
				value: {
					hitIncreasePerHit,
					extraHitDamage,
				},
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('40', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '40';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		type CoreStatProperty = 'atk' | 'def' | 'rec' | 'hp' | 'unknown';
		const coreStatProperties: CoreStatProperty[] = ['atk', 'def', 'rec'];
		const coreStatPropertyMapping: { [key: string]: CoreStatProperty } = {
			1: 'atk',
			2: 'def',
			3: 'rec',
			4: 'hp',
		};
		const effectToCoreStatMapping = {
			attack: 'atk',
			defense: 'def',
			recovery: 'rec',
			hp: 'hp',
		};
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
		};
		let convertedStat: CoreStatProperty = 'unknown';

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawConvertedStat: string;
			[rawConvertedStat, stats.atk, stats.def, stats.rec, ...extraParams] = splitEffectParams(typedEffect);
			convertedStat = coreStatPropertyMapping[rawConvertedStat] || 'unknown';

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			const rawConvertedStat = typedEffect['converted attribute'] as string;
			if (rawConvertedStat in effectToCoreStatMapping) {
				convertedStat = effectToCoreStatMapping[rawConvertedStat as 'attack' | 'defense' | 'recovery' | 'hp'] as CoreStatProperty;
			} else {
				convertedStat = 'unknown';
			}

			coreStatProperties.forEach((statType) => {
				const effectKey = `${statType}% buff`;
				if (effectKey in typedEffect) {
					stats[statType as 'atk' | 'def' | 'rec'] = (typedEffect[effectKey] as number);
				}
			});
		}

		const results: IBuff[] = [];
		coreStatProperties.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as 'atk' | 'def' | 'rec']);
			if (value !== 0) {
				results.push({
					id: `passive:40:${stat}`,
					originalId,
					sources,
					value: {
						convertedStat,
						value,
					},
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('41', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '41';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			minimumElements: '0' as AlphaNumeric,
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[stats.minimumElements, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			stats.minimumElements = (typedEffect['unique elements required'] as UnitType);
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		const minimumElements = parseNumberOrDefault(stats.minimumElements);
		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as CoreStat]);
			if (value !== 0) {
				results.push({
					id: `passive:41:${stat}`,
					originalId,
					sources,
					value: +value,
					conditions: {
						...conditionInfo,
						minumumUniqueElements: minimumElements,
					},
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('42', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '42';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const GENDER_MAPPING: { [key: string]: UnitGender } = {
			0: UnitGender.Other,
			1: UnitGender.Male,
			2: UnitGender.Female,
		};

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			gender: '' as UnitGender | 'unknown',
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawGender: string;
			[rawGender, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			stats.gender = GENDER_MAPPING[rawGender] || 'unknown';

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			stats.gender = (typedEffect['gender required'] as UnitGender);
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		const targetGender = stats.gender || 'unknown';
		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as CoreStat]);
			if (value !== 0) {
				results.push({
					id: `passive:42:${stat}`,
					originalId,
					sources,
					value: +value,
					conditions: {
						...conditionInfo,
						targetGender,
					},
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('43', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'take 1 dmg%',
			buffId: 'passive:43',
			originalId: '43',
		});
	});

	map.set('44', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '44';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as AlphaNumeric,
			def: '0' as AlphaNumeric,
			rec: '0' as AlphaNumeric,
			crit: '0' as AlphaNumeric,
			hp: '0' as AlphaNumeric,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = splitEffectParams(typedEffect);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			stats.hp = (typedEffect['hp buff'] as string);
			stats.atk = (typedEffect['atk buff'] as string);
			stats.def = (typedEffect['def buff'] as string);
			stats.rec = (typedEffect['rec buff'] as string);
			stats.crit = (typedEffect['crit buff'] as string);
		}

		STATS_ORDER.forEach((stat) => {
			const value = parseNumberOrDefault(stats[stat as CoreStat]);
			if (value !== 0) {
				results.push({
					id: `passive:44:${stat}`,
					originalId,
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('45', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '45';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let baseResist = 0, buffResist = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawBaseResist, rawBuffResist, ...extraParams] = splitEffectParams(typedEffect);
			baseResist = parseNumberOrDefault(rawBaseResist);
			buffResist = parseNumberOrDefault(rawBuffResist);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			baseResist = parseNumberOrDefault(typedEffect['base crit% resist'] as number);
			buffResist = parseNumberOrDefault(typedEffect['buff crit% resist'] as number);
		}

		const results: IBuff[] = [];
		if (baseResist !== 0) {
			results.push({
				id: 'passive:45:base',
				originalId,
				sources,
				value: baseResist,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		if (buffResist !== 0) {
			results.push({
				id: 'passive:45:buff',
				originalId,
				sources,
				value: buffResist,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('46', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '46';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		interface IStatInfo {
			stat: CoreStat;
			baseValue: number;
			addedValue: number;
		}
		type ProportionalMode = 'lost' | 'remaining' | 'unknown';
		const availableStats: CoreStat[] = ['atk', 'def', 'rec'];
		const stats: IStatInfo[] = [];
		let proportionalMode: ProportionalMode = 'unknown';
		const typedEffect = (effect as IPassiveEffect);

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			availableStats.forEach((stat, index) => {
				const baseValue = parseNumberOrDefault(params[index * 2]);
				const addedValue = parseNumberOrDefault(params[(index * 2) + 1]);
				if (baseValue !== 0 || addedValue !== 0) {
					stats.push({
						stat,
						baseValue,
						addedValue,
					});
				}
			});
			proportionalMode = params[6] === '1' ? 'lost' : 'remaining';

			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
		} else {
			availableStats.forEach((stat) => {
				const baseValue = parseNumberOrDefault(typedEffect[`${stat}% base buff`] as number);
				const addedValue = parseNumberOrDefault(typedEffect[`${stat}% extra buff based on hp`] as number);
				if (baseValue !== 0 || addedValue !== 0) {
					stats.push({
						stat,
						baseValue,
						addedValue,
					});
				}
			});
			proportionalMode = (typedEffect['buff proportional to hp'] as ProportionalMode) || 'unknown';
		}

		const results: IBuff[] = stats.map(({ stat, baseValue, addedValue }) => ({
			id: `passive:46:${stat}`,
			originalId,
			sources,
			value: {
				baseValue,
				addedValue,
				proportionalMode,
			},
			conditions: { ...conditionInfo },
			...targetData,
		}));

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('47', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '47',
			effectKeyLow: 'bc fill on spark low',
			effectKeyHigh: 'bc fill on spark high',
			effectKeyChance: 'bc fill on spark%',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			buffId: 'passive:47',
		});
	});
}
