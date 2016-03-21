goog.provide('app.ViewDetailsController');
goog.provide('app.viewDetailsDirective');

goog.require('app');

/**
 * @return {angular.Directive} directive for detailed views
 */
app.viewDetailsDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppViewDetailsController',
    controllerAs: 'detailsCtrl',
    bindToController: true,
    link: function(el, scope, attrs, ctrl) {
      var s = app.constants.SCREEN;
      var notPhone  = window.matchMedia('(max-width: ' + s.SMARTPHONE + 'px)');
      var onPhone  = window.matchMedia('(min-width: ' + (s.SMARTPHONE + 1) + 'px)');

      $('.location-static').css({top: $('app-map').offset().top + 40});

      // show tabs if they have been hidden on smartphone and inversely
      onPhone.addListener(function(mql) {
        if (mql.matches) {
          $('.tab, .accordion').show();
        }
      })

      // show description tab by default or selected tab
      notPhone.addListener(function(mql) {
        if (mql.matches) {
          $('.location-static').css({top: $('app-map').offset().top + 40});
          $('.tab').hide();
          if (!ctrl.selected) {
            $('.description.tab').show();
          } else {
            ctrl.selected.show();
          }
        }
      });
    }
  };
};

app.module.directive('appViewDetails', app.viewDetailsDirective);


/**
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @constructor
 * @export
 * @ngInject
 */
app.ViewDetailsController = function($uibModal, $compile, $scope) {
  /**
   * @type {Object}
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

}

/**
 * @param {string} selector
 * @export
 */
app.ViewDetailsController.prototype.openModal = function(selector) {
  var template = $(selector).clone();
  this.modal_.open({animation: true, size: 'lg', template: this.compile_(template)(this.scope_)});
};


/**
 * @param {Event} tab the clicked tab
 * @export
 */
app.ViewDetailsController.prototype.openTab = function(tab) {
  var s = app.constants.SCREEN;

  // only for smartphones
  if (window.innerWidth < s.SMARTPHONE) {
    if (tab.target) { // tab = event
      $(tab.target).closest('.name-icon-value').find('.glyphicon-menu-right').toggleClass('rotate-arrow-down');
      $(tab.target).closest('.name-icon-value').find('.accordion').slideToggle();
    } else {
      this.selected = $('.tab.' + tab);
      $('.tab').hide();
      $('.tab.' + tab).show();
    }
  }
}
app.module.controller('AppViewDetailsController', app.ViewDetailsController);
