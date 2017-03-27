/**
 * @fileoverview Externs for bootstrap-markdown
 *
 * @externs
 */

/**
 * @type {Object}
 */
var bootstrapMarkdown;

/**
 * @typedef {{
 *   __localize: function(string),
 *   showEditor: function(),
 *   showPreview: function(),
 *   hidePreview: function(),
 *   isDirty: function(),
 *   getContent: function(),
 *   parseContent: function(),
 *   setContent: function(string),
 *   findSelection: function(string),
 *   getSelection: function(),
 *   setSelection: function(number, number),
 *   replaceSelection: function(string),
 *   getNextTab: function(),
 *   setNextTab: function(number, number),
 *   enableButtons: function(string),
 *   disableButtons: function(string),
 *   showButtons: function(string),
 *   hideButtons: function(string)
 * }}
 */
bootstrapMarkdown.Markdown;

/**
 * @typedef {{
 *   defaults: Object,
 *   messages: Array<Array<string>>
 * }}
 */
$.fn.markdown;

/**
 * @typedef {{
 *   name: string,
 *   toggle: boolean,
 *   title: string,
 *   hotkey: string,
 *   icon: (string|Object),
 *   callback: function(bootstrapMarkdown.Markdown),
 * }}
 */
bootstrapMarkdown.ButtonConfig;

/**
 * @typedef {{
 *   name: string,
 *   data: Array<bootstrapMarkdown.ButtonConfig>
 * }}
 */
bootstrapMarkdown.ButtonGroupConfig;

/**
 * @typedef {{
 *  additionalButtons: Array<Array<bootstrapMarkdown.ButtonGroupConfig>>,
 *  autofocus: boolean,
 *  savable: boolean,
 *  hideable: boolean,
 *  width: (string|number),
 *  height: (string|number),
 *  resize: string,
 *  iconlibrary: string,
 *  language: string,
 *  footer: (string|function(bootstrapMarkdown.Markdown)),
 *  fullscreen: Object,
 *  hiddenButtons: (Array|string),
 *  disabledButtons: (Array|string),
 *  dropZoneOptions: Object,
 *  onShow: function(bootstrapMarkdown.Markdown),
 *  onPreview: function(bootstrapMarkdown.Markdown),
 *  onSave: function(bootstrapMarkdown.Markdown),
 *  onChange: function(bootstrapMarkdown.Markdown),
 *  onFocus: function(bootstrapMarkdown.Markdown),
 *  onBlur: function(bootstrapMarkdown.Markdown)
 * }}
 */
bootstrapMarkdown.MarkdownConfig;

/**
 * @param {bootstrapMarkdown.MarkdownConfig} options
 * @return {!jQuery}
 */
$.prototype.markdown = function(options) {};
