goog.provide('app.ElevationProfileController');

goog.require('app');
goog.require('ol.proj');

/**
 * @param {angular.Scope} $scope Scope.
 * @param {?GeoJSONFeatureCollection} mapFeatureCollection FeatureCollection of
 *    features shown on the map.
 * @param {app.Lang} appLang Lang service.
 * @param {ngeo.Debounce} ngeoDebounce ngeo Debounce service.
 * @constructor
 * @ngInject
 */
app.ElevationProfileController = function(
  $scope,
  mapFeatureCollection,
  appLang,
  ngeoDebounce
) {

  /**
   * @type {angular.Scope}
   * @private
   */
  this.scope_ = $scope;

  /**
   * @type {?GeoJSONFeatureCollection}
   * @private
   */
  this.featureCollection_ = mapFeatureCollection;

  /**
   * @private
   * @type {ngeo.Debounce}
   */
  this.ngeoDebounce_ = ngeoDebounce;

  /**
   * @export
   */
  this.mode = 'distance';

  /**
   * @private
   */
  this.i18n_ = {
    elevation: appLang.gettext('Elevation'),
    elevation_legend: appLang.gettext('Elevation (m)'),
    meters: appLang.gettext('meters'),
    distance: appLang.gettext('Distance'),
    distance_legend: appLang.gettext('Distance (km)'),
    km: appLang.gettext('kilometers'),
    time: appLang.gettext('Time'),
    duration: appLang.gettext('Duration'),
    duration_legend: appLang.gettext('Duration (hrs)')
  };

  const lines = mapFeatureCollection.features.filter((feature) => {
    return feature.geometry.type === 'LineString' ||
           feature.geometry.type === 'MultiLineString';
  });
  if (!lines) {
    $('#elevation-profile-title').remove();
    $('#elevation-profile').closest('.finfo').remove();
    return;
  }

  let coords = [];
  if (lines[0].geometry.type === 'MultiLineString') {
    lines[0].geometry.coordinates.forEach((linestring) => {
      coords = coords.concat(linestring);
    });
  } else {
    coords = lines[0].geometry.coordinates;
  }

  // we consider the track contains time if all points have this information
  const timeAvailable = coords.every((coord) => {
    return coord.length > 3;
  });
  this.timeAvailable = timeAvailable;
  const startDate = timeAvailable ? new Date(coords[0][3] * 1000) : undefined;
  let totalDist = 0;

  this.data = coords.map((coord, i, coords) => {
    const date = timeAvailable ? new Date(coord[3] * 1000) : undefined;
    let d = 0;
    if (i > 0) {
      // convert from web mercator to lng/lat
      const deg1 = ol.proj.transform(
        [coords[i][0], coords[i][1]],
        'EPSG:3857',
        'EPSG:4326'
      );
      const deg2 = ol.proj.transform(
        [coords[i - 1][0], coords[i - 1][1]],
        'EPSG:3857',
        'EPSG:4326'
      );
      // arc distance x earth radius
      d = window.d3.geo.distance(deg1, deg2) * 6371;
    }
    totalDist += d;
    return {
      date: date,
      ele: coord[2] || 0,
      d: totalDist,
      elapsed: timeAvailable ? date - startDate : undefined
    };
  });
  if (
    !this.data.find((coord) => {
      return coord.ele > 0;
    })
  ) {
    $('#elevation-profile-title').remove();
    $('#elevation-profile').closest('.finfo').remove();
    return;
  }
  this.createChart_();
};

/**
 * @private
 */
