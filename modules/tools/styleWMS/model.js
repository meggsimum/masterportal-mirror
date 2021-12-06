import Tool from "../../core/modelList/tool/model";
import getProxyUrl from "../../../src/utils/getProxyUrl";

const StyleWmsModel = Tool.extend(/** @lends StyleWmsModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        isCurrentWin: false,
        isCollapsed: false,
        icon: "bi-droplet-fill",
        name: "Style WMS",
        id: "styleWMS",
        modelId: "",
        model: null,
        geomType: "",
        attributeName: "default",
        numberOfClassesList: ["1", "2", "3", "4", "5"],
        numberOfClasses: "default",
        styleClassAttributes: [],
        styleWMSName: "",
        styleableLayerList: [],
        wmsSoftware: "OGC",
        // translations
        currentLng: "",
        noStyleableLayers: "",
        theme: "",
        chooseTheme: "",
        attribute: "",
        chooseAttribute: "",
        countOfClasses: "",
        chooseNumberOfClasses: "",
        rangeOfValues: "",
        reset: "",
        apply: "",
        from: "",
        to: "",
        pleaseEnterInteger: "",
        pleaseChooseColor: "",
        checkTheValues: "",
        overlappingValueRanges: "",
        useProxy: false
    }),

    /**
     * @class StyleWmsModel
     * @description Tool that can modify the style of a WMS.
     * Therefore a sld-body is created and sent via the get-map-request.
     * Caution: Only works for numerical values
     * @extends Tool
     * @memberof Tools.StyleWMS
     * @constructs
     * @property {Boolean} isCurrentWin=false Flag if this tool is shown in the toolwindow and thus is active
     * @property {Boolean} isCollapsed=false Flag if this tool window is collapsed
     * @property {String} icon="bi-droplet-fill" Icon that is shown before the tool name
     * @property {String} name="Style WMS" Name of the Tool
     * @property {String} id="StyleWMS" id of Tool
     * @property {String} modelId="" Id of layer model to be styled
     * @property {WmsLayer} model=null Layer model to be styled
     * @property {String} geomType="" Geometry type of data shown in wms layer. important for creating the correct sld
     * @property {String} attributeName="default" Name of attribute to be styled
     * @property {String[]} numberOfClassesList=["1", "2", "3", "4", "5"] Array that defines the maximum amount of styling classes
     * @property {String} numberOfClasses="default" Flag that shows how many styling classes are used
     * @property {styleClassAttribute[]} styleClassAttributes=[] Array of defined styleclassattributes
     * @property {Object} styleClassAttribute One user defined style class
     * @property {Integer} styleClassAttribute.startRange Start of value range to style
     * @property {Integer} styleClassAttribute.stopRange Stop of value range to style
     * @property {String} styleClassAttribute.color Color as hex code
     * @property {String} styleWMSName="" Name of Layer to be styled
     * @property {styleableLayer[]} styleableLayerList=[] List of Layers that can be used for restyling
     * @property {Object} styleableLayer Object containing the name and the id of the styleable layer
     * @property {String} styleableLayer.name Name of styleable Layer
     * @property {String} styleableLayer.id Id of styleable Layer
     * @property {String} wmsSoftware="OGC" Flag of sld has to be created according to ogc standards or in esri style
     * @property {String} currentLng: "" contains the translated text
     * @property {String} noStyleableLayers: "" contains the translated text
     * @property {String} theme: "" contains the translated text
     * @property {String} chooseTheme: "" contains the translated text
     * @property {String} attribute: "" contains the translated text
     * @property {String} chooseAttribute: "" contains the translated text
     * @property {String} countOfClasses: "" contains the translated text
     * @property {String} chooseNumberOfClasses: "" contains the translated text
     * @property {String} rangeOfValues: "" contains the translated text
     * @property {String} reset: "" contains the translated text
     * @property {String} apply: "" contains the translated text
     * @property {String} from: "" contains the translated text
     * @property {String} to: "" contains the translated text
     * @property {String} pleaseEnterInteger: "" contains the translated text
     * @property {String} pleaseChooseColor: "" contains the translated text
     * @property {String} checkTheValues: "" contains the translated text
     * @property {String} overlappingValueRanges: "" contains the translated text
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @listens StyleWMS#RadioTriggerStyleWMSopenStyleWMS
     * @listens StyleWMS#changeModel
     * @listens StyleWMS#changeAttributeName
     * @listens StyleWMS#changeNumberOfClasses
     * @listens StyleWMS#changeSetSld
     * @listens List#RadioTriggerModelListUpdatedSelectedLayerList
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @fires List#RadioTriggerModelListSetModelAttributesById
     * @fires List#RadioRequestModelListGetModelByAttributes
     * @fires StyleWMSModel#sync
     * @fires StyleWMSModel#changeIsactive
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        const channel = Radio.channel("StyleWMS");

        this.superInitialize();
        channel.on({
            "openStyleWMS": function (model) {

                // Check if tool window is already open,if not, open it
                if (this.get("isActive") !== true) {
                    this.setIsActive(true);
                    Radio.trigger("Window", "toggleWin", this);
                }

                // Take layer that is selected in Layer tree
                this.setModel(model);
                this.trigger("sync");
            }
        }, this);

        // Own Listeners
        this.listenTo(this, {
            // If model changes, set the geometry type and reset attribute name
            "change:model": function (model, value) {
                if (value !== null && value !== undefined) {
                    this.setAttributeName(this.defaults.attributeName);
                    this.setGeomType(value.get("geomType"));
                    this.requestWmsSoftware(value);
                }
            },
            // If attributeName changes, reset numberOfClasses and styleClassAttributes
            "change:attributeName": function () {
                this.setNumberOfClasses(this.defaults.numberOfClasses);
                this.resetStyleClassAttributes();
            },
            "change:numberOfClasses": function () {
                this.resetStyleClassAttributes();
            },
            // Send sld to modellist as soon as it is generated
            "change:setSLD": function () {
                Radio.trigger("ModelList", "setModelAttributesById", this.get("model").get("id"), {"SLDBody": this.get("setSLD"), paramStyle: "style"});
                Radio.trigger("Layer", "change:SLDBody", this.get("model"));
            }
        });
        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function () {
                this.refreshStyleableLayerList();
                if (this.get("isActive") === true) {
                    // if tool is active , refresh the content
                    this.trigger("sync");
                }
            }
        });
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
            "noStyleableLayers": i18next.t("common:modules.tools.styleWMS.noStyleableLayers"),
            "theme": i18next.t("common:modules.tools.styleWMS.theme"),
            "chooseTheme": i18next.t("common:modules.tools.styleWMS.chooseTheme"),
            "attribute": i18next.t("common:modules.tools.styleWMS.attribute"),
            "chooseAttribute": i18next.t("common:modules.tools.styleWMS.chooseAttribute"),
            "countOfClasses": i18next.t("common:modules.tools.styleWMS.countOfClasses"),
            "chooseNumberOfClasses": i18next.t("common:modules.tools.styleWMS.chooseNumberOfClasses"),
            "rangeOfValues": i18next.t("common:modules.tools.styleWMS.rangeOfValues"),
            "reset": i18next.t("common:modules.tools.styleWMS.reset"),
            "apply": i18next.t("common:modules.tools.styleWMS.apply"),
            "from": i18next.t("common:modules.tools.styleWMS.from"),
            "to": i18next.t("common:modules.tools.styleWMS.to"),
            "pleaseEnterInteger": i18next.t("common:modules.tools.styleWMS.pleaseEnterInteger"),
            "pleaseChooseColor": i18next.t("common:modules.tools.styleWMS.pleaseChooseColor"),
            "checkTheValues": i18next.t("common:modules.tools.styleWMS.checkTheValues"),
            "overlappingValueRanges": i18next.t("common:modules.tools.styleWMS.overlappingValueRanges"),
            "currentLng": lng
        });
    },

    /**
     * Refreshes the styleableLayerList
     * Takes the layermodels that are selected in the layer tree. Takes the layer name and the layer id
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    refreshStyleableLayerList: function () {
        const styleableLayerList = [],
            layerModelList = Radio.request("ModelList", "getModelsByAttributes", {styleable: true, isSelected: true});

        let result;

        layerModelList.forEach(layerModel => {
            styleableLayerList.push({name: layerModel.get("name"), id: layerModel.get("id")});
        });

        this.set("styleableLayerList", styleableLayerList);

        // If current layer model is not selected any more, remove it
        if (this.get("model") !== null && this.get("model") !== undefined) {
            result = styleableLayerList.find(styleableLayer => {
                return styleableLayer.id === this.get("model").get("id");
            });

            if (result === undefined) {
                this.setModel(null);
            }
        }
    },

    /**
     * If validated attributes are valid, then nothing is returned.
     * Otherwise Error message are created
     * Triggers "invalid" to itself if validation fails
     * @param  {Object} attributes - Backbone.Model.attributes
     * @return {Object[]} errors - Die Fehlermeldungen
     * @see {@link http://backbonejs.org/#Model-validate|Backbone}
     */
    validate: function (attributes) {

        const errors = [],
            regExp = new RegExp("^[0-9]+$"),
            pleaseEnterInteger = this.get("pleaseEnterInteger"),
            pleaseChooseColor = this.get("pleaseChooseColor"),
            checkTheValues = this.get("checkTheValues"),
            overlappingValueRanges = this.get("overlappingValueRanges");

        let prevMax = -1;

        attributes.styleClassAttributes.forEach(function (element, index) {
            const min = parseInt(element.startRange, 10),
                max = parseInt(element.stopRange, 10);

            if (regExp.test(element.startRange) === false) {
                errors.push({
                    minText: pleaseEnterInteger,
                    minIndex: index
                });
            }
            if (regExp.test(element.stopRange) === false) {
                errors.push({
                    maxText: pleaseEnterInteger,
                    maxIndex: index
                });
            }
            if (element.color === "") {
                errors.push({
                    colorText: pleaseChooseColor,
                    colorIndex: index
                });
            }
            if (min >= max) {
                errors.push({
                    rangeText: checkTheValues,
                    rangeIndex: index
                });
            }
            if (prevMax >= min) {
                errors.push({
                    intersectText: overlappingValueRanges,
                    intersectIndex: index,
                    prevIndex: index - 1
                });
            }
            prevMax = max;
        });

        this.setErrors(errors);
        if (errors.length !== 0) {
            return errors;
        }

        return null;
    },

    /**
     * Creates sld body after attributes have been validated. Distinguished between esri and ogc
     * @returns {void}
     */
    createSLD: function () {
        let sld = "";

        if (this.isValid() === true) {
            if (this.get("wmsSoftware") === "ESRI") {
                sld = this.createEsriRootElement();
            }
            else {
                sld = this.createOgcRootElement();
            }
            this.updateLegend(this.get("styleClassAttributes"));
            this.get("model").get("layer").getSource().updateParams({SLD_BODY: sld, STYLES: "style"});
        }
    },

    /**
     * Removes sld body of getMapRequest
     * @returns {void}
     */
    removeSLDBody: function () {
        const source = this.get("model").get("layer").getSource(),
            params = source.getParams();

        /* eslint-disable-next-line no-undefined */
        params.SLD_BODY = undefined;
        params.STYLES = "";

        source.updateParams(params);
    },

    /**
     * Resets the Tool
     * @returns {void}
     */
    resetModel: function () {
        this.removeSLDBody();
        this.setNumberOfClasses(this.defaults.numberOfClasses);
        this.resetStyleClassAttributes();
        this.resetLegend();
    },

    /**
     * Resets styleClassAttributes to default values
     * @returns {void}
     */
    resetStyleClassAttributes: function () {
        this.setStyleClassAttributes(this.defaults.styleClassAttributes);
    },

    /**
     * Set the selected layer model by its id
     * @param {String} id Id of layer
     * @fires List#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    setModelById: function (id) {
        let model = null;

        if (id !== "") {
            model = Radio.request("ModelList", "getModelByAttributes", {id: id});
        }
        this.setModel(model);
        this.trigger("sync");
    },

    /**
     * Checks the current service if it is made from esri software or not.
     * @param {Layer} model WmsLayerModel The model of the layer to be checked
     * @returns {void}
     */
    requestWmsSoftware: function (model) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(model.get("url")) : model.get("url");

        if (model) {
            $.ajax({
                url: url + "?SERVICE=" + model.get("typ") + "&VERSION=" + model.get("version") + "&REQUEST=GetCapabilities",
                context: this,
                success: this.checkWmsSoftwareResponse,
                async: false
            });
        }
    },

    /**
     * Parses the Capabilities and looks for namespace "xmlns:esri_wms". If so the software is "ESRI", otherwise "OGC"
     * @param {XMLDocument} data Response from getCapabilities request
     * @returns {void}
     */
    checkWmsSoftwareResponse: function (data) {
        const capabilities = data.getElementsByTagName("WMS_Capabilities")[0],
            isEsri = capabilities.getAttribute("xmlns:esri_wms") !== null;

        if (isEsri) {
            this.setWmsSoftware("ESRI");
        }
        else {
            this.setWmsSoftware("OGC");
        }
    },

    /**
     * Updates the legend of the layer
     * @param {Object[]} attributes Attributes for creating the legend from StyleWMS
     * @returns {void}
     */
    updateLegend: function (attributes) {
        const layer = this.get("model"),
            legend = [];

        attributes.forEach(attribute => {
            const graphic = this.createSvgGraphic(attribute.color);

            legend.push({
                name: attribute.startRange + " - " + attribute.stopRange,
                graphic: graphic
            });
        });
        layer.setLegend(legend);
    },

    createSvgGraphic: function (color) {
        let svg = "data:image/svg+xml;charset=utf-8,";

        svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += this.hexToRgbString(color);
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Converts hex value to rgbarray.
     * @param {String} hex Color as hex string.
     * @returns {String} - Color als rgb string.
     */
    hexToRgbString: function (hex) {
        const rgbArray = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "#" + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16));
        let rgbString = rgbArray.toString(", ");

        rgbString = "rgb(" + rgbString + ")";

        return rgbString;
    },

    /**
     * Triggers the legend to reset the stylewms params
     * @returns {void}
     */
    resetLegend: function () {
        const layer = this.get("model");

        layer.createLegend();
    },

    /**
     * Triggers the layerinfo to update
     * @param {String} layerName Name of Layer
     * @returns {void}
     */
    updateLayerInfo: function (layerName) {
        Radio.trigger("Layer", "updateLayerInfo", layerName);
    },

    /**
     * ESRI: Creates sld for version 1.0.0
     * @return {String} complete sld
     */
    createEsriRootElement: function () {
        return "<sld:StyledLayerDescriptor version='1.0.0' xmlns:sld='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>" +
                    this.createEsriNamedLayer() +
            "</sld:StyledLayerDescriptor>";
    },

    /**
     * OGC: Creates sld for version 1.0.0
     * @return {String} complete sld
     */
    createOgcRootElement: function () {
        return "<StyledLayerDescriptor xmlns='http://www.opengis.net/se' xmlns:app='http://www.deegree.org/app' xmlns:deegreeogc='http://www.deegree.org/ogc' xmlns:ogc='http://www.opengis.net/ogc' xmlns:sed='http://www.deegree.org/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/se http://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd http://www.deegree.org/se http://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>" +
                    this.createOgcNamedLayer() +
            "</StyledLayerDescriptor>";
    },

    /**
     * ESRI: Create namedLayer
     * @return {string} namedLayer-tag
     */
    createEsriNamedLayer: function () {
        return "<sld:NamedLayer>" +
                "<sld:Name>" + this.get("model").get("layers") + "</sld:Name>" +
                this.createEsriUserStyle() +
            "</sld:NamedLayer>";
    },

    /**
     * OGC: Create namedLayer
     * @return {string} namedLayer-tag
     */
    createOgcNamedLayer: function () {
        return "<NamedLayer>" +
                "<Name>" + this.get("model").get("layers") + "</Name>" +
                this.createOgcUserStyle() +
            "</NamedLayer>";
    },

    /**
     * ESRI: Create userStyle
     * @return {string} userStyle-tag
     */
    createEsriUserStyle: function () {
        return "<sld:UserStyle>" +
                "<sld:Name>style</sld:Name>" +
                "<sld:FeatureTypeStyle>" +
                    this.createEsriRules() +
                "</sld:FeatureTypeStyle>" +
            "</sld:UserStyle>";
    },

    /**
     * OGC: Create userStyle
     * @return {string} userStyle-tag
     */
    createOgcUserStyle: function () {
        return "<UserStyle>" +
                "<FeatureTypeStyle>" +
                "<Name>style</Name>" +
                    this.createOgcRules() +
                "</FeatureTypeStyle>" +
            "</UserStyle>";
    },

    /**
     * ESRI: Create rules
     * @return {string} rules-tags
     */
    createEsriRules: function () {
        let rule = "";

        if (this.get("geomType") === "Polygon") {
            this.get("styleClassAttributes").forEach(obj => {
                rule += "<sld:Rule>" +
                            this.createFilter(obj.startRange, obj.stopRange) +
                            this.createEsriPolygonSymbolizer(obj.color) +
                        "</sld:Rule>";
            });
        }
        else {
            console.error("Type of geometry is not supported, abort styling.");
        }
        return rule;
    },

    /**
     * OGC: Create rules
     * @return {string} rules-tags
     */
    createOgcRules: function () {
        let rule = "";

        if (this.get("geomType") === "Polygon") {
            this.get("styleClassAttributes").forEach(obj => {
                rule += "<Rule>" +
                            this.createFilter(obj.startRange, obj.stopRange) +
                            this.createOgcPolygonSymbolizer(obj.color) +
                        "</Rule>";
            });
        }
        else {
            console.error("Type of geometry is not supported, abort styling.");
        }
        return rule;
    },

    /**
     * Creates Filter
     * @param  {string} startRange Start of value range
     * @param  {string} stopRange End of value range
     * @returns {String} filter -tag
     */
    createFilter: function (startRange, stopRange) {
        return "<ogc:Filter>" +
                "<ogc:And>" +
                    this.createIsGreaterThanOrEqualTo(startRange) +
                    this.createIsLessThanOrEqualTo(stopRange) +
                "</ogc:And>" +
            "</ogc:Filter>";
    },

    /**
     * Creates propertyIsGreaterThanOrEqualTo element
     * @param  {string} value Start of value range
     * @return {string} propertyIsGreaterThanOrEqualTo-tag
     */
    createIsGreaterThanOrEqualTo: function (value) {
        return "<ogc:PropertyIsGreaterThanOrEqualTo>" +
                "<ogc:PropertyName>" +
                this.get("attributeName") +
                "</ogc:PropertyName>" +
                "<ogc:Literal>" +
                    value +
                "</ogc:Literal>" +
            "</ogc:PropertyIsGreaterThanOrEqualTo>";
    },

    /**
     * Creates propertyIsLessThanOrEqualTo element
     * @param  {string} value End of value range
     * @return {string} propertyIsLessThanOrEqualTo-tag
     */
    createIsLessThanOrEqualTo: function (value) {
        return "<ogc:PropertyIsLessThanOrEqualTo>" +
                "<ogc:PropertyName>" +
                this.get("attributeName") +
                "</ogc:PropertyName>" +
                "<ogc:Literal>" +
                    value +
                "</ogc:Literal>" +
            "</ogc:PropertyIsLessThanOrEqualTo>";
    },

    /**
     * ESRI: Create polygonSymbolizer
     * @param  {string} value Color as hex
     * @return {string} polygonSymbolizer-tag
     */
    createEsriPolygonSymbolizer: function (value) {
        return "<sld:PolygonSymbolizer>" +
                    "<sld:Fill>" +
                        "<sld:CssParameter name='fill'>" + value + "</sld:CssParameter>" +
                    "</sld:Fill>" +
            "</sld:PolygonSymbolizer>";
    },

    /**
     * OGC: Create polygonSymbolizer
     * @param  {string} value Color as hex
     * @return {string} polygonSymbolizer-tag
     */
    createOgcPolygonSymbolizer: function (value) {
        return "<PolygonSymbolizer>" +
                    "<Fill>" +
                        "<CssParameter name='fill'>" + value + "</CssParameter>" +
                    "</Fill>" +
            "</PolygonSymbolizer>";
    },

    /**
     * Setter of model
     * @param {Layer} value layer model
     * @returns {void}
     */
    setModel: function (value) {
        this.set("model", value);
    },

    /**
     * Setter of geomType
     * @param {String} value geomType
     * @returns {void}
     */
    setGeomType: function (value) {
        this.set("geomType", value);
    },

    /**
     * Setter of attributeName
     * @param {String} value attributeName
     * @returns {void}
     */
    setAttributeName: function (value) {
        this.set("attributeName", value);
    },

    /**
     * Setter of numberOfClasses
     * @param {String} value numberOfClasses
     * @returns {void}
     */
    setNumberOfClasses: function (value) {
        this.set("numberOfClasses", value);
    },

    /**
     * Setter of styleClassAttributes
     * @param {Object[]} value styleClassAttributes
     * @returns {void}
     */
    setStyleClassAttributes: function (value) {
        this.set("styleClassAttributes", value);
    },

    /**
     * Setter of errors
     * @param {Object[]} value errors
     * @returns {void}
     */
    setErrors: function (value) {
        this.set("errors", value);
    },

    /**
     * Setter of wmsSoftware
     * @param {String} value wmsSoftware
     * @returns {void}
     */
    setWmsSoftware: function (value) {
        this.set("wmsSoftware", value);
    }
});

export default StyleWmsModel;
