goog.provide('app.inputs');

goog.require('app');

/**
 * @export
 */
app.inputs = function() {
  // on mobile, hide buttons when input field has focus
  var body = $('body');
  body.on('focus blur', ':input', function() {
    body.toggleClass('hide-mobile-buttons');
  });
};
