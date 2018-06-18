import angular from 'angular';
import WhatsnewFeedController from './whatsnew-feed.controller';
import WhatsnewFeedDirective from './whatsnew-feed.directive';
import c2cFeed from '../feed/feed.module';
import c2cUtils from '../utils/utils.module';

export default angular
  .module('c2c.whatsnew-feed', [
    c2cUtils,
    c2cFeed
  ])
  .controller('WhatsnewFeedController', WhatsnewFeedController)
  .directive('c2cFeedController', WhatsnewFeedDirective)
  .name;
