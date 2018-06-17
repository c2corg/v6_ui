import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import MailingListsController from './mailing-lists.controller';
import MailingListsDirective from './mailing-lists.directive';

export default angular
  .module('c2c.mailing-lists', [
    c2cUtils
  ])
  .controller('MailingListsController', MailingListsController)
  .directive('c2cMailingLists', MailingListsDirective)
  .name;
