goog.require('app');

goog.provide('app.constants');

/**
 * @const
 * Constants for the module.
 * Access them like app.constants.SCREEN
 */
app.module.constant('constants', app.constants);

app.constants = {
  SCREEN: {
    SMARTPHONE : 768,
    TABLET : 1099,
    DEKTOP : 1400
  },
  STEPS: {
    'climbing_outdoor' : 3,
    'climbing_indoor' :  3,
    'hut' : 3,
    'gite' : 3,
    'shelter' : 3,
    'access' : 3,
    'camp_site' : 3,
    'local_product' : 3,
    'paragliding_takeoff' : 3,
    'paragliding_landing' : 3,
    'weather_station' : 3,
    'webcam': 3
  },
  REQUIRED_FIELDS: {
    'waypoints': ['title' , 'lang', 'waypoint_type', 'elevation', 'longitude', 'latitude', 'url'],
    'articles': ['title', 'activities', 'categories', 'article_type'],
    'books': ['title', 'activities', 'book_types'],
    'routes' : ['title' , 'lang', 'activities', 'waypoints'],
    'outings' : ['title' , 'lang', 'date_start', 'routes', 'activities'],
    'images': ['image_type'],
    'profiles': [],
    'xreports': ['title', 'lang', 'activities', 'event_type', 'longitude', 'latitude'],
    'areas': ['title', 'area_type']
  },
  documentEditing: {
    FORM_PROJ: 'EPSG:4326',
    DATA_PROJ: 'EPSG:3857'
  },
  fullRatingOrdered: ['global_rating', 'rock_rating', 'aid_rating', 'ice_rating', 'mixed_rating',
    'via_ferrata_rating', 'engagement_rating', 'risk_rating', 'equipment_rating', 'exposition_rock_rating',
    'ski_rating', 'labande_rating', 'hiking_rating', 'snowshoe_rating', 'mtb_rating', 'hiking_mtb_exposition']
};
