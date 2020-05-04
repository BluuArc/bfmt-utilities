[@bluuarc/bfmt-utilities - v0.4.1](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IItem](_datamine_types_.iitem.md)

# Interface: IItem

## Hierarchy

* **IItem**

  ↳ [IConsumableItem](_datamine_types_.iconsumableitem.md)

  ↳ [ISphere](_datamine_types_.isphere.md)

## Index

### Properties

* [associated_units](_datamine_types_.iitem.md#optional-associated_units)
* [bfmtMetadata](_datamine_types_.iitem.md#optional-bfmtmetadata)
* [desc](_datamine_types_.iitem.md#desc)
* [dictionary](_datamine_types_.iitem.md#optional-dictionary)
* [first_clear_missions](_datamine_types_.iitem.md#optional-first_clear_missions)
* [id](_datamine_types_.iitem.md#id)
* [max_stack](_datamine_types_.iitem.md#max_stack)
* [name](_datamine_types_.iitem.md#name)
* [raid](_datamine_types_.iitem.md#raid)
* [rarity](_datamine_types_.iitem.md#rarity)
* [recipe](_datamine_types_.iitem.md#optional-recipe)
* [sell_price](_datamine_types_.iitem.md#sell_price)
* [thumbnail](_datamine_types_.iitem.md#thumbnail)
* [type](_datamine_types_.iitem.md#type)
* [usage](_datamine_types_.iitem.md#optional-usage)

## Properties

### `Optional` associated_units

• **associated_units**? : *string[]*

*Defined in [datamine-types.ts:643](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L643)*

**`description`** List of units that use this item

**`author`** BluuArc

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Defined in [datamine-types.ts:613](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L613)*

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Defined in [datamine-types.ts:615](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L615)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:635](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L635)*

**`author`** BluuArc

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Defined in [datamine-types.ts:649](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L649)*

**`description`** Array of mission IDs where this item is a reward

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:616](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L616)*

___

###  max_stack

• **max_stack**: *number*

*Defined in [datamine-types.ts:617](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L617)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:618](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L618)*

___

###  raid

• **raid**: *boolean*

*Defined in [datamine-types.ts:619](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L619)*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:620](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L620)*

___

### `Optional` recipe

• **recipe**? : *[IItemRecipe](_datamine_types_.iitemrecipe.md)*

*Defined in [datamine-types.ts:624](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L624)*

___

###  sell_price

• **sell_price**: *number*

*Defined in [datamine-types.ts:621](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L621)*

___

###  thumbnail

• **thumbnail**: *string*

*Defined in [datamine-types.ts:622](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L622)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Defined in [datamine-types.ts:623](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L623)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Defined in [datamine-types.ts:630](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L630)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
