import {createStyle} from "../../utils/style/createStyle";
import {calculateCircle} from "../../utils/circleCalculations";

const errorBorder = "#E10019";

/**
 * Creates a listener for the addfeature event of the source of the layer used for the Draw Tool.
 * NOTE: Should the zIndex only be counted up if the feature gets actually drawn?
 *
 * @param {Object} context actions context object.
 * @param {String} drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
 * @returns {void}
 */
export function drawInteractionOnDrawEvent ({state, commit, dispatch, rootState}, drawInteraction) {
    const stateKey = state.drawType.id + "Settings",
        // we need a clone of styleSettings each time a draw event is called, otherwise the copy will influence former drawn objects
        // using "{styleSettings} = getters," would lead to a copy not a clone - don't use getters for styleSettings here
        styleSettings = JSON.parse(JSON.stringify(state[stateKey])),
        interaction = state["drawInteraction" + drawInteraction],
        circleMethod = styleSettings.circleMethod,
        drawType = state.drawType,
        layerSource = state.layer.getSource();

    commit("setAddFeatureListener", layerSource.once("addfeature", event => {
        event.feature.set("fromDrawTool", true);
        dispatch("updateUndoArray", {remove: false, feature: event.feature});
        if (circleMethod === "defined" && drawType.geometry === "Circle") {
            const innerRadius = !isNaN(styleSettings.circleRadius) ? parseFloat(styleSettings.circleRadius) : null,
                outerRadius = !isNaN(styleSettings.circleOuterRadius) ? parseFloat(styleSettings.circleOuterRadius) : null,
                circleRadius = event.feature.get("isOuterCircle") ? outerRadius : innerRadius,
                circleCenter = event.feature.getGeometry().getCenter();

            if (innerRadius === null || innerRadius === 0) {
                state.innerBorderColor = errorBorder;

                if (drawType.id === "drawDoubleCircle") {
                    if (outerRadius === null || outerRadius === 0) {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedTwoCircles"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = errorBorder;
                    }
                    else {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedInnerCircle"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = "";
                    }
                }
                else {
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedRadius"), {root: true});
                    layerSource.removeFeature(event.feature);
                }
            }
            else {
                if (outerRadius === null || outerRadius === 0) {
                    if (drawType.id === "drawDoubleCircle") {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedOuterCircle"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = errorBorder;
                    }
                    else {
                        calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                    }
                }
                else {
                    calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                    state.outerBorderColor = "";
                }
                state.innerBorderColor = "";
            }
        }

        if (event.feature.get("isOuterCircle")) {
            styleSettings.colorContour = styleSettings.outerColorContour;
        }

        event.feature.setStyle(function (feature) {
            if (feature.get("isVisible")) {
                return createStyle(feature.get("drawState"), styleSettings);
            }
            return undefined;
        });

        event.feature.set("invisibleStyle", createStyle(event.feature.get("drawState"), styleSettings));

        commit("setZIndex", state.zIndex + 1);
    }));

    if (state.currentInteraction === "draw" && circleMethod === "defined" && drawType.geometry === "Circle") {
        interaction.finishDrawing();
    }
}
