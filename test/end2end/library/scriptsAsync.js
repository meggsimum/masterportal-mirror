/*
 * Scripts meant for execution within driver.executeAsyncScript function.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeAsyncScript
 */

/**
 * Resolves once by using callback on moveend.
 * @param {function} callback called on moveend
 * @returns {void}
 */
function onMoveEnd (callback) {
    Backbone.Radio.request("Map", "getMap").once("moveend", () => callback());
}

module.exports = {
    onMoveEnd
};
