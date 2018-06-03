goog.provide('app.HttpAuthenticationInterceptor');

goog.require('app');


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
        const method = config.method;
        const url = config.url;
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
