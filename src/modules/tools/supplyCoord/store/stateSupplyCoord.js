/**
 * User type definition
 * @typedef {Object} SupplyCoordState
 * @property {Boolean} active if true, SupplyCoord will rendered
 * @property {String} id id of the SupplyCoord component
 * @property {module:ol/interaction/Pointer} selectPointerMove contains interaction listener to map
 * @property {Object[]} projections list of available projections
 * @property {Object} mapProjection projection of the map
 * @property {Number[]} positionMapProjection position of the projection in the map
 * @property {Boolean} updatePosition if true, position is updated in tool
 * @property {String} currentProjectionName name of the current projection
 * @property {Object} currentProjection the current projection
 * @property {String} currentSelection currently selected projection value
 * @property {String} coordinatesEastingField label of the easting field
 * @property {String} coordinatesNorthingField label of the northing field
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "supplyCoord",
    selectPointerMove: null,
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    currentProjectionName: "EPSG:25832",
    currentProjection: null,
    currentSelection: "EPSG:25832",
    coordinatesEastingField: "",
    coordinatesNorthingField: "",

    // defaults for config.json parameters
    name: "common:menu.tools.supplyCoord",
    icon: "bi-bullseye",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true
};

export default state;
