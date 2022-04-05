import StyleModel from "./style.js";
import {Text, Fill, Stroke} from "ol/style.js";
import {mapAttributes} from "../../src/utils/attributeMapper.js";

const TextStyleModel = StyleModel.extend(/** @lends TextStyleModel.prototype */{
    /**
     * @description Class to create ol.style/Text
     * @class TextStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     */
    defaults: {
        // cluster text
        /**
         * @type {string}
         * @enum {"counter"|"none"|"text"}
         */
        "clusterTextType": "counter",
        /**
         * text to show if clusterTextType: "text"
         * @type {string}
         */
        "clusterText": "",
        /**
         * @type {string}
         * @enum {"left"|"right"|"center"|"end"|"start"}
         * @see https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
         */
        "clusterTextAlign": "center",
        /**
         * @type {string}
         * @enum {"left"|"right"|"center"|"end"|"start"}
         * @see https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
         */
        "clusterTextFont": "Comic Sans MS",
        /**
         * @type {number}
         */
        "clusterTextScale": 2,
        /**
         * @type {number}
         */
        "clusterTextOffsetX": 0,
        /**
         * @type {number}
         */
        "clusterTextOffsetY": 2,
        "clusterTextFillColor": [255, 255, 255, 1],
        "clusterTextStrokeColor": [0, 0, 0, 0],
        /**
         * @type {number}
         */
        "clusterTextStrokeWidth": 0,

        // simple text
        "textAlign": "center",
        "textFont": "Comic Sans MS",
        /**
         * @type {number}
         */
        "textScale": 2,
        /**
         * @type {number}
         */
        "textOffsetX": 10,
        /**
         * @type {number}
         */
        "textOffsetY": -8,
        "textFillColor": [69, 96, 166, 1],
        "textStrokeColor": [240, 240, 240, 1],
        /**
         * @type {number}
         */
        "textStrokeWidth": 3,
        "labelField": "",
        "textSuffix": ""
    },

    initialize: function (feature, styles, isClustered) {
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style} - The created style.
    */
    getStyle: function () {
        const isClustered = this.get("isClustered"),
            feature = this.get("feature"),
            labelField = this.get("labelField");

        if (isClustered && feature.get("features")?.length > 1 && this.get("clusterTextType") !== "none") {
            return this.createClusteredTextStyle();
        }
        else if (labelField) {
            return this.createLabeledTextStyle();
        }

        return new Text();
    },

    /**
    * Creates text style for clustered features. The text attribute is set according to "clusterTextType".
    * "clusterTextType" === "counter" sets the number of clustered features.
    * "clusterTextType" === "text" sets the value of "clusterText" or "undefined".
    * @returns {ol/style/Text} - The created style.
    */
    createClusteredTextStyle: function () {
        const feature = this.get("feature");
        let text;

        if (this.get("clusterTextType") === "counter") {
            text = feature.get("features").length.toString();
        }
        else if (this.get("clusterTextType") === "text" && typeof this.get("clusterText") === "string") {
            text = this.get("clusterText");
        }
        else {
            text = "undefined";
        }

        return new Text({
            text: text,
            textAlign: this.get("clusterTextAlign"),
            offsetX: this.get("clusterTextOffsetX"),
            offsetY: this.get("clusterTextOffsetY"),
            font: this.get("clusterTextFont"),
            scale: this.get("clusterTextScale"),
            fill: new Fill({
                color: this.get("clusterTextFillColor")
            }),
            stroke: new Stroke({
                color: this.get("clusterTextStrokeColor"),
                width: this.get("clusterTextStrokeWidth")
            })
        });
    },

    /**
    * Creates text style for simple features. The text attribute is set using "labelField".
    * @returns {ol/style/Text} - The created style.
    */
    createLabeledTextStyle: function () {
        const feature = this.get("feature"),
            featureProperties = feature.getProperties(),
            textSuffix = this.get("textSuffix");
        let text = mapAttributes(featureProperties, this.get("labelField"), false);

        if (textSuffix !== "") {
            text = text + " " + textSuffix;
        }
        return new Text({
            text: text.toString(),
            textAlign: this.get("textAlign"),
            offsetX: this.get("textOffsetX"),
            offsetY: this.get("textOffsetY"),
            font: this.get("textFont"),
            scale: this.get("textScale"),
            fill: new Fill({
                color: this.get("textFillColor")
            }),
            stroke: new Stroke({
                color: this.get("textStrokeColor"),
                width: this.get("textStrokeWidth")
            })
        });
    }
});

export default TextStyleModel;
