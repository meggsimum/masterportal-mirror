/**
 * Returns true, if loader is no longer visible.
 * @returns {void}
 */
function isInitalLoadingFinished () {
    return typeof window.INITIAL_LOADING === "boolean" && window.INITIAL_LOADING === false;
}

module.exports = {
    isInitalLoadingFinished
}