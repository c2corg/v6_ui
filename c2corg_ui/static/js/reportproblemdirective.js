goog.provide('app.ReportProblemController');
goog.provide('app.reportProblemDirective');
goog.provide('app.ReportProblemModalController');


/**
 * @ngInject
 * @return {angular.Directive} Directive Definition Object.
 */
app.reportProblemDirective = function() {
  return {
    restrict: 'A',
    controller: 'ReportProblemController as reportCtrl'
  }
};


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {angular.$compile} $compile Angular compile service.
 * @constructor
 * @ngInject
 */
app.ReportProblemController = function($uibModal, $compile, $scope) {

  /**
   * @type {Object} angular bootstrap modal
   * @private
   */
  this.modal_ = $uibModal;


  /**
   * @type {angular.$compile}
   * @private
   */
  this.compile_ = $compile;


  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;
};


/**
 * We have to use a secondary controller for the modal so that we can inject
 * uibModalInstance which is not available from the first level controller.
 * @param {Object} $uibModal modal from angular bootstrap
 * @constructor
 * @ngInject
 * @returns {app.ReportProblemModalController}
 */
app.ReportProblemModalController = function($uibModalInstance) {

  /**
   * @type {Object} $uibModalInstance angular bootstrap
   * @private
   */
  this.modalInstance_ = $uibModalInstance;
}
app.module.controller('ReportModalController', app.ReportProblemModalController);


/**
 * @export
 */
app.ReportProblemModalController.prototype.close = function() {
  this.modalInstance_.close();
  setTimeout(function() {
    $('.problem').show();
    $('.success').hide();
  }, 1000)
}


/**
 * @param {Object} problem {text, subject}
 * @export
 */
app.ReportProblemModalController.prototype.send = function(problem) {
  $('.success').show();
  $('.problem').hide();
}


/**
 * @export
 */
app.ReportProblemController.prototype.openModal = function() {
  var template = $('#report-problem').clone();
  this.modal_ .open({
    animation: true,
    template: this.compile_(template)(this.scope_),
    controller: 'ReportModalController as modalCtrl',
    size: 'sm'
  })
}

app.module.controller('ReportProblemController', app.ReportProblemController);

app.module.directive('reportProblem', app.reportProblemDirective);
