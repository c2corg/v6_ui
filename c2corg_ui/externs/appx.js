/**
 * @type {Object}
 */
var appx;


/**
 * @typedef {{
 *   username: string,
 *   token: string,
 *   expire: number,
 *   roles: Array.<string>,
 *   redirect: string,
 *   remember: boolean
 * }}
 */
appx.AuthData;


/**
 * @typedef {{
 *   routes: appx.SimpleSearchDocumentResponse,
 *   waypoints: appx.SimpleSearchDocumentResponse
 * }}
 */
appx.SimpleSearchResponse;


/**
 * @typedef {{
 *   total: number,
 *   documents: Array.<appx.SimpleSearchDocument>
 * }}
 */
appx.SimpleSearchDocumentResponse;


/**
 * @typedef {{
 *   document_id: number,
 *   locales: Array.<appx.SimpleSearchDocumentLocale>,
 *   document_type: string,
 *   label: string,
 *   documentType: string
 * }}
 */
appx.SimpleSearchDocument;


/**
 * @typedef {{
 *   title: string,
 *   title_prefix: ?string,
 *   lang: string
 * }}
 */
appx.SimpleSearchDocumentLocale;


/**
 * @typedef {{
 *  msg: (string|Object),
 *  type: ?string,
 *  timeout: ?number
 * }}
 */
appx.AlertMessage;


/**
 * @typedef {{
 *  min: number,
 *  max: number,
 *  value: Array.<number>
 * }}
 */
appx.BootstrapSliderValues;



/**
 * @typedef {{
 *   email: string
 * }}
 */
appx.auth.RequestChangePassword;
