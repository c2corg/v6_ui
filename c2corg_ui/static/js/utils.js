goog.provide('app.utils');


/**
 * @param {string} type Short document type code.
 * @return {string} Full document type name.
 */
app.utils.getDoctype = function(type) {
  // TODO add other types
  switch (type) {
    case 'w':
      return 'waypoints';
    case 'r':
      return 'routes';
    case 'o':
      return 'outings';
    case 'u':
      return 'users';
    case 'i':
      return 'images';
    default:
      goog.asserts.fail('Unrecognized type: ' + type);
      return '';
  }
};


/**
 * @param {string} documentType The document type.
 * @param {string|number} documentId The document id.
 * @param {string} lang Lang.
 * @return {string} Url.
 */
app.utils.buildDocumentUrl = function(documentType, documentId, lang) {
  if (!documentType || !documentId || !lang) {
    return '';
  }
  return '/{type}/{id}/{lang}'
    .replace('{type}', documentType)
    .replace('{id}', String(documentId))
    .replace('{lang}', lang);
};


/**
 * @param {ol.interaction.MouseWheelZoom} mouseWheelZoomInteraction
 */
app.utils.setupSmartScroll = function(mouseWheelZoomInteraction) {
  var scrollTimer;
  $(window).on('scroll', function(e) {
    mouseWheelZoomInteraction.setActive(false);
    if (scrollTimer) {
      clearInterval(scrollTimer);
    }
    scrollTimer = setTimeout(function() {
      mouseWheelZoomInteraction.setActive(true);
    }, 1000);
  });
};


/**
 * Update arrays and creates one, if not existing
 * form : object[property] = value
 * returns true if the item has been pushed into the array, false if removed.
 * @param {Object} object
 * @param {string} property
 * @param {string} value
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.utils.pushToArray = function(object, property, value, event) {
  var checkbox = $(event.currentTarget).find('input') || null;

  if (typeof value === 'boolean') {
    object[property] = value;
    checkbox.prop('checked', true);
    return true;
  } else {
    if (!object[property]) {
      object[property] = [];
    }

    if (object[property].indexOf(value) === -1) {
      object[property].push(value);
      checkbox.prop('checked', true);
      return true;
    } else {
      object[property].splice(object[property].indexOf(value), 1);
      checkbox.prop('checked', false);
      return false;
    }
  }
};


/**
 * @export
 */
app.utils.animateHeaderIcon = function(e) {
  // TO FIX - if you quickly double-click, it will add/remove classes even when div is or has already collapsed
  if ($(e.target).hasClass('closed') && $(e.target).parent().find('.collapsing').length === 0) {
    $(e.target).removeClass('closed');
  } else {
    $(e.target).addClass('closed');
  }
  var menuDown = $(e.target).find('.glyphicon-menu-down');
  var menuUp = $(e.target).find('.glyphicon-menu-right');

  if (menuDown.length > 0) {
    menuDown.toggleClass('rotate-arrow-up');
  } else if (menuUp.length > 0) {
    menuUp.toggleClass('rotate-arrow-down');
  }
  return;
};


/**
 * convert an image File into a base64 string
 * @property {Object} uploaded Image File
 * @export
 */
app.utils.getImageFileBase64Source = function(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    return file.src = e.target.result;
  };
  reader.readAsDataURL(file);
};


/**
 * @param {Object} file : image object from associations or uploaded
 * @return {string}
 * @export
 */
app.utils.createImageSlide = function(file, imageUrl) {
  var img;
  var ahref;
  // if !src => it's an already existing image, else it's an image that has just been uploaded
  if (!file['src']) {
    ahref = '<a href="' + imageUrl + file.filename + '" data-info-id="' + file['document_id'] + '">';
    img = '<img src="' + imageUrl + file.filename + '">';
  } else {
    ahref = '<a href="' + file['src'] + '" data-info-id="' + file['document_id'] + '">';
    img = '<img src=" ' + file['src'] + '">';
  }
  return '<figure id="image-' + file['document_id'] + '">' +
               ahref + img +
               '</a>' +
               '<app-slide-info></app-slide-info>' +
             '</figure>';
};


/**
 * http://openlayers.org/en/latest/examples/vector-labels.html
 * http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
 * @param {string} str String to divide.
 * @param {number} width Max string length before wrapping.
 * @param {string} spaceReplacer
 * @return {string}
 */
app.utils.stringDivider = function(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
      p--;
    }
    if (p > 0) {
      var left;
      if (str.substring(p, p + 1) === '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      var right = str.substring(p + 1);
      return left + spaceReplacer + app.utils.stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
};


/**
 * @param {string} path Path of the partial.
 * @param {angular.$templateCache} $templateCache service
 * @return {string}
 */
app.utils.getTemplate = function(path, $templateCache) {
  var tpl = $templateCache.get(path);
  if (goog.DEBUG && !tpl) {
    var req = new XMLHttpRequest();
    req.open('GET', path, false /* synchronous */);
    req.send(null);
    tpl = req.status === 200 ? req.responseText : 'Partial not found';
    $templateCache.put(path, tpl);
  }
  return tpl;
};


/**
 * @param {ngeo.Location} ngeoLocation ngeo Location service.
 * @return {boolean}
 */
app.utils.detectDocumentIdFilter = function(ngeoLocation) {
  var associatedDocTypes = ['w', 'r'];
  for (var i = 0, n = associatedDocTypes.length; i < n; i++) {
    if (ngeoLocation.hasFragmentParam(associatedDocTypes[i])) {
      return true;
    }
  }
  return false;
};
