const { spawn } = require('child_process');

function createLogger (prefix) {
  return {
    log: (...args) => console.log(`${prefix}.LOG:`, ...args),
    error: (...args) => console.log(`${prefix}.ERROR:`, ...args),
  };
}

function handleSpawn (spawnInstance = spawn('npm', 'run build'), buildName, { onLog, onError, onClose }) {
  const logger = createLogger(buildName);
  spawnInstance.stdout.on('data', typeof onLog === 'function' ? data => onLog(data, logger) : data => logger.log(data));
  spawnInstance.stderr.on('data', typeof onError === 'function' ? data => onError(data, logger) : data => logger.error(data));
  spawnInstance.on('close', data => onClose(data, logger));
}

function buildWebpack (done) {
  const webpack = spawn('npm', ['run build:js']);
  handleSpawn(webpack, 'webpack', {
    onClose: (_, logger) => {
      logger.log('finished build');
      done();
    },
  });
}

module.exports = {
  buildWebpack,
};
