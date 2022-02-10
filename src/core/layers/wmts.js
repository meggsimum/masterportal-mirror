import Layer from "./layer";
import WMTS, {optionsFromCapabilities} from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import TileLayer from "ol/layer/Tile";
import {DEVICE_PIXEL_RATIO} from "ol/has";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import * as bridge from "./RadioBridge.js";
import axios from "axios";
import handleAxiosResponse from "../../utils/handleAxiosResponse";
import getNestedValues from "../../utils/getNestedValues";

/**
 * Creates a layer of type WMTS.
 * infoFormat="text/xml Format of provided information."
 * supported=["2D", "3D"] Supported map modes.
 * @param {Object} attrs  attributes of the layer
 * @param {Object} options  options of the layer
 * @returns {void}
 */
export default function WMTSLayer (attrs, options) {
    const defaults = {
        infoFormat: "text/xml",
        supported: ["2D", "3D"],
        showSettings: true
    };

    this.createLayer(Object.assign(defaults, attrs, options));

    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs, options), this.layer, !attrs.isChildLayer);
    this.createLegend();

    if (this.get("isVisibleInMap")) {
        this.updateSource();
    }

}

// Link prototypes and add prototype methods, means WMTSLayer uses all methods and properties of Layer
WMTSLayer.prototype = Object.create(Layer.prototype);

/**
* Creates the LayerSource from definitions in the service.json for this WMTSLayer.
* @param {Object} attrs  attributes of the layer
* @returns {void}
*/
WMTSLayer.prototype.createLayerSourceByDefinitions = function (attrs) {
    const projection = getProjection(attrs.coordinateSystem),
        extent = projection.getExtent(),
        style = attrs.style,
        format = attrs.format,
        wrapX = attrs.wrapX ? attrs.wrapX : false,
        urls = attrs.urls,
        size = getWidth(extent) / parseInt(attrs.tileSize, 10),
        resLength = parseInt(attrs.resLength, 10),
        resolutions = new Array(resLength),
        matrixIds = new Array(resLength),
        source = new WMTS({
            projection: projection,
            attributions: attrs.olAttribution,
            tileGrid: new WMTSTileGrid({
                origin: attrs.origin,
                resolutions: resolutions,
                matrixIds: matrixIds,
                tileSize: attrs.tileSize
            }),
            tilePixelRatio: DEVICE_PIXEL_RATIO,
            urls: urls,
            matrixSet: attrs.tileMatrixSet,
            matrixSizes: attrs.matrixSizes,
            layer: attrs.layers,
            format: format,
            style: style,
            version: attrs.version,
            transparent: attrs.transparent.toString(),
            wrapX: wrapX,
            requestEncoding: attrs.requestEncoding,
            scales: attrs.scales
        });

    this.generateArrays(resolutions, matrixIds, resLength, size);
    source.matrixSizes = attrs.matrixSizes;
    source.scales = attrs.scales;
    this.layer.setSource(source);
    this.layer.getSource().refresh();
};

/**
* Creates the LayerSource for this WMTSLayer from the WMTS capabilities.
* @param {Object} attrs  attributes of the layer
* @returns {void}
*/
WMTSLayer.prototype.createLayerSourceByCapabilities = function (attrs) {
    const layerIdentifier = attrs.layers,
        url = attrs.capabilitiesUrl,
        matrixSet = attrs.tileMatrixSet,
        capabilitiesOptions = {
            layer: layerIdentifier
        };

    // use the matrixSet (if defined) for optionsFromCapabilities
    // else look for a tilematrixset in epsg:3857
    if (matrixSet && matrixSet.length > 0) {
        capabilitiesOptions.matrixSet = matrixSet;
    }
    else {
        capabilitiesOptions.projection = "EPSG:3857";
    }

    this.getWMTSCapabilities(url)
        .then((result) => {
            const options = optionsFromCapabilities(result, capabilitiesOptions),
                tileMatrixSet = result.Contents.TileMatrixSet.filter(set => set.Identifier === options.matrixSet)[0],
                matrixSizes = [],
                scales = [];

            // Add the parameters "ScaleDenominator" and "MatrixHeight" / "MatrixWidth" to the source to be able to print WMTS layers
            tileMatrixSet.TileMatrix.forEach(({MatrixHeight, MatrixWidth, ScaleDenominator}) => {
                matrixSizes.push([MatrixWidth, MatrixHeight]);
                scales.push(ScaleDenominator);
            });

            if (options !== null) {
                const source = new WMTS(options);

                source.matrixSizes = matrixSizes;
                source.scales = scales;
                this.layer.set("options", options);
                this.layer.setSource(source);
                this.layer.getSource().refresh();
            }
            else {
                const errorMessage = "Cannot get options from WMTS-Capabilities";

                this.showErrorMessage(errorMessage, this.get("name"));
                throw new Error(errorMessage);
            }
        })
        .catch((error) => {
            if (error === "Fetch error") {
                // error message has already been printed earlier
                return;
            }
            this.showErrorMessage(error, this.get("name"));
        });
};

