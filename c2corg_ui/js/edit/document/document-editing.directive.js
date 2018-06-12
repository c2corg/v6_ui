/**
 * @module app.documentEditingDirective
 */
import appBase from './index.js';

/**
 * Provides the "appDocumentEditing" directive, which applies to the forms
 * used to create a new document (whatever its type) or to edit an existing
 * one. The fields and validations are set and performed in the form itself.
 *
 * @example
 * <form c2c-document-editing="waypoints" c2c-document-editing-model="waypoint"
 *   c2c-document-editing-id="42" c2c-document-editing-lang="fr"
 *   name="editForm" novalidate
 *   ng-submit="editCtrl.submitForm(editForm.$valid)">
 *
 * The main directive attribute contains the resource name (eg. "waypoints").
 * Additional attributes are used to specify the model name and, optionally,
 * the document id and lang.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const DocumentEditingDirective = () => {
  return {
    restrict: 'A',
    scope: true,
    controller: '@',
    name: 'c2cDocumentEditingControllerName',
    controllerAs: 'editCtrl',
    bindToController: true
  };
};

export default DocumentEditingDirective;
