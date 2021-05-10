[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/convertPassiveEffectToBuffs"](_buffs_parsers_convertpassiveeffecttobuffs_.md)

# Module: "buffs/parsers/convertPassiveEffectToBuffs"

## Index

### Functions

* [convertPassiveEffectToBuffs](_buffs_parsers_convertpassiveeffecttobuffs_.md#convertpassiveeffecttobuffs)
* [defaultConversionFunction](_buffs_parsers_convertpassiveeffecttobuffs_.md#defaultconversionfunction)

## Functions

###  convertPassiveEffectToBuffs

▸ **convertPassiveEffectToBuffs**(`effect`: [PassiveEffect](_datamine_types_.md#passiveeffect) | [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) | [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertPassiveEffectToBuffs.ts:32](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertPassiveEffectToBuffs.ts#L32)*

**`description`** Extract the buff(s) from a given passive effect object.
If the buff is not supported, the resulting buff type will be `BuffStackType.Unknown` (see [BuffStackType](../enums/_buffs_parsers_buff_types_.buffstacktype.md) for more info).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [PassiveEffect](_datamine_types_.md#passiveeffect) &#124; [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) &#124; [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect) | Passive effect object to extract buffs from. |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

A collection of one or more buffs found in the given passive effect object.

___

###  defaultConversionFunction

▸ **defaultConversionFunction**(`effect`: [PassiveEffect](_datamine_types_.md#passiveeffect) | [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) | [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

*Defined in [buffs/parsers/convertPassiveEffectToBuffs.ts:15](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/convertPassiveEffectToBuffs.ts#L15)*

**`description`** Default function for all effects that cannot be processed.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect` | [PassiveEffect](_datamine_types_.md#passiveeffect) &#124; [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) &#124; [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect) | Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format. |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) | Aggregate object to encapsulate information not in the effect used in the conversion process. |

**Returns:** *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

Converted buff(s) from the given passive effect.
