import { IExtraSkill, ExtraSkillPassiveEffect } from './datamine-types';

/**
 * @description Get the effects of a given extra skill
 * @param skill extra skill to get the effects of
 */
export function getEffectsForExtraSkill (skill: IExtraSkill): ExtraSkillPassiveEffect[] {
	return (skill && Array.isArray(skill.effects)) ? skill.effects : [];
}
