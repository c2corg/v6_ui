goog.provide('app.YetiController');

goog.require('app');
goog.require('ol.proj');
goog.require('ol.layer.Image');
goog.require('ol.source.ImageStatic');

/**
 * @param {angular.Scope} $scope Directive scope.
 * @param {angular.$http} $http
 * @param {angular.$timeout} $timeout
 * @param {app.Alerts} appAlerts The Alerts service
 * @param {app.Authentication} appAuthentication
 * @constructor
 * @ngInject
 */
app.YetiController = function($scope, $http, $timeout, appAlerts, appAuthentication) {

  /**
   * @const
   * @type {Object}
   * @private
   */
  this.DANGER = {
    min: 1,
    max: 16,
    bra: [
      {min: 1, max: 2, val: 2},
      {min: 3, max: 6, val: 4},
      {min: 7, max: 12, val: 8},
      {min: 13, max: 16, val: 16}
    ]
  };

  /**
   * @const
   * @type {Object}
   * @private
   */
  this.VALID_FORM_DATA = {
    minZoom: 13,
    braMaxMrd: 3
  };

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;
  this.setInitialData_();

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {angular.$timeout}
   * @private
   */
  this.timeout_ = $timeout;

  /**
   * @type {app.Alerts}
   * @private
   */
  this.alerts_ = appAlerts;

  /**
   * @type {string}
   * @private
   */
  this.yetiUrlBase_ = 'https://api.ensg.eu/yeti-wps?request=Execute&service=WPS&version=1.0.0&identifier=Yeti&datainputs=';

  /**
   * @type {string}
   * @private
   */
  this.yetiUrl_ = '';

  /**
   * @type {?ol.layer.Image}
   * @private
   */
  this.yetiLayer_ = null;

  /**
   * @type {?ol.Map}
   * @private
   */
  this.map_ = null;
  this.scope_.$root.$on('responseMap', this.setMap_.bind(this));
  this.timeout_(() => {
    this.scope_.$root.$emit('requestMap');
  });

  /**
   * @type {Object}
   * @export
   */
  this.mapLegend = {};

  /**
   * @type {string|boolean}
   * @export
   */
  this.formError = 'bra';

  /**
   * @type {Object}
   * @private
   */
  this.errors_ = {
    'method': {
      'simple': 'Méthode manquante',
      'full': 'Veuillez sélectionner une méthode pour le calcul'
    },
    'method_bra': {
      'simple': 'Méthode et BRA incompatible',
      'full': 'La méthode MRD (débutant) est autorisée avec un BRA de 3 maximum'
    },
    'bra': {
      'simple': 'BRA manquant',
      'full': 'La valeur de BRA est manquante'
    },
    'altitude': {
      'simple': 'Altitude manquante',
      'full': 'L\'altitude est requise quand le BRA haut et bas sont différents'
    },
    'zoom': {
      'simple': 'Zoom carte trop important',
      'full': 'Veuillez zoomer au niveau ' + this.VALID_FORM_DATA.minZoom + ' minimum'
    },
    'ok': 'Tout semble correct :)',
    'yeti': 'Le service ne fonctionne pas actuellement',
    'yeti_prefix': 'YETI Service: ',
    'yeti_unauthorized': 'Vous devez être autorisé pour effectuer cette requête. Contactez les administrateurs du service si vous êtes intéressé.'
  };

  /**
   * @type {string}
   * @export
   */
  this.currentError = '';

  /**
   * @type {boolean}
   * @export
   */
  this.isProcessing = false;

  /**
   * @type {app.Authentication}
   * @private
   */
  this.auth_ = appAuthentication;

};

/**
 * Set initial scope data
 * @private
 */
app.YetiController.prototype.setInitialData_ = function() {
  // MRD
  this.scope_['bra'] = {};
  // MRE
  this.scope_['rdv'] = {'none': true};
  // MRP
  this.setDanger_();
  this.scope_['wetSnow'] = false;
  this.scope_['groupSize'] = 1;

  // map
  this.scope_['mapZoomOK'] = true;

  // watch every input
  this.scope_.$watchGroup([
    'method',
    'bra.high',
    'bra.low',
    'bra.altiThreshold',
    'bra.isDifferent',
    'mapZoomOK'
  ], this.checkFormData_.bind(this));

  // watch bra.isDifferent
  this.scope_.$watch('bra.isDifferent', this.checkBraIsDifferent_.bind(this));
};

/**
 * Checking form data
 * @private
 */
