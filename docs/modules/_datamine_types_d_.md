> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["datamine-types.d"](_datamine_types_d_.md) /

# External module: "datamine-types.d"

### Index

#### Interfaces

* [BaseProcEffect](../interfaces/_datamine_types_d_.baseproceffect.md)

#### Type aliases

* [BraveBurst](_datamine_types_d_.md#braveburst)
* [BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)
* [DamageFramesEntry](_datamine_types_d_.md#damageframesentry)
* [ExtraSkill](_datamine_types_d_.md#extraskill)
* [ExtraSkillCondition](_datamine_types_d_.md#extraskillcondition)
* [LeaderSkill](_datamine_types_d_.md#leaderskill)
* [PassiveEffect](_datamine_types_d_.md#passiveeffect)
* [ProcEffect](_datamine_types_d_.md#proceffect)
* [SpEnhancementEffect](_datamine_types_d_.md#spenhancementeffect)
* [SpEnhancementEntry](_datamine_types_d_.md#spenhancemententry)
* [SpEnhancementSkill](_datamine_types_d_.md#spenhancementskill)
* [Unit](_datamine_types_d_.md#unit)
* [UnitArenaAiEntry](_datamine_types_d_.md#unitarenaaientry)
* [UnitMovemmentEntry](_datamine_types_d_.md#unitmovemmententry)
* [UnitStatsEntry](_datamine_types_d_.md#unitstatsentry)
* [UnknownPassiveEffect](_datamine_types_d_.md#unknownpassiveeffect)
* [UnknownProcEffect](_datamine_types_d_.md#unknownproceffect)

## Type aliases

###  BraveBurst

Ƭ **BraveBurst**: *object*

*Defined in [datamine-types.d.ts:60](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L60)*

#### Type declaration:

* **associated_units**? : *string[]*

* **damage frames**: *object & object[]*

* **desc**: *string*

* **drop check count**: *number*

* **id**: *string*

* **levels**: *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)[]*

* **name**: *string*

___

###  BurstLevelEntry

Ƭ **BurstLevelEntry**: *object*

*Defined in [datamine-types.d.ts:55](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L55)*

#### Type declaration:

* **bc cost**: *number*

* **effects**: *`Array<BaseProcEffect & object | BaseProcEffect & object & object>`*

___

###  DamageFramesEntry

Ƭ **DamageFramesEntry**: *object*

*Defined in [datamine-types.d.ts:48](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L48)*

#### Type declaration:

* **effect delay time(ms)/frame**: *string*

* **frame times**: *number[]*

* **hit dmg% distribution**: *number[]*

* **hit dmg% distribution total**: *number*

___

###  ExtraSkill

Ƭ **ExtraSkill**: *object*

*Defined in [datamine-types.d.ts:77](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L77)*

#### Type declaration:

* **desc**: *string*

* **effects**: *`Array<object | object & object>`*

* **id**: *string*

* **name**: *string*

* **rarity**? : *undefined | string*

* **target**: *string*

___

###  ExtraSkillCondition

Ƭ **ExtraSkillCondition**: *object*

*Defined in [datamine-types.d.ts:70](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L70)*

#### Type declaration:

* **item required**? : *string[]*

* **sphere category required**? : *undefined | string*

* **sphere category required (raw)**? : *undefined | string*

* **unit required**? : *object[]*

___

###  LeaderSkill

Ƭ **LeaderSkill**: *object*

*Defined in [datamine-types.d.ts:114](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L114)*

#### Type declaration:

* **desc**: *string*

* **effects**: *`Array<PassiveEffect | UnknownPassiveEffect>`*

* **id**: *string*

* **name**: *string*

___

###  PassiveEffect

Ƭ **PassiveEffect**: *object*

*Defined in [datamine-types.d.ts:38](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L38)*

#### Type declaration:

● \[■&#x60; key&#x60;: *string*\]: any

* **passive id**: *string*

___

###  ProcEffect

Ƭ **ProcEffect**: *[BaseProcEffect](../interfaces/_datamine_types_d_.baseproceffect.md) & object*

*Defined in [datamine-types.d.ts:27](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L27)*

___

###  SpEnhancementEffect

Ƭ **SpEnhancementEffect**: *object*

*Defined in [datamine-types.d.ts:107](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L107)*

#### Type declaration:

* **add to bb**? : *[ProcEffect](_datamine_types_d_.md#proceffect) | [UnknownProcEffect](_datamine_types_d_.md#unknownproceffect)*

* **add to sbb**? : *[ProcEffect](_datamine_types_d_.md#proceffect) | [UnknownProcEffect](_datamine_types_d_.md#unknownproceffect)*

* **add to ubb**? : *[ProcEffect](_datamine_types_d_.md#proceffect) | [UnknownProcEffect](_datamine_types_d_.md#unknownproceffect)*

* **passive**? : *[PassiveEffect](_datamine_types_d_.md#passiveeffect) | [UnknownPassiveEffect](_datamine_types_d_.md#unknownpassiveeffect)*

___

###  SpEnhancementEntry

Ƭ **SpEnhancementEntry**: *object*

*Defined in [datamine-types.d.ts:89](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L89)*

#### Type declaration:

* **category**: *string*

* **dependency**? : *undefined | string*

* **dependency comment**? : *undefined | string*

* **id**: *string*

* **skill**: *[SpEnhancementSkill](_datamine_types_d_.md#spenhancementskill)*

___

###  SpEnhancementSkill

Ƭ **SpEnhancementSkill**: *object*

*Defined in [datamine-types.d.ts:97](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L97)*

#### Type declaration:

* **bp**: *number*

* **desc**: *string*

* **effects**: *[SpEnhancementEffect](_datamine_types_d_.md#spenhancementeffect)[]*

* **id**: *string*

* **level**: *number*

* **name**: *string*

* **series**: *string*

___

###  Unit

Ƭ **Unit**: *object*

*Defined in [datamine-types.d.ts:121](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L121)*

#### Type declaration:

* **ai**? : *[UnitArenaAiEntry](_datamine_types_d_.md#unitarenaaientry)[]*

* **animations**? : *undefined | object*

* **bb**? : *[BraveBurst](_datamine_types_d_.md#braveburst)*

* **category**? : *undefined | number*

* **cost**: *number*

* **damage frames**: *[DamageFramesEntry](_datamine_types_d_.md#damageframesentry)*

* **dictionary**? : *undefined | object*

* **drop check count**: *number*

* **element**: *"fire" | "water" | "earth" | "thunder" | "light" | "dark"*

* **exp_pattern**: *number*

* **extra skill**? : *[ExtraSkill](_datamine_types_d_.md#extraskill)*

* **feskills**: *[SpEnhancementEntry](_datamine_types_d_.md#spenhancemententry)[]*

* **gender**: *"male" | "female" | "other"*

* **getting type**: *string*

* **guide_id**: *number*

* **id**: *number*

* **imp**(): *object*

  * **max atk**: *string*

  * **max def**: *string*

  * **max hp**: *string*

  * **max rec**: *string*

* **kind**: *string*

* **lord damage range**: *string*

* **movement**(): *object*

  * **attack**: *[UnitMovemmentEntry](_datamine_types_d_.md#unitmovemmententry)*

  * **skill**? : *[UnitMovemmentEntry](_datamine_types_d_.md#unitmovemmententry)*

* **name**: *string*

* **overdrive stats**(): *object*

  * **atk%**: *number*

  * **def%**: *number*

  * **rec%**: *number*

* **rarity**: *number*

* **sbb**? : *[BraveBurst](_datamine_types_d_.md#braveburst)*

* **sell caution**: *boolean*

* **stats**(): *object*

  * **_base**: *[UnitStatsEntry](_datamine_types_d_.md#unitstatsentry)*

  * **_lord**: *[UnitStatsEntry](_datamine_types_d_.md#unitstatsentry)*

  * **anima**(): *object*

    * **atk**: *number*

    * **def**: *number*

    * **hp max**: *number*

    * **hp min**: *number*

    * **rec max**: *number*

    * **rec min**: *number*

  * **breaker**(): *object*

    * **atk max**: *number*

    * **atk min**: *number*

    * **def max**: *number*

    * **def min**: *number*

    * **hp**: *number*

    * **rec**: *number*

  * **guardian**(): *object*

    * **atk**: *number*

    * **def max**: *number*

    * **def min**: *number*

    * **hp**: *number*

    * **rec max**: *number*

    * **rec min**: *number*

  * **oracle**(): *object*

    * **atk**: *number*

    * **def**: *number*

    * **hp max**: *number*

    * **hp min**: *number*

    * **rec max**: *number*

    * **rec min**: *number*

* **ubb**? : *[BraveBurst](_datamine_types_d_.md#braveburst)*

___

###  UnitArenaAiEntry

Ƭ **UnitArenaAiEntry**: *object*

*Defined in [datamine-types.d.ts:1](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L1)*

#### Type declaration:

* **action**: *string*

* **chance%**: *number*

* **target conditions**: *string*

* **target type**: *string*

___

###  UnitMovemmentEntry

Ƭ **UnitMovemmentEntry**: *object*

*Defined in [datamine-types.d.ts:8](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L8)*

#### Type declaration:

* **move speed**: *number*

* **move speed type**: *string*

* **move type**: *string*

___

###  UnitStatsEntry

Ƭ **UnitStatsEntry**: *object*

*Defined in [datamine-types.d.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L14)*

#### Type declaration:

* **atk**: *number*

* **def**: *number*

* **hp**: *number*

* **rec**: *number*

___

###  UnknownPassiveEffect

Ƭ **UnknownPassiveEffect**: *object*

*Defined in [datamine-types.d.ts:43](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L43)*

#### Type declaration:

* **unknown passive id**: *string*

* **unknown passive params**: *string*

___

###  UnknownProcEffect

Ƭ **UnknownProcEffect**: *[BaseProcEffect](../interfaces/_datamine_types_d_.baseproceffect.md) & object*

*Defined in [datamine-types.d.ts:32](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/datamine-types.d.ts#L32)*

___