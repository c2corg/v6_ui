import template from './feed.html';

const FeedDirective = () => {
  return {
    restrict: 'E',
    controller: 'FeedController',
    controllerAs: 'feedCtrl',
    bindToController: {
      'userId': '=c2cFeedProfile'
    },
    template
  };
};

export default FeedDirective;
