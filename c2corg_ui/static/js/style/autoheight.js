goog.provide('app.autoHeightDirective');
goog.provide('app.AutoHeightController');

goog.require('app');


/**
 * Apply automatic height depending on text to all textarea tags
 * @return {angular.Directive} Directive Definition Object.
 */
app.autoHeightDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppAutoHeightController',
    link: function(scope, el, attrs, ctrl) {
      // adjust the height while typing
      el.on('keyup', function() {
        ctrl.adjustHeight_(el);
      });

      // open the textarea according to text length
      el.on('focus', function() {
        ctrl.adjustHeight_(el, true);

        // scroll the top of the textarea into view
        $('html, body').stop().animate({scrollTop: el.offset().top - 200});
      });

      // reduce the height of the textarea to what it was
      el.on('blur', function() {
        el.animate({'height': ''}, 'slow');
      });
    }
  };
};
app.module.directive('textarea', app.autoHeightDirective);


/**
 * @constructor
 * @struct
 * @private
 */
app.AutoHeightController = function() {};


/**
 * @private
 * @param {angular.JQLite} el
 * @param {boolean} animate
 * @suppress {missingProperties} 'animate not defined'
 */
app.AutoHeightController.prototype.adjustHeight_ = function(el, animate) {
  var height = parseInt(el.prop('scrollHeight'), 10);
  var maxHeight = '90vh';

  // if the text is heigher than 900px, set the max to 90% of the viewport height
  height = (height >= 900) ? maxHeight : (height + 2) + 'px';
  // bug if animating on type
  if (animate) {
    el.animate({'height' : height}, 'slow');
  }
  el.css('height', height);
};

app.module.controller('AppAutoHeightController', app.AutoHeightController);
