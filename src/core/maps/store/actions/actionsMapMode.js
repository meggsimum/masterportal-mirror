import api from "@masterportal/masterportalapi/src/maps/api";

let eventHandler;

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
     * @param {Object} param.rootState the rootState.
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    async activateMap3D ({getters, dispatch, commit, rootState}) {
        const mapMode = getters.mode;
        let map3D = mapCollection.getMap("3D");

        dispatch("unregisterListener", {type: "pointermove", listener: "updatePointer", listenerType: "dispatch"});
        dispatch("unregisterListener", {type: "click", listener: "updateClick", listenerType: "dispatch"});
        dispatch("unregisterListener", {type: "moveend", listener: "updateAttributes", listenerType: "dispatch"});
        if (getters.is3D) {
            return;
        }
        else if (mapMode === "Oblique") {
            dispatch("deactivateOblique");
            return;
        }
        else if (!map3D) {
            const zoomLevelmap2D = getters.getView.getZoom();
            let allLayerModels = Radio.request("ModelList", "getModelsByAttributes", {type: "layer"});

            if (zoomLevelmap2D > getters.changeZoomLevel["3D"]) {
                commit("setChangeZoomLevel", {
                    "2D": zoomLevelmap2D,
                    "3D": zoomLevelmap2D
                });
            }
            Radio.trigger("Map", "beforeChange", "3D");
            allLayerModels = allLayerModels.filter(layerModel => {
                return ["Oblique", "TileSet3D", "Terrain3D", "Entities3D"].indexOf(layerModel.get("typ")) === -1;
            });
            allLayerModels.forEach(layerWrapper => {
                if (layerWrapper.get("isSelected") === false && Radio.request("Parser", "getTreeType") === "light") {
                    layerWrapper.removeLayer();
                }
            });

            map3D = await dispatch("createMap3D");
            mapCollection.addMap(map3D, "3D");
            api.map.olcsMap.handle3DEvents({scene: map3D.getCesiumScene(), map3D: map3D, callback: (clickObject) => dispatch("clickEventCallback", Object.freeze(clickObject))});
        }
        if (typeof rootState.urlParams.altitude === "undefined" && typeof Config?.cesiumParameter?.camera?.altitude === "undefined") {
            // only zoom,if no altitude is given by url params or config, else altitude has no effect
            dispatch("controlZoomLevel", {currentMapMode: mapMode, targetMapMode: "3D"});
        }
        map3D.setEnabled(true);
        commit("setMode", "3D");
        Radio.trigger("Map", "change", "3D");
        dispatch("MapMarker/removePointMarker", null, {root: true});
        eventHandler = new Cesium.ScreenSpaceEventHandler(map3D.getCesiumScene().canvas);
        eventHandler.setInputAction((evt) => dispatch("updatePointer", evt), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    /**
     * Controls the zoom level when switching the map mode.
     * The last zoom level of a map mode is kept.
     * @param {Object} param store context.
     * @param {Object} param.getters the getters.
     * @param {String} targetMapMode Map mode to which is switched.
     * @returns {void}
     */
    controlZoomLevel ({getters, commit}, {currentMapMode, targetMapMode}) {
        const view = getters.getView,
            changeZoomLevel = {...getters.changeZoomLevel};

        changeZoomLevel[currentMapMode] = view.getZoom();
        view.setZoom(changeZoomLevel[targetMapMode]);
        commit("setChangeZoomLevel", changeZoomLevel);
    },

    /**
     * Callback function for the 3D click event.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} clickObject contains the attributes for the callback function .
     * @returns {void}
     */
    clickEventCallback ({dispatch}, clickObject) {
        if (clickObject) {
            dispatch("updateClick", clickObject);
            Radio.trigger("Map", "clickedWindowPosition", clickObject);
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
    deactivateMap3D ({commit, getters, dispatch}) {
        const map3D = mapCollection.getMap("3D");

        if (map3D) {
            const view = getters.getView;

            eventHandler.destroy();
            dispatch("registerListener", {type: "pointermove", listener: "updatePointer", listenerType: "dispatch"});
            dispatch("registerListener", {type: "click", listener: "updateClick", listenerType: "dispatch"});
            dispatch("registerListener", {type: "moveend", listener: "updateAttributes", listenerType: "dispatch"});
            Radio.trigger("Map", "beforeChange", "2D");
            view.animate({rotation: 0}, () => {
                map3D.setEnabled(false);
                view.setRotation(0);
                Radio.trigger("Map", "change", "2D");
                dispatch("controlZoomLevel", {currentMapMode: getters.mode, targetMapMode: "2D"});
                commit("setMode", "2D");
            });
        }
    }
};
