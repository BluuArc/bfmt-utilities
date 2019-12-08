[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["buffs"](_buffs_.md)

# External module: "buffs"

## Index

### Interfaces

* [IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)

### Functions

* [combineEffectsAndDamageFrames](_buffs_.md#combineeffectsanddamageframes)
* [getEffectId](_buffs_.md#geteffectid)
* [isAttackingProcId](_buffs_.md#isattackingprocid)

## Functions

###  combineEffectsAndDamageFrames

▸ **combineEffectsAndDamageFrames**(`effects`: [ProcEffect](_datamine_types_.md#proceffect)[], `damageFrames`: [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[]): *[IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)[]*

*Defined in [buffs.ts:36](https://github.com/BluuArc/bfmt-utilities/blob/10ddcf7/src/buffs.ts#L36)*

**`description`** Create a list of objects that contain both the effect data and its corresponding damage frame

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effects` | [ProcEffect](_datamine_types_.md#proceffect)[] | List of proc effects to combine; must be the same length as the `damageFrames` |
`damageFrames` | [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[] | List of damage frames whose index corresponds with the effect in the `effects` list  |

**Returns:** *[IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)[]*

___

###  getEffectId

▸ **getEffectId**(`effect`: object): *string*

*Defined in [buffs.ts:54](https://github.com/BluuArc/bfmt-utilities/blob/10ddcf7/src/buffs.ts#L54)*

**Parameters:**

▪ **effect**: *object*

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`proc id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *string*

___

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:17](https://github.com/BluuArc/bfmt-utilities/blob/10ddcf7/src/buffs.ts#L17)*

**`description`** Determine if a given proc ID's type is an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to check  |

**Returns:** *boolean*
