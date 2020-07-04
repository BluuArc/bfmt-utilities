import { ProcEffect } from '../../datamine-types';
import { IBuff, IEffectToBuffConversionContext } from './buff-types';
import { IProcBuffProcessingInjectionContext, getProcTargetData, createSourcesFromContext } from './_helpers';

/**
 * @description Default function for all buffs that cannot be processed.
 * @param effect Effect to convert to `IBuff` format.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns Converted buff(s) from the given proc effect.
 */
export type ProcEffectToBuffFunction = (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext) => IBuff[];

let mapping: Map<string, ProcEffectToBuffFunction>;

/**
 * @description Retrieve the proc-to-buff conversion function mapping for the library. Internally, this is a
 * lazy-loaded singleton to not impact first-load performance.
 * @param reload Optionally re-create the mapping.
 * @returns Mapping of proc IDs to functions.
 */
export function getProcEffectToBuffMapping (reload?: boolean): Map<string, ProcEffectToBuffFunction> {
	if (!mapping || reload) {
		mapping = new Map<string, ProcEffectToBuffFunction>();
		setMapping(mapping);
	}

	return mapping;
}

/**
 * @description Apply the mapping of proc effect IDs to conversion functions to the given Map object.
 * @param map Map to add conversion mapping onto.
 * @returns Does not return anything.
 * @internal
 */
function setMapping (map: Map<string, ProcEffectToBuffFunction>): void {
	map.set('1', (effect: ProcEffect, context: IEffectToBuffConversionContext, injectionContext?: IProcBuffProcessingInjectionContext): IBuff[] => {
		const targetData = ((injectionContext && injectionContext.getProcTargetData) || getProcTargetData)(effect);
		const sources = ((injectionContext && injectionContext.createSourcesFromContext) || createSourcesFromContext)(context);

		const hits = +((context.damageFrames && context.damageFrames.hits) || 0);
		const distribution = +((context.damageFrames && context.damageFrames['hit dmg% distribution (total)']) || 0);
		const params : { [param: string]: string | number } = {
			'atk%': '0',
			flatAtk: '0',
			'crit%': '0',
			'bc%': '0',
			'hc%': '0',
			'dmg%': '0',
		};

		if (effect.params) {
			[params['atk%'], params.flatAtk, params['crit%'], params['bc%'], params['hc%'], params['dmg%']] = effect.params.split(',');
		} else {
			params['atk%'] = (effect['bb atk%'] as number);
			params.flatAtk = (effect['bb flat atk'] as number);
			params['crit%'] = (effect['bb crit%'] as number);
			params['bc%'] = (effect['bb bc%'] as number);
			params['hc%'] = (effect['bb hc%'] as number);
			params['dmg%'] = (effect['bb dmg%'] as number);
		}

		const filteredValue = Object.entries(params)
			.filter(([,value]) => value && +value)
			.reduce((acc: { [param: string]: number }, [key, value]) => {
				acc[key] = +value;
				return acc;
			}, {});

		return [{
			id: 'proc:1',
			originalId: '1',
			sources,
			value: {
				...filteredValue,
				hits,
				distribution,
			},
			...targetData,
		}]
	});
}
