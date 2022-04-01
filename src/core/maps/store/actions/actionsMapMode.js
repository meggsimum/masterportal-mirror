import mapCollection from "../../../dataStorage/mapCollection";
import api from "masterportalapi/src/maps/api";
import store from "../../../../app-store";

/**
 * Callback function for the 3D click event.
 * @param {Object} clickObject contains the attributes for the callback function .
 * @fires Core#RadioRequestMapClickedWindowPosition
 * @fires Core#RadioRequestMapGetMap
 * @returns {void}
 */
function clickEventCallback (clickObject) {
    store.dispatch("Maps/updateClick", {map3D: clickObject.map3D, position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
    Radio.trigger("Map", "clickedWindowPosition", {position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
}

export default {
    /**
     * Deactivates oblique mode and listens to change event to activate 3d mode.
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

        if (Radio.request("Map", "isMap3d")) {
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
            await mapCollection.addMap(map3D, "olcs", "3D");
            scene = map3D.getCesiumScene();
            api.map.olcsMap.prepareScene({scene: scene, map3D: map3D, callback: clickEventCallback}, Config);
        }
        map3D.setEnabled(true);
        commit("setMode", "3D");
        Radio.trigger("Map", "change", "3D");
        store.commit("Map/setMapId", map3D.id);
        store.commit("Map/setMapMode", "3D");
        store.dispatch("MapMarker/removePointMarker");
    },

    /**
     * Deactivates the 3d mode.
     * @fires Core#RadioRequestMapGetMap
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    deactivateMap3D ({commit}) {
        const map3D = mapCollection.getMap("3D"),
            map = Radio.request("Map", "getMap"),
            view = map.getView();
        let resolution,
            resolutions;

        if (map3D) {
            Radio.trigger("Map", "beforeChange", "2D");
            view.animate({rotation: 0}, function () {
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
                Radio.trigger("Alert", "alert:remove");
                commit("setMode", "2D");
                Radio.trigger("Map", "change", "2D");
            });
        }
    }
};
