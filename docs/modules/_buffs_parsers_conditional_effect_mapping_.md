[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/conditional-effect-mapping"](_buffs_parsers_conditional_effect_mapping_.md)

# Module: "buffs/parsers/conditional-effect-mapping"

## Index

### Type aliases

* [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)

### Variables

* [mapping](_buffs_parsers_conditional_effect_mapping_.md#let-mapping)

### Functions

* [getConditionalEffectToBuffMapping](_buffs_parsers_conditional_effect_mapping_.md#getconditionaleffecttobuffmapping)
* [setMapping](_buffs_parsers_conditional_effect_mapping_.md#setmapping)

## Type aliases

###  ConditionalEffectToBuffFunction

Ƭ **ConditionalEffectToBuffFunction**: *function*

*Defined in [buffs/parsers/conditional-effect-mapping.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/conditional-effect-mapping.ts#L12)*

**`description`** Type representing a function that can parse a conditional effect into an array of buffs.

**`param`** Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format.

**`param`** Aggregate object to encapsulate information not in the effect used in the conversion process.

**`param`** Object whose main use is for injecting methods in testing.

**`returns`** Converted buff(s) from the given passive effect.

#### Type declaration:

▸ (`effect`: [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md), `injectionContext?`: IBaseBuffProcessingInjectionContext): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`effect` | [IConditionalEffect](../interfaces/_buffs_parsers_buff_types_.iconditionaleffect.md) |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) |
`injectionContext?` | IBaseBuffProcessingInjectionContext |

## Variables

### `Let` mapping

• **mapping**: *Map‹string, [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)›*

*Defined in [buffs/parsers/conditional-effect-mapping.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/conditional-effect-mapping.ts#L14)*

## Functions

###  getConditionalEffectToBuffMapping

▸ **getConditionalEffectToBuffMapping**(`reload?`: undefined | false | true): *Map‹string, [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)›*

*Defined in [buffs/parsers/conditional-effect-mapping.ts:22](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/conditional-effect-mapping.ts#L22)*

**`description`** Retrieve the conditional-to-buff conversion function mapping for the library. Internally, this is a
lazy-loaded singleton to not impact first-load performance.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reload?` | undefined &#124; false &#124; true | Optionally re-create the mapping. |

**Returns:** *Map‹string, [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)›*

Mapping of conditional IDs to functions.

___

###  setMapping

▸ **setMapping**(`map`: Map‹string, [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)›): *void*

*Defined in [buffs/parsers/conditional-effect-mapping.ts:37](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/conditional-effect-mapping.ts#L37)*

**`description`** Apply the mapping of conditional effect IDs to conversion functions to the given Map object.

**`internal`** 

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`map` | Map‹string, [ConditionalEffectToBuffFunction](_buffs_parsers_conditional_effect_mapping_.md#conditionaleffecttobufffunction)› | Map to add conversion mapping onto. |

**Returns:** *void*

Does not return anything.
