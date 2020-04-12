# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - YYYY-MM-DD
### ➕ Additions
* sp-enhancements: Add methods around parsing SP Codes and processing SP Enhancement Entries.
	* `spIndexToCode`
	* `spCodeToIndex`
	* `getSpEntryId`
	* `getSpEntryWithId`
	* `getAllDependenciesForSpEntry`
	* `getAllEntriesThatDependOnSpEntry`

### Δ Changes
* Build: Update dependencies to stable latest versions; no changes to functionality as a result of this.
* Docs: Minor doc config update to include package version in the header.
* Update ESLint rules to enforce triple equal comparisons.

## [0.4.0] - 2020-02-23
### ⚠ Breaking Changes
* Build: Rename tasks in package.json to use colon notation over dash notation
* datamine-types: Rename `IExtraSkill.is` to `IExtraSkill.id` (as it is supposed to be the ID property)

### ➕ Additions
* Docs: Add this changelog file to better document changes
* datamine-types: Add `IItem.recipe` definition
* datamine-types: Expose the contents of datamine-types through `bfmtUtilities.datamineTypes`
* sp-enhancements: Add `getSpCategoryName` method.

### Δ Changes
* Build: Replace `gulp-run` with `gulp-execa` in build process
* Docs: Move some options from `build:docs` task into `typedoc.config.js`
* Docs: Change `gitRevision` to `master` branch instead of last commit

## [0.3.1] - 2019-12-27
### ➕ Additions
* Add missing documentation for various methods in the following APIs
	* buffs
	* bursts
	* extra-skills
	* items
	* leader-skills
	* sp-enhancements
	* units

### Δ Changes
* Update ESLint rules to require JSDoc comments

## [0.3.0] - 2019-12-24
### ➕ Additions
* items: `getImageUrl` method
* units: initial API
	* `IUnitImageFileNames` interface
	* `getUnitImageFileNames` method
	* `getUnitImageUrl` method

## [0.2.0] - 2019-12-19
### ➕ Additions
* examples/vanilla-browser: Add readme file; updated example to read effect names
* examples/vanilla-nodejs: Add reame file; updated example to read effect names
* buffs: additions to API
	* `getMetadataForProc` method
	* `getMetadataForPassive` method
	* `getNameForProc` method
	* `getNameForPassive` method
	* `isProcEffect` method
	* `isPassiveEffect` method
	* documentation for `getEffectId` method
	* `getEffectName` method

### Δ Changes
* buffs: `isAttackingProcId` calls `getMetadataForProc`

## [0.1.1] - 2019-12-17
### ➕ Additions
* README: Add link to documentation and references to usage examples
* examples: Add 2 usage examples for the module: one for within the browser (`vanilla-browser`) and within a Node.js context (`vanilla-nodejs`)
* datamine-types: Add `leader skill` property to `IUnit` interface

## [0.1.0] - 2019-12-10
### ⚠ Breaking Changes
* datamine-types: Renam `ISpEnhancementEffect` to `ISpEnhancementEffectWrapper`
* datamine-types: Fix typo `eveolution` -> `evolution` in `ISpEnhancementSkill.dictionary` definition

### ➕ Additions
* constants: `KNOWN_PASSIVE_ID` enum with `TriggeredEffect = '66'`
* datamine-types: more type definitions
	* `ITriggeredEffect` interface
	* `SpPassiveType` enum
	* `ISpEnhancementPassiveEffect` interface
	* `ISpEnhandementUnknownPassiveEffect` interface
	* `ISpEnhancementTriggeredEffect` interface
	* `SpEnhancementEffect` type
	* more properties to `ISpEnhancementEffectWrapper` interface
	* `ItemType` enum
	* `IItemRecipeMaterial` interface
	* `IItemRecipe` interface
	* `IItemUsageEntry` interface
	* `IItem` interface
	* `IConsumableItem` interface
	* `ISphere` interface
* extra-skills: initial API
	* `getEffectsForExtraSkill` method
* items: initial API
	* `getEffectsForItem` method
* leader-skills: initial API
	* `getEffectsForLeaderSkill` method
* sp-enhancements: initial API
	* `getEffectsForSpEnhancement` method
* version: initial generated version file; will be autoupdated with every build

### Δ Changes
* datamine-types: `PassiveEffect` now includes `ITriggeredEffect` in addition to `IPassiveEffect` and `IUnknownPassiveEffect`

## [0.0.1] - 2019-12-05
### ➕ Additions
* buff-metadata: Initial buff metadata definitions
* buffs: Initial API
	* `isAttackinProcId` method
	* `IProcEffectFrameComposite` interface
	* `combineEffectsAndDamageFrames` method
	* `getEffectId` method
* bursts: Initial API
	* `getLevelEntryForBurst` method
	* `getEffectsForBurst` method
	* `getExtraAttackDamageFramesEntry` method
* constants: Initial `KNOWN_PROC_ID` enum with `BurstHeal = '2'`
* datamine-types: Initial datamine type definitions
	* `ArenaCondition` enum
	* `IUnitArenaAIEntry` interface
	* `MoveType` enum
	* `IUnitMovementEntry` interface
	* `IUnitStatsEnttry` interface
	* `TargetArea` enum
	* `TargetType` enum
	* `IBaseProcEffect` interface
	* `IProcEffect` interface
	* `IUnknownProcEffect` interface
	* `ProcEffect` type
	* `IPassiveEffect` interface
	* `IUnknownPassiveEffect` interface
	* `PassiveEffect` type
	* `IDamageFramesEntry` interface
	* `IBurstLevelEntry` interface
	* `IBurstDamageFramesEntry` interface
	* `IBraveBurst` interface
	* `SphereTypeName` enum
	* `SphereTypeId` enum
	* `IExtraSkillCondition` interface
	* `IExtraSkillPassiveEffect` interface
	* `IExtraSkillUnknownPassiveEffect` interface
	* `ExtraSkillPassiveEffect` interface
	* `IExtraSkill` interface
	* `SpCategoryName` enum
	* `SpCategoryId` enum
	* `ISpEnhancementEffect` interface
	* `ISpEnhancementSkill` interface
	* `ISpEnhancementEntry` interface
	* `ILeaderSkill` interface
	* `UnitAnimationKey` enum
	* `IUnitAnimationEntry` interface
	* `UnitElement` enum
	* `UnitGender` enum
	* `UnitGettingType` enum
	* `UnitKind` enum
	* `IUnit` interface

[Unreleased]: https://github.com/BluuArc/bfmt-utilities/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/BluuArc/bfmt-utilities/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/BluuArc/bfmt-utilities/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/BluuArc/bfmt-utilities/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/BluuArc/bfmt-utilities/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/BluuArc/bfmt-utilities/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/BluuArc/bfmt-utilities/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/BluuArc/bfmt-utilities/releases/tag/v0.0.1
