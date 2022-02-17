import api from "masterportalAPI/src/maps/api";
import store from "../../../../app-store";
import mapCollection from "../../../dataStorage/mapCollection";

import OLCesium from "olcs/OLCesium.js";

/**
 * Setter for attribute "shadowTime".
 * @param {Cesium.JulianDate} time Shadow time in julian date format.
 * @returns {void}
 */
OLCesium.prototype.setShadowTime = function (time) {
    this.time = time;
};

/**
     * Checks if map in in 3d mode
     * @returns {Boolean} Flag if map is in 3d mode and enabled.
     */
OLCesium.prototype.isMap3d = function () {
    const map3D = Radio.request("Map", "getMap3d");

    return map3D && map3D.getEnabled();
};

/**
 * Cesium time function.
 * @returns {Cesium.JulianDate} - shadow time in julian date format.
 */
function shadowTime () {
    return this.time || Cesium.JulianDate.fromDate(new Date());
}
/**
 * Deactivates oblique mode and listens to change event to activate 3d mode.
 * @listens Core#RadioTriggerMapChange
 * @fires Core#RadioTriggerObliqueMapDeactivate
 * @returns {void}
 */
function deactivateOblique () {
    Radio.once("Map", "change", function (onceMapMode) {
        if (onceMapMode === "2D") {
            activateMap3D();
        }
    });
    Radio.trigger("ObliqueMap", "deactivate");
}
/**
 * Reacts if the camera has changed.
 * @fires Core#RadioTriggerMapCameraChanged
 * @returns {void}
 */
function reactToCameraChanged () {
    const camera = this.getCamera();

    Radio.trigger("Map", "cameraChanged", {"heading": camera.getHeading(), "altitude": camera.getAltitude(), "tilt": camera.getTilt()});
}
/**
 * Creates the olcesium  3D map.
 * @fires Core#RadioRequestMapGetMap
 * @returns {OLCesium} - ol cesium map.
 */
function createMap3D () {
    return api.map.createMap({
        map2D: mapCollection.getMap("ol", "2D"),
        shadowTime: shadowTime
    }, "3D");
}

/**
 * Callback function for the 3D click event.
 * @param {Object} clickObject contains the attributes for the callback function .
 * @fires Core#RadioRequestMapClickedWindowPosition
 * @fires Core#RadioRequestMapGetMap
 * @returns {void}
 */
function clickEventCallback (clickObject) {
    store.dispatch("Map/updateClick", {map3D: clickObject.map3D, position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
    Radio.trigger("Map", "clickedWindowPosition", {position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
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
export function activateMap3D () {
    const mapMode = Radio.request("Map", "getMapMode");
    let map3D = mapCollection.getMap("olcs", "3D"),
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

        map3D = createMap3D();
        mapCollection.addMap(map3D, "olcs", "3D");
        scene = map3D.getCesiumScene();
        api.map.olcsMap.prepareScene({scene: scene, map3D: map3D, callback: clickEventCallback}, Config);
        camera = api.map.olcsMap.prepareCamera(scene, store, map3D, Config, Cesium);
        camera.changed.addEventListener(reactToCameraChanged.bind(map3D));
    }
    map3D.setEnabled(true);
    Radio.trigger("Map", "change", "3D");
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
export function deactivateMap3D () {
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
            Radio.trigger("Map", "change", "2D");
            store.commit("Map/setMapId", map.get("id"));
            store.commit("Map/setMapMode", "2D");
        });
    }
}
