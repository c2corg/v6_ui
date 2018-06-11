/**
 * @module app.trustAsHtmlFilter
 */
import appBase from './index.js';

/**
 * @param {angular.$sce} $sce Angular sce service.
 * @ngInject
 * @return {function(angular.$sce):string}
 */
const exports = function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
};

appBase.module.filter('appTrustAsHtml', exports);


export default exports;
