import 'angular';

import c2cItems from './items/items.module';
import c2cLang from './lang/lang.module';
import c2cConstants from './constants/constants-module';
import c2cUtils from './utils/utils.module';

angular.module('c2c', [
  c2cItems,
  c2cLang,
  c2cConstants,
  c2cUtils
]);
