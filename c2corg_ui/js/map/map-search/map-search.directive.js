/**
 * Adapted from https://github.com/camptocamp/agridea_geoacorda/blob/master/jsapi/src/searchcontrol.js
 */

import template from './map-search.html';

const MapSearchDirective = () => {
  return {
    restrict: 'E',
    scope: {
      'map': '=c2cMapSearchMap'
    },
    controller: 'MapSearchController',
    bindToController: true,
    controllerAs: 'searchCtrl',
    template,
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} element Element.
         * @param {angular.Attributes} attrs Atttributes.
         */
        function(scope, element, attrs) {
          // Empty the search field on focus and blur.
          element.find('input').on('focus blur', function() {
            $(this).val('');
          });
        }
  };
};

export default MapSearchDirective;