app.ElevationProfileController.prototype.createChart_ = function() {
  const wrapper = $('#elevation-profile').closest('.finfo');
  let width = wrapper.width();
  const size = {
    width: width,
    height: 300
  };
  this.margin = {
    top: 40,
    right: 20,
    bottom: 30,
    left: 50
  };
  width = size.width - this.margin.left - this.margin.right;
  const height = size.height - this.margin.top - this.margin.bottom;

  if (!this.timeAvailable) {
    $('.xaxis-dimension').hide();
  }

  const d3 = window.d3;

  // Add an SVG element with the desired dimensions and margin
  this.svg = d3
    .select('#elevation-profile-chart')
    .append('svg')
    .attr('width', width + this.margin.left + this.margin.right)
    .attr('height', height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr(
      'transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')'
    );

  // Scales and axes
  this.x1 = d3.scale.linear().range([0, width]);

  this.y = d3.scale.linear().range([height, 0]);

  this.x1Axis = d3.svg.axis().scale(this.x1).orient('bottom');

  this.yAxis = d3.svg
    .axis()
    .scale(this.y)
    .tickFormat(d3.format('.0f'))
    .orient('left');

  this.x1
    .domain(
      d3.extent(this.data, (d) => {
        return d.d;
      })
    )
    .nice();

  const yExtent = d3.extent(this.data, (d) => {
    return d.ele;
  });
  this.y.domain(yExtent).nice();

  if (this.timeAvailable) {
    this.x2 = d3.time.scale().range([0, width]);

    this.x2Axis = d3.svg
      .axis()
      .scale(this.x2)
      .tickFormat((t) => {
        // force display of elapsed time as hrs:mins. It is not datetime!
        return (
          ~~(t / 3600000) + ':' + d3.format('02d')(~~(t % 3600000 / 60000))
        );
      })
      .orient('bottom');

    this.x2
      .domain(
        d3.extent(this.data, (d) => {
          return d.elapsed;
        })
      )
      .nice(d3.time.hour);
  }

  this.svg
    .append('g')
    .attr('class', 'y axis')
    .call(this.yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text(this.i18n_.elevation_legend);

  this.svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(this.x1Axis)
    .append('text')
    .attr('x', size.width - this.margin.left - this.margin.right)
    .attr('dy', '-.71em')
    .attr('class', 'x axis legend')
    .style('text-anchor', 'end')
    .text(this.i18n_.distance_legend);

  // data lines
  this.dLine = d3.svg
    .line()
    .x(
      (d) => {
        return this.x1(d.d);
      }
    )
    .y(
      (d) => {
        return this.y(d.ele);
      }
    );

  if (this.timeAvailable) {
    this.tLine = d3.svg
      .line()
      .x(
        (d) => {
          return this.x2(d.elapsed);
        }
      )
      .y(
        (d) => {
          return this.y(d.ele);
        }
      );
  }

  // display line path
  this.line = this.svg
    .append('path')
    .datum(this.data)
    .attr('class', 'line')
    .attr('d', this.dLine);

  // Display point information one hover
  this.focusv = this.svg
    .append('line')
    .attr('class', 'target')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', size.height - this.margin.bottom - this.margin.top)
    .style('display', 'none');

  this.focush = this.svg
    .append('line')
    .attr('class', 'target')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', size.width - this.margin.right - this.margin.left)
    .attr('y2', 0)
    .style('display', 'none');

  this.focus = this.svg
    .append('circle')
    .attr('class', 'circle')
    .attr('r', 4.5)
    .style('display', 'none');

  this.bubble1 = this.svg
    .append('text')
    .attr('x', (size.width - this.margin.left - this.margin.right) / 2)
    .attr('dy', '-.71em')
    .attr('class', 'bubble')
    .style('text-anchor', 'middle')
    .style('display', 'none')
    .text('');
  this.bubble2 = this.svg
    .append('text')
    .attr('x', (size.width - this.margin.left - this.margin.right) / 2)
    .attr('dy', '-1.71em')
    .attr('class', 'bubble')
    .style('text-anchor', 'middle')
    .style('display', 'none')
    .text('');

  this.svg
    .append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height)
    .on(
      'mouseover',
      () => {
        this.focus.style('display', null);
        this.focush.style('display', null);
        this.focusv.style('display', null);
        this.bubble1.style('display', null);
        this.bubble2.style('display', null);
      }
    )
    .on(
      'mouseout',
      () => {
        this.focus.style('display', 'none');
        this.focush.style('display', 'none');
        this.focusv.style('display', 'none');
        this.bubble1.style('display', 'none');
        this.bubble2.style('display', null);
      }
    )
    .on('mousemove', this.mousemove_.bind(this));

  // listen to changes to mode variable to update chart
  this.scope_.$watch(
    () => {
      return this.mode;
    },
    this.updateChart_.bind(this)
  );
  // listen to width changes to redraw graph
  $(window).on(
    'resize',
    this.ngeoDebounce_(this.resizeChart_.bind(this), 300, true)
  );
};

