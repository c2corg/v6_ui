goog.provide('app.ViewDetailsController');
goog.provide('app.viewDetailsDirective');

goog.require('app');
goog.require('app.Document');

/**
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
      }
      ctrl.loadImages_(initGalleries);
      ctrl.watchPswpContainer_();

      // clicking on 'info' btn will open slide from the right and get the infos
      $('.pswp').on('click touchend', '.pswp__button.info', function(e) {
        $('.image-infos, .photoswipe-image-container img').toggleClass('showing-info');
        ctrl.getImageInfo_($(e.target).attr('img-id').split('-')[1]);
      });

      $('.pswp__button--arrow--left, .pswp__button--arrow--right').click(function() {
        $('.showing-info').removeClass('showing-info');
        ctrl.compile_($('.image-infos-buttons').contents())(ctrl.scope_); // recompile the protected-url-btn on each slide change
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
 * @param {string} imageUrl URL to the image backend.
 * @param {string} discourseUrl URL to discourse.
 * @param {app.Url} appUrl
 * @param {app.Lang} appLang Lang service.
 * @constructor
 * @ngInject
 */
app.ViewDetailsController = function($scope, $compile, $uibModal, appApi,
    appDocument, documentData, imageUrl, discourseUrl, appUrl, appLang) {

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
   * @type {app.Url}
   * @private
   */
  this.url_ = appUrl;

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
   * @type {boolean}
   * @private
   */
  this.hasHeadband = false;
  
  /**
   * @type {string}
   * @private
   */
  this.imageUrl_ = imageUrl;

  /**
   * @type {app.Lang}
   * @export
   */
  this.lang = appLang;

  /**
   * @type {string}
   * @private
   */
  this.discourseUrl_ = discourseUrl;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

};


/**
 * @param {string} selector
 * @param {string} sizem
 * @export
 */
app.ViewDetailsController.prototype.openModal = function(selector, sizem) {
  var template = $(selector).clone();
  if (sizem === null) {
    sizem = 'lg';
  }
  this.modal_.open({animation: true, size: sizem, template: this.compile_(template)(this.scope_)});
};


/**
 * @export
 */
app.ViewDetailsController.prototype.scrollToComments = function() {
  $('html, body').animate({
    scrollTop: $('#discourse-comments').offset().top
  }, 1000);
};


/**
 * @param {Event} tab the clicked tab
 * @export
 */
app.ViewDetailsController.prototype.toggleTab = function(tab) {
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
 * blablabla
 @return {string}
 * @export
 */
app.ViewDetailsController.prototype.initHeadband = function() {
  
  console.log(this.documentService.document.associations.images);
  if(this.documentService.document.associations.images.length > 0)
  {
    this.hasHeadband = true;
    console.log(this.documentService.document.associations.images[0])
    //return this.createImageUrl(this.documentService.document.associations.images[0].filename,'');
    return "";
  }
  else {
    this.hasHeadband = false;
    return "";
  }
  
  //return "bla";
}

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

      for (var i = 0; i < thumbElements.length; i++) {
        figureEl = thumbElements[i]; // <figure> element
        linkEl = figureEl.children[0]; // <a> element
        // get the data-info-id and clone into the slide that's being opened
        id = linkEl.getAttribute('data-info-id');
        var image = new Image();
        image['src'] = linkEl.getAttribute('href');

        item = { // create slide object
          html: app.utils.createPhotoswipeSlideHTML(image['src'], id.split('-')[1], '#image-')
         // TODO: for zoom in animation -> add this when WIDTH & HEIGHT will be returned by API in image properties
         // w: image.naturalWidth,
         // h: image.naturalHeight
        };

        // <img> thumbnail element, retrieving thumbnail url (small img)
        if (linkEl.children.length > 0) {
         // ADD  item.src = linkEl.getAttribute('href'); when WIDHT & HEIGHT will be returned
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
          var thumbnail = items[index].el.getElementsByTagName('img')[0];
          var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
          var rect = thumbnail.getBoundingClientRect();
          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        },
        history: false
      };
      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }
      // Pass data to PhotoSwipe and initialize it
      gallery = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options);
      gallery.init();
      this.compile_($('.image-infos-buttons').contents())(this.scope_);  // recompile the protected-url-btn on gallery open
      $('.showing-info').removeClass('showing-info');

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
 * @export
 */
app.ViewDetailsController.prototype.getComments = function() {
  var topic_id = this.documentService.document['topic_id'];
  if (topic_id === null) {
    return;
  }

  // create DiscourseEmbed script tag. From a discourse tutorial.
  // https://meta.discourse.org/t/embedding-discourse-comments-via-javascript/31963
  var s = document.createElement('script');
  /**
   * @export
   * @type {appx.DiscourseEmbedded}
   */
  window.DiscourseEmbed = {
    'discourseUrl': this.discourseUrl_,
    'topicId': topic_id
  };
  s.src = this.discourseUrl_ + 'javascripts/embed.js';
  document.getElementsByTagName('body')[0].appendChild(s);
};


/**
 * @export
 */
