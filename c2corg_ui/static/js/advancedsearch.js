goog.provide('app.AdvancedSearchController');
goog.provide('app.advancedSearchDirective');

goog.require('app');


/**
 * This directive is used to display the advanced search form and results.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.advancedSearchDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAdvancedSearchController',
    controllerAs: 'searchCtrl',
    bindToController: true,
    scope: true,
    templateUrl: '/static/partials/advancedsearch.html'
  };
};


app.module.directive('appAdvancedSearch', app.advancedSearchDirective);


/**
 * @param {angular.Attributes} $attrs Attributes.
 * @param {app.Api} appApi Api service.
 * @constructor
 * @export
 * @ngInject
 */
app.AdvancedSearchController = function($attrs, appApi) {

  /**
   * @type {string}
   * @private
   */
  this.doctype_ = $attrs['doctype'];

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {number}
   * @export
   */
  this.total = 0;

  /**
   * @type {Array.<Object>}
   * @export
   */
  this.documents = [];

  this.getResults_();
};


/**
 * @private
 */
app.AdvancedSearchController.prototype.getResults_ = function() {
  this.api_.listDocuments(this.doctype_).then(function(response) {
    if ('data' in response) {
      this.documents = response['data']['documents'];
      this.total = response['data']['total'];
    }
  }.bind(this));
};


app.module.controller('AppAdvancedSearchController', app.AdvancedSearchController);
