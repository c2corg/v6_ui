import template from './outings-csv-download.html';

/**
 * This directive is used to display a download button for outings in CSV format.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const OutingsCsvDownloadDirective = () => {
  return {
    restrict: 'E',
    controller: 'OutingsCsvDownloadController',
    controllerAs: 'csvCtrl',
    template
  };
};

export default OutingsCsvDownloadDirective;
