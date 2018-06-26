/**
 * @param {angular.$sce} $sce Angular sce service.
 * @ngInject
 * @return {function(angular.$sce):string}
 */
const TrustAsHtmlFilter = $sce => text => $sce.trustAsHtml(text);

export default TrustAsHtmlFilter;
