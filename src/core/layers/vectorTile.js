import Layer from "./layer";
import MVT from "ol/format/MVT";
import OpenLayersVectorTileLayer from "ol/layer/VectorTile";
import OpenLayersVectorTileSource from "ol/source/VectorTile";
import TileGrid from "ol/tilegrid/TileGrid";
import {extentFromProjection} from "ol/tilegrid";
import {defaultResolutions} from "ol-mapbox-style/dist/util";
import stylefunction from "ol-mapbox-style/dist/stylefunction";
import store from "../../app-store";
import getProxyUrl from "../../utils/getProxyUrl";
import axios from "axios";

/**
 * Creates a layer of type vectorTile.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function VectorTileLayer (attrs) {
    const defaults = {
            selectedStyleID: undefined,
            useMpFonts: true,
            useProxy: false
        },
        mapEPSG = store.getters["Map/projection"].getCode(),
        vtEPSG = attrs.epsg,
        layerSource = this.createLayerSource(Object.assign(defaults, attrs));

    attrs.layerSource = layerSource;

    if (mapEPSG !== vtEPSG) {
        console.warn(`VT Layer ${attrs.name}: Map (${mapEPSG}) and layer (${vtEPSG}) projection mismatch. View will be erroneous.`);
        this.set("isNeverVisibleInTree", true);
    }
    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.setConfiguredLayerStyle();
}

// Link prototypes and add prototype methods, means VTL uses all methods and properties of Layer
VectorTileLayer.prototype = Object.create(Layer.prototype);

/**
* Creates vector tile layer source.
* If no tilegrid is created, the default tilegrid ist used.
* @param {Object} attrs the attributes for the layer
* @return {Object} the layer source
*/
VectorTileLayer.prototype.createLayerSource = function (attrs) {
    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    const url = attrs.useProxy ? getProxyUrl(attrs.url) : attrs.url,
        dataEpsg = attrs.epsg || store.getters["Map/projection"].getCode(),
        resolutions = attrs.resolutions,
        params = {
            projection: dataEpsg,
            format: new MVT(),
            url: url,
            tileSize: attrs.tileSize,
            zDirection: attrs.zDirection,
            minZoom: attrs.minZoom,
            maxZoom: attrs.maxZoom
        };

    if (dataEpsg !== "EPSG:3857" || attrs.extent || attrs.origin || attrs.origins || resolutions) {
        params.tileGrid = this.createTileGrid(dataEpsg, attrs);
    }

    return new OpenLayersVectorTileSource(params);
};

/**
 * Create a tilegrid.
 * @param {String} dataEpsg The epsgCode from the data.
 * @param {Object} attrs The layers attributes.
 * @returns {module:ol/tilegrid/TileGrid~TileGrid} The tileGrid.
 */
VectorTileLayer.prototype.createTileGrid = function (dataEpsg, attrs) {
    const extent = attrs.extent || extentFromProjection(dataEpsg),
        origin = attrs.origin || [extent[0], extent[3]], // upper left corner = [minX, maxY]
        resolutions = attrs.resolutions || defaultResolutions,
        tileSize = attrs.tileSize || 512,
        origins = attrs.origins,
        tileGridParams = {
            extent: extent,
            resolutions: resolutions,
            tileSize: tileSize,
            minZoom: attrs.minZoom
        };

    if (origins) {
        tileGridParams.origins = origins;
    }
    else {
        tileGridParams.origin = origin;
    }

    return new TileGrid(tileGridParams);
};

/**
 * Creates vector tile layer.
 * @param {Object} attr the attributes for the layer
 * @return {void}
 */
VectorTileLayer.prototype.createLayer = function (attr) {
    this.layer = new OpenLayersVectorTileLayer({
        source: attr.layerSource,
        id: attr.id,
        typ: attr.typ,
        name: attr.name,
        visible: attr.visibility,
        declutter: true,
        styleId: attr.styleId,
        vtStyles: attr.vtStyles,
        isSelected: attr.isSelected,
        useProxy: attr.useProxy,
        useMpFonts: attr.useMpFonts
    });
};

/**
 * Initially reads style information in this order:
 *     1. If field styleId in config.json, use style from services.json with that id
 *     2. If services.json has a style marked with field "defaultStyle" to true, use that style
 *     3. If neither is available, use the first style in the services.json
 *     4. If none defined, OL default style will be used implicitly
 * @returns {void}
 */
