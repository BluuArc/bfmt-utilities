import { SpCategoryName } from '../datamine-types';

/**
 * @description Get the associated category name with a given category ID.
 * @param categoryId Category ID to get the name of.
 * @returns Name of the given category ID or the string 'Unknown'.
 */
export default function getSpCategoryName (categoryId: string | number): SpCategoryName {
	let result: SpCategoryName;
	const numericalCategoryId = +categoryId;
	switch (numericalCategoryId) {
	case 1: result = SpCategoryName['Parameter Boost']; break;
	case 2: result = SpCategoryName.Spark; break;
	case 3: result = SpCategoryName['Critical Hits']; break;
	case 4: result = SpCategoryName['Attack Boost']; break;
	case 5: result = SpCategoryName['BB Gauge']; break;
	case 6: result = SpCategoryName['HP Recovery']; break;
	case 7: result = SpCategoryName.Drops; break;
	case 8: result = SpCategoryName['Ailment Resistance']; break;
	case 9: result = SpCategoryName['Ailment Infliction']; break;
	case 10: result = SpCategoryName['Damage Reduction']; break;
	case 11: result = SpCategoryName.Special; break;
	default: result = SpCategoryName.Unknown; break;
	}
	return result;
}
