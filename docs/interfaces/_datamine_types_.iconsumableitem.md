[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IConsumableItem](_datamine_types_.iconsumableitem.md)

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
* [sell_price](_datamine_types_.iconsumableitem.md#sell_price)
* [thumbnail](_datamine_types_.iconsumableitem.md#thumbnail)
* [type](_datamine_types_.iconsumableitem.md#type)
* [usage](_datamine_types_.iconsumableitem.md#optional-usage)

## Properties

### `Optional` associated_units

• **associated_units**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[associated_units](_datamine_types_.iitem.md#optional-associated_units)*

*Defined in [datamine-types.ts:452](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L452)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[desc](_datamine_types_.iitem.md#desc)*

*Defined in [datamine-types.ts:425](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L425)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Inherited from [IItem](_datamine_types_.iitem.md).[dictionary](_datamine_types_.iitem.md#optional-dictionary)*

*Defined in [datamine-types.ts:444](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L444)*

**`author`** BluuArc

___

###  effect

• **effect**: *object*

*Defined in [datamine-types.ts:457](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L457)*

#### Type declaration:

* **effect**: *[ProcEffect](../modules/_datamine_types_.md#proceffect)[]*

* **target_area**: *[TargetArea](../enums/_datamine_types_.targetarea.md)*

* **target_type**: *[TargetType](../enums/_datamine_types_.targettype.md)*

___

###  id

• **id**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[id](_datamine_types_.iitem.md#id)*

*Defined in [datamine-types.ts:426](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L426)*

___

###  max equipped

• **max equipped**: *number*

*Defined in [datamine-types.ts:456](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L456)*

___

###  max_stack

• **max_stack**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[max_stack](_datamine_types_.iitem.md#max_stack)*

*Defined in [datamine-types.ts:427](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L427)*

___

###  name

• **name**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[name](_datamine_types_.iitem.md#name)*

*Defined in [datamine-types.ts:428](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L428)*

___

###  raid

• **raid**: *boolean*

*Inherited from [IItem](_datamine_types_.iitem.md).[raid](_datamine_types_.iitem.md#raid)*

*Defined in [datamine-types.ts:429](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L429)*

___

###  rarity

• **rarity**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[rarity](_datamine_types_.iitem.md#rarity)*

*Defined in [datamine-types.ts:430](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L430)*

___

###  sell_price

• **sell_price**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell_price](_datamine_types_.iitem.md#sell_price)*

*Defined in [datamine-types.ts:431](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L431)*

___

###  thumbnail

• **thumbnail**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[thumbnail](_datamine_types_.iitem.md#thumbnail)*

*Defined in [datamine-types.ts:432](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L432)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[type](_datamine_types_.iitem.md#type)*

*Defined in [datamine-types.ts:433](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L433)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[usage](_datamine_types_.iitem.md#optional-usage)*

*Defined in [datamine-types.ts:439](https://github.com/BluuArc/bfmt-utilities/blob/1f753a7/src/datamine-types.ts#L439)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
