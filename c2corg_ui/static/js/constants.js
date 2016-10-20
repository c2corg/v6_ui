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
    SMARTPHONE : 620,
    TABLET : 1099,
    DEKTOP : 1400
  },
  STEPS: {
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
  REQUIRED_FIELDS: {
    'waypoints': ['title' , 'lang', 'waypoint_type', 'elevation', 'longitude', 'latitude'],
    'articles': ['title', 'activities', 'article_categories', 'article_type'],
    'routes' : ['title' , 'lang', 'activities', 'waypoints'],
    'outings' : ['title' , 'lang', 'date_start', 'routes', 'activities'],
    'images': ['image_type'],
    'profiles': [],
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
