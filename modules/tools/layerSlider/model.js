import Tool from "../../core/modelList/tool/model";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const LayerSliderModel = Tool.extend(/** @lends LayerSliderModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        layerIds: [],
        timeInterval: 2000,
        title: "common:modules.tools.layerSlider.title",
        progressBarWidth: 10,
        activeLayer: {layerId: ""},
        windowsInterval: null,
        renderToWindow: true,
        glyphicon: "glyphicon-film",
        sliderType: "player",
        dataSliderMin: "0",
        dataSliderMax: "",
        dataSliderTicks: "",
        // translations
        displayLayers: "",
        titleNotConfigured: "",
        serviceOne: "",
        serviceTwo: "",
        serviceThree: ""
    }),

    /**
     * @class LayerSliderModel
     * @description todo
     * @extends Tool
     * @memberOf Tools.LayerSlider
     * @constructs
     * @property {Array} layerIds=[] the configured layer with their ids and titles.
     * @property {number} timeInterval=2000 Time interval.
     * @property {*} title=null The title of the currently selected layer.
     * @property {number} progressBarWidth=10 The Width of the progress bar.
     * @property {object} activeLayer={layerId: ""} The Active layer.
     * @property {*} windowsInterval=null the Windows Interval used to iterate through the layers.
     * @property {boolean} renderToWindow=true Flag that shows if tool renders to window.
     * @property {string} glyphicon="glyphicon-film" Glyphicon.
     * @property {String} sliderType="player" Slidertype. "player" or "handle".
     * @property {String} dataSliderMin="0" Data slider min. Used for slider input.
     * @property {String} dataSliderMax="" Data slider max. Used for slider input.
     * @property {String} dataSliderTicks="" Data slider ticks. Show the positions of the layers in the slider. Used for slider input.
     * @listens Tools.LayerSlider#changeIsActive
     * @fires Tools.LayerSlider#changeIsActive
     * @fires Tools.LayerSlider#changeActiveLayer
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     */
    initialize: function () {
        const invalidLayerIds = this.checkIfAllLayersAvailable(this.get("layerIds"));

        this.superInitialize();
        if (invalidLayerIds.length > 0) {
            Radio.trigger("Alert", "alert", "Konfiguration des Werkzeuges: " + this.get("name") + " fehlerhaft. <br>Bitte prüfen Sie folgende LayerIds: " + invalidLayerIds + "!");
        }
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.checkIfLayermodelExist(this.get("layerIds"));
                }
            }
        });
        this.checkSliderType(this.get("sliderType"));

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "translatedTitle": i18next.t(this.get("title")),
            "titleNotConfigured": i18next.t("common:modules.tools.layerSlider.titleNotConfigured"),
            "serviceOne": i18next.t("common:modules.tools.layerSlider.serviceOne"),
            "serviceTwo": i18next.t("common:modules.tools.layerSlider.serviceTwo"),
            "serviceThree": i18next.t("common:modules.tools.layerSlider.serviceThree"),
            "currentLng": lng
        });
    },

    /**
     * Checks the slider type and starts the specific functions.
     * @param {String} sliderType type of slider. Possible values are "player" or "handle".
     * @returns {void}
     */
    checkSliderType: function (sliderType) {
        if (sliderType === "player") {
            this.setProgressBarWidth(this.get("layerIds"));
        }
        else if (sliderType === "handle") {
            this.initHandle();
        }
        else {
            const alertMessage = {
                x: this.get("name"),
                y: sliderType
            };

            Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.layerSlider.key", {alertMessage}));
        }
    },

    /**
     * Initializes the handle functionality.
     * @returns {void}
     */
    initHandle: function () {
        const layerIds = this.get("layerIds"),
            dataSliderTicks = this.prepareSliderTicks(layerIds);

        this.setDataSliderMax(String((layerIds.length - 1) * 10));
        this.setDataSliderTicks(dataSliderTicks);
    },

    /**
     * Drags the handle and shows the corresponding layer with its transparency.
     * @param {Number} index Index of handle position.
     * @returns {void}
     */
    dragHandle: function (index) {
        const prevLayerId = this.getLayerIdFromIndex(index),
            nextLayerId = this.getLayerIdFromIndex(index, "next"),
            prevLayerTransparency = (index % 10) * 10,
            nextLayerTransparency = 100 - prevLayerTransparency;

        this.showLayer(prevLayerId, prevLayerTransparency);
        this.showLayer(nextLayerId, nextLayerTransparency);
    },

    /**
     * Gets the layerId from the given index.
     * @param {Number} index Index of handle position.
     * @param {String} [mode] Mode. Indicates which layer should be taken.
     * @returns {String} - layerId.
     */
    getLayerIdFromIndex: function (index, mode) {
        const position = this.getPositionFromValue(index, mode),
            layerIdObj = this.get("layerIds")[position],
            layerId = layerIdObj ? layerIdObj.layerId : undefined;

        return layerId;
    },

    /**
     * Calculates the position of the layer, based on the handle position.
     * @param {Number} index Index of handle position.
     * @param {String} [mode] Mode. Indicates which layer should be taken.
     * @returns {Number} - position of layer in "layerIds"
     */
    getPositionFromValue: function (index, mode) {
        let position = Math.floor(Math.round(index) / 10);

        if (mode && mode === "next") {
            position++;
        }

        return position;
    },

    /**
     * Modificates the layers visibility and transparency based on the handle position.
     * @param {String} layerId Layer id.
     * @param {Number} transparency transparency based on the handle position.
     * @returns {void}
     */
    showLayer: function (layerId, transparency) {
        const layerIds = this.get("layerIds");
        let filteredObj,
            index;

        if (transparency < 100) {
            this.sendModification(layerId, true, transparency);
        }
        if (transparency === 0) {
            this.sendModification(layerId, true, transparency);
            filteredObj = layerIds.filter(obj => {
                return obj.layerId === layerId;
            });
            index = layerIds.indexOf(filteredObj[0]);
            this.setActiveIndex(index);
        }
        if (transparency === 100) {
            this.sendModification(layerId, false, 0);
        }
    },

    /**
     * Prepares the slider ticks based on the layerIds array.
     * @param {Object[]} layerIds Layer ids.
     * @return {String} - Slider ticks configuration for bootstrap-slider.
     */
    prepareSliderTicks: function (layerIds) {
        let sliderTicks = [];

        layerIds.forEach((obj, index) => {
            sliderTicks.push(index * 10);
        });
        sliderTicks = JSON.stringify(sliderTicks);

        return sliderTicks;
    },

    /**
     * Resets the tool.
     * @returns {void}
     */
    reset: function () {
        this.stopInterval();
        this.set("activeLayer", {layerId: ""});
    },

    /**
     * Checks if the layer model already exists.
     * @param {object[]} layerIds - Configuration of the layers from config.json
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    checkIfLayermodelExist: function (layerIds) {
        layerIds.forEach(layer => {
            if (Radio.request("ModelList", "getModelsByAttributes", {id: layer.layerId}).length === 0) {
                this.addLayerModel(layer.layerId);
            }
        });
    },

    /**
     * Adds the layer model briefly to the model to run prepareLayerObject and then removes the model again.
     * @param {string} layerId - Id of the layer
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);
    },

    /**
     * Determines the visibility of the layerIds
     * @param {string} activeLayerId - Id des activeLayer.
     * @returns {void}
     */
    toggleLayerVisibility: function (activeLayerId) {
        this.get("layerIds").forEach(layer => {
            const status = layer.layerId === activeLayerId;

            this.sendModification(layer.layerId, status);
        });
    },

    /**
     * Triggers the new visibility over the radio
     * @param {string} layerId - layerId
     * @param {boolean} status - Visibility true / false
     * @param {Number} transparency Transparency of layer.
     * @returns {void}
     */
    sendModification: function (layerId, status, transparency) {
        const transp = transparency || 0;

        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status,
            transparency: transp
        });
    },

    /**
     * Finds the index in the layerIds array to the activeLayerId or returns -1.
     * @returns {integer} - Index im Array mit activeLayerId.
     */
    getActiveIndex: function () {
        return this.get("layerIds").findIndex(function (layer) {
            return layer.layerId === this.get("activeLayer").layerId;
        }, this);
    },

    /**
     * Finds the activeLayerId based on the index and initiates storage.
     * @param {integer} index - Index in layerIds.
     * @returns {void}
     */
    setActiveIndex: function (index) {
        this.setActiveLayer(this.get("layerIds")[index]);
        this.toggleLayerVisibility(this.get("activeLayer").layerId);
    },

    /**
     * Setter of the Windows interval. Binds to this.
     * @param {function} func - Function to be executed in this
     * @param {integer}  autorefreshInterval - Interval in ms
     * @returns {void}
     */
    setWindowsInterval: function (func, autorefreshInterval) {
        this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
    },

    /**
     * Starts the Windows interval once.
     * @returns {void}
     */
    startInterval: function () {
        const windowsInterval = this.get("windowsInterval"),
            timeInterval = this.get("timeInterval");

        if (windowsInterval === null) {
            this.forwardLayer();
            this.setWindowsInterval(this.forwardLayer, timeInterval);
        }
    },

    /**
     * Stops the windows interval.
     * @returns {void}
     */
    stopInterval: function () {
        const windowsInterval = this.get("windowsInterval");

        if (typeof windowsInterval !== "undefined") {
            clearInterval(windowsInterval);
            this.set("windowsInterval", null);
        }
    },

    /**
     * Finds the previous index in the array in a loop.
     * @returns {void}
     */
    backwardLayer: function () {
        const index = this.getActiveIndex(),
            max = this.get("layerIds").length - 1;

        if (index > 0) {
            this.setActiveIndex(index - 1);
        }
        else {
            this.setActiveIndex(max);
        }
    },

    /**
     * Finds the next index in the array in a loop.
     * @returns {void}
     */
    forwardLayer: function () {
        const index = this.getActiveIndex(),
            max = this.get("layerIds").length - 1;

        if (index > -1 && index < max) {
            this.setActiveIndex(index + 1);
        }
        else {
            this.setActiveIndex(0);
        }
    },

    /**
     * Checks if all layers that the layerSlider should use are also defined and have a title attribute.
     * @param {object[]} layers - Configuration of the layers from config.json
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @returns {object} Invalid Layer oder undefined
     */
    checkIfAllLayersAvailable: function (layers) {
        const invalidLayers = [];

        layers.forEach(function (layerObject) {
            if (
                !getLayerWhere({id: layerObject.layerId}) ||
                !Radio.request("Parser", "getItemByAttributes", {id: layerObject.layerId})
            ) {
                invalidLayers.push(layerObject.layerId);
            }
        });

        return invalidLayers;
    },

    /**
     * Setter for isCollapsed.
     * @param {boolean} value - isCollapsed
     * @returns {void}
     */
    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * Setter for isCurrentWin.
     * @param {boolean} value - isCurrentWin
     * @returns {void}
     */
    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    /**
    * Setter for layerIds.
    * @param {object[]} value - layerIds
    * @returns {void}
    */
    setLayerIds: function (value) {
        this.set("layerIds", value);
    },

    /**
    * Setter for translatedTitle.
    * @param {string} value - translatedTitle
    * @returns {void}
    */
    setTranslatedTitle: function (value) {
        this.set("translatedTitle", value);
    },

    /**
    * Setter for timeInterval.
    * @param {integer} value - timeInterval
    * @returns {void}
    */
    setTimeInterval: function (value) {
        this.set("timeInterval", value);
    },

    /**
    * Setter for progressBarWidth.
    * @param {object[]} layerIds - layerIds zum Ermitteln der width
    * @returns {void}
    */
    setProgressBarWidth: function (layerIds) {
        // Mindestbreite der ProgressBar ist 10%.
        if (layerIds.length <= 10) {
            this.set("progressBarWidth", Math.round(100 / layerIds.length));
        }
        else {
            this.set("progressBarWidth", 10);
        }
    },

    /**
    * Setter for activeLayerId.
    * @param {object} value - activeLayer
    * @returns {void}
    */
    setActiveLayer: function (value) {
        this.set("activeLayer", value);
    },

    /**
     * Setter for attribute "dataSliderMax".
     * @param {String} value Value
     * @returns {void}
     */
    setDataSliderMax: function (value) {
        this.set("dataSliderMax", value);
    },

    /**
     * Setter for attribute "dataSliderTicks".
     * @param {String} value Value
     * @returns {void}
     */
    setDataSliderTicks: function (value) {
        this.set("dataSliderTicks", value);
    }
});

export default LayerSliderModel;
