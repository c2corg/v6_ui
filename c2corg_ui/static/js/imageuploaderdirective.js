goog.provide('app.imageUploaderDirective');

goog.require('app');


/**
 * This directive is used to display a drag-drop area for images to upload.
 * @return {angular.Directive} The directive specs.
 */
app.imageUploaderDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppImageUploaderController',
    controllerAs: 'uplCtrl',
    bindToController: {
      'activities': '=',
      'categories': '=',
      'types': '='
    },
    templateUrl: '/static/partials/imageuploader.html',
    link: function(scope, el, attrs, ctrl) {
      el.on('click', '.dropdown-toggle', function() {
        app.utils.repositionMenu({'menu': this, 'boxBoundEl': '.images-container', 'checkBottom': true});
      });
    }
  };
};


app.module.directive('appImageUploader', app.imageUploaderDirective);
