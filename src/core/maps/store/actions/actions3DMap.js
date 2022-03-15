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
 * Reacts if the camera has changed.
 * @fires Core#RadioTriggerMapCameraChanged
 * @returns {void}
 */
function reactToCameraChanged () {
    // console.log(store.getters["Maps/get3DMap"])
    const camera = mapCollection.getMap("olcs", "3D").getCamera();

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
    store.dispatch("Maps/updateClick", {map3D: clickObject.map3D, position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
    store.dispatch("Map/updateClick", {map3D: clickObject.map3D, position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
    Radio.trigger("Map", "clickedWindowPosition", {position: clickObject.position, pickedPosition: clickObject.pickedPosition, coordinate: clickObject.coordinate, latitude: clickObject.latitude, longitude: clickObject.longitude, resolution: clickObject.resolution, originalEvent: clickObject.originalEvent, map: Radio.request("Map", "getMap")});
}

export default {
    createMap3D,
    clickEventCallback,
    reactToCameraChanged
};


