import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect, UnitElement, UnitType, Ailment, UnitGender, IProcEffect, TargetType, TargetArea, ProcEffect } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, IGenericBuffValue, BuffId, BuffConditionElement, IBuffConditions, IConditionalEffect } from './buff-types';
import { createSourcesFromContext, processExtraSkillConditions, getPassiveTargetData, IPassiveBuffProcessingInjectionContext, ITargetData, parseNumberOrDefault, createUnknownParamsEntryFromExtraParams, createNoParamsEntry } from './_helpers';
import convertConditionalEffectToBuffs from './convertConditionalEffectToBuffs';
import convertProcEffectToBuffs from './convertProcEffectToBuffs';

/**
 * @description Type representing a function that can parse a passive effect into an array of buffs.
 * @param effect Effect to convert to {@link IBuff} format.
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
	const UNKNOWN_PASSIVE_PARAM_EFFECT_KEY = 'unknown passive params';
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

	const TARGET_TYPE_MAPPING: { [param: string]: TargetType } = {
		1: TargetType.Party,
		2: TargetType.Enemy,
		3: TargetType.Self,
	};

	const TARGET_AREA_MAPPING: { [param: string]: TargetArea } = {
		1: TargetArea.Single,
		2: TargetArea.Aoe,
	};

	type AlphaNumeric = string | number;
	type CoreStat = 'hp' | 'atk' | 'def' | 'rec' | 'crit';
	type DropType = 'bc' | 'hc' | 'item' | 'zel' | 'karma';

	const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
	const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
	const DROP_TYPES_ORDER: DropType[] = ['bc', 'hc', 'item', 'zel', 'karma'];

	const retrieveCommonInfoForEffects = (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext) => {
		const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		return { conditionInfo, targetData, sources };
	};

	const convertConditionalEffectToBuffsWithInjectionContext = (effect: IConditionalEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const conversionFunction = (injectionContext && injectionContext.convertConditionalEffectToBuffs) || convertConditionalEffectToBuffs;
		return conversionFunction(effect, context);
	};

	const convertProcEffectToBuffsWithInjectionContext = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const conversionFunction = (injectionContext && injectionContext.convertProcEffectToBuffs) || convertProcEffectToBuffs;
		return conversionFunction(effect, context);
	};

	// Disable rule as this function is only called once it's confirmed that `effect.params` exists
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const splitEffectParams = (effect: IPassiveEffect): string[] => effect.params!.split(',');

	const splitEffectWithUnknownPassiveParamsProperty = (effect: IPassiveEffect): string[] => {
		const rawParams: string = effect.params || (effect[UNKNOWN_PASSIVE_PARAM_EFFECT_KEY] as string) || '';
		return splitEffectParams({ params: rawParams } as IPassiveEffect);
	};

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

	enum ThresholdType {
		Hp = 'hp',
		Bb = 'bb gauge',
		DamageTaken = 'damage taken',
		DamageDealt = 'damage dealt',
		BcReceived = 'bc receive count',
		HcReceived = 'hc receive count',
		SparkCount = 'spark count',
		ChanceGuard = 'on guard',
		ChanceCrit = 'on crit',
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
		let effectKey: string, fallbackEffectKey: string | undefined, requireAbove = true;
		if (thresholdType === ThresholdType.DamageTaken) {
			effectKey = 'damage threshold activation';
		} else if (thresholdType === ThresholdType.DamageDealt) {
			effectKey = 'damage dealt threshold activation';
		} else if (thresholdType === ThresholdType.BcReceived) {
			effectKey = 'bc receive count buff activation';
			fallbackEffectKey = 'bc receive count activation';
		} else if (thresholdType === ThresholdType.HcReceived) {
			effectKey = 'hc receive count buff activation';
			fallbackEffectKey = 'hc receive count activation';
		} else if (thresholdType === ThresholdType.SparkCount) {
			effectKey = 'spark count buff activation';
			fallbackEffectKey = 'spark count activation';
		} else if (`${thresholdType} above % ${suffix}` in effect) {
			effectKey = `${thresholdType} above % ${suffix}`;
		} else {
			effectKey = `${thresholdType} below % ${suffix}`;
			requireAbove = false;
		}

		const threshold = !fallbackEffectKey
			? parseNumberOrDefault(effect[effectKey] as string)
			: parseNumberOrDefault(effect[effectKey] as string, parseNumberOrDefault(effect[fallbackEffectKey] as string))
		return {
			threshold,
			requireAbove,
			type: thresholdType,
		};
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
		} else if (type === ThresholdType.DamageTaken) {
			conditions = { damageTakenExceeds: threshold };
		} else if (type === ThresholdType.DamageDealt) {
			conditions = { damageDealtExceeds: threshold };
		} else if (type === ThresholdType.BcReceived) {
			conditions = { bcReceivedExceeds: threshold };
		} else if (type === ThresholdType.HcReceived) {
			conditions = { hcReceivedExceeds: threshold };
		} else if (type === ThresholdType.SparkCount) {
			conditions = { sparkCountExceeds: threshold };
		} else if (type === ThresholdType.ChanceGuard) {
			conditions = { onGuardChance: threshold };
		} else if (type === ThresholdType.ChanceCrit) {
			conditions = { onCriticalHitChance: threshold };
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

	interface IConditionalPassiveWithSingleNumericalConditionContext extends ITemplatedParsingFunctionContext {
		buffId: string;
		thresholdType: ThresholdType;
	}
	const parseConditionalPassiveWithSingleNumericalCondition = ({
		effect,
		context,
		injectionContext,
		originalId,
		buffId,
		thresholdType,
	}: IConditionalPassiveWithSingleNumericalConditionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			const triggeredBuffs = convertConditionalEffectToBuffsWithInjectionContext({
				id: params[0],
				params: params[1],
				turnDuration: parseNumberOrDefault(params[4]),
			}, context, injectionContext);
			const maxTriggerCount = parseNumberOrDefault(params[2]);
			const thresholdInfo = parseThresholdValuesFromParamsProperty(params[3], '1', thresholdType);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(5), 5, injectionContext);

			if (triggeredBuffs.length > 0) {
				const thresholdConditions = getThresholdConditions(thresholdInfo);
				results.push({
					id: buffId,
					originalId,
					sources,
					value: {
						triggeredBuffs,
						maxTriggerCount,
					},
					conditions: { ...conditionInfo, ...thresholdConditions },
					...targetData,
				});
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	};

	interface IConditionalBcFillWithSingleNumericalConditionContext extends ITemplatedParsingFunctionContext {
		thresholdType: ThresholdType;
		flatFillBuffId: string;
		percentFillBuffId: string;
		flatFillEffectKey: string;
		// percentFillEffectKey: string; // NOTE: deathmax datamine does not parse this property in conditional effects
	}
	const parseConditionalBcFillWithSingleNumericalCondition = ({
		effect,
		context,
		injectionContext,
		originalId,
		thresholdType,
		flatFillBuffId,
		percentFillBuffId,
		flatFillEffectKey,
	}: IConditionalBcFillWithSingleNumericalConditionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let flatFill: number, percentFill: number, thresholdInfo: IThresholdActivationInfo;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			flatFill = parseNumberOrDefault(params[0]) / 100;
			percentFill = parseNumberOrDefault(params[1]);
			thresholdInfo = parseThresholdValuesFromParamsProperty(params[2], '1', thresholdType);

			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(3), 3, injectionContext);
		} else {
			flatFill = parseNumberOrDefault(typedEffect[flatFillEffectKey] as number);
			percentFill = 0; // NOTE: deathmax datamine does not parse this property
			thresholdInfo = parseThresholdValuesFromEffect(typedEffect, thresholdType);
		}

		const results: IBuff[] = [];
		if (flatFill !== 0) {
			const thresholdConditions = getThresholdConditions(thresholdInfo);
			results.push({
				id: flatFillBuffId,
				originalId,
				sources,
				value: flatFill,
				conditions: {
					...conditionInfo,
					...thresholdConditions,
				},
				...targetData,
			});
		}

		if (percentFill !== 0) {
			const thresholdConditions = getThresholdConditions(thresholdInfo);
			results.push({
				id: percentFillBuffId,
				originalId,
				sources,
				value: percentFill,
				conditions: {
					...conditionInfo,
					...thresholdConditions,
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
			id: `passive:2:elemental-${stat}`,
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
					id: `passive:3:type based-${stat}`,
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
					id: `passive:4:resist-${ailment}`,
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
				id: `passive:5:mitigate-${element}`,
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
			buffId: 'passive:8:mitigation',
			originalId: '8',
		});
	});

	map.set('9', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'bc fill per turn',
			buffId: 'passive:9:gradual bc fill',
			originalId: '9',
		});
	});

	map.set('10', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'hc effectiveness%',
			buffId: 'passive:10:hc efficacy',
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
					id: `passive:11:hp conditional-${stat}`,
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
					id: `passive:12:hp conditional drop boost-${dropType}`,
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
			buffId: 'passive:13:bc fill on enemy defeat',
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
				id: 'passive:14:chance mitigation',
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
			buffId: 'passive:15:heal on enemy defeat',
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
				id: 'passive:16:heal on win',
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
			buffKeyLow: 'drainHealLow%',
			buffKeyHigh: 'drainHealHigh%',
			buffId: 'passive:17:hp absorb',
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
					id: `passive:19:drop boost-${dropType}`,
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
					id: `passive:20:chance inflict-${ailment}`,
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
					id: `passive:21:first turn-${stat}`,
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
				id: 'passive:23:bc fill on win',
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
			buffId: 'passive:24:heal on hit',
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
			buffId: 'passive:25:bc fill on hit',
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
			buffId: 'passive:26:chance damage reflect',
		});
	});

	map.set('27', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'target% chance',
			buffId: 'passive:27:target chance change',
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
				id: 'passive:28:hp conditional target chance change',
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
			buffId: 'passive:29:chance def ignore',
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
					id: `passive:30:bb gauge conditional-${stat}`,
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
				id: 'passive:31:spark-damage',
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
					id: `passive:31:spark-${dropType}`,
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
			buffId: 'passive:32:bc efficacy',
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
				id: 'passive:33:gradual heal',
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
			buffId: 'passive:34:critical damage',
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
			buffId: 'passive:35:bc fill on normal attack',
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
				id: 'passive:36:extra action',
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
				id: 'passive:37:hit count boost',
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
					id: `passive:40:converted-${stat}`,
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
					id: `passive:41:unique element count-${stat}`,
					originalId,
					sources,
					value: +value,
					conditions: {
						...conditionInfo,
						minimumUniqueElements: minimumElements,
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
					id: `passive:42:gender-${stat}`,
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
			buffId: 'passive:43:chance damage to one',
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
					id: `passive:44:flat-${stat}`,
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
				id: 'passive:45:critical damage reduction-base',
				originalId,
				sources,
				value: baseResist,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		if (buffResist !== 0) {
			results.push({
				id: 'passive:45:critical damage reduction-buff',
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
			id: `passive:46:hp scaled-${stat}`,
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
			buffId: 'passive:47:bc fill on spark',
		});
	});

	map.set('48', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'reduced bb bc cost%',
			buffId: 'passive:48:bc cost reduction',
			originalId: '48',
		});
	});

	map.set('49', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '49',
			effectKeyLow: 'reduced bb bc use% low',
			effectKeyHigh: 'reduced bb bc use% high',
			effectKeyChance: 'reduced bb bc use chance%',
			buffKeyLow: 'reducedUseLow%',
			buffKeyHigh: 'reducedUseHigh%',
			buffId: 'passive:49:bb gauge consumption reduction',
		});
	});

	map.set('50', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '50';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let elements: (UnitElement | BuffConditionElement)[];
		let damageBoost = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			damageBoost = parseNumberOrDefault(params[6]) * 100;
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
		} else {
			elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`${element} units do extra elemental weakness dmg`]);
			damageBoost = parseNumberOrDefault(typedEffect['elemental weakness multiplier%'] as number);
		}

		let results: IBuff[] = [];
		if (damageBoost !== 0) {
			results = elements.map((element) => ({
				id: `passive:50:elemental weakness damage-${element}`,
				originalId,
				sources,
				value: damageBoost,
				conditions: { ...conditionInfo },
				...targetData,
			}));

			if (results.length === 0) {
				results.push({
					id: 'passive:50:elemental weakness damage-unknown',
					originalId,
					sources,
					value: damageBoost,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('53', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '53';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		enum ResistType {
			CriticalDamage = 'critical damage',
			ElementDamage = 'element damage',
			CriticalHitRate = 'critical rate',
		}
		interface IResistanceInfo {
			resistType: ResistType;
			base: number;
			buff: number;
		}
		const resistances: IResistanceInfo[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawBaseCritDamageResist, rawBuffCritDamageResist, rawBaseElementDamageResist, rawBuffElementDamageResist, rawBaseCritChanceResist, rawBuffCritChanceResist, ...extraParams] = splitEffectParams(typedEffect);
			[
				{ resistType: ResistType.CriticalDamage, base: parseNumberOrDefault(rawBaseCritDamageResist), buff: parseNumberOrDefault(rawBuffCritDamageResist) },
				{ resistType: ResistType.ElementDamage, base: parseNumberOrDefault(rawBaseElementDamageResist), buff: parseNumberOrDefault(rawBuffElementDamageResist) },
				{ resistType: ResistType.CriticalHitRate, base: parseNumberOrDefault(rawBaseCritChanceResist), buff: parseNumberOrDefault(rawBuffCritChanceResist) },
			].forEach(({ resistType, base, buff }) => {
				if (base !== 0 || buff !== 0) {
					resistances.push({ resistType, base, buff });
				}
			});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			[
				{ resistType: ResistType.CriticalDamage, baseKey: 'crit dmg base damage resist%', buffKey: 'crit dmg buffed damage resist%' },
				{ resistType: ResistType.ElementDamage, baseKey: 'strong base element damage resist%', buffKey: 'strong buffed element damage resist%' },
				{ resistType: ResistType.CriticalHitRate, baseKey: 'crit chance base resist%', buffKey: 'crit chance buffed resist%' },
			].forEach(({ resistType, baseKey, buffKey }) => {
				const base = parseNumberOrDefault(typedEffect[baseKey] as number);
				const buff = parseNumberOrDefault(typedEffect[buffKey] as number);
				if (base !== 0 || buff !== 0) {
					resistances.push({ resistType, base, buff });
				}
			});
		}

		const results: IBuff[] = [];
		resistances.forEach(({ resistType, base, buff }) => {
			if (base !== 0) {
				results.push({
					id: `passive:53:${resistType}-base`,
					originalId,
					sources,
					value: base,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}

			if (buff !== 0) {
				results.push({
					id: `passive:53:${resistType}-buff`,
					originalId,
					sources,
					value: buff,
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

	map.set('55', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '55';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			const triggeredBuffs = convertConditionalEffectToBuffsWithInjectionContext({
				id: params[0],
				params: params[1],
				turnDuration: parseNumberOrDefault(params[5]),
			}, context, injectionContext);
			const maxTriggerCount = parseNumberOrDefault(params[2]);
			const thresholdInfo = parseThresholdValuesFromParamsProperty(params[3], params[4], ThresholdType.Hp);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);

			if (triggeredBuffs.length > 0) {
				const thresholdConditions = getThresholdConditions(thresholdInfo);
				results.push({
					id: 'passive:55:hp conditional',
					originalId,
					sources,
					value: {
						triggeredBuffs,
						maxTriggerCount,
					},
					conditions: { ...conditionInfo, ...thresholdConditions },
					...targetData,
				});
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('58', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'guard increase mitigation%',
			buffId: 'passive:58:guard mitigation',
			originalId: '58',
		});
	});

	map.set('59', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '59';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let percentFill: number, flatFill: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawPercentFill, rawFlatFill, ...extraParams] = splitEffectParams(typedEffect);
			percentFill = parseNumberOrDefault(rawPercentFill);
			flatFill = parseNumberOrDefault(rawFlatFill) / 100;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			percentFill = parseNumberOrDefault(typedEffect['bb gauge% filled when attacked while guarded'] as number);
			flatFill = parseNumberOrDefault(typedEffect['bc filled when attacked while guarded'] as number);
		}

		const results: IBuff[] = [];
		if (percentFill !== 0) {
			results.push({
				id: 'passive:59:bc fill when attacked on guard-percent',
				originalId,
				sources,
				value: percentFill,
				conditions: {
					...conditionInfo,
					whenAttacked: true,
					onGuard: true,
				},
				...targetData,
			});
		}

		if (flatFill !== 0) {
			results.push({
				id: 'passive:59:bc fill when attacked on guard-flat',
				originalId,
				sources,
				value: flatFill,
				conditions: {
					...conditionInfo,
					whenAttacked: true,
					onGuard: true,
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

	map.set('61', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '61';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let percentFill: number, flatFill: number;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawPercentFill, rawFlatFill, ...extraParams] = splitEffectParams(typedEffect);
			percentFill = parseNumberOrDefault(rawPercentFill);
			flatFill = parseNumberOrDefault(rawFlatFill) / 100;

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			percentFill = parseNumberOrDefault(typedEffect['bb gauge% filled on guard'] as number);
			flatFill = parseNumberOrDefault(typedEffect['bc filled on guard'] as number);
		}

		const results: IBuff[] = [];
		if (percentFill !== 0) {
			results.push({
				id: 'passive:61:bc fill on guard-percent',
				originalId,
				sources,
				value: percentFill,
				conditions: {
					...conditionInfo,
					onGuard: true,
				},
				...targetData,
			});
		}

		if (flatFill !== 0) {
			results.push({
				id: 'passive:61:bc fill on guard-flat',
				originalId,
				sources,
				value: flatFill,
				conditions: {
					...conditionInfo,
					onGuard: true,
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

	map.set('62', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '62';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let elements: (UnitElement | BuffConditionElement)[];
		let mitigation = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			mitigation = parseNumberOrDefault(params[6]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(7), 7, injectionContext);
		} else {
			elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`mitigate ${element} attacks`]);
			mitigation = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks'] as number);
		}

		let results: IBuff[] = [];
		if (mitigation !== 0) {
			results = elements.map((element) => ({
				id: `passive:62:mitigate-${element}`,
				originalId,
				sources,
				value: mitigation,
				conditions: { ...conditionInfo },
				...targetData,
			}));

			if (results.length === 0) {
				results.push({
					id: 'passive:62:mitigate-unknown',
					originalId,
					sources,
					value: mitigation,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('63', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '63';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let elements: (UnitElement | BuffConditionElement)[];
		let mitigation = 0, turnDuration = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			mitigation = parseNumberOrDefault(params[6]);
			turnDuration = parseNumberOrDefault(params[7]);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(8), 8, injectionContext);
		} else {
			elements = Object.values(ELEMENT_MAPPING).filter((element) => !!typedEffect[`mitigate ${element} attacks`]);
			mitigation = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks'] as number);
			turnDuration = parseNumberOrDefault(typedEffect['dmg% mitigation for elemental attacks buff for first x turns'] as number);
		}

		let results: IBuff[] = [];
		if (mitigation !== 0) {
			results = elements.map((element) => ({
				id: `passive:63:first turn mitigate-${element}`,
				originalId,
				sources,
				duration: turnDuration,
				value: mitigation,
				conditions: { ...conditionInfo },
				...targetData,
			}));

			if (results.length === 0) {
				results.push({
					id: 'passive:63:first turn mitigate-unknown',
					originalId,
					sources,
					duration: turnDuration,
					value: mitigation,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('64', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '64';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let bb = 0, sbb = 0, ubb = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawBb, rawSbb, rawUbb, ...extraParams] = splitEffectParams(typedEffect);
			bb = parseNumberOrDefault(rawBb);
			sbb = parseNumberOrDefault(rawSbb);
			ubb = parseNumberOrDefault(rawUbb);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			bb = parseNumberOrDefault(typedEffect['bb atk% buff'] as number);
			sbb = parseNumberOrDefault(typedEffect['sbb atk% buff'] as number);
			ubb = parseNumberOrDefault(typedEffect['ubb atk% buff'] as number);
		}

		const results: IBuff[] = [];
		if (bb !== 0) {
			results.push({
				id: 'passive:64:attack boost-bb',
				originalId,
				sources,
				conditions: { ...conditionInfo },
				value: bb,
				...targetData,
			});
		}

		if (sbb !== 0) {
			results.push({
				id: 'passive:64:attack boost-sbb',
				originalId,
				sources,
				conditions: { ...conditionInfo },
				value: sbb,
				...targetData,
			});
		}

		if (ubb !== 0) {
			results.push({
				id: 'passive:64:attack boost-ubb',
				originalId,
				sources,
				conditions: { ...conditionInfo },
				value: ubb,
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

	map.set('65', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '65',
			effectKeyLow: 'bc fill on crit min',
			effectKeyHigh: 'bc fill on crit max',
			effectKeyChance: 'bc fill on crit%',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			parseParamValue: (rawValue: string) => parseNumberOrDefault(rawValue) / 100,
			generateBaseConditions: () => ({ onCriticalHit: true }),
			buffId: 'passive:65:bc fill on crit',
		});
	});

	map.set('66', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '66';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let triggeredBuffs: IBuff[] = [];
		let triggerOnBb = false, triggerOnSbb = false, triggerOnUbb = false;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawProcIds, rawParams = '', rawTargetTypes = '', rawTargetAreas = '', rawStartFrames = '', rawTriggerOnBb, rawTriggerOnSbb, rawTriggerOnUbb, ...extraParams] = splitEffectParams(typedEffect);
			const allProcIds = rawProcIds.split('~');
			const allProcParams = rawParams.split('~');
			const allTargetTypes = rawTargetTypes.split('~');
			const allTargetAreas = rawTargetAreas.split('~');
			const allStartFrames = rawStartFrames.split('~');

			const FRAME_IN_MS = (16 + (2 / 3));
			allProcIds.forEach((procId, index) => {
				const params = (allProcParams[index] || '').replace(/&/g, ',');
				const targetType = allTargetTypes[index];
				const targetArea = allTargetAreas[index];
				const startFrame = parseNumberOrDefault(allStartFrames[index]);
				const effectDelayInMs = (startFrame * FRAME_IN_MS).toFixed(1);
				const procEffect: IProcEffect = {
					'proc id': procId,
					params,
					'effect delay time(ms)/frame': `${effectDelayInMs}/${startFrame}`,
					'target area': TARGET_AREA_MAPPING[targetArea] || targetArea || 'unknown target area',
					'target type': TARGET_TYPE_MAPPING[targetType] || targetType || 'unknown target type',
				};

				const procBuffs = convertProcEffectToBuffsWithInjectionContext(procEffect, context, injectionContext);
				triggeredBuffs = triggeredBuffs.concat(procBuffs);
			});

			triggerOnBb = rawTriggerOnBb === '1';
			triggerOnSbb = rawTriggerOnSbb === '1';
			triggerOnUbb = rawTriggerOnUbb === '1';

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 8, injectionContext);
		} else {
			const triggeredEffects = typedEffect['triggered effect'] as ProcEffect[];
			if (Array.isArray(triggeredEffects)) {
				triggeredEffects.forEach((procEffect) => {
					const procBuffs = convertProcEffectToBuffsWithInjectionContext(procEffect, context, injectionContext);
					triggeredBuffs = triggeredBuffs.concat(procBuffs);
				});
			}

			triggerOnBb = !!typedEffect['trigger on bb'];
			triggerOnSbb = !!typedEffect['trigger on sbb'];
			triggerOnUbb = !!typedEffect['trigger on ubb'];
		}

		const results: IBuff[] = [];
		if ((triggerOnBb || triggerOnSbb || triggerOnUbb) && triggeredBuffs.length > 0) {
			const addBuffOfBurstType = (burstType: string): void => {
				results.push({
					id: `passive:66:add effect to skill-${burstType}`,
					originalId,
					sources,
					value: triggeredBuffs,
					conditions: { ...conditionInfo },
					...targetData,
				});
			};
			if (triggerOnBb) {
				addBuffOfBurstType('bb');
			}
			if (triggerOnSbb) {
				addBuffOfBurstType('sbb');
			}
			if (triggerOnUbb) {
				addBuffOfBurstType('ubb');
			}
		}

		handlePostParse(results, unknownParams, {
			originalId,
			sources,
			targetData,
			conditionInfo,
		});

		return results;
	});

	map.set('69', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '69';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let recoveredHp = 0, maxCount = 0;
		let chanceLow = 0, chanceHigh = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawRecoveredHp, rawMaxCount, rawChanceLow, rawChanceHigh, ...extraParams] = splitEffectParams(typedEffect);
			recoveredHp = parseNumberOrDefault(rawRecoveredHp);
			maxCount = parseNumberOrDefault(rawMaxCount);
			chanceLow = parseNumberOrDefault(rawChanceLow);
			chanceHigh = parseNumberOrDefault(rawChanceHigh);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 4, injectionContext);
		} else {
			recoveredHp = parseNumberOrDefault(typedEffect['angel idol recover hp%'] as number);
			maxCount = parseNumberOrDefault(typedEffect['angel idol recover counts'] as number);
			chanceLow = parseNumberOrDefault(typedEffect['angel idol recover chance% low'] as number);
			chanceHigh = parseNumberOrDefault(typedEffect['angel idol recover chance% high'] as number);
		}

		const results: IBuff[] = [];
		if (chanceLow !== 0 || chanceHigh !== 0) {
			results.push({
				id: 'passive:69:chance ko resistance',
				originalId,
				sources,
				value: {
					'recoveredHp%': recoveredHp,
					maxCount,
					chanceLow,
					chanceHigh,
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

	map.set('70', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'od fill rate%',
			buffId: 'passive:70:od fill rate',
			originalId: '70',
		});
	});

	map.set('71', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '71';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const inflictionChances: { [ailment: string]: AlphaNumeric } = {
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
			[inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('counter inflict'));
			AILMENTS_ORDER.forEach((ailment) => {
				const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
				if (correspondingKey) {
					inflictionChances[ailment] = typedEffect[correspondingKey] as number;
				}
			});
		}

		const results: IBuff[] = [];
		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(inflictionChances[ailment]);
			if (value !== 0) {
				results.push({
					id: `passive:71:inflict on hit-${ailment}`,
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

	map.set('72', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '72';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);
		const [rawHpAtTurnStart, rawBcAtTurnStart, ...extraParams] = splitEffectWithUnknownPassiveParamsProperty(effect as IPassiveEffect);
		const hpAtTurnStart = rawHpAtTurnStart === '1';
		const bcAtTurnStart = rawBcAtTurnStart === '1';
		const unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);

		const results: IBuff[] = [];
		if (hpAtTurnStart) {
			results.push({
				id: 'passive:72:effect at turn start-hp',
				originalId,
				sources,
				value: true,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		if (bcAtTurnStart) {
			results.push({
				id: 'passive:72:effect at turn start-bc',
				originalId,
				sources,
				value: true,
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

	map.set('73', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '73';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis, Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
		const results: IBuff[] = [];
		const resistances: { [ailment: string]: AlphaNumeric } = {
			poison: '0',
			weak: '0',
			sick: '0',
			injury: '0',
			curse: '0',
			paralysis: '0',
			'atk down': '0',
			'def down': '0',
			'rec down': '0',
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, resistances['atk down'], resistances['def down'], resistances['rec down'], ...extraParams] = splitEffectParams(typedEffect);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 9, injectionContext);
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
					id: `passive:73:resist-${ailment}`,
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

	map.set('74', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '74';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let requiredAilments: Ailment[], attackBoost = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawRequiredAilments, rawBoost, ...extraParams] = splitEffectParams(typedEffect);
			requiredAilments = rawRequiredAilments.split('&')
				.filter((p) => p !== '0')
				.map((p) => AILMENT_MAPPING[p] || Ailment.Unknown);
			attackBoost = parseNumberOrDefault(rawBoost);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(typedEffect).filter((k) => ((typedEffect[k] as boolean) === true) && k.startsWith('atk% buff when enemy has'));
			requiredAilments = AILMENTS_ORDER.filter((ailment) => ailmentKeysInEffect.find((k) => k.includes(ailment)));
			attackBoost = parseNumberOrDefault(typedEffect['atk% buff when enemy has ailment']);
		}

		const results: IBuff[] = [];
		if (attackBoost !== 0) {
			results.push({
				id: 'passive:74:ailment attack boost',
				originalId,
				sources,
				value: attackBoost,
				conditions: {
					...conditionInfo,
					targetHasAnyOfGivenAilments: requiredAilments,
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

	map.set('75', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '75';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let damageIncrease = 0, chance = 0;
		let turnDuration = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawDamageIncrease, rawChance, rawTurnDuration, ...extraParams] = splitEffectParams(typedEffect);
			damageIncrease = parseNumberOrDefault(rawDamageIncrease);
			chance = parseNumberOrDefault(rawChance);
			turnDuration = parseNumberOrDefault(rawTurnDuration);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 3, injectionContext);
		} else {
			damageIncrease = parseNumberOrDefault(typedEffect['spark debuff%'] as number);
			chance = parseNumberOrDefault(typedEffect['spark debuff chance%'] as number);
			turnDuration = parseNumberOrDefault(typedEffect['spark debuff turns'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'passive:75:spark vulnerability',
				originalId,
				sources,
				duration: turnDuration,
				value: { 'sparkDamage%': damageIncrease, chance },
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

	map.set('77', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '77';
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
			baseResist = parseNumberOrDefault(typedEffect['base spark dmg% resist'] as number);
			buffResist = parseNumberOrDefault(typedEffect['buff spark dmg% resist'] as number);
		}

		const results: IBuff[] = [];
		if (baseResist !== 0) {
			results.push({
				id: 'passive:77:spark damage reduction-base',
				originalId,
				sources,
				value: baseResist,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		if (buffResist !== 0) {
			results.push({
				id: 'passive:77:spark damage reduction-buff',
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

	map.set('78', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '78',
			buffId: 'passive:78:damage taken conditional',
			thresholdType: ThresholdType.DamageTaken,
		});
	});

	map.set('79', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalBcFillWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '79',
			thresholdType: ThresholdType.DamageTaken,
			flatFillBuffId: 'passive:79:bc fill after damage taken conditional-flat',
			percentFillBuffId: 'passive:79:bc fill after damage taken conditional-percent',
			flatFillEffectKey: 'increase bb gauge',
		});
	});

	map.set('80', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '80',
			buffId: 'passive:80:damage dealt conditional',
			thresholdType: ThresholdType.DamageDealt,
		});
	});

	map.set('81', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalBcFillWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '81',
			thresholdType: ThresholdType.DamageDealt,
			flatFillBuffId: 'passive:81:bc fill after damage dealt conditional-flat',
			percentFillBuffId: 'passive:81:bc fill after damage dealt conditional-percent',
			flatFillEffectKey: 'increase bb gauge',
		});
	});

	map.set('82', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '82',
			buffId: 'passive:82:bc received conditional',
			thresholdType: ThresholdType.BcReceived,
		});
	});

	map.set('83', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalBcFillWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '83',
			thresholdType: ThresholdType.BcReceived,
			flatFillBuffId: 'passive:83:bc fill after bc received conditional-flat',
			percentFillBuffId: 'passive:83:bc fill after bc received conditional-percent',
			flatFillEffectKey: 'increase bb gauge',
		});
	});

	map.set('84', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '84',
			buffId: 'passive:84:hc received conditional',
			thresholdType: ThresholdType.HcReceived,
		});
	});

	map.set('85', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalBcFillWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '85',
			thresholdType: ThresholdType.HcReceived,
			flatFillBuffId: 'passive:85:bc fill after hc received conditional-flat',
			percentFillBuffId: 'passive:85:bc fill after hc received conditional-percent',
			flatFillEffectKey: 'increase bb gauge',
		});
	});

	map.set('86', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '86',
			buffId: 'passive:86:spark count conditional',
			thresholdType: ThresholdType.SparkCount,
		});
	});

	map.set('87', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalBcFillWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '87',
			thresholdType: ThresholdType.SparkCount,
			flatFillBuffId: 'passive:87:bc fill after spark count conditional-flat',
			percentFillBuffId: 'passive:87:bc fill after spark count conditional-percent',
			flatFillEffectKey: 'increase bb gauge',
		});
	});

	map.set('88', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '88',
			buffId: 'passive:88:on guard conditional',
			thresholdType: ThresholdType.ChanceGuard,
		});
	});

	map.set('89', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parseConditionalPassiveWithSingleNumericalCondition({
			effect,
			context,
			injectionContext,
			originalId: '89',
			buffId: 'passive:89:on critical hit conditional',
			thresholdType: ThresholdType.ChanceCrit,
		});
	});

	map.set('90', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '90';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const inflictionChances: { [ailment: string]: AlphaNumeric } = {
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
			[inflictionChances.poison, inflictionChances.weak, inflictionChances.sick, inflictionChances.injury, inflictionChances.curse, inflictionChances.paralysis, ...extraParams] = splitEffectParams(typedEffect);
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			const ailmentKeysInEffect = Object.keys(effect).filter((k) => k.startsWith('inflict'));
			AILMENTS_ORDER.forEach((ailment) => {
				const correspondingKey = ailmentKeysInEffect.find((k) => k.includes(ailment));
				if (correspondingKey) {
					inflictionChances[ailment] = typedEffect[correspondingKey] as number;
				}
			});
		}

		const results: IBuff[] = [];
		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(inflictionChances[ailment]);
			if (value !== 0) {
				results.push({
					id: `passive:90:inflict on crit-${ailment}`,
					originalId,
					sources,
					value,
					conditions: {
						...conditionInfo,
						onCriticalHit: true,
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

	map.set('91', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '91';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let value = 0, turnDuration = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [firstUnknownValue, rawValue, rawTurnDuration, ...extraParams] = splitEffectParams(typedEffect);
			value = parseNumberOrDefault(rawValue);
			turnDuration = parseNumberOrDefault(rawTurnDuration);
			unknownParams = createUnknownParamsEntryFromExtraParams([firstUnknownValue, '0', '0'].concat(extraParams), 0, injectionContext);
		}

		let results: IBuff[] = [];
		if (value !== 0) {
			results.push({
				id: 'passive:91:first turn spark',
				originalId,
				sources,
				duration: turnDuration,
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

	map.set('92', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'ignore def resist chance%',
			buffId: 'passive:92:negate defense ignore',
			originalId: '92',
		});
	});

	map.set('93', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '93';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let elements: (UnitElement | BuffConditionElement)[] = [];
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			// is last parameter turn duration, where -1 is lasting indefinitely?
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);
		}

		const results: IBuff[] = elements.map((element) => ({
			id: `passive:93:add element-${element}`,
			originalId,
			sources,
			value: true,
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

	map.set('96', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '96';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let damageIncrease = 0, chance = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawDamageIncrease, rawChance, ...extraParams] = splitEffectParams(typedEffect);
			damageIncrease = parseNumberOrDefault(rawDamageIncrease);
			chance = parseNumberOrDefault(rawChance);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			damageIncrease = parseNumberOrDefault(typedEffect['aoe atk inc%'] as number);
			chance = parseNumberOrDefault(typedEffect['chance to aoe'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'passive:96:aoe normal attack',
				originalId,
				sources,
				value: { 'damageModifier%': damageIncrease, chance },
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

	map.set('97', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithSingleNumericalParameter({
			effect,
			context,
			injectionContext,
			effectKey: 'xp gained increase%',
			buffId: 'passive:97:player exp boost',
			originalId: '97',
		});
	});

	map.set('100', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '100';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let sparkDamage = 0, chance = 0;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawChance, rawSparkDamage, ...extraParams] = splitEffectParams(typedEffect);
			chance = parseNumberOrDefault(rawChance);
			sparkDamage = parseNumberOrDefault(rawSparkDamage);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 2, injectionContext);
		} else {
			chance = parseNumberOrDefault(typedEffect['spark crit chance%'] as number);
			sparkDamage = parseNumberOrDefault(typedEffect['spark crit dmg%'] as number);
		}

		const results: IBuff[] = [];
		if (chance !== 0) {
			results.push({
				id: 'passive:100:spark critical',
				originalId,
				sources,
				value: { 'sparkDamage%': sparkDamage, chance },
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

	map.set('101', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		return parsePassiveWithNumericalValueRangeAndChance({
			effect,
			context,
			injectionContext,
			originalId: '101',
			effectKeyLow: 'heal on spark low',
			effectKeyHigh: 'heal on spark high',
			effectKeyChance: 'heal on spark%',
			buffKeyLow: 'healLow',
			buffKeyHigh: 'healHigh',
			buffId: 'passive:101:heal on spark',
		});
	});

	map.set('102', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '102';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		let elements: (UnitElement | BuffConditionElement)[] = [];
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const params = splitEffectParams(typedEffect);
			elements = params.filter((value, index) => value !== '0' && index < 6)
				.map((e) => ELEMENT_MAPPING[e] || BuffConditionElement.Unknown);
			unknownParams = createUnknownParamsEntryFromExtraParams(params.slice(6), 6, injectionContext);
		}

		const results: IBuff[] = elements.map((element) => ({
			id: `passive:102:add element-${element}`,
			originalId,
			sources,
			value: true,
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

	map.set('103', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const originalId = '103';
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const boosts = {
			bb: '0' as AlphaNumeric,
			sbb: '0' as AlphaNumeric,
			ubb: '0' as AlphaNumeric,
		};
		const BOOST_ORDER = ['bb', 'sbb', 'ubb'];
		let thresholdInfo: IThresholdActivationInfo;

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawRequireAboveFlag: string;
			let rawThreshold: string;
			[boosts.bb, boosts.sbb, boosts.ubb, rawThreshold, rawRequireAboveFlag, ...extraParams] = splitEffectParams(typedEffect);
			thresholdInfo = parseThresholdValuesFromParamsProperty(rawThreshold, rawRequireAboveFlag, ThresholdType.Hp);

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 5, injectionContext);
		} else {
			boosts.bb = (typedEffect['bb atk% add'] as string);
			boosts.sbb = (typedEffect['sbb atk% add'] as string);
			boosts.ubb = (typedEffect['ubb atk% add'] as string);

			// not using existing effect threshold parsing functions because this is
			// is parsed differently for some reason
			thresholdInfo = {
				threshold: parseNumberOrDefault(typedEffect['hp threshold'] as number),
				requireAbove: (typedEffect['triggered when hp'] as string) === 'higher',
				type: ThresholdType.Hp,
			};
		}

		const thresholdConditions = getThresholdConditions(thresholdInfo);
		BOOST_ORDER.forEach((boost) => {
			const value = parseNumberOrDefault(boosts[boost as 'bb' | 'sbb' | 'ubb']);
			if (value !== 0) {
				const entry: IBuff = {
					id: `passive:103:hp conditional attack boost-${boost}`,
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
}
