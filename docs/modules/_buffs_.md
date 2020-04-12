[@bluuarc/bfmt-utilities - v0.4.1](../README.md) › [Globals](../globals.md) › ["buffs"](_buffs_.md)

# Module: "buffs"

## Index

### Interfaces

* [IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)

### Functions

* [combineEffectsAndDamageFrames](_buffs_.md#combineeffectsanddamageframes)
* [getEffectId](_buffs_.md#geteffectid)
* [getEffectName](_buffs_.md#geteffectname)
* [getMetadataForPassive](_buffs_.md#getmetadataforpassive)
* [getMetadataForProc](_buffs_.md#getmetadataforproc)
* [getNameForPassive](_buffs_.md#getnameforpassive)
* [getNameForProc](_buffs_.md#getnameforproc)
* [isAttackingProcId](_buffs_.md#isattackingprocid)
* [isPassiveEffect](_buffs_.md#ispassiveeffect)
* [isProcEffect](_buffs_.md#isproceffect)

## Functions

###  combineEffectsAndDamageFrames

▸ **combineEffectsAndDamageFrames**(`effects`: [ProcEffect](_datamine_types_.md#proceffect)[], `damageFrames`: [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[]): *[IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)[]*

*Defined in [buffs.ts:113](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L113)*

**`description`** Create a list of objects that contain both the effect data and its corresponding damage frame

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effects` | [ProcEffect](_datamine_types_.md#proceffect)[] | List of proc effects to combine; must be the same length as the `damageFrames` |
`damageFrames` | [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)[] | List of damage frames whose index corresponds with the effect in the `effects` list |

**Returns:** *[IProcEffectFrameComposite](../interfaces/_buffs_.iproceffectframecomposite.md)[]*

collection of composite objects that contain the proc effect and the corresponding frames entry

___

###  getEffectId

▸ **getEffectId**(`effect`: object): *string*

*Defined in [buffs.ts:136](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L136)*

**`description`** Get the proc/passive ID of a given object

**Parameters:**

▪ **effect**: *object*

Object to get the effect ID from

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`proc id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *string*

The proc/passive ID of the input effect if it exists; empty string otherwise

___

###  getEffectName

▸ **getEffectName**(`effect`: object): *string*

*Defined in [buffs.ts:155](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L155)*

**`description`** Get the name of a given object

**Parameters:**

▪ **effect**: *object*

Object to get the name from

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`proc id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *string*

The name of the input effect if it exists; empty string otherwise

___

###  getMetadataForPassive

▸ **getMetadataForPassive**(`id`: string): *[IPassiveMetadataEntry](../interfaces/_buff_metadata_.ipassivemetadataentry.md) | undefined*

*Defined in [buffs.ts:32](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L32)*

**`description`** Get the associated metadata entry for a given passive ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | passive ID to get metadata for |

**Returns:** *[IPassiveMetadataEntry](../interfaces/_buff_metadata_.ipassivemetadataentry.md) | undefined*

corresponding passive metadata entry if it exists, undefined otherwise

___

###  getMetadataForProc

▸ **getMetadataForProc**(`id`: string): *[IProcMetadataEntry](../interfaces/_buff_metadata_.iprocmetadataentry.md) | undefined*

*Defined in [buffs.ts:21](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L21)*

**`description`** Get the associated metadata entry for a given proc ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to get metadata for |

**Returns:** *[IProcMetadataEntry](../interfaces/_buff_metadata_.iprocmetadataentry.md) | undefined*

corresponding proc metadata entry if it exists, undefined otherwise

___

###  getNameForPassive

▸ **getNameForPassive**(`id`: string): *string*

*Defined in [buffs.ts:63](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L63)*

**`description`** Get the associated name for a given passive ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | passive ID to get the name of |

**Returns:** *string*

the name of the passive ID if it exists, empty string otherwise

___

###  getNameForProc

▸ **getNameForProc**(`id`: string): *string*

*Defined in [buffs.ts:53](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L53)*

**`description`** Get the associated name for a given proc ID

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to get the name of |

**Returns:** *string*

the name of the proc ID if it exists, empty string otherwise

___

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:43](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L43)*

**`description`** Determine if a given proc ID's type is an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | proc ID to check |

**Returns:** *boolean*

whether the given ID corresponds to a proc ID whose type is attack

___

###  isPassiveEffect

▸ **isPassiveEffect**(`effect`: object): *boolean*

*Defined in [buffs.ts:89](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L89)*

**`description`** Determine if a given effect object is a passive effect based on existing properties.
Do note that it does not check the validity of each property, only the existence.

**Parameters:**

▪ **effect**: *object*

object to check

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |

**Returns:** *boolean*

whether the given effect object is considered a passive effect based on its properties

___

###  isProcEffect

▸ **isProcEffect**(`effect`: object): *boolean*

*Defined in [buffs.ts:74](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs.ts#L74)*

**`description`** Determine if a given effect object is a proc effect based on existing properties.
Do note that it does not check the validity of each property, only the existence.

**Parameters:**

▪ **effect**: *object*

object to check

Name | Type |
------ | ------ |
`proc id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *boolean*

whether the given effect object is considered a proc effect based on its properties
