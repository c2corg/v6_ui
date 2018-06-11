/**
 * @module app.viewDetailsDirective
 */
import appBase from './index.js';

/**
 * @return {angular.Directive} directive for detailed views
 */
const exports = function() {
  return {
    restrict: 'A',
    controller: 'AppViewDetailsController',
    controllerAs: 'detailsCtrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {

      function initGalleries() {
        ctrl.initPhotoswipe_();
      }

      ctrl.loadImages_(initGalleries);
      ctrl.watchPswpContainer_();

      // clicking on 'info' btn will open slide from the right and get the infos
      $('.pswp').on('click touchend', '.pswp__button--info', e => {
        $('.image-infos, .photoswipe-image-container img').toggleClass('showing-info');
        ctrl.getImageInfo_($(e.target).attr('data-img-id'));
      });

      $('.pswp__button--arrow--left, .pswp__button--arrow--right').click(() => {
        $('.showing-info').removeClass('showing-info');
      });
    }
  };
};

appBase.module.directive('appViewDetails', exports);


export default exports;
