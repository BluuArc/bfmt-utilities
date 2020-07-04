import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect, SpEnhancementEffect } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, IBuffProcessingInjectionContext, IBuffConditions } from './buff-types';
import { createSourcesFromContext, processExtraSkillConditions, getPassiveTargetData, ITargetInfo } from './_helpers';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns Converted buff(s) from the given passive effect.
 */
export type PassiveEffectToBuffFunction = (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IBuffProcessingInjectionContext) => IBuff[];

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
 * @description Apply the mapping of passive effect IDs to conversion functions to the
 * given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping (map: Map<string, PassiveEffectToBuffFunction>): void {
	map.set('1', (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext, injectionContext?: IBuffProcessingInjectionContext): IBuff[] => {
		const conditionInfo: IBuffConditions | undefined = ((injectionContext && injectionContext.processExtraSkillConditions) || processExtraSkillConditions)(effect as ExtraSkillPassiveEffect);
		const targetData: ITargetInfo = ((injectionContext && injectionContext.getPassiveTargetData) || getPassiveTargetData)(effect, context);
		const sources: string[] = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats: { [stat: string]: string | number } = {
			hp: '0',
			atk: '0',
			def: '0',
			rec: '0',
			crit: '0',
		};
		if (typedEffect.params) {
			[stats.atk, stats.def, stats.rec, stats.crit, stats.hp] = typedEffect.params.split(',');
		} else {
			stats.hp = (typedEffect['hp% buff'] as number);
			stats.atk = (typedEffect['atk% buff'] as number);
			stats.def = (typedEffect['def% buff'] as number);
			stats.rec = (typedEffect['rec% buff'] as number);
			stats.crit = (typedEffect['crit% buff'] as number);
		}

		Object.keys(stats).forEach((stat) => {
			const value = stats[stat];
			if (value && +value) {
				results.push({
					id: `passive:1:${stat}`,
					originalId: '1',
					sources,
					value: +value,
					conditions: conditionInfo,
					...targetData,
				});
			}
		});

		return results;
	});
}
