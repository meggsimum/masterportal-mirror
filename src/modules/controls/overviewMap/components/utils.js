import ImageWMS from "ol/source/ImageWMS.js";
import Image from "ol/layer/Image.js";
import View from "ol/View.js";
import {getLayerWhere} from "masterportalapi/src/rawLayerList";
import store from "../../../../app-store/index";

/*
 * NOTE I'm unsure where these belong.
 * A) Component? Makes component unreadable and most functions are used one time only.
 * B) Store? It does not really hold/modify data, only one layer. => Maybe when layers are in store?
 * C) Global utils? Only used locally, would pollute global space.
 * So I'm leaving those here for now. Discussion welcome!
 */

/**
 * @param {module:ol/Map} map openlayers map
 * @param {?Number} resolution resolution to be set, if any @deprecated
 * @returns {module:ol/View} prepared view for overview map
 */
export function getOverviewMapView (map, resolution) {
    const view = map.getView();

    return new View({
        center: view.getCenter(),
        projection: view.getProjection(),
        resolution: resolution === null ? view.getResolution() : resolution
    });
}

/**
 * @param {String} id id of layer to use from services.json
 * @returns {?module:ol/layer/Image} image layer
 */
export function getOverviewMapLayer (id) {
    const layerId = id || getInitialVisibleBaseLayerId(),
        ovmLayer = layerId ? getOvmLayer(layerId) : null;

    if (!layerId) {
        console.error("Missing layerId for control overviewMap. Could not infer initially visible base layer id.");
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.controls.overviewMap.missingLayerId"));
    }
    else if (!ovmLayer) {
        console.error(`Could not create overviewMap for (inferred?) id "${layerId}". Given id: "${id}".`);
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.controls.overviewMap.missingLayerId"));
    }

    return ovmLayer;
}

/**
 * @returns {?String} id of initially visible base layer
 */
function getInitialVisibleBaseLayerId () {
    const layer = Radio.request("Parser", "getInitVisibBaselayer");

    return layer ? layer.id : null;
}

/**
 * @description Derives the baselayer parameters from the global layer collection.
 * @param {String} id id of base layer to get parameters for
 * @returns {?Object} parameter object
 */
function getLayerParameters (id) {
    const model = getLayerWhere({id});

    if (model === null) {
        console.error(`No model for id ${id} found in OverviewMap.`);
        return null;
    }

    return {
        url: model.url,
        params: {
            // TODO what are t and zufall good for?
            t: new Date().getMilliseconds(),
            zufall: Math.random(),
            LAYERS: model.layers,
            FORMAT: model.format === "nicht vorhanden" ? "image/png" : model.format,
            VERSION: model.version,
            TRANSPARENT: model.transparent.toString()
        }
    };
}

/**
 * @param {String} id id of baselayer to use
 * @returns {ol/Image} image layer to use for overviewMap
 */
function getOvmLayer (id) {
    const parameters = getLayerParameters(id);

    if (!parameters) {
        return null;
    }

    return new Image({
        source: new ImageWMS(parameters)
    });
}
