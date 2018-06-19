import template from './protect-document.html';

const ProtectDocumentDirective = () => {
  return {
    restrict: 'A',
    controller: 'ProtectDocumentController',
    controllerAs: 'protectCtrl',
    template
  };
};

export default ProtectDocumentDirective;
