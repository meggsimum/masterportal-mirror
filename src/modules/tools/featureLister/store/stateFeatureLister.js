/**
 * featureLister tool state definition.
 * @typedef {Object} FeatureListerState
 * @property {Boolean} active if true, featureLister will be rendered
 * @property {String} id id of the FeatureLister component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} maxFeatures default value for maxFeatures that can be overwritten in config
 * @property {Array} layerlist array of layers in the format {id, name, features}
 * @property {String} layerid id of visibleLayer to be displayed
 * @property {Object} layer layer object of the selected layer
 * @property {Boolean} layerListView if true list of visibile vector layers gets displayed
 * @property {String} currentTab id of the currently displayed tab
 * @property {Array} gfiFeaturesOfLayer array of the gfiFeatures of the selected layer
 * @property {String} featureCount number of total features of the selected layer
 * @property {String} shownFeatures currently count of features displayed in featureListView table
 * @property {Boolean} featureListView if true the list of features from selected layer gets displayed
 * @property {Array} rawFeaturesOfLayer array of raw features from selected layer, differs from gfiFeatures
 * @property {Boolean} nestedFeatures some features have features themself, if true they get recognized
 * @property {Boolean} featureDetailView if true the detail page of the selected feature gets displayed
 * @property {Array} headers list of headings in list
 * @property {Object} selectedFeature object of the selected feature
 * @property {Object} highlightVectorRulesPolygon default style for highlighting polygons
 * @property {Object} highlightVectorRulesPointLine default style for highlighting lines and points
 */
const state = {
    // defaults for config.json parameters
    name: "common:modules.tools.featureLister.title",
    icon: "bi-list",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    maxFeatures: 20,
    // featureLister state
    active: false,
    id: "featureLister",
    layerlist: [],
    layerId: "",
    layer: null,
    layerListView: true,
    gfiFeaturesOfLayer: [],
    featureCount: "",
    shownFeatures: "",
    featureListView: false,
    rawFeaturesOfLayer: [],
    nestedFeatures: false,
    featureDetailView: false,
    headers: [],
    selectedFeature: null,
    highlightVectorRulesPolygon: {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 7
    },
    highlightVectorRulesPointLine: {
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 7
    }
};

export default state;