/**
 * Generates resolutions and matrixIds arrays for the WMTS LayerSource.
 *
 * @param {Array} resolutions The resolutions array for the LayerSource.
 * @param {Array} matrixIds The matrixIds array for the LayerSource.
 * @param {Number} length The length of the given arrays.
 * @param {Number} size The tileSize depending on the extent.
 * @returns {void}
 */
WMTSLayer.prototype.generateArrays = function (resolutions, matrixIds, length, size) {
    for (let i = 0; i < length; ++i) {
        resolutions[i] = size / Math.pow(2, i);
        matrixIds[i] = i;
    }
};

/**
 * Gets the WMTS-GetCapabilities document and parse it
 * @param {string} url url for getting capabilities
 * @returns {promise} promise resolves to parsed WMTS-GetCapabilities object
 */
WMTSLayer.prototype.getWMTSCapabilities = function (url) {
    return axios.get(url)
        .then(response => handleAxiosResponse(response, "getWMTSCapabilities"))
        .then(result => {
            const parser = new WMTSCapabilities();

            return parser.read(result);
        });
};

/**
 * Shows error message in console when WMTS-GetCapabilities cannot be parsed
 * @param {string} errorMessage error message
 * @param {string} layerName layerName
 * @returns {void}
 */
WMTSLayer.prototype.showErrorMessage = (errorMessage, layerName) => {
    console.error("content: Layer " + layerName + ": " + errorMessage);
};

/**
 * Creates the WMTSLayer.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
WMTSLayer.prototype.createLayer = function (attrs) {
    const tileLayer = new TileLayer({
        id: attrs.id,
        source: new WMTS({}),
        name: attrs.name,
        minResolution: attrs.minScale,
        maxResolution: attrs.maxScale,
        supported: ["2D", "3D"],
        showSettings: true,
        extent: null,
        typ: attrs.typ,
        legendURL: attrs.legendURL,
        infoFormat: attrs.infoFormat
    });

    this.layer = tileLayer;
    if (attrs.optionsFromCapabilities === undefined) {
        this.createLayerSourceByDefinitions(Object.assign(attrs));
    }
    else {
        this.createLayerSourceByCapabilities(Object.assign(attrs));
    }
};

/**
 * If no legendURL is set an Error is written on the console.
 * For the OptionsFromCapabilities way:
 * If legend is empty, WMTS-Capabilities will be searched for a legendURL (OGC Standard)
 * If a legend is found, legend will be rebuild
 *
 * @returns {void}
 */
WMTSLayer.prototype.createLegend = function () {
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
            this.setLegend([legend]);
        }
    }
    if ((this.get("optionsFromCapabilities") === undefined) && (legend === true)) {
        console.error("WMTS: No legendURL is specified for the layer!");
    }
    else if (this.get("optionsFromCapabilities") && !this.get("legendURL")) {
        const capabilitiesUrl = this.get("capabilitiesUrl");

        this.getWMTSCapabilities(capabilitiesUrl)
            .then((result) => {
                result.Contents.Layer.forEach((layer) => {
                    if (layer.Identifier === this.get("layers")) {
                        const getLegend = getNestedValues(layer, "LegendURL");

                        if (getLegend !== null && getLegend !== undefined) {
                            legend = getLegend[0][0].href;
                            this.setLegend([legend]);

                            // rebuild Legend
                            bridge.setLegendLayerList();
                        }
                        else {
                            this.setLegend(null);
                            console.warn("no legend url found for layer " + this.get("layers"));
                        }

                    }
                });
            })
            .catch((error) => {
                if (error === "Fetch error") {
                    // error message has already been printed earlier
                    return;
                }
                this.showErrorMessage(error, this.get("name"));
            });
    }

};

/**
 * If the WMTS-Layer has an extent defined, then this is returned.
 * Else, the extent of the projection is returned.
 * @returns {Array} - The extent of the Layer.
 */
WMTSLayer.prototype.getExtent = function () {
    const projection = getProjection(this.get("coordinateSystem"));

    if (this.has("extent")) {
        return this.get("extent");
    }

    return projection.getExtent();
};


