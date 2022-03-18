import {WFS} from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import axios from "axios";
import {Radio} from "backbone";
import {getLayerList} from "masterportalAPI/src/rawLayerList";

/**
 * User type definition
 * @typedef {Object} highlighFeaturesByAttributeSettings
 * @property {String} pointStyleId The id references the style.json for a point highlight features.
 * @property {String} polygonStyleId The id references the style.json for a polygon highlight features.
 * @property {String} lineStyleId The id references the style.json for a line highlight features.
 */
const highlighFeaturesByAttributeSettings = {
    pointStyleId: "defaultHighlightFeaturesPoint",
    polygonStyleId: "defaultHighlightFeaturesPolygon",
    lineStyleId: "defaultHighlightFeaturesLine"
};

/**
 * creates a vector layer
 * @param {String} styleId The style Id
 * @param {String} name Layer name
 * @param {Object} gfiAttributes GFI attributes configuration
 * @returns {Object} the created VectorLayer
*/
function createVectorLayer (styleId, name, gfiAttributes) {
    return new VectorLayer({
        id: styleId,
        name: name,
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true,
        gfiAttributes: gfiAttributes
    });
}

/**
 * highlight Features for Points
 * @param {String} modelId The model Id
 * @param {String} styleId The style Id
 * @param {String} name Layer name
 * @param {Object} gfiAttributes GFI attributes configuration
 * @param {Array} features The loaded WFS features
 * @returns {void} nothing
*/
function highlightPointFeature (modelId, styleId, name, gfiAttributes, features) {
    const styleListModel = Radio.request("StyleList", "returnModelById", modelId),
        highlightLayer = createVectorLayer(styleId, name, gfiAttributes);
    let hadPoint = false;

    features.forEach(feature => {
        const geometry = feature.getGeometry();

        if (styleListModel && geometry.getType() === "Point") {
            hadPoint = true;
            const coordinate = geometry.getCoordinates(),
                iconFeature = new Feature({
                    geometry: new Point(coordinate)
                }),
                featureStyle = styleListModel.createStyle(iconFeature, false);

            iconFeature.setProperties(feature.getProperties());
            iconFeature.setStyle(featureStyle);
            highlightLayer.getSource().addFeature(iconFeature);
        }
    });

    if (hadPoint) {
        highlightLayer.setVisible(true);
        Radio.trigger("Map", "addLayerOnTop", highlightLayer);
    }
}

/**
 * highlight Features / Line and Polygon
 * @param {String} modelId The model Id
 * @param {String} styleId The style Id
 * @param {String} name Layer name
 * @param {String} geometryRequested Polygon or LineString
 * @param {Object} gfiAttributes GFI attributes configuration
 * @param {Array} features The loaded WFS features
 * @returns {void} nothing
*/
function highlightLineOrPolygonFeature (modelId, styleId, name, geometryRequested, gfiAttributes, features) {
    const styleListModel = Radio.request("StyleList", "returnModelById", modelId),
        highlightLayer = createVectorLayer(styleId, name, gfiAttributes);
    let hadGeometry = false;

    features.forEach(feature => {
        const geometry = feature.getGeometry();

        if (styleListModel && geometry.getType() === geometryRequested) {
            hadGeometry = true;
            const newFeature = new Feature({
                    geometry: geometry
                }),
                featureStyle = styleListModel.createStyle(newFeature, false);

            newFeature.setProperties(feature.getProperties());
            newFeature.setStyle(featureStyle);
            highlightLayer.getSource().addFeature(newFeature);
        }
    });

    if (hadGeometry) {
        highlightLayer.setVisible(true);
        Radio.trigger("Map", "addLayerOnTop", highlightLayer);
    }
}

/**
 * handles the error
 * @param {Function} dispatch dispatch function
 * @param {String} error - the given error
 * @returns {void}
*/
function handleGetFeatureError (dispatch, error) {
    if (error.response) {
        console.error(error.response.data);
        dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + error.response.data, {root: true});
    }
    else if (error.request) {
        console.error(error.request);
        dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + error.request, {root: true});
    }
    else {
        console.error(error.message);
        dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + error.message, {root: true});
    }
}

/**
 * handles the response from a wfs get feature request
 * @param {Function} dispatch dispatch function
 * @param {string} response - XML to be sent as String
 * @param {Object} highlightFeaturesLayer The configuration for the Layer.
 * @returns {void}
*/
function handleGetFeatureResponse (dispatch, response, highlightFeaturesLayer) {
    if (response.status === 200) {
        const features = new WFS({version: highlightFeaturesLayer.version}).readFeatures(response.data);

        if (features.length === 0) {
            const parser = new DOMParser(),
                xmlDoc = parser.parseFromString(response.data, "text/xml"),
                exceptionText = xmlDoc.getElementsByTagName("ExceptionText")[0].childNodes[0].nodeValue;

            if (!exceptionText) {
                console.warn("highlightFeaturesByAttribute: No results found and couldn't parse response");
            }
            else {
                dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + exceptionText, {root: true});
            }
        }

        highlightPointFeature(highlighFeaturesByAttributeSettings.pointStyleId, "highlight_point_layer", "highlightPoint", highlightFeaturesLayer.gfiAttributes, features);
        highlightLineOrPolygonFeature(highlighFeaturesByAttributeSettings.polygonStyleId, "highlight_polygon_layer", "highlightPolygon", "Polygon", highlightFeaturesLayer.gfiAttributes, features);
        highlightLineOrPolygonFeature(highlighFeaturesByAttributeSettings.lineStyleId, "highlight_line_layer", "highlightLine", "LineString", highlightFeaturesLayer.gfiAttributes, features);
    }
    else {
        dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status, {root: true});
    }
}

