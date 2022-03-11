import {getValueFromObjectByPath} from "../../src/utils/getValueFromObjectByPath.js";

const StyleModel = Backbone.Model.extend(/** @lends StyleModel.prototype */{
    /**
     * @description Class to maintain some methods.
     * @class PolygonStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     */
    defaults: {},

    /*
    * setter for feature
    * @param {ol/feature} value feature
    * @returns {void}
    */
    setFeature: function (value) {
        this.set("feature", value);
    },

    /*
    * setter for isClustered
    * @param {Boolean} value isClustered
    * @returns {void}
    */
    setIsClustered: function (value) {
        this.set("isClustered", value);
    },

    /*
    * setter for styles
    * @param {object} styles styles
    * @returns {void}
    */
    overwriteStyling: function (styles) {
        // check if styles object is defined
        // if not, use defaults instead
        if (styles) {
            let key;

            for (key in styles) {
                const value = styles[key];

                this.set(key, value);
            }
        }
    },
    /**
     * Returns the value of the given field. Also considers that the field can be an object path.
     * @param {Object} featureProperties Feature properties.
     * @param {String} field Field to get value.
     * @returns {*} - Value from given field.
     */
    prepareField: function (featureProperties, field) {
        const isPath = field.startsWith("@");
        let value = field;

        if (isPath) {
            value = getValueFromObjectByPath(featureProperties, value);
            if (typeof value === "undefined") {
                value = "undefined";
            }
        }
        else {
            value = Object.prototype.hasOwnProperty.call(featureProperties, field) ? featureProperties[field] : "undefined";
        }
        return value;
    }
});

export default StyleModel;
