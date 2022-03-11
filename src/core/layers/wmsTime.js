import axios from "axios";
import moment from "moment";

import handleAxiosResponse from "../../utils/handleAxiosResponse";
import store from "../../app-store";
import detectIso8601Precision from "../../utils/detectIso8601Precision";
import WMSLayer from "./wms";

/**
 * Creates a layer of type WMSTime.
 * @param {Object} attrs Attributes of the layer.
 * @returns {void}
 */export default function WMSTimeLayer (attrs) {

    const defaults = {
        keyboardMovement: 5,
        time: true
    };

    // call the super-layer
    WMSLayer.call(this, Object.assign(defaults, attrs));
}

// Link prototypes and add prototype methods, means WMSTimeLayer uses all methods and properties of WMSLayer
WMSTimeLayer.prototype = Object.create(WMSLayer.prototype);

/**
 * Updates the time parameter of the WMS-T if the id of the layer is correct.
 * @param {String} id Unique Id of the layer to update.
 * @param {String} newValue New TIME value of the WMS-T.
 * @returns {void}
 */
WMSTimeLayer.prototype.updateTime = function (id, newValue) {
    if (id === this.get("id")) {
        this.get("layerSource").updateParams({"TIME": newValue});
    }
};

/**
 * Gets raw level attributes from parent extended by an attribute TIME.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Object} The raw layer attributes with TIME.
 */
WMSTimeLayer.prototype.getRawLayerAttributes = function (attrs) {
    return Object.assign({TIME: this.prepareTime(attrs)}, WMSLayer.prototype.getRawLayerAttributes.call(this, attrs));
};

/**
 * Retrieves wmsTime-related entries from GetCapabilities layer specification.
 * @param {String} xmlCapabilities GetCapabilities XML response
 * @param {String} layerName name of layer to use
 * @param {object} timeSpecification may contain "dimensionName" and "extentName"
 * @returns {object} dimension and extent of layer
 */
WMSTimeLayer.prototype.retrieveTimeData = function (xmlCapabilities, layerName, timeSpecification) {
    const {dimensionName, extentName} = timeSpecification,
        xmlDocument = new DOMParser().parseFromString(xmlCapabilities, "text/xml"),
        layerNode = [
            ...xmlDocument.querySelectorAll("Layer > Name")
        ].filter(node => node.textContent === layerName)[0].parentNode,
        xmlDimension = layerNode.querySelector(`Dimension[name="${dimensionName}"]`),
        xmlExtent = layerNode.querySelector(`Extent[name="${extentName}"]`),
        dimension = xmlDimension ? this.retrieveAttributeValues(xmlDimension) : null,
        extent = xmlExtent ? this.retrieveAttributeValues(xmlExtent) : null;

    return {dimension, extent};
};

/**
 * @param {String[]} timeRange valid points in time for WMS-T
 * @param {String?} extentDefault default specified by service
 * @param {String?} configuredDefault default specified by config (preferred usage)
 * @returns {String} default to use
 */
WMSTimeLayer.prototype.determineDefault = function (timeRange, extentDefault, configuredDefault) {
    if (configuredDefault && configuredDefault !== "current") {
        if (timeRange.includes(configuredDefault)) {
            return configuredDefault;
        }

        console.error(
            `Configured WMS-T default ${configuredDefault} is not within timeRange:`,
            timeRange,
            "Falling back to WMS-T default value."
        );
    }

    if (configuredDefault === "current" || extentDefault === "current") {
        const now = moment(),
            firstGreater = timeRange.find(
                timestamp => moment(timestamp).diff(now) >= 0
            );

        return firstGreater || timeRange[timeRange.length - 1];
    }

    return extentDefault || timeRange[0];
};

/**
 * Prepares the parameters for the WMS-T.
 * This includes creating the range of possible time values, the minimum step between these as well as the initial value set.
 * @param {Object} attrs Attributes of the layer.
 * @throws {Error} Will throw an Error if the given layer is not a valid time layer.
 * @returns {Promise<number>} If the functions resolves, the initial value for the time dimension is returned.
 */
