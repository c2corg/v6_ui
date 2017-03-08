goog.provide('app.lengthConverterDirective');

goog.require('app');


/**
 * Length attributes are stored in meters but shown in kilometers.
 * This directive is supposed to be used in document edit forms.
 * @return {angular.Directive} directive
 */
app.lengthConverterDirective = function() {
  return {
    require: 'ngModel',
    link:
     /**
      * @param {angular.Scope} scope Scope.
      * @param {angular.JQLite} el Element.
      * @param {angular.Attributes} attrs Atttributes.
      * @param {angular.NgModelController} ngModel ngModel.
      */
    function(scope, el, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return value * 1000;
      });

      ngModel.$formatters.push(function(value) {
        return value / 1000;
      });
    }
  };
};


app.module.directive('appLengthConverter', app.lengthConverterDirective);
