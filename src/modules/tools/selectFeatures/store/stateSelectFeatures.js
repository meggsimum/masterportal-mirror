/**
 * User type definition
 * @typedef {Object} SelectFeaturesState
 * @property {Boolean} active if true, VueAddon will rendered
 * @property {String} id id of the SelectFeatures component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {module:ol/Collection} selectedFeatures the selected Features Collection
 * @property {Array} selectedFeaturesWithRenderInformation the selected Features with RenderInformation Array
 * @property {module:ol/interaction/Select} selectInteraction the ol Select interaction
 * @property {module:ol/interaction/DragBox} dragBoxInteraction the ol DragBox interaction
 */
const state = {
    active: false,
    id: "selectFeatures",
    // defaults for config.json parameters
    name: "common:menu.tools.selectFeatures",
    icon: "bi-card-list",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    selectedFeatures: undefined,
    selectedFeaturesWithRenderInformation: [],
    selectInteraction: undefined,
    dragBoxInteraction: undefined
};

export default state;
