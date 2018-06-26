/**
 * @return {function(string):string}
 */
const CapitalizeFilter = () => token => token.charAt(0).toUpperCase() + token.slice(1);

export default CapitalizeFilter;
