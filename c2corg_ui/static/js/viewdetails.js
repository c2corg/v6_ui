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
      var onPhone = window.matchMedia('(min-width: ' + (s.SMARTPHONE + 1) + 'px)');

      $('.location-static').css({top: $('app-map').offset().top + 40});

      // show tabs if they have been hidden on smartphone and inversely
      onPhone.addListener(function(mql) {
        if (mql.matches) {
          $('.tab, .accordion').show();
        }
      });

      // show description tab by default or selected tab
      notPhone.addListener(function(mql) {
        if (mql.matches) {
          $('.location-static').css({top: $('app-map').offset().top + 40});
          $('.tab').hide();
          if (!ctrl.selected) {
            $('.description.tab').show();
          } else {
            ctrl.selected.show();
          }
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

  // FIXME: hardcoded for testing (to be removed)
  documentData['associations']['images'] = [
    {'src': 'http://s.camptocamp.org/uploads/images/1463740758_235613570.jpg', date: '23-02-2015', activities: ['hiking, snow'], 'elevation': Math.random(), iso_speed: 100, filename: 'image2.jpg', camera_name: 'Nikon', locales: [{'title' : 'inizio del canale'}], date_time: new Date(), 'fnumber' : 2.3},
    {'src': 'http://s.camptocamp.org/uploads/images/1463694562_1216719818.jpg', date: '23-22-2025', activities: ['hiking'], elevation: Math.random(), iso_speed: 230, filename: 'image1.jpg', camera_name: 'Sony', locales: [{'title' : 'never let me down'}], date_time: new Date(), 'fnumber' : 5.5},
    {'src': 'http://s.camptocamp.org/uploads/images/1463694970_824684659.jpg', date: new Date(), activities: ['snow'], elevation: Math.random(), iso_speed: 400, filename: 'image231.jpg', camera_name: 'Canon', locales: [{'title' : 'my favorite place'}], date_time: new Date(), 'fnumber' : 4.2},
    {'src': 'http://s.camptocamp.org/uploads/images/1463741192_488006925.jpg', date: '23-323', activities: ['hiking, snow, ski'], elevation: Math.random(), iso_speed: 1200, filename: 'image94.jpg', camera_name: 'Fuji', locales: [{'title' : 'superb view'}]},
    {'src': 'http://s.camptocamp.org/uploads/images/1463694980_966569102.jpg', date: '099-02-2015', activities: ['paragliding'], elevation: Math.random(), iso_speed: 2300, filename: 'image55.jpg', camera_name: 'Sigma', locales: [{'title' : 'great view'}] , date_time: new Date(), 'fnumber' : 10}
  ];

  this.documentService.setDocument(documentData);

  /**
   * Used to pass the associated images to the slideshow
   * FIXME: use the documentService instead of passing 'document' to the scope?
   * @type {appx.Document}
   */
  this.scope_['document'] = this.documentService.document;

  this.scope_.$on('unassociateDoc', function(e, doc) {
    this.documentService.removeAssociation(doc['id'], doc['type']);
  }.bind(this));
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
    } else {
      this.selected = $('.tab.' + tab);
      $('.tab').hide();
      $('.tab.' + tab).show();
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
        image['src'] = linkEl.getAttribute('href');
        if (image.naturalHeight > image.naturalWidth) {
          direction = 'vertical';
        }

        // create slide object
        item = {
          html: '<div class="photoswipe-image-container ' + direction + '">' +
                  info.html() +
                  '<img src="' + linkEl.getAttribute('href') + '">' +
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
  $('.photos').slick({
    slidesToScroll: 2,
    dots: false
  });
};


/**
 * Loads images and appends them to .photos gallery
 * @param {Function} initGalleries callback
 * @private
 */
app.ViewDetailsController.prototype.loadImages_ = function(initGalleries) {
  var photos = this.scope_['document']['associations']['images'];
  for (var i in photos) {
    photos[i]['id'] = 'image-' + (+new Date());

    var element = app.utils.createImageSlide(photos[i], 'loaded-' + photos[i]['id']);
    $('.photos').append(element);

    var scope = this.scope_.$new(true);
    scope['photo'] = photos[i];
    this.compile_($('.photos figure:last-of-type').contents())(scope);
  }
  initGalleries();
};


app.module.controller('AppViewDetailsController', app.ViewDetailsController);
