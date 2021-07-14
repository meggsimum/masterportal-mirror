import axios from "axios";
import getProxyUrl from "../../../../utils/getProxyUrl";
import thousandsSeparator from "../../../../utils/thousandsSeparator.js";
import CanvasModel from "./../store/utils/buildCanvas";
import SpecModel from "./../store/utils/buildSpec";
import differenceJS from "../../../../utils/differenceJS";
import sortBy from "../../../../utils/sortBy";
import LoaderOverlay from "../../../../utils/loaderOverlay";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";

export default {
    /**
     * Gets the capabilities for a specific print configuration
     * @param {Object} param.dispatch the dispatch
     * @param {Boolean} value - is this tool activated or not
     * @param {Backbone.Model} model - the Backbone Model
     * @returns {void}
     */
    retrieveCapabilites: function ({state, dispatch, commit}) {
        let serviceUrl;

        if (state.printSettings.mapfishServiceId !== undefined) {
            serviceUrl = Radio.request("RestReader", "getServiceById", state.printSettings.mapfishServiceId).get("url");
            commit("setMapfishServiceUrl", serviceUrl);
            serviceUrl = serviceUrl + state.printAppId + "/capabilities.json";
            const serviceRequest = {
                "serviceUrl": serviceUrl,
                "requestType": "GET"
            };

            dispatch("sendRequest", serviceRequest);

        }
    },

    /**
     * Performs an asynchronous HTTP request
     * @returns responsedata
     */
    sendRequest: function ({state, dispatch}, serviceRequest) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = state.useProxy ? getProxyUrl(serviceRequest.serviceUrl) : serviceRequest.serviceUrl;

        axios({
            url: url,
            type: serviceRequest.requestType,
            context: this
        }).then(response => {
            dispatch("parseMapfishCapabilities", response.data);
        });
    },
    /**
     * Sets the capabilities from mapfish resonse.
     * @param {Object[]} response - config.yaml from mapfish.
     * @fires Core#RadioRequestMapViewGetOptions
     * @returns {void}
     */
    parseMapfishCapabilities: function ({commit, dispatch, state}, response) {
        commit("setLayoutList", response.layouts);
        dispatch("chooseCurrentLayout", response.layouts);
        dispatch("getAttributeInLayoutByName", "metadata");
        dispatch("getAttributeInLayoutByName", "gfi");
        dispatch("getAttributeInLayoutByName", "legend");
        dispatch("getAttributeInLayoutByName", "scale");
        commit("setFormatList", response.formats);
        commit("setCurrentScale", Radio.request("MapView", "getOptions").scale);
        dispatch("togglePostrenderListener", true);
        if (state.isGfiAvailable) {
            //buildSpec.buildGfi(state.isGfiSelected, Radio.request("GFI", "getGfiForPrint"));
        }
    },

    /**
     * Choose the layout which is configured as currentlayout
     * @param {Object[]} [layouts=[]] - All Layouts
     * @returns {void} The choosen current layout
     */
    chooseCurrentLayout: function ({state, commit}, layouts) {
        const currentLayout = layouts.filter(layout => layout.name === state.currentLayoutName);

        commit("setCurrentLayout", currentLayout.length === 1 ? currentLayout[0] : layouts[0]);
    },

    /**
     * returns a capabilities attribute object of the current layout, corresponding to the given name
     * @param {String} name - name of the attribute to get
     * @returns {Object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function ({state, commit}, name) {
        state.currentLayout.attributes.find(function (attribute) {
            return attribute.name === name;
        });
        state.currentLayout.attributes.forEach(attribute => {
            if (attribute.name === name) {
                const capName = name.charAt(0).toUpperCase() + name.slice(1);

                commit("setIs" + capName + "Available", true);
                commit("set" + capName + "Attribute", attribute);
            }
        });
    },


    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postrender event of the map
     * @param {Backbone.Model} model - this
     * @param {Boolean} value - is this tool activated or not
     * @returns {void}
     */
    togglePostrenderListener: function ({state, dispatch, commit}) {
        const foundVectorTileLayers = [];

        dispatch("getVisibleLayer");

        /*
        * Since MapFish 3 does not yet support VTL (see https://github.com/mapfish/mapfish-print/issues/659),
        * they are filtered in the following code and an alert is shown to the user informing him about which
        * layers will not be printed.
        */
        if (foundVectorTileLayers.length && state.active) {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.print.vtlWarning"), {root: true});
        }

        commit("setVisibleLayer", state.visibleLayerList);

        if (state.active && state.layoutList.length !== 0 && state.visibleLayerList.length >= 1) {
            const canvasLayer = CanvasModel.getCanvasLayer(state.visibleLayerList);

            commit("setEventListener", canvasLayer.on("postrender", evt => dispatch("createPrintMask", evt)));
        }
        else {
            Radio.trigger("Map", "unregisterListener", state.eventListener);
            commit("setEventListener", undefined);
            if (state.invisibleLayer) {
                dispatch("setOriginalPrintLayer");
                commit("setHintInfo", "");
            }
        }
        Radio.trigger("Map", "render");
    },

    /**
     * Getting und showing the layer which is visible in map scale
     * @returns {void} -
     */
    setOriginalPrintLayer: function ({state}) {
        const invisibleLayer = state.invisibleLayer,
            mapScale = state.currentMapScale,
            resoByMaxScale = Radio.request("MapView", "getResoByScale", mapScale, "max"),
            resoByMinScale = Radio.request("MapView", "getResoByScale", mapScale, "min");

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
     * @param {String} scale - the current print scale
     * @returns {void} -
     */
    setPrintLayers: function ({state, dispatch, commit}, scale) {
        const visibleLayer = state.visibleLayerList,
            resoByMaxScale = Radio.request("MapView", "getResoByScale", scale, "max"),
            resoByMinScale = Radio.request("MapView", "getResoByScale", scale, "min"),
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
            else {
                layer.setVisible(true);
                if (layerModel !== undefined) {
                    layerModel.setIsOutOfRange(false);
                }
            }
        });

        hintInfo = i18next.t("common:modules.tools.print.invisibleLayer", {scale: "1: " + thousandsSeparator(scale, " ")});
        hintInfo = hintInfo + "<br>" + invisibleLayerNames;

        if (invisibleLayer.length && hintInfo !== state.hintInfo) {
            dispatch("Alerting/addSingleAlert", hintInfo);
            commit("setHintInfo", hintInfo);
        }

        if (!invisibleLayer.length) {
            commit("setHintInfo", "");
        }

        commit("setInvisibleLayer", invisibleLayer);
        dispatch("updateCanvasLayer");
    },

    /**
     * update to draw the print page rectangle onto the canvas when the map changes
     * @returns {void}
     */
    updateCanvasLayer: function ({state, commit, dispatch}) {
        const visibleLayerList = state.visibleLayerList;
        let canvasLayer = {};

        Radio.trigger("Map", "unregisterListener", state.eventListener);
        canvasLayer = CanvasModel.getCanvasLayer(visibleLayerList);
        // commit("setCurrentMapScale", state.Map.scale);
        if (Object.keys(canvasLayer).length) {
            commit("setEventListener", canvasLayer.on("postrender", evt => dispatch("createPrintMask", evt)));
        }
    },

    /**
     * returns the visible layers and set into variable
     * @returns {Number[]} scale list
     */
    getVisibleLayer: function ({dispatch}) {
        const visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(layer => {
            return layer.getVisible() === true && layer.get("name") !== "markerPoint";
        });

        dispatch("sortVisibleLayerListByZindex", visibleLayerList);
    },
    /**
     * sorts the visible layer list by zIndex from layer
     * layers with undefined zIndex come to the beginning of array
     * @param {array} visibleLayerList with visble layer
     * @returns {array} sorted visibleLayerList
     */
    sortVisibleLayerListByZindex: function ({commit}, visibleLayerList) {
        const visibleLayerListWithZIndex = visibleLayerList.filter(layer => {
                return layer.getZIndex() !== undefined;
            }),
            visibleLayerListWithoutZIndex = differenceJS(visibleLayerList, visibleLayerListWithZIndex);

        visibleLayerListWithoutZIndex.push(sortBy(visibleLayerListWithZIndex, (layer) => layer.getZIndex()));

        commit("setVisibleLayerList", [].concat(...visibleLayerListWithoutZIndex));
    },
    /**
     * draws the print page rectangle onto the canvas
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
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scale": "",
                "context": context
            };

        let scale;

        // scale was selected by the user over the view
        if (state.isScaleSelectedManually) {
            scale = state.currentScale;
        }
        else {
            const canvasOptions = {
                "mapSize": frameState.size,
                "resolution": frameState.viewState.resolution,
                "printMapSize": state.layoutMapInfo,
                "scaleList": state.scaleList
            };

            dispatch("getOptimalScale", canvasOptions);
            scale = state.optimalScale;
        }

        canvasPrintOptions.scale = scale;
        dispatch("drawMask", drawMaskOpt);
        dispatch("drawPrintPage", canvasPrintOptions);
        context.fillStyle = "rgba(0, 5, 25, 0.55)";
        context.fill();

        dispatch("setPrintLayers", scale);
    },
    /**
     * gets the optimal print scale for a map
     * @param {ol.Size} mapSize - size of the map in px
     * @param {Number} resolution - resolution of the map in m/px
     * @param {ol.Size} printMapSize - size of the map on the report in dots
     * @param {Object[]} scaleList - supported print scales, sorted in ascending order
     * @returns {Number} the optimal scale
     */
    getOptimalScale: function ({commit, state}, canvasOptions) {
        const mapWidth = canvasOptions.mapSize[0] * canvasOptions.resolution,
            mapHeight = canvasOptions.mapSize[1] * canvasOptions.resolution,
            scaleWidth = mapWidth * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[0],
            scaleHeight = mapHeight * state.INCHES_PER_METER * state.DOTS_PER_INCH / canvasOptions.printMapSize[1],
            scale = Math.min(scaleWidth, scaleHeight);

        let optimalScale = canvasOptions.scaleList[0];

        canvasOptions.scaleList.forEach(function (printMapScale) {
            if (scale > printMapScale) {
                optimalScale = printMapScale;
            }
        });
        commit("setOptimalScale", optimalScale);
    },

    /**
     * draws a mask on the whole map
     * @param {ol.Size} mapSize - size of the map in px
     * @param {CanvasRenderingContext2D} context - context of the postrender event
     * @returns {void}
     */
    drawMask: function ({state}, drawMaskOpt) {
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
     * @param {ol.Size} mapSize - size of the map in px
     * @param {Number} resolution - resolution of the map in m/px
     * @param {Number} printMapSize - size of the map on the report in dots
     * @param {Number} scale - the optimal print scale
     * @param {CanvasRenderingContext2D} context - context of the postrender event
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
            maxy = center[1] + (boundHeight / 2);

        // Inner polygon,must be counter-clockwise
        canvasPrintOptions.context.moveTo(minx, miny);
        canvasPrintOptions.context.lineTo(minx, maxy);
        canvasPrintOptions.context.lineTo(maxx, maxy);
        canvasPrintOptions.context.lineTo(maxx, miny);
        canvasPrintOptions.context.lineTo(minx, miny);
        canvasPrintOptions.context.closePath();
    },

    /**
     * returns the size of the map on the report
     * @returns {Number[]} width and height
     */
    getPrintMapSize: function ({state, commit, dispatch}) {
        dispatch("getAttributeInLayoutByName", "map");
        const layoutMapInfo = state.mapAttribute.clientInfo;

        commit("setLayoutMapInfo", [layoutMapInfo.width, layoutMapInfo.height]);
    },

    /**
     * returns the supported scales of the map in the report
     * @returns {Number[]} scale list
     */
    getPrintMapScales: function ({state, dispatch, commit}) {
        dispatch("getAttributeInLayoutByName", "map");
        const layoutMapInfo = state.mapAttribute.clientInfo;

        commit("setScaleList", layoutMapInfo.scales.sort((a, b) => a - b));
    },

    print: function ({state, dispatch}) {
        dispatch("getVisibleLayer");
        const visibleLayerList = state.visibleLayerList,
            attr = {
                "layout": state.currentLayout.name,
                "outputFilename": state.filename,
                "outputFormat": state.currentFormat,
                "attributes": {
                    "title": state.title,
                    "map": {
                        "dpi": state.dpiForPdf,
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": state.currentScale
                    }
                }
            };

        let spec = SpecModel;

        spec.set(attr);

        if (state.isMetaDataAvailable) {
            spec.setMetadata(true);
        }

        if (state.isScaleAvailable) {
            spec.buildScale(state.currentScale);
        }
        spec.buildLayers(visibleLayerList);

        if (state.isGfiAvailable) {
            spec.buildGfi(state.isGfiSelected, Radio.request("GFI", "getGfiForPrint"));
        }

        if (state.isLegendAvailable) {
            spec.buildLegend(state.isLegendSelected, state.isMetaDataAvailable);
        }
        else {
            spec.setLegend({});
            spec.setShowLegend(false);
            spec = spec.toJSON();
            spec = Radio.request("Util", "omit", spec, ["uniqueIdList"]);
            dispatch("createPrintJob", (encodeURIComponent(JSON.stringify(spec)), state.printAppId, state.currentFormat));
        }
    },

    /**
     * sends a request to create a print job
     * @param {String} payload - POST body
     * @param {String} printAppId - id of the print configuration
     * @param {String} format - print job output format
     * @returns {void}
     */
    createPrintJob: function (payload, printAppId, format) {
        const printId = printAppId || this.get("printAppId"),
            printFormat = format || this.get("currentFormat"),
            url = this.get("mapfishServiceUrl") + printId + "/report." + printFormat;

        LoaderOverlay.show();
        this.sendRequest(url, "POST", this.waitForPrintJob, payload);
    },

};