VectorTileLayer.prototype.setConfiguredLayerStyle = function () {
    let stylingPromise;

    if (this.get("styleId") && this.get("styleId") !== "default") {
        this.set("selectedStyleID", this.get("styleId"));
        stylingPromise = this.setStyleById(this.get("styleId"));
    }
    else {
        const style = this.get("vtStyles").find(({defaultStyle}) => defaultStyle) || this.get("vtStyles")[0];

        if (typeof style !== "undefined") {
            this.set("selectedStyleID", style.id);
            stylingPromise = this.setStyleByDefinition(style);
        }
        else {
            console.warn(`Rendering VT layer ${this.get("name")} without style; falls back to OL default styles.`);
        }
    }

    if (stylingPromise) {
        stylingPromise
            .then(() => this.layer.setVisible(this.get("isSelected")))
            .catch(err => console.error(err));
    }
};

/**
* Fetches a style defined for this layer in the services file.
* @param {String} styleID id of style as defined in services.json
* @returns {Promise} resolves void after style was set; may reject if no style found or received style invalid
*/
VectorTileLayer.prototype.setStyleById = function (styleID) {
    const styleDefinition = this.get("vtStyles").find(({id}) => id === styleID);

    if (!styleDefinition) {
        return Promise.reject(`No style found with ID ${styleID} for layer ${this.get("name")}.`);
    }

    return this.setStyleByDefinition(styleDefinition);
};

/**
 * Loads a style from a style definition's URL and sets it to be active.
 * @param {object} styleDefinition style definition as found in service.json file
 * @param {string} styleDefinition.url url where style is kept
 * @param {string} styleDefinition.id id of style
 * @returns {Promise} resolves void after style was set; may reject if received style is invalid
 */
VectorTileLayer.prototype.setStyleByDefinition = function ({id, url}) {
    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    return axios.get(this.get("useProxy") ? getProxyUrl(url) : url)
        .then(response => response.data)
        .then(style => {
            let spriteUrl, spriteDataUrl, spriteImageUrl, addMpFonts;

            // check if style is defined and required fields exist
            if (!this.isStyleValid(style)) {
                throw new Error(
                    `Style set for VT layer is incomplete. Must feature layers, sources, and version. Received: "${JSON.stringify(style)}"`
                );
            }

            if (this.get("useMpFonts")) {
                addMpFonts = this.addMpFonts;
            }

            if (style.sprite) {
                spriteUrl = style.sprite;

                // support relative spriteUrls
                if (spriteUrl.includes("./")) {
                    spriteUrl = new URL(spriteUrl, url);
                }

                spriteDataUrl = spriteUrl.toString().concat(".json");
                spriteImageUrl = spriteUrl.toString().concat(".png");

                this.fetchSpriteData(spriteDataUrl)
                    .then(spriteData => {
                        stylefunction(this.get("layer"), style, Object.keys(style.sources)[0], undefined, spriteData, spriteImageUrl, addMpFonts);
                        this.set("selectedStyleID", id);
                    }
                    );
            }
            else {
                stylefunction(this.get("layer"), style, Object.keys(style.sources)[0], undefined, undefined, undefined, addMpFonts);
                this.set("selectedStyleID", id);
            }
        });
};

/**
 * Changes fontstack of VT-Style to MP-font if configured.
 * @param {String[]} fontstack text-font as found in VT-Style
 * @returns {String[]} returns relevant MP-font
 */
VectorTileLayer.prototype.addMpFonts = function (fontstack) {
    if (fontstack.includes("Bold") | fontstack.includes("bold")) {
        return "MasterPortalFont Bold";
    }
    else if (fontstack.includes("Italic") | fontstack.includes("italic")) {
        return "MasterPortalFont Italic";
    }
    return "MasterPortalFont";
};

/**
 * Checks required fields of a style for presence.
 * @param {object} style style object as fetched from a remote url
 * @returns {boolean} true if all expected fields at least exist
 */
VectorTileLayer.prototype.isStyleValid = function (style) {
    return Boolean(style) &&
        Boolean(style.layers) &&
        Boolean(style.sources) &&
        Boolean(style.version);
};

/**
 * Fetches SpriteData Object
 * @param {String} spriteUrl url to spriteData as found in StyleDefinition
 * @returns {Object} spriteData
 */
VectorTileLayer.prototype.fetchSpriteData = function (spriteUrl) {
    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    return axios.get(this.get("useProxy") ? getProxyUrl(spriteUrl) : spriteUrl)
        .then(resp => resp.data);
};

/**
 * NOTE Legends are currently not supported.
 * Since the layer may be restyled frontend-side
 * without the backend knowing about it, no simple
 * legend URL link can be offered.
 * @returns {void}
 */
VectorTileLayer.prototype.createLegendURL = function () {
    this.setLegendURL([]);
};
