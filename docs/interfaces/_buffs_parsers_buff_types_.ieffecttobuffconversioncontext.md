[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/buff-types"](../modules/_buffs_parsers_buff_types_.md) › [IEffectToBuffConversionContext](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md)

# Interface: IEffectToBuffConversionContext

**`description`** Aggregate object to encapsulate information not in the effect used in the conversion process.

## Hierarchy

* **IEffectToBuffConversionContext**

## Index

### Properties

* [damageFrames](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#optional-damageframes)
* [previousSources](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#optional-previoussources)
* [reloadMapping](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#optional-reloadmapping)
* [source](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#source)
* [sourceElement](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#optional-sourceelement)
* [sourceId](_buffs_parsers_buff_types_.ieffecttobuffconversioncontext.md#sourceid)

## Properties

### `Optional` damageFrames

• **damageFrames**? : *[IBurstDamageFramesEntry](_datamine_types_.iburstdamageframesentry.md)*

*Defined in [buffs/parsers/buff-types.ts:481](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L481)*

___

### `Optional` previousSources

• **previousSources**? : *string[]*

*Defined in [buffs/parsers/buff-types.ts:479](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L479)*

___

### `Optional` reloadMapping

• **reloadMapping**? : *undefined | false | true*

*Defined in [buffs/parsers/buff-types.ts:477](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L477)*

**`description`** Recreate the mapping of effect ID to conversion function before
converting the given effect. Useful if the internal mapping is somehow in a
bad state.

___

###  source

• **source**: *[BuffSource](../enums/_buffs_parsers_buff_types_.buffsource.md)*

*Defined in [buffs/parsers/buff-types.ts:469](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L469)*

___

### `Optional` sourceElement

• **sourceElement**? : *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [buffs/parsers/buff-types.ts:482](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L482)*

___

###  sourceId

• **sourceId**: *string*

*Defined in [buffs/parsers/buff-types.ts:470](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L470)*
