import Layer from "./layer";
import * as bridge from "./RadioBridge.js";
import getNestedValues from "../../utils/getNestedValues";
import {wmts} from "@masterportal/masterportalapi";

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

    this.layer = wmts.createLayer(Object.assign(defaults, attrs, options));

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

        wmts.getWMTSCapabilities(capabilitiesUrl)
            .then((result) => {
                result.Contents.Layer.forEach((layer) => {
                    if (layer.Identifier === this.get("layers")) {
                        const getLegend = getNestedValues(layer, "LegendURL");

                        if (getLegend !== null && getLegend !== undefined) {
                            legend = getLegend[0]?.[0]?.href;
                            if (legend) {
                                this.setLegend([legend]);

                                // rebuild Legend
                                bridge.setLegendLayerList();
                            }
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
                wmts.showErrorMessage(error, this.get("name"));
            });
    }
};
