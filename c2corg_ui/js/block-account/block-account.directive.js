import template from './block-account.html';

const BlockAccountDirective = () => {
  return {
    restrict: 'A',
    controller: 'BlockAccountController',
    controllerAs: 'blockCtrl',
    bindToController: {
      'userId': '=c2cUserId'
    },
    template
  };
};

export default BlockAccountDirective;
