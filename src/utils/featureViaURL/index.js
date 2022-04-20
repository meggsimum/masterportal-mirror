import addGeoJSON from "../addGeoJSON.js";
import store from "../../app-store";
import {transform} from "masterportalapi/src/crs";

// All functions are exported, this is only for unit testing.
// Usually, you'll want to use the default export.

const gfiAttributes = {
        featureLabel: "",
        coordLabel: "",
        typeLabel: ""
    },
    layerIds = [];

/**
 * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
 * If another projection than "EPSG:4326" is configured, the coordinates get transformed according
 * to this projection, otherwise the features will not get displayed correctly.
 * @param {Object[]} features The features given by the user to be added to the map.
 * @param {String} geometryType Geometry type of the given features.
 * @param {Number} [epsg=4326] The EPSG-Code in which the features are coded.
 * @returns {Object} GeoJSON containing the features.
 */
export function createGeoJSON (features, geometryType, epsg = 4326) {
    const geoJSON = {
        type: "FeatureCollection",
        crs: {
            type: "link",
            properties: {
                href: "http://spatialreference.org/ref/epsg/" + epsg + "/proj4/",
                type: "proj4"
            }
        },
        features: []
    };
    let coordinates,
        featureJSON,
        flag = false;

    features.forEach(feature => {
        coordinates = epsg === 4326 ? feature.coordinates : transform("EPSG:" + epsg, "EPSG:4326", feature.coordinates);
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0 || !feature.label) {
            flag = true;
            return;
        }

        featureJSON = {
            type: "Feature",
            geometry: {
                type: geometryType,
                coordinates: coordinates
            },
            properties: {
                featureLabel: feature.label,
                coordLabel: coordinates,
                typeLabel: geometryType
            }
        };
        geoJSON.features.push(featureJSON);
    });

    if (flag) {
        console.warn(i18next.t("common:modules.featureViaURL.messages.featureParsing"));
    }

    return geoJSON;
}

/**
 * Gets the layer for the given layerId and extracts the Ids of the features.
 *
 * @param {String} layerId Unique Id of the layer in which the features reside.
 * @returns {String[]} Array of FeatureIds.
 */
export function getFeatureIds (layerId) {
    const featureArray = [],
        layer = Radio.request("Map", "getLayers").getArray().find(l => l.get("id") === layerId);

    if (typeof layer === "undefined") {
        console.warn(i18next.t("common:modules.featureViaURL.messages.layerNotFound"));
        return featureArray;
    }
    layer.getSource().getFeatures().forEach(feature => {
        featureArray.push(feature.getId());
    });
    return featureArray;
}

/**
 * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
 *
 * @param {Object[]} features The features given by the user to be added to the map.
 * @param {String} geometryType Geometry type of the given features.
 * @param {Number} [epsg=4326] The EPSG-Code in which the features are coded.
 * @returns {Object} GeoJSON containing the features.
 */
export default function ({layers, epsg, zoomTo}) {
    store.watch(state => state.urlParams, params => {
        const urlLayers = params.featureViaURL ? JSON.parse(params.featureViaURL) : [],
            treeType = Radio.request("Parser", "getTreeType");
        let features,
            geoJSON,
            geometryType,
            layerId,
            parentId = "tree",
            pos;

        if (treeType === "custom") {
            Radio.trigger("Parser", "addFolder", gfiAttributes.folderName, "featureViaURLFolder", "Overlayer", 0, true, "modules.featureViaURL.folderName");
            parentId = "featureViaURLFolder";
        }

        urlLayers.forEach(layer => {
            layerId = layer.layerId;
            features = layer.features;
            pos = layers.findIndex(element => element.id === layerId);
            if (pos === -1) {
                console.error(i18next.t("common:modules.featureViaURL.messages.layerNotFound", {layerId}));
                return;
            }
            if (!layers[pos].name) {
                console.error(i18next.t("common:modules.featureViaURL.messages.noNameDefined", {layerId}));
                return;
            }
            geometryType = layer.type !== undefined ? layer.type : layers[pos].geometryType;
            if (geometryType !== "LineString" && geometryType !== "Point" && geometryType !== "Polygon" && geometryType !== "MultiPoint" && geometryType !== "MultiLineString" && geometryType !== "MultiPolygon") {
                console.error(i18next.t("common:modules.featureViaURL.messages.geometryNotSupported"), {layerId, geometryType});
                return;
            }
            if (!features || !Array.isArray(features) || features.length === 0) {
                Radio.trigger("Alert", "alert", i18next.t("common:modules.featureViaURL.messages.featureParsingAll"));
                return;
            }
            geoJSON = createGeoJSON(features, geometryType, epsg);
            if (geoJSON.features.length === 0) {
                Radio.trigger("Alert", "alert", i18next.t("common:modules.featureViaURL.messages.featureParsingNoneAdded"));
            }
            layerIds.push(layerId);
            addGeoJSON(layers[pos].name, layers[pos].id, geoJSON, layers[pos].styleId, parentId, gfiAttributes);
            if (typeof zoomTo !== "undefined" && (zoomTo === layerId || zoomTo.indexOf(layerId) !== -1)) {
                Radio.trigger("Map", "zoomToFilteredFeatures", getFeatureIds(layerId), layerId);
            }
        });
    }, {deep: true, immediate: true});
}
