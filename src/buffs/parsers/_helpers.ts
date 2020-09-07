import {
	IEffectToBuffConversionContext,
	IBuffConditions,
	BuffSource,
	IGenericBuffValue,
	BuffId,
	IBuff,
	IConditionalEffect,
} from './buff-types';
import {
	ExtraSkillPassiveEffect,
	SphereTypeId,
	PassiveEffect,
	SpEnhancementEffect,
	SpPassiveType,
	TargetType,
	TargetArea,
	ProcEffect,
} from '../../datamine-types';

/**
 * @description Object whose main use is for injecting methods in testing.
 * @internal
 */
export interface IBaseBuffProcessingInjectionContext {
	createSourcesFromContext?: (context: IEffectToBuffConversionContext) => string[];
	createUnknownParamsValue?: (params: string[], startIndex?: number) => IGenericBuffValue;
}

/**
 * @description Object whose main use is for injecting methods in testing.
 * @internal
 */
export interface IPassiveBuffProcessingInjectionContext extends IBaseBuffProcessingInjectionContext {
	processExtraSkillConditions?: (effect: ExtraSkillPassiveEffect) => IBuffConditions;
	getPassiveTargetData?: (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect) => ITargetData;
	convertConditionalEffectToBuffs?: (effect: IConditionalEffect, context: IEffectToBuffConversionContext) => IBuff[];
}

/**
 * @description Object whose main use is for injecting methods in testing.
 * @internal
 */
export interface IProcBuffProcessingInjectionContext extends IBaseBuffProcessingInjectionContext {
	getProcTargetData?: (effect: ProcEffect) => ITargetData;
	buffSourceIsBurstType?: (source: BuffSource) => boolean;
}

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
 * @returns Conditions based on type, otherwise an empty object if no conditions are found.
 */
export function processExtraSkillConditions (effect: ExtraSkillPassiveEffect): IBuffConditions {
	const conditions = (effect && Array.isArray(effect.conditions) && effect.conditions) || [];

	const aggregate = {
		units: new Set<string>(),
		items: new Set<string>(),
		sphereTypes: new Set<SphereTypeId>(),
		unknowns: new Set<string>(),
	};
	conditions.forEach((condition, index) => {
		if ('sphere category required (raw)' in condition) {
			aggregate.sphereTypes.add(condition['sphere category required (raw)']);
		} else if ('item required' in condition) {
			condition['item required'].forEach((item) => {
				aggregate.items.add(item);
			});
		} else if ('unit required' in condition) {
			condition['unit required'].forEach((unit) => {
				aggregate.units.add(`${unit.id}`);
			});
		} else {
			aggregate.unknowns.add(`type:${condition.type_id || index},condition:${condition.condition_id || index}`);
		}
	});

	// filter out properties that have no entries
	const result: IBuffConditions = Object.entries(aggregate)
		.filter((entry) => (entry[1] as Set<any>).size > 0)
		.reduce((acc: IBuffConditions, entry) => {
			acc[(entry[0] as 'units' | 'items' | 'sphereTypes' | 'unknowns')] = Array.from(entry[1] as Set<any>);
			return acc;
		}, {});

	return result;
}

export interface ITargetData {
	targetArea: TargetArea,
	targetType: TargetType,
}

/**
 * @description Extract the target type and target area of a given passive effect.
 * @param effect Passive effect to extract target data from.
 * @param context Aggregate object to encapsulate information not in the effect used in the conversion process.
 * @returns The target data for the given effect and context. There are only two possible values:
 * party (`targetType` is party and `targetArea` is aoe ) and single (`targetType` is self and `targetArea` is single)
 */
export function getPassiveTargetData (effect: PassiveEffect | ExtraSkillPassiveEffect | SpEnhancementEffect, context: IEffectToBuffConversionContext) : ITargetData {
	const isLeaderSkillEffect = context.source === BuffSource.LeaderSkill ||
		((effect as SpEnhancementEffect).sp_type === SpPassiveType.EnhancePassive);

	const isPartyEffect = isLeaderSkillEffect || (effect as ExtraSkillPassiveEffect)['passive target'] === TargetType.Party;

	return {
		targetType: isPartyEffect ? TargetType.Party : TargetType.Self,
		targetArea: isPartyEffect ? TargetArea.Aoe : TargetArea.Single,
	};
}

