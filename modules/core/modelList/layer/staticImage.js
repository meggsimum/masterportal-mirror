import Layer from "./model";
import ImageLayer from "ol/layer/Image.js";
import StaticImageSource from "ol/source/ImageStatic.js";
import getProxyUrl from "../../../../src/utils/getProxyUrl";
import store from "../../../../src/app-store";

const StaticImageLayer = Layer.extend({

    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        useProxy: false
    }),

    /**
     * Creates layer source for staticImage
     * @return {void}
     */
    createLayerSource: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");

        this.setLayerSource(new StaticImageSource({
            url: url,
            projection: store.getters["Maps/projection"],
            imageExtent: this.get("extent")
        }));
    },

    /**
     * Creates Layer for staticImage
     * @return {void}
     */
    createLayer: function () {
        this.setLayer(new ImageLayer({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: "StaticImage",
            legendURL: this.get("legendURL"),
            transparency: this.get("transparency")
        }));

        this.createLegend();
    },

    /**
     * Creates the legend.
     * @returns {void}
     */
    createLegend: function () {
        let legend = this.get("legend");

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
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    }
});

export default StaticImageLayer;
