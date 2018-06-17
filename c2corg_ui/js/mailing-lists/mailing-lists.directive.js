/**
 * Directive managing the user mailinglists.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const MailingListsDirective = () => {
  return {
    restrict: 'A',
    controller: 'MailinglistsController',
    controllerAs: 'mlCtrl'
  };
};

export default MailingListsDirective;
