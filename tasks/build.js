const { dest } = require('gulp');
const path = require('path');
const { spawn } = require('child_process');
const fancyLog = require('fancy-log');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('../tsconfig.json');

const DIST_FOLDER = path.resolve(__dirname, '../dist/');

function getTranspiledTypeScript () {
  return tsProject.src()
    .pipe(tsProject());
}

function createLogger (prefix) {
  return {
    log: (...args) => fancyLog.info(`[${prefix}:LOG]`, ...args),
    error: (...args) => fancyLog.error(`[${prefix}:ERROR]`, ...args),
  };
}

function handleSpawn (spawnInstance = spawn('npm', 'run build'), buildName, { onLog, onError, onClose }) {
  const logger = createLogger(buildName);
  spawnInstance.stdout.on('data', typeof onLog === 'function'
    ? dataBuffer => onLog(dataBuffer.toString('utf8'), logger)
    : dataBuffer => logger.log(dataBuffer.toString('utf8')));
  spawnInstance.stderr.on('data', typeof onError === 'function'
    ? dataBuffer => onError(dataBuffer, logger)
    : dataBuffer => logger.error(dataBuffer));
  spawnInstance.on('close', dataBuffer => onClose(dataBuffer, logger));
}

function runNpmCommand (command = [], name, handlers) {
  const instance = spawn('npm.cmd', ['run'].concat(command));
  handleSpawn(instance, name, handlers);
}

function buildWebpack (done) {
  runNpmCommand('build:js', 'webpack', {
    onClose: (_, logger) => {
      logger.log('finished build');
      done();
    },
  });
}

function buildEcmaScript () {
  return getTranspiledTypeScript()
    .js.pipe(dest(DIST_FOLDER));
}

module.exports = {
  buildWebpack,
  buildEcmaScript,
};