WMSTimeLayer.prototype.prepareTime = function (attrs) {
    const time = typeof attrs.time === "object" ? attrs.time : {};

    if (!time.dimensionName) {
        time.dimensionName = "time";
    }

    if (!time.extentName) {
        time.extentName = "time";
    }

    // @deprecated
    if (typeof time.default === "number") {
        console.warn(
            `WMS-T has '"default": ${time.default}' configured as number.
            Using number is deprecated, this field is now a string.
            Please use '"default": "${time.default}"' instead.
            This value is converted, but this breaks in next major release.`
        );
        time.default = String(time.default);
    }

    return this.requestCapabilities(attrs.url, attrs.version, attrs.layers)
        .then(xmlCapabilities => {
            const {dimension, extent} = this.retrieveTimeData(xmlCapabilities, attrs.layers, time);

            if (!dimension || !extent) {
                throw Error(i18next.t("common:modules.core.modelList.layer.wms.invalidTimeLayer", {id: this.id}));
            }
            else if (dimension.units !== "ISO8601") {
                throw Error(`WMS-T layer ${this.id} specifies time dimension in unit ${dimension.units}. Only ISO8601 is supported.`);
            }
            else {
                const {step, timeRange} = this.extractExtentValues(extent),
                    defaultValue = this.determineDefault(timeRange, extent.default, time.default),
                    timeData = {defaultValue, step, timeRange};

                attrs.time = {...time, ...timeData};
                timeData.layerId = attrs.id;
                store.commit("WmsTime/addTimeSliderObject", {keyboardMovement: attrs.keyboardMovement, ...timeData});

                return defaultValue;
            }
        })
        .catch(error => {
            this.removeLayer();
            // remove layer from project completely
            Radio.trigger("Parser", "removeItem", attrs.id);
            Radio.trigger("Util", "refreshTree");

            console.error(i18next.t("common:modules.core.modelList.layer.wms.errorTimeLayer", {error, id: attrs.id}));
        });
};

/**
 * Requests the GetCapabilities document and parses the result.
 * @param {String} url The url of wms time.
 * @param {String} version The version of wms time.
 * @param {String} layers The layers of wms time.
 * @returns {Promise} A promise which will resolve the parsed GetCapabilities object.
 */
WMSTimeLayer.prototype.requestCapabilities = function (url, version, layers) {
    return axios.get(encodeURI(`${url}?service=WMS&version=${version}&layers=${layers}&request=GetCapabilities`))
        .then(response => handleAxiosResponse(response, "WMS, createLayerSource, requestCapabilities"));
};

/**
 * Finds the Element with the given name inside the given HTMLCollection.
 * @param {HTMLCollection} element HTMLCollection to be found.
 * @param {String} nodeName Name of the Element to be searched for.
 * @returns {HTMLCollection} If found, the HTMLCollection with given name, otherwise undefined.
 */
WMSTimeLayer.prototype.findNode = function (element, nodeName) {
    return [...element.children].find(el => el.nodeName === nodeName);
};

/**
 * Retrieves the attributes from the given HTMLCollection and adds the key value pairs to an object.
 * Also retrieves its value.
 * @param {HTMLCollection} node The Collection of values for the time node.
 * @returns {Object} An Object containing the attributes of the time node as well as its value.
 */
WMSTimeLayer.prototype.retrieveAttributeValues = function (node) {
    return [...node.attributes]
        .reduce((acc, att) => ({...acc, [att.name]: att.value}), {value: node.innerHTML});
};

/**
 * Compares WMS-T resolution increments.
 * @param {object} step increment to compare to
 * @param {object} increment increment to consider
 * @returns {boolean} whether increment is smaller
 */
WMSTimeLayer.prototype.incrementIsSmaller = function (step, increment) {
    const compareStrings = [step, increment].map(
        ({years, months, days, minutes, hours, seconds}) => "P" +
            (years || "").padStart(4, "0") + "Y" +
            (months || "").padStart(2, "0") + "M" +
            (days || "").padStart(2, "0") + "D" +
            "T" +
            (minutes || "").padStart(2, "0") + "H" +
            (hours || "").padStart(2, "0") + "M" +
            (seconds || "").padStart(2, "0") + "S"
    );

    return compareStrings[0] > compareStrings[1];
};

