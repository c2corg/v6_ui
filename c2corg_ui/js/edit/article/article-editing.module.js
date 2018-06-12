import ArticleEditingController from './article-editing.controller';
import c2cDocumentEditing from '../document/document-editing.module';

export default angular
  .module('c2c.edit.article', [ c2cDocumentEditing ])
  .controller('ArticleEditingController', ArticleEditingController)
  .name;
