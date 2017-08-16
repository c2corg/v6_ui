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
        ctrl.initPhotoswipe_();
      }

      ctrl.loadImages_(initGalleries);

      ctrl.watchPswpContainer_();

      // clicking on 'info' btn will open slide from the right and get the infos
      $('.pswp').on('click touchend', '.pswp__button--info', function(e) {
        $('.image-infos, .photoswipe-image-container img').toggleClass('showing-info');
        ctrl.getImageInfo_($(e.target).attr('data-img-id'));
      });

      $('.pswp__button--arrow--left, .pswp__button--arrow--right').click(function() {
        $('.showing-info').removeClass('showing-info');
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
  this.headBands = "";

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


  this.initHeadband();

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
 * @export
 */
app.ViewDetailsController.prototype.initHeadband = function() {


  if(this.documentService.document.activities.indexOf('rock_climbing') > -1 || this.documentService.document.activities.indexOf('mountain_climbing') > -1 || this.documentService.document.activities.indexOf('ice_climbing') > -1 ) {

    this.hasHeadband = false;
    if(this.documentService.document.associations.images.length == 0) {
      this.hasVerticalImg = false;
    }
    else{
      this.hasVerticalImg = true;
    }
  }
  else
  {
    
    this.hasVerticalImg = false;
    if(this.documentService.document.associations.images.length == 0)
    {
      this.hasHeadband = false;
    } else if(this.documentService.document.associations.images.length == 1)
    {
      this.hasHeadband = true;
      this.scope_.headBands = this.createImageUrl(this.documentService.document.associations.images[this.widestImg_]['filename'],'BI');     
    } else if(this.documentService.document.associations.images.length > 1) {
      this.getBestWideImg();
      this.hasHeadband = true;
    }
    else {
      this.hasHeadband = false;
    }
   
  }
}


/**
 * get the most wide image
 * @return string
 * @export
 */
app.ViewDetailsController.prototype.getBestWideImg = function() {

  for(var i = 0;i < this.documentService.document.associations.images.length;i++)
  {
    this.getMeta(i,this.createImageUrl(this.documentService.document.associations.images[i]['filename'],'BI'),function(index,w,h) {

      if(this.widestCoef_ < w/h) {
        this.widestCoef_ = w/h;
        this.widestImg_ = index;

      } 
      console.log("coef = " +w/h +" index = " + index);

      if(index ==  this.documentService.document.associations.images.length-1) {
        console.log("on set le bandeau")



        this.scope_.headBands = this.createImageUrl(this.documentService.document.associations.images[this.widestImg_]['filename'],'BI');
        this.scope_.$apply();
      }

    }.bind(this))
  }
  return {'background-image': 'url('+this.headBands+')'} 
  //return this.headBands;

  //return "bla";
}

/**
 * load image
 * @param {number} index
 * @param {string} url
 * @param {Function} callback
 * @return string
 * @export
 */

app.ViewDetailsController.prototype.getMeta = function(index,url, callback) {
  var img = new Image();
  img.src = url;
  img.onload = function() { callback(index,this.width, this.height); }
}



/**
 * Copied and adapted from http://codepen.io/jeffpannone/pen/GpKOed
 * @private
 */
app.ViewDetailsController.prototype.initPhotoswipe_ = function() {
  // Photoswipe configuration for product page zoom
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
      var title;

      for (var i = 0; i < thumbElements.length; i++) {
        figureEl = thumbElements[i]; // <figure> element
        linkEl = figureEl.children[0]; // <a> element
        // get the data-info-id and clone into the slide that's being opened
        id = linkEl.getAttribute('data-info-id');
        title = linkEl.getAttribute('title');
        var image = new Image();
        image['src'] = linkEl.getAttribute('href');

        item = { // create slide object
          html: app.utils.createPhotoswipeSlideHTML(image['src'], id.split('-')[1], '#image-'),
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
    var closest = function closest(el, fn) {
      return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    var openPhotoSwipe = function(index, clickedGallery) {
      var pswpElement = document.querySelectorAll('.pswp')[0];
      var gallery;
      var options;
      var items = parseThumbnailElements(clickedGallery);

      // define options (if needed)
      options = $.extend(this.pswpOptions, {
        index: parseInt(index, 10),
        galleryUID: clickedGallery.getAttribute('data-pswp-uid'),
        getThumbBoundsFn: function(index) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          var thumbnail = items[index].el.getElementsByTagName('img')[0];
          var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
          var rect = thumbnail.getBoundingClientRect();
          return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
        }
      });
      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }
      // Pass data to PhotoSwipe and initialize it
      var pswp = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items, options);
      var lang = this.lang.getLang();
      pswp.listen('beforeChange', function() {
        var id = pswp['currItem']['id'];
        $('.pswp__button--info').attr('data-img-id', id);
        $('.pswp__button--open').attr('href', '/images/' + id + '/' + lang);
        $('.pswp__button--edit').attr('href', '/images/edit/' + id + '/' + lang);
      });
      pswp.init();
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


  $('.photos').slick({slidesToScroll: 3, dots: false});


/**
 * @export
 */
app.ViewDetailsController.prototype.getComments = function() {
  console.log("on get les commentaires")
    var topic_id = this.documentService.document['topic_id'];
  if (topic_id === null) {
    return;
  }
    var document = this.documentService.document;
  var lang = document.lang;
    this.api_.readCommentsForum( topic_id,lang).then(function(response) {
      console.log("reponse")
    this.handleCommentsForum(response);
  }.bind(this), function() { // Error msg is shown in the api service
    
    //this.busyForum = false;
    //this.errorForum = true;
    
  }.bind(this));
/*
  //this.busyForum = true;
  this.api.readForumComments().then(function(response) {
    this.handleForum(response);
  }.bind(this), function() { // Error msg is shown in the api service
    
    //this.busyForum = false;
    //this.errorForum = true;
    
  }.bind(this));

  */
  /*
  var topic_id = this.documentService.document['topic_id'];
  if (topic_id === null) {
    return;
  }

  // create DiscourseEmbed script tag. From a discourse tutorial.
  // https://meta.discourse.org/t/embedding-discourse-comments-via-javascript/31963
  var s = document.createElement('script');

  window.DiscourseEmbed = {
    'discourseUrl': this.discourseUrl_,
    'topicId': topic_id
  };
  s.src = this.discourseUrl_ + 'javascripts/embed.js';
  document.getElementsByTagName('body')[0].appendChild(s);
  */
  
};

/**
 * Handles forum processing for Feed.js
 * @param response
 * @public
 */
app.ViewDetailsController.prototype.handleCommentsForum = function(response) {
  /*
  this.errorForum = false;
  this.busyForum = false;
  */
  var data = response['data'];
  var postersAvatar = {};
  if (data['post_stream'] !== undefined) {
    /*
    for (var j = 0; j < data['post_stream'].length; j++) {
      postersAvatar[data['users'][j]['username']] = data['users'][j]['avatar_template'].replace('{size}','24');
    }
*/
   
    for (var i = 0; i < data['post_stream']['posts'].length; i++) {
      console.log(data['post_stream']['posts'][i]);
      if(data['post_stream']['posts'][i]['name'] == "system")
        continue;
      
      this.comments.push({'id':data['post_stream']['posts'][i]['id'], 'username':data['post_stream']['posts'][i]['username'],'avatar_template':data['post_stream']['posts'][i]['avatar_template'].replace("{size}","24"),'cooked':data['post_stream']['posts'][i]['cooked'].replace(/<a class="mention" href="/g,'<a class="mention" href="'+this.discourseUrl_),'created_at':data['post_stream']['posts'][i]['created_at'],'reply_count':data['post_stream']['posts'][i]['reply_count'],'reply_to_user':data['post_stream']['posts'][i]['reply_to_user']});
    }
    
     this.documentService.document['topic_slug'] = data['post_stream']['posts'][0]['topic_slug'];
 
  }
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
  console.log("on init le bouzin");
  // prepare document images for slideshow
  var photos = this.documentService.document['associations']['images'];

  for (var i in photos) {
  
    var scope = this.scope_.$new(true);
    var id = 'image-' + photos[i]['document_id'];
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
    var title = undefined;
    var putativeFigCaption = embeddedImages[i].nextSibling;
    if (putativeFigCaption.tagName === 'FIGCAPTION') {
      title = putativeFigCaption.textContent;
    }

    // add all the other images that are not the one you clicked on
    if (src !== imgUrl) {
      var item = {
        html: app.utils.createPhotoswipeSlideHTML(src, id, '#embedded-'),
        id: id,
        title: title
      };
      items.push(item);
    } else {
      var clickedImg = {
        html: app.utils.createPhotoswipeSlideHTML(imgUrl, imgId, '#embedded-'),
        id: imgId,
        title: title
      };
      items.push(clickedImg);
      index = i;
    }
  }
  
  var pswp = new window.PhotoSwipe(pswpElement, window.PhotoSwipeUI_Default, items,
    $.extend(this.pswpOptions, {index: index}));
  var lang = this.lang.getLang();
  pswp.listen('beforeChange', function() {
    var id = pswp['currItem']['id'];
    $('.pswp__button--info').attr('data-img-id', id);
    $('.pswp__button--open').attr('href', '/images/' + id + '/' + lang);
    $('.pswp__button--edit').attr('href', '/images/edit/' + id + '/' + lang);
  });
  pswp.init();
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
