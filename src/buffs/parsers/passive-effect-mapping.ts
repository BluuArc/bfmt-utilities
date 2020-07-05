import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect } from '../../datamine-types';
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

		Object.keys(stats).forEach((stat) => {
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
}
