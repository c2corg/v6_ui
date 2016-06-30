goog.provide('app.ViewDetailsController');
goog.provide('app.viewDetailsDirective');

goog.require('app');
goog.require('app.Document');

/**
 * @ngInject
 * @return {angular.Directive} directive for detailed views
 */
app.viewDetailsDirective = function() {
  return {
    restrict: 'A',
    controller: 'AppViewDetailsController',
    controllerAs: 'detailsCtrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {

      function initGalleries() {
        ctrl.initSlickGallery_();
        ctrl.initPhotoswipe_();
        $('.photos figure').each(function() {
          $(this).css('width', '');
        });
      }
      ctrl.loadImages_(initGalleries);

      $('.pswp__button.info').on('touchend click', function(e) {
        $('.photoswipe-image-container .image-infos, .photoswipe-image-container img').toggleClass('showing-info');
      });

      $('.pswp__button--arrow--left, .pswp__button--arrow--right').click(function() {
        $('.showing-info').removeClass('showing-info');
      });

      var s = app.constants.SCREEN;
      var notPhone = window.matchMedia('(max-width: ' + s.SMARTPHONE + 'px)');

      $('.location-static').css({top: $('app-map').offset().top + 40});

      notPhone.addListener(function(mql) {
        if (mql.matches) {
          $('.location-static').css({top: $('app-map').offset().top + 40});
        }
      });
    }
  };
};

app.module.directive('appViewDetails', app.viewDetailsDirective);


/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {app.Api} appApi Api service.
 * @param {app.Document} appDocument service
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @constructor
 * @export
 * @ngInject
 */
app.ViewDetailsController = function($scope, $compile, $uibModal, appApi,
    appDocument, documentData) {

  /**
   * @type {app.Document}
   * @export
   */
  this.documentService = appDocument;
  this.documentService.setDocument(documentData);

  /**
   * @type {Object}
   * @private
   */
  this.modal_ = $uibModal;

  /**
   * @type {angular.$compile}
   * @private
   */
  this.compile_ = $compile;

  /**
   * @type {app.Api}
   * @private
   */
  this.api_ = appApi;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

};


/**
 * @param {string} selector
 * @export
 */
app.ViewDetailsController.prototype.openModal = function(selector) {
  var template = $(selector).clone();
  this.modal_.open({animation: true, size: 'lg', template: this.compile_(template)(this.scope_)});
};


/**
 * @param {Event} tab the clicked tab
 * @export
 */
app.ViewDetailsController.prototype.openTab = function(tab) {
  var s = app.constants.SCREEN;
  // only for smartphones
  if (window.innerWidth < s.SMARTPHONE) {
    if (tab.target) { // tab = event
      $(tab.target).closest('.name-icon-value').find('.glyphicon-menu-right').toggleClass('rotate-arrow-down');
      $(tab.target).closest('.name-icon-value').find('.accordion').slideToggle();
    }
  }
};


/**
 * Copied and adapted from http://codepen.io/jeffpannone/pen/GpKOed
 * @private
 */