/**
 * builds the filter snippet for islike/equalto property searching
 * @param {Boolean} isEqual search method isEqual
 * @param {String} wildCard the configured wildCard character
 * @param {String} singleChar the configured singleChar character
 * @param {String} escapeChar the configured escapeChar character
 * @param {String} propPrefix the configured search prefix (e.g. app:)
 * @param {String} propName the property/type-Name
 * @param {String} propValue the value to search for
 * @returns {String} query snippet
*/
function getOGCFilterSnippet (isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue) {
    let result = "";

    if (isEqual) {
        result = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${wildCard}' singleChar='${singleChar}' escapeChar='${escapeChar}'>
            <ogc:PropertyName>${propPrefix}${propName}</ogc:PropertyName>
            <ogc:Literal>${propValue}</ogc:Literal>
        </ogc:PropertyIsEqualTo>`;
    }
    else {
        result = `<ogc:PropertyIsLike matchCase='false' wildCard='${wildCard}' singleChar='${singleChar}' escapeChar='${escapeChar}'>
            <ogc:PropertyName>${propPrefix}${propName}</ogc:PropertyName>
            <ogc:Literal>${wildCard}${propValue}${wildCard}</ogc:Literal>
        </ogc:PropertyIsLike>`;
    }
    return result;
}

/**
 * builds the request body for WFS search
 * @param {String} featureType the feature queried
 * @param {String} resultPropName the result propertyName
 * @param {String} version WFS version
 * @param {String} filterSnippet the snippet for the isLike/equalTo-Query
 * @returns {String} WFS request, complete body
*/
function getWFSQuery (featureType, resultPropName, version, filterSnippet) {
    const result = `<?xml version='1.0' encoding='UTF-8'?>
        <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${version}'>
            <wfs:Query typeName='${featureType}'>
                <wfs:PropertyName>${resultPropName}</wfs:PropertyName>
                <ogc:Filter>
                    ${filterSnippet}
                </ogc:Filter>
            </wfs:Query>
        </wfs:GetFeature>`;

    return result;
}

/**
 * checks for configuration errors and writes console warnings in case something is wrong
 * @param {Object} layer the WFS layer to check
 * @param {String} wfsId the wfsId to be checked
 * @returns {Boolean} error occured or not
*/
function configHasErrors (layer, wfsId) {
    if (!layer) {
        console.warn("highlightFeaturesByAttribute: Layer with ID " + wfsId + " not found in Config");
        return true;
    }
    if (!layer.url) {
        console.warn("highlightFeaturesByAttribute: Layer with ID " + wfsId + " has no url configured");
        return true;
    }
    if (layer.wildCard && layer.wildCard.length !== 1) {
        console.warn("highlightFeaturesByAttribute: wildCard config setting must exist and be one character");
        return true;
    }
    if (layer.singleChar && layer.singleChar.length !== 1) {
        console.warn("highlightFeaturesByAttribute: singleChar config setting must exist and be one character");
        return true;
    }
    if (layer.escapeChar && layer.escapeChar.length !== 1) {
        console.warn("highlightFeaturesByAttribute: escapeChar config setting must exist and be one character");
        return true;
    }

    return false;
}

/**
 * highlight Features by Attributes
 * @param {Object} dispatch dispatch function
 * @param {String} wfsId the WFS Id
 * @param {String} propName the queried property name
 * @param {String} propValue the queried property value
 * @param {String} queryType the query type
 * @returns {void}
*/
export function highlightFeaturesByAttribute (dispatch, wfsId, propName, propValue, queryType) {
    const layerList = getLayerList(),
        layer = layerList.find(layerConf => layerConf.id === wfsId),
        isEqual = queryType && queryType.toLowerCase() === "isequal",
        filterSnippet = getOGCFilterSnippet(isEqual,
            layer.wildCard,
            layer.singleChar,
            layer.escapeChar,
            layer.propNameSearchPrefix,
            propName,
            propValue),
        requestBody = getWFSQuery(layer.featureType, layer.resultPropName, layer.version, filterSnippet);

    if (configHasErrors(layer, wfsId)) {
        dispatch("Alerting/addSingleAlert", "Konfiguration fehlerhaft. Bitte Konsolen-Ausgabe prüfen.", {root: true});
        return;
    }
    axios.post(layer.url, requestBody, {
        headers: {
            "Content-Type": "raw"
        },
        timeout: layer.timeout || 5000
    })
        .then(response => {
            handleGetFeatureResponse(dispatch, response, layer);
        })
        .catch(error => handleGetFeatureError(dispatch, error));
}
