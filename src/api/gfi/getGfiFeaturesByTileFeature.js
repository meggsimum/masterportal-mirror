import getComponent from "../../utils/getComponent";
import {createGfiFeature} from "./getWmsFeaturesByMimeType";

/**
 * gets an array of gfiFeatures for 3d tile features, using ./getWmsFeaturesByMimeType->createGfiFeature
 * can handle Cesium.Cesium3DTileFeature, Cesium.Cesium3DTilePointFeature, Cesium.Entity or primitive olFeature/olLayer
 * @param {Object} tileFeature anything that is expected to be a 3d tile feature
 * @returns {Object[]}  an array of objects; objects are generated using ./getWmsFeaturesByMimeType->createGfiFeature
 */
export function getGfiFeaturesByTileFeature (tileFeature) {
    if (tileFeature === null || typeof tileFeature !== "object") {
        return [];
    }
    const layerModel = getLayerModelFromTileFeature(tileFeature),
        result = [];

    if (isCesium3dTileFeature(tileFeature)) {
        const gfiFeature = getGfiFeatureByCesium3DTileFeature(tileFeature, layerModel ? layerModel.attributes : undefined);

        if (gfiFeature) {
            result.push(gfiFeature);
        }
    }
    else if (layerModel && tileFeature && tileFeature.primitive && tileFeature.primitive.olFeature) {
        const gfiFeatures = getGfiFeaturesByOlFeature(tileFeature.primitive.olFeature, layerModel.attributes);

        if (Array.isArray(gfiFeatures)) {
            gfiFeatures.forEach(singleFeature => {
                if (singleFeature) {
                    result.push(singleFeature);
                }
            });
        }
    }
    else if (layerModel && tileFeature && tileFeature.primitive && isCesiumEntity(tileFeature.primitive.id)) {
        const gfiFeature = getGfiFeatureByCesiumEntity(tileFeature, layerModel.attributes);

        if (gfiFeature) {
            result.push(gfiFeature);
        }
    }

    return result;
}


/**
 * checks if the given feature is of instance Cesium.Cesium3DTileFeature or Cesium.Cesium3DTilePointFeature
 * @param {*} feature anything to check
 * @returns {Boolean}  returns true if the feature is of instance Cesium.Cesium3DTileFeature or Cesium.Cesium3DTilePointFeature
 */
function isCesium3dTileFeature (feature) {
    return feature instanceof Cesium.Cesium3DTileFeature || feature instanceof Cesium.Cesium3DTilePointFeature;
}

/**
 * checks if the given entity is of instance Cesium.Entity
 * @param {*} entity anything to check
 * @returns {Boolean}  returns true if the entity is of instance Cesium.Entity
 */
function isCesiumEntity (entity) {
    return entity instanceof Cesium.Entity;
}

/**
 * create an object representing a feature
 * @param {Object} layerAttributes the attributes of the layer to set the feature with
 * @param {String} [layerAttributes.name="Buildings"] the name of the layer
 * @param {String} [layerAttributes.gfiTheme="buildings_3d"] the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} [layerAttributes.gfiAttributes] an object of attributes to show or a string "showAll" or "ignore"
 * @param {Object} properties an object with a key "attributes" or the data of the feature as simple key/value pairs
 * @param {Object} [properties.attributes] if set, the data of the feature as simple key/value pairs
 * @returns {Object}  an object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
 */
export function getGfiFeature (layerAttributes, properties) {
    const layerName = layerAttributes && layerAttributes.name ? layerAttributes.name : "common:modules.layerInformation.buildings",
        gfiTheme = layerAttributes && layerAttributes.gfiTheme ? layerAttributes.gfiTheme : "buildings_3d",
        attributesToShow = layerAttributes && layerAttributes.gfiAttributes ? layerAttributes.gfiAttributes : properties?.attributes,
        featureProperties = properties?.attributes ? properties.attributes : properties,

        layer = {
            get: (key) => {
                if (key === "name") {
                    return properties?.attributes?.Objektart ? properties.attributes.Objektart : layerName;
                }
                else if (key === "gfiTheme") {
                    return gfiTheme;
                }
                else if (key === "gfiAttributes") {
                    return attributesToShow;
                }
                return null;
            }
        },
        feature = {
            getProperties: () => {
                return featureProperties;
            }
        };

    return createGfiFeature(layer, "", feature);
}

