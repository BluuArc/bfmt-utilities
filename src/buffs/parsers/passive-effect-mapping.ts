import { PassiveEffect, IPassiveEffect, ExtraSkillPassiveEffect } from '../../datamine-types';
import { IEffectToBuffConversionContext, IBuff, BuffStackType } from './buff-types';
import { createSourcesFromContext } from './_helpers';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Converted buff(s) from the given passive effect.
 */
export type PassiveEffectToBuffFunction = (effect: PassiveEffect | ExtraSkillPassiveEffect, context: IEffectToBuffConversionContext) => IBuff[];

let mapping: Map<string, PassiveEffectToBuffFunction>;

export function getPassiveEffectToBuffMapping (reload?: boolean): Map<string, PassiveEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, PassiveEffectToBuffFunction>();
		setMapping(mapping);
	}

	return mapping;
}

function setMapping (map: Map<string, PassiveEffectToBuffFunction>): void {
	map.set('1', (effect: PassiveEffect | ExtraSkillPassiveEffect, context: IEffectToBuffConversionContext): IBuff[] => {
		// TODO: conditions
		const conditionInfo = {};
		// TODO: target
		const targetInfo = {};
		const sources = createSourcesFromContext(context);

		const typedEffect = (effect as IPassiveEffect);
		const results: IBuff[] = [];
		const stats: { [stat: string]: string } = {
			hp: '0',
			atk: '0',
			def: '0',
			rec: '0',
			crit: '0',
		};
		if (typedEffect.params) {
			[stats.atk, stats.def, stats.rec, stats.crit, stats.hp] = typedEffect.params.split(',');
		} else {
			stats.hp = typedEffect['hp% buff'];
			stats.atk = typedEffect['atk% buff'];
			stats.def = typedEffect['def% buff'];
			stats.rec = typedEffect['rec% buff'];
			stats.crit = typedEffect['crit% buff'];
		}

		Object.keys(stats).forEach((stat) => {
			const value = stats[stat];
			if (value && +value) {
				results.push({
					id: `passive:1:${stat}`,
					originalId: '1',
					stackType: BuffStackType.Passive,
					sources,
					value: +value,
					...targetInfo,
					...conditionInfo,
				});
			}
		});
		return results;
	});
}
