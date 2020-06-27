[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["leader-skills/getEffectsForLeaderSkill"](_leader_skills_geteffectsforleaderskill_.md)

# Module: "leader-skills/getEffectsForLeaderSkill"

## Index

### Functions

* [getEffectsForLeaderSkill](_leader_skills_geteffectsforleaderskill_.md#geteffectsforleaderskill)

## Functions

###  getEffectsForLeaderSkill

▸ **getEffectsForLeaderSkill**(`skill`: [ILeaderSkill](../interfaces/_datamine_types_.ileaderskill.md)): *[PassiveEffect](_datamine_types_.md#passiveeffect)[]*

*Defined in [leader-skills/getEffectsForLeaderSkill.ts:8](https://github.com/BluuArc/bfmt-utilities/blob/master/src/leader-skills/getEffectsForLeaderSkill.ts#L8)*

**`description`** Get the effects of a given leader skill.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`skill` | [ILeaderSkill](../interfaces/_datamine_types_.ileaderskill.md) | Leader skill to get the effects of. |

**Returns:** *[PassiveEffect](_datamine_types_.md#passiveeffect)[]*

Effects of the given leader skill if they exist, an empty array otherwise.
