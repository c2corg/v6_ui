import angular from 'angular';
import 'angular-gettext';
import 'angular-messages';
import 'angular-cookies';
import 'angular-moment';
import 'ng-file-upload';
import 'angular-slug';
import 'angular-recaptcha';
import 'ng-infinite-scroll';
import 'angular-sanitize';
import dateparser from 'angular-ui-bootstrap/src/dateparser';
import datepicker from 'angular-ui-bootstrap/src/datepicker';
import datepickerPopup from 'angular-ui-bootstrap/src/datepickerPopup';
import modal from 'angular-ui-bootstrap/src/modal';
import dropdown from 'angular-ui-bootstrap/src/dropdown';
import popover from 'angular-ui-bootstrap/src/popover';
import tabs from 'angular-ui-bootstrap/src/tabs';
import tooltip from 'angular-ui-bootstrap/src/tooltip';
import rating from 'angular-ui-bootstrap/src/rating';
import c2cLang from './lang/lang.module';
import c2cConstants from './constants/constants.module';
import c2cUtils from './utils/utils.module';
import c2cApi from './api/api.module';
import c2cAuthentication from './authentication/authentication.module';
import HttpAuthenticationInterceptor from './http-authentication.interceptor';
import MainController from './main.controller';

angular
  .module('c2c', [
    'gettext',
    'ngMessages',
    'ngCookies',
    dateparser,
    datepicker,
    datepickerPopup,
    modal,
    dropdown,
    popover,
    tabs,
    tooltip,
    rating,
    'angularMoment',
    'ngFileUpload',
    'slug',
    'vcRecaptcha',
    'infinite-scroll',
    'ngSanitize',
    c2cLang,
    c2cConstants,
    c2cUtils,
    c2cAuthentication,
    c2cApi
  ])
  .controller('MainController', MainController)
  .factory('HttpAuthenticationInterceptor', HttpAuthenticationInterceptor)
  .config($httpProvider => $httpProvider.interceptors.push('HttpAuthenticationInterceptor'))
  .filter('trustAsHtml', $sce => text => $sce.trustAsHtml(text))
  .filter('capitalize', token => token.charAt(0).toUpperCase() + token.slice(1));