app.YetiController.prototype.checkFormData_ = function(newValues, oldValues, scope) {
  // verif form
  if (!this.scope_['bra']['high']) {
    this.formError = 'bra';
  } else if (!this.scope_['method']) {
    this.formError = 'method';
  } else if (this.mrdIsNotApplicable_()) {
    this.formError = 'method_bra';
  } else if (
    this.scope_['bra']['low'] &&
    (this.scope_['bra']['high'] != this.scope_['bra']['low']) &&
    !this.scope_['bra']['altiThreshold']) {
    this.formError = 'altitude';
  } else if (!this.scope_['mapZoomOK']) {
    this.formError = 'zoom';
  } else {
    this.formError = false;
  }
  // also
  // verif if bra = 4, method MRD forbidden
  if (this.mrdIsNotApplicable_()) {
    delete this.scope_['method'];
  }
  // then set errors
  this.setCurrentError_();
};

/**
 * Check if bra is different (checkbox)
 * @private
 */
app.YetiController.prototype.checkBraIsDifferent_ = function(newValue, oldValue, scope) {
  // verif bra.isDifferent: empty inputs
  if (!this.scope_['bra']['isDifferent']) {
    delete this.scope_['bra']['low'];
    delete this.scope_['bra']['altiThreshold'];
  }
};

/**
 * Method mrd is not applicable when bra is max
 * @private
 */
app.YetiController.prototype.mrdIsNotApplicable_ = function() {
  return this.scope_['bra']['high'] > this.VALID_FORM_DATA.braMaxMrd && this.scope_['method'] === 'mrd';
};

/**
 * Set current error when filling form data
 * @private
 */
app.YetiController.prototype.setCurrentError_ = function() {
  if (this.formError) {
    this.currentError = this.errors_[this.formError]['simple'];
    if (this.formError === 'zoom') {
      this.currentError += ' (actuel: ' + this.map_.getView().getZoom() + ')';
    }
  } else {
    this.currentError = this.errors_['ok'];
  }
};

/**
 * Set potentialDanger
 * @private
 */
app.YetiController.prototype.setDanger_ = function() {
  this.scope_['potentialDanger'] = this.DANGER.min;
  this.scope_['potentialDangerMin'] = this.DANGER.min;
  this.scope_['potentialDangerMax'] = this.DANGER.max;
  this.scope_['potentialDangerStyle'] = {
    width: this.setWidthCalc_(100),
    marginLeft: this.setMarginLeftCalc_(0)
  };
  this.scope_['potentialDangerLabel'] = [];
  for (let i = 1; i <= this.scope_['potentialDangerMax']; i++) {
    const data = {};
    data['nb'] = i;
    if (i === 2 || i === 4 || i === 8 || i === 16) {
      data['val'] = i;
    }
    this.scope_['potentialDangerLabel'].push(data);
  }
  this.scope_.$watch('bra.high', this.checkBraHigh_.bind(this));
};

/**
 * Set with: calc()
 * @private
 */
app.YetiController.prototype.setWidthCalc_ = function(percent) {
  return 'calc(' + percent + '% - (100% / ' + this.DANGER.max + ' / 2 - 10px) * 2)';
};

/**
 * Set marginLeft: calc()
 * @private
 */
app.YetiController.prototype.setMarginLeftCalc_ = function(percent) {
  return 'calc(' + percent + '% + 100% / ' + this.DANGER.max + ' / 2 - 10px)';
};

/**
 * Check bra.high
 * @private
 */
app.YetiController.prototype.checkBraHigh_ = function(newValue, oldValue, scope) {
  if (newValue) {
    const min = this.DANGER.bra[newValue - 1].min;
    const max = this.DANGER.bra[newValue - 1].max;
    const val = this.DANGER.bra[newValue - 1].val;

    this.scope_['potentialDangerMin'] = min;
    this.scope_['potentialDangerMax'] = max;

    // compute width / margin-left
    this.scope_['potentialDangerStyle'] = {
      width: this.setWidthCalc_(((max - min) + 1) * 100 / this.DANGER.max),
      marginLeft: this.setMarginLeftCalc_((min - 1) * 100 / this.DANGER.max)
    };

    this.scope_['potentialDanger'] = val;
    // hotfix Angular 1.5.8
    // updating min/max AND value of input[range] fails
    this.timeout_(() => {
      angular.element('#inputPotentialDanger').val(val);
    });
  }
};

/**
 * Set ol map
 * @private
 */
app.YetiController.prototype.setMap_ = function(e, {map}) {
  this.map_ = map;
  this.setZoomOK_();
  this.map_.on('moveend', this.setZoomOK_.bind(this));
};

/**
  * Check if zoom is OK
  * @private
  */
app.YetiController.prototype.setZoomOK_ = function() {
  // force updating
  this.scope_['mapZoomOK'] = !this.scope_['mapZoomOK'];
  this.scope_.$apply();
  // then real update
  this.scope_['mapZoomOK'] = this.map_.getView().getZoom() >= this.VALID_FORM_DATA.minZoom;
  this.scope_.$apply();
};

/**
 * Form validation
 * @export
 */
app.YetiController.prototype.compute = function() {
  if (this.formError) {
    this.alerts_.addError(this.errors_[this.formError]['full']);
  } else {
    this.setYetiLayer_();
  }
};

/**
 * Add YETI layer to map
 * @private
 */