/**
 * @description Extract the target type and target area of a given proc effect.
 * @param effect Proc effect to extract target data from.
 * @returns The target data for the given effect and context.
 */
export function getProcTargetData (effect: ProcEffect): ITargetData {
	return {
		targetArea: effect['target area'],
		targetType: effect['target type'],
	};
}

/**
 * @description Try to parse the given value into a number or return a value if it is not a number.
 * @param value Value to parse into a number.
 * @param defaultValue Value to return if `value` is not a number; defaults to 0.
 * @returns Parsed value as a number or the `defaultValue` if the value is not a number.
 */
export function parseNumberOrDefault (value: string | number | undefined, defaultValue = 0): number {
	return (value !== null && !isNaN(value as number)) ? +(value as number) : defaultValue;
}

/**
 * @description Create an object denoting values that cannot be processed yet. To be used
 * in the `value` property of `IBuff` as needed.
 * @param params Array of values that cannot be processed yet.
 * @param startIndex The first index before which we know how to process an effect's values.
 * @returns Dictionary object where every parameter is keyed by its index in the format of `param_${startIndex + indexInParams}`
 */
export function createUnknownParamsValue (params: string[] = [], startIndex = 0): IGenericBuffValue | undefined {
	let hasValue = false;
	const result = params
		.reduce((acc, value, index) => {
			if (value && value !== '0') {
				acc[`param_${startIndex + index}`] = value;
				hasValue = true;
			}
			return acc;
		}, {} as IGenericBuffValue);
	return hasValue ? result : (void 0);
}

/**
 * @description Decide whether a given source value is one of the burst types in {@link BuffSource}.
 * @param source Source value to check.
 * @returns Whether the given source value is a burst type. Returns true when the source is determined to
 * be any one of the following: brave burst, super brave burst, ultimate brave burst, bonded brave burst,
 * bonded super brave burst, or bonded dual brave burst.
 */
export function buffSourceIsBurstType (source: BuffSource): boolean {
	return !!source && [
		BuffSource.BraveBurst, BuffSource.SuperBraveBurst, BuffSource.UltimateBraveBurst,
		BuffSource.BondedBraveBurst, BuffSource.BondedSuperBraveBurst, BuffSource.DualBraveBurst,
	].includes(source);
}

/**
 * @description Given an array of parameters, conditionally creata an unknown params value entry.
 * @param extraParams Array of string parameters from an effect.
 * @param startIndex Index to use when generating entries for the unknown params value entry.
 * @param injectionContext Object whose main use is for injecting methods in testing.
 * @returns An unknown params entry if there are extra parameters, undefined otherwise.
 */
export function createUnknownParamsEntryFromExtraParams (extraParams: string[], startIndex: number, injectionContext?: { createUnknownParamsValue?: (params: string[], startIndex?: number) => IGenericBuffValue }): IGenericBuffValue | undefined {
	let unknownParams: IGenericBuffValue | undefined;
	if (extraParams && extraParams.length > 0) {
		unknownParams = ((injectionContext && injectionContext.createUnknownParamsValue) || createUnknownParamsValue)(extraParams, startIndex);
	}
	return unknownParams;
}

/**
 * @description Helper function for creating a `NO_PARAMS_SPECIFIED` entry from a given context.
 * @param context An effect processing context containing information created while parsing an effect.
 * @returns A single buff denoting a `NO_PARAMS_SPECIFIED` entry.
 */
export function createNoParamsEntry ({ originalId, sources }: { originalId: string, sources: string[] }): IBuff {
	return {
		id: BuffId.NO_PARAMS_SPECIFIED,
		originalId,
		sources,
	};
}
