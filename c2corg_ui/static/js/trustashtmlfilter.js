goog.provide('app.trustAsHtmlFilter');

goog.require('app');


/**
 * @param {angular.$sce} $sce Angular sce service.
 * @ngInject
 * @return {function(angular.$sce):string}
 */
app.trustAsHtmlFilter = function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
};

app.module.filter('appTrustAsHtml', app.trustAsHtmlFilter);
