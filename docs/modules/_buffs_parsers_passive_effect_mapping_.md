[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/passive-effect-mapping"](_buffs_parsers_passive_effect_mapping_.md)

# Module: "buffs/parsers/passive-effect-mapping"

## Index

### Type aliases

* [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)

### Variables

* [mapping](_buffs_parsers_passive_effect_mapping_.md#let-mapping)

### Functions

* [getPassiveEffectToBuffMapping](_buffs_parsers_passive_effect_mapping_.md#getpassiveeffecttobuffmapping)
* [setMapping](_buffs_parsers_passive_effect_mapping_.md#setmapping)

## Type aliases

###  PassiveEffectToBuffFunction

Ƭ **PassiveEffectToBuffFunction**: *function*

*Defined in [buffs/parsers/passive-effect-mapping.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/passive-effect-mapping.ts#L14)*

**`description`** Type representing a function that can parse a passive effect into an array of buffs.

**`param`** Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format.

**`param`** Aggregate object to encapsulate information not in the effect used in the conversion process.

**`param`** Object whose main use is for injecting methods in testing.

**`returns`** Converted buff(s) from the given passive effect.

#### Type declaration:

▸ (`effect`: [PassiveEffect](_datamine_types_.md#passiveeffect) | [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) | [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md), `injectionContext?`: IPassiveBuffProcessingInjectionContext): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`effect` | [PassiveEffect](_datamine_types_.md#passiveeffect) &#124; [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) &#124; [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect) |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) |
`injectionContext?` | IPassiveBuffProcessingInjectionContext |

## Variables

### `Let` mapping

• **mapping**: *Map‹string, [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)›*

*Defined in [buffs/parsers/passive-effect-mapping.ts:16](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/passive-effect-mapping.ts#L16)*

## Functions

###  getPassiveEffectToBuffMapping

▸ **getPassiveEffectToBuffMapping**(`reload?`: undefined | false | true, `convertPassiveEffectToBuffs?`: undefined | function): *Map‹string, [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)›*

*Defined in [buffs/parsers/passive-effect-mapping.ts:25](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/passive-effect-mapping.ts#L25)*

**`description`** Retrieve the passive-to-buff conversion function mapping for the library. Internally, this is a
lazy-loaded singleton to not impact first-load performance.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reload?` | undefined &#124; false &#124; true | Optionally re-create the mapping. |
`convertPassiveEffectToBuffs?` | undefined &#124; function | Function used for recursive passive buff parsing. |

**Returns:** *Map‹string, [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)›*

Mapping of passive IDs to functions.

___

###  setMapping

▸ **setMapping**(`map`: Map‹string, [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)›, `convertPassiveEffectToBuffs`: function): *void*

*Defined in [buffs/parsers/passive-effect-mapping.ts:41](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/passive-effect-mapping.ts#L41)*

**`description`** Apply the mapping of passive effect IDs to conversion functions to the given Map object.

**`internal`** 

**Parameters:**

▪ **map**: *Map‹string, [PassiveEffectToBuffFunction](_buffs_parsers_passive_effect_mapping_.md#passiveeffecttobufffunction)›*

Map to add conversion mapping onto.

▪ **convertPassiveEffectToBuffs**: *function*

Function used for recursive passive buff parsing.

▸ (`effect`: [PassiveEffect](_datamine_types_.md#passiveeffect) | [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) | [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`effect` | [PassiveEffect](_datamine_types_.md#passiveeffect) &#124; [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect) &#124; [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect) |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) |

**Returns:** *void*

Does not return anything.