app.ViewDetailsController.prototype.createTopic = function() {
  var document = this.documentService.document;
  var document_id = document.document_id;
  var lang = document.lang;
  this.api_.createTopic(document_id, lang).then(function(resp) {
    var topic_id = resp['data']['topic_id'];
    var url = this.discourseUrl_ + 't/' + document_id + '_' + lang + '/' + topic_id;
    window.location = url;
  }.bind(this), function(resp) {
    if (resp.status == 400) {
      var topic_id = resp['data']['errors'][0]['topic_id'];
      if (topic_id !== undefined) {
        this.documentService.document['topic_id'] = topic_id;
        this.getComments();
      }
    }
  }.bind(this));
};


/**
 * @param {Function} initGalleries callback
 * @private
 */
app.ViewDetailsController.prototype.loadImages_ = function(initGalleries) {
  // prepare document images for slideshow
  var photos = this.documentService.document['associations']['images'];
  for (var i in photos) {
    var scope = this.scope_.$new(true);
    var id = 'image-' + photos[i]['document_id'];
    photos[i]['edit_url'] = '/images/edit/' + photos[i]['document_id'] + '/' + photos[i]['locales'][0]['lang'];
    photos[i]['view_url'] = this.url_.buildDocumentUrl('images', photos[i]['document_id'], photos[i]['locales'][0], photos[i]['locales'][0]['lang']);
    photos[i]['image_id'] = id;
    scope['photo'] = photos[i];

    var element = app.utils.createImageSlide(photos[i], this.imageUrl_);
    $('.photos').append(element);
    this.compile_($('#' + id).contents())(scope);
  }

  // prepare the embedded images for slideshow
  $('[class^="embedded_"]').each(function(i, el) {
    $(el).append('<app-slide-info></app-slide-info>');
    var img = $(el).find('img')[0];
    var id = img.getAttribute('img-id');
    var caption = $(el).find('figcaption')[0] ? $(el).find('figcaption')[0].textContent : '';

    var scope = this.scope_.$new(true);
    scope['edit_url'] = '/images/edit/' + id + '/' + this.lang.getLang();
    scope['view_url'] = '/images/' + id + '/' + this.lang.getLang();
    scope['image_id'] = 'embedded-' + id;
    scope['locales'] = [{'title': caption}];

    this.compile_($(el).contents())(scope);
  }.bind(this));

  initGalleries();
};


/**
 * @param {string} imgUrl
 * @param {number} imgId
 * @export
 */
app.ViewDetailsController.prototype.openEmbeddedImage = function(imgUrl, imgId) {
  $('.showing-info').removeClass('showing-info');

  // Replace 'MI' and get the BigImage
  imgUrl = imgUrl.slice(0, -2) + 'BI';
  var embeddedImages = $('.embedded-image');
  var pswpElement = document.querySelectorAll('.pswp')[0];
  var items = [];
  var index;

  for (var i = 0; i <  embeddedImages.length;  i++) {
    var src = embeddedImages[i].src.slice(0, -2) + 'BI';
    var id = parseInt($(embeddedImages[i]).attr('img-id'), 10);

    // add all the other images that are not the one you clicked on
    if (src !== imgUrl) {
      var item = {html: app.utils.createPhotoswipeSlideHTML(src, id, '#embedded-')};
      items.push(item);
    } else {
      var clickedImg = {html: app.utils.createPhotoswipeSlideHTML(imgUrl, imgId, '#embedded-')};
      items.push(clickedImg);
      index = i;
    }
  }

  var gallery = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, {index: index});
  gallery.init();
  this.compile_($('.image-infos-buttons').contents())(this.scope_);
};


/**
 * @param {string} filename
 * @param {string} suffix
 * @return {string}
 * @export
 */
app.ViewDetailsController.prototype.getBandeau = function(filename, suffix) {
  return this.imageUrl_ + app.utils.createImageUrl(filename, suffix);
};



/**
 * @param {string} filename
 * @param {string} suffix
 * @return {string}
 * @export
 */
app.ViewDetailsController.prototype.createImageUrl = function(filename, suffix) {
  return this.imageUrl_ + app.utils.createImageUrl(filename, suffix);
};

/**
 * get the clicked image detailed infos
 * and compile them into the slide
 * @param {number} id
 * @private
 */
app.ViewDetailsController.prototype.getImageInfo_ = function(id) {
  if ($('.showing-info').length > 0) {
    $('.loading-infos').show();
    $('.images-infos-container').hide();

    this.api_.readDocument('images', id, this.lang.getLang()).then(function(res) {
      var imgData = res.data;
      var scope = this.scope_.$new(true);
      angular.extend(scope, imgData);
      this.compile_($('.image-infos'))(scope);
      $('.loading-infos').hide();
      $('.images-infos-container').show();

    }.bind(this));
  }
};


/**
 * remove .showing-info if the container detects swipe/drag
 * @private
 */
app.ViewDetailsController.prototype.watchPswpContainer_ = function() {
  var target = $('.pswp__container')[0];
  if (target) {
    var observer = new MutationObserver(function() {
      $('.showing-info').removeClass('showing-info');
      this.compile_($('.image-infos-buttons').contents())(this.scope_);
    }.bind(this));
    observer.observe(target, {attributes: true, attributeFilter: ['style']});
  }
};

/**
 * @export
 */
app.ViewDetailsController.prototype.printPage = function() {
  window.print();
};

app.module.controller('AppViewDetailsController', app.ViewDetailsController);
