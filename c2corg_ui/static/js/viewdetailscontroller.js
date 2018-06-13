/**
 * @module app.ViewDetailsController
 */
import appBase from './index.js';

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {Object} $uibModal modal from angular bootstrap
 * @param {app.Api} ApiService Api service.
 * @param {app.Document} appDocument service
 * @param {appx.Document} documentData Data set as module value in the HTML.
 * @param {string} imageUrl URL to the image backend.
 * @param {string} discourseUrl URL to discourse.
 * @param {app.Url} appUrl
 * @param {app.Lang} LangService Lang service.
 * @constructor
 * @ngInject
 */
const exports = function($scope, $compile, $uibModal, ApiService,
  appDocument, documentData, imageUrl, discourseUrl, appUrl, LangService) {

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
  this.apiService_ = ApiService;

  /**
   * @type {boolean}
   * @export
   */
  this.hasHeadband = false;

  /**
   * @type {boolean}
   * @export
   */
  this.hasVerticalImg = false;

  /**
   * @type {Array<Object>}
   * @export
   */
  this.comments = [];

  /**
   * @type {string}
   * @export
   */
  this.headBands = '';

  /**
   * @type {number}
   * @private
   */
  this.widestCoef_ = -500;

  /**
   * @type {number}
   * @private
   */
  this.widestImg_ = 0;

  /**
   * @type {string}
   * @private
   */
  this.imageUrl_ = imageUrl;

  /**
   * @type {app.Lang}
   * @export
   */
  this.lang = LangService;

  /**
   * @type {string}
   * @export
   */
  this.discourseUrl = discourseUrl;

  /**
  * @type {boolean}
  * @export
  */
  this.showMobileBlock = /** @type {boolean} */ (JSON.parse(window.localStorage.getItem('showMobileBlock') || 'true'));

  /**
   * @type {Date}
   * @export
   */
  this.date = new Date();

  /**
   * @type {boolean}
   * @export
   */
  this.hasRemarks = this.documentService.document.hasRemarks || false;

  /**
   * @type {boolean}
   * @export
   */
  this.hasBiodivsportAreas = false;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  this.initHeadband();

  this.handleBiodivsportAreas_();

  this.pswpOptions = {
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
    arrowEl: true
  };
};


/**
 * @param {string} selector
 * @param {string} sizem
 * @export
 */
exports.prototype.openModal = function(selector, sizem) {
  const template = $(selector).clone();
  if (sizem === null) {
    sizem = 'lg';
  }
  this.modal_.open({animation: true, size: sizem, template: this.compile_(template)(this.scope_)});
};


/**
 * @export
 */
exports.prototype.scrollToComments = function() {
  $('html, body').animate({
    scrollTop: $('#discourse-comments').offset().top
  }, 1000);
};


/**
 * @param {Event} tab the clicked tab
 * @export
 */
exports.prototype.toggleTab = function(tab) {
  const s = appBase.constants.SCREEN;
  // only for smartphones
  if (window.innerWidth < s.SMARTPHONE) {
    if (tab.target) { // tab = event
      $(tab.target).closest('.name-icon-value').find('.glyphicon-menu-right').toggleClass('rotate-arrow-down');
      $(tab.target).closest('.name-icon-value').find('.accordion').slideToggle();
    }
  }
};


/**
 * hide block with info for the mobile app
 * @export
 */
exports.prototype.toggleMobileBlock = function() {
  this.showMobileBlock = !this.showMobileBlock;
  window.localStorage.setItem('showMobileBlock', JSON.stringify(this.showMobileBlock));
};


/**
 *
 * @export
 */
exports.prototype.initHeadband = function() {
  if (this.documentService.document.activities.indexOf('rock_climbing') > -1 ||
      this.documentService.document.activities.indexOf('mountain_climbing') > -1 ||
      this.documentService.document.activities.indexOf('ice_climbing') > -1) {
    this.hasHeadband = false;
    this.hasVerticalImg = !!this.documentService.document.associations.image;
  } else {
    this.hasVerticalImg = false;
    if (this.documentService.document.associations.images.length == 0) {
      this.hasHeadband = false;
    } else if (this.documentService.document.associations.images.length == 1) {
      this.hasHeadband = true;
      this.scope_.headBands = this.createImageUrl(this.documentService.document.associations.images[this.widestImg_]['filename'], 'BI');
    } else if (this.documentService.document.associations.images.length > 1) {
      this.getBestWideImg(0);
      this.hasHeadband = true;
    }
  }
};


