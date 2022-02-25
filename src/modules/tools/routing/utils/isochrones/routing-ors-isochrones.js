import axios from "axios";
import routingOrsAvoidOption from "../avoidoptions/routing-ors-avoidoptions";
import {RoutingIsochrones} from "../classes/routing-isochrones";
import {RoutingIsochronesArea} from "../classes/routing-isochrones-area";
import routingOrsSpeedProfile from "../speedprofiles/routing-ors-speedprofiles";
import state from "./../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Translates the optimization in the corresponding value for the service
 * @param {String} optimization set by the user
 * @returns {String} translated service value
 */
function routingOrsOptimization (optimization) {
    switch (optimization) {
        case "TIME": return "time";
        case "DISTANCE": return "distance";
        default: throw new Error("Missing rangeType translation");
    }
}

/**
 * Translates the optimization in the corresponding multiplicator value for the service
 * @param {String} optimization set by the user
 * @returns {Number} multiplicator for the specified optimization
 */
function routingOrsOptimizationMultiplicator (optimization) {
    switch (optimization) {
        case "TIME": return 60;
        case "DISTANCE": return 1000;
        default: throw new Error("Missing optimization to multiplicator translation");
    }
}

/**
 * Requests isochrones from ors service.
 * @param {Object} params for the function
 * @param {[Number, Number]} [params.coordinates] coordinates in wgs84 projection
 * @param {Function} [params.transformCoordinatesToLocal] function to transform result coordinates to local projection.
 * @param {String} [params.speedProfile] which is used to request the isochrones for.
 * @param {String} [params.optimization] which optimization to request
 * @param {{id: String}[]} [params.avoidSpeedProfileOptions] which options to avoid
 * @param {Boolean} [params.transformCoordinates] if the coordinates should be transformed to local projection
 * @returns {RoutingIsochrones} routingIsochrones
 */
async function fetchRoutingOrsIsochrones ({
    coordinates,
    transformCoordinatesToLocal,
    speedProfile,
    optimization,
    avoidSpeedProfileOptions,
    transformCoordinates
}) {

    const serviceUrl = store.getters.getRestServiceById(state.isochronesSettings.serviceId).url,
        url = `${serviceUrl}/v2/isochrones/${routingOrsSpeedProfile(speedProfile)}`,
        rangeValue = optimization === "TIME" ? state.isochronesSettings.timeValue : state.isochronesSettings.distanceValue,
        optimizationMultiplicator = routingOrsOptimizationMultiplicator(optimization),
        range = rangeValue * optimizationMultiplicator,
        interval = state.isochronesSettings.intervalValue * optimizationMultiplicator;
    let result = null,
        first = null,
        second = null,
        isochrones = null,
        response = null;

    try {
        response = await axios.post(url, {
            // 15 Min * 60 Sek || 15km * 1000m // interval steps
            interval,
            locations: [coordinates],
            // start || destination
            location_type: "start",
            range_type: routingOrsOptimization(optimization),
            // 30Min * 60 Sek || 30km * 1000m // maximum distance
            range: [range],
            options: {
                ...avoidSpeedProfileOptions.length > 0 && {avoid_features: avoidSpeedProfileOptions.map(o => routingOrsAvoidOption(o.id))}
            },

            area_units: "m",
            units: "m"
        });
    }
    catch (e) {
        throw new Error(i18next.t("common:modules.tools.routing.errors.errorIsochronesFetch"));
    }


    result = response.data;
    if (transformCoordinates) {
        first = await transformCoordinatesToLocal([
            result.bbox[0],
            result.bbox[1]
        ]);
        second = await transformCoordinatesToLocal([
            result.bbox[2],
            result.bbox[3]
        ]);
    }
    else {
        first = [
            result.bbox[0],
            result.bbox[1]
        ];
        second = [
            result.bbox[2],
            result.bbox[3]
        ];
    }

    isochrones = new RoutingIsochrones([first[0], first[1], second[0], second[1]]);
    for (let i = result.features.length - 1; i >= 0; i--) {
        const feature = result.features[i],
            localCoordinates = transformCoordinates ? [] : feature.geometry.coordinates[0];

        if (transformCoordinates) {
            for (const coordinate of feature.geometry.coordinates[0]) {
                localCoordinates.push(await transformCoordinatesToLocal(coordinate));
            }
        }
        isochrones.addArea(
            new RoutingIsochronesArea(
                [localCoordinates],
                feature.properties.group_index,
                feature.properties.value,
                range,
                interval,
                speedProfile,
                optimization,
                avoidSpeedProfileOptions.map(option => option.id),
                feature.properties.value / optimizationMultiplicator
            )
        );
    }
    return isochrones;
}

export {fetchRoutingOrsIsochrones};
