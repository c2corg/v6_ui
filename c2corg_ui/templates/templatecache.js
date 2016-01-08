## -*- coding: utf-8 -*-
<%doc>
    This is a Mako template that generates Angular code putting the contents of
    HTML partials into Angular's $templateCache. The generated code is then built
    with the rest of JavaScript code. The generated script is not used at all in
    development mode, where HTML partials are loaded through Ajax.
</%doc>\
<%
  import re
  import htmlmin
  _partials = {}
  for p in partials.strip().split():
      f = open(p, encoding="utf-8")
      content = str(f.read())
      content = re.sub(r"'", "\\'", content)
      content = htmlmin.minify(content, remove_comments=True)
      # remove module name from partial path
      partial = re.sub(r'c2corg_ui', '', p, 1)
      _partials[partial] = content
%>\
/**
 * @fileoverview AngularJS template cache.
 * GENERATED FILE. DO NOT EDIT.
 */

goog.require('app');

(function() {
  /**
   * @param {angular.$cacheFactory.Cache} $templateCache
   * @ngInject
   */
  var runner = function($templateCache) {
  % for partial in _partials:
    $templateCache.put('${partial}', '${_partials[partial]}');
  %endfor
  };
  angular.module('app').run(runner);
})();
