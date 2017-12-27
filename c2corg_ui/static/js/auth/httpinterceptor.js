goog.provide('app.HttpAuthenticationInterceptor');
goog.provide('app.HttpAuthenticationInterceptorConfig');

goog.require('app');
goog.require('app.Authentication');


/**
 * @ngInject
 * @param {string} apiUrl Base URL of the API.
 * @param {app.Authentication} appAuthentication
 * @return {angular.$http.Interceptor}
 */
app.HttpAuthenticationInterceptor = function(apiUrl, appAuthentication) {
  return {
    'request': (
      /**
       * @param {!angular.$http.Config} config
       * @return {!angular.$http.Config}
       */
      function(config) {
        let method = config.method;
        let url = config.url;
        goog.asserts.assert(method && url);
        if (appAuthentication.needAuthorization(method, url)) {
          config.headers = config.headers || {};
          appAuthentication.addAuthorizationToHeaders(url, config.headers);
        }
        return config;
      }
    )
  };
};

app.module.factory('appHttpAuthenticationInterceptor',
  app.HttpAuthenticationInterceptor);


/**
 * @ngInject
 * @param {angular.$HttpProvider} $httpProvider
 */
app.HttpAuthenticationInterceptorConfig = function($httpProvider) {
  $httpProvider.interceptors.push('appHttpAuthenticationInterceptor');
};


app.module.config(app.HttpAuthenticationInterceptorConfig);