/**
 * get the most wide image
 * @param {number} index
 * @return string
 * @export
 */
exports.prototype.getBestWideImg = function(index) {
  this.getPictureDimension(index, this.createImageUrl(this.documentService.document.associations.images[index]['filename'], 'MI'), (index, w, h) => {
    if (this.widestCoef_ <= w / h) {
      this.widestCoef_ = w / h;
      this.widestImg_ = index;
    }
    if (index == this.documentService.document.associations.images.length - 1 || (this.widestCoef_ > 1 && this.documentService.document.associations.images.length >= 10 && index > 20)) {
      this.scope_.headBands = this.createImageUrl(this.documentService.document.associations.images[this.widestImg_]['filename'], 'BI');
      this.scope_.$apply();
    } else {
      index++;
      this.getBestWideImg(index);
    }
  });

  return {'background-image': 'url(' + this.headBands + ')'};
};


/**
 * load image
 * @param {number} index
 * @param {string} url
 * @param {Function} callback
 * @return string
 * @export
 */
exports.prototype.getPictureDimension = function(index, url, callback) {
  const img = new Image();
  img.src = url;
  img.onload = function() {
    callback(index, this.width, this.height);
  };
};


/**
 * Copied and adapted from http://codepen.io/jeffpannone/pen/GpKOed
 * @private
 */
exports.prototype.initPhotoswipe_ = function() {
  // Photoswipe configuration for product page zoom
  const initPhotoSwipeFromDOM = function(gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    const parseThumbnailElements = function(el) {
      const thumbElements = el.childNodes;
      const items = [];
      let figureEl;
      let linkEl;
      let item;
      let id;
      let title;

      for (let i = 0; i < thumbElements.length; i++) {
        figureEl = thumbElements[i]; // <figure> element
        linkEl = figureEl.children[0]; // <a> element
        // get the data-info-id and clone into the slide that's being opened
        id = linkEl.getAttribute('data-info-id');
        title = linkEl.getAttribute('title');
        const image = new Image();
        image['src'] = linkEl.getAttribute('href');
        item = { // create slide object
          html: appBase.utils.createPhotoswipeSlideHTML(image['src'], id.split('-')[1], '#image-'),
          id: id.split('-')[1],
          title: title
          // TODO: for zoom in animation -> add this when WIDTH & HEIGHT will be returned by API in image properties
          // w: image.naturalWidth,
          // h: image.naturalHeight
        };

        // <img> thumbnail element, retrieving thumbnail url (small img)
        if (linkEl.children.length > 0) {
          // ADD  item.src = linkEl.getAttribute('href'); when WIDTH & HEIGHT will be returned
          item.msrc = linkEl.children[0].getAttribute('src');
        }
        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
      }
      return items;
    }.bind(this);

    // find nearest parent element
    const closest = function closest(el, fn) {
      return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    const openPhotoSwipe = function(index, clickedGallery) {
      const pswpElement = document.querySelectorAll('.pswp')[0];
      const items = parseThumbnailElements(clickedGallery);

      // define options (if needed)
      const options = $.extend(this.pswpOptions, {
        index: parseInt(index, 10),
        galleryUID: clickedGallery.getAttribute('data-pswp-uid'),
        getThumbBoundsFn: function(index) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          const thumbnail = items[index].el.getElementsByTagName('img')[0];
          const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
          const rect = thumbnail.getBoundingClientRect();
          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        }
      });
      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }
      // Pass data to PhotoSwipe and initialize it
      const pswp = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options);
      const lang = this.lang.getLang();
      pswp.listen('beforeChange', () => {
        const id = pswp['currItem']['id'];
        $('.pswp__button--info').attr('data-img-id', id);
        $('.pswp__button--open').attr('href', '/images/' + id + '/' + lang);
        $('.pswp__button--edit').attr('href', '/images/edit/' + id + '/' + lang);
      });
      pswp.init();
      $('.showing-info').removeClass('showing-info');
    }.bind(this);

    // triggers when user clicks on thumbnail
    const onThumbnailsClick = function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;
      const eTarget = e.target || e.srcElement;

      // find root element of slide
      const clickedListItem = closest(eTarget, (el) => {
        return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
      });
      if (!clickedListItem) {
        return;
      }
      // find index of clicked item by looping through all child nodes
      // alternatively, you may define index via data- attribute
      const clickedGallery = clickedListItem.parentNode;
      const childNodes = clickedListItem.parentNode.childNodes;
      const numChildNodes = childNodes.length;
      let nodeIndex = 0;
      let index;

      for (let i = 0; i < numChildNodes; i++) {
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
    const galleryElements = document.querySelectorAll(gallerySelector);

    for (let i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i + 1);
      galleryElements[i].onclick = onThumbnailsClick;
    }
  }.bind(this);
  // execute above function
  initPhotoSwipeFromDOM('.photos');
};


