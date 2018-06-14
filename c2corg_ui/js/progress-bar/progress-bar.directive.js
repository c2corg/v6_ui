
/**
 * The progress bar on the top of editing pages.
 * The navigation buttons (right and left) are also managed
 * by this directive.
 * @return {angular.Directive} The directive specs.
 */
const ProgressBarDirective = () => {
  return {
    restrict: 'E',
    controller: 'ProgressBarController as progressBarCtrl'
  };
};

export default ProgressBarDirective;
