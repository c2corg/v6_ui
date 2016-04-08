goog.provide('app.AddAssociationController');
goog.provide('app.addAssociationDirective');

/** @suppress {extraRequire} */
goog.require('app.searchDirective');
goog.require('app.Api');


/**
 * @param {angular.$compile} $compile Angular compile service.
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.addAssociationDirective = function($compile) {

  var template = function(dataset) {
    return '<app-search app-select="addCtrl.associate(doc)" app-dataset="' + dataset + '"></app-search>'
  };

  return {
    restrict: 'E',
    controller: 'AppAddAssociationController',
    bindToController: {
      'parentId': '=',
      'addedDocuments': '=',
      'dataset' : '='
    },
    controllerAs: 'addCtrl',

    link: function(scope, element, attrs, ctrl) {
      element.html(template(ctrl.dataset));
      $compile(element.contents())(scope);
    }
  }
};

app.module.directive('appAddAssociation', app.addAssociationDirective);


/**
 * @constructor
 * @param {app.Api} appApi The API service
 * @ngInject
 */
app.AddAssociationController = function(appApi, $attrs) {
  /**
   * @type {number} // bound from directive
   * @export
   */
  this.parentId;

  /**
   * @private
   */
  this.api_ = appApi;


  this.dataset = $attrs['dataset'];
  /**
   * @type {Array.<appx.SearchDocument>}
   * @export
   */
  this.addedDocuments = [];
};


/**
 * @param {appx.SearchDocument} doc Document
 * @export
 */
app.AddAssociationController.prototype.associate = function(doc) {
  this.api_.associateDocument(this.parentId, doc).then(function() {
    this.addedDocuments.push(doc);
  }.bind(this));
};


app.module.controller('AppAddAssociationController', app.AddAssociationController);
