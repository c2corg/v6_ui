goog.provide('app.OutingsCsvDownloadController');
goog.provide('app.outingsCsvDownloadDirective');

goog.require('app');


/**
 * This directive is used to display a download button for outings in CSV format.
 *
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
app.outingsCsvDownloadDirective = function() {
  return {
    restrict: 'E',
    controller: 'AppOutingsCsvDownloadController',
    controllerAs: 'csvCtrl',
    templateUrl: '/static/partials/outingscsvdownload.html'
  };
};

app.module.directive('appOutingsCsvDownload', app.outingsCsvDownloadDirective);


/**
 * @constructor
 * @struct
 * @ngInject
 */
app.OutingsCsvDownloadController = function() { };


/**
 * @param {goog.events.Event | jQuery.Event} event
 * @export
 */
app.OutingsCsvDownloadController.prototype.download = function(event) {
  event.stopPropagation();
  var filename = 'outings.csv';
  var csvFile = '"toto", "tata"\n"1", "2"';
  var blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
  if (window.navigator.msSaveBlob) { // IE 10+
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};


app.module.controller(
  'AppOutingsCsvDownloadController', app.OutingsCsvDownloadController);
