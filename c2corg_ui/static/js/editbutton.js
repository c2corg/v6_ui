goog.provide('app.EditButtonController');
goog.provide('app.editButtonDirective');

goog.require('app');


/**
 * This directive is used to display a button that, when clicked, opens
 * a document editing page if user's permissions fit, else opens the
 * authentication page.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.editButtonDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'url': '@appEditButtonUrl'
    },
    controller: 'AppEditButtonController',
    controllerAs: 'ebCtrl',
    bindToController: true,
    transclude: true,
    template: '<button class="btn btn-primary" type="button" ' +
        'ng-click="ebCtrl.redirect()">' +
        '<div ng-transclude></div></button>'
  };
};


app.module.directive('appEditButton', app.editButtonDirective);


/**
 * @param {app.Authentication} appAuthentication
 * @param {string} authUrl Base URL of the authentication page.
 * @constructor
 * @export
 * @ngInject
 */
app.EditButtonController = function(appAuthentication, authUrl) {

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


/**
 * @export
 */
app.EditButtonController.prototype.redirect = function() {
  if (this.auth_.isAuthenticated()) {
    window.location.href = this['url'];
  } else {
    window.location.href = '{authUrl}?from={redirect}'
        .replace('{authUrl}', this.authUrl_)
        .replace('{redirect}', encodeURIComponent(this['url']));
  }
};


app.module.controller('AppEditButtonController', app.EditButtonController);
