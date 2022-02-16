import {WFS} from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import axios from "axios";
import { Radio } from "backbone";

/**
 * User type definition
 * @typedef {Object} highlightFeaturesByAttributeState
 * @property {String} pointStyleId The id references the style.json for a point map marker.
 * @property {String} polygonStyleId The id references the style.json for a polygon map marker.
 * @property {Object} highlightPoint The vector layer for the point map marker.
 * @property {Object} highlightPolygon The vector layer for the polygon map marker.
 */
 const highlighFeaturesState = {
    pointStyleId: "defaultHighlightFeaturesPoint", //defaultHighlightFeaturesPoint
    polygonStyleId: "defaultHighlightFeaturesPolygon",
    lineStyleId: "defaultHighlightFeaturesLine",
    highlightPoint: new VectorLayer({
        id: "highlight_point_layer",
        name: "highlightPoint",
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true
    }),
    highlightPolygon: new VectorLayer({
        id: "highlight_polygon_layer",
        name: "highlightPolygon",
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true
    }),
    highlightLine: new VectorLayer({
        id: "highlight_line_layer",
        name: "highlightLine",
        source: new VectorSource(),
        visible: false,
        style: new Style(),
        alwaysOnTop: true
    }),
    config: undefined
};

const configPaths = [
    "configJs.highlightFeatures"
];

/**
 * handles the response from a wfs get feature request
 * @param {string} response - XML to be sent as String
 * @param {Object} highlightFeaturesLayer The configuration for the Layer.
 * @returns {void}
 */
function handleGetFeatureResponse (dispatch, response, highlightFeaturesLayer) {
    if (response.status === 200) {
        let hadPoint = false, hadPolygon = false, hadLine = false;
        const styleListModelPoint = Radio.request("StyleList", "returnModelById", highlighFeaturesState.pointStyleId);
        const styleListModelPolygon = Radio.request("StyleList", "returnModelById", highlighFeaturesState.polygonStyleId);
        const styleListModelLine = Radio.request("StyleList", "returnModelById", highlighFeaturesState.lineStyleId);

        const features = new WFS({version: highlightFeaturesLayer.version}).readFeatures(response.data);

        features.forEach(feature => {
            const geometry = feature.getGeometry();
            if (styleListModelPoint && geometry.getType() === "Point") {
                hadPoint = true;
                let coordinate = geometry.getCoordinates();
                const iconFeature = new Feature({
                    geometry: new Point(coordinate)
                }),
                featureStyle = styleListModelPoint.createStyle(iconFeature, false);

                iconFeature.setStyle(featureStyle);
                highlighFeaturesState.highlightPoint.getSource().addFeature(iconFeature);
            }
            else if (styleListModelPolygon && geometry.getType() === "Polygon") {
                hadPolygon = true;
                const newFeature = new Feature({
                        geometry: geometry
                    }),
                    featureStyle = styleListModelPolygon.createStyle(newFeature, false);
                newFeature.setStyle(featureStyle);
                highlighFeaturesState.highlightPolygon.getSource().addFeature(newFeature);
            }
            else if (styleListModelLine && geometry.getType() === "LineString") {
                hadLine = true;
                const newFeature = new Feature({
                        geometry: geometry
                    }),
                    featureStyle = styleListModelLine.createStyle(newFeature, false);
                newFeature.setStyle(featureStyle);
                highlighFeaturesState.highlightLine.getSource().addFeature(newFeature);
            }
        });
        if (hadPoint) {
            highlighFeaturesState.highlightPoint.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlighFeaturesState.highlightPoint);
        }
        if (hadPolygon) {
            highlighFeaturesState.highlightPolygon.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlighFeaturesState.highlightPolygon);
        }
        if (hadLine) {
            highlighFeaturesState.highlightLine.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlighFeaturesState.highlightLine);
        }
    }
    else {
        Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
    }
}

/**
 * highlight Features by Attributes
 * @param {Object} state state object
 * @returns {void}
 */
function highlightFeaturesByAttribute ({dispatch}, queryObject) {
    const highlighFeaturesConfig = Object.prototype.hasOwnProperty.call(Config, "highlightFeatures") ? Config.highlightFeatures : undefined;
    if (!highlighFeaturesConfig) {
        console.warn("highlightFeatures not configured");
        return;
    }
    const highlightFeaturesLayer = highlighFeaturesConfig.layers.find(layerConf => layerConf.id === queryObject.wfsId);
    if (!highlightFeaturesLayer) {
        console.warn("highlightFeatures Layer with ID " + queryObject.wfsId + " not found in Config");
        return;
    }

    const querySnippetLike = `<ogc:PropertyIsLike matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
            <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>%${queryObject.propValue}%</ogc:Literal>
        </ogc:PropertyIsLike>`;
    const querySnippetEqual = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
        <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
        <ogc:Literal>${queryObject.propValue}</ogc:Literal>
    </ogc:PropertyIsEqualTo>`;

    //P_TIERARTEN_INVASIV
    let reqData = `<?xml version='1.0' encoding='UTF-8'?>
        <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${highlightFeaturesLayer.WFSVersion}'>
        <wfs:Query typeName='${highlightFeaturesLayer.typename}'>
        <wfs:PropertyName>${highlightFeaturesLayer.resultPropName}</wfs:PropertyName>
        <ogc:Filter>`;
    if (queryObject.queryType === "IsEqual") {
        reqData = reqData + querySnippetEqual;
    }
    else {
        reqData = reqData + querySnippetLike;
    }
    reqData = reqData + "</ogc:Filter></wfs:Query></wfs:GetFeature>";

    axios({
        method: "post",
        url: highlightFeaturesLayer.url,
        data: reqData,
        headers: { 'content-type': 'raw' },
        timeout: 5000
    }).then(response => {
        return handleGetFeatureResponse(dispatch, response, highlightFeaturesLayer);
    }).catch(function (error) {
        if (error.response) {
            // Request made and server responded
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
    });
}

export {highlightFeaturesByAttribute};
