goog.provide('app.capitalize');

goog.require('app');


/**
 * @return {function(string):string}
 */
app.capitalize = function() {
  return function(token) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  };
};

app.module.filter('capitalize', app.capitalize);
