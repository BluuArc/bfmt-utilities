const fancyLog = require('fancy-log');

function createLogger (prefix) {
	return {
		log: (...args) => fancyLog.info(`[${prefix}:LOG]`, ...args),
		error: (...args) => fancyLog.error(`[${prefix}:ERR]`, ...args),
	};
}

module.exports = {
	createLogger,
};
