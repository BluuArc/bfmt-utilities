export interface IUnitImageFileNames {
	spritesheet: string;
	battleAvatar: string;
	guideAvatar: string;
	fullIllustration: string;
}

/**
 * @description Generate the file names for each of the image type for a given unit ID
 * @param id the unit ID to use to generate the file names
 * @param suffix optional parameter that's useful for things like alternate art
 */
export function getUnitImageFileNames (id: string, suffix = ''): IUnitImageFileNames {
	const fileNameSuffix = `${id || ''}${suffix || ''}.png`;
	return {
		spritesheet: `unit_anime_${fileNameSuffix}`,
		battleAvatar: `unit_ills_battle_${fileNameSuffix}`,
		guideAvatar: `unit_ills_thum_${fileNameSuffix}`,
		fullIllustration: `unit_ills_full_${fileNameSuffix}`,
	};
}
