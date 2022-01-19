import {WFS} from "ol/format.js";
import axios from "axios";

export default {
    /**
     * highlight Features by Attributes
     * @param {Object} state state object
     * @returns {void}
     */
    highlightFeaturesByAttribute: function () {
        const reqData = `<GetFeature version='1.1.0' xmlns:wfs='http://www.opengis.net/wfs'>
        <wfs:Query typeName='DS_USER_CODE'>
            <Filter xmlns='http://www.opengis.net/ogc'>
                <PropertyIsEqualTo>
                    <PropertyName>DS_USER_CODE</PropertyName>
                    <Literal>X2137XX1255XX1573X</Literal>
                </PropertyIsEqualTo>
            </Filter>
        </wfs:Query>
    </GetFeature>`;

        //axios.defaults.headers.post['Content-Type'] ='application/xml';
        axios({
            method: "post",
            url: "https://bsu-srv-arcgis.fhhnet.stadt.hamburg.de:9443/security-proxy/services/wfs_ak19g",
            data: reqData,
            headers: {
                "Content-Type": "application/xml",
                "Access-Control-Allow-Origin": "*",
                "Accept": "application/xml"
            },
            timeout: 5000
        }).then(response => {
            return this.handleGetFeatureResponse(response);
        });

        /*
        const xhttp = new XMLHttpRequest(),
            testUrl = "https://bsu-srv-arcgis.fhhnet.stadt.hamburg.de:9443/security-proxy/services/wfs_ak19g";

        xhttp.open("POST", testUrl, true);
        xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
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
        */
    },

    /**
     * handles the response from a wfs get feature request
     * @param {string} response - XML to be sent as String
     * @param {integer} status - request status
     * @returns {void}
     */
    handleGetFeatureResponse: function (response, status) {
        if (status === 200) {
            const features = new WFS().readFeatures(response);

            console.log(features);
        }
        else {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
        }
    },

    /**
     * @desc handles wps response
     * @param {String} response XML to be sent as String
     * @param {Function} responseFunction function to be called
     * @returns {void}
     */
     handleResponse: function (response, responseFunction) {
        let obj;

        if (response.status === 200) {
            obj = this.parseDataString(response.data);
        }
        responseFunction(obj, response.status);
    }
}
