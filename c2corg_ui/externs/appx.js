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
 *   routes: appx.SearchDocumentResponse,
 *   waypoints: appx.SearchDocumentResponse
 * }}
 */
appx.SearchResponse;


/**
 * @typedef {{
 *   total: number,
 *   documents: Array.<appx.SearchDocument>
 * }}
 */
appx.SearchDocumentResponse;


/**
 * @typedef {{
 *   document_id: string,
 *   locales: Array.<appx.SearchDocumentLocale>,
 *   document_type: string,
 *   label: string,
 *   documentType: string
 * }}
 */
appx.SearchDocument;


/**
 * @typedef {{
 *   title: string,
 *   culture: string
 * }}
 */
appx.SearchDocumentLocale;


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