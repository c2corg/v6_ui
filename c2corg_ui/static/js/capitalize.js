/**
 * @module app.capitalize
 */
import appBase from './index.js';

/**
 * @return {function(string):string}
 */
const exports = function() {
  return function(token) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  };
};

appBase.module.filter('capitalize', exports);


export default exports;
