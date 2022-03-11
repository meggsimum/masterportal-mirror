import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import {GeoJSON, GPX} from "ol/format.js";
import convertFeaturesToKml from "../../../../../../src/utils/convertFeaturesToKml.js";

import {transform, transformPoint, transformGeometry} from "../../utils/download/transformGeometry";

/**
 * Converts the features from OpenLayers Features to features in the chosen format.
 *
 * @param {module:ol/format} format Format in which the features should be saved.
 * @returns {string} The features written in the chosen format as a String.
 */
async function convertFeatures ({state, dispatch}, format) {
    const convertedFeatures = [];

    for (const feature of state.download.features) {
        const cloned = feature.clone(),
            transCoords = await dispatch("transformCoordinates", cloned.getGeometry());

        if (transCoords.length === 3 && transCoords[2] === 0) {
            transCoords.pop();
        }

        cloned.getGeometry().setCoordinates(transCoords, "XY");
        convertedFeatures.push(cloned);
    }

    return format.writeFeatures(convertedFeatures);
}

/**
 * Resets values to hide the UI for the Download and not cause side effects while doing so.
 *
 * @returns {void}
 */
function fileDownloaded ({state, commit}) {
    commit("setDownloadSelectedFormat", state.download.selectedFormat);
}

/**
 * Converts the features to the chosen format and saves it in the state.
 *
 * @returns {void}
 */
async function prepareData ({state, commit, dispatch}) {
    let features = "";

    switch (state.download.selectedFormat) {
        case "GEOJSON":
            features = await dispatch("convertFeatures", new GeoJSON());
            break;
        case "GPX":
            features = await dispatch("convertFeatures", new GPX());
            break;
        case "KML":
            features = await convertFeaturesToKml(state.download.features);
            break;
        case "none":
            commit("setDownloadSelectedFormat", "");
            break;
        default:
            break;
    }

    commit("setDownloadDataString", features);
}

/**
 * Prepares the download.
 * If the user is using Internet Explorer as a Browser a Blob is used, otherwise the download is accomplished through the href & download combo on an anchor tag.
 *
 * @returns {void}
 */
function prepareDownload ({state, commit, dispatch}) {
    dispatch("validateFileName").then(fileName => {
        if (fileName && fileName !== "") {
            const dataString = state.download.dataString,
                isIE = Radio.request("Util", "isInternetExplorer");

            commit("setDownloadFile", fileName);

            if (isIE) {
                window.navigator.msSaveOrOpenBlob(new Blob([dataString]), fileName);
            }
            else {
                const url = `data:text/plain;charset=utf-8,${encodeURIComponent(dataString)}`;

                commit("setDownloadFileUrl", url);
            }
        }
    }).catch(err => {
        console.error(err);
    });
}

/**
 * Commits the current features of the draw layer to the state.
 * Action is dispatched when a feature is drawn, edited or deleted.
 * NOTE: When a feature is an instance of ol/Circle, it is converted to a ol/Polygon first.
 *
 * @returns {void}
 */
function setDownloadFeatures ({state, commit, dispatch, rootGetters}) {
    const downloadFeatures = [],
        drawnFeatures = state.layer.getSource().getFeatures();

    drawnFeatures.forEach(drawnFeature => {
        const feature = drawnFeature.clone(),
            geometry = feature.getGeometry();

        // If the feature is invisible from filter, the style will be reset by printing.
        if (!feature.get("isVisible") && feature.get("invisibleStyle")) {
            feature.setStyle(feature.get("invisibleStyle"));
        }

        if (geometry instanceof Circle) {
            feature.set("isGeoCircle", true);
            transformGeometry(rootGetters["Map/projection"], geometry);
            feature.set("geoCircleCenter", geometry.getCenter().join(","));
            feature.set("geoCircleRadius", geometry.getRadius());
            feature.setGeometry(fromCircle(geometry));
        }

        downloadFeatures.push(feature);
    });

    commit("setDownloadFeatures", downloadFeatures);
    dispatch("prepareData");
    dispatch("prepareDownload");
}

/**
 * Commits the input of the user for the name of the file to the state.
 * If at least one feature is already drawn, the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Event} event Event fired by changing the input for the name of the file.
 * @param {HTMLInputElement} event.currentTarget The HTML input element for the name of the file.
 * @returns {void}
 */
function setDownloadFileName ({state, commit, dispatch}, {currentTarget}) {
    const {value} = currentTarget;

    commit("setDownloadFileName", value);

    if (state.layer.getSource().getFeatures().length > 0) {
        dispatch("prepareDownload");
    }
}

/**
 * Commits the selection of the user for file format to the state.
 * If at least one feature is already drawn, they are converted to the chosen format and the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Event} event Event fired by selecting a different element.
 * @param {String} value The selected option value from dropdown or pre selected value.
 * @returns {void}
 */
async function setDownloadSelectedFormat ({state, commit, dispatch}, value) {

    commit("setDownloadSelectedFormat", value);
    if (state.layer.getSource().getFeatures().length > 0) {
        await dispatch("prepareData");
        dispatch("prepareDownload");
    }
}

/**
 * Transforms the given geometry from EPSG:25832 to EPSG:4326.
 * If the geometry is not an instance of ol/LineString, ol/Point or ol/Polygon an Alert is send to the user.
 *
 * @param {module:ol/geom/Geometry} geometry Geometry to be transformed.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)|[]} The transformed Geometry or an empty array.
 */
function transformCoordinates ({dispatch, rootGetters}, geometry) {
    const coords = geometry.getCoordinates(),
        type = geometry.getType();

    switch (type) {
        case "LineString":
            return transform(rootGetters["Map/projectionCode"], coords, false);
        case "Point":
            return transformPoint(rootGetters["Map/projectionCode"], coords);
        case "Polygon":
            return transform(rootGetters["Map/projectionCode"], coords, true);
        default:
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.unknownGeometry", {geometry: type}), {root: true});
            return [];
    }
}

/**
 * Checks whether the user has added the suffix of the chosen format to the filename and if not, it is added.
 *
 * @returns {String} Returns the filename including the suffix of the chosen format; returns and empty String if either the filename or the format has not been chosen yet.
 */
function validateFileName ({state}) {
    const {fileName, selectedFormat} = state.download;

    if (fileName.length > 0 && selectedFormat.length > 0) {
        const suffix = `.${selectedFormat.toLowerCase()}`;

        return fileName.toLowerCase().endsWith(suffix) ? fileName : fileName + suffix;
    }
    return "";
}

export {
    convertFeatures,
    fileDownloaded,
    prepareData,
    prepareDownload,
    setDownloadFeatures,
    setDownloadFileName,
    setDownloadSelectedFormat,
    transformCoordinates,
    validateFileName
};
