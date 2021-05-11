[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["items/getEffectsForItem"](_items_geteffectsforitem_.md)

# Module: "items/getEffectsForItem"

## Index

### Functions

* [getEffectsForItem](_items_geteffectsforitem_.md#geteffectsforitem)

## Functions

###  getEffectsForItem

▸ **getEffectsForItem**(`item`: [IConsumableItem](../interfaces/_datamine_types_.iconsumableitem.md) | [ISphere](../interfaces/_datamine_types_.isphere.md)): *([IProcEffect](../interfaces/_datamine_types_.iproceffect.md) | [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md) | [IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md) | [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md) | [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md))[]*

*Defined in [items/getEffectsForItem.ts:13](https://github.com/BluuArc/bfmt-utilities/blob/master/src/items/getEffectsForItem.ts#L13)*

**`description`** Get the effects of a given item.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`item` | [IConsumableItem](../interfaces/_datamine_types_.iconsumableitem.md) &#124; [ISphere](../interfaces/_datamine_types_.isphere.md) | Item to get the effects of, if any are present, |

**Returns:** *([IProcEffect](../interfaces/_datamine_types_.iproceffect.md) | [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md) | [IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md) | [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md) | [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md))[]*

Effects of the given item if they exist, an empty array otherwise.
