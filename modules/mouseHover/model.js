define([
    "openlayers",
    "eventbus",
    "bootstrap/popover"
], function (ol, EventBus) {

    var MouseHoverPopup = Backbone.Model.extend({
        defaults: {
            // select interaction reagiert auf pointermove
            selectPointerMove: new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                multi: true,
                filter: function (feature) {
                    if (feature.get("name") === "DragMarkerPoint") {
                        return false;
                    }
                    return true;
                },
                style: this.hoverStyleFunction
            }),
            wfsList: [],
            mhpresult: "",
            mhpcoordinates: [],
            oldSelection: "",
            GFIPopupVisibility: false
        },
        initialize: function () {
            // select interaction Listener
            this.get("selectPointerMove").on("select", this.checkForEachFeatureAtPixel, this);

            Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
            Radio.trigger("Map", "registerListener", "click", this.clickOnMap, this);
            $("#lgv-container").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.set("mhpOverlay", new ol.Overlay({
                element: $("#mousehoverpopup")[0]
            }));

            this.filterWFSList();
            this.set("element", this.get("mhpOverlay").getElement());
            // EventBus.on("GFIPopupVisibility", this.GFIPopupVisibility, this); // GFIPopupStatus auslösen. Trigger in GFIPopoupView
            this.listenTo(Radio.channel("GFI"), {
                "isVisible": this.GFIPopupVisibility
            }, this);
        },

        filterWFSList: function () {
            var wfsList = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS"}),
                wfsListFiltered = [];

            _.each(wfsList, function (element) {
                if (_.has(element, "mouseHoverField")) {
                    wfsListFiltered.push({
                        layerId: element.id,
                        fieldname: element.mouseHoverField
                    });
                }
            });

            this.set("wfsList", wfsListFiltered);
        },

        GFIPopupVisibility: function (GFIPopupVisibility) {
            this.set("GFIPopupVisibility", GFIPopupVisibility);
        },

        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.set("oldSelection", "");
            this.unset("mhpresult", {silent: true});
            $(this.get("element")).tooltip("destroy");
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $(this.get("element")).tooltip("show");
        },
        /**
        * forEachFeatureAtPixel greift nur bei sichtbaren Features.
        * wenn 2. Parameter (layer) == null, dann kein Layer
        * Wertet an der aktuell getriggerten Position alle Features der
        * Map aus, die über subfunction function(layer) zurückgegeben werden.
        * pFeatureArray wird so mit allen darzustellenden Features gepusht.
        * Nachdem die Selektion erstellt wurde, wird diese für initiale
        * if-Bedingung gespeichert und abschließend wird das Aufbereiten dieser
        * Selektion angestpßen.
        */
        checkForEachFeatureAtPixel: function (evt) {
            if (evt.mapBrowserEvent.dragging) {
                return;
            }

            var selected = evt.selected,
                deselected = evt.deselected,
                eventPixel = evt.mapBrowserEvent.pixel,
                map = evt.mapBrowserEvent.map;

            if (selected.length) {
                selected.forEach(function (feature) {
                    var newStyle = feature.getStyle()[0].clone();

                    // bei ClusterFeatures
                    if (feature.get("features").length > 1) {
                        newStyle.getImage().setOpacity(0.5);
                        feature.setStyle([newStyle]);
                        this.hoverOnClusterFeature(feature, eventPixel, map);
                    }
                    else {
                        newStyle.getImage().setScale(1.2);
                        if (_.isNull(newStyle.getText()) === false) {
                            newStyle.getText().setOffsetY(1.2 * newStyle.getText().getOffsetY());
                        }
                        feature.setStyle([newStyle]);
                    }
                }, this);

            }
            else {
                deselected.forEach(function (feature) {
                    var newStyle = feature.getStyle()[0].clone();

                    // bei ClusterFeatures
                    if (feature.get("features").length > 1) {
                        newStyle.getImage().setOpacity(1);
                        feature.setStyle([newStyle]);
                        this.hoverOffClusterFeature(feature, eventPixel, map);
                    }
                    else {
                        newStyle.getImage().setScale(1);
                        if (_.isNull(newStyle.getText()) === false) {
                            newStyle.getText().setOffsetY(newStyle.getText().getOffsetY() / 1.2);
                        }
                        feature.setStyle([newStyle]);
                    }
                }, this);
            }

            var pFeatureArray = [],
                featuresAtPixel = map.forEachFeatureAtPixel(eventPixel, function (feature, layer) {
                    return {
                        feature: feature,
                        layer: layer
                    };
            });

            // featuresAtPixel.layer !== null --> kleiner schneller Hack da sonst beim zeichnen die ganze Zeit versucht wird ein Popup zu zeigen?? SD 01.09.2015
            if (featuresAtPixel !== undefined && featuresAtPixel.layer !== null) {
                var selFeature = featuresAtPixel.feature;

                map.getTargetElement().style.cursor = "pointer";
                // Cluster-Features
                if (selFeature.getProperties().features) {
                    var list = selFeature.getProperties().features;

                    _.each(list, function (element) {
                        pFeatureArray.push({
                            feature: element,
                            layerId: featuresAtPixel.layer.get("id")
                        });
                    });
                }
                else {
                    pFeatureArray.push({
                        feature: selFeature,
                        layerId: featuresAtPixel.layer.get("id")
                    });
                }
                if (pFeatureArray.length > 0) {
                    if (this.get("oldSelection") === "") {
                        this.set("oldSelection", pFeatureArray);
                        this.prepMouseHoverFeature(pFeatureArray);
                    }
                    else {
                        if (this.compareArrayOfObjects(pFeatureArray, this.get("oldSelection")) === false) {
                            this.destroyPopup(pFeatureArray);
                            this.set("oldSelection", pFeatureArray);
                                this.prepMouseHoverFeature(pFeatureArray);
                        }
                    }
                }
            }
            else {
                map.getTargetElement().style.cursor = "";
                this.removeMouseHoverFeatureIfSet();
            }
        },

        compareArrayOfObjects: function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (var i = 0; i < arr1.length; i++) {
                var obj1 = arr1[i],
                    obj2 = arr2[i];

                if (_.isEqual(obj1, obj2) === false) {
                    return false;
                }
            }
            return true;
        },

        /**
        * Diese Funktion prüft ob mhpresult = "" und falls nicht
        * wird MouseHover destroyt
        */
        removeMouseHoverFeatureIfSet: function () {
            if (this.get("mhpresult") && this.get("mhpresult") !== "") {
                this.destroyPopup();
            }
        },
        /**
        * Dies Funktion durchsucht das übergebene pFeatureArray und extrahiert den
        * anzuzeigenden Text sowie die Popup-Koordinate und setzt
        * mhpresult. Auf mhpresult lauscht die View, die daraufhin rendert
        */
        prepMouseHoverFeature: function (pFeatureArray) {
            var wfsList = this.get("wfsList"),
                value = "",
                coord;

            if (pFeatureArray.length > 0) {
                // für jedes gehoverte Feature...
                _.each(pFeatureArray, function (element) {
                    var featureProperties = element.feature.getProperties(),
                        featureGeometry = element.feature.getGeometry(),
                        listEintrag = _.find(wfsList, function (ele) {
                            return ele.layerId === element.layerId;
                    });

                    if (listEintrag) {
                        var mouseHoverField = listEintrag.fieldname;

                        if (mouseHoverField && _.isString(mouseHoverField)) {
                            if (_.has(featureProperties, mouseHoverField)) {
                                value = value + _.values(_.pick(featureProperties, mouseHoverField))[0];
                            }
                        }
                        else if (mouseHoverField && _.isArray(mouseHoverField)) {
                            _.each(mouseHoverField, function (element) {
                                value = value + "<span>" + _.values(_.pick(featureProperties, element)) + "</span></br>";
                            });
                        }
                        if (!coord) {
                            if (featureGeometry.getType() === "MultiPolygon" || featureGeometry.getType() === "Polygon") {
                                coord = _.flatten(featureGeometry.getInteriorPoints().getCoordinates());
                            }
                            else {
                                coord = featureGeometry.getCoordinates();
                            }
                        }
                    }
                }, this);

                if (value !== "") {
                    this.get("mhpOverlay").setPosition(coord);
                    this.get("mhpOverlay").setOffset([10, -15]);
                    this.set("mhpcoordinates", coord);
                    this.set("mhpresult", value);
                }
            }
        },
        hoverOnClusterFeature: function (clusterFeature, eventPixel, map) {
            var featureArray = clusterFeature.get("features"),
                source,
                stylelistmodel = Radio.request("StyleList", "returnModelByValue", "mml");

            featuresAtPixel = map.forEachFeatureAtPixel(eventPixel, function (feature, layer) {
                    source = layer.getSource();
            });
            _.each(featureArray, function (feature, index) {
                var newClusterFeature = clusterFeature.clone();

                newClusterFeature.set("features",[feature]);
                newClusterFeature.setGeometry(feature.getGeometry());
                newClusterFeature.setId(index);
                newClusterFeature.setStyle(stylelistmodel.getClusterStyle(newClusterFeature));
                source.addFeature(newClusterFeature);
            });
            this.setSource(source);
        },
        hoverOffClusterFeature: function (clusterFeature, eventPixel, map) {
            var featureArray = clusterFeature.get("features"),
                source = this.getSource(),
                feature;

            _.each(featureArray, function (feature, index) {
                feature = source.getFeatureById(index);
                source.removeFeature(feature);
            });
        },
        setSource: function (value) {
            this.set("source", value);
        },
        getSource: function () {
            return this.get("source");
        },
        clickOnMap: function (evt) {
            var eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);

            if (isFeatureAtPixel === true) {
                Radio.trigger("Map", "forEachFeatureAtPixel", eventPixel, this.featureClicked);
            }
        },
        featureClicked: function (feature, layer) {
            // [minX, minY, maxX, maxY]
            // [567652, 5935064, 567652, 5935064]
            var minX = [],
                minY = [],
                maxX = [],
                maxY = [],
                extent = [];

            if (feature.get("features")) {
                _.each(feature.get("features"), function (feature) {
                    minX.push(feature.getGeometry().getExtent()[0]);
                    minY.push(feature.getGeometry().getExtent()[1]);
                    maxX.push(feature.getGeometry().getExtent()[2]);
                    maxY.push(feature.getGeometry().getExtent()[3]);
                });
                minX.sort();
                minY.sort();
                maxX.sort();
                maxY.sort();
                console.log(minX);
                console.log(minY);
                console.log(maxX);
                console.log(maxY);
            }


            // console.log(extent);
        }
    });

    return new MouseHoverPopup();
});
