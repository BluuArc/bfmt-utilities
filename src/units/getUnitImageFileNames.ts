import IUnitImageFileNames from './IUnitImageFileNames';

/**
 * @description Generate the file names for each of the image type for a given unit ID.
 * @param id Unit ID to use to generate the file names.
 * @param suffix Optional parameter that's useful for things like alternate art.
 * @returns Set of file names for each image type (spritesheet, battle avatar, guide avatar, full illustration).
 */
export default function getUnitImageFileNames (id: string, suffix = ''): IUnitImageFileNames {
	const fileNameSuffix = `${id || ''}${suffix || ''}.png`;
	return {
		spritesheet: `unit_anime_${fileNameSuffix}`,
		battleAvatar: `unit_ills_battle_${fileNameSuffix}`,
		guideAvatar: `unit_ills_thum_${fileNameSuffix}`,
		fullIllustration: `unit_ills_full_${fileNameSuffix}`,
	};
}
