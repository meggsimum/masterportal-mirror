import {Vector as VectorLayer} from "ol/layer.js";
import {Vector as VectorSource} from "ol/source.js";
import GeoJSON from "ol/format/GeoJSON.js";
import style, {setCustomStyles} from "./style";

// forward import to export
export {setCustomStyles};

/**
 * onAddFeature function for source that ensures a feature has an id.
 * If feature has no id, the ol_uid is set to feature.id.
 * @param {object} param - parameter object
 * @param {ol.Feature} param.feature - openlayers feature added to source
 * @returns {undefined}
 * @ignore
 */
function onAddFeature ({feature}) {
    if (typeof feature.getId() === "undefined") {
        feature.setId(feature.ol_uid);
    }
}

/**
 * Creates the VectorSource for a GeoJSON layer. It will ensure each feature has the field id set to use with the other exported geojson functions.
 * @param {object} rawLayer - rawLayer as specified in services.json
 * @param {string} [rawLayer.url] - url to fetch geojson from; if no rawLayer.features given, this is required
 * @param {object} [rawLayer.features] - if features are transmitted via rawLayer, they will be used instead of requesting an URL
 * @param {ol.Map} [map] - map the geojson is to be projected on; if rawLayer.features given, this is used to infer the target projection
 * @returns {ol.source.Vector} created VectorSource
 */
export function createLayerSource ({features, url}, map) {
    const parser = new GeoJSON(),
        source = new VectorSource(features ? {} : {format: parser, url});

    source.on("addfeature", onAddFeature);

    // if features given directly, add them here _after_ source has eventListener for "addfeature"
    if (features) {
        const options = map ? {featureProjection: map.getView().getProjection()} : {},
            parsedFeatures = parser.readFeatures(features, options);

        source.addFeatures(parsedFeatures);
    }

    return source;
}

/**
 * Creates a layer for GeoJSON.
 * @param {object} rawLayer - rawLayer as specified in services.json
 * @param {object} [param={}] - parameter object
 * @param {ol.Map} [param.map] - map the geojson is to be projected on
 * @param {ol.Style} [param.layerStyle] - optional style; if not given, default styling (modifiable by setCustomStyles) is used
 * @returns {ol.layer.Vector} Layer with id and source specified in rawLayer
 */
export function createLayer (rawLayer, {map, layerStyle} = {}) {
    return new VectorLayer({
        id: rawLayer.id,
        source: createLayerSource(rawLayer, map),
        style: layerStyle || style
    });
}

/**
 * GeoJSON layer with an URL will be reloaded. All other layers will be refreshed.
 * @param {ol.layer.Vector} layer - GeoJSON layer to update
 * @returns {undefined}
 */
export function updateSource (layer) {
    // openlayers named this "refresh", but it also means "reload" if an URL is set
    layer.getSource().refresh();
}

/**
 * Sets a style to all given features.
 * @param {ol.Feature[]} features - openlayers features to be styled
 * @param {ol.style.Style~StyleLike} featureStyle - style, array of styles, or style function
 * @returns {undefined}
 */
export function setFeatureStyle (features, featureStyle) {
    features.forEach(feature => feature.setStyle(featureStyle));
}

/**
 * @param {ol.Layer} layer - layer to hide all features of
 * @returns {undefined}
 */
export function hideAllFeatures (layer) {
    // () => null is the "do not display" function for openlayers (overriding VectorLayer styles)
    setFeatureStyle(layer.getSource().getFeatures(), () => null);
}

/**
 * @param {ol.Layer} layer - layer to show all features of
 * @returns {undefined}
 */
export function showAllFeatures (layer) {
    // if feature has undefined style, openlayers will check containing VectorLayer for styles
    setFeatureStyle(layer.getSource().getFeatures(), undefined);
}

/**
 * @param {ol.Layer} layer - layer to show some features of
 * @param {string[]} featureIdList - list of feature.id to show
 * @returns {undefined}
 */
export function showFeaturesById (layer, featureIdList) {
    const features = layer
        .getSource()
        .getFeatures()
        .filter(feature => featureIdList.indexOf(feature.getId()) >= 0);

    hideAllFeatures(layer);
    setFeatureStyle(features, undefined);
}
