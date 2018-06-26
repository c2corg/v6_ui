import angular from 'angular';
import BiodivsportsService from './biodivsports.service';
import c2cLang from '../../lang/lang.module';
import BiodivsportsModalController from './biodivsports-modal.controller';

export default angular
  .module('c2c.map.biodivsports', [
    c2cLang
  ])
  .controller('BiodivsportsModalController', BiodivsportsModalController)
  .service('BiodivsportsService', BiodivsportsService)
  .name;
