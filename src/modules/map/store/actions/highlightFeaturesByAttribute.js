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
 * @typedef {Object} highlightFeaturesByAttributeState
 * @property {String} pointStyleId The id references the style.json for a point highlight features.
 * @property {String} polygonStyleId The id references the style.json for a polygon highlight features.
 * @property {String} lineStyleId The id references the style.json for a line highlight features.
 * @property {Object} highlightPoint The vector layer for the point highlight features.
 * @property {Object} highlightPolygon The vector layer for the polygon highlight features.
 * @property {Object} highlightLine The vector layer for the line highlight features.
 */
const highlighFeaturesSettings = {
    pointStyleId: "defaultHighlightFeaturesPoint",
    polygonStyleId: "defaultHighlightFeaturesPolygon",
    lineStyleId: "defaultHighlightFeaturesLine"
};

/**
 * handles the response from a wfs get feature request
 * @param {string} response - XML to be sent as String
 * @param {Object} highlightFeaturesLayer The configuration for the Layer.
 * @returns {void}
 */
function handleGetFeatureResponse (response, highlightFeaturesLayer) {
    if (response.status === 200) {
        let hadPoint = false,
            hadPolygon = false,
            hadLine = false;
        const styleListModelPoint = Radio.request("StyleList", "returnModelById", highlighFeaturesSettings.pointStyleId),
            styleListModelPolygon = Radio.request("StyleList", "returnModelById", highlighFeaturesSettings.polygonStyleId),
            styleListModelLine = Radio.request("StyleList", "returnModelById", highlighFeaturesSettings.lineStyleId),
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

        features.forEach(feature => {
            const geometry = feature.getGeometry();

            if (styleListModelPoint && geometry.getType() === "Point") {
                hadPoint = true;
                const coordinate = geometry.getCoordinates(),
                    iconFeature = new Feature({
                        geometry: new Point(coordinate),
                        gfiAttributes: feature.values_
                    }),
                    featureStyle = styleListModelPoint.createStyle(iconFeature, false);

                iconFeature.setStyle(featureStyle);
                highlightPoint.getSource().addFeature(iconFeature);
            }
            else if (styleListModelPolygon && geometry.getType() === "Polygon") {
                hadPolygon = true;
                const newFeature = new Feature({
                        geometry: geometry,
                        gfiAttributes: feature.values_
                    }),
                    featureStyle = styleListModelPolygon.createStyle(newFeature, false);

                newFeature.setStyle(featureStyle);
                highlightPolygon.getSource().addFeature(newFeature);
            }
            else if (styleListModelLine && geometry.getType() === "LineString") {
                hadLine = true;
                const newFeature = new Feature({
                        geometry: geometry,
                        gfiAttributes: feature.values_
                    }),
                    featureStyle = styleListModelLine.createStyle(newFeature, false);

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
        Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
    }
}

/**
 * highlight Features by Attributes
 * @param {Object} dispatch dispatch
 * @param {Object} queryObject the Query as read from the URL
 * @returns {void}
 */
function highlightFeaturesByAttribute ({dispatch}, queryObject) {
    const layerConf = getLayerList(),
        // highlighFeaturesConfig = Object.prototype.hasOwnProperty.call(Config, "highlightFeatures") ? Config.highlightFeatures : undefined,
        highlightFeaturesLayer = layerConf.find(layerConf => layerConf.id === queryObject.wfsId),
        querySnippetLike = `<ogc:PropertyIsLike matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
            <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>%${queryObject.propValue}%</ogc:Literal>
        </ogc:PropertyIsLike>`,
        querySnippetEqual = `<ogc:PropertyIsEqualTo matchCase='false' wildCard='${highlightFeaturesLayer.wildCard}' singleChar='${highlightFeaturesLayer.singleChar}' escapeChar='${highlightFeaturesLayer.escapeChar}'>
            <ogc:PropertyName>${highlightFeaturesLayer.propNameSearchPrefix}${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>${queryObject.propValue}</ogc:Literal>
        </ogc:PropertyIsEqualTo>`;

    if (!highlightFeaturesLayer) {
        console.warn("highlightFeatures Layer with ID " + queryObject.wfsId + " not found in Config");
        return;
    }
    if (highlightFeaturesLayer.wildCard.length !== 1) {
        console.warn("wildCard parameter must be one character");
        return;
    }
    if (highlightFeaturesLayer.singleChar.length !== 1) {
        console.warn("singleChar parameter must be one character");
        return;
    }
    if (highlightFeaturesLayer.escapeChar.length !== 1) {
        console.warn("escpapeChar parameter must be one character");
        return;
    }

    let reqData = `<?xml version='1.0' encoding='UTF-8'?>
        <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${highlightFeaturesLayer.version}'>
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
        headers: {"content-type": "raw"},
        timeout: 5000
    }).then(response => {
        return handleGetFeatureResponse(response, highlightFeaturesLayer);
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
