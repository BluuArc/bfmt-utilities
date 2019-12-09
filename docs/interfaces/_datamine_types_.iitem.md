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

*Defined in [datamine-types.ts:506](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L506)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Defined in [datamine-types.ts:479](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L479)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:498](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L498)*

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:480](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L480)*

___

###  max_stack

• **max_stack**: *number*

*Defined in [datamine-types.ts:481](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L481)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:482](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L482)*

___

###  raid

• **raid**: *boolean*

*Defined in [datamine-types.ts:483](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L483)*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:484](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L484)*

___

###  sell_price

• **sell_price**: *number*

*Defined in [datamine-types.ts:485](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L485)*

___

###  thumbnail

• **thumbnail**: *string*

*Defined in [datamine-types.ts:486](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L486)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Defined in [datamine-types.ts:487](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L487)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Defined in [datamine-types.ts:493](https://github.com/BluuArc/bfmt-utilities/blob/51a3629/src/datamine-types.ts#L493)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
