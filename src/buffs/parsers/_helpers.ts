import {
	IEffectToBuffConversionContext,
	IBuffConditions,
	BuffSource,
} from './buff-types';
import {
	ExtraSkillPassiveEffect,
	SphereTypeId,
	PassiveEffect,
	SpEnhancementEffect,
	SpPassiveType,
	TargetType,
	TargetArea,
} from '../../datamine-types';

/**
 * @description Helper function for creating an entry to be used in the `sources`
 * property of {@link IBuff}.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns Entry in the format of `<BuffSource>-<ID of Buff Source>`.
 */
export function createSourceEntryFromContext (context: IEffectToBuffConversionContext): string {
	return `${context.source}-${context.sourceId}`;
}

/**
 * @description Helper function for creating an entries array to be used in the `sources`
 * property of {@link IBuff}. It handles setting the order of the sources.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns List of entries in the format of `<BuffSource>-<ID of Buff Source>`.
 */
export function createSourcesFromContext (context: IEffectToBuffConversionContext): string[] {
	const resultArray = Array.isArray(context.previousSources)
		? context.previousSources.slice()
		: [];

	// Ensure that the current source is at the beginning of the array
	resultArray.unshift(createSourceEntryFromContext(context));
	return resultArray;
}

/**
 * @description Given the conditions in an extra skill effect, normalize them into
 * a simpler object containing the IDs of each condition type.
 * @param effect Extra skill effect to process conditions from.
 * @returns Conditions based on type, otherwise `undefined` if no conditions are found.
 */
export function processExtraSkillConditions (effect: ExtraSkillPassiveEffect): IBuffConditions | undefined {
	if (!effect || !Array.isArray(effect.conditions) || effect.conditions.length === 0) {
		return;
	}
	const units = new Set<string>();
	const items = new Set<string>();
	const sphereType = new Set<SphereTypeId>();
	const unknown = new Set<string>();
	effect.conditions.forEach((condition) => {
		if ('sphere category required (raw)' in condition) {
			sphereType.add(condition['sphere category required (raw)']);
		} else if ('item required' in condition) {
			condition['item required'].forEach((item) => {
				items.add(item);
			});
		} else if ('unit required' in condition) {
			condition['unit required'].forEach((unit) => {
				units.add(`${unit.id}`);
			});
		} else {
			unknown.add(`type:${condition.type_id || ''},condition:${condition.condition_id || ''}`);
		}
	});

	return {
		units: Array.from(units),
		items: Array.from(items),
		sphereTypes: Array.from(sphereType),
		unknown: Array.from(unknown),
	};
}

/**
 * @description Extract the target type and target area of a given passive effect.
 * @param effect Passive effect to extract target data from.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns The target data for the given effect and context. There are only two possible values:
 * party (`targetType` is party and `targetArea` is aoe ) and single (`targetType` is self and `targetArea` is single)
 */
export function getPassiveTargetData (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext) : { targetArea: TargetArea, targetType: TargetType} {
	const isLeaderSkillEffect = context.source === BuffSource.LeaderSkill ||
		((effect as SpEnhancementEffect).sp_type === SpPassiveType.EnhancePassive);

	const isPartyEffect = isLeaderSkillEffect || (effect as ExtraSkillPassiveEffect)['passive target'] === TargetType.Party;

	return {
		targetType: isPartyEffect ? TargetType.Party : TargetType.Self,
		targetArea: isPartyEffect ? TargetArea.Aoe : TargetArea.Single,
	};
}
