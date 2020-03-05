[@bluuarc/bfmt-utilities - v0.4.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IConsumableItem](_datamine_types_.iconsumableitem.md)

# Interface: IConsumableItem

## Hierarchy

* [IItem](_datamine_types_.iitem.md)

  ↳ **IConsumableItem**

## Index

### Properties

* [associated_units](_datamine_types_.iconsumableitem.md#optional-associated_units)
* [desc](_datamine_types_.iconsumableitem.md#desc)
* [dictionary](_datamine_types_.iconsumableitem.md#optional-dictionary)
* [effect](_datamine_types_.iconsumableitem.md#effect)
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

*Defined in [datamine-types.ts:510](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L510)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[desc](_datamine_types_.iitem.md#desc)*

*Defined in [datamine-types.ts:482](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L482)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Inherited from [IItem](_datamine_types_.iitem.md).[dictionary](_datamine_types_.iitem.md#optional-dictionary)*

*Defined in [datamine-types.ts:502](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L502)*

**`author`** BluuArc

___

###  effect

• **effect**: *object*

*Defined in [datamine-types.ts:515](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L515)*

#### Type declaration:

* **effect**: *[ProcEffect](../modules/_datamine_types_.md#proceffect)[]*

* **target_area**: *[TargetArea](../enums/_datamine_types_.targetarea.md)*

* **target_type**: *[TargetType](../enums/_datamine_types_.targettype.md)*

___

###  id

• **id**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[id](_datamine_types_.iitem.md#id)*

*Defined in [datamine-types.ts:483](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L483)*

___

###  max equipped

• **max equipped**: *number*

*Defined in [datamine-types.ts:514](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L514)*

___

###  max_stack

• **max_stack**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[max_stack](_datamine_types_.iitem.md#max_stack)*

*Defined in [datamine-types.ts:484](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L484)*

___

###  name

• **name**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[name](_datamine_types_.iitem.md#name)*

*Defined in [datamine-types.ts:485](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L485)*

___

###  raid

• **raid**: *boolean*

*Inherited from [IItem](_datamine_types_.iitem.md).[raid](_datamine_types_.iitem.md#raid)*

*Defined in [datamine-types.ts:486](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L486)*

___

###  rarity

• **rarity**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[rarity](_datamine_types_.iitem.md#rarity)*

*Defined in [datamine-types.ts:487](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L487)*

___

### `Optional` recipe

• **recipe**? : *[IItemRecipe](_datamine_types_.iitemrecipe.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[recipe](_datamine_types_.iitem.md#optional-recipe)*

*Defined in [datamine-types.ts:491](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L491)*

___

###  sell_price

• **sell_price**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell_price](_datamine_types_.iitem.md#sell_price)*

*Defined in [datamine-types.ts:488](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L488)*

___

###  thumbnail

• **thumbnail**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[thumbnail](_datamine_types_.iitem.md#thumbnail)*

*Defined in [datamine-types.ts:489](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L489)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[type](_datamine_types_.iitem.md#type)*

*Defined in [datamine-types.ts:490](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L490)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[usage](_datamine_types_.iitem.md#optional-usage)*

*Defined in [datamine-types.ts:497](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L497)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
