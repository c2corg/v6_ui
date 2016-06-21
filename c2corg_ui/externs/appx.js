/**
 * @type {Object}
 */
var appx;


/**
 * @typedef {{
 *   username: string,
 *   token: string,
 *   expire: number,
 *   roles: Array.<string>,
 *   redirect: string,
 *   remember: boolean
 * }}
 */
appx.AuthData;


/**
 * @typedef {{
 *   routes: appx.SimpleSearchDocumentResponse,
 *   waypoints: appx.SimpleSearchDocumentResponse
 * }}
 */
appx.SimpleSearchResponse;


/**
 * @typedef {{
 *   total: number,
 *   documents: Array.<appx.SimpleSearchDocument>
 * }}
 */
appx.SimpleSearchDocumentResponse;


/**
 * @typedef {{
 *   document_id: number,
 *   locales: Array.<appx.SimpleSearchDocumentLocale>,
 *   document_type: string,
 *   label: string,
 *   documentType: string
 * }}
 */
appx.SimpleSearchDocument;


/**
 * @typedef {{
 *   title: string,
 *   title_prefix: ?string,
 *   lang: string
 * }}
 */
appx.SimpleSearchDocumentLocale;


/**
 * @typedef {{
 *  msg: (string|Object),
 *  type: ?string,
 *  timeout: ?number
 * }}
 */
appx.AlertMessage;


/**
 * @typedef {{
 *   email: string
 * }}
 */
appx.auth.RequestChangePassword;


// TODO: extern for users + add it to associations

/**
 * @typedef {{
 *   images: Array.<appx.Image>,
 *   users: ?Array.<Object>,
 *   routes: ?Array.<appx.Route>,
 *   waypoints: ?Array.<appx.Waypoint>,
 *   waypoint_children: ?Array.<appx.Waypoint>,
 *   recent_outings: ?appx.RecentOutings,
 *   all_routes: ?appx.AllRoutes
 * }}
 */
appx.DocumentAssociations;


/**
 * @typedef {{
 *   associations: appx.DocumentAssociations,
 *   locales: Array.<Object>,
 *   type : string,
 *   quality: string,
 *   document_id: number
 * }}
 */
appx.Document;


/**
 * @typedef {{
 *   associations: appx.DocumentAssociations,
 *   locales: Array.<Object>,
 *   type : string,
 *   quality: string,
 *   document_id: number,
 *
 *   geometry: Object,
 *   date_start: (string | Date),
 *   date_end: (string | Date),
 *   activities : Array.<Object>,
 *   frequentation: string,
 *   participant_count : (number | string),
 *   elevation_min : number,
 *   elevation_max : number,
 *   elevation_up_snow: number,
 *   elevation_down_snow: number,
 *   snow_quantity: string,
 *   snow_quality: string,
 *   glacier_rating: string,
 *   duration: number,
 *   avalanche_signs: string,
 *   elevation_access: number,
 *   height_diff_up: number,
 *   height_diff_down: number,
 *   length_total: number,
 *   partial_trip: boolean,
 *   public_transport: string,
 *   access_condition: string,
 *   lift_status: string,
 *   awesomeness: string,
 *   condition_rating: string,
 *   hut_status: string,
 * }}
 */
appx.Outing;


/**
 * @typedef {{
 *   associations: appx.DocumentAssociations,
 *   locales: Array.<Object>,
 *   type : string,
 *   quality: string,
 *   document_id: number,
 *
 *   height_diff_up: number,
 *   height_diff_down: number,
 *   height_diff_access: number,
 *   height_diff_difficulties: number,
 *   lift_access: boolean,
 *   elevation_min : number,
 *   elevation_max : number,
 *   route_type: Array.<string>,
 *   orientations: Array.<string>,
 *   durations: number,
 *   main_waypoint_id: number,
 *   activities: Array.<Object>,
 *   route_length: number,
 *   configuration: Array.<string>,
 *   ski_rating: string,
 *   ski_exposition: string,
 *   labande_ski_rating: string,
 *   labande_global_rating: string,
 *   difficulties_height: number,
 *   engagement_rating: string,
 *   equipment_rating: string,
 *   global_rating: string,
 *   ice_rating: string,
 *   geometry: Object,
 *   risk_rating: string,
 *   rock_types: Array.<string>,
 *   mixed_rating: string,
 *   glacier_gear: string,
 *   exposition_rock_rating: string,
 *   rock_free_rating: string,
 *   rock_required_rating: string,
 *   aid_rating: string,
 *   climbing_outdoor_type: string,
 *   hiking_mtb_exposition: string,
 *   hiking_rating: string,
 *   snowshoe_rating: string,
 *   mtb_up_rating: string,
 *   mtb_down_rating: string,
 *   mtb_length_asphalt: string,
 *   mtb_length_trail: string,
 *   mtb_height_diff_portages: string,
 *   via_ferrata_rating: string
 * }}
 */
appx.Route;


/**
 * @typedef {{
 *   associations: appx.DocumentAssociations,
 *   locales: Array.<Object>,
 *   type : string,
 *   quality: string,
 *   document_id: number,
 *
 *   elevation: number,
 *   elevation_min: number,
 *   maps: Array.<Object>,
 *   maps_info: string,
 *   areas: Array.<Object>,
 *   public_transportation_types: Array.<string>,
 *   public_transportation_rating: string,
 *   prominence: number,
 *   height_max: number,
 *   height_min: number,
 *   height_median: number,
 *   length: number,
 *   geometry: Object,
 *   slope: (number | string),
 *   ground_types: Array.<string>,
 *   paragliding_rating: string,
 *   exposition_rating: string,
 *   routes_quantity: number,
 *   rain_proof: string,
 *   children_proof: string,
 *   access_time: string,
 *   snow_clearance_rating: string,
 *   lift_access: (boolean | null),
 *   parking_fee: (boolean | string),
 *   equipment_ratings: Array.<string>,
 *   climbing_rating_min: string,
 *   climbing_rating_median: string,
 *   climbing_rating_max: string,
 *   url: string,
 *   climbing_styles: Array.<string>,
 *   orientations: Array.<string>,
 *   equipment_rating: string,
 *   best_periods: Array.<string>,
 *   climbing_outdoor_types: Array.<string>,
 *   phone: (number | string),
 *   capacity: number,
 *   capacity_staffed: number,
 *   phone_custodian: (number | string),
 *   custodianship: string,
 *   matress_unstaffed: (string | boolean),
 *   blanket_unstaffed: (string | boolean),
 *   gas_unstaffed: (string | boolean),
 *   heating_unstaffed: (string | boolean)
 * }}
 */
appx.Waypoint;


/**
 * @typedef {{
 *   associations: appx.DocumentAssociations,
 *   locales: Array.<Object>,
 *   type : string,
 *   document_id:number
 * }}
 */
appx.Image;


/**
 * @typedef {{
 *   total: number,
 *   outings: Array.<appx.Outing>
 * }}
 */
appx.RecentOutings;


/**
 * @typedef {{
 *   total: number,
 *   routes: Array.<appx.Route>
 * }}
 */
appx.AllRoutes;

/**
 * @typedef {{
 *   ign: string,
 *   bing: string
 * }}
 */
appx.mapApiKeys;

/**
 * @typedef {{
 *   discourseUrl: string,
 *   topicId: number
 * }}
 */
appx.DiscourseEmbedded;
