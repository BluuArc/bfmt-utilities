[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/combineEffectsAndDamageFrames"](_buffs_combineeffectsanddamageframes_.md)

# Module: "buffs/combineEffectsAndDamageFrames"

## Index

### Functions

* [combineEffectsAndDamageFrames](_buffs_combineeffectsanddamageframes_.md#combineeffectsanddamageframes)

## Functions

###  combineEffectsAndDamageFrames

▸ **combineEffectsAndDamageFrames**(`effects`: [ProcEffect](_datamine_types_.md#proceffect)[], `damageFrames`: [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[]): *[IProcEffectFrameComposite](../interfaces/_buffs_iproceffectframecomposite_.iproceffectframecomposite.md)[]*

*Defined in [buffs/combineEffectsAndDamageFrames.ts:16](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/combineEffectsAndDamageFrames.ts#L16)*

**`description`** Create a list of objects that contain both the effect data and its corresponding damage frame.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effects` | [ProcEffect](_datamine_types_.md#proceffect)[] | List of proc effects to combine; must be the same length as the `damageFrames`. |
`damageFrames` | [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[] | List of damage frames whose index corresponds with the effect in the `effects` list. |

**Returns:** *[IProcEffectFrameComposite](../interfaces/_buffs_iproceffectframecomposite_.iproceffectframecomposite.md)[]*

Collection of composite objects that contain the proc effect and the corresponding frames entry.
