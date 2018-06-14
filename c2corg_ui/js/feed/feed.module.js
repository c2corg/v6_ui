import angular from 'angular';
import FeedController from './feed.controller';
import FeedDirective from './feed.directive';

export default angular
  .module('c2c.feed', [])
  .controller('FeedController', FeedController)
  .directive('c2cFeed', FeedDirective)
  .name;
