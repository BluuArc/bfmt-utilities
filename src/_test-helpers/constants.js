const { UnitElement } = require("../datamine-types");

module.exports.KNOWN_ARBITRARY_ATTACKING_PROC_ID = '1';
module.exports.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID = '3';
module.exports.ARBITRARY_INVALID_PROC_ID = '-1';

module.exports.ARBITRARY_TARGET_AREA = 'arbitrary target area';
module.exports.ARBITRARY_TARGET_TYPE = 'arbitrary target type';
module.exports.ARBITRARY_EFFECT_DELAY = 'arbitrary effect delay';

module.exports.ARBITRARY_HIT_COUNT = 123;
module.exports.ARBITRARY_DAMAGE_DISTRIBUTION = 456;
module.exports.ARBITRARY_TURN_DURATION = 789;

module.exports.KNOWN_ARBITRARY_PASSIVE_ID = '1';
module.exports.ARBITRARY_INVALID_PASSIVE_ID = '-1';

module.exports.EFFECT_DELAY_KEY = 'effect delay time(ms)/frame';
module.exports.HIT_DMG_DISTRIBUTION_TOTAL_KEY = 'hit dmg% distribution (total)';
module.exports.EFFECT_DELAY_BUFF_PROP = 'effectDelay';

module.exports.ELEMENT_MAPPING = Object.freeze({
	0: 'all',
	1: UnitElement.Fire,
	2: UnitElement.Water,
	3: UnitElement.Earth,
	4: UnitElement.Thunder,
	5: UnitElement.Light,
	6: UnitElement.Dark,
});
