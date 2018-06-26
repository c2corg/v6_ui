import angular from 'angular';
import TrustAsHtmlFilter from './trust-as-html.filter';

export default angular
  .module('c2c.filters.trust-as-html', [])
  .filter('trustAsHtml', TrustAsHtmlFilter)
  .name;
