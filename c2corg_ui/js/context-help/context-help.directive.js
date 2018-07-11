import angular from 'angular';
import template from './context-help-modal.html';

import activitiesTemplate from './activities.html';
import associateTemplate from './associate.html';
import outingAvalancheSignsTemplate from './outing-avalanche_signs.html';
import outingConditionsLevelsTemplate from './outing-conditions_levels.html';
import outingFrequentationTemplate from './outing-frequentation.html';
import routeAidRatingTemplate from './route-aid_rating.html';
import routeConfigurationTemplate from './route-configuration.html';
import routeElevation_min_maxTemplate from './route-elevation_min_max.html';
import routeEngagementRatingTemplate from './route-engagement_rating.html';
import routeEquipmentRatingTemplate from './route-equipment_rating.html';
import routeExpositionRockRatingTemplate from './route-exposition_rock_rating.html';
import routeGlobalRatingTemplate from './route-global_rating.html';
import routeHeightDiffUpTemplate from './route-height_diff_up.html';
import routeHikingMtbExpositionTemplate from './route-hiking_mtb_exposition.html';
import routeHikingRatingTemplate from './route-hiking_rating.html';
import routeIceRatingTemplate from './route-ice_rating.html';
import routeLabandeGlobalRatingTemplate from './route-labande_global_rating.html';
import routeLabandeSkiRatingTemplate from './route-labande_ski_rating.html';
import routeMixedRatingTemplate from './route-mixed_rating.html';
import routeMtbDownRatingTemplate from './route-mtb_down_rating.html';
import routeMtbUpRatingTemplate from './route-mtb_up_rating.html';
import routeRiskRatingTemplate from './route-risk_rating.html';
import routeRockFreeRatingTemplate from './route-rock_free_rating.html';
import routeRockRequiredRatingTemplate from './route-rock_required_rating.html';
import routeSkiExpositionTemplate from './route-ski_exposition.html';
import routeSkiRatingTemplate from './route-ski_rating.html';
import routeSnowshoeRatingTemplate from './route-snowshoe_rating.html';
import routeSpecificGearTemplate from './route-specific_gear.html';
import routeTypesTemplate from './route-types.html';
import routeViaFerrataRatingTemplate from './route-via_ferrata_rating.html';
import xreportAuthorStatusTemplate from './xreport-author_status.html';
import xreportAvalancheLevelTemplate from './xreport-avalanche_level.html';
import xreportAvalancheSlopeTemplate from './xreport-avalanche_slope.html';
import xreportConditionsTemplate from './xreport-conditions.html';
import xreportDescriptionTemplate from './xreport-description.html';
import xreportEventTypeTemplate from './xreport-event_type.html';
import xreportIncreaseImpactTemplate from './xreport-increase_impact.html';
import xreportModificationsTemplate from './xreport-modifications.html';
import xreportMotivationsTemplate from './xreport-motivations.html';
import xreportPlaceTemplate from './xreport-place.html';
import xreportReduceImpactTemplate from './xreport-reduce_impact.html';
import xreportRiskTemplate from './xreport-risk.html';
import xreportRouteStudyTemplate from './xreport-route_study.html';
import xreportSafetyTemplate from './xreport-safety.html';
import xreportTimeManagementTemplate from './xreport-time_management.html';
import xreportTrainingTemplate from './xreport-training.html';

const templates = {
  'activities': activitiesTemplate,
  'associate': associateTemplate,
  'outing-avalanche_signs': outingAvalancheSignsTemplate,
  'outing-conditions_levels': outingConditionsLevelsTemplate,
  'outing-frequentation': outingFrequentationTemplate,
  'route-aid_rating': routeAidRatingTemplate,
  'route-configuration': routeConfigurationTemplate,
  'route-elevation_min_max': routeElevation_min_maxTemplate,
  'route-engagement_rating': routeEngagementRatingTemplate,
  'route-equipment_rating': routeEquipmentRatingTemplate,
  'route-exposition_rock-rating': routeExpositionRockRatingTemplate,
  'route-global_rating': routeGlobalRatingTemplate,
  'route-height_diff_up': routeHeightDiffUpTemplate,
  'route-hiking_mtb_exposition': routeHikingMtbExpositionTemplate,
  'route-hiking_rating': routeHikingRatingTemplate,
  'route-ice_rating': routeIceRatingTemplate,
  'route-labande_global_rating': routeLabandeGlobalRatingTemplate,
  'route-labande_ski_rating': routeLabandeSkiRatingTemplate,
  'route-mixed_rating': routeMixedRatingTemplate,
  'route-mtb_down_rating': routeMtbDownRatingTemplate,
  'route-mtb_up_rating': routeMtbUpRatingTemplate,
  'route-risk_rating': routeRiskRatingTemplate,
  'route-rock_free_rating': routeRockFreeRatingTemplate,
  'route-rock_required_rating': routeRockRequiredRatingTemplate,
  'route-ski_exposition': routeSkiExpositionTemplate,
  'route-ski_rating': routeSkiRatingTemplate,
  'route-snowshoe_rating': routeSnowshoeRatingTemplate,
  'route-specific_gear': routeSpecificGearTemplate,
  'route-types': routeTypesTemplate,
  'route-via_ferrata_rating': routeViaFerrataRatingTemplate,
  'xreport-author_status': xreportAuthorStatusTemplate,
  'xreport-avalanche_level': xreportAvalancheLevelTemplate,
  'xreport-avalanche_slope': xreportAvalancheSlopeTemplate,
  'xreport-conditions': xreportConditionsTemplate,
  'xreport-description': xreportDescriptionTemplate,
  'xreport-event_type': xreportEventTypeTemplate,
  'xreport-increase_impact': xreportIncreaseImpactTemplate,
  'xreport-modifications': xreportModificationsTemplate,
  'xreport-motivations': xreportMotivationsTemplate,
  'xreport-place': xreportPlaceTemplate,
  'xreport-reduce_impact': xreportReduceImpactTemplate,
  'xreport-risk': xreportRiskTemplate,
  'xreport-route_study': xreportRouteStudyTemplate,
  'xreport-safety': xreportSafetyTemplate,
  'xreport-time_management': xreportTimeManagementTemplate,
  'xreport-training': xreportTrainingTemplate
};

/**
 * This directive is used to display a contextual help modal dialog.
 * @param {ui.bootstrap.$modal} $uibModal modal from angular bootstrap.
 * @param {angular.$templateCache} $templateCache service.
 * @param {angular.$compile} $compile Angular compile service.
 * @return {angular.Directive} The directive specs.
 * @ngInject
 */
const ContextHelpDirective = ($uibModal, $compile) => {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      element.append('<span class="glyphicon glyphicon-info-sign context-help-sign">');
      element.on('click', () => {
        $uibModal.open({
          controller: 'ContextHelpModalController',
          controllerAs: 'contextHelpModalCtrl',
          template,
          'windowClass': 'context-help-modal',
          resolve: {
            content() {
              const templateKey = attrs['contextHelpContentKey'];
              if (templateKey) {
                const template = templates[templateKey];
                const elements = $compile(template)(scope);
                return angular.element('<div></div>').append(elements).html();
              } else {
                return attrs['contextHelpContent'];
              }
            },
            title() {
              return attrs['contextHelpTitle'];
            }
          }
        });
      });
    }
  };
};

export default ContextHelpDirective;
