import {WFS} from "ol/format.js";
import axios from "axios";

    /**
 * handles the response from a wfs get feature request
 * @param {string} response - XML to be sent as String
 * @param {integer} status - request status
 * @returns {void}
 */
function handleGetFeatureResponse (dispatch, response, wfsId) {
    if (response.status === 200) {
        const features = new WFS({version: "1.1.0"}).readFeatures(response.data);

        console.log(features);
        dispatch("Map/highlightFeatures", {type: "highlightPolygons", features: features, layerId: wfsId}, {root: true});
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
        return handleGetFeatureResponse(dispatch, response, queryObject.wfsId);
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