app.ViewDetailsController.prototype.initPhotoswipe_ = function() {
  //Photoswipe configuration for product page zoom
  var initPhotoSwipeFromDOM = function(gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
      var thumbElements = el.childNodes;
      var items = [];
      var figureEl;
      var linkEl;
      var item;
      var id;
      var info;

      for (var i = 0; i < thumbElements.length; i++) {
        figureEl = thumbElements[i]; // <figure> element
        linkEl = figureEl.children[0]; // <a> element
        // get the data-info-id and clone into the slide that's being opened
        id = linkEl.getAttribute('data-info-id');
        info = $(document.getElementById(id));

        var image = new Image();
        var direction = 'horizontal';
        var stretched = false;
        var height;
        var imgHtml;
        var width;
        var margin;
        image['src'] = linkEl.getAttribute('href');
        if (image.naturalHeight > image.naturalWidth) {
          direction = 'vertical';
        }
        // if the image is too small for the screen, don't stretch it and show the original size only.
        if (window.innerWidth > image.naturalWidth + 100 || window.innerHeight > image.naturalHeight + 100) {
          height = image.naturalHeight;
          width = image.naturalWidth;
          margin = 'auto';
          stretched = true;
        }
        if (!stretched) {
          imgHtml = '<img src="' + linkEl.getAttribute('href') + '">';
        } else {
          imgHtml = '<img src="' + linkEl.getAttribute('href') + '" style="height: ' + height + 'px; width: ' + width + 'px; margin: ' + margin + ';">';
        }
        // create slide object
        item = {
          html: '<div class="photoswipe-image-container ' + direction + '">' +
                      info.html() + imgHtml +
                    '</div>'
        };
        // <img> thumbnail element, retrieving thumbnail url (small img)
        if (linkEl.children.length > 0) {
          item.msrc = linkEl.children[0].getAttribute('src');
        }
        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
      }
      return items;
    }.bind(this);

    // find nearest parent element
    var closest = function closest(el, fn) {
      return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    var openPhotoSwipe = function(index, clickedGallery) {
      var pswpElement = document.querySelectorAll('.pswp')[0];
      var gallery;
      var options;
      var items = parseThumbnailElements(clickedGallery);

      // define options (if needed)
      options = {
        index: parseInt(index, 10),
        bgOpacity: 1,
        tapToClose: true,
        tapToToggleControls: true,
        closeOnScroll: false,
        closeOnVerticalDrag: false,
        fullscreenEl: true,
        escKey: true,
        arrowKeys: true,
        preload: [3, 3],
        zoomEl: false,
        counterEl: false,
        shareEl: false,
        arrowEl: true,
        galleryUID: clickedGallery.getAttribute('data-pswp-uid'),
        getThumbBoundsFn: function(index) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          var thumbnail = items[index].el.getElementsByTagName('img')[0]; // find thumbnail
          var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
          var rect = thumbnail.getBoundingClientRect();
          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        }
      };
      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }
      // Pass data to PhotoSwipe and initialize it
      gallery = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options);
      gallery.init();
    }.bind(this);

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;
      var eTarget = e.target || e.srcElement;

      // find root element of slide
      var clickedListItem = closest(eTarget, function(el) {
        return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
      });
      if (!clickedListItem) {
        return;
      }
      // find index of clicked item by looping through all child nodes
      // alternatively, you may define index via data- attribute
      var clickedGallery = clickedListItem.parentNode;
      var childNodes = clickedListItem.parentNode.childNodes;
      var numChildNodes = childNodes.length;
      var nodeIndex = 0;
      var index;

      for (var i = 0; i < numChildNodes; i++) {
        if (childNodes[i].nodeType !== 1) {
          continue;
        }
        if (childNodes[i] === clickedListItem) {
          index = nodeIndex;
          break;
        }
        nodeIndex++;
      }
      // open PhotoSwipe if valid index found
      if (index >= 0) {
        openPhotoSwipe(index, clickedGallery);
      }
      return false;
    };
    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll(gallerySelector);

    for (var i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i + 1);
      galleryElements[i].onclick = onThumbnailsClick;
    }
  }.bind(this);
  // execute above function
  initPhotoSwipeFromDOM('.photos');
};


/**
 * @private
 */
app.ViewDetailsController.prototype.initSlickGallery_ = function() {
  $('.photos').slick({slidesToScroll: 3, dots: false});
};


/**
 * Loads images and appends them to .photos gallery
 * @param {Function} initGalleries callback
 * @private
 */
app.ViewDetailsController.prototype.loadImages_ = function(initGalleries) {
  var photos = this.documentService.document['associations']['images'];
  for (var i in photos) {

    var element = app.utils.createImageSlide(photos[i]);
    $('.photos').append(element);

    var scope = this.scope_.$new(true);
    scope['photo'] = photos[i];
    this.compile_($('#image-' + photos[i]['document_id']).contents())(scope);
  }
  initGalleries();
};


/**
 * @param {string} orientation
 * @param {appx.Document} document
 * @param {goog.events.Event | jQuery.Event} e
 * @export
 */
app.ViewDetailsController.prototype.toggleOrientation = function(orientation, document, e) {
  // Do nothing
};


app.module.controller('AppViewDetailsController', app.ViewDetailsController);