/**
 * getter for layer model by tileFeature
 * @param {Object} tileFeature the feature as Cesium3DTileFeature, Cesium3DTilePointFeature, Cesium.Entity or olFeature (may be clustered)
 * @param {Function} [getModelByAttributesOpt=null] a function(filter) to get the model with (replaces Radio-Event; for testing only)
 * @param {Function} [isCesium3dTileFeatureOpt=null] a function(feature) to check if something is of instance Cesium.Cesium3DTileFeature or Cesium.Cesium3DTilePointFeature (for testing only)
 * @param {Function} [isCesiumEntityOpt=null] a function(entity) to check if something is of instance Cesium.Entity (for testing only)
 * @returns {(Object[]|undefined)}  a model that matches the attributes gotten by tileFeature or undefined
 */
export function getLayerModelFromTileFeature (tileFeature, getModelByAttributesOpt = null, isCesium3dTileFeatureOpt = null, isCesiumEntityOpt = null) {
    let filter = null;

    if (tileFeature === null || typeof tileFeature !== "object") {
        return undefined;
    }
    else if (
        typeof isCesium3dTileFeatureOpt === "function" ? isCesium3dTileFeatureOpt(tileFeature) : isCesium3dTileFeature(tileFeature)
        && typeof tileFeature.tileset === "object"
        && tileFeature?.tileset?.layerReferenceId
    ) {
        filter = {id: tileFeature.tileset.layerReferenceId};
    }
    else if (!tileFeature?.primitive || tileFeature.primitive === null || typeof tileFeature.primitive !== "object") {
        return undefined;
    }
    else if (tileFeature.primitive.olLayer) {
        filter = {id: tileFeature.primitive.olLayer.get("id")};
    }
    else if (typeof isCesiumEntityOpt === "function" ? isCesiumEntityOpt(tileFeature.primitive.id) : isCesiumEntity(tileFeature.primitive.id)) {
        filter = {id: tileFeature.primitive.id.layerReferenceId};
    }

    if (typeof getModelByAttributesOpt === "function") {
        return getModelByAttributesOpt(filter);
    }
    return getComponent(filter.id);
}

/**
 * creates a gfiFeature with the given tileFeature
 * @param {Object} tileFeature the Cesium3DTileFeature or Cesium3DTilePointFeature
 * @param {Object} attributes the attributes to use for the gfiFeature
 * @param {Function} [getGfiFeatureOpt=null] a function(attributes, properties) to get the gfiFeature with (instead of getGfiFeature; for testing only)
 * @returns {Object}  an object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
 */
export function getGfiFeatureByCesium3DTileFeature (tileFeature, attributes, getGfiFeatureOpt = null) {
    if (
        tileFeature === null
        || typeof tileFeature !== "object"
        || typeof tileFeature.getPropertyNames !== "function"
        || typeof tileFeature.getProperty !== "function"
        || !Array.isArray(tileFeature.getPropertyNames())
    ) {
        return undefined;
    }

    const properties = {};

    tileFeature.getPropertyNames().forEach(propertyName => {
        properties[propertyName] = tileFeature.getProperty(propertyName);
    });
    if (properties.attributes && properties.id) {
        properties.attributes.gmlid = properties.id;
    }

    if (typeof getGfiFeatureOpt === "function") {
        return getGfiFeatureOpt(attributes, properties);
    }
    return getGfiFeature(attributes, properties);
}

/**
 * creates a gfiFeature with the given tileFeature
 * @param {Object} tileFeature the Cesium.Entity
 * @param {Object} attributes the attributes to use for the gfiFeature
 * @param {Function} [getGfiFeatureOpt=null] a function(attributes, properties) to get the gfiFeature with (instead of getGfiFeature; for testing only)
 * @returns {Object}  an object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
 */
