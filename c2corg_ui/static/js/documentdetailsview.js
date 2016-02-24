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

      // show tabs if they have been hidden on smartphone and inversely
      $(window).resize(function() {
        if (window.innerWidth > s.SMARTPHONE) {
          $('.tab, .accordion').show();
        }
        // show description tab by default or selected tab
        if (window.innerWidth < s.SMARTPHONE) {
          $('.tab').hide();
          if (!ctrl.selected) {
            $('.view-details-description').show();
          } else {
            ctrl.selected.show();
          }
        }
        return;
      });
      $('.heading').click(function() {
        var icon = $(this).find('.glyphicon');
        if (icon.hasClass('glyphicon-menu-down')) {
          icon.toggleClass('rotate-arrow-up');
        } else if (icon.hasClass('glyphicon-menu-right')) {
          icon.toggleClass('rotate-arrow-down');
        }
        return;
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
  var s = app.constants.SCREEN;

  // only for smartphones
  if (window.innerWidth < s.SMARTPHONE) {
    if (tab.target) { // tab = event
      $(tab.target).closest('.name-icon-value').find('.glyphicon-menu-right').toggleClass('rotate-arrow-down');
      $(tab.target).closest('.name-icon-value').find('.accordion').slideToggle();
    } else {
      this.selected = $('.view-details-' + tab); //used in the directive
      $('.tab').hide();
      $('.view-details-' + tab).show();
    }
  }
}
app.module.controller('AppViewDetailsController', app.ViewDetailsController);
