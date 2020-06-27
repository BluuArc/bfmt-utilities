[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](_datamine_types_.md)

# Module: "datamine-types"

## Index

### Enumerations

* [ArenaCondition](../enums/_datamine_types_.arenacondition.md)
* [ItemType](../enums/_datamine_types_.itemtype.md)
* [MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)
* [MoveType](../enums/_datamine_types_.movetype.md)
* [SpCategoryId](../enums/_datamine_types_.spcategoryid.md)
* [SpCategoryName](../enums/_datamine_types_.spcategoryname.md)
* [SpPassiveType](../enums/_datamine_types_.sppassivetype.md)
* [SphereTypeId](../enums/_datamine_types_.spheretypeid.md)
* [SphereTypeName](../enums/_datamine_types_.spheretypename.md)
* [TargetArea](../enums/_datamine_types_.targetarea.md)
* [TargetAreaShorthand](../enums/_datamine_types_.targetareashorthand.md)
* [TargetType](../enums/_datamine_types_.targettype.md)
* [UnitAnimationKey](../enums/_datamine_types_.unitanimationkey.md)
* [UnitElement](../enums/_datamine_types_.unitelement.md)
* [UnitGender](../enums/_datamine_types_.unitgender.md)
* [UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)
* [UnitKind](../enums/_datamine_types_.unitkind.md)
* [UnitType](../enums/_datamine_types_.unittype.md)

### Interfaces

* [IAttackInfo](../interfaces/_datamine_types_.iattackinfo.md)
* [IBaseProcEffect](../interfaces/_datamine_types_.ibaseproceffect.md)
* [IBfmtMetadata](../interfaces/_datamine_types_.ibfmtmetadata.md)
* [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md)
* [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)
* [IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md)
* [IConsumableItem](../interfaces/_datamine_types_.iconsumableitem.md)
* [IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)
* [IEvolutionMaterial](../interfaces/_datamine_types_.ievolutionmaterial.md)
* [IExtraSkill](../interfaces/_datamine_types_.iextraskill.md)
* [IExtraSkillItemCondition](../interfaces/_datamine_types_.iextraskillitemcondition.md)
* [IExtraSkillPassiveEffect](../interfaces/_datamine_types_.iextraskillpassiveeffect.md)
* [IExtraSkillSphereTypeCondition](../interfaces/_datamine_types_.iextraskillspheretypecondition.md)
* [IExtraSkillUnitCondition](../interfaces/_datamine_types_.iextraskillunitcondition.md)
* [IExtraSkillUnknownCondition](../interfaces/_datamine_types_.iextraskillunknowncondition.md)
* [IExtraSkillUnknownPassiveEffect](../interfaces/_datamine_types_.iextraskillunknownpassiveeffect.md)
* [IGemClearBonus](../interfaces/_datamine_types_.igemclearbonus.md)
* [IItem](../interfaces/_datamine_types_.iitem.md)
* [IItemClearBonus](../interfaces/_datamine_types_.iitemclearbonus.md)
* [IItemRecipe](../interfaces/_datamine_types_.iitemrecipe.md)
* [IItemRecipeMaterial](../interfaces/_datamine_types_.iitemrecipematerial.md)
* [IItemUsageEntry](../interfaces/_datamine_types_.iitemusageentry.md)
* [IKarmaClearBonus](../interfaces/_datamine_types_.ikarmaclearbonus.md)
* [ILeaderSkill](../interfaces/_datamine_types_.ileaderskill.md)
* [IMimicInfo](../interfaces/_datamine_types_.imimicinfo.md)
* [IMission](../interfaces/_datamine_types_.imission.md)
* [IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md)
* [IProcEffect](../interfaces/_datamine_types_.iproceffect.md)
* [ISpEnhancementEffectWrapper](../interfaces/_datamine_types_.ispenhancementeffectwrapper.md)
* [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)
* [ISpEnhancementPassiveEffect](../interfaces/_datamine_types_.ispenhancementpassiveeffect.md)
* [ISpEnhancementSkill](../interfaces/_datamine_types_.ispenhancementskill.md)
* [ISpEnhancementTriggeredEffect](../interfaces/_datamine_types_.ispenhancementtriggeredeffect.md)
* [ISpEnhancementUnknownPassiveEffect](../interfaces/_datamine_types_.ispenhancementunknownpassiveeffect.md)
* [ISphere](../interfaces/_datamine_types_.isphere.md)
* [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md)
* [IUnit](../interfaces/_datamine_types_.iunit.md)
* [IUnitAnimationEntry](../interfaces/_datamine_types_.iunitanimationentry.md)
* [IUnitArenaAiEntry](../interfaces/_datamine_types_.iunitarenaaientry.md)
* [IUnitBond](../interfaces/_datamine_types_.iunitbond.md)
* [IUnitClearBonus](../interfaces/_datamine_types_.iunitclearbonus.md)
* [IUnitMovementEntry](../interfaces/_datamine_types_.iunitmovemententry.md)
* [IUnitStatsEntry](../interfaces/_datamine_types_.iunitstatsentry.md)
* [IUnknownClearBonus](../interfaces/_datamine_types_.iunknownclearbonus.md)
* [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md)
* [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md)
* [IZelClearBonus](../interfaces/_datamine_types_.izelclearbonus.md)