/**
 * @export
 */
exports.prototype.getComments = function() {
  const topic_id = this.documentService.document['topic_id'];
  if (topic_id === null) {
    return;
  }
  const document = this.documentService.document;
  const lang = document.lang;
  this.apiService_.readCommentsForum(topic_id, lang).then((response) => {
    this.handleCommentsForum_(response);
  }, () => { // Error msg is shown in the api service
  });
};

/**
 * Handles forum processing for comments
 * @param response
 * @private
 */
exports.prototype.handleCommentsForum_ = function(response) {
  const data = response['data']['post_stream'];
  if (data !== undefined) {
    for (let i = 0; i < data['posts'].length; i++) {
      if (data['posts'][i]['name'] == 'system') {
        continue;
      }
      this.comments.push({
        'id': data['posts'][i]['id'],
        'username': data['posts'][i]['username'],
        'avatar_template': data['posts'][i]['avatar_template'].replace('{size}', '24'),
        'cooked': data['posts'][i]['cooked'].replace(/<a class="mention" href="/g, '<a class="mention" href="' + this.discourseUrl),
        'created_at': data['posts'][i]['created_at'],
        'reply_count': data['posts'][i]['reply_count'],
        'reply_to_user': data['posts'][i]['reply_to_user']
      });
    }
    this.documentService.document['topic_slug'] = data['posts'][0]['topic_slug'];
  }
};

/**
 * @export
 */
exports.prototype.createTopic = function() {
  const document = this.documentService.document;
  const document_id = document.document_id;
  const lang = document.lang;
  this.apiService_.createTopic(document_id, lang).then((resp) => {
    const topic_id = resp['data']['topic_id'];
    const url = this.discourseUrl + 't/' + document_id + '_' + lang + '/' + topic_id;
    window.location = url;
  }, (resp) => {
    if (resp.status == 400) {
      const topic_id = resp['data']['errors'][0]['topic_id'];
      if (topic_id !== undefined) {
        this.documentService.document['topic_id'] = topic_id;
        this.getComments();
      }
    }
  });
};


/**
 * @param {Function} initGalleries callback
 * @private
 */
exports.prototype.loadImages_ = function(initGalleries) {
  // prepare document images for slideshow
  const photos = this.documentService.document['associations']['images'];

  for (const i in photos) {
    const scope = this.scope_.$new(true);
    const id = 'image-' + photos[i]['document_id'];
    photos[i]['image_id'] = id;
    scope['photo'] = photos[i];
    const element = appBase.utils.createImageSlide(photos[i], this.imageUrl_);
    $('.photos').append(element);
    this.compile_($('#' + id).contents())(scope);
  }

  // prepare the embedded images for slideshow
  $('[class^="embedded_"]').each((i, el) => {
    $(el).append('<app-slide-info></app-slide-info>');
    const img = $(el).find('img')[0];
    const id = img.getAttribute('img-id');
    const caption = $(el).find('figcaption')[0] ? $(el).find('figcaption')[0].textContent : '';

    const scope = this.scope_.$new(true);
    scope['image_id'] = 'embedded-' + id;
    scope['locales'] = [{'title': caption}];

    this.compile_($(el).contents())(scope);
  });

  initGalleries();
};


/**
 * @param {string} imgUrl
 * @param {number} imgId
 * @export
 */
exports.prototype.openEmbeddedImage = function(imgUrl, imgId) {


  $('.showing-info').removeClass('showing-info');

  // Replace 'MI' and get the BigImage
  imgUrl = imgUrl.slice(0, -2) + 'BI';
  const embeddedImages = $('.embedded-image');
  const pswpElement = document.querySelectorAll('.pswp')[0];
  const items = [];
  let index;

  for (let i = 0; i <  embeddedImages.length;  i++) {
    const src = embeddedImages[i].src.slice(0, -2) + 'BI';
    const id = parseInt($(embeddedImages[i]).attr('img-id'), 10);
    let title;
    const putativeFigCaption = embeddedImages[i].nextSibling;
    if (putativeFigCaption.tagName === 'FIGCAPTION') {
      title = putativeFigCaption.textContent;
    }

    // add all the other images that are not the one you clicked on
    if (src !== imgUrl) {
      const item = {
        html: appBase.utils.createPhotoswipeSlideHTML(src, id, '#embedded-'),
        id: id,
        title: title
      };
      items.push(item);
    } else {
      const clickedImg = {
        html: appBase.utils.createPhotoswipeSlideHTML(imgUrl, imgId, '#embedded-'),
        id: imgId,
        title: title
      };
      items.push(clickedImg);
      index = i;
    }
  }

  const pswp = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default,
    items, $.extend(this.pswpOptions, {index: index}));
  const lang = this.lang.getLang();
  pswp.listen('beforeChange', () => {
    const id = pswp['currItem']['id'];
    $('.pswp__button--info').attr('data-img-id', id);
    $('.pswp__button--open').attr('href', '/images/' + id + '/' + lang);
    $('.pswp__button--edit').attr('href', '/images/edit/' + id + '/' + lang);
  });
  pswp.init();
};


