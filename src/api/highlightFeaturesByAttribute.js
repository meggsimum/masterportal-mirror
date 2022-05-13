import {WFS} from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";
import axios from "axios";
import {Radio} from "backbone";
import {getLayerList} from "@masterportal/masterportalapi/src/rawLayerList";

export default {
    /**
     * User type definition
     * @typedef {Object} settings
     * @property {String} pointStyleId The id references the style.json for a point highlight features.
     * @property {String} polygonStyleId The id references the style.json for a polygon highlight features.
     * @property {String} lineStyleId The id references the style.json for a line highlight features.
     */
    settings: {
        pointStyleId: "defaultHighlightFeaturesPoint",
        polygonStyleId: "defaultHighlightFeaturesPolygon",
        lineStyleId: "defaultHighlightFeaturesLine"
    },

    /**
     * creates a vector layer
     * @param {String} styleId The style Id
     * @param {String} layerId The layer Id
     * @param {String} name Layer name
     * @param {Object} gfiAttributes GFI attributes configuration
     * @returns {Object} the created VectorLayer
    */
    createVectorLayer: function (styleId, layerId, name, gfiAttributes) {
        return new VectorLayer({
            id: layerId,
            styleId: styleId,
            name: name,
            source: new VectorSource(),
            visible: false,
            style: new Style(),
            alwaysOnTop: true,
            gfiAttributes: gfiAttributes
        });
    },

    /**
     * highlight Features for Points
     * @param {String} modelId The model Id
     * @param {String} styleId The style Id
     * @param {String} name Layer name
     * @param {Object} gfiAttributes GFI attributes configuration
     * @param {Array} features The loaded WFS features
     * @returns {void} nothing
    */
    highlightPointFeature: function (modelId, styleId, name, gfiAttributes, features) {
        const styleListModel = Radio.request("StyleList", "returnModelById", modelId),
            highlightLayer = this.createVectorLayer(modelId, styleId, name, gfiAttributes);
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

            Radio.trigger("Map", "zoomToExtent", {extent: highlightLayer.getSource().getExtent()});
        }
    },

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
    highlightLineOrPolygonFeature: function (modelId, styleId, name, geometryRequested, gfiAttributes, features) {
        const styleListModel = Radio.request("StyleList", "returnModelById", modelId),
            highlightLayer = this.createVectorLayer(modelId, styleId, name, gfiAttributes);
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

            Radio.trigger("Map", "zoomToExtent", {extent: highlightLayer.getSource().getExtent()});
        }
    },

    /**
     * handles the error
     * @param {Function} dispatch dispatch function
     * @param {String} error - the given error
     * @returns {void}
    */
    handleGetFeatureError: function (dispatch, error) {
        console.error(error);
        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
    },

    /**
     * handles the response from a wfs get feature request
     * @param {Function} dispatch dispatch function
     * @param {string} response - XML to be sent as String
     * @param {Object} highlightFeaturesLayer The configuration for the Layer.
     * @returns {void}
    */
    handleGetFeatureResponse: function (dispatch, response, highlightFeaturesLayer) {
        if (response.status === 200) {
            const features = new WFS({version: highlightFeaturesLayer.version}).readFeatures(response.data);

            if (features.length === 0) {
                const parser = new DOMParser(),
                    xmlDoc = parser.parseFromString(response.data, "text/xml"),
                    exceptionText = xmlDoc.getElementsByTagName("ExceptionText")[0].childNodes[0].nodeValue;

                if (exceptionText) {
                    console.error("highlightFeaturesByAttribute: service exception: " + exceptionText);
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
                }
            }

            this.highlightPointFeature(this.settings.pointStyleId, "highlight_point_layer", "highlightPoint", highlightFeaturesLayer.gfiAttributes, features);
            this.highlightLineOrPolygonFeature(this.settings.polygonStyleId, "highlight_polygon_layer", "highlightPolygon", "Polygon", highlightFeaturesLayer.gfiAttributes, features);
            this.highlightLineOrPolygonFeature(this.settings.lineStyleId, "highlight_line_layer", "highlightLine", "LineString", highlightFeaturesLayer.gfiAttributes, features);
        }
        else {
            console.warn(status);
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.highlightFeaturesByAttribute.messages.requestFailed"), {root: true});
        }
    },

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
    getOGCFilterSnippet: function (isEqual, wildCard, singleChar, escapeChar, propPrefix, propName, propValue) {
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
    },

    /**
     * builds the request body for WFS search
     * @param {String} featureType the feature queried
     * @param {String} version WFS version
     * @param {String} filterSnippet the snippet for the isLike/equalTo-Query
     * @returns {String} WFS request, complete body
    */
    getWFSQuery: function (featureType, version, filterSnippet) {
        const result = `<?xml version='1.0' encoding='UTF-8'?>
            <wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='${version}'>
                <wfs:Query typeName='${featureType}'>
                    <ogc:Filter>
                        ${filterSnippet}
                    </ogc:Filter>
                </wfs:Query>
            </wfs:GetFeature>`;

        return result;
    },

    /**
     * checks for configuration errors and writes console warnings in case something is wrong
     * @param {Object} layer the WFS layer to check
     * @param {String} wfsId the wfsId to be checked
     * @returns {Boolean} error occured or not
    */
    configHasErrors: function (layer, wfsId) {
        if (!layer) {
            console.error("highlightFeaturesByAttribute: Layer with ID " + wfsId + " not found in Config");
            return true;
        }
        if (!layer.url) {
            console.error("highlightFeaturesByAttribute: Layer with ID " + wfsId + " has no url configured");
            return true;
        }
        if (!layer.wildCard || layer.wildCard?.length !== 1) {
            console.error("highlightFeaturesByAttribute: wildCard config setting must exist and be one character");
            return true;
        }
        if (!layer.singleChar || layer.singleChar?.length !== 1) {
            console.error("highlightFeaturesByAttribute: singleChar config setting must exist and be one character");
            return true;
        }
        if (!layer.escapeChar || layer.escapeChar?.length !== 1) {
            console.error("highlightFeaturesByAttribute: escapeChar config setting must exist and be one character");
            return true;
        }

        return false;
    },

    /**
     * highlight Features by Attributes
     * @param {Object} dispatch dispatch function
     * @param {String} wfsId the WFS Id
     * @param {String} propName the queried property name
     * @param {String} propValue the queried property value
     * @param {String} queryType the query type
     * @returns {void}
    */
    highlightFeaturesByAttribute: function (dispatch, wfsId, propName, propValue, queryType) {
        const layerList = getLayerList(),
            layer = layerList.find(layerConf => layerConf.id === wfsId),
            isEqual = queryType && queryType.toLowerCase() === "isequal",
            filterSnippet = this.getOGCFilterSnippet(isEqual,
                layer?.wildCard,
                layer?.singleChar,
                layer?.escapeChar,
                layer?.featurePrefix,
                propName,
                propValue),
            requestBody = this.getWFSQuery(layer?.featureType, layer?.version, filterSnippet);

        if (this.configHasErrors(layer, wfsId)) {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.highlightFeaturesByAttribute.messages.configurationError"), {root: true});
            return;
        }
        axios.post(layer.url, requestBody, {
            headers: {
                "Content-Type": "raw"
            },
            timeout: layer?.timeout
        })
            .then(response => {
                this.handleGetFeatureResponse(dispatch, response, layer);
            })
            .catch(error => this.handleGetFeatureError(dispatch, error));
    }
};
