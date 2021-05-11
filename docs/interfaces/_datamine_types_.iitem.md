[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IItem](_datamine_types_.iitem.md)

# Interface: IItem

## Hierarchy

* **IItem**

  ↳ [IConsumableItem](_datamine_types_.iconsumableitem.md)

  ↳ [ISphere](_datamine_types_.isphere.md)

## Index

### Properties

* [associated_elgifs](_datamine_types_.iitem.md#optional-associated_elgifs)
* [associated_units](_datamine_types_.iitem.md#optional-associated_units)
* [bfmtMetadata](_datamine_types_.iitem.md#optional-bfmtmetadata)
* [desc](_datamine_types_.iitem.md#desc)
* [first_clear_missions](_datamine_types_.iitem.md#optional-first_clear_missions)
* [id](_datamine_types_.iitem.md#id)
* [lore](_datamine_types_.iitem.md#optional-lore)
* [max_stack](_datamine_types_.iitem.md#max_stack)
* [name](_datamine_types_.iitem.md#name)
* [raid](_datamine_types_.iitem.md#raid)
* [rarity](_datamine_types_.iitem.md#rarity)
* [recipe](_datamine_types_.iitem.md#optional-recipe)
* [sell caution](_datamine_types_.iitem.md#optional-sell-caution)
* [sell_price](_datamine_types_.iitem.md#sell_price)
* [thumbnail](_datamine_types_.iitem.md#thumbnail)
* [type](_datamine_types_.iitem.md#type)
* [usage](_datamine_types_.iitem.md#optional-usage)

## Properties

### `Optional` associated_elgifs

• **associated_elgifs**? : *string[]*

*Defined in [datamine-types.ts:734](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L734)*

**`description`** Array of extra skill IDs that have the current item as a condition for at least one effect.

**`author`** BluuArc

___

### `Optional` associated_units

• **associated_units**? : *string[]*

*Defined in [datamine-types.ts:720](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L720)*

**`description`** List of units that use this item.

**`author`** BluuArc

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Defined in [datamine-types.ts:689](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L689)*

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Defined in [datamine-types.ts:691](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L691)*

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Defined in [datamine-types.ts:726](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L726)*

**`description`** Array of mission IDs where this item is a reward.

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:692](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L692)*

___

### `Optional` lore

• **lore**? : *undefined | string*

*Defined in [datamine-types.ts:714](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L714)*

**`author`** BluuArc

___

###  max_stack

• **max_stack**: *number*

*Defined in [datamine-types.ts:693](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L693)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:694](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L694)*

___

###  raid

• **raid**: *boolean*

*Defined in [datamine-types.ts:695](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L695)*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:696](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L696)*

___

### `Optional` recipe

• **recipe**? : *[IItemRecipe](_datamine_types_.iitemrecipe.md) | [IItemRecipe](_datamine_types_.iitemrecipe.md)[]*

*Defined in [datamine-types.ts:703](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L703)*

**`description`** If the source is from Deathmax, then it is an object. If the source is from BluuArc, then it is an array.

___

### `Optional` sell caution

• **sell caution**? : *undefined | false | true*

*Defined in [datamine-types.ts:728](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L728)*

___

###  sell_price

• **sell_price**: *number*

*Defined in [datamine-types.ts:697](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L697)*

___

###  thumbnail

• **thumbnail**: *string*

*Defined in [datamine-types.ts:698](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L698)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Defined in [datamine-types.ts:699](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L699)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Defined in [datamine-types.ts:709](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L709)*

**`description`** List of other items that use the current item in their recipe.

**`author`** BluuArc
