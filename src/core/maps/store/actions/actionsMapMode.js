import mapCollection from "../../../dataStorage/mapCollection";
import api from "masterportalAPI/src/maps/api";
import store from "../../../../app-store";
/**
 * Deactivates oblique mode and listens to change event to activate 3d mode.
 * @listens Core#RadioTriggerMapChange
 * @fires Core#RadioTriggerObliqueMapDeactivate
 * @returns {void}
 */
function deactivateOblique ({dispatch}) {
    Radio.once("Map", "change", function (onceMapMode) {
        if (onceMapMode === "2D") {
            dispatch("activateMap3D");
        }
    });
    Radio.trigger("ObliqueMap", "deactivate");
}
/**
 * Activates the map3d if it not already set.
 * If mapmode is "Oblique" it deactivates it.
 * @fires Core#RadioRequestMapGetMapMode
 * @fires Core#RadioTriggerMapBeforeChange
 * @fires Alerting#RadioTriggerAlertAlert
 * @fires Core#RadioTriggerMapChange
 * @returns {void}
 */
async function activateMap3D ({getters, dispatch, commit}) {
    const mapMode = getters.mode;
    let map3D = getters.get3DMap,
        scene,
        camera;

    if (Radio.request("Map", "isMap3d")) {
        return;
    }
    else if (mapMode === "Oblique") {
        deactivateOblique();
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
        api.map.olcsMap.prepareScene({scene: scene, map3D: map3D, callback: dispatch("clickEventCallback")}, Config);
        camera = api.map.olcsMap.prepareCamera(scene, store, map3D, Config, Cesium);
        camera.changed.addEventListener(dispatch("reactToCameraChanged"));
    }
    map3D.setEnabled(true);
    // Radio.trigger("Map", "change", "3D");
    commit("setMode", "3D");
    store.commit("Map/setMapId", map3D.id);
    store.commit("Map/setMapMode", "3D");
    store.dispatch("MapMarker/removePointMarker");
}

/**
 * Deactivates the 3d mode.
 * @fires Core#RadioRequestMapGetMap
 * @fires Core#RadioTriggerMapBeforeChange
 * @fires Alerting#RadioTriggerAlertAlert
 * @fires Core#RadioTriggerMapChange
 * @returns {void}
 */
function deactivateMap3D ({commit}) {
    const map3D = mapCollection.getMap("olcs", "3D"),
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
            // Radio.trigger("Map", "change", "2D");
            store.commit("Map/setMapId", map.get("id"));
            commit("setMode", "2D");
            store.commit("Map/setMapMode", "2D");
        });
    }
}
/**
 * Returns the mapmode. Oblique, 3D and 2D are available for selection.
 * @todo Refactor this function once the 3DMap and ObliqueMap have been migrated.
 * @returns {String} The current mapMode.
 */
function getMapMode () {
    if (Radio.request("ObliqueMap", "isActive")) {
        return "Oblique";
    }
    else if (Radio.request("Map", "isMap3d")) {
        return "3D";
    }
    return "2D";
}
export default {
    activateMap3D,
    deactivateMap3D,
    getMapMode,
    deactivateOblique
};


