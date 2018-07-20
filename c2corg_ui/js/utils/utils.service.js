import olGeomLineString from 'ol/geom/LineString';
import olGeomMultiLineString from 'ol/geom/MultiLineString';
import escape from 'lodash/escape';
import googAsserts from 'goog/asserts';

/**
 * @param {string} type Short document type code.
 * @return {string} Full document type name.
 */
export default class UtilsService {
  constructor() {
    'ngInject';
  }

  getDoctype(type) {
    switch (type) {
      case 'w':
        return 'waypoints';
      case 'r':
        return 'routes';
      case 'o':
        return 'outings';
      case 'u':
        return 'users';
      case 'c':
        return 'articles';
      case 'i':
        return 'images';
      case 'a':
        return 'areas';
      case 'b':
        return 'books';
      case 'x':
        return 'xreports';
      case 'f':
        return 'feeds';
      default:
        googAsserts.fail('Unrecognized type: ' + type);
        return '';
    }
  }

  /**
   * @param {ol.interaction.MouseWheelZoom} mouseWheelZoomInteraction
   */
  setupSmartScroll(mouseWheelZoomInteraction) {
    let scrollTimer;
    $(window).on('scroll', (e) => {
      mouseWheelZoomInteraction.setActive(false);
      if (scrollTimer) {
        clearInterval(scrollTimer);
      }
      scrollTimer = setTimeout(() => {
        mouseWheelZoomInteraction.setActive(true);
      }, 1000);
    });
  }


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
  pushToArray(object, property, value, event) {
    const checkbox = $(event.currentTarget).find('input') || null;

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
  }


  /**
   * @export
   */
  animateHeaderIcon(e) {
    // TO FIX - if you quickly double-click, it will add/remove classes even when div is or has already collapsed
    const target = $(e.currentTarget);
    if (target.hasClass('closed') && target.parent().find('.collapsing').length === 0) {
      target.removeClass('closed');
    } else {
      target.addClass('closed');
    }
    const menuDown = target.find('.glyphicon-menu-down');
    const menuUp = target.find('.glyphicon-menu-right');

    if (menuDown.length > 0) {
      menuDown.toggleClass('rotate-arrow-up');
    } else if (menuUp.length > 0) {
      menuUp.toggleClass('rotate-arrow-down');
    }
    return;
  }


  /**
   * convert an image File into a base64 string
   * @property {Object} uploaded Image File
   * @export
   */
  getImageFileBase64Source(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      return file.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  /**
   * @param {Object} file : image object from associations or uploaded
   * @return {string}
   * @export
   */
  createImageSlide(file, imageUrl) {
    const smallImage = this.createImageUrl(file.filename, 'SI');
    const bigImage = this.createImageUrl(file.filename, 'BI');
    const title = escape(file.locales[0].title);
    const ahref = '<a href="' + imageUrl + bigImage + '" data-info-id="' + file.image_id + '-slide" title="' + title + '">';
    const img = '<img src="' + imageUrl + smallImage + '"></a>';

    return '<figure id="' + file.image_id + '">' + ahref + img + '<c2c-slide-info></c2c-slide-info></figure>';
  }


  /**
   * based on partials/slideinfo.html
   * @param {string} imgUrl
   * @param {number} imgId
   * @param {string} selector
   * @export
   */
  createPhotoswipeSlideHTML(imgUrl, imgId, selector) {
    const slide = $(selector + imgId + '-slide');
    return '<div class="photoswipe-image-container">' +
            '<img src="' + imgUrl + '">' + slide.html() +
          '</div>';
  }


  /**
   * @param {string} url
   * @param {string} suffix
   * @return {string | undefined}
   * @export
   */
  createImageUrl(url, suffix) {
    if (url) {
      const i = url.lastIndexOf('.');
      const base = url.slice(0, i);
      let ext = url.slice(i);
      ext = suffix && ext == '.svg' ? '.jpg' : ext;
      return base + suffix + ext;
    }
  }


  /**
   * @param {string} location
   * @return {boolean}
   * @export
   */
  isTopoguide(location) {
    return location.indexOf('topoguide') > -1 ||
      location.indexOf('waypoints') > -1 || location.indexOf('routes') > -1 ||
      location.indexOf('images') > -1 || location.indexOf('areas') > -1 ||
      location.indexOf('books') > -1;
  }

  /**
   * http://openlayers.org/en/latest/examples/vector-labels.html
   * http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
   * @param {string} str String to divide.
   * @param {number} width Max string length before wrapping.
   * @param {string} spaceReplacer
   * @return {string}
   */
  stringDivider(str, width, spaceReplacer) {
    if (str.length > width) {
      let p = width;
      while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
        p--;
      }
      if (p > 0) {
        let left;
        if (str.substring(p, p + 1) === '-') {
          left = str.substring(0, p + 1);
        } else {
          left = str.substring(0, p);
        }
        const right = str.substring(p + 1);
        return left + spaceReplacer + this.stringDivider(right, width, spaceReplacer);
      }
    }
    return str;
  }

