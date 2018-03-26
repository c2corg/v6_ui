const async = require('async');
const fs = require('fs');
const nomnom = require('nomnom');
const Extractor = require('angular-gettext-tools').Extractor;

function main(inputs) {
  const extractor = new Extractor({
    lineNumbers: false
  });

  async.eachSeries(inputs,
    (input, cb) => {
      fs.readFile(input, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          extractor.parse(input, data);
        }
        cb(err);
      });
    },
    err => {
      if (err) {
        throw new Error(err);
      }
      process.stdout.write(extractor.toString());
    }
  );
}

// If running this module directly then call the main function.
if (require.main === module) {
  const options = nomnom.parse();
  const inputs = options._;
  main(inputs);
}

module.exports = main;
