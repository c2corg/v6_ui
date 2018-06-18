import angular from 'angular';
import AuthenticationService from './authentication.service';
import c2cLang from '../lang/lang.module';

export default angular
  .module('c2c.authentication', [
    c2cLang
  ])
  .service('AuthenticationService', AuthenticationService)
  .run((AuthenticationService, $http, LangService) => {
    // The http and lang service are set now to avoid circular dependency.
    AuthenticationService.setHttpService($http);
    AuthenticationService.setLangService(LangService);
  })
  .name;
