[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/convertConditionalEffectToBuffs"](_buffs_parsers_convertconditionaleffecttobuffs_.md)

# Module: "buffs/parsers/convertConditionalEffectToBuffs"

## Index

### Functions

* [convertConditionalEffectToBuffs](_buffs_parsers_convertconditionaleffecttobuffs_.md#convertconditionaleffecttobuffs)
* [defaultConversionFunction](_buffs_parsers_convertconditionaleffecttobuffs_.md#defaultconversionfunction)

## Functions

###  convertConditionalEffectToBuffs

▸ **convertConditionalEffectToBuffs**(`effect`: [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertConditionalEffectToBuffs.ts:29](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertConditionalEffectToBuffs.ts#L29)*

**`description`** Extract the buff(s) from a given conditional effect object.
If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see [BuffStackType](../enums/_buffs_parsers_buff_types_.buffstacktype.md) for more info).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md) | Conditional effect to extract buffs from |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

A collection of one or more buffs found in the given passive effect object.

___

###  defaultConversionFunction

▸ **defaultConversionFunction**(`effect`: [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertConditionalEffectToBuffs.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertConditionalEffectToBuffs.ts#L12)*

**`description`** Default function for all effects that cannot be processed.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md) | Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format. |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

Converted buff(s) from the given conditional effect.
