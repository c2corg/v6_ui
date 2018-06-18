import angular from 'angular';
import DeleteAssociationController from './delete-association.controller';
import DeleteAssociationModalController from './delete-association-modal.controller';
import DeleteAssociationDirective from './delete-association.directive';

export default angular
  .module('c2c.delete-association', [])
  .controller('DeleteAssociationController', DeleteAssociationController)
  .controller('DeleteAssociationModalController', DeleteAssociationModalController)
  .directive('c2cDeleteAssociation', DeleteAssociationDirective)
  .name;
