goog.provide('app.ProtectedUrlBtnController');
goog.provide('app.protectedUrlBtnDirective');

goog.require('app');


/**
 * @return {angular.Directive} directive for detailed views
 */
app.protectedUrlBtnDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppProtectedUrlBtnController',
    scope: {
      'url': '@'
    },
    link: function(scope, el, attr, ctrl) {
      el.click(function() {
        ctrl.redirectToProtectedUrl(scope.url);
      });
    }
  };
};

app.module.directive('protectedUrlBtn', app.protectedUrlBtnDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @export
 * @ngInject
 */
app.ProtectedUrlBtnController = function(appAuthentication, authUrl) {
  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

  /**
   * @type {string}
   * @private
   */
  this.authUrl_ = authUrl;
};

app.ProtectedUrlBtnController.prototype.redirectToProtectedUrl = function(url) {
  if (this.auth_.isAuthenticated()) {
    window.location.href = url;
  } else {
    window.location.href = '{authUrl}?from={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(url));
  }
};

app.module.controller('AppProtectedUrlBtnController', app.ProtectedUrlBtnController);
