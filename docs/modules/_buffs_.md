[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["buffs"](_buffs_.md)

# External module: "buffs"

## Index

### Interfaces

* [IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)

### Functions

* [combineEffectsAndDamageFrames](_buffs_.md#combineeffectsanddamageframes)
* [getEffectId](_buffs_.md#geteffectid)
* [getMetadataForPassive](_buffs_.md#getmetadataforpassive)
* [getMetadataForProc](_buffs_.md#getmetadataforproc)
* [isAttackingProcId](_buffs_.md#isattackingprocid)

## Functions

###  combineEffectsAndDamageFrames

▸ **combineEffectsAndDamageFrames**(`effects`: [ProcEffect](_datamine_types_.md#proceffect)[], `damageFrames`: [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[]): *[IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)[]*

*Defined in [buffs.ts:59](https://github.com/BluuArc/bfmt-utilities/blob/57ae3a5/src/buffs.ts#L59)*

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

*Defined in [buffs.ts:77](https://github.com/BluuArc/bfmt-utilities/blob/57ae3a5/src/buffs.ts#L77)*

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

###  getMetadataForPassive

▸ **getMetadataForPassive**(`id`: string): *[IPassiveMetadataEntry](../interfaces/_buff_metadata_.ipassivemetadataentry.md) | undefined*

*Defined in [buffs.ts:30](https://github.com/BluuArc/bfmt-utilities/blob/57ae3a5/src/buffs.ts#L30)*

**`description`** Get the associated metadata entry for a given passive ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | passive ID to get metadata for  |

**Returns:** *[IPassiveMetadataEntry](../interfaces/_buff_metadata_.ipassivemetadataentry.md) | undefined*

___

###  getMetadataForProc

▸ **getMetadataForProc**(`id`: string): *[IProcMetadataEntry](../interfaces/_buff_metadata_.iprocmetadataentry.md) | undefined*

*Defined in [buffs.ts:20](https://github.com/BluuArc/bfmt-utilities/blob/57ae3a5/src/buffs.ts#L20)*

**`description`** Get the associated metadata entry for a given proc ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to get metadata for  |

**Returns:** *[IProcMetadataEntry](../interfaces/_buff_metadata_.iprocmetadataentry.md) | undefined*

___

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:40](https://github.com/BluuArc/bfmt-utilities/blob/57ae3a5/src/buffs.ts#L40)*

**`description`** Determine if a given proc ID's type is an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to check  |

**Returns:** *boolean*
