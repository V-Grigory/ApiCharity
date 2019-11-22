const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs');

const textPrepare = (v) => {
  let t = typeof v === 'object' ? JSON.stringify(v) : v;
  return new Date() + "\n" + t + "\n\n";
};

let logSuccess = (v) => {
  fs.appendFile(`${logPath}/success.log`, textPrepare(v), error => {
    if (error) {
      console.log('Error fs.appendFile in logger.logSuccess');
      throw error;
    }
  });
};

let logError = (v) => {
  fs.appendFile(`${logPath}/error.log`, textPrepare(v), error => {
    if (error) {
      console.log('Error fs.appendFile in logger.logError');
      throw error;
    }
  });
};

module.exports = logger = {
  logSuccess,
  logError
};
