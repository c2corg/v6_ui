const async = require('async');
const fs = require('fs');
const nomnom = require('nomnom');
const Compiler = require('angular-gettext-tools').Compiler;

function main(inputs) {
  const compiler = new Compiler({format: 'json'});

  const contents = [];
  async.eachSeries(inputs,
    (input, cb) => {
      fs.readFile(input, {encoding: 'utf-8'}, (err, content) => {
        if (!err) {
          contents.push(content);
        }
        cb(err);
      });
    },
    err=> {
      if (!err) {
        const output = compiler.convertPo(contents);
        process.stdout.write(output);
      }
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
