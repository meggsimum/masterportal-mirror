// TODO add 3d mode values (or model them as a separate module for composition)

/**
 * User type definition
 * @typedef {Object} MapState
 * @property {?[Number, Number]} size - The size in pixels of the map in the DOM
 * @property {?OLCesium} map3d - the OLCesium 3d map
 * @property {?module:ol/layer[]} layerList - all layers of the map
 * @property {?Object[]} gfiFeatures - features for the gfi
 * @property {?Number} initialZoomLevel initial zoom level
 * @property {?Number} zoomLevel active zoom level
 * @property {?Number} maxZoomLevel maximum zoom level
 * @property {?Number} minZoomLevel minimum zoom level
 * @property {?Number} scale scale 1:x, where x is saved here
 * @property {?Number} initialResolution initial resolution
 * @property {?Number} resolution active resolution (changes with zoom level)
 * @property {?Number} maxResolution maximum resolution
 * @property {?Number} minResolution minimum resolution
 * @property {?[Number, Number]} clickCoord - the coordinate where the mouse click event triggered
 * @property {?[Number, Number]} clickPixel - the pixel where the mouse click event triggered relative to the viewport
 * @property {?Object[]} featuresAtCoordinate - features at the click coordinate
 * @property {?[Number, Number]} initialCenter initial center coordinate
 * @property {?[Number, Number]} center coordinate
 * @property {?[Number, Number, Number, Number]} bbox current bounding box
 * @property {?String} projection name of currently active projection
 * @property {?Number} rotation current rotation
 * @property {?String[]} layerIds list of layer ids as String (may contain others than numbers, e.g. "1933geofox_stations")
 * @property {?Object.<String, LayerData>} layers register of existing layers
 * @property {?Number[]} overlayIds list of layer ids
 * @property {?Object.<String, LayerData>} overlays list of existing overlays
 * @property {?String} [mapMode = "2D"] current map mode
 * @property {String} [mapId = "ol"] current map id
 * @property {String[]} loadedLayers list of ready loaded layers IDs
 * @property {String[]} featuresLoaded is filled with layerId and features, after features are loaded. Next Load of features will overwrite the content.
 */
const state = {
    size: null,
    map3d: null,
    layerList: null,
    gfiFeatures: null,
    initialZoomLevel: null,
    zoomLevel: null,
    maxZoomLevel: null,
    minZoomLevel: null,
    scale: null,
    initialResolution: null,
    resolution: null,
    maxResolution: null,
    minResolution: null,
    scales: null,
    initialCenter: null,
    center: null,
    clickCoord: null,
    clickPixel: null,
    mouseCoord: null,
    bbox: null,
    projection: null,
    rotation: null,
    layerIds: null,
    layers: null,
    overlayIds: null,
    overlays: null,
    mapMode: "2D",
    mapId: "ol",
    highlightedFeature: null,
    highlightedFeatureStyle: null,
    vectorFeaturesLoaded: false,
    loadedLayers: [],
    featuresLoaded: {}
};

export default state;
