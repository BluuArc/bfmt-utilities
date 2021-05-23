[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/buff-types"](../modules/_buffs_parsers_buff_types_.md) › [IBuff](_buffs_parsers_buff_types_.ibuff.md)

# Interface: IBuff

## Hierarchy

* **IBuff**

## Index

### Properties

* [conditions](_buffs_parsers_buff_types_.ibuff.md#optional-conditions)
* [duration](_buffs_parsers_buff_types_.ibuff.md#optional-duration)
* [effectDelay](_buffs_parsers_buff_types_.ibuff.md#optional-effectdelay)
* [id](_buffs_parsers_buff_types_.ibuff.md#id)
* [originalId](_buffs_parsers_buff_types_.ibuff.md#originalid)
* [sources](_buffs_parsers_buff_types_.ibuff.md#sources)
* [targetArea](_buffs_parsers_buff_types_.ibuff.md#optional-targetarea)
* [targetType](_buffs_parsers_buff_types_.ibuff.md#optional-targettype)
* [value](_buffs_parsers_buff_types_.ibuff.md#optional-value)

## Properties

### `Optional` conditions

• **conditions**? : *[IBuffConditions](_buffs_parsers_buff_types_.ibuffconditions.md)*

*Defined in [buffs/parsers/buff-types.ts:193](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L193)*

___

### `Optional` duration

• **duration**? : *undefined | number*

*Defined in [buffs/parsers/buff-types.ts:178](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L178)*

___

### `Optional` effectDelay

• **effectDelay**? : *undefined | string*

*Defined in [buffs/parsers/buff-types.ts:177](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L177)*

___

###  id

• **id**: *[BuffId](../enums/_buffs_parsers_buff_types_.buffid.md) | string*

*Defined in [buffs/parsers/buff-types.ts:167](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L167)*

___

###  originalId

• **originalId**: *string*

*Defined in [buffs/parsers/buff-types.ts:173](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L173)*

**`description`** The original proc/passive ID of the buff. This should only differ from the `id`
property if a proc/passive ID contains multiple buffs.

___

###  sources

• **sources**: *string[]*

*Defined in [buffs/parsers/buff-types.ts:190](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L190)*

**`description`** Ordered from the skill that immediately grants the buff on use to
the original source providing that buff. Typically for active buffs whose sources
are items or extra skills and SP enhancements that enhance existing skills.It is
ordered such that the entry at index 0 is the immediate source of the buff while
the entry at the last index is the original source of the buff.

Each entry should be in the format of `<BuffSource>-<ID of Buff Source>`. See [BuffSource](../enums/_buffs_parsers_buff_types_.buffsource.md)
for possible types of sources.

___

### `Optional` targetArea

• **targetArea**? : *[TargetArea](../enums/_datamine_types_.targetarea.md)*

*Defined in [buffs/parsers/buff-types.ts:176](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L176)*

___

### `Optional` targetType

• **targetType**? : *[TargetType](../enums/_datamine_types_.targettype.md)*

*Defined in [buffs/parsers/buff-types.ts:175](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L175)*

___

### `Optional` value

• **value**? : *string | number | [IBuff](_buffs_parsers_buff_types_.ibuff.md)[] | [IGenericBuffValue](_buffs_parsers_buff_types_.igenericbuffvalue.md) | any*

*Defined in [buffs/parsers/buff-types.ts:192](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L192)*
