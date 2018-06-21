import template from './simple-search.html';

/**
 * The directive for the auto-complete search field shown in the header
 * of every page.
 * @return {angular.Directive} Directive Definition Object.
 */
const SimpleSearchDirective = (SCREEN) => {
  return {
    restrict: 'E',
    controller: 'SimpleSearchController',
    bindToController: {
      'selectHandler': '&c2cSelect',
      'isStandardSearch': '<c2cSimpleSearchStandard',
      'skipAssociationFilter': '<',
      'ignoreDocumentId': '<',
      'dataset': '@'
    },
    controllerAs: 'searchCtrl',
    template,
    link:
        /**
         * @param {angular.Scope} $scope Scope.
         * @param {angular.JQLite} element Element.
         */
        function($scope, element, attrs, ctrl) {

          const phoneScreen = SCREEN.SMARTPHONE;

          // Empty the search field on focus and blur.
          $('.page-header').find('input').on('focus blur', function() {
            $(this).typeahead('val', '');
          });

          // Remove the class 'show-search' when screen width > @phone (defined in LESS)
          $(window).resize(() => {
            if ($(window).width() > phoneScreen) {
              $('.show-search').removeClass('show-search');
              $('.logo.header, .menu-open-close.header').removeClass('no-opacity');
            }
          });
          element.on('click', (e) => {

            // Collapse suggestions
            if ($('app-simple-search .header').is(e.target)) {
              $(e.target).siblings('.tt-suggestion').slideToggle();
            }

            // Trigger focus on search-icon click for .search
            if (window.innerWidth < phoneScreen &&
              $('.page-header .search-icon').is(e.target)) {
              $('.page-header').find('.quick-search').toggleClass('show-search');
              $('.page-header').find('.search').focus();
              $('.logo.header, .menu-open-close.header').toggleClass('no-opacity');
            }
          });

          // Hide the menu when click outside (smartphone)
          $('main').click((e) => {
            if (window.innerWidth < phoneScreen) {
              $('.show-search').removeClass('show-search');
              $('.logo.header, .menu-open-close.header').removeClass('no-opacity');
            }
          });

          // Show spinning gif while waiting for the results
          element.on('typeahead:asyncrequest', () => {
            element.find('input').addClass('loading-gif-typehead');
          });
          element.on('typeahead:asynccancel typeahead:asyncreceive', () => {
            element.find('input').removeClass('loading-gif-typehead');
          });
        }
  };
};

export default SimpleSearchDirective;
