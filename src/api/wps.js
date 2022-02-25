import axios from "axios";
import xml2json from "./utils/xml2json";
import store from "../app-store";

export default {
    /**
     * @desc sends POST request to wps
     * @param {String} url url
     * @param {String} xmlString XML to be sent as String
     * @param {Function} responseFunction function to be called
     * @param {Number} timeout if set used as timeout in milliseconds, else timeout of 10.000 msecs is used
     * @returns {void}
     */
    sendRequest: function (url, xmlString, responseFunction, timeout) {
        axios({
            method: "post",
            url: url,
            data: xmlString,
            headers: {"Content-Type": "text/xml"},
            timeout: timeout
        }).then(response => {
            return this.handleResponse(response, responseFunction);
        });
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
    },

    /**
     * Parse xml from String and turn xml into Object
     * @param {String} dataString the xml to be parsed as String
     * @returns {Object} xml parsed as Object
     */
    parseDataString: function (dataString) {
        const xml = new DOMParser().parseFromString(dataString, "text/xml"),
            jsonResult = xml2json(xml, false);

        return jsonResult;
    },

    /**
     * @desc build xml for WPS request
     * @param {String} identifier String The functionality to be invoked by the wps
     * @param {String} xmlTemplate String  XML frame template that is filled
     * @param {String} dataInputXmlTemplate String Inner XML used to generate attributes
     * @param {Object} [data={}] Object Contains the Attributes to be sent
     * @return {String} dataString
     */
    buildXML: function (identifier, xmlTemplate, dataInputXmlTemplate, data = {}) {
        let dataString = this.setXMLElement(xmlTemplate, "</ows:Identifier>", identifier);

        Object.entries(data).forEach(dat => {
            const obj = dat[1],
                key = dat[0],
                dataType = Object.prototype.hasOwnProperty.call(obj, "dataType") ? obj.dataType : undefined,
                value = Object.prototype.hasOwnProperty.call(obj, "value") ? obj.value : obj;
            let attributeString;

            attributeString = this.setXMLElement(dataInputXmlTemplate, "</ows:Identifier>", key);
            attributeString = this.setXMLElement(attributeString, "</wps:LiteralData>", value, dataType);
            dataString = this.setXMLElement(dataString, "</wps:DataInputs>", attributeString);
        });

        return dataString;
    },

    /**
     * @desc insert Value into tag
     * @param {String} dataString dataString which gets enriched with data
     * @param {String} closingTagName the closing tag of the attribute to be set
     * @param {String} value Object the Value to be set, toString() is used to obtain String
     * @param {String} dataType datatype which is uses for tag attribute
     * @returns {String} newdataString with added dada
     */
    setXMLElement: function (dataString, closingTagName, value, dataType) {
        let newDataString = dataString === undefined ? "" : dataString;

        if (dataType !== undefined) {
            newDataString = newDataString.toString().replace("<wps:LiteralData>", "<wps:LiteralData dataType='" + dataType + "'>");
        }

        if (dataString !== undefined && closingTagName !== undefined && value !== undefined) {
            newDataString = newDataString.toString().replace(closingTagName.toString(), value.toString() + closingTagName.toString());
        }
        return newDataString;
    },

    /**
     * @desc request to be built and sent to WPS
     * @param {String} wpsID The service id, defined in rest-services.json
     * @param {String} identifier The functionality to be invoked by the wps
     * @param {Object} data Contains the Attributes to be sent
     * @param {Function} responseFunction function to be called
     * @param {Number} timeout if set used as timeout in milliseconds, else timeout of 10.000 msecs is used
     * @returns {void}
     */
    wpsRequest: function (wpsID, identifier, data, responseFunction, timeout) {
        const xmlTemplate = "<wps:Execute xmlns:wps=\"http://www.opengis.net/wps/1.0.0\"" +
            " xmlns:xlink=\"http://www.w3.org/1999/xlink\"" +
            " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
            " xmlns:ows=\"http://www.opengis.net/ows/1.1\"" +
            " service=\"WPS\"" +
            " version=\"1.0.0\"" +
            " xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">" +
            "<ows:Identifier></ows:Identifier>" +
            "<wps:DataInputs></wps:DataInputs>" +
            "</wps:Execute>",
            dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>",
            xmlString = this.buildXML(identifier, xmlTemplate, dataInputXmlTemplate, data),
            url = store.getters.getRestServiceById(wpsID)?.url;

        this.sendRequest(url, xmlString, responseFunction, timeout);
    }
};
