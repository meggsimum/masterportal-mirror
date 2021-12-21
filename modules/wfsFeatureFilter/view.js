import WfsFeatureFilterTemplate from "text-loader!./template.html";

const WfsFeatureFilterView = Backbone.View.extend({
    events: {
        "click #filterbutton": "getFilterInfos",
        "click .card-header": "toggleHeading"
    },
    initialize: function () {
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": this.updateFilterSelection
        });

        this.listenTo(this.model, {
            "change:isActive": this.render
        }, this);
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    id: "wfsFilterWin",
    template: _.template(WfsFeatureFilterTemplate),
    updateFilterSelection: function () {
        if (this.model.get("isActive") === false) {
            return;
        }
        this.$el.html(this.template(this.model.toJSON()));
        this.setMaxHeight();
        this.getFilterInfos();
    },
    toggleHeading: function (evt) {
        const id = this.$(evt.currentTarget)[0].id;

        this.$("." + id + "_wfs_panel").each(function (index, ele) {
            $(ele).toggle();
        });
        if (this.$("#wfsfeaturefilter_resizemarker").find("i").hasClass("bi-arrows-angle-contract")) {
            this.$("#wfsfeaturefilter_resizemarker").find("i").removeClass("bi-arrows-angle-contract");
            this.$("#wfsfeaturefilter_resizemarker").find("i").addClass("bi-arrows-angle-expand");
        }
        else {
            this.$("#wfsfeaturefilter_resizemarker").find("i").addClass("bi-arrows-angle-contract");
            this.$("#wfsfeaturefilter_resizemarker").find("i").removeClass("bi-arrows-angle-expand");
        }
    },
    getFilterInfos: function () {
        const wfsList = this.model.get("wfsList"),
            layerfilters = [],
            filters = [];

        let id,
            value;

        wfsList.forEach(layer => {
            layer.filterOptions.forEach(filter => {
                id = "#" + layer.id + "_" + filter.fieldName;
                value = $(id).val();
                filters.push({
                    id: id,
                    filtertype: filter.filterType,
                    fieldName: filter.fieldName,
                    fieldValue: value
                });
            });
            layerfilters.push({
                layerId: layer.id,
                filter: filters
            });
        });
        if (layerfilters.length > 0) {
            this.filterLayers(layerfilters);
        }
    },
    filterLayers: function (layerfilters) {
        layerfilters.forEach(layerfilter => {
            // Prüfe, ob alle Filter des Layers auf * stehen, damit evtl. der defaultStyle geladen werden kann
            let showall = true;

            const layers = this.model.get("wfsList"),
                wfslayer = layers.find(function (layer) {
                    return layer.id === layerfilter.layerId;
                }),
                layer = wfslayer.layer,
                features = layer.getSource().getFeatures();

            layerfilter.filter.forEach(filter => {
                if (filter.fieldValue !== "*") {
                    showall = false;
                }
            });

            if (showall === true) {
                if (layer.defaultStyle) {
                    layer.setStyle(layer.defaultStyle);
                    delete layer.defaultStyle;
                    layer.getSource().getFeatures().forEach(feature => {
                        if (feature.defaultStyle) {
                            feature.setStyle(feature.defaultStyle);
                            delete feature.defaultStyle;
                        }
                    });
                }
            }
            else { // Falls Layer gestyled wurde, speichere den Style und schalte unsichtbar
                if (layer.getStyle()) {
                    layer.defaultStyle = layer.getStyle();
                    layer.setStyle(null);
                }

                features.forEach(feature => {
                    let featuredarstellen = true,
                        featureattribute,
                        attributname, attributvalue, featurevalue0, featurevalue;

                    // Prüfung, ob Feature dargestellt werden soll
                    layerfilter.filter.forEach(elementfilter => {
                        attributname = elementfilter.fieldName;
                        attributvalue = elementfilter.fieldValue;
                        if (attributvalue !== "*") {
                            featureattribute = Radio.request("Util", "pick", feature.getProperties(), [attributname]);
                            if (featureattribute && featureattribute !== null) {
                                featurevalue0 = Object.values(featureattribute)[0];
                                if (featurevalue0) {
                                    featurevalue = featurevalue0.trim();
                                    if (featurevalue !== attributvalue) {
                                        featuredarstellen = false;
                                    }
                                }
                            }
                        }
                    });
                    if (featuredarstellen === true) {
                        if (feature.defaultStyle) {
                            feature.setStyle(feature.defaultStyle);
                            delete feature.defaultStyle;
                        }
                        else if (layers[0].styleField) {
                            feature.setStyle(layer.defaultStyle(feature));
                        }
                        else {
                            feature.setStyle(layer.defaultStyle(feature));
                        }
                    }
                    else if (featuredarstellen === false) {
                        feature.setStyle(null);
                    }
                });
            }
        }, this);
        this.model.set("layerfilters", layerfilters);
    },
    render: function (model, value) {
        const layerfilters = this.model.get("layerfilters");

        this.model.getLayers();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.setMaxHeight();
            this.delegateEvents();
            if (layerfilters) {
                layerfilters.forEach(layerfilter => {
                    layerfilter.filter.forEach(filter => {
                        $(filter.id).val(filter.fieldValue);
                    });
                });
            }
        }
        else if (layerfilters) {
            layerfilters.forEach(layerfilter => {
                layerfilter.filter.forEach(filter => {
                    filter.fieldValue = "*";
                });
            });
            this.filterLayers(layerfilters);
        }
        return this;
    },
    setMaxHeight: function () {
        const maxHeight = $(window).height() - 160;

        this.$el.css("max-height", maxHeight);
    }
});

export default WfsFeatureFilterView;
