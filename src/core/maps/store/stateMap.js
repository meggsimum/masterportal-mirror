/**
* @property {String} backgroundImage BackgroundImage of the map.
* @property {Number[]} boundingBox Current boundingBox values of the map.
* @property {Number[]} center Current center values of the map.
* @property {Number[]} clickCoordinate Current clickCoordinate values of the map.
* @property {Number[]} extent Current extent values of the map.
* @property {Number[]} initialCenter Initial center values of the map.
* @property {Number} initialResolution Initial resolution values of the map.
* @property {Number} initialZoomLevel Initial zoom levels of the map.
* @property {String[]} layerIds Current layers of the map by Id.
* @property {String} mode Current mode of the map e.g. 2D/3D.
* @property {Number[]} mouseCoordinate Current mouseCoordinate values of the map.
* @property {String[]} overlayIds Current overlays of the map by Id.
* @property {String} projection Current projection name of the map.
* @property {Number} resolution Current resolution value of the map.
* @property {Number[]} resolutions Available resolution values of the map.
* @property {Number} rotation Current rotation value of the map.
* @property {Number} scale Current scale value of the map.
* @property {Number} size Current size value of the map.
*/

const state = {
    backgroundImage: "",
    boundingBox: [],
    center: [],
    clickCoordinate: [],
    extent: [],
    initialCenter: [],
    initialResolution: null,
    initialZoomLevel: null,
    layerIds: [],
    mode: "2D",
    mouseCoordinate: [],
    overlayIds: [],
    projection: "EPSG:25832",
    resolution: null,
    resolutions: [],
    rotation: null,
    scale: null,
    size: []
};

export default state;
