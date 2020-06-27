import { IExtraSkill, ExtraSkillPassiveEffect } from '../datamine-types';

/**
 * @description Get the effects of a given extra skill.
 * @param skill Extra skill to get the effects of.
 * @returns Effects of the given extra skill if they exist, an empty array otherwise.
 */
export default function getEffectsForExtraSkill (skill: IExtraSkill): ExtraSkillPassiveEffect[] {
	return (skill && Array.isArray(skill.effects)) ? skill.effects : [];
}