### Type aliases

* [ClearBonus](_datamine_types_.md#clearbonus)
* [ExtraSkillCondition](_datamine_types_.md#extraskillcondition)
* [ExtraSkillPassiveEffect](_datamine_types_.md#extraskillpassiveeffect)
* [PassiveEffect](_datamine_types_.md#passiveeffect)
* [ProcEffect](_datamine_types_.md#proceffect)
* [SpEnhancementEffect](_datamine_types_.md#spenhancementeffect)

### Object literals

* [MimicMonsterGroupMapping](_datamine_types_.md#const-mimicmonstergroupmapping)

## Type aliases

###  ClearBonus

Ƭ **ClearBonus**: *[IGemClearBonus](../interfaces/_datamine_types_.igemclearbonus.md) | [IUnitClearBonus](../interfaces/_datamine_types_.iunitclearbonus.md) | [IItemClearBonus](../interfaces/_datamine_types_.iitemclearbonus.md) | [IZelClearBonus](../interfaces/_datamine_types_.izelclearbonus.md) | [IKarmaClearBonus](../interfaces/_datamine_types_.ikarmaclearbonus.md) | [IUnknownClearBonus](../interfaces/_datamine_types_.iunknownclearbonus.md)*

*Defined in [datamine-types.ts:808](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L808)*

___

###  ExtraSkillCondition

Ƭ **ExtraSkillCondition**: *[IExtraSkillItemCondition](../interfaces/_datamine_types_.iextraskillitemcondition.md) | [IExtraSkillSphereTypeCondition](../interfaces/_datamine_types_.iextraskillspheretypecondition.md) | [IExtraSkillUnitCondition](../interfaces/_datamine_types_.iextraskillunitcondition.md) | [IExtraSkillUnknownCondition](../interfaces/_datamine_types_.iextraskillunknowncondition.md)*

*Defined in [datamine-types.ts:241](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L241)*

___

###  ExtraSkillPassiveEffect

Ƭ **ExtraSkillPassiveEffect**: *[IExtraSkillPassiveEffect](../interfaces/_datamine_types_.iextraskillpassiveeffect.md) | [IExtraSkillUnknownPassiveEffect](../interfaces/_datamine_types_.iextraskillunknownpassiveeffect.md)*

*Defined in [datamine-types.ts:257](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L257)*

___

###  PassiveEffect

Ƭ **PassiveEffect**: *[IPassiveEffect](../interfaces/_datamine_types_.ipassiveeffect.md) | [IUnknownPassiveEffect](../interfaces/_datamine_types_.iunknownpassiveeffect.md) | [ITriggeredEffect](../interfaces/_datamine_types_.itriggeredeffect.md)*

*Defined in [datamine-types.ts:116](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L116)*

___

###  ProcEffect

Ƭ **ProcEffect**: *[IProcEffect](../interfaces/_datamine_types_.iproceffect.md) | [IUnknownProcEffect](../interfaces/_datamine_types_.iunknownproceffect.md)*

*Defined in [datamine-types.ts:87](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L87)*

___

###  SpEnhancementEffect

Ƭ **SpEnhancementEffect**: *[ISpEnhancementPassiveEffect](../interfaces/_datamine_types_.ispenhancementpassiveeffect.md) | [ISpEnhancementUnknownPassiveEffect](../interfaces/_datamine_types_.ispenhancementunknownpassiveeffect.md) | [ISpEnhancementTriggeredEffect](../interfaces/_datamine_types_.ispenhancementtriggeredeffect.md)*

*Defined in [datamine-types.ts:138](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L138)*

## Object literals

### `Const` MimicMonsterGroupMapping

### ▪ **MimicMonsterGroupMapping**: *object*

*Defined in [datamine-types.ts:745](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L745)*

**`description`** Known values for the monster groups used in [IMimicInfo](../interfaces/_datamine_types_.imimicinfo.md).

###  1000

• **1000**: *[MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)* = MimicUnitIds.Mimic

*Defined in [datamine-types.ts:746](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L746)*

###  1100

• **1100**: *[MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)* = MimicUnitIds.BatMimic

*Defined in [datamine-types.ts:747](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L747)*

###  1101

• **1101**: *[MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)* = MimicUnitIds.BatMimic

*Defined in [datamine-types.ts:748](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L748)*

###  1200

• **1200**: *[MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)* = MimicUnitIds.DragonMimic

*Defined in [datamine-types.ts:749](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L749)*

###  1300

• **1300**: *[MimicUnitIds](../enums/_datamine_types_.mimicunitids.md)* = MimicUnitIds.MetalMimic

*Defined in [datamine-types.ts:750](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L750)*
