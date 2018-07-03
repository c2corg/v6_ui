import angular from 'angular';
import c2cForumFeed from './forum-feed/forum-feed.module';

export default angular
  .module('c2c.home', [
    c2cForumFeed
  ])
  .name;
