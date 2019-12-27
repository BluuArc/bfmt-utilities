[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["items"](_items_.md)

# External module: "items"

## Index

### Functions

* [getEffectsForItem](_items_.md#geteffectsforitem)
* [getItemImageUrl](_items_.md#getitemimageurl)

## Functions

###  getEffectsForItem

▸ **getEffectsForItem**(`item`: [IConsumableItem](../interfaces/_datamine_types_.iconsumableitem.md) | [ISphere](../interfaces/_datamine_types_.isphere.md)): *[IProcEffect](../interfaces/_datamine_types_.iproceffect.md) | [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md) | [IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md) | [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md) | [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md)[]*

*Defined in [items.ts:8](https://github.com/BluuArc/bfmt-utilities/blob/9e9d9b5/src/items.ts#L8)*

**`description`** Get the effects of a given item

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`item` | [IConsumableItem](../interfaces/_datamine_types_.iconsumableitem.md) &#124; [ISphere](../interfaces/_datamine_types_.isphere.md) | item to get the effects of, if any are present |

**Returns:** *[IProcEffect](../interfaces/_datamine_types_.iproceffect.md) | [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md) | [IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md) | [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md) | [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md)[]*

the effects of the given item if they exist, an empty array otherwise

___

###  getItemImageUrl

▸ **getItemImageUrl**(`baseContentUrl`: string, `fileName`: string): *string*

*Defined in [items.ts:34](https://github.com/BluuArc/bfmt-utilities/blob/9e9d9b5/src/items.ts#L34)*

**`description`** Generate a URL to display the image with the given item thumbnail filename

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`baseContentUrl` | string | Base URL of the server |
`fileName` | string | name of the file that represents the thumbnail image for a given item |

**Returns:** *string*

generated URL based on the given content URL and file name
