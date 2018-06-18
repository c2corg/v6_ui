/**
 * @param {angular.Scope} $scope Scope.
 * @param {app.Api} ApiService Api service.
 * @param {app.Authentication} AuthenticationService
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @param {app.Alerts} appAlerts
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {angular.$q} $q Angular q service.
 * @param {app.Lang} LangService Lang service.
 * @param {VCRecaptcha} vcRecaptchaService The recatpcha service from VC.
 * @constructor
 * @ngInject
 */
export default class AuthController {
  constructor($scope, ApiService, AuthenticationService, ngeoLocation, appAlerts, gettextCatalog, $q, LangService,
    vcRecaptchaService) {
    'ngInject';

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
    this.apiService_ = ApiService;

    /**
     * @type {app.Authentication}
     * @private
     */
    this.AuthenticationService_ = AuthenticationService;

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
    this.langService_ = LangService;

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

    const get_nonce = key => ngeoLocation.getFragmentParam(key).replace(/[^0-9a-z_]/gi, '');

    if (this.ngeoLocation_.hasFragmentParam('validate_register_email')) {
      // Activate and log in from API by using the nonce
      const nonce1 = get_nonce('validate_register_email');
      const remember = true;
      const onLogin = this.successLogin_.bind(this, remember);
      this.apiService_.validateRegisterEmail(nonce1).then(onLogin);
      this.uiStates = {};
    } else if (this.ngeoLocation_.hasFragmentParam('validate_change_email')) {
      // Activate the email and redirect
      const nonce2 = get_nonce('validate_change_email');
      this.apiService_.validateChangeEmail(nonce2).then(() => {
        this.redirect_();
      });
      this.uiStates = {};
    } else if (this.ngeoLocation_.hasFragmentParam('change_password')) {
      // Display the new password form and populate the nonce field.
      // On submission success the user will be logged in.
      this.nonce_ = get_nonce('change_password');
      this.uiStates = {
        'showChangePasswordForm': true
      };
    }
  }


  /**
   * @export
   */
  login() {
    const login = this.scope_['login'];
    const remember = !!login['remember']; // a true boolean

    // Discourse SSO
    login['discourse'] = true;
    if (this.ngeoLocation_.hasParam('sso')) {
      login['sso'] = this.ngeoLocation_.getParam('sso');
      login['sig'] = this.ngeoLocation_.getParam('sig');
    }

    this.apiService_.login(login).then(this.successLogin_.bind(this, remember));
  }


  /**
   * @export
   */
  ssoLogin() {
    const login = this.scope_['login'];
    const remember = !!login['remember']; // a true boolean

    // Discourse SSO
    login['discourse'] = true;

    // SSO Token
    login['token'] = this.ngeoLocation_.getParam('token');

    this.apiService_.ssoLogin(login).then(this.successLogin_.bind(this, remember));
  }


  /**
   * @param {string} url Authentication URL for discourse. This URL is returned
   * by the API.
   * @return {angular.$q.Promise}
   * @private
   */
  loginToDiscourse_(url) {
    // https://developer.mozilla.org/fr/docs/Web/HTML/Element/iframe
    const deferred = this.q_.defer();
    const timeoutId = window.setTimeout(() => {
      deferred.reject();
    }, 10000); // 10s to complete discourse authentication

    $('<iframe>', {
      src: url,
      id: 'discourse_auth_frame',
      style: 'display: none',
      sandbox: 'allow-same-origin'
    }).appendTo('body').on('load', () => {
      window.clearTimeout(timeoutId);
      deferred.resolve();
    });
    return deferred.promise;
  }


  /**
   * Redirect to specified URL or previous page if a from parameter exists
   * otherwise redirect to /.
   * @param {string=} opt_location Redirect location (absolute URL).
   * @private
   */
  redirect_(opt_location) {
    if (!opt_location) {
      let relativeUrl = this.ngeoLocation_.getFragmentParam('to');
      relativeUrl = relativeUrl ? decodeURIComponent(relativeUrl) : '/';
      opt_location = window.location.protocol + '//' + window.location.host + relativeUrl;
    }
    window.location.href = opt_location;
  }


  /**
   * @param {boolean} remember whether to store the data in local storage.
   * @param {Object} response Response from the API server.
   * @private
   */
  successLogin_(remember, response) {
    const data = /** @type {appx.AuthData} */ (response['data']);
    data.remember = remember;
    this.AuthenticationService_.setUserData(data);

    const discourse_url = data['redirect_internal'];
    const promise = discourse_url ? this.loginToDiscourse_(discourse_url) :
      this.q_.when(true);

    if (!this.ngeoLocation_.hasParam('no_redirect')) {
      promise.finally(this.redirect_.bind(this, data.redirect));
    }
  }


  /**
   * @export
   */
  register() {
    const alerts = this.alerts_;
    const lang = this.langService_.getLang();
    const form = this.scope_['register'];
    form['lang'] = lang; // inject the current language

    this.apiService_.register(form).then(() => {
      const msg = alerts.gettext(
        'Thank you for your registration! ' +
        'We sent you an email, please click on the link to activate ' +
        'your account.');
      alerts.addSuccess(msg);
    }, () => {
      // The captcha can be used only once
      this.reloadCaptcha();
    });
  }


  /**
   * @export
   */
  requestPasswordChange() {
    const alerts = this.alerts_;
    /**
     * @type {appx.auth.RequestChangePassword}
     */
    const data = this.scope_['requestChangePassword'];
    this.apiService_.requestPasswordChange(data.email).then(() => {
      const msg = alerts.gettext(
        'We sent you an email, please click on the link to reset password.');
      alerts.addSuccess(msg);
    });
  }


  /**
   * @export
   */
  validateNewPassword() {
    const remember = true;
    const onLogin = this.successLogin_.bind(this, remember);
    const password = this.scope_['changePassword']['password'];
    this.apiService_.validateNewPassword(this.nonce_, password).then(onLogin);
  }


  /**
   * @export
   */
  reloadCaptcha() {
    this.vcRecaptchaService_.reload();
  }
}
