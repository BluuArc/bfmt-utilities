import { ILeaderSkill, PassiveEffect } from '../datamine-types';

/**
 * @description Get the effects of a given leader skill.
 * @param skill Leader skill to get the effects of.
 * @returns Effects of the given leader skill if they exist, an empty array otherwise.
 */
export default function getEffectsForLeaderSkill (skill: ILeaderSkill): PassiveEffect[] {
	return skill && Array.isArray(skill.effects) ? skill.effects : [];
}
