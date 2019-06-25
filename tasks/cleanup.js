// based on https://gist.github.com/geedew/cf66b81b0bcdab1f334b
const fs = require('fs');
const path = require('path');
const fancyLog = require('fancy-log');

const packageName = require('../package.json').name;

function stripPackageName (str = '') {
  const [initialPath, ...rest] = str.split(packageName);
  return path.join(...rest);
}

function deleteFolderRecursive (folderPath) {
  if (fs.existsSync(folderPath)) {
    fancyLog.info('deleting', stripPackageName(folderPath));
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.resolve(folderPath, file);
      fancyLog.info('deleting', stripPackageName(curPath));
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
      fancyLog.info('deleted', stripPackageName(curPath));
    });
    fs.rmdirSync(folderPath);
    fancyLog.info('deleted', stripPackageName(folderPath));
  }
}

function cleanBuild (done) {
  fancyLog.info("cleaning up dist folder");
  deleteFolderRecursive(path.resolve(__dirname, '../dist'));
  done();
}

function cleanDocs (done) {
  fancyLog.info("cleaning up docs folder");
  deleteFolderRecursive(path.resolve(__dirname, '../docs'));
  done();
}

module.exports = {
  cleanBuild,
  cleanDocs,
};
