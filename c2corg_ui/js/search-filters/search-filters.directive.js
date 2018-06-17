/**
 * This directive is used to integrate a criterias form in the advanced search
 * page. See also {app.advancedSearchDirective}.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const SearchFiltersDirective = (UtilsService, SCREEN) => {
  'ngInject';

  return {
    restrict: 'A',
    controller: '@',
    name: 'SearchFiltersControllerName',
    bindToController: true,
    scope: true,
    controllerAs: 'filtersCtrl',
    link(scope, element, attrs, ctrl) {
      // FIXME On some screen sizes, the dropdown menu is too large and is
      // hidden within documents-list-section because it's too small. Given
      // that this menu is inside, it will not be shown entirely...
      // If someone can fix it using CSS only, you're da real MVP !
      element.on('click', '.dropdown-toggle', function() {
        UtilsService.repositionMenu({'menu': this, 'boxBoundEl': '.filters .simple-filters'});
      });

      // This prevents to 'jump' or 'stutter' on phone - before, if you first
      // opened more-filters and scrolled, it would unfold filters on whole
      // page and make a stutter. Now it overflows.
      if (window.innerWidth < SCREEN.SMARTPHONE) {
        $('.more-filters-btn, .search-filters-btn, .less-filters-btn').click(() => {
          $('.filters').toggleClass('filters-phone');
        });
      }
    }
  };
};

export default SearchFiltersDirective;
