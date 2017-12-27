var async = require('async');
var fs = require('fs');
var nomnom = require('nomnom');
var Compiler = require('angular-gettext-tools').Compiler;

function main(inputs) {
  var compiler = new Compiler({format: 'json'});

  var contents = [];
  async.eachSeries(inputs,
    function(input, cb) {
      fs.readFile(input, {encoding: 'utf-8'}, function(err, content) {
        if (!err) {
          contents.push(content);
        }
        cb(err);
      });
    },
    function(err) {
      if (!err) {
        var output = compiler.convertPo(contents);
        process.stdout.write(output);
      }
    }
  );
}

// If running this module directly then call the main function.
if (require.main === module) {
  var options = nomnom.parse();
  var inputs = options._;
  main(inputs);
}

module.exports = main;
