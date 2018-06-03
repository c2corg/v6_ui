goog.provide('app.HttpAuthenticationInterceptorConfig');

goog.require('app');


/**
 * @ngInject
 * @param {angular.$HttpProvider} $httpProvider
 */
app.HttpAuthenticationInterceptorConfig = function($httpProvider) {
  $httpProvider.interceptors.push('appHttpAuthenticationInterceptor');
};


app.module.config(app.HttpAuthenticationInterceptorConfig);
