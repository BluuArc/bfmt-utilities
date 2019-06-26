const { src, dest } = require('gulp');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const fancyLog = require('fancy-log');
const through2 = require('through2');

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

function getBufferString (str) {
  try {
    return str.toString('utf8');
  } catch {
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

function buildWebpack (done) {
  runNpmCommand('build:js', 'webpack')
    .then(logger => {
      logger.log('finished build');
      done();
    });
}

function buildTypeScript () {
  if (!fs.existsSync(DIST_FOLDER)) {
    fs.mkdirSync(DIST_FOLDER);
  }

  const DATAMINE_TYPE_DESTINATION = path.resolve(DIST_FOLDER, './datamine-types.d.ts');
  if (fs.existsSync(DATAMINE_TYPE_DESTINATION)) {
    fs.unlinkSync(DATAMINE_TYPE_DESTINATION);
  }

  fs.copyFileSync(path.resolve(__dirname, '../src/datamine-types.d.ts'), DATAMINE_TYPE_DESTINATION);
  return getTranspiledTypeScript()
    .js.pipe(dest(DIST_FOLDER));
}

function buildDocs (done) {
  const DOCS_PATH = path.resolve(__dirname, '../docs/');
  if (!fs.existsSync(DOCS_PATH)) {
    fs.mkdirSync(DOCS_PATH);
  }

  // build docs in parallel
  const buildPromises = [];
  src(path.resolve(DIST_FOLDER, './**.js'))
    .pipe(through2.obj((file, enc, done) => {
      const splitPath = file.path.split(path.sep);
      const [filename, ...extension] = splitPath[splitPath.length - 1].split('.');
      if (filename !== 'index') {
        fancyLog.info(`generating docs for ${filename}`);
        const instance = spawn('node.exe', [path.resolve(__dirname, '../node_modules/documentation/bin/documentation.js'), 'build', file.path, '--shallow', '-f', 'md', '-o', path.resolve(__dirname, '../docs/', `${filename}.md`)]);
        const buildPromise = handleSpawn(instance, `documentation:${filename}`)
          .then(() => {
            fancyLog.info(`built ${filename}.md`);
          });
        buildPromises.push(buildPromise);
        done(null, file);
      } else {
        done(null, file);
      }
    }));

  Promise.all(buildPromises).then(() => done());
}

module.exports = {
  buildWebpack,
  buildTypeScript,
  buildDocs,
};
