/**
 * User type definition
 * @typedef {Object} GfiState
 * @property {String} id Id of the gfi component.
 * @property {String} name Displayed as title (config-param).
 * @property {String} glyphicon Icon next to title (config-param).
 * @property {Boolean} active True if the gfi is active.
 * @property {Object} currentFeature The current feature that is displayed.
 * @property {String} desktopType Specifies which template is used in desktop mode.
 * @property {Boolean} centerMapToClickPoint specifies if the map should be centered when clicking on a feature.
 * @property {Boolean} isVisibleInMenu Indicates whether there is a menu entry for the GFI.
 * @property {Boolean} renderToWindow if true, content is rendered into a window
 *
 */
const state = {
    id: "gfi",
    name: "common:menu.tools.getInfos",
    glyphicon: "glyphicon-info-sign",
    active: false,
    currentFeature: null,
    desktopType: "",
    centerMapToClickPoint: false,
    showMarker: true,
    highlightVectorRules: null,
    isVisibleInMenu: true,
    renderToWindow: true,
    currentPosition: null,
    currentRotation: null
};

export default state;
