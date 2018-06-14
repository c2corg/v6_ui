import angular from 'angular';

import c2cLang from './lang/lang.module';
import c2cConstants from './constants/constants-module';
import c2cUtils from './utils/utils.module';

angular.module('c2c', [
  c2cLang,
  c2cConstants,
  c2cUtils
]);
