import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "./../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from BKG
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingBkgGeosearch (search) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        url = `${serviceUrl}?count=${state.geosearch.limit}&properties=text`,
        parameter = `&query=${encodeURIComponent(search)}`,
        response = await axios.get(url + parameter);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.features.map(d => parseRoutingBkgGeosearchResult(d));
}

/**
 * Requests POI at coordinate from BKG
 * @param {[Number, Number]} coordinates to search at
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
async function fetchRoutingBkgGeosearchReverse (coordinates) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearchReverse.serviceId).url,
        filterQuery = "&filter=" + (state.geosearchReverse.filter ? state.geosearchReverse.filter : "typ:ort"),
        url = `${serviceUrl}?lon=${coordinates[0]}&lat=${coordinates[1]}&count=1&properties=text&distance=${state.geosearchReverse.distance}${filterQuery}`,
        response = await axios.get(url);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return parseRoutingBkgGeosearchResult(response.data.features[0]);
}

/**
 * Parses Response from Bkg to RoutingGeosearchResult
 * @param {Object} geosearchResult from BKG
 * @param {Object} [geosearchResult.geometry] geosearchResult geometry
 * @param {[Number, Number]} [geosearchResult.geometry.coordinates] geosearchResult geometry coordinates
 * @param {Object} [geosearchResult.properties] geosearchResult properties
 * @param {String} [geosearchResult.properties.text] geosearchResult properties text
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingBkgGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        Number(geosearchResult.geometry.coordinates[1]),
        Number(geosearchResult.geometry.coordinates[0]),
        geosearchResult.properties.text
    );
}

export {fetchRoutingBkgGeosearch, fetchRoutingBkgGeosearchReverse};
