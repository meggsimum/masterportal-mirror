/**
* @property {String} backgroundImage BackgroundImage of the map.
* @property {Number[]} boundingBox Current boundingBox values of the map.
* @property {Number[]} center Current center values of the map.
* @property {Number[]} clickCoordinate Current coordinates where the mouse click event was triggered.
* @property {Number[]} clickPixel Current pixel values where the mouse click event was triggered.
* @property {Number[]} clickCartesianCoordinate Current cartesian 2D coordinate.
* @property {Number[]} extent Current extent values of the map.
* @property {Number[]} initialCenter Initial center values of the map.
* @property {Number} initialResolution Initial resolution value of the map.
* @property {Number} initialZoomLevel Initial zoom level of the map.
* @property {String[]} layerIds Current layers of the map by Id.
* @property {Object[]} gfiFeatures temporary array for features at click has to be moved to gfi module.
* @property {String[]} highlightedFeatureStyles list of original styles for highlighted features, indices correspond to "highlightedFeatures". temporary array for features at click has to be moved to gfi module.
* @property {String} mode Current mode of the map e.g. 2D/3D.
* @property {Number[]} mouseCoordinate Current mouse coordinate values of the map.
* @property {String[]} overlayIds Current overlays of the map by Id.
* @property {String} projection Current projection name of the map.
* @property {Number} resolution Current resolution value of the map.
* @property {Number[]} resolutions Available resolution values of the map.
* @property {Number} rotation Current rotation value of the map.
* @property {Number} scale Current scale value of the map.
* @property {Number} size Current size in pixels of the map in the DOM.
*/

const state = {
    backgroundImage: null,
    boundingBox: null,
    center: null,
    clickCoordinate: null,
    clickPixel: null,
    clickCartesianCoordinate: null,
    extent: null,
    initialCenter: null,
    initialResolution: null,
    initialZoomLevel: null,
    layerIds: [],
    gfiFeatures: [],
    highlightedFeatures: [],
    highlightedFeatureStyles: [],
    mode: "2D",
    mouseCoordinate: null,
    overlayIds: null,
    projection: null,
    resolution: null,
    resolutions: null,
    rotation: null,
    scale: null,
    size: null
};

export default state;
