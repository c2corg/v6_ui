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
 *   bestCulture: string,
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
 *  msg: string,
 *  type: ?string
 * }}
 */
appx.AlertMessage;