  /**
   * @param {ngeo.Location} ngeoLocation ngeo Location service.
   * @return {boolean}
   */
  detectDocumentIdFilter(ngeoLocation) {
    // see app.utils.getDoctype() for types definitions
    const associatedDocTypes = ['w', 'r', 'a', 'u'];
    for (let i = 0, n = associatedDocTypes.length; i < n; i++) {
      if (ngeoLocation.hasFragmentParam(associatedDocTypes[i])) {
        return true;
      }
    }
    return false;
  }


  /**
   * Redirects to the login page.
   * @param {string} authUrl
   */
  redirectToLogin(authUrl) {
    const location = window.location;
    let current_url = location.pathname + location.search + location.hash;
    if (location.pathname === '/auth') {
      // do not redirect to the 'auth' page
      current_url = '/';
    }
    location.href = '{login}#to={current}'
      .replace('{login}', authUrl)
      .replace('{current}', encodeURIComponent(current_url));
  }


  /**
   * @param {number} degrees
   * @param {number} minutes
   * @param {number} seconds
   * @param {string} direction
   * @return {number} decimal
   */
  convertDMSToDecimal(degrees, minutes, seconds, direction) {
    let decimal = Number(degrees) + (Number(minutes) / 60) + (parseFloat(seconds) / 3600);
    // Don't do anything for N or E
    if (direction === 'S' || direction === 'W') {
      decimal = decimal * -1;
    }
    return decimal;
  }


  /**
   *  dropdown-menus can overlap the modal and it's impossible
   *  to fix it with overflow-y: srcoll + overflow-x: visible.
   * @param {Object} els elements needed to reposition
   * els: {  menu: the dropdown,
   *            boxBoundEl: the container,
   *            checkBottom: if true - scroll down if the menu overflows the bottom
   *         }
   */
  repositionMenu(els) {
    const boxBoundEl = $(els['boxBoundEl']);
    const menu = $(els['menu']).next();
    menu.css('opacity', 0); // prevent from jumping on the screen

    setTimeout(() => { // because at the moment of the click the menu is hidden and result would give 0.
      const boxBounds = boxBoundEl[0].getBoundingClientRect();
      const menuBounds = menu[0].getBoundingClientRect();
      if (menuBounds.right > boxBounds.right) {
        menu.css('left', -Math.abs(menuBounds.right - boxBounds.right + 10));
      }
      if (els['checkBottom'] && menuBounds.bottom > boxBounds.bottom) {
        boxBoundEl.animate({scrollTop: boxBoundEl.height()}, 'slow');
      }
      menu.css('opacity', 1);
    }, 50);
  }


  /**
   * @param {ol.Feature} feature
   * @return {boolean}
   */
  isLineFeature(feature) {
    return feature.getGeometry() instanceof olGeomLineString ||
      feature.getGeometry() instanceof olGeomMultiLineString;
  }


  /**
   *
   * @param {appx.Route} route
   * @param {Array.<string>} activities
   * @returns {boolean}
   */
  hasActivity(route, activities) {
    if (route !== undefined) {
      return activities.some((activity) => {
        return $.inArray(activity, route.activities) > -1;
      });
    }
    return false;
  }

  /**
   * Because IE11 doesn't support URL() standard.
   * @param {string} url
   */
  getFragment(url) {
    const hashIndex = url.indexOf('#');
    const fragment =  hashIndex < 0 ? null : url.substr(hashIndex + 1);
    if (!fragment) {
      return fragment;
    }
    return decodeURIComponent(fragment);
  }
}
