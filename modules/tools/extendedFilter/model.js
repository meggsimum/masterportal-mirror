import Tool from "../../core/modelList/tool/model";

const ExtendedFilter = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        currentContent: {
            step: 1,
            name: "Bitte wählen Sie die Filteroption",
            layername: undefined,
            filtername: undefined,
            attribute: undefined,
            options: ["Neuen Filter erstellen"]
        },
        wfsList: [],
        currentFilterType: "Neuen Filter erstellen",
        currentFilters: [],
        ignoredKeys: [],
        filterCounter: 1,
        renderToWindow: true,
        icon: "bi-funnel-fill"
    }),
    initialize: function () {
        this.superInitialize();

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
            "currentLng": lng
        });
    },
    // getDefaultContent: function () {
    //     return this.get("defaultContent");
    // },
    setCurrentContent: function (val) {
        this.set("currentContent", val);
    },
    setCurrentFilterType: function (val) {
        this.set("currentFilterType", val);
    },
    setCurrentFilters: function (val) {
        this.set("currentFilters", val);
    },
    setFilterCounter: function (val) {
        this.set("filterCounter", val);
    },
    setWfsList: function (val) {
        return this.set("wfsList", val);
    },
    getLayers: function () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            featureLayers = layers.filter(function (layer) {
                return layer.get("layer").getSource().getFeatures().length > 0;
            }),
            filterLayers = featureLayers.filter(function (layer) {
                return layer.get("extendedFilter");
            }),
            wfsList = [];
        let values = [],
            attributes = [],
            attributes_with_values = [];

        filterLayers.forEach(layer => {
            layer.get("layer").getSource().getFeatures()[0].getKeys().forEach(key => {
                if (!this.get("ignoredKeys").includes(key.toUpperCase())) {
                    attributes.push(key);
                }
            });
            attributes.forEach(attr => {
                layer.get("layer").getSource().getFeatures().forEach(feature => {
                    values.push(feature.get(attr));
                });
                attributes_with_values.push({
                    attr: attr,
                    values: [...new Set(values)]
                });
                values = [];
            });
            wfsList.push({
                id: layer.id,
                name: layer.get("name"),
                layer: layer.get("layer"),
                attributes: attributes_with_values
            });
            attributes = [];
            attributes_with_values = [];

        }, this);
        this.set("wfsList", wfsList);
    },

    previousStep: function () {
        const currentContent = this.get("currentContent"),
            layername = currentContent.layername,
            currentFilterType = this.get("currentFilterType");

        let content,
            step = currentContent.step;

        if (step === 2) {
            content = this.getDefaultContent();

        }
        else if (step === 3) {
            step = step - 2;
            content = this.step2(currentFilterType, step);
        }
        else if (step === 4) {
            step = step - 2;

            content = this.step3(layername, step);
        }
        this.setCurrentContent(content);
    },
    removeAttrFromFilter: function (evt) {
        const id = evt.currentTarget.id,
            filtername = id.split("__")[0],
            attr = id.split("__")[1],
            val = id.split("__")[2],
            currentFilters = this.get("currentFilters");
        let filterToUpdate,
            counter,
            content,
            attributesArray = [];

        for (let i = currentFilters.length - 1; i >= 0; i--) {
            if (currentFilters[i].layername === filtername) {
                filterToUpdate = currentFilters.splice(i, 1)[0];
                break;
            }
        }

        attributesArray = filterToUpdate.attributes;

        for (let i = attributesArray.length - 1; i >= 0; i--) {
            if (attributesArray[i].attribute === attr && attributesArray[i].value === val) {
                attributesArray.splice(i, 1);
                break;
            }
        }

        if (attributesArray.length === 0) {
            counter = this.get("filterCounter");

            counter--;
            this.setFilterCounter(counter);
        }
        else {
            currentFilters.push({
                layername: filtername,
                attributes: attributesArray
            });
        }
        this.setCurrentFilters(currentFilters);

        if (currentFilters.length === 0) {
            content = this.getDefaultContent();

            content.options = ["Neuen Filter erstellen"];
            this.setCurrentContent(content);
        }

        this.filterLayers();
    },

    nextStep: function (evt) {
        const id = evt.currentTarget.id,
            val = $("#" + id).val(),
            currentContent = this.get("currentContent"),
            step = currentContent.step;
        let newContent;

        if (step === 1) { // Layer wählen oder Filter wählen
            newContent = this.step2(val, step);
        }
        else if (step === 2) { // Attribut wählen
            newContent = this.step3(val, step);
        }
        else if (step === 3) { // Wert wählen
            newContent = this.step4(val, step, currentContent.layername, currentContent.filtername);
        }
        else if (step === 4) { // auf default zurücksetzen
            newContent = this.getDefaultContent();
            this.setFilter(val, currentContent.layername, currentContent.attribute, currentContent.filtername);
            this.filterLayers();
        }

        this.setCurrentContent(newContent);
    },

    getDefaultContent: function () {
        const content = {
            step: 1,
            name: "Bitte wählen Sie die Filteroption",
            layername: undefined,
            filtername: undefined,
            attribute: undefined,
            options: ["Neuen Filter erstellen", "Bestehenden Filter verfeinern"]
        };

        return content;
    },

    step2: function (val, step) {
        const options = [];
        let content,
            newStep = step,
            wfsList,
            currentFilters = [];

        newStep++;
        if (val === "Neuen Filter erstellen") {
            this.setCurrentFilterType("Neuen Filter erstellen");
            this.getLayers();
            wfsList = this.get("wfsList");
            wfsList.forEach(layer => {
                options.push(layer.name);
            });
            content = {step: newStep,
                name: "Bitte wählen Sie einen Layer",
                layername: undefined,
                attribute: undefined,
                options: options};
        }
        else { // Filter erweitern
            this.setCurrentFilterType("Bestehenden Filter verfeinern");
            currentFilters = this.get("currentFilters");
            currentFilters.forEach(filter => {
                options.push(filter.layername);
            });
            content = {step: newStep,
                name: "Bitte wählen Sie einen Filter zum Verfeinern",
                layername: undefined,
                attribute: undefined,
                options: options};

        }
        return content;
    },

    step3: function (val, step) {
        const wfsList = this.get("wfsList"),
            options = [];

        let content = {},
            newStep = step,
            layer;

        newStep++;
        this.getLayers();

        if (val.split(" ")[0] !== "Filter") {
            this.setCurrentFilterType("Neuen Filter erstellen");
            layer = Radio.request("Util", "findWhereJs", wfsList, {name: val});
        }
        else {
            this.setCurrentFilterType("Bestehenden Filter verfeinern");
            layer = Radio.request("Util", "findWhereJs", wfsList, {name: val.split(" ")[2]});
        }

        layer.attributes.forEach(attribute => {
            options.push(attribute.attr);
        });

        content = {
            step: newStep,
            name: "Bitte wählen Sie ein Attribut",
            layername: layer.name,
            filtername: val,
            attribute: undefined,
            options: options
        };

        return content;
    },

    step4: function (val, step, layername, filtername) {
        const wfsList = this.get("wfsList"),
            options = [];

        let newStep = step,
            layer = {},
            content = {},
            attribute = {};

        newStep++;
        this.getLayers();
        layer = Radio.request("Util", "findWhereJs", wfsList, {name: layername});
        attribute = Radio.request("Util", "findWhereJs", layer.attributes, {attr: val});

        attribute.values.forEach(value => {
            options.push(value);
        });
        content = {
            step: newStep,
            name: "Bitte wählen Sie einen Wert",
            layername: layer.name,
            filtername: filtername,
            attribute: val,
            options: options
        };

        return content;
    },

    setFilter: function (val, layername, attribute, filtername) {
        const currentFilters = this.get("currentFilters"),
            currentFilterType = this.get("currentFilterType");

        let filterToUpdate,
            attributesArray = [],
            filtercounter = this.get("filterCounter");

        if (currentFilterType === "Neuen Filter erstellen") {
            attributesArray = [];
            attributesArray.push({attribute: attribute,
                value: val});

            currentFilters.push({
                layername: "Filter " + filtercounter + " " + layername,
                attributes: attributesArray
            });

            filtercounter++;
        }
        else {
            for (let i = currentFilters.length - 1; i >= 0; i--) {
                if (currentFilters[i].layername === filtername) {
                    filterToUpdate = currentFilters.splice(i, 1)[0];
                    break;
                }
            }

            attributesArray = filterToUpdate.attributes;
            attributesArray.push({attribute: attribute,
                value: val});

            currentFilters.push({
                layername: filtername,
                attributes: attributesArray
            });
        }
        this.setFilterCounter(filtercounter);
        this.setCurrentFilters(currentFilters);
    },

    filterLayers: function () {
        const currentFilters = this.get("currentFilters"),
            layers = this.get("wfsList");

        let layer,
            features;

        layers.forEach(wfslayer => {
            layer = wfslayer.layer;
            features = layer.getSource().getFeatures();

            if (layer.getStyle()) {
                layer.defaultStyle = layer.getStyle();
                layer.setStyle(null);
            }

            features.forEach(feature => {
                let featuredarstellen2 = true,
                    preVal2 = false;

                currentFilters.forEach(filter => {
                    let featuredarstellen = true,
                        preVal = true;

                    if (filter.layername.split(" ")[2] === wfslayer.name) {
                        filter.attributes.forEach(attribute => {
                            featuredarstellen = this.checkFeatureForFilter(feature, attribute);
                            if (preVal === true && featuredarstellen === true) {
                                featuredarstellen = true;
                                preVal = true;
                            }
                            else {
                                featuredarstellen = false;
                                preVal = false;
                            }
                        });

                        if (preVal2 === true || featuredarstellen === true) {
                            featuredarstellen2 = true;
                            preVal2 = true;
                        }
                        else {
                            featuredarstellen2 = false;
                            preVal2 = false;
                        }
                    }
                }, this);

                if (featuredarstellen2 === true) {
                    if (feature.defaultStyle) {
                        feature.setStyle(feature.defaultStyle);
                        delete feature.defaultStyle;
                    }
                    else {
                        feature.setStyle(layer.defaultStyle(feature));
                    }
                }
                else if (featuredarstellen2 === false) {
                    feature.setStyle(null);
                }
            }, this);

        }, this);

    },

    checkFeatureForFilter: function (feature, attr) {
        const attributname = attr.attribute,
            attributvalue = attr.value,
            featureattribute = Radio.request("Util", "pick", feature.getProperties(), [attributname]);

        let featuredarstellen = true,
            featurevalue0,
            featurevalue;

        if (featureattribute && featureattribute !== null) {
            featurevalue0 = Object.values(featureattribute)[0];
            if (featurevalue0) {
                featurevalue = featurevalue0.trim();
                if (featurevalue !== attributvalue) {
                    featuredarstellen = false;
                }
            }
        }

        return featuredarstellen;
    }
});

export default ExtendedFilter;
