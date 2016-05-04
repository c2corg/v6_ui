goog.provide('app.CardController');
goog.provide('app.cardDirective');

goog.require('app');
goog.require('app.utils');


/**
 * This directive is used to display a document card.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.cardDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppCardController',
    controllerAs: 'cardCtrl',
    bindToController: true,
    scope: {
      'doc': '=appCardDoc'
    },
    templateUrl: '/static/partials/card.html'
  };
};


app.module.directive('appCard', app.cardDirective);


/**
 * @constructor
 * @export
 * @ngInject
 */
app.CardController = function() {

  /**
   * @type{Object}
   * @private
   */
  this.doc_ = this['doc'];
};


/**
 * @export
 */
app.CardController.prototype.openCardPage = function() {
  window.location.href = app.utils.buildDocumentUrl(
    app.utils.getDoctype(this.doc_['type']),
    this.doc_['document_id'],
    this.doc_['locales'][0]['lang']);
};


app.module.controller('AppCardController', app.CardController);
