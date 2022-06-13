import {translate} from "./translator";
import {deepAssignIgnoreCase} from "../deepAssign";
import {doSpecialBackboneHandling, triggerParametricURLReady, translateToBackbone} from "./ParametricUrlBridge";
import store from "../../app-store";
import {transformToMapProjection} from "@masterportal/masterportalapi/src/crs";
import highlightFeaturesByAttribute from "../../api/highlightFeaturesByAttribute";

/**
 * Searches for the keys in state and if found, sets the value at it.
 * @param {Object} state vuex state
 * @param {Array} keySplitted keys of the url param as array
 * @param {String} value of the url param
 * @param {boolean} found=false true, if keys found in state
 * @returns {boolean} true, if keys found in state
 */
function searchAndSetValue (state, keySplitted, value, found = false) {
    let foundInState = found,
        vuexState = state;

    if (Array.isArray(keySplitted)) {
        if (vuexState[keySplitted[0]]) {
            const source = makeObject(keySplitted, value),
                newState = deepAssignIgnoreCase(state, source);

            if (newState) {
                foundInState = true;
                vuexState = newState;
            }
        }
        else {
            foundInState = inspectStateForTools(vuexState, keySplitted, value);
        }
    }
    return foundInState;
}

/**
 * If param key does not contain 'Tools', but contains 'active' tool ist activated by state.
 * @param {Object} vuexState vuex state
 * @param {Array} keySplitted keys of the url param as array
 * @param {String} value of the url param
 * @returns {boolean} true, if keys found in state
 */
function inspectStateForTools (vuexState, keySplitted, value) {
    const tool = vuexState.Tools ? Object.keys(vuexState.Tools).find(toolName=>toolName.toLowerCase() === keySplitted[0].toLowerCase()) : null;
    let foundInState = false;

    if (tool) {
        keySplitted[0] = tool;
        keySplitted.unshift("Tools");
        if (!keySplitted.find(key=>key.toLowerCase() === "active")) {
            keySplitted.push("active");
        }
        deepAssignIgnoreCase(vuexState, makeObject(keySplitted, value === "" ? true : value));
        foundInState = true;
    }
    return foundInState;
}
/**
 * Creates an object from an array and sets the value at it.
 * @param {Array} keys to make an object from
 * @param {*} value to set at object
 * @returns {Object} the produced object or empty if no keys are given
 */
function makeObject (keys, value) {
    if (keys) {
        return keys.reverse().reduce((a, c)=>({[c]: a}), value);
    }
    return {};
}

/**
 * Calls muatations, if necessary.
 * @param {Object} state vuex state
 * @returns {void}
 */
function callMutations (state) {
    if (state.urlParams["Maps/center"]) {
        let centerCoords = state.Maps.center;

        if (state.urlParams.projection !== undefined) {
            centerCoords = transformToMapProjection(mapCollection.getMap(state.Maps.mode), state.urlParams.projection, centerCoords);
        }
        store.commit("Maps/setInitialCenter", centerCoords);
        store.dispatch("Maps/setCenter", centerCoords);
    }
}
/**
 * Calls actions, if necessary.
 * @param {Object} state vuex state
 * @returns {void}
 */
function callActions (state) {
    if (state.urlParams["MapMarker/coordinates"]) {
        let coordinates = state.MapMarker.coordinates;

        if (state.urlParams.projection !== undefined) {
            coordinates = transformToMapProjection(mapCollection.getMap(state.Maps.mode), state.urlParams.projection, coordinates);
        }
        setTimeout(() => {
            store.dispatch("MapMarker/placingPointMarker", coordinates);
        }, 500);
    }
    if (typeof state.urlParams["Maps/zoomLevel"] === "number") {
        store.commit("Maps/setInitialZoomLevel", state.urlParams["Maps/zoomLevel"]);
        store.dispatch("Maps/setZoomLevel", state.urlParams["Maps/zoomLevel"]);
        store.commit("Maps/setInitialResolution", store.getters["Maps/getView"].getResolution());
    }
    if ((Object.prototype.hasOwnProperty.call(state.ZoomTo, "zoomToGeometry") && state.ZoomTo.zoomToGeometry !== undefined) || (Object.prototype.hasOwnProperty.call(state.ZoomTo, "zoomToFeatureId") && state.ZoomTo.zoomToFeatureId !== undefined)) {
        store.dispatch("ZoomTo/zoomToFeatures");
    }

    if (state.urlParams["api/highlightFeaturesByAttribute"]) {
        const propName = state.urlParams?.attributeName,
            propValue = state.urlParams?.attributeValue,
            queryType = state.urlParams?.attributeQuery,
            wfsId = state.urlParams?.wfsId;

        if (propName && propValue && wfsId) {
            highlightFeaturesByAttribute.highlightFeaturesByAttribute(store.dispatch, wfsId, propName, propValue, queryType);
        }
        else {
            console.warn("Not all required URL parameters given for highlightFeaturesByAttribute.");
        }
    }
}
/**
 * Sets the url params at state and produces desired reaction.
 * @param {Object} state vuex state
 * @param {URLSearchParams} params an instance of URLSearchParams
 *  @returns {void}
 */
export async function setValuesToState (state, params) {
    await params.forEach(async (value, key) => setValueToState(state, key, value));

    triggerParametricURLReady();
    Object.keys(state.urlParams).forEach(key => {
        const value = state.urlParams[key];

        doSpecialBackboneHandling(key, value);
    });

    callMutations(state);
    callActions(state);
}

/**
 * Sets the given key and value to state.
 * @param {Object} state vuex state
 * @param {String} key of the url param
 * @param {String} value of the url param
 * @returns {void}
 */
export async function setValueToState (state, key, value) {
    if (typeof key === "string") {
        translate(key.trim(), value).then(entry => {
            const found = searchAndSetValue(state, entry.key.split("/"), entry.value);

            if (!found) {
                const oldParam = translateToBackbone(entry.key, entry.value);

                if (oldParam) {
                    const stateEntry = state.urlParams[oldParam.key];

                    if (!stateEntry || typeof stateEntry === "string" && stateEntry.toLowerCase().indexOf(oldParam.value.toLowerCase()) === -1) {
                        if (stateEntry) {
                            // e.g. isinitopen shall contain comma-separated ids of tools
                            state.urlParams[oldParam.key] = oldParam.value + "," + state.urlParams[oldParam.key];
                        }
                        else {
                            state.urlParams[oldParam.key] = oldParam.value;
                        }
                    }
                }
            }
            if (entry.key === "Maps/zoomToGeometry" || entry.key === "Maps/zoomToFeatureId") {
                state.ZoomTo[entry.key.substring(5)] = entry.value;
            }
            else {
                state.urlParams[entry.key] = entry.value;
            }
            return entry;
        }).catch(error => {
            console.warn("Error occured during applying url param to state ", error);
        });
    }
}

/**
  * Checks if the query contains html content, if so it is not valid.
  * @param {string} query The URL-Parameters
  * @return {boolean} triue, if the query is valid
  */
export function checkIsURLQueryValid (query) {
    return !(/(<([^>]+)>)/g).test(decodeURIComponent(query));
}

