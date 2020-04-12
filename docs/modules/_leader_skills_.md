[@bluuarc/bfmt-utilities - v0.4.1](../README.md) › [Globals](../globals.md) › ["leader-skills"](_leader_skills_.md)

# Module: "leader-skills"

## Index

### Functions

* [getEffectsForLeaderSkill](_leader_skills_.md#geteffectsforleaderskill)

## Functions

###  getEffectsForLeaderSkill

▸ **getEffectsForLeaderSkill**(`skill`: [ILeaderSkill](../interfaces/_datamine_types_.ileaderskill.md)): *[PassiveEffect](_datamine_types_.md#passiveeffect)[]*

*Defined in [leader-skills.ts:8](https://github.com/BluuArc/bfmt-utilities/blob/master/src/leader-skills.ts#L8)*

**`description`** Get the effects of a given leader skill

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`skill` | [ILeaderSkill](../interfaces/_datamine_types_.ileaderskill.md) | leader skill to get the effects of |

**Returns:** *[PassiveEffect](_datamine_types_.md#passiveeffect)[]*

the effects of the given leader skill if they exist, an empty array otherwise
