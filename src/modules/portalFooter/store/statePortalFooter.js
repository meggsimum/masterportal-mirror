/**
 * User type definition
 * @typedef {Object} FooterState
 * @property {Boolean} showFooter Indicates whether the footer is displayed.
 * @property {Object[]} urls Array of URL configuration objects
 * @property {String} urls[].alias Name of the link for desktop playout.
 * @property {String} urls[].alias_mobil Name of the link for mobile application.
 * @property {String} urls[].bezeichnung Name before the link.
 * @property {String} urls[].url The URL to be called.
 * @property {String} urls[].toolModelId The id of the model whose tool should be opened, an url is then not necessary.
 * @property {Boolean} showVersionFlag if the version number of the Master Portal should be displayed in the footer.
 */
const state = {
    showFooter: false,
    urls: [],
    showVersion: false
};

export default state;
