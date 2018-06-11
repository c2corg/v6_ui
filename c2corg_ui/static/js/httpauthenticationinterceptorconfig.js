/**
 * @module app.HttpAuthenticationInterceptorConfig
 */
import appBase from './index.js';

/**
 * @ngInject
 * @param {angular.$HttpProvider} $httpProvider
 */
const exports = function($httpProvider) {
  $httpProvider.interceptors.push('appHttpAuthenticationInterceptor');
};


appBase.module.config(exports);


export default exports;
