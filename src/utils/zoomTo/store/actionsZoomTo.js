import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import getAndFilterFeatures from "../utils/getAndFilterFeatures";
import calculateExtent from "../../calculateExtent";
import createStyledFeatures from "../utils/createStyledFeatures";

const actions = {
    zoomToFeatures ({state, getters: {config, deprecatedParameters}, dispatch}) {
        let addFeatures = true,
            allowedValues, layerId, property, styleId, urlValues;

        if (config === null) {
            return false;
        }

        // NOTE(roehlipa): Everything included in the if-closure can be removed when the deprecated config parameters have been removed.
        //                 It might be useful to refactor this action slightly for version 3.0.0.
        if (deprecatedParameters) {
            console.warn("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            if (state.zoomToFeatureId === undefined && state.zoomToGeometry === undefined) {
                return new Promise(resolve => resolve("zoomTo: No url parameters were given by the user."));
            }
            // zoomToFeature
            if (Object.prototype.hasOwnProperty.call(config, "zoomToFeature") && state.zoomToFeatureId !== undefined) {
                layerId = config.zoomToFeature.wfsId;
                property = config.zoomToFeature.attribute;
                urlValues = (Array.isArray(state.zoomToFeatureId) ? state.zoomToFeatureId : [state.zoomToFeatureId]).map(value => String(value));
                styleId = config.zoomToFeature.styleId ? config.zoomToFeature.styleId : config.zoomToFeature.imgLink;

                if (Object.prototype.hasOwnProperty.call(config.zoomToFeature, "addFeatures")) {
                    addFeatures = config.zoomToFeature.addFeatures;
                }
            }
            // zoomToGeometry
            else if (Object.prototype.hasOwnProperty.call(config, "zoomToGeometry") && state.zoomToGeometry !== undefined) {
                layerId = config.zoomToGeometry.layerId;
                property = config.zoomToGeometry.attribute;
                urlValues = state.zoomToGeometry.split(",").map(value => value.toUpperCase().trim());
                allowedValues = config.zoomToGeometry.geometries;
            }
            else {
                return new Promise((_, reject) => reject("zoomTo: A mismatch between url parameters and configuration occurred."));
            }
            return getAndFilterFeatures(layerId, property, urlValues)
                .then(featureCollection => {
                    const extent = calculateExtent(
                        allowedValues === undefined
                            ? featureCollection
                            : featureCollection.filter(feature => allowedValues.includes(feature.get(property).toUpperCase().trim()))
                    );

                    if (addFeatures) {
                        dispatch("Maps/addLayer", new VectorLayer({
                            source: new VectorSource({
                                features: styleId === undefined
                                    ? featureCollection
                                    : createStyledFeatures(featureCollection, styleId)
                            })
                        }), {root: true});
                    }
                    return dispatch("Maps/zoomToExtent", {extent}, {root: true});
                })
                .catch(error => console.error("zoomTo: An error occurred while trying to fetch features from the given service.", error));
        }
        const featurePromises = config.map(conf => {
            const {id} = conf;

            if (state[id] === undefined) {
                return new Promise(resolve => resolve([]));
            }
            if (id === "zoomToFeatureId") {
                urlValues = (Array.isArray(state[id]) ? state[id] : [state[id]]).map(value => String(value));
                styleId = conf.styleId;
            }
            else if (id === "zoomToGeometry") {
                urlValues = state[id].split(",").map(value => value.toUpperCase().trim());
                allowedValues = conf.allowedValues.map(value => String(value));
                // zoom to bezirk by urlParameter ?zoomtogeometry=1, means zoom to 1. entry in allowedValues
                if (urlValues.length === 1 && allowedValues !== undefined && !allowedValues.includes(urlValues[0]) && parseInt(urlValues[0], 10) < allowedValues.length && parseInt(urlValues[0], 10) > 0) {
                    urlValues[0] = allowedValues[parseInt(urlValues[0], 10) - 1];
                }
            }
            else {
                return new Promise((_, reject) => reject(i18next.t("common:utils.parametricURL.zoomTo", {wrongConfigId: id})));
            }

            layerId = conf.layerId;
            property = conf.property;

            if (Object.prototype.hasOwnProperty.call(conf, "addFeatures")) {
                addFeatures = config.addFeatures;
            }

            return getAndFilterFeatures(layerId, property, urlValues)
                .then(featureCollection => {
                    let filteredFeatures = featureCollection;

                    if (allowedValues !== undefined) {
                        filteredFeatures = filteredFeatures.filter(feature => allowedValues.includes(feature.get(property).toUpperCase().trim()));
                    }
                    if (styleId) {
                        filteredFeatures = createStyledFeatures(filteredFeatures, styleId);
                    }
                    if (addFeatures && filteredFeatures.length > 0) {
                        dispatch("Maps/addLayer", new VectorLayer({
                            source: new VectorSource({features: filteredFeatures})
                        }), {root: true});
                    }
                    return new Promise(resolve => resolve(filteredFeatures));
                });
        });

        return Promise.allSettled(featurePromises)
            .then(results => {
                const features = results
                    .map(result => {
                        if (result.status === "fulfilled") {
                            return result.value;
                        }
                        dispatch("Alerting/addSingleAlert", result.reason, {root: true});
                        return [];
                    })
                    .flat(1);

                if (features.length > 0) {
                    return dispatch("Maps/zoomToExtent", {extent: calculateExtent(features)}, {root: true});
                }
                return console.warn("zoomTo: No features were found for the given layer.");
            })
            .catch(error => {
                console.error("zoomTo: An error occurred while trying to fetch features from one of the given services.", error);
            });
    }
};

export default actions;
