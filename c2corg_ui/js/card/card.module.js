import angular from 'angular';
import c2cUtils from '../utils/utils.module';
import CardController from './card.controller';
import CardDirective from './card.directive';

export default angular
  .module('c2c.card', [
    c2cUtils
  ])
  .controller('CardController', CardController)
  .directive('c2cCard', CardDirective)
  .name;
