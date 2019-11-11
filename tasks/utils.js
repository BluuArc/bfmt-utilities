const fancyLog = require('fancy-log');
const { spawn } = require('child_process');

function createLogger (prefix) {
	return {
		log: (...args) => fancyLog.info(`[${prefix}:LOG]`, ...args),
		error: (...args) => fancyLog.error(`[${prefix}:ERR]`, ...args),
	};
}

function getBufferString (str) {
	try {
		return str.toString('utf8');
	} catch (err) {
		return str;
	}
}

function handleSpawn (spawnInstance = spawn('npm', ['run' , 'build']), buildName, { onLog, onError } = {}) {
	const logger = createLogger(buildName);
	return new Promise((fulfill, reject) => {
		const errorStrings = [];
		spawnInstance.stdout.on('data', typeof onLog === 'function'
			? dataBuffer => onLog(getBufferString(dataBuffer), logger)
			: dataBuffer => logger.log(getBufferString(dataBuffer)));
		spawnInstance.stderr.on('data', data => {
			errorStrings.push(data);
			if (typeof onError === 'function') {
				onError(getBufferString(data), logger);
			} else {
				logger.error(getBufferString(data));
			}
		});
		spawnInstance.on('close', (...args) => {
			if (errorStrings.length > 0) {
				reject(errorStrings);
			} else {
				fulfill(logger, ...args);
			}
		});
	});
}

function runNpmCommand (command = [], name, handlers = {}) {
	const instance = spawn('npm.cmd', ['run'].concat(command));
	return handleSpawn(instance, name, handlers);
}

module.exports = {
	createLogger,
	runNpmCommand,
};
