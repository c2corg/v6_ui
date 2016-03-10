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
    'climbing_outdoor' : 5,
    'climbing_indoor' :  5,
    'hut' : 5,
    'shelter' : 5,
    'access' : 5,
    'local_product' : 5,
    'paragliding_takeoff' : 5,
    'paragliding_landing' : 5
  },
  REQUIRED_FIELDS : {
    waypoint: {
      step_1 : ['title' , 'lang', 'waypoint_type'],
      step_2 : ['longitude', 'latitude', 'elevation'],
      step_3: [],
      step_4: []
    },
    route : {
      step_1 : ['title' , 'lang', 'waypoint_type'],
      step_2 : ['longitude', 'latitude', 'elevation'],
      step_3: [],
      step_4: []
    }
  }
}