/**
 * @param {string} filename
 * @param {string} suffix
 * @return {string}
 * @export
 */
exports.prototype.createImageUrl = function(filename, suffix) {
  return this.imageUrl_ + appBase.utils.createImageUrl(filename, suffix);
};

/**
 * get the clicked image detailed infos
 * and compile them into the slide
 * @param {number} id
 * @private
 */
exports.prototype.getImageInfo_ = function(id) {
  if ($('.showing-info').length > 0) {
    $('.loading-infos').show();
    $('.images-infos-container').hide();

    this.apiService_.readDocument('images', id, this.lang.getLang()).then((res) => {
      const imgData = res.data;
      const scope = this.scope_.$new(true);
      angular.extend(scope, imgData);
      this.compile_($('.image-infos'))(scope);
      $('.loading-infos').hide();
      $('.images-infos-container').show();

    });
  }
};


/**
 * remove .showing-info if the container detects swipe/drag
 * @private
 */
exports.prototype.watchPswpContainer_ = function() {
  const target = $('.pswp__container')[0];
  if (target) {
    const observer = new MutationObserver((() => {
      $('.showing-info').removeClass('showing-info');
    }));
    observer.observe(target, {attributes: true, attributeFilter: ['style']});
  }
};

/**
 * Handles events emitted by map when Biodiv'sport areas are retrieved.
 * @private
 */
exports.prototype.handleBiodivsportAreas_ = function() {
  this.scope_.$on('foundBiodivsportAreas', (event, data) => {
    this.hasRemarks = true;
    this.hasBiodivsportAreas = true;
  });
};

/**
 * @export
 */
exports.prototype.printPage = function() {
  window.print();
};

appBase.module.controller('AppViewDetailsController', exports);


export default exports;
