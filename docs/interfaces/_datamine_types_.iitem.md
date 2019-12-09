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

*Defined in [datamine-types.ts:484](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L484)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Defined in [datamine-types.ts:457](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L457)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:476](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L476)*

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:458](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L458)*

___

###  max_stack

• **max_stack**: *number*

*Defined in [datamine-types.ts:459](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L459)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:460](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L460)*

___

###  raid

• **raid**: *boolean*

*Defined in [datamine-types.ts:461](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L461)*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:462](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L462)*

___

###  sell_price

• **sell_price**: *number*

*Defined in [datamine-types.ts:463](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L463)*

___

###  thumbnail

• **thumbnail**: *string*

*Defined in [datamine-types.ts:464](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L464)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Defined in [datamine-types.ts:465](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L465)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Defined in [datamine-types.ts:471](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L471)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
