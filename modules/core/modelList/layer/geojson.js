define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        GeoJSONLayer;

    GeoJSONLayer = Layer.extend({
        defaults: {
            featuresToHide: []
        },
        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector({
                format: new ol.format.GeoJSON()
            }, this));

        },
        /**
         * Lädt die JSON-Datei und startet parse
         */
        updateData: function () {
            this.fetch({
                url: this.get("url"),
                cache: false,
                error: function () {
                    Radio.trigger("Alert", "alert", {text: "<strong>Layerdaten (JSON) konnten nicht geladen werden!</strong>", kategorie: "alert-danger"});
                }
            });
        },
        /**
         * konvertiert die Daten in ol.features
         */
        parse: function (data) {
            var vectorSource = this.getLayerSource();

            this.updateLayerSourceData(vectorSource.getFormat().readFeatures(data));
        },

        updateLayerSourceData: function (features) {
            var count = 0;

            features.forEach(function (feature) {
                if (!feature.getId()) {
                    feature.setId(count);
                    count++;
                }
            });
            this.getLayerSource().clear();
            features = this.sortFeaturesByAttr(features, "mmlid");
            this.getLayerSource().addFeatures(features);
            Radio.trigger("MMLFilter", "featuresLoaded");
        },
        checkIfFeaturesLoaded: function () {
            var source = this.getLayerSource(),
                features = source.getFeatures();

            if (features.length > 1) {
                Radio.trigger("MMLFilter", "featuresLoaded");
            }
        },
        /**
         * [createClusterLayerSource description]
         * @return {[type]} [description]
         */
        createClusterLayerSource: function () {
            this.setClusterLayerSource(new ol.source.Cluster({
                source: this.getLayerSource(),
                format: new ol.format.GeoJSON(),
                distance: this.getClusterDistance()
            }));
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: (this.has("clusterLayerSource") === true) ? this.getClusterLayerSource() : this.getLayerSource(),
                style: this.getStyle(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId(),
                mouseHoverField: this.get("mouseHoverField")
            }));

            if (_.isUndefined(this.get("url")) === false) {
                this.updateData();
            }
            // Wenn Features übers RemoteInterface hinzugefügt werden
            else {
                this.getLayerSource().addFeatures(this.getFeatures());
            }
        },

        /**
         * [createLayerStyle description]
         * @return {[type]} [description]
         */
        createStyle: function () {
            var styleId = this.getStyleId();

            if (this.has("clusterLayerSource")) {
                this.set("style", function (feature) {
                    // Anzahl der Features
                    var size = feature.get("features").length,
                        stylelistmodel;

                    // Wenn mehrere Features vorhanden sind, wird geprüft, ob dafür ein extra Style vorhanden ist
                    if (size > 1) {
                        stylelistmodel = Radio.request("StyleList", "returnModelById", styleId + "_cluster");
                    }
                    // Ansonsten nimm den normal one
                    if (_.isUndefined(stylelistmodel) === true) {
                        stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId);
                    }
                    feature.setStyle(stylelistmodel.getClusterStyle(feature));
                });
            }
            else {
                this.set("style", function (feature) {
                    var stylelistmodel = Radio.request("StyleList", "returnModelByValue", styleId);

                    feature.setStyle(stylelistmodel.getSimpleStyle());
                });
            }
        },

        /**
         * Zeigt alle Features mit dem Default-Style an
         */
        showAllFeatures: function () {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

            source.addFeatures(featuresToHide);
            featuresToHide = [];
            this.setFeaturesToHide(featuresToHide);
            this.checkIfGfiIsOutdated();
        },

        /**
         * Versteckt alle Features mit dem Hidden-Style
         */
        hideAllFeatures: function () {
            var collection = this.getLayerSource().getFeatures(),
                source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide();

            collection.forEach(function (feature) {
                featuresToHide.push(feature);
            });
            source.clear();
            this.checkIfGfiIsOutdated();
        },

        /**
         * Zeigt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        showFeaturesByIds: function (featureIdList) {
            var source = this.getLayerSource(),
                features,
                featuresToHide = this.getFeaturesToHide();

            features = _.filter(featuresToHide, function (feature) {
                return _.contains(featureIdList, String(feature.getId()));
            });
            features.sort(function (a, b) {
                var a_id = parseInt(a.getId(), 10),
                    b_id = parseInt(b.getId(), 10);

                if (a_id < b_id) {
                    return -1;
                }
                if (a_id > b_id) {
                    return 1;
                }
                return 0;
            });
            source.addFeatures(features);
            featuresToHide = _.difference(featuresToHide, features);
            this.setFeaturesToHide(featuresToHide);
            this.checkIfGfiIsOutdated();
        },
        /**
         * Zeigt nur die Features an, deren Attr übergeben wird
         * @param  {string[]} featureAttrList
         * @param  {string} attr
         */
        showFeaturesByAttr: function (featureAttrList, attr) {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide(),
                features;

            features = _.filter(featuresToHide, function (feature) {
                return _.contains(featureAttrList, String(feature.get(attr)));
            });

            features = this.sortFeaturesByAttr(features, attr);
            source.addFeatures(features);
            featuresToHide = _.difference(featuresToHide, features);
            this.setFeaturesToHide(featuresToHide);
        },
        sortFeaturesByAttr: function (features, attr) {
            return features.sort(function (a, b) {
                var a_id = parseInt(a.get(attr), 10),
                    b_id = parseInt(b.get(attr), 10);

                if (a_id < b_id) {
                    return -1;
                }
                if (a_id > b_id) {
                    return 1;
                }
                return 0;
            });
        },
        /**
         * Versteckt nur die Features an, deren Id übergeben wird
         * @param  {string[]} featureIdList
         */
        hideFeaturesByIds: function (featureIdList) {
            var source = this.getLayerSource(),
                featuresToHide = this.getFeaturesToHide(),
                sourceFeatures = source.getFeatures();

            _.each(featureIdList, function (id) {
                var feature = source.getFeatureById(id);

                if (feature) {
                    featuresToHide.push(feature);
                }
            }, this);
            sourceFeatures = _.difference(sourceFeatures, featuresToHide);
            source.clear();
            source.addFeatures(sourceFeatures);
            this.checkIfGfiIsOutdated();
        },

        /*
        * Wenn Gfi aktiv ist, wird überprüft ob das GFI-Theme-Feature noch in der Source vorhanden ist.
        * Wenn nicht, wird das GFI geschlossen
        * Wenn das GFI-Theme-Feature noch in der Source ist, dann muss es gehighlighted werden
        */
        checkIfGfiIsOutdated: function () {
            var gfiTheme = Radio.request("GFI", "getTheme"),
                source = this.getLayerSource(),
                sourceFeature,
                gfiFeature;

            // GFI ist offen
            if (!_.isUndefined(gfiTheme)) {
                gfiFeature = gfiTheme.getFeature();
                sourceFeature = source.getFeatureById(gfiFeature.getId());
                // wenn das Feature des GFi nicht mehr in der source ist: GFI schließen
                if (_.isNull(sourceFeature)) {
                    Radio.trigger("GFI", "setIsVisible", false);
                }
                // GFI-Feature highlighten
                else {
                    /*
                    * Hack um mouseHover model dazu zu bringen die Features neu zu zeichnen und damit das aktive Feature auch zu hovern.
                    * Das MouseHover Model hört auf "changedExtent". Durch minimales Versetzen des Centers wird das Event gefeuert.
                    * Ein direktes feuern durch Radio.trigger("Map", "changedExtent") blieb erfolglos.
                    */
                    var newCenter = Radio.request("MapView", "getCenter");

                    newCenter[0] = newCenter[0] - 0.00001;
                    Radio.trigger("MapView", "setCenter", newCenter);
                }
            }
        },
        // getter for FeaturesToHide
        getFeaturesToHide: function () {
            return this.get("featuresToHide");
        },
        // setter for FeaturesToHide
        setFeaturesToHide: function (value) {
            this.set("featuresToHide", value);
        },
        // Setter
        setClusterLayerSource: function (value) {
            this.set("clusterLayerSource", value);
        },

        // Getter
        getFeatures: function () {
            return this.get("features");
        },

        getClusterLayerSource: function () {
            return this.get("clusterLayerSource");
        },

        getClusterDistance: function () {
            return this.get("clusterDistance");
        },

        getStyleId: function () {
            return this.get("styleId");
        },

        getStyle: function () {
            if (this.get("id") === "flurst" || this.get("id") === "potfl") {
                return this.getDefaultStylePolygon();
            }
            else {
                return this.get("style");
            }
        },

        getDefaultStylePolygon: function () {
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(49, 159, 211, 0.8)"
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(50, 50, 50, 1)",
                    width: 1
                })
            });
        },

        /**
         * Getter für das Attribut "mouseHoverField"
         * @return {Object} - Enthält die Attribute die beim Hovern angzeigt werden
         * (header, text, clusterHeader und clusterText)
         */
        getMouseHoverField: function () {
            return this.get("mouseHoverField");
        }
    });

    return GeoJSONLayer;
});
