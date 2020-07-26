import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect, UnitElement, UnitType } from '../../datamine-types';
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

	type CoreStat = 'hp' | 'atk' | 'def' | 'rec' | 'crit';
	type StatusAilment = 'poison' | 'weak' | 'sick' | 'injury' | 'curse' | 'paralysis';

	const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
	const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];

	const retrieveCommonInfoForEffects = (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext) => {
		const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		return { conditionInfo, targetData, sources };
	};

	interface IUnknownParamsContext {
		originalId: string;
		sources: string[];
		targetData: ITargetData;
		conditionInfo: IBuffConditions;
	}

	const createaUnknownParamsEntry = (
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

	const createUnknownParamsEntryFromExtraParams = (extraParams: string[], startIndex: number, injectionContext?: IPassiveBuffProcessingInjectionContext): IGenericBuffValue | undefined => {
		let unknownParams: IGenericBuffValue | undefined;
		if (extraParams && extraParams.length > 0) {
			unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
		}
		return unknownParams;
	};

	interface IPassiveWithSingleNumericalParameterContext {
		effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect;
		context: IEffectToBuffConversionContext;
		injectionContext?: IPassiveBuffProcessingInjectionContext;
		effectKey: string;
		buffId: string;
		originalId: string;
	}
	const parsePassiveWithSingleNumericalParameter = ({
		effect,
		context,
		injectionContext,
		effectKey,
		buffId,
		originalId,
	}: IPassiveWithSingleNumericalParameterContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let value = 0;
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			const [rawValue, ...extraParams] = typedEffect.params.split(',');
			value = parseNumberOrDefault(rawValue);
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

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId,
				sources,
				targetData,
				conditionInfo,
			}));
		}

		return results;
	};

	map.set('1', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			atk: '0' as string | number,
			def: '0' as string | number,
			rec: '0' as string | number,
			crit: '0' as string | number,
			hp: '0' as string | number,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');

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
					originalId: '1',
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId: '1',
				sources,
				targetData,
				conditionInfo,
			}));
		}

		return results;
	});

	map.set('2', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			elements: [] as (UnitElement | BuffConditionElement)[],
			atk: '0' as string | number,
			def: '0' as string | number,
			rec: '0' as string | number,
			crit: '0' as string | number,
			hp: '0' as string | number,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let element1: string, element2: string;
			[element1, element2, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');

			[element1, element2].forEach((elementValue) => {
				if (elementValue && elementValue !== '0') {
					stats.elements.push(ELEMENT_MAPPING[elementValue] || BuffConditionElement.Unknown);
				}
			});

			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 7, injectionContext);
		} else {
			stats.elements = (typedEffect['elements buffed'] as UnitElement[]);
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		const createBaseStatObject = (stat: CoreStat) => ({
			id: `passive:2:${stat}`,
			originalId: '2',
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

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId: '2',
				sources,
				targetData,
				conditionInfo,
			}));
		}

		return results;
	});

	map.set('3', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats = {
			unitType: '' as UnitType | 'unknown',
			atk: '0' as string | number,
			def: '0' as string | number,
			rec: '0' as string | number,
			crit: '0' as string | number,
			hp: '0' as string | number,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let unitType: string;
			[unitType, stats.atk, stats.def, stats.rec, stats.crit, stats.hp, ...extraParams] = typedEffect.params.split(',');

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
					originalId: '3',
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

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId: '3',
				sources,
				targetData,
				conditionInfo,
			}));
		}

		return results;
	});

	map.set('4', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const resistances = {
			poison: '0' as string | number,
			weak: '0' as string | number,
			sick: '0' as string | number,
			injury: '0' as string | number,
			curse: '0' as string | number,
			paralysis: '0' as string | number,
		};

		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			[resistances.poison, resistances.weak, resistances.sick, resistances.injury, resistances.curse, resistances.paralysis, ...extraParams] = typedEffect.params.split(',');
			unknownParams = createUnknownParamsEntryFromExtraParams(extraParams, 6, injectionContext);
		} else {
			AILMENTS_ORDER.forEach((ailment) => {
				const effectKey = ailment !== 'weak' ? ailment : 'weaken';
				resistances[ailment as StatusAilment] = (typedEffect[`${effectKey} resist%`] as string);
			});
		}

		AILMENTS_ORDER.forEach((ailment) => {
			const value = parseNumberOrDefault(resistances[ailment as StatusAilment]);
			if (value !== 0) {
				results.push({
					id: `passive:4:${ailment}`,
					originalId: '4',
					sources,
					value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId: '4',
				sources,
				targetData,
				conditionInfo,
			}));
		}

		return results;
	});

	map.set('5', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const { conditionInfo, targetData, sources } = retrieveCommonInfoForEffects(effect, context, injectionContext);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let element: UnitElement | BuffConditionElement;
		let mitigation: string | number = '0';
		let unknownParams: IGenericBuffValue | undefined;
		if (typedEffect.params) {
			let extraParams: string[];
			let rawElement: string;
			[rawElement, mitigation, ...extraParams] = typedEffect.params.split(',');

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
				originalId: '5',
				sources,
				value,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		if (unknownParams) {
			results.push(createaUnknownParamsEntry(unknownParams, {
				originalId: '5',
				sources,
				targetData,
				conditionInfo,
			}));
		}

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
}
