import axios from "axios";
import WMSCapabilities from "ol/format/WMSCapabilities";

import handleAxiosResponse from "../../utils/handleAxiosResponse";
import store from "../../app-store";
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
 * Prepares the parameters for the WMS-T.
 * This includes creating the range of possible time values, the minimum step between these as well as the initial value set.
 * @param {Object} attrs Attributes of the layer.
 * @throws {Error} Will throw an Error if the given layer is not a valid time layer.
 * @returns {Promise<number>} If the functions resolves, the initial value for the time dimension is returned.
 */
WMSTimeLayer.prototype.prepareTime = function (attrs) {
    const time = attrs.time;

    return this.requestCapabilities(attrs.url, attrs.version, attrs.layers)
        .then(result => {
            const {Dimension, Extent} = result.Capability.Layer.Layer[0];

            if (!Dimension || !Extent || Dimension[0].name !== "time" || Extent.name !== "time") {
                throw Error(i18next.t("common:modules.core.modelList.layer.wms.invalidTimeLayer", {id: this.id}));
            }
            return Extent;
        })
        .then(extent => {
            const {step, timeRange} = this.extractExtentValues(extent),
                defaultValue = typeof time === "object" && timeRange[0] <= time.default && time.default <= timeRange[timeRange.length - 1]
                    ? time.default
                    : Number(extent.default),
                timeData = {defaultValue, step, timeRange};

            attrs.time = typeof time === "object" ? {...time, ...timeData} : timeData;
            timeData.layerId = attrs.id;
            store.commit("WmsTime/addTimeSliderObject", {keyboardMovement: attrs.keyboardMovement, ...timeData});

            return defaultValue;
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
        .then(response => handleAxiosResponse(response, "WMS, createLayerSource, requestCapabilities"))
        .then(result => {
            const capabilities = new WMSCapabilities().read(result);

            capabilities.Capability.Layer.Layer[0].Extent = this.findTimeDimensionalExtent(new DOMParser().parseFromString(result, "text/xml").firstElementChild);
            return capabilities;
        });
};

/**
 * Search for the time dimensional Extent in the given HTMLCollection returned from a request to a WMS-T.
 * @param {HTMLCollection} element The root HTMLCollection returned from a getCapabilities request to a WMS-T.
 * @returns {?Object} An object containing the needed Values from the time dimensional extent for further usage.
 */
WMSTimeLayer.prototype.findTimeDimensionalExtent = function (element) {
    const capability = this.findNode(element, "Capability"),
        outerLayer = this.findNode(capability, "Layer"),
        innerFirstLayer = this.findNode(outerLayer, "Layer"),
        extent = this.findNode(innerFirstLayer, "Extent");

    return extent ? this.retrieveExtentValues(extent) : null;
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
 * @param {HTMLCollection} extent The Collection of values for the time dimensional Extent.
 * @returns {Object} An Object containing the attributes of the time dimensional Extent as well as its value.
 */
WMSTimeLayer.prototype.retrieveExtentValues = function (extent) {
    return [...extent.attributes]
        .reduce((acc, att) => ({...acc, [att.name]: att.value}), {values: extent.innerHTML});
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
 * @param {String} extent Time dimensional extent retrieved from the service.
 * @param {String} extent.values The values of the time dimensional extent.
 * @returns {Object} An object containing the range of possible time values as well as the minimum step between these.
 */
WMSTimeLayer.prototype.extractExtentValues = function ({values}) {
    const timeRange = [];
    let smallestStep = 1;

    // NOTE: This was implemented against a service that uses the syntax described in CASE 3. Might need adjustment to work for the others.
    timeRange.push(
        ...new Set(values.replace(" ", "").split(",")
            .map(entry => entry.split("/"))
            .map(entry => {
                // CASE 1 & 2
                if (entry.length === 1) {
                    return entry;
                }
                // CASE 3 & 4
                const [min, max] = entry.map(Number),
                    resolution = entry[2],
                    step = Number([...resolution][1]);

                // NOTE: This was implemented against a service that uses years. Might need adjustment to work for services that use months oder days.
                if (step < smallestStep) {
                    smallestStep = step;
                }

                return this.createTimeRange(min, max, step);
            })
            .flat(1)
            .map(Number)
            .sort((first, second) => first - second)));

    return {step: smallestStep, timeRange};
};

/**
 * Creates an array with ascending values from min to max separated by step.
 * @param {Number} min Minimum value.
 * @param {Number} max Maximum value.
 * @param {Number} step Distance between each value inside the array.
 * @returns {Number[]} Array of numbers between min and max with a distance of step to each neighbouring number.
 */
WMSTimeLayer.prototype.createTimeRange = function (min, max, step) {
    return Array(Math.floor((max - min) / step) + 1)
        .fill(undefined)
        .map((_, index) => min + (index * step));
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
