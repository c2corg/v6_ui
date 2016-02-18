goog.require('app');

goog.provide('app.constants');

/**
 * @const
 * Constants for the module.
 * Access them like app.constants.SCREEN
 */
app.module.constant('constants', app.constants);

app.constants = {
  SCREEN : {
    SMARTPHONE : 620,
    TABLET : 1099,
    DEKTOP : 1400
  }
}
