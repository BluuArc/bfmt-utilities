[@bluuarc/bfmt-utilities - v0.4.1](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IConsumableItem](_datamine_types_.iconsumableitem.md)

# Interface: IConsumableItem

## Hierarchy

* [IItem](_datamine_types_.iitem.md)

  ↳ **IConsumableItem**

## Index

### Properties

* [associated_units](_datamine_types_.iconsumableitem.md#optional-associated_units)
* [bfmtMetadata](_datamine_types_.iconsumableitem.md#optional-bfmtmetadata)
* [desc](_datamine_types_.iconsumableitem.md#desc)
* [dictionary](_datamine_types_.iconsumableitem.md#optional-dictionary)
* [effect](_datamine_types_.iconsumableitem.md#effect)
* [first_clear_missions](_datamine_types_.iconsumableitem.md#optional-first_clear_missions)
* [id](_datamine_types_.iconsumableitem.md#id)
* [max equipped](_datamine_types_.iconsumableitem.md#max-equipped)
* [max_stack](_datamine_types_.iconsumableitem.md#max_stack)
* [name](_datamine_types_.iconsumableitem.md#name)
* [raid](_datamine_types_.iconsumableitem.md#raid)
* [rarity](_datamine_types_.iconsumableitem.md#rarity)
* [recipe](_datamine_types_.iconsumableitem.md#optional-recipe)
* [sell_price](_datamine_types_.iconsumableitem.md#sell_price)
* [thumbnail](_datamine_types_.iconsumableitem.md#thumbnail)
* [type](_datamine_types_.iconsumableitem.md#type)
* [usage](_datamine_types_.iconsumableitem.md#optional-usage)

## Properties

### `Optional` associated_units

• **associated_units**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[associated_units](_datamine_types_.iitem.md#optional-associated_units)*

*Defined in [datamine-types.ts:643](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L643)*

**`description`** List of units that use this item

**`author`** BluuArc

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[bfmtMetadata](_datamine_types_.iitem.md#optional-bfmtmetadata)*

*Defined in [datamine-types.ts:613](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L613)*

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[desc](_datamine_types_.iitem.md#desc)*

*Defined in [datamine-types.ts:615](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L615)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Inherited from [IItem](_datamine_types_.iitem.md).[dictionary](_datamine_types_.iitem.md#optional-dictionary)*

*Defined in [datamine-types.ts:635](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L635)*

**`author`** BluuArc

___

###  effect

• **effect**: *object*

*Defined in [datamine-types.ts:654](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L654)*

#### Type declaration:

* **effect**: *[ProcEffect](../modules/_datamine_types_.md#proceffect)[]*

* **target_area**: *[TargetArea](../enums/_datamine_types_.targetarea.md)*

* **target_type**: *[TargetType](../enums/_datamine_types_.targettype.md)*

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[first_clear_missions](_datamine_types_.iitem.md#optional-first_clear_missions)*

*Defined in [datamine-types.ts:649](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L649)*

**`description`** Array of mission IDs where this item is a reward

**`author`** BluuArc

___

###  id

• **id**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[id](_datamine_types_.iitem.md#id)*

*Defined in [datamine-types.ts:616](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L616)*

___

###  max equipped

• **max equipped**: *number*

*Defined in [datamine-types.ts:653](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L653)*

___

###  max_stack

• **max_stack**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[max_stack](_datamine_types_.iitem.md#max_stack)*

*Defined in [datamine-types.ts:617](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L617)*

___

###  name

• **name**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[name](_datamine_types_.iitem.md#name)*

*Defined in [datamine-types.ts:618](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L618)*

___

###  raid

• **raid**: *boolean*

*Inherited from [IItem](_datamine_types_.iitem.md).[raid](_datamine_types_.iitem.md#raid)*

*Defined in [datamine-types.ts:619](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L619)*

___

###  rarity

• **rarity**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[rarity](_datamine_types_.iitem.md#rarity)*

*Defined in [datamine-types.ts:620](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L620)*

___

### `Optional` recipe

• **recipe**? : *[IItemRecipe](_datamine_types_.iitemrecipe.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[recipe](_datamine_types_.iitem.md#optional-recipe)*

*Defined in [datamine-types.ts:624](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L624)*

___

###  sell_price

• **sell_price**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell_price](_datamine_types_.iitem.md#sell_price)*

*Defined in [datamine-types.ts:621](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L621)*

___

###  thumbnail

• **thumbnail**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[thumbnail](_datamine_types_.iitem.md#thumbnail)*

*Defined in [datamine-types.ts:622](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L622)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[type](_datamine_types_.iitem.md#type)*

*Defined in [datamine-types.ts:623](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L623)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[usage](_datamine_types_.iitem.md#optional-usage)*

*Defined in [datamine-types.ts:630](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L630)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
