import template from './whatsnew-feed.html';

const WhatsnewFeedDirective = ()=> {
  return {
    restrict: 'E',
    controller: 'WhatsnewFeedController as wfeedCtrl',
    template
  };
};

export default WhatsnewFeedDirective;
