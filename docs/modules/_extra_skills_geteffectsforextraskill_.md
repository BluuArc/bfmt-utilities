[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["extra-skills/getEffectsForExtraSkill"](_extra_skills_geteffectsforextraskill_.md)

# Module: "extra-skills/getEffectsForExtraSkill"

## Index

### Functions

* [getEffectsForExtraSkill](_extra_skills_geteffectsforextraskill_.md#geteffectsforextraskill)

## Functions

###  getEffectsForExtraSkill

▸ **getEffectsForExtraSkill**(`skill`: [IExtraSkill](../interfaces/_datamine_types_.iextraskill.md)): *[ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect)[]*

*Defined in [extra-skills/getEffectsForExtraSkill.ts:8](https://github.com/BluuArc/bfmt-utilities/blob/master/src/extra-skills/getEffectsForExtraSkill.ts#L8)*

**`description`** Get the effects of a given extra skill.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`skill` | [IExtraSkill](../interfaces/_datamine_types_.iextraskill.md) | Extra skill to get the effects of. |

**Returns:** *[ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect)[]*

Effects of the given extra skill if they exist, an empty array otherwise.
