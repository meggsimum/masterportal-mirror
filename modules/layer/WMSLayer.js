define([
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/Layer"
], function (Backbone, ol, EventBus, Config, Layer) {

    var WMSLayer = Layer.extend({

        setResolutions: function (resolutions) {
            this.set("resolutions", resolutions);
        },

        /**
         *
         */
        setAttributionLayerSource: function () {
            EventBus.trigger("mapView:getResolutions");
            var version,
                format,
                params;

            if (this.get("version") && this.get("version") !== "" && this.get("version") !== "nicht vorhanden") {
                version = this.get("version");
            }
            else {
                version = "1.3.0";
            }
            if (this.get("format") && this.get("format") !== "" && this.get("format") !== "nicht vorhanden") {
                format = this.get("format");
            }
            else {
                format = "image/png";
            }
            params = {
                t: new Date().getMilliseconds(),
                zufall: Math.random(),
                LAYERS: this.get("layers"),
                FORMAT: format,
                VERSION: version,
                TRANSPARENT: this.get("transparent").toString()
            };

            if (this.get("styles") && this.get("styles") !== "" && this.get("styles") !== "nicht vorhanden") {
                params = _.extend(params, {
                    STYLES: this.get("styles")
                });
            }
            if (this.get("singleTile") !== true) {
                this.set("source", new ol.source.TileWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    gutter: this.get("gutter"),
                    params: params,
                    tileGrid: new ol.tilegrid.TileGrid({
                        resolutions: this.get("resolutions"),
                        origin: [
                            442800,
                            5809000
                        ],
                        tileSize: parseInt(this.get("tilesize"), 10)
                    })
                }));
            }
            else {
                this.set("source", new ol.source.ImageWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    params: params,
                    resolutions: this.get("resolutions")
                }));
            }
        },

        /**
         * Erzeugt ein Layerobject abhängig von "singleTile"
         */
        setAttributionLayer: function () {
            var layerobjects = {
                    source: this.get("source"),
                    name: this.get("name"),
                    typ: this.get("typ"),
                    gfiAttributes: this.get("gfiAttributes"),
                    legendURL: this.get("legendURL"),
                    routable: this.get("routable"),
                    gfiTemplateName: this.get('gfiTemplateName'),
                    infoFormat: this.get("infoFormat")
            };

            if (this.get("singleTile") !== true) {
                this.set("layer", new ol.layer.Tile(layerobjects));
            }
            else {
                this.set("layer", new ol.layer.Image(layerobjects));
            }
        },

        updateSourceSLDBody: function () {
            this.get("source").updateParams({SLD_BODY: this.get("SLDBody")});
        }
    });

    return WMSLayer;
});
