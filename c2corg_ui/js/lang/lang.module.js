import LangController from './lang.controller';
import LangDirective from './lang.directive';
import LangService from './lang.service';

/**
 * This directive is used to display a lang selector dropdown.
 */
export default angular
  .module('c2c.lang', [])
  .service('LangService', LangService)
  .controller('LangController', LangController)
  .directive('c2cLang', LangDirective)
  .name;
