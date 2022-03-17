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
 * handles the response from a wfs get feature request
 * @param {Function} dispatch dispatch function
 * @param {string} response - XML to be sent as String
 * @param {Object} highlightFeaturesLayer The configuration for the Layer.
 * @returns {void}
 */
function handleGetFeatureResponse (dispatch, response, highlightFeaturesLayer) {
    if (response.status === 200) {
        let hadPoint = false,
            hadPolygon = false,
            hadLine = false;
        const styleListModelPoint = Radio.request("StyleList", "returnModelById", highlighFeaturesByAttributeSettings.pointStyleId),
            styleListModelPolygon = Radio.request("StyleList", "returnModelById", highlighFeaturesByAttributeSettings.polygonStyleId),
            styleListModelLine = Radio.request("StyleList", "returnModelById", highlighFeaturesByAttributeSettings.lineStyleId),
            features = new WFS({version: highlightFeaturesLayer.version}).readFeatures(response.data),
            highlightPoint = new VectorLayer({
                id: "highlight_point_layer",
                name: "highlightPoint",
                source: new VectorSource(),
                visible: false,
                style: new Style(),
                alwaysOnTop: true,
                gfiAttributes: highlightFeaturesLayer.gfiAttributes,
                gfiTheme: "default"
            }),
            highlightPolygon = new VectorLayer({
                id: "highlight_polygon_layer",
                name: "highlightPolygon",
                source: new VectorSource(),
                visible: false,
                style: new Style(),
                alwaysOnTop: true,
                gfiAttributes: highlightFeaturesLayer.gfiAttributes,
                gfiTheme: "default"
            }),
            highlightLine = new VectorLayer({
                id: "highlight_line_layer",
                name: "highlightLine",
                source: new VectorSource(),
                visible: false,
                style: new Style(),
                alwaysOnTop: true,
                gfiAttributes: highlightFeaturesLayer.gfiAttributes,
                gfiTheme: "default"
            });
        
        if (features.length === 0) {
            if (window.DOMParser) {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(response.data, "text/xml");
                let exceptionText = xmlDoc.getElementsByTagName("ExceptionText")[0].childNodes[0].nodeValue;
                
                dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + exceptionText, {root: true});
            }
            else {
                console.warn("highlightFeaturesByAttribute: No results found and couldn't parse response");
            }
        }

        features.forEach(feature => {
            const geometry = feature.getGeometry();

            if (styleListModelPoint && geometry.getType() === "Point") {
                hadPoint = true;
                const coordinate = geometry.getCoordinates(),
                    iconFeature = new Feature({
                        geometry: new Point(coordinate)
                    }),
                    featureStyle = styleListModelPoint.createStyle(iconFeature, false);

                iconFeature.setProperties(feature.getProperties());
                iconFeature.setStyle(featureStyle);
                highlightPoint.getSource().addFeature(iconFeature);
            }
            else if (styleListModelPolygon && geometry.getType() === "Polygon") {
                hadPolygon = true;
                const newFeature = new Feature({
                        geometry: geometry
                    }),
                    featureStyle = styleListModelPolygon.createStyle(newFeature, false);

                newFeature.setProperties(feature.getProperties());
                newFeature.setStyle(featureStyle);
                highlightPolygon.getSource().addFeature(newFeature);
            }
            else if (styleListModelLine && geometry.getType() === "LineString") {
                hadLine = true;
                const newFeature = new Feature({
                        geometry: geometry
                    }),
                    featureStyle = styleListModelLine.createStyle(newFeature, false);

                newFeature.setProperties(feature.getProperties());
                newFeature.setStyle(featureStyle);
                highlightLine.getSource().addFeature(newFeature);
            }
        });
        if (hadPoint) {
            highlightPoint.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlightPoint);
        }
        if (hadPolygon) {
            highlightPolygon.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlightPolygon);
        }
        if (hadLine) {
            highlightLine.setVisible(true);
            Radio.trigger("Map", "addLayerOnTop", highlightLine);
        }
    }
    else {
        dispatch("Alerting/addSingleAlert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status, {root: true});
    }
}

/**
 * highlight Features by Attributes
 * @param {Object} dispatch dispatch
 * @param {Object} queryObject the Query as read from the URL
 * @returns {void}
 */
function highlightFeaturesByAttribute ({dispatch}, queryObject) {
    const layerList = getLayerList(),
        highlightFeaturesLayer = layerList.find(layerConf => layerConf.id === queryObject.wfsId),
        querySnippetLike = `<ogc:PropertyIsLike matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
            <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>%${queryObject.propValue}%</ogc:Literal>
        </ogc:PropertyIsLike>`,
        querySnippetEqual = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
            <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>${queryObject.propValue}</ogc:Literal>
        </ogc:PropertyIsEqualTo>`;

    if (!highlightFeaturesLayer) {
        console.warn("highlightFeaturesByAttribute Layer with ID " + queryObject.wfsId + " not found in Config");
        return;
    }
    if (!highlightFeaturesLayer.url) {
        console.warn("highlightFeaturesByAttribute Layer has no url configured");
        return;
    }
    if (highlightFeaturesLayer.wildCard && highlightFeaturesLayer.wildCard.length !== 1) {
        console.warn("highlightFeaturesByAttribute: wildCard config setting must be one character");
        return;
    }
    if (highlightFeaturesLayer.singleChar && highlightFeaturesLayer.singleChar.length !== 1) {
        console.warn("highlightFeaturesByAttribute: singleChar config setting must be one character");
        return;
    }
    if (highlightFeaturesLayer.escapeChar && highlightFeaturesLayer.escapeChar.length !== 1) {
        console.warn("highlightFeaturesByAttribute: escpapeChar config setting must be one character");
        return;
    }

    let reqData = `<?xml version='1.0' encoding='UTF-8'?>
        <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${highlightFeaturesLayer.version}'>
        <wfs:Query typeName='${highlightFeaturesLayer.featureType}'>
        <wfs:PropertyName>${highlightFeaturesLayer.resultPropName}</wfs:PropertyName>
        <ogc:Filter>`;

    if (queryObject.queryType && queryObject.queryType.toLowerCase() === "isequal") {
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
        headers: {"content-type": "raw"},
        timeout: 5000
    }).then(response => {
        handleGetFeatureResponse(dispatch, response, highlightFeaturesLayer);
    }).catch(function (error) {
        if (error.response) {
            // Request made and server responded
            console.warn(error.response.data);
            console.warn(error.response.status);
            console.warn(error.response.headers);
        }
        else if (error.request) {
            // The request was made but no response was received
            console.warn(error.request);
        }
        else {
            // Something happened in setting up the request that triggered an Error
            console.warn(error.message);
        }
    });
}

export {highlightFeaturesByAttribute};
