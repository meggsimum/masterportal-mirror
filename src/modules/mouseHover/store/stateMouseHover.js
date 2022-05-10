import Overlay from "ol/Overlay.js";
/**
 * User type definition
 * @typedef {Object} MouseHoverStates
 * @property {Object} overlay =new Overlay({}) mouseHover overlay (tooltip) - paramaters get set during initialization.
 * @property {Number} numFeaturesToShow The number of features that will be shown in the popup.
 * @property {Number} infoText The text that will be shown in the popup.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} layersFromConfig Array with layers from the config.
 * @property {Array} mouseHoverLayers Array with layers from the config that have mouseHoverInfos.
 * @property {Array} mouseHoverInfos Array of the attributes each layer and its features should display.
 * @property {Array} infoBox Array with the Infos from the currently hovered feature/s.
 * @property {Array} hoverPosition Array with coordinates of the currently hovered feature/s.
 * @property {Boolean} pleaseZoom True if more features are being hovered than the configured max in numFeaturesToShow.
 */
export default {
    overlay: new Overlay({
        id: "mousehover-overlay",
        element: document.createElement("DIV"),
        offset: [0, -2],
        positioning: "bottom-left"
    }),
    numFeaturesToShow: 2,
    infoText: "",
    layersFromConfig: [],
    mouseHoverLayers: [],
    mouseHoverInfos: [],
    infoBox: null,
    hoverPosition: null,
    pleaseZoom: false
};
