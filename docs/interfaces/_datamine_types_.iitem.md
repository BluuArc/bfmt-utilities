[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IItem](_datamine_types_.iitem.md)

# Interface: IItem

## Hierarchy

* **IItem**

  ↳ [IConsumableItem](_datamine_types_.iconsumableitem.md)

  ↳ [ISphere](_datamine_types_.isphere.md)

## Index

### Properties

* [associated_units](_datamine_types_.iitem.md#optional-associated_units)
* [desc](_datamine_types_.iitem.md#desc)
* [dictionary](_datamine_types_.iitem.md#optional-dictionary)
* [id](_datamine_types_.iitem.md#id)
* [max_stack](_datamine_types_.iitem.md#max_stack)
* [name](_datamine_types_.iitem.md#name)
* [raid](_datamine_types_.iitem.md#raid)
* [rarity](_datamine_types_.iitem.md#rarity)
* [sell_price](_datamine_types_.iitem.md#sell_price)
* [thumbnail](_datamine_types_.iitem.md#thumbnail)
* [type](_datamine_types_.iitem.md#type)
* [usage](_datamine_types_.iitem.md#optional-usage)

## Properties

### `Optional` associated_units

• **associated_units**? : *string[]*

*Defined in [datamine-types.ts:452](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L452)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Defined in [datamine-types.ts:425](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L425)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:444](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L444)*

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:426](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L426)*

___

###  max_stack

• **max_stack**: *number*

*Defined in [datamine-types.ts:427](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L427)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:428](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L428)*

___

###  raid

• **raid**: *boolean*

*Defined in [datamine-types.ts:429](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L429)*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:430](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L430)*

___

###  sell_price

• **sell_price**: *number*

*Defined in [datamine-types.ts:431](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L431)*

___

###  thumbnail

• **thumbnail**: *string*

*Defined in [datamine-types.ts:432](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L432)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Defined in [datamine-types.ts:433](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L433)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Defined in [datamine-types.ts:439](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L439)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
