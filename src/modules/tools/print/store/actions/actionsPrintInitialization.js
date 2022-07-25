
import {DEVICE_PIXEL_RATIO} from "ol/has.js";
import thousandsSeparator from "../../../../../utils/thousandsSeparator.js";
import Canvas from "./../../utils/buildCanvas";
import BuildSpec from "./../../utils/buildSpec";
import getVisibleLayer from "./../../utils/getVisibleLayer";
import {createEmpty, extendCoordinate} from "ol/extent.js";
import {apply as applyTransform} from "ol/transform.js";

let lastPrintedExtent;

/**
 * Return last printed extent
 * @returns {Extent} OL extent
 */
export function getLastPrintedExtent () {
    return lastPrintedExtent;
}

export default {
    /**
     * Gets the capabilities for a specific print configuration
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    retrieveCapabilites: function ({state, dispatch, rootGetters, commit}) {
        let serviceUrl;

        if (state.serviceId !== "") {
            serviceUrl = rootGetters.getRestServiceById(state.serviceId).url;

            if (state.printService !== "plotservice" && !serviceUrl.includes("/print/")) {
                serviceUrl = serviceUrl + "print/";
            }

            commit("setServiceUrl", serviceUrl);
            serviceUrl = serviceUrl + state.printAppId + "/" + state.printAppCapabilities;
            const serviceRequest = {
                "serviceUrl": serviceUrl,
                "requestType": "GET",
                "onSuccess": "parseCapabilities"
            };

            dispatch("sendRequest", serviceRequest);

        }
    },

    /**
     * switch to decide which print service is configured and parses the response
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} response capabilities fomr the configured print service
     * @returns {void}
     */
    parseCapabilities: function ({state, dispatch}, response) {
        if (state.printService === "mapfish") {
            dispatch("parseMapfishCapabilities", response);
        }
        else {
            dispatch("parsePlotserviceCapabilities", response);
        }
    },

    /**
     * Sets the capabilities from mapfish response.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object[]} response - config.yaml from mapfish.
     * @returns {void}
     */
    parseMapfishCapabilities: function ({state, commit, dispatch}, response) {
        commit("setLayoutList", response.layouts);
        dispatch("chooseCurrentLayout", response.layouts);
        dispatch("getAttributeInLayoutByName", "metadata");
        dispatch("getAttributeInLayoutByName", "gfi");
        dispatch("getAttributeInLayoutByName", "legend");
        dispatch("getAttributeInLayoutByName", "scale");
        dispatch("setDpiList");
        commit("setFormatList", state.formatList);
        commit("setCurrentScale", Radio.request("MapView", "getOptions").scale);
        dispatch("togglePostrenderListener");
        if (state.isGfiAvailable) {
            dispatch("getGfiForPrint");
            BuildSpec.buildGfi(state.isGfiSelected, state.gfiForPrint);
        }
    },

    /**
     * Sets the capabilities from mapfish response.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object[]} response - config.yaml from mapfish.
     * @returns {void}
     */
    parsePlotserviceCapabilities: function ({state, commit, dispatch}, response) {
        commit("setLayoutList", response.layouts);
        dispatch("chooseCurrentLayout", response.layouts);
        commit("setScaleList", response.scales.map(scale => parseInt(scale.value, 10)).sort((a, b) => a - b));
        commit("setFormatList", response.outputFormats.map(format => format.name));
        commit("setCurrentScale", Radio.request("MapView", "getOptions").scale);
        dispatch("togglePostrenderListener");
        if (state.isGfiAvailable) {
            dispatch("getGfiForPrint");
            BuildSpec.buildGfi(state.isGfiSelected, state.gfiForPrint);
        }
    },

    /**
     * Choose the layout which is configured as currentlayout
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object[]} [layouts=[]] - All Layouts
     * @returns {void}
     */
    chooseCurrentLayout: function ({state, commit}, layouts) {
        const configuredLayout = layouts.find(layout => layout.name === state.currentLayoutName),
            layoutToUse = configuredLayout || layouts[0];

        commit("setCurrentLayout", layoutToUse);
        commit("setCurrentLayoutName", layoutToUse.name);
    },

    /**
     * Gets the Gfi Information
     * @param {Object} param.rootGetters the rootgetters
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    getGfiForPrint: function ({rootGetters, commit}) {
        if (rootGetters["Tools/Gfi/currentFeature"] !== null) {
            commit("setGfiForPrint", [rootGetters["Tools/Gfi/currentFeature"].getMappedProperties(), rootGetters["Tools/Gfi/currentFeature"].getTitle(), rootGetters["Maps/clickCoordinate"]]);
        }
        else {
            commit("setGfiForPrint", []);
        }
    },

    /**
     * sets a capabilities attribute object of the current layout, corresponding to the given name
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {String} name - name of the attribute to get
     * @returns {Object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function ({state, commit}, name) {
        state.currentLayout.attributes.forEach(attribute => {
            if (attribute.name === name) {
                const capName = name.charAt(0).toUpperCase() + name.slice(1);

                commit("setIs" + capName + "Available", true);
                commit("set" + capName + "Attribute", attribute);
            }
        });
    },

    /**
     * sets the dpi values if given in mapfish print capabilities
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @returns {void}
     */
    setDpiList: function ({state, commit}) {
        state.currentLayout.attributes.forEach((attribute, idx) => {
            if (attribute.name === "map") {
                commit("setDpiList", state.currentLayout.attributes[idx]
                    .clientInfo?.dpiSuggestions || []);
            }
        });
    },

    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postrender event of the map
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    togglePostrenderListener: function ({state, dispatch, commit}) {
        const foundVectorTileLayers = [];

        getVisibleLayer(state.printMapMarker);

        /*
        * Since MapFish 3 does not yet support VTL (see https://github.com/mapfish/mapfish-print/issues/659),
        * they are filtered in the following code and an alert is shown to the user informing him about which
        * layers will not be printed.
        */
        if (foundVectorTileLayers.length && state.active) {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.print.vtlWarning"), {root: true});
        }

        commit("setVisibleLayer", state.visibleLayerList);

        if (state.active && state.layoutList.length !== 0 && state.visibleLayerList.length >= 1 && state.eventListener === undefined) {
            const canvasLayer = Canvas.getCanvasLayer(state.visibleLayerList);

            commit("setEventListener", canvasLayer.on("postrender", evt => dispatch("createPrintMask", evt)));
        }
        else if (!state.active) {
            dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
            commit("setEventListener", undefined);
            if (state.invisibleLayer) {
                dispatch("setOriginalPrintLayer");
                commit("setHintInfo", "");
            }
        }
        mapCollection.getMap("2D").render();
    },

    /**
     * Getting und showing the layer which is visible in map scale
     * @param {Object} param.state the state
     * @returns {void}
     */
    setOriginalPrintLayer: function ({state, rootGetters}) {
        const invisibleLayer = state.invisibleLayer,
            mapScale = state.currentMapScale,
            // eslint-disable-next-line new-cap
            resoByMaxScale = rootGetters["Maps/getResolutionByScale"](mapScale, "max"),
            // eslint-disable-next-line new-cap
            resoByMinScale = rootGetters["Maps/getResolutionByScale"](mapScale, "min");

        invisibleLayer.forEach(layer => {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": layer.get("id")});

            if (resoByMaxScale <= layer.getMaxResolution() && resoByMinScale > layer.getMinResolution()) {
                layerModel.setIsOutOfRange(false);
            }
            else {
                layerModel.setIsOutOfRange(true);
            }
            layer.setVisible(true);

        });
    },

    /**
     * Getting und showing the layer which is visible in print scale
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {String} scale - the current print scale
     * @returns {void}
     */
    setPrintLayers: function ({state, dispatch, commit, rootGetters}, scale) {
        const visibleLayer = state.visibleLayerList,
            // eslint-disable-next-line new-cap
            resoByMaxScale = rootGetters["Maps/getResolutionByScale"](scale, "max"),
            // eslint-disable-next-line new-cap
            resoByMinScale = rootGetters["Maps/getResolutionByScale"](scale, "min"),
            invisibleLayer = [];

        let invisibleLayerNames = "",
            hintInfo = "";

        visibleLayer.forEach(layer => {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": layer.id});

            if (resoByMaxScale > layer.getMaxResolution() || resoByMinScale < layer.getMinResolution()) {
                invisibleLayer.push(layer);
                invisibleLayerNames += "- " + layer.get("name") + "<br>";
                if (layerModel !== undefined) {
                    layerModel.setIsOutOfRange(true);
                }
            }
            else if (layerModel !== undefined) {
                layerModel.setIsOutOfRange(false);
            }
        });

        hintInfo = i18next.t("common:modules.tools.print.invisibleLayer", {scale: "1: " + thousandsSeparator(scale, " ")});
        hintInfo = hintInfo + "<br>" + invisibleLayerNames;

        if (invisibleLayer.length && hintInfo !== state.hintInfo) {
            dispatch("Alerting/addSingleAlert", hintInfo, {root: true});
            commit("setHintInfo", hintInfo);
        }

        if (!invisibleLayer.length) {
            commit("setHintInfo", "");
        }

        commit("setInvisibleLayer", invisibleLayer);
    },

    /**
     * update to draw the print page rectangle onto the canvas when the map changes
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    updateCanvasLayer: function ({state, commit, dispatch}) {
        const visibleLayerList = state.visibleLayerList;
        let canvasLayer = {};

        dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
        canvasLayer = Canvas.getCanvasLayer(visibleLayerList);
        dispatch("chooseCurrentLayout", state.layoutList);
        if (Object.keys(canvasLayer).length) {
            commit("setEventListener", canvasLayer.on("postrender", (evt) => {
                dispatch("createPrintMask", evt);
            }));
        }
    },

    /**
     * draws the print page rectangle onto the canvas
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {ol.render.Event} evt - postrender
     * @returns {void}
     */
    createPrintMask: function ({dispatch, state}, evt) {
        dispatch("getPrintMapSize");
        dispatch("getPrintMapScales");

        const frameState = evt.frameState,
            context = evt.context,
            drawMaskOpt = {
                "frameState": evt.frameState,
                "context": evt.context
            },
            canvasPrintOptions = {
                "pixelToCoordinateTransform": frameState.pixelToCoordinateTransform,
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scale": "",
                "context": context
            },
            canvasOptions = {
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scaleList": state.scaleList
            };

        if (state.isScaleSelectedManually) {
            canvasPrintOptions.scale = state.currentScale;
        }
        else if (state.autoAdjustScale) {
            dispatch("getOptimalScale", canvasOptions);
            canvasPrintOptions.scale = state.optimalScale;
        }
        else {
            canvasPrintOptions.scale = state.currentScale;
        }

        dispatch("drawMask", drawMaskOpt);
        dispatch("drawPrintPage", canvasPrintOptions);
        context.fillStyle = "rgba(0, 5, 25, 0.55)";
        context.fill();

        dispatch("setPrintLayers", canvasPrintOptions.scale);
    },
    /**
     * gets the optimal print scale for a map
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} canvasOptions the canvas measurements
     * @returns {void}
     */
    getOptimalScale: function ({commit, state}, canvasOptions) {
        const mapWidth = canvasOptions.mapSize[0] * canvasOptions.resolution,
            mapHeight = canvasOptions.mapSize[1] * canvasOptions.resolution,
            scaleWidth = mapWidth * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[0],
            scaleHeight = mapHeight * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[1],
            scale = Math.min(scaleWidth, scaleHeight);
        let optimalScale = canvasOptions.scaleList[0];

        canvasOptions.scaleList.forEach(printMapScale => {
            if (scale > printMapScale) {
                optimalScale = printMapScale;
            }
        });

        commit("setOptimalScale", optimalScale);
        commit("setCurrentScale", optimalScale);
    },

    /**
     * draws a mask on the whole map
     * @param {Object} _ state
     * @param {Object} drawMaskOpt - context of the postrender event
     * @returns {void}
     */
    drawMask: function (_, drawMaskOpt) {
        const mapSize = drawMaskOpt.frameState.size,
            context = drawMaskOpt.context,
            ration = drawMaskOpt.context.canvas.width > mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            mapWidth = mapSize[0] * ration,
            mapHeight = mapSize[1] * ration;

        context.beginPath();
        // Outside polygon, must be clockwise
        context.moveTo(0, 0);
        context.lineTo(mapWidth, 0);
        context.lineTo(mapWidth, mapHeight);
        context.lineTo(0, mapHeight);
        context.lineTo(0, 0);
        context.closePath();
    },
    /**
     * draws the print page
     * @param {Object} param.state the state
     * @param {Object} canvasPrintOptions - mapsize, resolution, printmapsize and scale
     * @returns {void}
     */
    drawPrintPage: function ({state}, canvasPrintOptions) {
        const ration = canvasPrintOptions.context.canvas.width > canvasPrintOptions.mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            center = [canvasPrintOptions.mapSize[0] * ration / 2, canvasPrintOptions.mapSize[1] * ration / 2],
            boundWidth = canvasPrintOptions.printMapSize[0] / state.DOTS_PER_INCH / state.INCHES_PER_METER * canvasPrintOptions.scale / canvasPrintOptions.resolution * ration,
            boundHeight = canvasPrintOptions.printMapSize[1] / state.DOTS_PER_INCH / state.INCHES_PER_METER * canvasPrintOptions.scale / canvasPrintOptions.resolution * ration,
            minx = center[0] - (boundWidth / 2),
            miny = center[1] - (boundHeight / 2),
            maxx = center[0] + (boundWidth / 2),
            maxy = center[1] + (boundHeight / 2),
            extent = createEmpty(),
            transform = canvasPrintOptions.pixelToCoordinateTransform,
            c1 = applyTransform(transform, [minx, miny]),
            c2 = applyTransform(transform, [maxx, maxy]);

        // Inner polygon,must be counter-clockwise
        canvasPrintOptions.context.moveTo(minx, miny);
        canvasPrintOptions.context.lineTo(minx, maxy);
        canvasPrintOptions.context.lineTo(maxx, maxy);
        canvasPrintOptions.context.lineTo(maxx, miny);
        canvasPrintOptions.context.lineTo(minx, miny);
        canvasPrintOptions.context.closePath();

        // Keep the print extent available for later use
        extendCoordinate(extent, c1);
        extendCoordinate(extent, c2);
        lastPrintedExtent = extent;
    },

    /**
     * gets the optimal map resolution for a print scale and a map size
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} resolution - scale, mapSize and printMapSize
     * @returns {void}
     */
    getOptimalResolution: function ({commit, state}, resolution) {
        const dotsPerMeter = state.INCHES_PER_METER * state.DOTS_PER_INCH,
            resolutionX = resolution.printMapSize[0] * resolution.scale / (dotsPerMeter * resolution.mapSize[0]),
            resolutiony = resolution.printMapSize[1] * resolution.scale / (dotsPerMeter * resolution.mapSize[1]);

        commit("setOptimalResolution", Math.max(resolutionX, resolutiony));
    },

    /**
     * sets the size of the map on the report
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    getPrintMapSize: function ({state, commit, dispatch}) {
        if (state.printService === "plotservice") {
            const map = state.currentLayout.map;

            commit("setLayoutMapInfo", [map.width, map.height]);
        }
        else {
            dispatch("getAttributeInLayoutByName", "map");
            const layoutMapInfo = state.mapAttribute.clientInfo;

            commit("setLayoutMapInfo", [layoutMapInfo.width, layoutMapInfo.height]);
        }
    },

    /**
     * sets the supported scales of the map in the report
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    getPrintMapScales: function ({state, dispatch, commit}) {
        if (state.printService !== "plotservice") {
            dispatch("getAttributeInLayoutByName", "map");
            const layoutMapInfo = state.mapAttribute.clientInfo;

            commit("setScaleList", layoutMapInfo.scales.sort((a, b) => a - b));
        }
    }
};
