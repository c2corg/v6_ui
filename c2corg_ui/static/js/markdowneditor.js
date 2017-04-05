goog.provide('app.markdownEditorDirective');

goog.require('app');


/**
 * This directive is used on textarea elements to display a markdown editor.
 * Inspired from https://github.com/ghiscoding/angular-markdown-editor
 * @return {angular.Directive} The directive specs.
 */
app.markdownEditorDirective = function($rootScope, $compile, gettextCatalog, textFormatingUrl) {

  var gettext = function(str) {
    return str;
  };

  var messages = {
    'Bold': gettext('Bold'),
    'strong text': gettext('strong text'),

    'Italic': gettext('Italic'),
    'emphasized text': gettext('emphasized text'),

    'URL/Link': gettext('URL/Link'),
    'Insert Hyperlink': gettext('Insert Hyperlink'),
    'enter link description here': gettext('enter link description here'),

    'Ordered List': gettext('Ordered List'),
    'Unordered List': gettext('Unordered List'),
    'list text here': gettext('list text here')
  };
  angular.forEach(messages, function(value, key) {
    messages[key] = '{{\'' + value + '\'|translate}}';
  });
  $.fn.markdown.messages['angular'] = messages;

  var createHeadingCallback = function(prefix) {
    return function(e) {
      // Append/remove prefix surround the selection
      var chunk, cursor, selected = e.getSelection(),
          content = e.getContent(),
          pointer, prevChar;

      if (selected.length === 0) {
        // Give extra word
        chunk = e.__localize(gettext('heading text'));
      } else {
        chunk = selected.text + '\n';
      }

      // transform selection and set the cursor into chunked text
      if (
        (
          pointer = prefix.length + 1,
          content.substr(selected.start - pointer, pointer) === prefix + ' '
        ) ||
        (
          pointer = prefix.length,
          content.substr(selected.start - pointer, pointer) === prefix
        )
      ) {
        e.setSelection(selected.start - pointer, selected.end);
        e.replaceSelection(chunk);
        cursor = selected.start - pointer;
      } else if (
        selected.start > 0 &&
        (
          prevChar = content.substr(selected.start - 1, 1),
          !!prevChar && prevChar != '\n'
        )
      ) {
        e.replaceSelection('\n\n' + prefix + ' ' + chunk);
        cursor = selected.start + prefix.length + 3;
      } else {
        // Empty string before element
        e.replaceSelection(prefix + ' ' + chunk);
        cursor = selected.start + prefix.length + 1;
      }

      // Set the cursor
      e.setSelection(cursor, cursor + chunk.length);
    };
  };

  /** @type Array<Array<bootstrapMarkdown.ButtonGroupConfig>> */
  var additionalButtons = [[
    {
      name: 'groupFont',
      data: [{
        name: 'cmdH3',
        title: gettext('Heading'),
        icon: 'glyphicon glyphicon-header',
        callback: createHeadingCallback('##')
      }]
    }, {
      name: 'groupHelp',
      data: [{
        name: 'cmdHelp',
        title: gettext('Help on text formatting'),
        icon: 'glyphicon glyphicon-question-sign',
        callback: function(e) {
          window.open(textFormatingUrl);
        }
      }]
    }
  ]];

  return {
    restrict: 'A',
    require:  'ngModel',
    link: function(scope, element, attrs, ngModel) {
      // Only initialize the $.markdown plugin once.
      if (!element.hasClass('processed')) {
        element.addClass('processed');

        /** @type {bootstrapMarkdown.MarkdownConfig} */
        var options = scope.$eval(attrs['appMarkdownEditor']) || {};

        options.hiddenButtons = (options.hiddenButtons || []).concat([
          'cmdHeading',
          'cmdImage',
          'cmdCode',
          'cmdQuote',
          'cmdPreview']);

        // Setup the markdown WYSIWYG.
        element.markdown($.extend({
          additionalButtons: additionalButtons,
          language: 'angular',
          onChange: function(e) {
            // When a change occurs, we need to update scope in case the user clicked one of the plugin buttons
            // (which isn't the same as a keydown event that angular would listen for).
            ngModel.$setViewValue(e.getContent());
          },
          onShow: function(e) {
            // keep the Markdown Object in $rootScope so that it's available also from anywhere (like in the parent controller)
            // we will keep this in an object under the ngModel name so that it also works having multiple editor in same controller
            $rootScope.markdownEditorObjects = $rootScope.markdownEditorObjects || {};
            $rootScope.markdownEditorObjects[ngModel.$name] = e;

            // Override translations
            e.__localize = function(string) {
              return gettextCatalog.getString(string);
            };
          }
        }, options));

        // Compile translations
        $compile(element.siblings('.md-header'))(scope);
      }
    }
  };
};

app.module.directive('appMarkdownEditor', ['$rootScope', '$compile', 'gettextCatalog', 'textFormatingUrl', app.markdownEditorDirective]);
