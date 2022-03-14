import Overlay from "ol/Overlay.js";
import mapCollection from "../../src/core/dataStorage/mapCollection.js";

const MouseHoverPopupModel = Backbone.Model.extend(/** @lends MouseHoverPopupModel.prototype */{
    defaults: {
        overlay: new Overlay({
            id: "mousehover-overlay"
        }),
        textPosition: null,
        textArray: null,
        minShift: 5,
        numFeaturesToShow: 2,
        infoText: ""
    },

    /**
     * @class MouseHoverPopupModel
     * @extends Backbone.Model
     * @memberof MouseHover
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("MouseHover") Radio channel for communication
     * @property {ol.Feature} overlay=newOverlay({id:"mousehover-overlay"}) New OpenLayers Overlay instance
     * @property {String} textPosition=null Position for the popup to open
     * @property {Array} textArray=null Array to hold the text for the popup
     * @property {Number} minShift=5 Minimum shift to check if the mouse position changed significantly
     * @property {Number} numFeaturesToShow=2 Maximum number of texts to show
     * @property {String} infoText="(weitereObjekte.Bittezoomen.)" Default info text to add to the popup
     * @fires MouseHover#render
     * @fires Map#RadioTriggerMapAddOverlay
     * @fires Map#RadioTriggerMapRegisterListener
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @listens MouseHover#RadioTriggerMouseHoverHide
     */

    initialize: function () {
        const channel = Radio.channel("MouseHover");

        if (document.getElementById("map")) {
            this.listenTo(channel, {
                "hide": this.destroyPopup,
                "toggle": this.toggle
            });
            Radio.trigger("Map", "addOverlay", this.get("overlay"));
            this.setPoinertMoveListener(Radio.request("Map", "registerListener", "pointermove", this.checkDragging.bind(this)));
            document.getElementById("map").addEventListener("mouseleave", this.destroyPopup.bind(this));

            this.getMouseHoverInfosFromConfig();
            if (Config.mouseHover?.numFeaturesToShow) {
                this.set("numFeaturesToShow", Config.mouseHover?.numFeaturesToShow);
            }
            if (Config.mouseHover?.infoText) {
                this.set("infoText", Config.mouseHover?.infoText);
            }
            this.listenTo(Radio.channel("i18next"), {
                "languageChanged": this.changeLang
            });
            this.changeLang();
        }
    },

    /**
    * change language - sets default values for the language
    * @param {String} lng the language changed to
    * @returns {Void} -
    */
    changeLang: function () {
        let key = "common:mouseHover.infoText";

        if (Config.mouseHover?.infoText) {
            key = Config.mouseHover?.infoText;
        }
        this.set({
            infoText: i18next.t(key)
        });
    },

    /**
     * turns the overlay on or off
     * @param {string|number} id - the overlay identifier
     * @returns {void}
     */
    toggle: function (id) {
        if (mapCollection.getMap("ol", "2D").getOverlayById(id)) {
            Radio.trigger("Map", "removeOverlay", this.get("overlay"));
            Radio.trigger("Map", "unregisterListener", this.get("pointerMoveListener"));
        }
        else {
            Radio.trigger("Map", "addOverlay", this.get("overlay"));
            this.setPoinertMoveListener(Radio.request("Map", "registerListener", "pointermove", this.checkDragging.bind(this)));
        }
    },

    /**
    * Gets MouseHoverInfos from config.
    * @fires Parser#RadioRequestParserGetItemsByAttributes
    * @returns {Void}  -
    */
    getMouseHoverInfosFromConfig: function () {
        const groupLayers = [],
            layerAssoc = {};
        let layerGroups = [],
            wfsLayers = [],
            geoJsonLayers = [],
            sensorThingsLayers = [],
            oafLayers = [],
            vectorLayers = [],
            mouseHoverLayers = [],
            mouseHoverInfos = [];

        // Extract relevant layer from grouped layers
        layerGroups = Radio.request("Parser", "getItemsByAttributes", {type: "layer", typ: "GROUP"});
        layerGroups.forEach(layerGroup => {
            layerGroup.children.forEach(layer => {
                if (["WFS", "GeoJSON", "SensorThings", "OAF"].indexOf(layer.typ) !== -1) {
                    groupLayers.push(layer);
                }
            });
        });

        wfsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"});
        geoJsonLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON"});
        sensorThingsLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "SensorThings"});
        oafLayers = Radio.request("Parser", "getItemsByAttributes", {typ: "OAF"});

        // union all found layers using the layer id
        wfsLayers.concat(geoJsonLayers, sensorThingsLayers, oafLayers, groupLayers).forEach(layer => {
            if (layer.id === undefined) {
                return;
            }
            layerAssoc[layer.id] = layer;
        });
        vectorLayers = Object.values(layerAssoc);

        // now filter all layers with mouse hover functionality
        mouseHoverLayers = vectorLayers.filter(function (layer) {
            return layer?.mouseHoverField && layer.mouseHoverField !== "";
        });
        mouseHoverInfos = mouseHoverLayers.map(layer => {
            return {id: layer.id, mouseHoverField: layer.mouseHoverField};
        });

        this.setMouseHoverInfos(mouseHoverInfos);
    },

    /**
     * Destroy the Popup.
     * @returns {void}
     */
    destroyPopup: function () {
        this.setTextArray(null);
        this.setTextPosition(null);
        this.setOverlayPosition(undefined);
    },
    /**
     * Shows the Popup.
     * @fires MouseHover#render
     * @returns {void}
     */
    showPopup: function () {
        this.trigger("render", this.get("textArray"));
    },

    /**
     * Sets the position of the overlay
     * @param {ol.Coordinate | undefined} value - if the value is undefined the overlay is hidden
     * @returns {void}
     */
    setOverlayPosition: function (value) {
        this.get("overlay").setPosition(value);
    },

    /**
     * Gets the features at the pixel
     * @param {evt} evt PointerMoveEvent
     * @param {Array} mouseHoverInfos Array of mouseHoverInfos
     * @returns {Array} features Array of features at the pixel
     */
    getFeaturesAtPixel: function (evt, mouseHoverInfos) {
        const features = [],
            layerIds = mouseHoverInfos.map(obj => obj.id);

        evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer !== null && layerIds.indexOf(layer.get("id")) !== -1) {
                features.push({
                    feature: feature,
                    layer: layer
                });
            }

        });
        return features;
    },
    /**
     * Checks if the feature is a cluster feature
     * @param {ol.Feature} feature feature at pixel
     * @returns {Boolean} boolean  True or False result of feature check
     */
    isClusterFeature: function (feature) {
        if (feature.getProperties().features) {
            return true;
        }
        return false;
    },
    /**
     * Create feature array
     * @param {ol.Feature} featureAtPixel feature at pixel
     * @returns {Object[]}  an array of objects{feature: ol.Feature, layerId: String} at pixel
     */
    fillFeatureArray: function (featureAtPixel) {
        // featuresAtPixel.layer !== null --> quick little hack to avoid showing the popup while drawing SD 01.09.2015
        if (featureAtPixel === undefined || featureAtPixel.layer === null) {
            return [];
        }

        const pFeatureArray = [],
            selFeature = featureAtPixel.feature;

        if (this.isClusterFeature(selFeature)) {
            const list = selFeature.getProperties().features;

            list.forEach(element => {
                pFeatureArray.push({
                    feature: element,
                    layerId: featureAtPixel.layer.get("id")
                });
            });
        }
        else {
            pFeatureArray.push({
                feature: selFeature,
                layerId: featureAtPixel.layer.get("id")
            });
        }

        return pFeatureArray;
    },

    /**
     * Checks Drag-Modus
     * @param  {evt} evt Event-Object
     * @returns {void}
     */
    checkDragging: function (evt) {
        if (evt.dragging) {
            return;
        }
        this.checkTextPosition(evt);
    },

    /**
     * Checks the features at the mouse position
     * @param  {evt} evt PointerMoveEvent
     * @returns {void}
     */
    checkForFeaturesAtPixel: function (evt) {
        const featureAssoc = {},
            featuresAtPixel = this.getFeaturesAtPixel(evt, this.get("mouseHoverInfos"));

        featuresAtPixel.forEach(featureAtPixel => {
            const featureArray = this.fillFeatureArray(featureAtPixel);

            featureArray.forEach(feature => {
                const key = feature.layerId + "_SEPARATOR_" + feature.feature.getId();

                featureAssoc[key] = feature;
            });
        });

        this.checkAction(Object.values(featureAssoc), evt);
    },

    /**
     * Checks which MouseHover action needs to happen depending on the features to show
     * @param  {Array} featuresArray Array of the features to show
     * @param {evt} evt Event-Object
     * @returns {void}
     */
    checkAction: function (featuresArray, evt) {
        let textArray = [];

        // no Features at MousePosition
        if (featuresArray.length === 0) {
            this.destroyPopup();
            return;
        }
        textArray = this.checkTextArray(featuresArray);

        // no text at MousePosition
        if (textArray.length === 0) {
            this.destroyPopup();
            return;
        }

        // New positioning
        this.setOverlayPosition(evt.coordinate);
        // changing the text
        if (!this.isTextEqual(textArray, this.get("textArray"))) {
            this.setTextArray(textArray);
            this.showPopup();
        }
    },

    /**
     * Checks if both arrays are identical
     * @param  {Array}  array1 new text
     * @param  {Array}  array2 old text
     * @return {Boolean} boolean True or False result of the check
     */
    isTextEqual: function (array1, array2) {
        return JSON.stringify(array1) === JSON.stringify(array2);
    },

    /**
     * Checks if the mouse position significantly changed from Config value
     * @param  {evt} evt MouseHover
     * @returns {void}
     */
    checkTextPosition: function (evt) {
        const lastPixel = this.get("textPosition"),
            newPixel = evt.pixel,
            minShift = this.get("minShift");

        if (!lastPixel || newPixel[0] < lastPixel[0] - minShift || newPixel[0] > lastPixel[0] + minShift || newPixel[1] < lastPixel[1] - minShift || newPixel[1] > lastPixel[1] + minShift) {
            this.setTextPosition(evt.pixel);
            this.checkForFeaturesAtPixel(evt);
        }
    },

    /**
     * Return the string for the popup
     * @param  {String | Array} mouseHoverField Content for popup
     * @param  {Object} featureProperties       Properties of features
     * @returns {String} value String of popup content
     */
    pickValue: function (mouseHoverField, featureProperties) {
        if (typeof mouseHoverField === "string") {
            return Object.prototype.hasOwnProperty.call(featureProperties, mouseHoverField) ? featureProperties[mouseHoverField] : "";
        }
        else if (!Array.isArray(mouseHoverField)) {
            return "";
        }

        let value = "";

        mouseHoverField.forEach((element, index) => {
            if (typeof featureProperties[element.trim()] !== "string") {
                console.error("Parameter \"mouseHoverField\" in config.json mit Wert \"" + element.trim() + "\" gibt keinen String zurück!");
                value = value + "<span class='" + (index === 0 ? "title" : "") + "'>no data</span></br>";
                return;
            }
            value = value + "<span class='" + (index === 0 ? "title" : "") + "'>" + featureProperties[element.trim()] + "</span></br>";
        });

        return value;
    },

    /**
     * This function examines the pFeatureArray and extracts the text to show
     * @param  {Array} featureArray Array of features at MousePosition
     * @returns {Array} textArrayBroken Array containing text to show
     */
    checkTextArray: function (featureArray) {
        const mouseHoverInfos = this.get("mouseHoverInfos"),
            textArray = [],
            infoText = this.get("infoText") ? "<span class='info'>" + this.get("infoText") + "</span>" : "",
            numFeatures = this.get("numFeaturesToShow");
        let textArrayCheckedLength = "",
            textArrayBroken = "";

        // for each hovered over Feature...
        featureArray.forEach(element => {
            const featureProperties = element.feature.getProperties(),
                layerInfos = mouseHoverInfos.find(mouseHoverInfo => {
                    return mouseHoverInfo.id === element.layerId;
                });

            if (layerInfos !== undefined) {
                textArray.push(this.pickValue(layerInfos.mouseHoverField, featureProperties));
            }
        });
        textArrayCheckedLength = this.checkMaxFeaturesToShow(textArray, numFeatures, infoText);
        textArrayBroken = this.addBreak(textArrayCheckedLength);

        return textArrayBroken;
    },

    /**
     * creates a new shuffled text array if length of textArray is greater than given maxNum - adds infoTextMax if so
     * @param {String[]} textArray an array containing all texts
     * @param {Number} maxNum the maximum number of texts to be shown
     * @param {String} infoText an additional text to be pushed to the result if textArray is greater than given maxNum
     * @return {String[]} an array with a length less or equal than maxNum
     */
    checkMaxFeaturesToShow: function (textArray, maxNum = 2, infoText = "") {
        if (textArray.length <= maxNum) {
            return textArray;
        }

        const textArrayCorrected = [],
            textArrayCopy = textArray.concat();
        let i = 0,
            randomIndex = 0;

        for (i = 0; i < maxNum; i++) {
            randomIndex = Math.floor(Math.random() * textArrayCopy.length);
            textArrayCorrected.push(textArrayCopy.splice(randomIndex, 1)[0]);
        }

        if (infoText) {
            textArrayCorrected.push(infoText);
        }

        return textArrayCorrected;
    },

    /**
     * adds html breaks (<br>) between every element in given textArray
     * @param  {String[]} textArray an array with texts
     * @return {String[]}  an array with html breaks put on the array between all texts
     */
    addBreak: function (textArray) {
        const textArrayBroken = [];

        textArray.forEach(value => {
            if (textArrayBroken.length > 0) {
                textArrayBroken.push("<br>");
            }
            textArrayBroken.push(value);
        });

        return textArrayBroken;
    },

    /**
     * setter for pointerMoveListener
     * @param {object} value - event object
     * @returns {void}
     */
    setPoinertMoveListener: function (value) {
        this.set("pointerMoveListener", value);
    },

    /**
     * setter for minShift
     * @param  {Number} value minShift value
     * @return {void}
     */
    setMinShift: function (value) {
        this.set("minShift", value);
    },

    /**
     * setter for textPosition
     * @param  {String} value textPosition value
     * @return {void}
     */
    setTextPosition: function (value) {
        this.set("textPosition", value);
    },

    /**
     * setter for textArray
     * @param  {String} value textArray value
     * @return {void}
     */
    setTextArray: function (value) {
        this.set("textArray", value);
    },

    /**
     * setter for mouseHoverInfos
     * @param  {String | Array} value mouseHoverInfos value
     * @return {void}
     */
    setMouseHoverInfos: function (value) {
        this.set("mouseHoverInfos", value);
    }
});

export default MouseHoverPopupModel;
