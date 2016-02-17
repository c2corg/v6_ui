goog.provide('app.ViewDetailsController');
goog.provide('app.viewDetailsDirective');

goog.require('app');

/**
 * @return {angular.Directive} The directive specs.
 */
app.viewDetailsDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppViewDetailsController',
    controllerAs: 'detailsCtrl',
    bindToController: true,
    link: function(el, scope, attrs) {
      var s = app.constants.SCREEN;
      var elements = $('.tab, .accordion');
      // show tabs if they have been hidden on smartphone
      $(window).resize(function() {
        if (window.innerWidth > s.SMARTPHONE) {
          elements.show();
        }
      });
    }
  };
};

app.module.directive('appViewDetails', app.viewDetailsDirective);


/**
 * @param {Object} $uibModal modal from angular bootstrap
 * @constructor
 * @export
 * @ngInject
 */
app.ViewDetailsController = function($uibModal) {
  /**
   * @type {Object}
   * @private
   */
  this.modal_ = $uibModal;
}

/**
 * @param {string} selector
 * @export
 */
app.ViewDetailsController.prototype.openModal = function(selector) {
  var template = $(selector).clone();
  this.modal_.open({animation: true, size: 'lg', template: template});
};

/**
 * @param {Event} tab the clicked tab
 * @export
 */
app.ViewDetailsController.prototype.openTab = function(tab) {
  // only for smartphones
  if (window.innerWidth < 620) {
    if (tab.target) {
      $(tab.target).closest('.name-icon-value').find('.glyphicon-menu-right').toggleClass('rotate-arrow');
      $(tab.target).closest('.name-icon-value').find('.accordion').slideToggle();
    } else {
      $('.tab').hide();
      $(tab).show();
    }
  }
}
app.module.controller('AppViewDetailsController', app.ViewDetailsController);
