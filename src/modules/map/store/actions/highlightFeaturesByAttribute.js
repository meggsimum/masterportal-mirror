import {fetchFirstModuleConfig} from "../../../../utils/fetchFirstModuleConfig";
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
    })
};

const configPaths = [
    "configJs.highlightFeatures"
];

/**
 * handles the response from a wfs get feature request
 * @param {string} response - XML to be sent as String
 * @param {Object} context The context Vue instance.
 * @returns {void}
 */
function handleGetFeatureResponse (dispatch, response) {
    if (response.status === 200) {
        // const moduleConfig = fetchFirstModuleConfig(context, configPaths, "HighlightFeatures", false);
        // console.log(moduleConfig);
        //2128
        console.log(highlighFeaturesState.pointStyleId);
        const styleListModel = Radio.request("StyleList", "returnModelById", highlighFeaturesState.pointStyleId);
        console.log(styleListModel);

        const features = new WFS({version: "1.1.0"}).readFeatures(response.data);
        let newLayer = Radio.request("Map", "createLayerIfNotExists", "highlightFeatures");

        features.forEach(feature => {
            if (styleListModel) {
                //console.log(feature);
                const geometry = feature.getGeometry(),
                    coordinate = geometry.getType() === "Point" ? geometry.getCoordinates() : Extent.getCenter(geometry.getExtent()); // Remove later for more reliable fallback

                const iconfeature = new Feature({
                        geometry: new Point(coordinate)
                    }),
                    featureStyle = styleListModel.createStyle(iconfeature, false);

                iconfeature.setStyle(featureStyle);
                highlighFeaturesState.highlightPoint.getSource().addFeature(iconfeature);
            }
            //commit("addFeatureToMarker", {feature: iconfeature, marker: "markerPoint"});
            //commit("setVisibilityMarker", {visibility: true, marker: "markerPoint"});
        });
        highlighFeaturesState.highlightPoint.setVisible(true);
        Radio.trigger("Map", "addLayerOnTop", highlighFeaturesState.highlightPoint);
        // rootGetters["Map/ol2DMap"].addLayerOnTop(state.markerPoint);

        /*
        console.log("created Layer");
        newLayer.setMap(Radio.request("Map", "getMap"));
        console.log("set Map");
        newLayer.setVisible(true);
        newLayer.getSource().addFeatures(features);
        console.log("added features to layer");
        */
        //dispatch("Map/highlightFeatures", {type: "highlightPolygons", features: features, layerId: newLayer.layerId}, {root: true});
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
    console.log(queryObject.context);
    console.log(queryObject.propName);
    console.log(queryObject.propValue);
    console.log(queryObject.queryType);
    console.log(queryObject.wfsId);
    const querySnippetLike = `<ogc:PropertyIsLike matchCase='false' wildCard='%' singleChar='#' escapeChar='!'>
            <ogc:PropertyName>app:${queryObject.propName}</ogc:PropertyName>
            <ogc:Literal>%${queryObject.propValue}%</ogc:Literal>
        </ogc:PropertyIsLike>`;
    const querySnippetEqual = `<ogc:PropertyIsEqual matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
        <ogc:PropertyName>app:${queryObject.propName}</ogc:PropertyName>
        <ogc:Literal>${queryObject.propValue}</ogc:Literal>
    </ogc:PropertyIsEqual>`;

    let reqData = `<?xml version='1.0' encoding='UTF-8'?>
        <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
        <wfs:Query typeName='app:P_TIERARTEN_INVASIV'>
        <wfs:PropertyName>app:SHAPE</wfs:PropertyName>
        <wfs:PropertyName>app:ANZAHL</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>`;
    if (queryObject.queryType === "isEqual") {
        reqData = reqData + querySnippetEqual;
    }
    else {
        reqData = reqData + querySnippetLike;
    }
    reqData = reqData + "</ogc:Filter></wfs:Query></wfs:GetFeature>";

    const reqData2 = `<?xml version='1.0' encoding='UTF-8'?>
    <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='app:P_TIERARTEN_INVASIV'>
    <wfs:PropertyName>app:ID_ART</wfs:PropertyName>
    <wfs:PropertyName>app:SHAPE</wfs:PropertyName>
    <wfs:maxFeatures>20</wfs:maxFeatures>
    <ogc:Filter>
        <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
            <ogc:PropertyName>app:DS_USER_CODE</ogc:PropertyName>
            <ogc:Literal>*X9999X*</ogc:Literal>
        </ogc:PropertyIsLike>
    </ogc:Filter>
    </wfs:Query>
    </wfs:GetFeature>`;
    
    axios({
        method: "post",
        //url: "https://bsu-srv-arcgis.fhhnet.stadt.hamburg.de/security-proxy/services/wfs_ak19g?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=app:P_TIERARTEN_INVASIV",
        //data: "&FILTER=" + encodeURIComponent(reqData),
        url: "https://bsu-srv-arcgis.fhhnet.stadt.hamburg.de/security-proxy/services/wfs_ak19g",
        data: reqData,
        headers: { 'content-type': 'raw' },
        timeout: 5000
    }).then(response => {
        return handleGetFeatureResponse(dispatch, response);
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
