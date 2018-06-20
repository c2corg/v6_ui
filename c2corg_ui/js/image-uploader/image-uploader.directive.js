import template from './image-uploader.html';

/**
 * This directive is used to display a drag-drop area for images to upload.
 * @return {angular.Directive} The directive specs.
 */
const ImageUploaderDirective = UtilsService => {
  'ngInject';

  return {
    restrict: 'A',
    controller: 'ImageUploaderController',
    controllerAs: 'uplCtrl',
    bindToController: {
      'activities': '=',
      'categories': '=',
      'types': '='
    },
    template,
    link: function(scope, el, attrs, ctrl) {
      el.on('click', '.dropdown-toggle', function() {
        UtilsService.repositionMenu({'menu': this, 'boxBoundEl': '.images-container', 'checkBottom': true});
      });
    }
  };
};

export default ImageUploaderDirective;
