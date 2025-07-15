const fs = require('fs');
const crypto = require('crypto');
const filesForCheck = require('./runner/configs/check_files').get();

async function audit() {
  const audit_checksum = {};
  
  async function getSum(fileName) {
    return new Promise(res => {
      fs.readFile(filesForCheck[fileName], function (err, testFile) {
        if (!err) {
          let text = testFile.toString();
          audit_checksum[fileName] = crypto.createHash('sha1')
            .update(text)
            .digest('hex');
        } else {
          console.error(`Error reading file ${fileName}:`, err);
        }
        res();
      });
    });
  }
  
  return Promise.all(Object.keys(filesForCheck).map(getSum))
    .then(() => ({ checksums: audit_checksum }))
    .catch(err => ({ checksums: Object.assign(err, audit_checksum) }));
}

module.exports = audit;