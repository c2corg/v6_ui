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
          var method = config.method;
          var url = config.url;
          goog.asserts.assert(method && url);
          var needed = appAuthentication.needAuthorization(method, url);
          if (needed) {
            config.headers = config.headers || {};
            appAuthentication.addAuthenticationHeaders(url, config.headers);
          }
          console.log('FIXME auth', needed, url);
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