app.YetiController.prototype.setYetiLayer_ = function() {
  // start process
  this.isProcessing = true;

  const size = this.map_.getSize();
  const extent = this.map_.getView().calculateExtent(size || null);
  const bbox = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
  this.setYetiUrl_(bbox);

  // if layer already exist, remove it
  if (this.yetiLayer_) {
    this.yetiLayer_.setMap(null);
  }

  // fetch img
  this.http_.get(this.yetiUrl_).then(result => {

    const xml = new DOMParser().parseFromString(result.data, 'application/xml');
    const imageBase64 = xml.getElementsByTagName('wps:ComplexData')[0].textContent;
    const imageBbox = xml.getElementsByTagName('wps:ComplexData')[1].textContent;
    const imageExtent = ol.proj.transformExtent(imageBbox.split(',').map(Number), 'EPSG:4326', 'EPSG:3857');

    this.yetiLayer_ = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: '',
        imageLoadFunction: function(image, src) {
          image.getImage().src = 'data:image/png;base64,' + imageBase64;
        },
        imageExtent: imageExtent
      }),
      opacity: .75
    });

    this.yetiLayer_.setMap(this.map_);

    // set map legend
    const legend = xml.getElementsByTagName('wps:ComplexData')[2].textContent;
    this.setMapLegend_(legend);

  }).catch(err => {
    let errorText = this.errors_['yeti'];
    if (err.status == 400) {
      const xml = new DOMParser().parseFromString(err.data, 'application/xml');
      errorText = [...xml.getElementsByTagName('ExceptionText')].map(_=>_.textContent).join(' ');
    }
    if (err.status == 403) {
      errorText = this.errors_['yeti_unauthorized'];
    }
    this.alerts_.addError(this.errors_['yeti_prefix'] + errorText);
  }).then(() => {
    // end process
    this.isProcessing = false;
  });
};

/**
 * Set full URL
 * @param {Array} bbox Map bounding box
 * @private
 */
app.YetiController.prototype.setYetiUrl_ = function(bbox) {
  // all methods
  const method = this.scope_['method'];
  const bra = this.scope_['bra'];
  // set bra.low / altiThreshold
  const braHigh = bra['high'];
  const braLow = bra['low'] || braHigh;
  const braAltiThreshold = bra['altiThreshold'] || 0;
  // mre
  let compass = 'none';
  // mrp
  let potentialDanger = 0;
  let wetSnow = false;
  let groupSize = 0;

  if (method === 'mre') {
    compass = this.setUrlRdv_(this.scope_['rdv']);
  }

  if (method === 'mrp') {
    potentialDanger = this.scope_['potentialDanger'];
    wetSnow = this.scope_['wetSnow'];
    groupSize = parseInt(this.scope_['groupSize'], 10);
  }
  // create url
  this.yetiUrl_ = this.yetiUrlBase_;
  this.yetiUrl_ += `methode=${method};`;
  this.yetiUrl_ += `bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]};`;
  this.yetiUrl_ += `risque_haut=${braHigh};`;
  this.yetiUrl_ += `risque_bas=${braLow};`;
  this.yetiUrl_ += `seuil_alti=${braAltiThreshold};`;

  this.yetiUrl_ += `rdv=${compass};`;

  this.yetiUrl_ += `potentiel_danger=${potentialDanger};`;
  this.yetiUrl_ += `neige_mouillee=${wetSnow};`;
  this.yetiUrl_ += `taille_groupe=${groupSize}`;

  // username
  const userData = this.auth_.userData;
  if (userData) {
    this.yetiUrl_ += '&username=' + userData['forum_username'];
  }
};

/**
 * @return {string} All directions concatenated
 * @private
 */
app.YetiController.prototype.setUrlRdv_ = function(rdv) {
  return Object.keys(rdv).join(',');
};


/**
 * Set map legend
 * @private
 */
app.YetiController.prototype.setMapLegend_ = function(legend) {
  legend = JSON.parse(legend);
  legend.items.forEach(item => {
    item.color = `rgb(${item.color[0]}, ${item.color[1]}, ${item.color[2]})`;
  });
  this.mapLegend = /** @type {Object} */ (legend);
};

/**
 * Warn about specific case: BRA > 3 when clicking method MRD
 * @export
 */
app.YetiController.prototype.warnAboutMethodBra = function() {
  if (this.scope_['bra']['high'] > this.VALID_FORM_DATA.braMaxMrd) {
    this.alerts_.addError(this.errors_['method_bra']['full']);
  }
};

/**
 * Add/remove direction to scope.rdv
 * @param {string} direction
 * @export
 */
app.YetiController.prototype.setRdv = function(direction) {
  if (this.scope_['rdv'][direction]) {
    delete this.scope_['rdv'][direction];
  } else {
    this.scope_['rdv'][direction] = true;
  }
};

app.module.controller('appYetiController', app.YetiController);
