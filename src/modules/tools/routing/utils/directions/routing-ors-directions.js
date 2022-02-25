import axios from "axios";
import state from "./../../store/stateRouting";
import store from "../../../../../app-store";
import {RoutingDirections} from "../classes/routing-directions";
import {RoutingDirectionsStep} from "../classes/routing-directions-step";
import {RoutingDirectionsSegment} from "../classes/routing-directions-segment";
import routingOrsSpeedProfile from "../speedprofiles/routing-ors-speedprofiles";
import routingOrsAvoidOption from "../avoidoptions/routing-ors-avoidoptions";

/**
 * Translates the Preference in the corresponding value for the service
 * @param {String} preference set by the user
 * @returns {String} translated service value
 */
function routingOrsPreference (preference) {
    switch (preference) {
        case "RECOMMENDED": return "recommended";
        case "SHORTEST": return "shortest";
        default: throw new Error("Fehlende Preference Übersetzung");
    }
}

/**
 * Requests directions from ors service.
 * @param {Object} params parameter
 * @param {[Number, Number]} [params.coordinates] in wgs84 projection
 * @param {String} [params.language] to request the instructions in local language.
 * @param {Function} [params.transformCoordinatesToLocal] function to transform result coordinates to local projection.
 * @param {String} [params.speedProfile] to request the directions with
 * @param {{id: String}[]} [params.avoidSpeedProfileOptions] options to avoid
 * @param {String} [params.preference] to request the directions with
 * @param {Object} [params.avoidPolygons] areas to avoid when requesting directions
 * @param {Boolean} [params.instructions] if the instructions should be requested
 * @returns {RoutingDirections} routingDirections
 */
async function fetchRoutingOrsDirections ({
    coordinates,
    language,
    transformCoordinatesToLocal,
    speedProfile,
    avoidSpeedProfileOptions,
    preference,
    avoidPolygons,
    instructions
}) {
    const serviceUrl = store.getters.getRestServiceById(state.directionsSettings.serviceId).url,
        url = `${serviceUrl}/v2/directions/${routingOrsSpeedProfile(speedProfile)}/geojson`;
    let result = null,
        feature = null,
        first = null,
        second = null,
        localCoordinates = null,
        direction = null,
        response = null;

    try {
        response = await axios.post(url, {
            coordinates: coordinates,
            language: language,
            options: {
                ...avoidSpeedProfileOptions.length > 0 && {avoid_features: avoidSpeedProfileOptions.map(o => routingOrsAvoidOption(o.id))},
                avoid_polygons: avoidPolygons
            },
            preference: routingOrsPreference(preference),
            units: "m",
            geometry: true,
            instructions: instructions
        });
    }
    catch (e) {
        if (e.response.status === 404) {
            throw new Error(i18next.t("common:modules.tools.routing.errors.noRouteFound"));
        }
        if (e.response && e.response.data && e.response.data.error) {
            if (e.response.data.error.code === 2003) {
                throw new Error(i18next.t("common:modules.tools.routing.errors.avoidAreaBig"));
            }
        }
        throw new Error(i18next.t("common:modules.tools.routing.errors.errorRouteFetch"));
    }

    result = response.data;
    feature = result.features[0];
    first = await transformCoordinatesToLocal([
        feature.bbox[0],
        feature.bbox[1]
    ]);
    second = await transformCoordinatesToLocal([
        feature.bbox[2],
        feature.bbox[3]
    ]);
    localCoordinates = [];

    for (const coords of feature.geometry.coordinates) {
        localCoordinates.push(await transformCoordinatesToLocal(coords));
    }
    direction = new RoutingDirections({
        bbox: [first[0], first[1], second[0], second[1]],
        lineString: localCoordinates,
        distance: feature.properties.summary.distance,
        duration: feature.properties.summary.duration,
        lineStringWaypointIndex: feature.properties.way_points
    });

    if (feature.properties.segments) {
        // One Segment represents directions from one waypoint to another
        for (const segment of feature.properties.segments) {
            const directionSegment = new RoutingDirectionsSegment({
                distance: segment.distance,
                duration: segment.duration,
                steps: []
            });

            for (const step of segment.steps) {
                directionSegment.steps.push(
                    new RoutingDirectionsStep({
                        distance: step.distance,
                        duration: step.duration,
                        instruction: step.instruction,
                        name: step.name,
                        type: step.type,
                        waypoints: step.way_points
                    })
                );
            }
            direction.segments.push(directionSegment);
        }
    }
    return direction;
}

export {fetchRoutingOrsDirections};
