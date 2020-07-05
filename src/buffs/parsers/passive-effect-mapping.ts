import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect, UnitElement } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, IGenericBuffValue, BuffId } from './buff-types';
import { createSourcesFromContext, processExtraSkillConditions, getPassiveTargetData, IPassiveBuffProcessingInjectionContext, createUnknownParamsValue } from './_helpers';

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
	const ELEMENT_MAPPING: { [key: string]: UnitElement | string } = {
		1: UnitElement.Fire,
		2: UnitElement.Water,
		3: UnitElement.Earth,
		4: UnitElement.Thunder,
		5: UnitElement.Light,
		6: UnitElement.Dark,
		X: 'omniParadigm',
	};

	const STATS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];

	map.set('1', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let stats = {
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
			if (extraParams && extraParams.length > 0) {
				unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, 5);
			}
		} else {
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		STATS_ORDER.forEach((stat) => {
			const value = stats[stat as 'atk' | 'def' | 'rec' | 'crit' | 'hp'];
			if (value && +value) {
				results.push({
					id: `passive:1:${stat}`,
					originalId: '1',
					sources,
					value: +value,
					conditions: { ...conditionInfo },
					...targetData,
				});
			}
		});

		if (unknownParams && Object.keys(unknownParams).length > 0) {
			results.push({
				id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
				originalId: '1',
				sources,
				value: unknownParams,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		return results;
	});

	map.set('2', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IPassiveBuffProcessingInjectionContext): IBuff[] => {
		const conditionInfo = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		let stats = {
			elements: [] as (UnitElement | string)[],
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
					stats.elements.push(ELEMENT_MAPPING[elementValue] || 'unknown');
				}
			});

			if (extraParams && extraParams.length > 0) {
				unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, 7);
			}
		} else {
			stats.elements = (typedEffect['elements buffed'] as UnitElement[]);
			stats.hp = (typedEffect['hp% buff'] as string);
			stats.atk = (typedEffect['atk% buff'] as string);
			stats.def = (typedEffect['def% buff'] as string);
			stats.rec = (typedEffect['rec% buff'] as string);
			stats.crit = (typedEffect['crit% buff'] as string);
		}

		if (stats.elements.length > 0) {
			stats.elements.forEach((element) => {
				const elementKey = element !== 'omniParadigm'
					? element
					: 'element';
				STATS_ORDER.forEach((stat) => {
					const value = stats[stat as 'atk' | 'def' | 'rec' | 'crit' | 'hp'];
					if (value && +value) {
						results.push({
							id: `passive:2:${elementKey},${stat}`,
							originalId: '2',
							sources,
							value: +value,
							conditions: { ...conditionInfo },
							...targetData,
						});
					}
				});
			});
		} else {
			STATS_ORDER.forEach((stat) => {
				const value = stats[stat as 'atk' | 'def' | 'rec' | 'crit' | 'hp'];
				if (value && +value) {
					results.push({
						id: `passive:2:unknown,${stat}`,
						originalId: '2',
						sources,
						value: +value,
						conditions: { ...conditionInfo },
						...targetData,
					});
				}
			});
		}

		if (unknownParams && Object.keys(unknownParams).length > 0) {
			results.push({
				id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
				originalId: '2',
				sources,
				value: unknownParams,
				conditions: { ...conditionInfo },
				...targetData,
			});
		}

		return results;
	});
}
