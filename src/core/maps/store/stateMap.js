/**
* @property {String} backgroundImage BackgroundImage of the map.
* @property {Number[]} boundingBox Current boundingBox values of the map.
* @property {Number[]} center Current center values of the map.
* @property {Number[]} clickCoordinate Current coordinates where the mouse click event were triggered.
* @property {Number[]} extent Current extent values of the map.
* @property {Number[]} initialCenter Initial center values of the map.
* @property {Number} initialResolution Initial resolution values of the map.
* @property {Number} initialZoomLevel Initial zoom levels of the map.
* @property {String[]} layerIds Current layers of the map by Id.
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
    extent: null,
    initialCenter: null,
    initialResolution: null,
    initialZoomLevel: null,
    layerIds: null,
    mode: "2D",
    mouseCoordinate: null,
    overlayIds: null,
    projection: "EPSG:25832",
    resolution: null,
    resolutions: null,
    rotation: null,
    scale: null,
    size: null
};

export default state;
