import angular from 'angular';
import AddAssociationController from './add-association.controller';
import AddAssociationDirective from './add-association.directive';
import c2cDocument from '../document/document.module';
import c2cApi from '../api/api.module';

export default angular
  .module('c2c.add-association', [
    c2cDocument,
    c2cApi
  ])
  .controller('AddAssociationController', AddAssociationController)
  .directive('c2cAddAssociation', AddAssociationDirective)
  .name;
