import angular from 'angular';
import AlertsService from './alerts.service';
import AlertController from './alert.controller';
import AlertDirective from './alert.directive';
import AlertsController from './alerts.controller';
import AlertsDirective from './alerts.directive';

export default angular
  .module('c2c.alerts', [

  ])
  .controller('AlertController', AlertController)
  .directive('c2cAlert', AlertDirective)
  .controller('AlertsController', AlertsController)
  .directive('c2cAlerts', AlertsDirective)
  .service('AlertsService', AlertsService)
  .name;
