/**
 * @property {Boolean} active Current status of the Tool.
 * @property {Boolean} deactivateGFI If set to true, the activation of this Tool deactivates the GFI Tool.
 * @property {String} icon Icon used in the header of the window.
 * @property {String} id Internal identifier for the Tool.
 * @property {?VTLayer} layerModel Currently selected model of a Vector Tile Layer to style.
 * @property {String} name Title displayed at the top of the window of the Tool; can be configured through the config.json.
 * @property {Boolean} renderToWindow Decides whether the Tool should be displayed as a window or as a sidebar.
 * @property {Boolean} resizableWindow Determines whether the Tool window can be resized.
 * @property {Number} initialWidth Initial width to be used for the window.
 * @property {VTLayer[]} vectorTileLayerList Array of visible Vector Tile Layers selectable to style.
 */
const state = {
    active: false,
    deactivateGFI: true,
    icon: "bi-droplet-fill",
    id: "styleVT",
    layerModel: null,
    name: "common:menu.tools.styleVt",
    renderToWindow: true,
    resizableWindow: true,
    initialWidth: 600,
    vectorTileLayerList: []
};

export default state;