export function getGfiFeatureByCesiumEntity (tileFeature, attributes, getGfiFeatureOpt = null) {
    if (
        tileFeature === null
        || typeof tileFeature !== "object"
        || tileFeature.primitive === null
        || typeof tileFeature.primitive !== "object"
        || tileFeature.primitive.id === null
        || typeof tileFeature.primitive.id !== "object"
    ) {
        return undefined;
    }

    const properties = tileFeature.primitive.id.attributes;

    // useConfigName is only used intern in masterportal for translations
    delete properties.useConfigName;

    if (typeof getGfiFeatureOpt === "function") {
        return getGfiFeatureOpt(attributes, properties);
    }
    return getGfiFeature(attributes, properties);
}

/**
 * creates a gfiFeature from the given olFeature
 * @param {olFeature} olFeature the Feature to work with
 * @param {Object} attributes the attributes to use for the gfiFeature
 * @param {Function} [getGfiFeatureOpt=null] a function(attributes, properties) to get the gfiFeature with (instead of getGfiFeature; for testing only)
 * @returns {Object}  an object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
 */
export function getGfiFeatureByOlFeature (olFeature, attributes, getGfiFeatureOpt = null) {
    // do not confuse with getGfiFeaturesByOlFeature!
    if (
        olFeature === null
        || typeof olFeature !== "object"
        || typeof olFeature.getProperties !== "function"
        || typeof olFeature.getProperty !== "function"
        || !Array.isArray(olFeature.getProperties())
    ) {
        return undefined;
    }

    const properties = {};

    olFeature.getProperties().forEach(propertyName => {
        properties[propertyName] = olFeature.getProperty(propertyName);
    });

    if (typeof getGfiFeatureOpt === "function") {
        return getGfiFeatureOpt(attributes, properties);
    }
    return getGfiFeature(attributes, properties);
}

/**
 * creates a list of gfiFeatures (may be clustered) with the given olFeature
 * @param {olFeature} olFeature the Feature to work with as feature or clustered feature
 * @param {Object} attributes the attributes to use for the gfiFeature
 * @param {Function} [getGfiFeatureByOlFeatureOpt=null] a function(feature, attributes) to get the gfiFeature by olFeature with (instead of getGfiFeatureByOlFeature; for testing only)
 * @returns {Object[]}  an array of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
 */
export function getGfiFeaturesByOlFeature (olFeature, attributes, getGfiFeatureByOlFeatureOpt = null) {
    // do not confuse with getGfiFeatureByOlFeature!
    if (
        olFeature === null
        || typeof olFeature !== "object"
        || typeof olFeature.getProperties !== "function"
        || (typeof olFeature.getProperty !== "function" && typeof olFeature.get !== "function")
        || olFeature.getProperties() === null
        || typeof olFeature.getProperties() !== "object"
    ) {
        return undefined;
    }

    const result = [];

    if (Object.prototype.hasOwnProperty.call(olFeature.getProperties(), "features") && Array.isArray(olFeature.get("features"))) {
        // clustered feature
        olFeature.get("features").forEach(feature => {
            let gfiFeature = null;

            if (typeof getGfiFeatureByOlFeatureOpt === "function") {
                gfiFeature = getGfiFeatureByOlFeatureOpt(feature, attributes);
            }
            else {
                gfiFeature = getGfiFeatureByOlFeature(feature, attributes);
            }

            if (gfiFeature) {
                result.push(gfiFeature);
            }
        });
    }
    else {
        let gfiFeature = null;

        if (typeof getGfiFeatureByOlFeatureOpt === "function") {
            gfiFeature = getGfiFeatureByOlFeatureOpt(olFeature, attributes);
        }
        else {
            gfiFeature = getGfiFeatureByOlFeature(olFeature, attributes);
        }

        if (gfiFeature) {
            result.push(gfiFeature);
        }
    }

    return result;
}

export default {
    getGfiFeaturesByTileFeature,
    getGfiFeature,
    getLayerModelFromTileFeature,
    getGfiFeatureByCesium3DTileFeature,
    getGfiFeatureByCesiumEntity,
    getGfiFeatureByOlFeature,
    getGfiFeaturesByOlFeature
};

