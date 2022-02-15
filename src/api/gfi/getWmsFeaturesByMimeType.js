import {requestGfi} from "../wmsGetFeatureInfo";

/**
 * returns a list of wms features for the given url and mimeType
 * @param {Object} layer to show the properties of
 * @param {Object} [layer.mimeType] the infoFormat of the wms (either text/xml or text/html)
 * @param {String} [layer.layerName] the name of the requesting layer
 * @param {String} [layer.layerId] the id of the requesting layer
 * @param {String} [layer.gfiTheme] the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} [layer.attributesToShow] an object of attributes to show or a string "showAll" or "ignore"
 * @param {Object} [layer.gfiAsNewWindow] null or an object of how to open the gfi in a new window
 * @param {String} [layer.gfiAsNewWindow.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} [layer.gfiAsNewWindow.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} url the url to call the wms features from
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getWmsFeaturesByMimeType (layer, url) {
    const infoFormat = layer.get("infoFormat"),
        gfiAsNewWindow = layer.get("gfiAsNewWindow");

    if (openFeaturesInNewWindow(url, gfiAsNewWindow, window.open) === true) {
        return [];
    }

    if (infoFormat === "text/xml" || infoFormat === "application/vnd.ogc.gml") {
        return getXmlFeatures(layer, url);
    }

    // mimeType === "text/html"
    return getHtmlFeature(layer, url);
}

/**
 * opens a new window with the given url if gfiAsNewWindow is set
 * will open any http that is no SSL in a new window
 * @param {String} url the url to call the wms features from
 * @param {Object} gfiAsNewWindow null or an object of how to open the gfi in a new window
 * @param {String} [gfiAsNewWindow.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} [gfiAsNewWindow.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {Function} openWindow a function (url, name, specs) to open a new browser window with
 * @returns {Boolean}  true if a window is opened, false if no window was opened
 */
export function openFeaturesInNewWindow (url, gfiAsNewWindow, openWindow) {
    if (typeof url !== "string") {
        return false;
    }
    else if (typeof openWindow !== "function") {
        return false;
    }

    let newWindowProps = gfiAsNewWindow;

    if ((newWindowProps === null || typeof newWindowProps !== "object") && url.startsWith("http:", 0)) {
        // make sure not to open http (no mixed content)
        newWindowProps = {
            name: "",
            specs: ""
        };
    }

    if (newWindowProps !== null && typeof newWindowProps === "object") {
        // do not add to gfiFeatures, open a new window with given specs instead
        const name = newWindowProps?.name ? newWindowProps.name : "",
            specs = newWindowProps?.specs ? newWindowProps.specs : "";

        openWindow(url, name, specs);
        return true;
    }

    return false;
}

/**
 * returns a list of objects representing the features called by url
 * @param {Object} layer to show the properties of
 * @param {String} [layer.layerName] the name of the requesting layer
 * @param {String} [layer.gfiTheme] the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} [layer.attributesToShow] an object of attributes to show or a string "showAll" or "ignore"
 * @param {String} [layer.layerId] the id of the requesting layer
 * @param {String} url the url to call the wms features from
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getXmlFeatures (layer, url) {
    if (typeof url !== "string") {
        return [];
    }
    return requestGfi("text/xml", url).then(featureInfos => {
        return handleXmlResponse(featureInfos, layer, url);
    });
}
/**
 * returns a list of objects representing the features called by url
 * @param {Object} featureInfos response from requestGFI
 * @param {Object} layer to show the properties of
 * @param {String} [layer.gfiTheme] the title of the theme - it does not check if the theme exists
 * @param {String} url the url to call the wms features from
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function handleXmlResponse (featureInfos, layer, url) {
    let result = [];

    if (Array.isArray(featureInfos)) {
        featureInfos.forEach(function (feature) {
            if (typeof feature === "object" && feature !== null && typeof feature.getProperties === "function") {
                result.push(createGfiFeature(layer, url, feature));
            }
        });
    }

    // Create a merged feature because some themes might display multiple features at once
    if (result.length > 0 && layer && ["DataTable"].indexOf(layer.get("gfiTheme")) !== -1) {
        result = [createGfiFeature(layer, url, null, result)];
    }

    return result;
}

/**
 * returns a list of objects representing the features called by url
 * @param {Object} layer to show the properties of
 * @param {String} [layer.layerName] the name of the requesting layer
 * @param {String} [layer.gfiTheme] the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} [layer.attributesToShow] an object of attributes to show or a string "showAll" or "ignore"
 * @param {String} url the url to call the wms features from
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getHtmlFeature (layer, url) {
    if (typeof url !== "string") {
        return [];
    }

    return requestGfi("text/html", url).then(document => {
        return handleHTMLResponse(document, layer, url);
    });
}

/**
 * returns a list of objects representing the features called by url
 * @param {Object} document response from requestGFI, mimeType is "text/html"
 * @param {Object} layer to show the properties of
 * @param {String} url the url to call the wms features from
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function handleHTMLResponse (document, layer, url) {
    if (document !== null) {
        return [createGfiFeature(layer, url, null, null, document)];
    }
    return [];
}

/**
 * create an object representing a feature
 * @param {Object} layer to show the properties of
 * @param {String} [layer.layerName] the name of the requesting layer
 * @param {String} [layer.layerId] the id of the requesting layer
 * @param {String} [layer.gfiTheme] the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} [layer.attributesToShow] an object of attributes to show or a string "showAll" or "ignore"
 * @param {String} url the url to call the wms features from
 * @param {String|Object} [feature=null] the feature to get the id and the properties from
 * @param {?Object} [feature.properties] an object with the data of the feature as simple key/value pairs
 * @param {String} [feature.id=""] id the id of the feature
 * @param {Object[]} [features=null] a list of features
 * @param {String} [document=""] A html document as string with gfi content.
 * @returns {Object} an object{getTitle, getTheme, getAttributesToShow, getProperties, getId, getGfiUrl, getLayerId}
 */
export function createGfiFeature (layer, url = "", feature = null, features = null, document = "") {
    if (!layer) {
        return {};
    }
    return {
        getTitle: () => layer.get("name"),
        getTheme: () => layer.get("gfiTheme") || "defaultTheme",
        getAttributesToShow: () => layer.get("gfiAttributes"),
        getProperties: () => feature ? feature.getProperties() : {},
        getFeatures: () => features,
        getOlFeature: () => feature,
        getId: () => feature && typeof feature.getId === "function" ? feature.getId() : "",
        getGfiUrl: () => url,
        getMimeType: () => layer.get("infoFormat"),
        getLayerId: () => layer.get("id") ? layer.get("id") : "",
        getDocument: () => document
    };
}

export default {getWmsFeaturesByMimeType, openFeaturesInNewWindow, getXmlFeatures, createGfiFeature, handleXmlResponse, handleHTMLResponse};