/**
 * @private
 */
app.ElevationProfileController.prototype.updateChart_ = function() {
  const nLine = this.mode === 'distance' ? this.dLine : this.tLine;
  const axis = this.mode === 'distance' ? this.x1Axis : this.x2Axis;
  const legend = this.mode === 'distance' ?
    this.i18n_.distance_legend :
    this.i18n_.duration_legend;
  this.line.transition().duration(1000).attr('d', nLine);

  window.d3.select('.x.axis').call(axis);
  window.d3.select('.x.axis.legend').text(legend);
};

/**
 * @private
 */
app.ElevationProfileController.prototype.resizeChart_ = function() {
  const wrapper = $('#elevation-profile').closest('.finfo');
  const width = wrapper.width() - this.margin.left - this.margin.right;
  const div = window.d3.select('#elevation-profile');

  this.x1.range([0, width]);
  if (this.timeAvailable) {
    this.x2.range([0, width]);
  }
  const axis = this.mode === 'distance' ? this.x1Axis : this.x2Axis;
  div.select('.x.axis').call(axis);
  div.select('.x.axis.legend').attr('x', width);
  this.line.attr('d', this.mode === 'distance' ? this.dLine : this.tLine);
  this.focush.attr('x2', width);
  this.bubble1.attr('x', (width - this.margin.left - this.margin.right) / 2);
  this.bubble2.attr('x', (width - this.margin.left - this.margin.right) / 2);
  div.select('svg').attr('width', width + this.margin.left + this.margin.right);
  div.select('rect.overlay').attr('width', width);

  this.focus.style('display', null);
  this.focush.style('display', null);
  this.focusv.style('display', null);
  this.bubble1.style('display', null);
  this.bubble2.style('display', null);
};

/**
 * @private
 */
app.ElevationProfileController.prototype.mousemove_ = function() {
  const d3 = window.d3;
  const bisectDistance = d3.bisector((d) => {
    return d.d;
  }).left;
  const bisectDate = d3.bisector((d) => {
    return d.elapsed;
  }).left;
  const formatDistance = d3.format('.2f');
  const formatDate = d3.time.format('%H:%M');
  const formatMinutes = d3.format('02d');

  const bisect = this.mode === 'distance' ? bisectDistance : bisectDate;
  const x0 = this.mode === 'distance' ?
    this.x1.invert(d3.mouse(this.svg.node())[0]) :
    this.x2.invert(d3.mouse(this.svg.node())[0]);
  const i = bisect(this.data, x0, 1, this.data.length - 1);
  const d0 = this.data[i - 1];
  const d1 = this.data[i];
  const d = this.mode === 'distance' ?
    x0 - d0.d > d1.d - x0 ? d1 : d0 :
    x0 - d0.elapsed > d1.elapsed - x0 ? d1 : d0;

  const dy = this.y(d.ele);
  const dx = this.mode === 'distance' ? this.x1(d.d) : this.x2(d.elapsed);

  this.focus.attr('transform', 'translate(' + dx + ',' + dy + ')');
  this.focush.attr('transform', 'translate(0,' + dy + ')');
  this.focusv.attr('transform', 'translate(' + dx + ',0)');

  this.bubble1.text(
    this.i18n_.elevation +
      ' ' +
      d.ele +
      this.i18n_.meters +
      ' / ' +
      this.i18n_.distance +
      ' ' +
      formatDistance(d.d) +
      this.i18n_.km
  );
  if (this.timeAvailable) {
    const elapsed = d.elapsed / 1000;
    this.bubble2.text(
      this.i18n_.time +
        ' ' +
        formatDate(d.date) +
        ' / ' +
        this.i18n_.duration +
        ' ' +
        ~~(elapsed / 3600) +
        ':' +
        formatMinutes(~~(elapsed % 3600 / 60))
    );
  }
};

app.module.controller(
  'appElevationProfileController',
  app.ElevationProfileController
);
