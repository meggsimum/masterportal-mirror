import actionsMapAttributesMapper from "./actionsMapAttributesMapper.js";
import actionsMapInteractions from "./actionsMapInteractions.js";
import actionsMapInteractionsZoomTo from "./actionsMapInteractionsZoomTo.js";
import actionsMapLayers from "./actionsMapLayers.js";
import actionsMapMode from "./actionsMapMode.js";
import highlightFeature from "./highlightFeature.js";
import findWhereJs from "../../../../utils/findWhereJs";

import api from "masterportalapi/src/maps/api";
import {getWmsFeaturesByMimeType} from "../../../../api/gfi/getWmsFeaturesByMimeType";
import getProxyUrl from "../../../../utils/getProxyUrl";

export default {

    /**
     * collects features for the gfi.
     *
     * @returns {void}
     */
    collectGfiFeatures ({getters, commit, dispatch}) {
        const {clickCoord, visibleWmsLayerListAtResolution, resolution, projection, gfiFeaturesAtPixel} = getters,
            gfiWmsLayerList = visibleWmsLayerListAtResolution.filter(layer => {
                return layer.get("gfiAttributes") !== "ignore";
            });

        Promise.all(gfiWmsLayerList.map(layer => {
            const gfiParams = {
                INFO_FORMAT: layer.get("infoFormat"),
                FEATURE_COUNT: layer.get("featureCount")
            };
            let url = layer.getSource().getFeatureInfoUrl(clickCoord, resolution, projection, gfiParams);

            // this part is needed if a Url contains a style which seems to mess up the getFeatureInfo call
            if (url.indexOf("STYLES") && url.indexOf("STYLES=&") === -1) {
                const newUrl = url.replace(/STYLES=.*?&/g, "STYLES=&");

                url = newUrl;
            }

            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            url = layer.get("useProxy") ? getProxyUrl(url) : url;

            return getWmsFeaturesByMimeType(layer, url);
        }))
            .then(gfiFeatures => {
                // only commit if features found
                if (gfiFeaturesAtPixel.concat(...gfiFeatures).length > 0) {
                    commit("setGfiFeatures", gfiFeaturesAtPixel.concat(...gfiFeatures));
                }
            })
            .catch(error => {
                console.warn(error);
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.gfi.errorMessage"), {root: true});
            });
    },
    /**
     * @description initializes view listeners and sets store values
     * @returns {void}
     */
    initView ({dispatch, getters, commit}) {
        const mapView = getters.getView,
            params = findWhereJs(mapView.get("options"), {resolution: mapView.getConstrainedResolution(mapView.getResolution())});

        // Listener for ol.View
        mapView.on("change:resolution", (evt) => {
            dispatch("changedResolutionCallback", evt);
        });
        mapView.on("change:center", function () {
            Radio.trigger("MapView", "changedCenter", mapView.getCenter());
            Radio.trigger("RemoteInterface", "postMessage", {"centerPosition": mapView.getCenter()});
        });


        if (document.getElementById("map") !== null) {
            dispatch("setBackground", document.getElementById("map").style.backgroundImage);
        }

        // triggers the function checkForScale modules\core\modelList\layer\model.js
        Radio.trigger("MapView", "changedOptions", params);
        commit("setScale", params.scale);
        // NOTE: used for scaleSwitcher-tutorial
        commit("setScales", {scales: mapView.get("options").map(option => option.scale)});
    },
    /**
     * @description is called when the view resolution is changed triggers the map view options
     * @param {ObjectEvent} evt - openlayers event object
     * @returns {void}
     */
    changedResolutionCallback ({commit, getters}, evt) {
        const mapViewTarget = evt.target,
            mapView = getters.getView,
            constrainResolution = mapView.getConstrainedResolution(mapViewTarget.get(evt.key)),
            params = findWhereJs(mapView.get("options"), {resolution: constrainResolution});

        Radio.trigger("MapView", "changedOptions", params);
        commit("setScale", params.scale);
        Radio.trigger("RemoteInterface", "postMessage", {"zoomLevel": mapView.getZoom()});
    },
    /**
     * Creates the olcesium  3D map.
     * @fires Core#RadioRequestMapGetMap
     * @returns {OLCesium} - ol cesium map.
     */
    createMap3D ({getters}) {
        return api.map.createMap({
            map2D: getters.get2DMap,
            shadowTime: function () {
                return this.time || Cesium.JulianDate.fromDate(new Date());
            }
        }, "3D");
    },
    ...actionsMapAttributesMapper,
    ...actionsMapInteractions,
    ...actionsMapInteractionsZoomTo,
    ...actionsMapLayers,
    ...actionsMapMode,
    ...highlightFeature
};
