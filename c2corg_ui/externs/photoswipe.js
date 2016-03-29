  /**
   * @fileoverview Externs for photoswipe
   *
   * @externs
   */


  /**
   * @param {Object} pswpElement
   * @param {Array<Object>} items slides
   * @param {Object | null} PhotoSwipeUI_Default
   * @param {Object} options
   * @constructor
   */
  function PhotoSwipe (pswpElement, PhotoSwipeUI_Default, items, options) {};
  
  
  /**
   * @return {number} index
   */
  PhotoSwipe.prototype.getCurrentIndex = function(){};
  

PhotoSwipe.prototype.init = function() {};

/**
 * @param {string} event 
 * @param {Object} callback function
 * @returns {undefined}
 */
PhotoSwipe.prototype.listen = function(event, callback) {};


/**
 * @param {Object} pswp
 * @param {Object} framework
 */
function PhotoSwipeUI_Default (pswp, framework){};