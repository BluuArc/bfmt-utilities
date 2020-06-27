[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["bursts/getExtraAttackDamageFramesEntry"](_bursts_getextraattackdamageframesentry_.md)

# Module: "bursts/getExtraAttackDamageFramesEntry"

## Index

### Functions

* [getExtraAttackDamageFramesEntry](_bursts_getextraattackdamageframesentry_.md#getextraattackdamageframesentry)

## Functions

###  getExtraAttackDamageFramesEntry

▸ **getExtraAttackDamageFramesEntry**(`damageFrames`: [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[], `effectDelay`: string): *[IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)*

*Defined in [bursts/getExtraAttackDamageFramesEntry.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts/getExtraAttackDamageFramesEntry.ts#L12)*

**`description`** Get the extra attack damage frames entry based on the damage frames of a burst. Also apply the given effect delay to the resulting damage frames entry.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`damageFrames` | [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[] | - | Damage frames that each have their own proc ID. |
`effectDelay` | string | "0.0/0" | Optional effect delay to apply to the resulting damage frames entry. |

**Returns:** *[IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)*

Damage frames entry whose frames are based on the input damage frames.
