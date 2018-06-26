/**
 * Length attributes are stored in meters but shown in kilometers.
 * This directive is supposed to be used in document edit forms.
 * @return {angular.Directive} directive
 */
const LengthConverterDirective = () => {
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
      ngModel.$parsers.push((value) => {
        return value * 1000;
      });

      ngModel.$formatters.push((value) => {
        return value / 1000;
      });
    }
  };
};

export default LengthConverterDirective;
