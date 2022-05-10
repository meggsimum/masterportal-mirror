
import {transformFromMapProjection} from "@masterportal/masterportalapi/src/crs";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import coordState from "./stateCoordToolkit";

const getters = {
    ...generateSimpleGetters(coordState),

    // NOTE overwrite getters here if you need a special behaviour in a getter

    /**
     * Transforms the projection.
     * @param {Object} state state of this tool
     * @param {Object} map the map
     * @param {Object} targetProjection the target projection
     * @returns {Object} the transformed projection
     */
    getTransformedPosition: state => (map, targetProjection) => {
        let positionTargetProjection = [0, 0];

        if (state.positionMapProjection !== null && state.positionMapProjection.length > 0) {
            positionTargetProjection = transformFromMapProjection(
                map,
                targetProjection,
                [...state.positionMapProjection]
            );
        }
        return positionTargetProjection;
    },
    /**
     * Returns the projection to the given id.
     * @param {Object} state state of this tool
     * @param {String} id of the projection, is like the name and in case of decimal "-DG" is appended to name
     * @returns {Object} projection
     */
    getProjectionById: state => (id) => {
        const projections = state.projections;

        return projections.find(projection => {
            return projection.id === id;
        });
    },
    /**
     * Returns true to easting coordinate error variable if one test case fails.
     * @param {Object} state state of this tool
     * @returns {Boolean} true if an error for the coordinate occurs
     */
    getEastingError: state => {
        return Boolean(state.eastingNoCoord || state.eastingNoMatch);
    },
    /**
     * Returns true to northing coordinate error variable if one test case fails.
     * @param {Object} state state of this tool
     * @returns {Boolean} true if an error for the coordinate occurs
     */
    getNorthingError: state => {
        return Boolean(state.northingNoCoord || state.northingNoMatch);
    },
    /**
     * Returns the label name depending on the selected coordinate system.
     * @param {Object} state state of this tool
     * @param {String} key in the language files
     * @returns {String} the name of the label
     */
    getLabel: (state) => (key) => {
        const type = state.currentProjection?.projName !== "longlat" ? "cartesian" : "hdms";

        return "modules.tools.coordToolkit." + type + "." + key;
    }
};

export default getters;
