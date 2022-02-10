import StyleModel from "./styleModel";
import store from "../../src/app-store";

const StyleList = Backbone.Collection.extend(/** @lends StyleList.prototype */{
    /**
     * Returns style model according to Config setting.
     * @deprecated since new styleModel. Should be removed with version 3.0.
     * @param {object} attrs Attribute from collection
     * @param {object} options Attribute from collection
     * @returns {object} style model
     */
    model: function (attrs, options) {
        return new StyleModel(attrs, options);
    },
    url: function () {
        if (!Object.prototype.hasOwnProperty.call(Config, "styleConf") || Config.styleConf === "") {
            return "keine Style JSON";
        }
        return Config.styleConf;
    },
    /**
     * @class StyleList
     * @extends Backbone.Collection
     * @memberof VectorStyle
     * @constructs
     * @description Collection that stores all the vector styles contained in style.json.
     * Only the styles of the configured layers are kept.
     * If a tool has an attribute "styleId", then also this style is kept.
     * The styleId can be a string or an array of strings or an array of objects that need to have the attribute "id".
     * example "myStyleId", ["myStyleId2", "myStyleId3"], [{"id": "myStyleId4", "name": "I am not relevant for the style"}]
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens VectorStyle#RadioRequestStyleListReturnModelById
     */
    initialize: function () {
        const channel = Radio.channel("StyleList");

        channel.reply({
            "returnModelById": this.returnModelById,
            "getDefaultStyle": this.model.getDefaultStyle
        }, this);

        channel.on({
            "addToStyleList": jsonStyles => this.addToStyleList(jsonStyles)
        }, this);

        if (Object.prototype.hasOwnProperty.call(Config, "styleConf") && Config.styleConf !== "") {
            this.fetchStyles(Config.styleConf);
        }
    },

    /**
     * Fetches the style.json
     * @param {String} url Url to style.json
     * @returns {void}
     */
    fetchStyles: function (url) {
        const xhr = new XMLHttpRequest(),
            that = this;

        xhr.open("GET", url, false);
        xhr.onreadystatechange = function (event) {
            const target = event.target,
                status = target.status;
            let data;

            // ok
            if (status === 200) {
                try {
                    data = JSON.parse(target.response);
                }
                catch (e) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Die Datei '" + target.responseURL + "' konnte leider nicht geladen werden!</strong> <br> " +
                        "<small>Details: " + e.message + ".</small><br>",
                        kategorie: "alert-warning"
                    });
                }
                that.parseStyles(data);
            }
            // not found
            else if (status === 404) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Datei '" + target.responseURL + "' ist nicht vorhanden!</strong>",
                    kategorie: "alert-warning"
                });
            }


        };
        xhr.send();
    },
    /**
     * Returns model or by styleId or by layerId
     * @deprecated since new styleModel. Should be adjusted with version 3.0. Should always deliver .styleId
     * @param {string} layerId layerId
     * @returns {object} style model
    */
    returnModelById: function (layerId) {
        return this.find(slmodel => slmodel.attributes.styleId === layerId);
    },
    /**
     * overwrite parse function so that only the style-models are saved
     * whose layers are configured in the config.json
     * After that these models are automatically added to the collection
     * @param  {object[]} data parsed style.json
     * @return {object[]} filtered style.json objects
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     */
    parseStyles: function (data) {
        const layers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
            tools = Radio.request("Parser", "getItemsByAttributes", {type: "tool"}),
            dataWithDefaultValue = [...data];
        let styleIds = [],
            filteredData = [];

        dataWithDefaultValue.push({styleId: "default", rules: [{style: {}}]});
        dataWithDefaultValue.push(this.getMapmarkerPointDefaultStyle());
        dataWithDefaultValue.push(this.getMapmarkerPolygonDefaultStyle());

        styleIds.push(this.getStyleIdsFromLayers(layers));
        styleIds.push(this.getStyleIdForZoomToFeature());
        styleIds.push(this.getStyleIdForMapMarkerPoint());
        styleIds.push(this.getStyleIdForMapMarkerPolygon());
        styleIds.push(this.getStyleIdsFromTools(tools));
        styleIds.push(this.getFeatureViaURLStyles());

        styleIds = Array.isArray(styleIds) ? styleIds.reduce((acc, val) => acc.concat(val), []) : styleIds;
        filteredData = dataWithDefaultValue.filter(styleModel => styleIds.includes(styleModel.styleId));

        this.add(filteredData);

        return filteredData;
    },
    /**
     * Checks whether the module featureViaURL is activated and retrieves the styleIds.
     *
     * @returns {String[]} Array of styleIds for the layers for the features given via the URL.
     */
    getFeatureViaURLStyles: function () {
        const styleIds = [],
            layers = Config?.featureViaURL?.layers;

        if (layers !== undefined) {
            layers.forEach(layer => {
                styleIds.push(layer.styleId);
            });
        }
        return styleIds;
    },
    /**
     * Gathers the styleIds of the layers.
     * @param {Object[]} layers The configured layers.
     * @returns {Sting[]} - StyleIds from layers.
     */
    getStyleIdsFromLayers: function (layers) {
        const styleIds = [];

        if (layers) {
            layers.forEach(layer => {
                if (layer.typ === "WFS" || layer.typ === "GeoJSON" || layer.typ === "SensorThings" || layer.typ === "TileSet3D") {
                    if (layer?.styleId) {
                        styleIds.push(layer.styleId);
                    }
                }
                else if (layer.typ === "GROUP") {
                    layer.children.forEach(child => {
                        if (child?.styleId) {
                            styleIds.push(child.styleId);
                        }
                    });
                }
            });
        }
        return styleIds;
    },

    /**
     * Gathers the styleIds of the configured tools.
     * @param {Object[]} tools The configured tools.
     * @returns {String[]} - StyleIds of Tools
     */
    getStyleIdsFromTools: function (tools) {
        const styleIds = [];

        if (tools) {
            tools.forEach(tool => {
                if (tool?.styleId) {
                    if (Array.isArray(tool.styleId)) {
                        tool.styleId.forEach(styleIdInArray => {
                            if (styleIdInArray instanceof Object) {
                                styleIds.push(styleIdInArray.id);
                            }
                            else {
                                styleIds.push(styleIdInArray);
                            }
                        });
                    }
                    else {
                        styleIds.push(tool.styleId);
                    }
                }
            });
        }
        return styleIds;
    },

    /**
     * Gets styleId from config for zoomToFeature
     * @returns {String} - Style id
     */
    getStyleIdForZoomToFeature: function () {
        let styleId;

        if (Object.prototype.hasOwnProperty.call(Config, "zoomToFeature") && Object.prototype.hasOwnProperty.call(Config.zoomToFeature, "styleId")) {
            styleId = Config.zoomToFeature.styleId;
        }
        return styleId;
    },

    /**
     * Gets the default style for mapmarker as point.
     * @returns {Object} The default style for mapMarker point Style.
     */
    getMapmarkerPointDefaultStyle: function () {
        return {
            styleId: "defaultMapMarkerPoint",
            rules: [{
                style:
                {
                    type: "icon",
                    imageName: "mapMarker.svg",
                    imagePath: "../../img/",
                    imageScale: 1,
                    imageWidth: 34,
                    imageHeight: 48,
                    imageOffsetY: 46,
                    imageOffsetYUnit: "pixels"
                }
            }]
        };
    },

    /**
     * Gets the default style for mapmarker as polygon.
     * @returns {Object} The default style for mapMarker polygon Style.
     */
    getMapmarkerPolygonDefaultStyle: function () {
        return {
            styleId: "defaultMapMarkerPolygon",
            rules: [{
                style:
                {
                    polygonStrokeColor: [8, 119, 95, 1],
                    polygonStrokeWidth: 4,
                    polygonFillColor: [8, 119, 95, 0.3],
                    polygonStrokeDash: [8]
                }
            }]
        };
    },

    /**
     * gets style id from MapMarker
     * @returns {String} - Style id of mapMarker.
     */
    getStyleIdForMapMarkerPoint: function () {
        let styleId;

        if (store.getters["MapMarker/pointStyleId"]) {
            styleId = store.getters["MapMarker/pointStyleId"];
        }
        return styleId;
    },

    /**
     * gets style id from MapMarker
     * @returns {String} - Style id of mapMarker.
     */
    getStyleIdForMapMarkerPolygon: function () {
        let styleId;

        if (store.getters["MapMarker/polygonStyleId"]) {
            styleId = store.getters["MapMarker/polygonStyleId"];
        }
        return styleId;
    },

    /**
     * adds a style to the style list
     * @param {Array} jsonStyles Array of styles
     * @returns  {void}
     */
    addToStyleList: function (jsonStyles) {
        const attrs = {
                add: true,
                colletion: this,
                merge: false,
                remove: false
            },
            styles = jsonStyles;

        styles.forEach(style => {
            this.add(new StyleModel(style, attrs));
        });
    }
});

export default StyleList;