/**
 * Extracts the values from the time dimensional extent.
 * There are four different cases how the values may be present (as described in the [WMS Specification at Table C.1]{@link http://cite.opengeospatial.org/OGCTestData/wms/1.1.1/spec/wms1.1.1.html#dims.declaring}).
 * They can be determined based on the characters "," and '/'.
 *
 * - CASE 1: Single Value; neither ',' nor '/' are present. The returned Array will have only this value, the step will be 1.
 * - CASE 2: List of multiple values; ',' is present, '/' isn't. The returned array will have exactly these values. The step is dependent on the minimal distances found inside this array.
 * - CASE 3: Interval defined by its lower and upper bounds and its resolution; '/' is present, ',' isn't. The returned Array will cover all values between the lower and upper bounds with a distance of the resolution.
 *         The step is retrieved from the resolution.
 * - Case 4: List of multiple intervals; ',' and '/' are present. For every interval the process described in CASE 3 will be performed.
 *
 * @param {object} extent Time dimensional extent retrieved from the service.
 * @returns {Object} An object containing the range of possible time values.
 */
WMSTimeLayer.prototype.extractExtentValues = function (extent) {
    let step;
    const extentValue = extent.value,
        timeRange = extentValue
            .replaceAll(" ", "")
            .split(",")
            .map(entry => entry.split("/"))
            .map(entry => {
                // CASE 1 & 2
                if (entry.length === 1) {
                    return entry;
                }
                // CASE 3 & 4
                const [min, max, resolution] = entry,
                    increment = this.getIncrementsFromResolution(resolution),
                    singleTimeRange = this.createTimeRange(min, max, increment);

                if (!step || this.incrementIsSmaller(step, increment)) {
                    step = increment;
                }

                return singleTimeRange;
            })
            .flat(1)
            .sort((first, second) => first > second);

    return {
        timeRange: [...new Set(timeRange)], // dedupe
        step
    };
};

/**
 * @param {String} resolution in WMS-T format, e.g. "P1900YT5M"; see specification
 * @returns {object} map of increments for start date
 */
WMSTimeLayer.prototype.getIncrementsFromResolution = function (resolution) {
    const increments = {},
        shorthandsLeft = {
            Y: "years",
            M: "months",
            D: "days"
        },
        shorthandsRight = {
            H: "hours",
            M: "minutes",
            S: "seconds"
        },
        [leftHand, rightHand] = resolution.split("T");

    [...leftHand.matchAll(/(\d+)[^0-9]/g)].forEach(([hit, increment]) => {
        increments[shorthandsLeft[hit.slice(-1)]] = increment;
    });

    if (rightHand) {
        [...rightHand.matchAll(/(\d+)[^0-9]/g)].forEach(([hit, increment]) => {
            increments[shorthandsRight[hit.slice(-1)]] = increment;
        });
    }

    return increments;
};

/**
 * Creates an array with ascending values from min to max separated by resolution.
 * @param {String} min Minimum value.
 * @param {String} max Maximum value.
 * @param {object} increment Distance between each value inside the array.
 * @returns {object} Steps and step increments.
 */
WMSTimeLayer.prototype.createTimeRange = function (min, max, increment) {
    const increments = Object.entries(increment),
        start = moment.utc(min),
        end = moment.utc(max),
        timeRange = [],
        format = detectIso8601Precision(min),
        suffix = min.endsWith("Z") ? "Z" : "";

    while (start.valueOf() <= end.valueOf()) {
        timeRange.push(start.format(format) + suffix);
        increments.forEach(([units, difference]) => {
            start.add(Number(difference), units);
        });
    }

    return timeRange;
};

/**
 * If two WMS-T are shown: Remove the layerSwiper; depending if the original layer was closed, update the layer with a new time value.
 * @param {String} layerId The layer id.
 * @returns {void}
 */
WMSTimeLayer.prototype.removeLayer = function (layerId) {
    // If the swiper is active, two WMS-T are currently active
    if (store.getters["WmsTime/layerSwiper"].active) {
        if (!layerId.endsWith(store.getters["WmsTime/layerAppendix"])) {
            this.setIsSelected(true);
        }
        store.dispatch("WmsTime/toggleSwiper", layerId);
    }
    else {
        store.commit("WmsTime/setTimeSliderActive", {active: false, currentLayerId: ""});
    }
};
