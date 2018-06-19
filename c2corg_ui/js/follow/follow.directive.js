import template from './follow.html';

const FollowDirective = () => {
  return {
    restrict: 'E',
    controller: 'FollowController',
    controllerAs: 'followCtrl',
    bindToController: {
      'docId': '=c2cFollowId'
    },
    template
  };
};

export default FollowDirective;
