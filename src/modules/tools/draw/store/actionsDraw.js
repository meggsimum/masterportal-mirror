import {Draw} from "ol/interaction.js";
import {getMapProjection, transform} from "masterportalapi/src/crs";

import * as actionsDownload from "./actions/actionsDownload";
import {drawInteractionOnDrawEvent} from "./actions/drawInteractionOnDrawEvent";
import * as setters from "./actions/settersDraw";
import * as withoutGUI from "./actions/withoutGUIDraw";

import {calculateCircle} from "../utils/circleCalculations";
import {createDrawInteraction, createModifyInteraction, createSelectInteraction} from "../utils/createInteractions";
import {createStyle} from "../utils/style/createStyle";
import createTooltipOverlay from "../utils/style/createTooltipOverlay";
import drawTypeOptions from "./drawTypeOptions";
import getDrawTypeByGeometryType from "../utils/getDrawTypeByGeometryType";
import postDrawEnd from "../utils/postDrawEnd";

import stateDraw from "./stateDraw";
import mapCollection from "../../../../core/dataStorage/mapCollection";

// NOTE: The Update and the Redo Buttons weren't working with the select and modify interaction in Backbone and are not yet working in Vue too.

const initialState = JSON.parse(JSON.stringify(stateDraw)),
    actions = {
        ...actionsDownload,
        /**
         * Adds selected values from the state to the "drawState" of the given feature
         *
         * @param {ol/Feature} feature The OpenLayers feature to append to the current "drawState".
         * @returns {void}
         */
        addDrawStateToFeature ({getters}, feature) {
            if (!feature) {
                return;
            }
            const {styleSettings} = getters,
                // use clones of drawType and symbol
                symbol = JSON.parse(JSON.stringify(getters.symbol)),
                zIndex = JSON.parse(JSON.stringify(getters.zIndex)),
                imgPath = JSON.parse(JSON.stringify(getters.imgPath)),
                pointSize = JSON.parse(JSON.stringify(getters.pointSize));
            let drawType = JSON.parse(JSON.stringify(getters.drawType));

            if (getters.drawType.id === "drawDoubleCircle") {
                // the double circle should behave like a circle on modify
                drawType = {geometry: "Circle", id: "drawCircle"};
            }

            feature.set("drawState", {
                // copies
                strokeWidth: styleSettings.strokeWidth,
                opacity: styleSettings.opacity,
                opacityContour: styleSettings.opacityContour,
                font: styleSettings.font,
                fontSize: parseInt(styleSettings.fontSize, 10),
                text: styleSettings.text,
                circleMethod: styleSettings.circleMethod,
                circleRadius: styleSettings.circleRadius,
                circleOuterRadius: styleSettings.circleOuterRadius,
                drawType,
                symbol,
                zIndex,
                imgPath,
                pointSize,
                color: styleSettings.color,
                colorContour: styleSettings.colorContour,
                outerColorContour: styleSettings.outerColorContour
            }, false);
        },
        /**
         * Adds an interaction to the current map instance.
         *
         * @param {module:ol/interaction/Interaction} interaction interaction with the map.
         * @returns {void}
         */
        addInteraction ({rootState}, interaction) {
            mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).addInteraction(interaction);
        },
        /**
         * Removes all features from the layer.
         *
         * @returns {void}
         */
        clearLayer ({state, dispatch}) {
            state.layer.getSource().clear();
            // NOTE(roehlipa): As an alternative it could be committed directly; would this make it cleaner?
            dispatch("setDownloadFeatures");
        },
        /**
         * Clears the tooltip from the map.
         *
         * @param {module:ol/Overlay} tooltip The tooltip to be removed.
         * @returns {void}
         */
        clearTooltip ({rootState}, tooltip) {
            tooltip.getElement().parentNode.removeChild(tooltip.getElement());
            mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).un("pointermove", tooltip.get("mapPointerMoveEvent"));
            mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).removeOverlay(tooltip);
        },
        /**
         * Returns the center point of a Line or Polygon or a point itself.
         * If a targetprojection is given, the values are transformed.
         *
         * @param {Object} prm Parameter object.
         * @param {module:ol/Feature} prm.feature Line, Polygon or Point.
         * @param {String} prm.targetProjection Target projection if the projection differs from the map's projection.
         * @returns {module:ol/coordinate~Coordinate} Coordinates of the center point of the geometry.
         */
        createCenterPoint ({rootState}, {feature, targetProjection}) {
            let centerPoint,
                centerPointCoords = [];

            const featureType = feature.getGeometry().getType(),
                map = mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode);

            if (featureType === "LineString") {
                if (targetProjection !== undefined) {
                    centerPointCoords = transform(getMapProjection(map), targetProjection, feature.getGeometry().getCoordinateAt(0.5));
                }
                else {
                    centerPointCoords = feature.getGeometry().getCoordinateAt(0.5);
                }
            }
            else if (featureType === "Point") {
                if (targetProjection !== undefined) {
                    centerPointCoords = transform(getMapProjection(map), targetProjection, feature.getGeometry().getCoordinates());
                }
                else {
                    centerPointCoords = feature.getGeometry().getCoordinates();
                }
            }
            else if (featureType === "Polygon") {
                if (targetProjection !== undefined) {
                    centerPoint = transform(getMapProjection(map), targetProjection, feature.getGeometry().getInteriorPoint().getCoordinates());
                }
                else {
                    centerPoint = feature.getGeometry().getInteriorPoint().getCoordinates();
                }
                centerPointCoords = centerPoint.slice(0, -1);
            }
            else if (featureType === "Circle") {
                if (targetProjection !== undefined) {
                    centerPointCoords = transform(getMapProjection(map), targetProjection, feature.getGeometry().getCenter());
                }
                else {
                    centerPointCoords = feature.getGeometry().getCenter();
                }
            }
            return centerPointCoords;
        },
        /**
         * Creates a draw interaction to add to the map.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.active Decides whether the draw interactions are active or not.
         * @param {Number} [payload.maxFeatures] Max amount of features to be added to the map.
         * @returns {void}
         */
        createDrawInteractionAndAddToMap ({state, commit, dispatch, getters}, {active, maxFeatures}) {
            const {styleSettings} = getters,
                drawInteraction = createDrawInteraction(state, styleSettings);

            commit("setDrawInteraction", drawInteraction);
            dispatch("manipulateInteraction", {interaction: "draw", active: active});
            dispatch("createDrawInteractionListener", {isOuterCircle: false, drawInteraction: "", maxFeatures});
            dispatch("addInteraction", drawInteraction);

            // NOTE: This leads to the creation of a second (the outer) circle instead of a MultiPolygon right now.
            if (state.drawType.id === "drawDoubleCircle") {
                const drawInteractionTwo = createDrawInteraction(state, styleSettings);

                commit("setDrawInteractionTwo", drawInteractionTwo);
                dispatch("manipulateInteraction", {interaction: "draw", active: active});
                dispatch("createDrawInteractionListener", {isOuterCircle: true, drawInteraction: "Two", maxFeatures});
                dispatch("addInteraction", drawInteractionTwo);
            }
        },
        /**
         * Listener to change the entries for the next drawing.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.isOuterCircle Determines if the outer circle of a doubleCircle is supposed to be drawn.
         * @param {String} payload.drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
         * @param {Number} [payload.maxFeatures] Max amount of features to be added to the map.
         * @returns {void}
         */
        createDrawInteractionListener ({rootState, state, dispatch, getters, commit}, {isOuterCircle, drawInteraction, maxFeatures}) {
            const interaction = state["drawInteraction" + drawInteraction];
            let tooltip;

            interaction.on("drawstart", event => {
                event.feature.set("isOuterCircle", isOuterCircle);
                event.feature.set("isVisible", true);
                dispatch("drawInteractionOnDrawEvent", drawInteraction);

                if (!tooltip && state?.drawType?.id === "drawCircle" || state?.drawType?.id === "drawDoubleCircle") {
                    tooltip = createTooltipOverlay({getters, commit, dispatch});
                    mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).addOverlay(tooltip);
                    mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).on("pointermove", tooltip.get("mapPointerMoveEvent"));
                    event.feature.getGeometry().on("change", tooltip.get("featureChangeEvent"));
                }
            });
            if (maxFeatures && maxFeatures > 0) {
                interaction.on("drawstart", () => {
                    const featureCount = state.layer.getSource().getFeatures().length;

                    if (featureCount > maxFeatures - 1) {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.limitReached", {count: maxFeatures}), {root: true});
                        dispatch("deactivateDrawInteractions");
                        dispatch("removeInteraction", interaction);
                    }
                });
            }
            interaction.on("drawend", event => {
                dispatch("addDrawStateToFeature", event.feature);
                dispatch("uniqueID").then(id => {
                    event.feature.set("styleId", id);

                    if (tooltip) {
                        event.feature.getGeometry().un("change", tooltip.get("featureChangeEvent"));
                        dispatch("clearTooltip", tooltip);
                        tooltip = null;
                    }

                    dispatch("setDownloadFeatures");

                    // NOTE: This is only used for dipas/diplanung (08-2020): inputMap contains the map, drawing is cancelled and editing is started
                    if (typeof Config.inputMap !== "undefined" && Config.inputMap !== null) {
                        const {feature} = event,
                            {targetProjection} = Config.inputMap;

                        dispatch("cancelDrawWithoutGUI", {cursor: "auto"});
                        dispatch("editFeaturesWithoutGUI");

                        dispatch("createCenterPoint", {feature, targetProjection}).then(coordinates => {
                            dispatch("downloadFeaturesWithoutGUI", {prmObject: {targetProjection}, currentFeature: feature})
                                .then(geoJSON => postDrawEnd({type: "Point", coordinates}, geoJSON));
                        });
                    }
                });
            });
        },
        /**
         * Creates a modify interaction and adds it to the map.
         *
         * @param {Boolean} active Decides whether the modify interaction is active or not.
         * @returns {void}
         */
        createModifyInteractionAndAddToMap ({state, commit, dispatch}, active) {
            const modifyInteraction = createModifyInteraction(state.layer),
                selectInteractionModify = createSelectInteraction(state.layer, 10);

            commit("setModifyInteraction", modifyInteraction);
            dispatch("manipulateInteraction", {interaction: "modify", active: active});
            dispatch("createModifyInteractionListener");
            dispatch("addInteraction", modifyInteraction);

            commit("setSelectInteractionModify", selectInteractionModify);
            dispatch("createSelectInteractionModifyListener");
            dispatch("addInteraction", selectInteractionModify);
        },
        /**
         * Listener to change the features through the modify interaction.
         * NOTE: For text only the position can be changed. This can be done by clicking at highlighted (on-hover) bottom-left corner of the text.
         *
         * @returns {void}
         */
        createModifyInteractionListener ({rootState, state, dispatch, commit, getters}) {
            let tooltip,
                changeInProgress = false;

            state.modifyInteraction.on("modifystart", event => {
                if (state.selectedFeature) {
                    // set selectedFeature to null to avoid change of last selected feature
                    commit("setSelectedFeature", null);
                }

                event.features.getArray().forEach(feature => {
                    let center = null;

                    if (typeof feature.getGeometry().getCenter === "function") {
                        center = JSON.stringify(feature.getGeometry().getCenter());
                    }
                    feature.getGeometry().once("change", async () => {
                        if (changeInProgress) {
                            return;
                        }
                        changeInProgress = true;

                        if (!state.selectedFeature || state.selectedFeature.ol_uid !== feature.ol_uid) {
                            await dispatch("setAsCurrentFeatureAndApplyStyleSettings", feature);

                            if (!tooltip && (state.drawType.id === "drawCircle" || state.drawType.id === "drawDoubleCircle")) {
                                if (center === JSON.stringify(feature.getGeometry().getCenter())) {
                                    tooltip = createTooltipOverlay({getters, commit, dispatch});
                                    mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).addOverlay(tooltip);
                                    mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).on("pointermove", tooltip.get("mapPointerMoveEvent"));
                                    state.selectedFeature.getGeometry().on("change", tooltip.get("featureChangeEvent"));
                                }
                            }
                        }
                    });
                });
            });
            state.modifyInteraction.on("modifyend", event => {

                changeInProgress = false;
                if (tooltip) {
                    state.selectedFeature.getGeometry().un("change", tooltip.get("featureChangeEvent"));
                    dispatch("clearTooltip", tooltip);
                    tooltip = null;
                }

                dispatch("setDownloadFeatures");

                // NOTE: This is only used for dipas/diplanung (08-2020): inputMap contains the map
                if (typeof Config.inputMap !== "undefined" && Config.inputMap !== null) {
                    dispatch("createCenterPoint", {feature: event.features.getArray()[0], targetProjection: Config.inputMap.targetProjection}).then(centerPointCoords => {
                        dispatch("downloadFeaturesWithoutGUI", {prmObject: {"targetProjection": Config.inputMap.targetProjection}, currentFeature: event.feature})
                            .then(geoJSON => postDrawEnd({type: "Point", coordinates: centerPointCoords}, geoJSON));
                    });
                }
            });
        },
        /**
         * Listener to select (for modify) the features through ol select interaction
         *
         * @returns {void}
         */
        createSelectInteractionModifyListener ({state, commit, dispatch}) {
            state.selectInteractionModify.on("select", event => {
                if (state.currentInteraction !== "modify" || !event.selected.length) {
                    // reset interaction - if not reset, the ol default would be used, this shouldn't be what we want at this point
                    state.selectInteractionModify.getFeatures().clear();
                    if (state.selectedFeature) {
                        commit("setSelectedFeature", null);
                    }
                    return;
                }

                // the last selected feature is always on top
                const feature = event.selected[event.selected.length - 1];

                dispatch("setAsCurrentFeatureAndApplyStyleSettings", feature);

                // ui reason: this is the short period of time the ol default mark of select interaction is seen at mouse click event of a feature
                setTimeout(() => {
                    state.selectInteractionModify.getFeatures().clear();
                }, 300);
            });
        },
        /**
         * Creates a select interaction (for deleting features) and adds it to the map.
         * NOTE: Deletion of text can be done by clicking at the highlighted (on-hover) bottom-left corner of the text.
         *
         * @param {Boolean} active Decides whether the select interaction is active or not.
         * @returns {void}
         */
        createSelectInteractionAndAddToMap ({state, commit, dispatch}, active) {
            const selectInteraction = createSelectInteraction(state.layer);

            commit("setSelectInteraction", selectInteraction);
            dispatch("manipulateInteraction", {interaction: "delete", active: active});
            dispatch("createSelectInteractionListener");
            dispatch("addInteraction", selectInteraction);
        },
        /**
         * Listener to select (for deletion) the features through the select interaction.
         *
         * @returns {void}
         */
        createSelectInteractionListener ({state, dispatch}) {
            state.selectInteraction.on("select", event => {
                // remove feature from source
                state.layer.getSource().removeFeature(event.selected[0]);
                // remove feature from interaction
                state.selectInteraction.getFeatures().clear();
                // remove feature from array of downloadable features
                dispatch("setDownloadFeatures");
            });
        },
        /**
         * Deactivates all draw interactions of the map and add them to the state.
         * NOTE: This is mainly used with the RemoteInterface because otherwise not all interactions are removed.
         *
         * @returns {void}
         */
        deactivateDrawInteractions ({state, rootState}) {
            mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).getInteractions().forEach(int => {
                if (int instanceof Draw) {
                    int.setActive(false);
                    if (state.deactivatedDrawInteractions.indexOf(int) === -1) {
                        state.deactivatedDrawInteractions.push(int);
                    }
                }
            });
        },
        drawInteractionOnDrawEvent,
        /**
         * Activates or deactivates the given Interactions based on the given parameters.
         *
         * @param {Object} payload payload object.
         * @param {String} payload.interaction name of the interaction to be manipulated.
         * @param {Boolean} payload.active Value to set the drawInteractions to.
         * @return {void}
         */
        manipulateInteraction ({state}, {interaction, active}) {
            if (interaction === "draw") {
                if (typeof state.drawInteraction !== "undefined" && state.drawInteraction !== null) {
                    state.drawInteraction.setActive(active);
                }
                if (typeof state.drawInteractionTwo !== "undefined" && state.drawInteractionTwo !== null) {
                    state.drawInteractionTwo.setActive(active);
                }
            }
            else if (interaction === "modify") {
                if (typeof state.modifyInteraction !== "undefined" && state.modifyInteraction !== null) {
                    state.modifyInteraction.setActive(active);
                }
                if (typeof state.selectInteractionModify !== "undefined" && state.selectInteractionModify !== null) {
                    state.selectInteractionModify.setActive(active);
                }
            }
            else if (interaction === "delete") {
                if (typeof state.selectInteraction !== "undefined" && state.selectInteraction !== null) {
                    state.selectInteraction.setActive(active);
                }
            }
        },
        /**
         * Restores the last deleted element of the feature array of the layer.
         *
         * @returns {void}
         */
        redoLastStep ({state, commit, dispatch}) {
            const redoArray = state.redoArray,
                featureToRestore = redoArray[redoArray.length - 1];

            if (typeof featureToRestore !== "undefined" && featureToRestore !== null) {
                const featureId = state.fId;

                featureToRestore.setId(featureId);
                commit("setFId", state.fId + 1);
                state.layer.getSource().addFeature(featureToRestore);
                state.layer.getSource().getFeatureById(featureId).setStyle(featureToRestore.getStyle());
                dispatch("updateRedoArray", {remove: true});
                dispatch("updateUndoArray", {remove: false, feature: featureToRestore});
            }
        },
        /**
         * Removes the given interaction from the current map instance.
         *
         * @param {module:ol/interaction/Interaction} interaction interaction with the map.
         * @returns {void}
         */
        removeInteraction ({rootState}, interaction) {
            mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode).removeInteraction(interaction);
        },
        /**
         * Resets the Draw Tool.
         *
         * @returns {void}
         */
        resetModule ({state, commit, dispatch, getters}) {
            commit("setActive", false);
            dispatch("toggleInteraction", "draw");
            dispatch("manipulateInteraction", {interaction: "draw", active: false});

            dispatch("removeInteraction", state.drawInteraction);
            dispatch("removeInteraction", state.drawInteractionTwo);
            dispatch("removeInteraction", state.modifyInteraction);
            dispatch("removeInteraction", state.selectInteractionModify);
            dispatch("removeInteraction", state.selectInteraction);

            commit("setSelectedFeature", null);
            commit("setDrawType", initialState.drawType);
            commit("setFreeHand", initialState.freeHand);
            commit("setPointSize", initialState.pointSize);
            commit("setSymbol", getters.iconList[0]);
            commit("setWithoutGUI", initialState.withoutGUI);

            commit("setDownloadDataString", initialState.download.dataString);
            commit("setDownloadFeatures", initialState.download.features);
            commit("setDownloadFileName", initialState.download.fileName);
            commit("setDownloadSelectedFormat", initialState.download.selectedFormat);

            if (state.addFeatureListener.listener) {
                state.layer.getSource().un("addFeature", state.addFeatureListener.listener);
            }
        },

        /**
         * Sets the given feature as currentFeature and applies the styleSettings
         *
         * @param {ol/Feature} feature The OpenLayers feature to append to  current "drawState".
         * @returns {void}
         */
        setAsCurrentFeatureAndApplyStyleSettings: async ({commit, dispatch, getters}, feature) => {
            const {styleSettings} = getters;
            let drawState = feature.get("drawState");

            if (typeof drawState === "undefined") {
                // setDrawType changes visibility of all select- and input-boxes
                commit("setDrawType", getDrawTypeByGeometryType(feature.getGeometry().getType(), drawTypeOptions));

                // use current state as standard for extern features (e.g. kml or gpx import)
                await dispatch("addDrawStateToFeature", feature);
                drawState = feature.get("drawState");
            }
            else {
                // setDrawType changes visibility of all select- and input-boxes
                commit("setDrawType", feature.get("drawState").drawType);
            }
            commit("setSelectedFeature", feature);

            Object.assign(styleSettings,
                drawState.color,
                drawState.colorContour,
                drawState.outerColorContour,
                drawState.strokeWidth,
                drawState.opacity,
                drawState.opacityContour,
                drawState.font,
                drawState.fontSize,
                drawState.text,
                drawState.circleMethod,
                drawState.circleRadius,
                drawState.circleOuterRadius);

            commit("setSymbol", feature.get("drawState").symbol);

            setters.setStyleSettings({commit, getters}, styleSettings);
        },
        ...setters,
        /**
         * Enables the given interaction and disables the others.
         *
         * @param {String} interaction The interaction to be enabled.
         * @returns {void}
         */
        toggleInteraction ({commit, dispatch}, interaction) {
            commit("setCurrentInteraction", interaction);
            commit("setSelectedFeature", null);
            if (interaction === "draw") {
                dispatch("manipulateInteraction", {interaction: "draw", active: true});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
                dispatch("updateDrawInteraction");
            }
            else if (interaction === "modify") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: true});
                dispatch("manipulateInteraction", {interaction: "delete", active: false});
            }
            else if (interaction === "delete") {
                dispatch("manipulateInteraction", {interaction: "draw", active: false});
                dispatch("manipulateInteraction", {interaction: "modify", active: false});
                dispatch("manipulateInteraction", {interaction: "delete", active: true});
            }
        },
        /**
         * Deletes the last element in the feature array of the layer.
         *
         * @returns {void}
         */
        undoLastStep ({state, dispatch}) {
            /**
             * NOTE: state.layer.getSource().getFeatures() doesn't return the features in the order they were added.
             * Therefore it is necessary to keep an array with the features in the right order.
             */
            const features = state.undoArray,
                featureToRemove = features[features.length - 1];

            if (typeof featureToRemove !== "undefined" && featureToRemove !== null) {
                dispatch("updateRedoArray", {remove: false, feature: featureToRemove});
                dispatch("updateUndoArray", {remove: true});
                state.layer.getSource().removeFeature(featureToRemove);
            }
        },
        /**
         * Creates and returns a unique ID.
         * If given, it starts with a prefix.
         *
         * @param {String} [prefix] Prefix for the ID.
         * @returns {String} A unique ID.
         */
        uniqueID ({state, commit}, prefix) {
            const id = state.idCounter + 1;

            commit("setIdCounter", id);
            return prefix ? prefix + id : id.toString(10);
        },
        /**
         * Updates the selected feature during modify for circles
         *
         * @param {Number} radius The radius of the circle.
         * @returns {void}
         */
        updateCircleRadiusDuringModify ({state, rootState, dispatch}, radius) {
            if (state.currentInteraction === "modify" && state.selectedFeature !== null && (state.drawType.id === "drawCircle" || state.drawType.id === "drawDoubleCircle")) {
                const feature = state.selectedFeature,
                    circleCenter = feature.getGeometry().getCenter();

                calculateCircle({feature}, circleCenter, radius, mapCollection.getMap(rootState.Map.mapId, rootState.Map.mapMode));

                dispatch("addDrawStateToFeature", state.selectedFeature);
            }
        },
        /**
         * Updates the drawInteractions on the map and creates a new one.
         *
         * @returns {void}
         */
        updateDrawInteraction ({state, commit, getters, dispatch}) {
            if (state.currentInteraction === "modify" && state.selectedFeature !== null) {
                const {styleSettings} = getters;

                state.selectedFeature.setStyle(function (feature) {
                    if (feature.get("isVisible") === undefined || feature.get("isVisible")) {
                        return createStyle(feature.get("drawState"), styleSettings);
                    }
                    return undefined;
                });
                dispatch("addDrawStateToFeature", state.selectedFeature);
                return;
            }

            dispatch("removeInteraction", state.drawInteraction);
            commit("setDrawInteraction", null);
            if (typeof state.drawInteractionTwo !== "undefined" && state.drawInteractionTwo !== null) {
                dispatch("removeInteraction", state.drawInteractionTwo);
                commit("setDrawInteractionTwo", null);
            }
            dispatch("createDrawInteractionAndAddToMap", {active: true});
        },
        /**
         * Adds or removes one element from the redoArray.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.remove Remove one feature from the array if true.
         * @param {Object} [payload.feature] feature to be added to the array, if given.
         * @returns {void}
         */
        updateRedoArray: ({state, commit}, {remove, feature}) => {
            const redoArray = state.redoArray;

            if (remove) {
                redoArray.pop();
            }
            else {
                redoArray.push(feature);
            }
            commit("setRedoArray", redoArray);
        },
        /**
         * Adds or removes one element from the undoArray.
         *
         * @param {Object} payload payload object.
         * @param {Boolean} payload.remove Remove one feature from the array if true.
         * @param {Object} [payload.feature] feature to be added to the array, if given.
         * @returns {void}
         */
        updateUndoArray: ({state, commit}, {remove, feature}) => {
            const undoArray = state.undoArray;

            if (remove) {
                undoArray.pop();
            }
            else {
                undoArray.push(feature);
            }
            commit("setUndoArray", undoArray);
        },
        ...withoutGUI
    };

export default actions;
