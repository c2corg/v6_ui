/**
 * @type {Object}
 */
var slugx;

/**
 * @param {string} string
 * @param {string|slugx.mode=} opts
 * @constructor
 */
var slug = function(string, opts) {
};

/**
 * @type {{
 *   mode: string,
 *   modes: Object.<string, slugx.mode>,
 *   multicharmap: Object.<string, string>,
 *   charmap: Object.<string, string>
 * }}
 */
slug.defaults;

/**
 * @type {Object.<string, string>}
 */
slug.multicharmap;

/**
 * @type {Object.<string, string>}
 */
slug.charmap;

/**
 * @typedef {{
 *   replacement: string,
 *   symbols: boolean,
 *   remove: ?string,
 *   lower: boolean,
 *   charmap: Object.<string, string>,
 *   multicharmap: Object.<string, string>
 * }}
 */
slugx.mode;
