import {WFS} from "ol/format.js";

/**
 * highlight Features by Attributes
 * @param {Object} state state object
 * @returns {void}
 */
function highlightFeaturesByAttribute () {
    const xhttp = new XMLHttpRequest(),
        testUrl = "https://bsu-srv-arcgis.fhhnet.stadt.hamburg.de:9443/security-proxy/services/wfs_ak19g";

    xhttp.open("POST", testUrl, true);
    xhttp.onload = event => {
        handleGetFeatureResponse(event.target.responseText, event.target.status);
    };
    xhttp.onerror = event => {
        handleGetFeatureResponse(event.target.responseText, event.target.status);
    };
    xhttp.send(`<GetFeature version='1.1.0' xmlns:wfs='http://www.opengis.net/wfs'>
        <wfs:Query typeName='DS_USER_CODE'>
            <Filter xmlns='http://www.opengis.net/ogc'>
                <PropertyIsEqualTo>
                    <PropertyName>DS_USER_CODE</PropertyName>
                    <Literal>X2137XX1255XX1573X</Literal>
                </PropertyIsEqualTo>
            </Filter>
        </wfs:Query>
    </GetFeature>`);
    /*
    xhttp.open("GET", testUrl + "?service=WFS&version=1.1.0&request=GetFeature", true);
    xhttp.onload = event => {
        const feature = new WFS().readFeature(event.target.responseText);

        store.dispatch("Map/highlightFeature", {type: "highlightPolygon", feature: feature});
    };
    xhttp.onerror = event => {
        Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + event.target.status);
    };
    xhttp.send();
    */
}

/**
 * handles the response from a wfs get feature request
 * @param {string} response - XML to be sent as String
 * @param {integer} status - request status
 * @returns {void}
 */
function handleGetFeatureResponse (response, status) {
    if (status === 200) {
        const features = new WFS().readFeatures(response);

        console.log(features);
    }
    else {
        Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
    }
}

export {highlightFeaturesByAttribute};

