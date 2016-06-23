goog.provide('app.capitalize');
goog.provide('app.trustAsHtmlFilter');

goog.require('app');


/**
 * @param {angular.$sce} $sce Angular sce service.
 * @export
 * @ngInject
 * @return {function(angular.$sce):string}
 */
app.trustAsHtmlFilter = function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
};

app.module.filter('appTrustAsHtml', app.trustAsHtmlFilter);


/**
 * @export
 * @return {function(string):string}
 */
app.capitalize = function() {
  return function(token) {
    return token.charAt(0).toUpperCase() + token.slice(1);
  };
};

app.module.filter('capitalize', app.capitalize);

