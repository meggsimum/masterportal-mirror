import mapCollection from "../../../maps/mapCollection";
import api from "@masterportal/masterportalapi/src/maps/api";
import store from "../../../../app-store";

export default {
    /**
     * Deactivates oblique mode and listens to change event to activate 3d mode.
     * @param {Object} param.dispatch the dispatch.
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @returns {void}
     */
    deactivateOblique ({dispatch}) {
        Radio.once("Map", "change", function (onceMapMode) {
            if (onceMapMode === "2D") {
                dispatch("activateMap3D");
            }
        });
        Radio.trigger("ObliqueMap", "deactivate");
    },
    /**
     * Activates the map3d if it not already set.
     * If mapmode is "Oblique" it deactivates it.
     * @param {Object} param store context.
     * @param {Object} param.getters the getters.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} param.commit the commit.
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    async activateMap3D ({getters, dispatch, commit}) {
        const mapMode = getters.mode;
        let map3D = mapCollection.getMap("3D"),
            scene;

        if (getters.is3D) {
            return;
        }
        else if (mapMode === "Oblique") {
            dispatch("deactivateOblique");
            return;
        }
        else if (!map3D) {
            let allLayerModels = Radio.request("ModelList", "getModelsByAttributes", {type: "layer"});

            Radio.trigger("Map", "beforeChange", "3D");
            allLayerModels = allLayerModels.filter(layerModel => {
                return ["Oblique", "TileSet3D", "Terrain3D"].indexOf(layerModel.get("typ")) === -1;
            });
            allLayerModels.forEach(layerWrapper => {
                if (layerWrapper.get("isSelected") === false) {
                    layerWrapper.removeLayer();
                }
            });

            map3D = await dispatch("createMap3D");
            mapCollection.addMap(map3D, "3D");
            scene = map3D.getCesiumScene();
            api.map.olcsMap.prepareScene({scene: scene, map3D: map3D, callback: (clickObject) => dispatch("clickEventCallback", clickObject)}, Config);
        }
        getters.getView.setZoom(7);
        map3D.setEnabled(true);
        commit("setMode", "3D");
        Radio.trigger("Map", "change", "3D");
        store.commit("Maps/setMode", "3D");
        store.dispatch("MapMarker/removePointMarker");
    },

    /**
     * Callback function for the 3D click event.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} param.getters the getters.
     * @param {Object} clickObject contains the attributes for the callback function .
     * @fires Core#RadioRequestMapClickedWindowPosition
     * @returns {void}
     */
    clickEventCallback ({dispatch, getters}, clickObject) {
        if (clickObject) {
            const extendedClickObject = Object.assign(clickObject, {map: getters.get2DMap});

            dispatch("updateClick", extendedClickObject);
            Radio.trigger("Map", "clickedWindowPosition", extendedClickObject);
        }
    },

    /**
     * Deactivates the 3d mode.
     * @param {Object} param store context.
     * @param {Object} param.commit the commit.
     * @param {Object} param.getters the getters.
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    deactivateMap3D ({commit, getters}) {
        const map3D = getters.get3DMap,
            view = getters.getView;
        let resolution,
            resolutions;

        if (map3D) {
            Radio.trigger("Map", "beforeChange", "2D");
            view.animate({rotation: 0}, () => {
                map3D.setEnabled(false);
                view.setRotation(0);
                resolution = view.getResolution();
                resolutions = view.getResolutions();
                if (resolution > resolutions[0]) {
                    view.setResolution(resolutions[0]);
                }
                if (resolution < resolutions[resolutions.length - 1]) {
                    view.setResolution(resolutions[resolutions.length - 1]);
                }
                commit("setMode", "2D");
                Radio.trigger("Map", "change", "2D");
            });
        }
    }
};
