goog.provide('app.AuthController');
goog.provide('app.authDirective');

goog.require('app');
goog.require('app.Alerts');
goog.require('app.Authentication');
goog.require('app.Lang');
goog.require('ngeo.Location');


/**
 * This directive is used to manage the login/register forms.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.authDirective = function() {
  return {
    restrict: 'A',
    scope: true,
    controller: 'appAuthController',
    controllerAs: 'authCtrl',
    bindToController: true
  };
};


app.module.directive('appAuth', app.authDirective);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Api} appApi Api service.
 * @param {app.Authentication} appAuthentication
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {angular.$q} $q Angular q service.
 * @param {app.Lang} appLang Lang service.
 * @param {VCRecaptcha} vcRecaptchaService The recatpcha service from VC.
 * @constructor
 * @export
 * @ngInject
 */
app.AuthController = function($scope, appApi, appAuthentication,
    ngeoLocation, appAlerts, gettextCatalog, $q, appLang,
    vcRecaptchaService) {

  /**
   * @type {VCRecaptcha}
   */
  this.vcRecaptchaService_ = vcRecaptchaService;

  /**
   * @type {angular.$q}
   * @private
   */
  this.q_ = $q;

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  // set remember-me to default -> true
  this.scope_['login'] = {'remember': true};

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.appAuthentication_ = appAuthentication;

  /**
   * @type {ngeo.Location}
   * @private
   */
  this.ngeoLocation_ = ngeoLocation;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {app.Lang}
   * @private
   */
  this.langService_ = appLang;

  /**
   * @export
   */
  this.uiStates = {
    'showLoginForm': true
  };

  /**
   * @type {string}
   * @private
   */
  this.nonce_;

  var get_nonce = function(key) {
    return ngeoLocation.getFragmentParam(key).replace(/[^0-9a-z_]/gi, '');
  };

  if (this.ngeoLocation_.hasFragmentParam('validate_register_email')) {
    // Activate and log in from API by using the nonce
    var nonce1 = get_nonce('validate_register_email');
    var remember = true;
    var onLogin = this.successLogin_.bind(this, remember);
    this.api_.validateRegisterEmail(nonce1).then(onLogin);
    this.uiStates = {};
  } else if (this.ngeoLocation_.hasFragmentParam('validate_change_email')) {
    // Activate the email and redirect
    var nonce2 = get_nonce('validate_change_email');
    this.api_.validateChangeEmail(nonce2).then(function() {
      this.redirect_();
    }.bind(this));
    this.uiStates = {};
  } else if (this.ngeoLocation_.hasFragmentParam('change_password')) {
    // Display the new password form and populate the nonce field.
    // On submission success the user will be logged in.
    this.nonce_ = get_nonce('change_password');
    this.uiStates = {
      'showChangePasswordForm': true
    };
  }
};


/**
 * @export
 */
app.AuthController.prototype.login = function() {
  var login = this.scope_['login'];
  var remember = !!login['remember']; // a true boolean

  // Discourse SSO
  login['discourse'] = true;
  if (this.ngeoLocation_.hasFragmentParam('sso')) {
    login['sso'] = this.ngeoLocation_.getFragmentParam('sso');
    login['sig'] = this.ngeoLocation_.getFragmentParam('sig');
  }

  this.api_.login(login).then(this.successLogin_.bind(this, remember));
};


/**
 * @param {string} url Authentication URL for discourse. This URL is returned
 * by the API.
 * @return {angular.$q.Promise}
 * @private
 */
app.AuthController.prototype.loginToDiscourse_ = function(url) {
  // https://developer.mozilla.org/fr/docs/Web/HTML/Element/iframe
  var deferred = this.q_.defer();
  var timeoutId = window.setTimeout(function() {
    deferred.reject();
  }, 10000); // 10s to complete discourse authentication

  $('<iframe>', {
    src: url,
    id: 'discourse_auth_frame',
    style: 'display: none',
    sandbox: 'allow-same-origin'
  }).appendTo('body').on('load', function() {
    window.clearTimeout(timeoutId);
    deferred.resolve();
  });
  return deferred.promise;
};


/**
 * Redirect to specified URL or previous page if a from parameter exists
 * otherwise redirect to /.
 * @param {string=} opt_location Redirect location (absolute URL).
 * @private
 */
app.AuthController.prototype.redirect_ = function(opt_location) {
  if (!opt_location) {
    var relativeUrl = this.ngeoLocation_.hasFragmentParam('to') ?
        decodeURIComponent(this.ngeoLocation_.getFragmentParam('to')) : '/';
    opt_location = window.location.protocol + '//' + window.location.host + relativeUrl;
  }
  window.location.href = opt_location;
};


/**
 * @param {boolean} remember whether to store the data in local storage.
 * @param {Object} response Response from the API server.
 * @private
 */
app.AuthController.prototype.successLogin_ = function(remember, response) {
  var data = /** @type {appx.AuthData} */ (response['data']);
  data.remember = remember;
  this.appAuthentication_.setUserData(data);

  var discourse_url = data['redirect_internal'];
  var promise = discourse_url ? this.loginToDiscourse_(discourse_url) :
      this.q_.when(true);

  promise.finally(this.redirect_.bind(this, data.redirect));
};


/**
 * @export
 */
app.AuthController.prototype.register = function() {
  var alerts = this.alerts_;
  var lang = this.langService_.getLang();
  var form = this.scope_['register'];
  form['lang'] = lang; // inject the current language

  this.api_.register(form).then(function() {
    var msg = alerts.gettext('Register success');
    alerts.addSuccess(msg);
  }, function() {
    // The captcha can be used only once
    this.reloadCaptcha();
  }.bind(this));
};


/**
 * @export
 */
app.AuthController.prototype.requestPasswordChange = function() {
  var alerts = this.alerts_;
  /**
   * @type {appx.auth.RequestChangePassword}
   */
  var data = this.scope_['requestChangePassword'];
  this.api_.requestPasswordChange(data.email).then(function() {
    var msg = alerts.gettext(
        'We sent you an email, please click on the link to reset password.');
    alerts.addSuccess(msg);
  });
};


/**
 * @export
 */
app.AuthController.prototype.validateNewPassword = function() {
  var remember = true;
  var onLogin = this.successLogin_.bind(this, remember);
  var password = this.scope_['changePassword']['password'];
  this.api_.validateNewPassword(this.nonce_, password).then(onLogin);
};


/**
 * @export
 */
app.AuthController.prototype.reloadCaptcha = function() {
  this.vcRecaptchaService_.reload();
};


app.module.controller('appAuthController', app.AuthController);
