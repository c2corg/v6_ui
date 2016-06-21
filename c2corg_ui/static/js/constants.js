goog.require('app');

goog.provide('app.constants');

/**
 * @const
 * Constants for the module.
 * Access them like app.constants.SCREEN
 */
app.module.constant('constants', app.constants);

app.constants = {
  SCREEN : {
    SMARTPHONE : 620,
    TABLET : 1099,
    DEKTOP : 1400
  },
  STEPS : {
    'climbing_outdoor' : 4,
    'climbing_indoor' :  4,
    'hut' : 4,
    'gite' : 4,
    'shelter' : 4,
    'access' : 4,
    'camp_site' : 4,
    'local_product' : 4,
    'paragliding_takeoff' : 4,
    'paragliding_landing' : 4,
    'webcam': 4
  },
  REQUIRED_FIELDS : {
    waypoints: ['title' , 'lang', 'waypoint_type', 'elevation', 'longitude', 'latitude'],
    routes : ['title' , 'lang', 'activities'],
    outings : ['title' , 'lang', 'date_start', 'routes', 'activities']
  },
  documentEditing: {
    FORM_PROJ: 'EPSG:4326',
    DATA_PROJ: 'EPSG:3857'
  },
  discourseURL: 'http://c2corgv6-discourse.demo-camptocamp.com/',
  imagesURL : 'http://s.camptocamp.org/uploads/images/'
};
