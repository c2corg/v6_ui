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
    case 'a':
      return 'areas';
    default:
      goog.asserts.fail('Unrecognized type: ' + type);
      return '';
  }
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
  var smallImage = app.utils.createImageUrl(file.filename, 'SI');
  var bigImage = app.utils.createImageUrl(file.filename, 'BI');
  var ahref = '<a href="' + imageUrl + bigImage + '" data-info-id="' + file['image_id'] + '-slide">';
  var img = '<img src="' + imageUrl + smallImage + '"></a>';

  return '<figure id="' + file['image_id'] + '">' + ahref + img +  '<app-slide-info></app-slide-info></figure>';
};

/**
 * @param {string} url
 * @param {string} suffix
 * @return {string | undefined}
 * @export
 */
app.utils.createImageUrl = function(url, suffix) {
  if (url) {
    var i = url.lastIndexOf('.');
    return url.slice(0, i) + suffix + url.slice(i);
  }
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
  // see app.utils.getDoctype() for types definitions
  var associatedDocTypes = ['w', 'r', 'a'];
  for (var i = 0, n = associatedDocTypes.length; i < n; i++) {
    if (ngeoLocation.hasFragmentParam(associatedDocTypes[i])) {
      return true;
    }
  }
  return false;
};


/**
 * Redirects to the login page.
 * @param {string} authUrl
 */
app.utils.redirectToLogin = function(authUrl) {
  var location = window.location;
  var current_url = location.pathname + location.search + location.hash;
  if (location.pathname == '/auth') {
    // do not redirect to the 'auth' page
    current_url = '/';
  }
  location.href = '{login}#to={current}'
      .replace('{login}', authUrl)
      .replace('{current}', encodeURIComponent(current_url));
};
