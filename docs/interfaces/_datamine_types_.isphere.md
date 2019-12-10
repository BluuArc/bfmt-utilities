[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [ISphere](_datamine_types_.isphere.md)

# Interface: ISphere

## Hierarchy

* [IItem](_datamine_types_.iitem.md)

  ↳ **ISphere**

## Index

### Properties

* [associated_units](_datamine_types_.isphere.md#optional-associated_units)
* [desc](_datamine_types_.isphere.md#desc)
* [dictionary](_datamine_types_.isphere.md#optional-dictionary)
* [effect](_datamine_types_.isphere.md#effect)
* [id](_datamine_types_.isphere.md#id)
* [max_stack](_datamine_types_.isphere.md#max_stack)
* [name](_datamine_types_.isphere.md#name)
* [raid](_datamine_types_.isphere.md#raid)
* [rarity](_datamine_types_.isphere.md#rarity)
* [sell_price](_datamine_types_.isphere.md#sell_price)
* [sphere type](_datamine_types_.isphere.md#sphere-type)
* [sphere type text](_datamine_types_.isphere.md#sphere-type-text)
* [thumbnail](_datamine_types_.isphere.md#thumbnail)
* [type](_datamine_types_.isphere.md#type)
* [usage](_datamine_types_.isphere.md#optional-usage)

## Properties

### `Optional` associated_units

• **associated_units**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[associated_units](_datamine_types_.iitem.md#optional-associated_units)*

*Defined in [datamine-types.ts:506](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L506)*

**`description`** List of units that use this item

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[desc](_datamine_types_.iitem.md#desc)*

*Defined in [datamine-types.ts:479](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L479)*

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Inherited from [IItem](_datamine_types_.iitem.md).[dictionary](_datamine_types_.iitem.md#optional-dictionary)*

*Defined in [datamine-types.ts:498](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L498)*

**`author`** BluuArc

___

###  effect

• **effect**: *[PassiveEffect](../modules/_datamine_types_.md#passiveeffect)[]*

*Defined in [datamine-types.ts:519](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L519)*

___

###  id

• **id**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[id](_datamine_types_.iitem.md#id)*

*Defined in [datamine-types.ts:480](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L480)*

___

###  max_stack

• **max_stack**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[max_stack](_datamine_types_.iitem.md#max_stack)*

*Defined in [datamine-types.ts:481](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L481)*

___

###  name

• **name**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[name](_datamine_types_.iitem.md#name)*

*Defined in [datamine-types.ts:482](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L482)*

___

###  raid

• **raid**: *boolean*

*Inherited from [IItem](_datamine_types_.iitem.md).[raid](_datamine_types_.iitem.md#raid)*

*Defined in [datamine-types.ts:483](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L483)*

___

###  rarity

• **rarity**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[rarity](_datamine_types_.iitem.md#rarity)*

*Defined in [datamine-types.ts:484](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L484)*

___

###  sell_price

• **sell_price**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell_price](_datamine_types_.iitem.md#sell_price)*

*Defined in [datamine-types.ts:485](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L485)*

___

###  sphere type

• **sphere type**: *[SphereTypeId](../enums/_datamine_types_.spheretypeid.md)*

*Defined in [datamine-types.ts:520](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L520)*

___

###  sphere type text

• **sphere type text**: *[SphereTypeName](../enums/_datamine_types_.spheretypename.md)*

*Defined in [datamine-types.ts:521](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L521)*

___

###  thumbnail

• **thumbnail**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[thumbnail](_datamine_types_.iitem.md#thumbnail)*

*Defined in [datamine-types.ts:486](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L486)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[type](_datamine_types_.iitem.md#type)*

*Defined in [datamine-types.ts:487](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L487)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[usage](_datamine_types_.iitem.md#optional-usage)*

*Defined in [datamine-types.ts:493](https://github.com/BluuArc/bfmt-utilities/blob/8be7d96/src/datamine-types.ts#L493)*

**`description`** List of other items that use the current item somewhere in their recipe

**`author`** BluuArc
