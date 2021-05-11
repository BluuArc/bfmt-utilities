[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/convertProcEffectToBuffs"](_buffs_parsers_convertproceffecttobuffs_.md)

# Module: "buffs/parsers/convertProcEffectToBuffs"

## Index

### Functions

* [convertProcEffectToBuffs](_buffs_parsers_convertproceffecttobuffs_.md#convertproceffecttobuffs)
* [defaultConversionFunction](_buffs_parsers_convertproceffecttobuffs_.md#defaultconversionfunction)

## Functions

###  convertProcEffectToBuffs

▸ **convertProcEffectToBuffs**(`effect`: [ProcEffect](_datamine_types_.md#proceffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertProcEffectToBuffs.ts:35](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertProcEffectToBuffs.ts#L35)*

**`description`** Extract the buff(s) from a given proc effect object.
If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see [BuffStackType](../enums/_buffs_parsers_buff_types_.buffstacktype.md) for more info).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [ProcEffect](_datamine_types_.md#proceffect) | Proc effect object to extract buffs from. |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

A collection of one or more buffs found in the given proc effect object.

___

###  defaultConversionFunction

▸ **defaultConversionFunction**(`effect`: [ProcEffect](_datamine_types_.md#proceffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertProcEffectToBuffs.ts:15](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertProcEffectToBuffs.ts#L15)*

**`description`** Default function for all effects that cannot be processed.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [ProcEffect](_datamine_types_.md#proceffect) | Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format. |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

Converted buff(s) from the given proc effect.
