[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/proc-effect-mapping"](_buffs_parsers_proc_effect_mapping_.md)

# Module: "buffs/parsers/proc-effect-mapping"

## Index

### Type aliases

* [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)

### Variables

* [mapping](_buffs_parsers_proc_effect_mapping_.md#let-mapping)

### Functions

* [getProcEffectToBuffMapping](_buffs_parsers_proc_effect_mapping_.md#getproceffecttobuffmapping)
* [setMapping](_buffs_parsers_proc_effect_mapping_.md#setmapping)

## Type aliases

###  ProcEffectToBuffFunction

Ƭ **ProcEffectToBuffFunction**: *function*

*Defined in [buffs/parsers/proc-effect-mapping.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/proc-effect-mapping.ts#L12)*

**`description`** Type representing a function that can parse a proc effect into an array of buffs.

**`param`** Effect to convert to [IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md) format.

**`param`** Aggregate object to encapsulate information not in the effect used in the conversion process.

**`param`** Object whose main use is for injecting methods in testing.

**`returns`** Converted buff(s) from the given proc effect.

#### Type declaration:

▸ (`effect`: [ProcEffect](_datamine_types_.md#proceffect), `context`: [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md), `injectionContext?`: IProcBuffProcessingInjectionContext): *[IBuff](../interfaces/_buffs_parsers_buff_types_.ibuff.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`effect` | [ProcEffect](_datamine_types_.md#proceffect) |
`context` | [IEffectToBuffConversionContext](../interfaces/_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md) |
`injectionContext?` | IProcBuffProcessingInjectionContext |

## Variables

### `Let` mapping

• **mapping**: *Map‹string, [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)›*

*Defined in [buffs/parsers/proc-effect-mapping.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/proc-effect-mapping.ts#L14)*

## Functions

###  getProcEffectToBuffMapping

▸ **getProcEffectToBuffMapping**(`reload?`: undefined | false | true): *Map‹string, [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)›*

*Defined in [buffs/parsers/proc-effect-mapping.ts:22](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/proc-effect-mapping.ts#L22)*

**`description`** Retrieve the proc-to-buff conversion function mapping for the library. Internally, this is a
lazy-loaded singleton to not impact first-load performance.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`reload?` | undefined &#124; false &#124; true | Optionally re-create the mapping. |

**Returns:** *Map‹string, [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)›*

Mapping of proc IDs to functions.

___

###  setMapping

▸ **setMapping**(`map`: Map‹string, [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)›): *void*

*Defined in [buffs/parsers/proc-effect-mapping.ts:37](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/proc-effect-mapping.ts#L37)*

**`description`** Apply the mapping of proc effect IDs to conversion functions to the given Map object.

**`internal`** 

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`map` | Map‹string, [ProcEffectToBuffFunction](_buffs_parsers_proc_effect_mapping_.md#proceffecttobufffunction)› | Map to add conversion mapping onto. |

**Returns:** *void*

Does not return anything.
