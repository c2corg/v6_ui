import angular from 'angular';
import UrlService from './url.service';

export default angular
  .module('c2c.url', [])
  .service('UrlService', UrlService)
  .name;
