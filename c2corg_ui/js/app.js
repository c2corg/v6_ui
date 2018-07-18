import angular from 'angular';
import 'angular-gettext';
import 'angular-messages';
import 'angular-cookies';
import 'angular-moment';
import 'ng-file-upload';
import 'angular-recaptcha';
import 'ng-infinite-scroll';
import 'angular-sanitize';
import dateparser from 'angular-ui-bootstrap/src/dateparser';
import datepicker from 'angular-ui-bootstrap/src/datepicker';
import datepickerPopup from 'angular-ui-bootstrap/src/datepickerPopup';
import modal from 'angular-ui-bootstrap/src/modal';
import dropdown from 'angular-ui-bootstrap/src/dropdown';
import popover from 'angular-ui-bootstrap/src/popover';
import tabs from 'angular-ui-bootstrap/src/tabs';
import tooltip from 'angular-ui-bootstrap/src/tooltip';
import rating from 'angular-ui-bootstrap/src/rating';
import 'jquery';

import c2cAccount from './account/account.module';
import c2cActivityFilter from './activity-filter/activity-filter.module';
import c2cAddAssociation from './add-association/add-association.module';
import c2cAvancedSearch from './advanced-search/advanced-search.module';
import c2calerts from './alerts/alerts.module';
import c2cAnnouncement from './announcement/annoucement.module';
import c2cApi from './api/api.module';
import c2cAuth from './auth/auth.module';
import c2cAuthentication from './authentication/authentication.module';
import c2cBlockAccount from './block-account/block-account.module';
import c2cCard from './card/card.module';
import c2cConstants from './constants/constants.module';
import c2cContextHelp from './context-help/context-help.module';
import c2cCotometer from './cotometer/cotometer.module';
import c2cDeleteAssociation from './delete-association/delete-association.module';
import c2cDeleteDocument from './delete-document/delete-document.module';
import c2cDoctypeSelector from './doctype-selector/doctype-selector.module';
import c2cDocument from './document/document.module';
import c2cArticleEditing from './edit/article/article-editing.module';
import c2cDocumentEditing from './edit/document/document-editing.module';
import c2cImageEditing from './edit/image/image-editing.module';
import c2cOutingEditing from './edit/outing/outing-editing.module';
import c2cRouteEditing from './edit/route/route-editing.module';
import c2cXreportEditing from './edit/xreport/xreport-editing.module';
import c2cElevationProfile from './elevation-profile/elevation-profile.module';
import c2cFollow from './follow/follow.module';
import c2cFollowing from './following/following.module';
import c2cGeomDownload from './geom-download/geom-download.module';
import c2cGpxUpload from './gpx-upload/gpx-upload.module';
import c2cHome from './home/home.module';
import c2cImageUploader from './image-uploader/image-uploader.module';
import c2cLang from './lang/lang.module';
import c2cListSwitch from './list-switch/list-switch.module';
import c2cLoadPreferences from './load-preferences/load-preferences.module';
import c2cLoading from './loading/loading.module';
import c2cMailingLists from './mailing-lists/mailing-lists.module';
import c2cMap from './map/map.module';
import c2cMapSwitch from './map-switch/map-switch.module';
import c2cMergeDocuments from './merge-documents/merge-documents.module';
import c2cOutingsCsvDownload from './outings-csv-download/outings-csv-download.module';
import c2cPagination from './pagination/pagination.module';
import c2cPreferences from './preferences/preferences.module';
import c2cProgressBar from './progress-bar/progress-bar.module';
import c2cProtectDocument from './protect-document/protect-document.module';
import c2cProtectedUrlBtn from './protected-url-btn/protected-url-btn.module';
import c2cRevertDocument from './revert-document/revert-document.module';
import c2cSearchFilters from './search-filters/search-filters.module';
import c2cSideMenu from './side-menu/side-menu.module';
import c2cSimpleSearch from './simple-search/simple-search.module';
import c2cSlideInfo from './slide-info/slide-info.module';
import c2cUrl from './url/url.module';
import c2cUser from './user/user.module';
import c2cUserProfile from './user-profile/user-profile.module';
import c2cUtils from './utils/utils.module';
import c2cVersions from './versions/versions.module';
import c2cViewDetails from './view-details/view-details.module';
import c2cWhatsnewFeed from './whatsnew-feed/whatsnew-feed.module';
import c2cXreport from './xreport/xreport.module';

import HttpAuthenticationInterceptor from './http-authentication.interceptor';
import MainController from './main.controller';

angular
  .module('c2c', [
    'gettext',
    'ngMessages',
    'ngCookies',
    dateparser,
    datepicker,
    datepickerPopup,
    modal,
    dropdown,
    popover,
    tabs,
    tooltip,
    rating,
    'angularMoment',
    'ngFileUpload',
    'vcRecaptcha',
    'infinite-scroll',
    'ngSanitize',
    c2cAccount,
    c2cActivityFilter,
    c2cAddAssociation,
    c2cAvancedSearch,
    c2calerts,
    c2cAnnouncement,
    c2cApi,
    c2cAuth,
    c2cAuthentication,
    c2cBlockAccount,
    c2cCard,
    c2cConstants,
    c2cContextHelp,
    c2cCotometer,
    c2cDeleteAssociation,
    c2cDeleteDocument,
    c2cDoctypeSelector,
    c2cDocument,
    c2cArticleEditing,
    c2cDocumentEditing,
    c2cImageEditing,
    c2cOutingEditing,
    c2cRouteEditing,
    c2cXreportEditing,
    c2cElevationProfile,
    c2cFollow,
    c2cFollowing,
    c2cGeomDownload,
    c2cGpxUpload,
    c2cHome,
    c2cImageUploader,
    c2cLang,
    c2cListSwitch,
    c2cLoadPreferences,
    c2cLoading,
    c2cMailingLists,
    c2cMap,
    c2cMapSwitch,
    c2cMergeDocuments,
    c2cOutingsCsvDownload,
    c2cPagination,
    c2cPreferences,
    c2cProgressBar,
    c2cProtectDocument,
    c2cProtectedUrlBtn,
    c2cRevertDocument,
    c2cSearchFilters,
    c2cSideMenu,
    c2cSimpleSearch,
    c2cSlideInfo,
    c2cUrl,
    c2cUser,
    c2cUserProfile,
    c2cUtils,
    c2cVersions,
    c2cViewDetails,
    c2cWhatsnewFeed,
    c2cXreport
  ])
  .controller('MainController', MainController)
  .factory('HttpAuthenticationInterceptor', HttpAuthenticationInterceptor)
  .config($httpProvider => $httpProvider.interceptors.push('HttpAuthenticationInterceptor'))
  .filter('trustAsHtml', $sce => {
    'ngInject';

    return text => $sce.trustAsHtml(text);
  })
  .filter('capitalize', () => token => token.charAt(0).toUpperCase() + token.slice(1))
  .constant('moment', require('moment-timezone'));
