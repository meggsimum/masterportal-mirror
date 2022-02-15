import {wms} from "masterportalAPI";
import store from "../../app-store";
import Layer from "./layer";
import mapCollection from "../../core/dataStorage/mapCollection.js";
import * as bridge from "./RadioBridge.js";
/**
 * Creates a layer of type WMS.
 * @param {Object} attrs Params of the raw layer.
 * @returns {void}
 */
export default function WMSLayer (attrs) {
    const defaults = {
        infoFormat: "text/xml",
        gfiAsNewWindow: null,
        supported: ["2D", "3D"],
        showSettings: true,
        extent: null,
        isSecured: false,
        notSupportedFor3D: ["1747", "1749", "1750", "9822", "12600", "9823", "1752", "9821", "1750", "1751", "12599", "2297"],
        useProxy: false
    };

    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.createLegend();
    bridge.listenToChangeSLDBody(this);

    // Hack for services that do not support EPSG:4326
    if (this.get("notSupportedFor3D").includes(this.get("id"))) {
        this.set("supported", ["2D"]);
    }
}
// Link prototypes and add prototype methods, means WMSLayer uses all methods and properties of Layer
WMSLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer of type WMS by using wms-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs Params of the raw layer.
 * @returns {void}
 */
WMSLayer.prototype.createLayer = function (attrs) {
    const options = this.getOptions(),
        rawLayerAttributes = this.getRawLayerAttributes(attrs),
        layerParams = this.getLayerParams(attrs);

    this.layer = wms.createLayer(rawLayerAttributes, layerParams, options);
};

/**
 * Gets options that contains resolutions and origin to create the TileGrid.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Object} The options.
 */
WMSLayer.prototype.getOptions = function () {
    return {resolutions: mapCollection.getMapView("ol", "2D").getResolutions(), origin: [442800, 5809000]};
};

/**
 * Gets raw layer attributes from services.json attributes.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Object} The raw layer attributes.
 */
WMSLayer.prototype.getRawLayerAttributes = function (attrs) {
    const rawLayerAttributes = {
        id: attrs.id,
        gutter: attrs.gutter,
        format: attrs.format,
        url: attrs.url,
        tilesize: attrs.tilesize,
        layers: attrs.layers,
        version: attrs.version,
        olAttribution: attrs.olAttribution,
        transparent: attrs.transparent.toString(),
        singleTile: attrs.singleTile,
        minScale: parseInt(attrs.minScale, 10),
        maxScale: parseInt(attrs.maxScale, 10)
    };

    if (attrs.styles !== "nicht vorhanden") {
        rawLayerAttributes.STYLES = attrs.styles;
    }

    return rawLayerAttributes;
};

/**
 * Gets additional layer params.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Obeject} The layer params.
 */
WMSLayer.prototype.getLayerParams = function (attrs) {
    return {
        layers: attrs.layers,
        name: attrs.name,
        legendURL: attrs.legendURL,
        gfiTheme: attrs.gfiTheme,
        gfiAttributes: attrs.gfiAttributes,
        infoFormat: attrs.infoFormat,
        gfiAsNewWindow: attrs.gfiAsNewWindow,
        featureCount: attrs.featureCount,
        format: attrs.format,
        useProxy: attrs.useProxy,
        typ: attrs.typ,
        layerSequence: attrs.layerSequence
    };
};

/**
 * Updates the SLDBody of the layer source.
 * @returns {void}
 */
WMSLayer.prototype.updateSourceSLDBody = function () {
    this.layer.getSource().updateParams({SLD_BODY: this.get("SLDBody"), STYLES: this.get("paramStyle")});
};
/**
 * Updates the layers source by changing the cache id.
 * @returns {void}
 */
WMSLayer.prototype.updateSource = function () {
    wms.updateSource(this.layer);
};
/**
 * Returns the layers of the WMS layer.
 * @returns {*} String or Array of layers
 */
WMSLayer.prototype.getLayers = function () {
    return this.get("layers");
};
/**
 * Gets the gfi url from the layers source.
 * @returns {String} - The created getFeature info url.
 */
WMSLayer.prototype.getGfiUrl = function () {
    const mapView = mapCollection.getMapView("ol", "2D"),
        resolution = store.getters["Map/resolution"],
        projection = mapView.getProjection(),
        coordinate = store.getters["Map/clickCoord"];

    return this.get("layerSource").getFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: this.get("infoFormat"), FEATURE_COUNT: this.get("featureCount")});
};
/**
* If the parameter "legendURL" is empty, it is set to GetLegendGraphic.
* @return {void}
*/
WMSLayer.prototype.createLegend = function () {
    const version = this.get("version");
    let legend = this.get("legend");

    /**
    * @deprecated in 3.0.0
    */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (legend === true) {
        const layerNames = this.get("layers").split(","),
            legends = [];

        if (layerNames.length === 1) {
            legends.push(encodeURI(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + this.get("layers")));
        }
        else if (layerNames.length > 1) {
            layerNames.forEach(layerName => {
                legends.push(encodeURI(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName));
            });
        }
        this.setLegend(legends);
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
 * Returns the extent, if available. Else returns the extent of the mapView.
 * @returns {Array} the extent
 */
WMSLayer.prototype.getExtent = function () {
    if (this.has("extent")) {
        return this.get("extent");
    }
    return store.getters["Map/bbox"];
};
