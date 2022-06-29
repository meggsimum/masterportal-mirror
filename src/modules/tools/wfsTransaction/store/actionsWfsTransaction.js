import axios from "axios";
import {Draw, Modify, Select} from "ol/interaction";
import prepareFeatureProperties from "../utils/prepareFeatureProperties";
import writeTransaction from "../utils/writeTransaction";
import loader from "../../../../utils/loaderOverlay";
import getLayerInformation from "../utils/getLayerInformation";

let drawInteraction,
    drawLayer,
    modifyInteraction,
    selectInteraction;

const actions = {
    /**
     * @param {object} context actions context object.
     * @param {("LineString"|"Point"|"Polygon"|"delete"|"edit")} interaction Identifier of the selected interaction.
     * @returns {void}
     */
    async prepareInteraction ({commit, dispatch, getters, rootGetters}, interaction) {
        const {currentInteractionConfig, currentLayerId, currentLayerIndex, layerInformation, featureProperties, toggleLayer} = getters,
            // NOTE: As this is a rootGetter, the naming scheme is used like this.
            // eslint-disable-next-line new-cap
            sourceLayer = rootGetters["Maps/getLayerById"]({layerId: currentLayerId});

        commit("setSelectedInteraction", interaction);
        if (interaction === "LineString" || interaction === "Point" || interaction === "Polygon") {
            drawLayer = await dispatch("Maps/addNewLayerIfNotExists", {layerName: "tool/wfsTransaction/vectorLayer"}, {root: true});

            const {style} = layerInformation[currentLayerIndex],
                drawOptions = {
                    source: drawLayer.getSource(),
                    // TODO: It would generally be really cool to be able to actually draw Multi-X geometries
                    //  and not just have this as a fix for services only accepting Multi-X geometries
                    type: (currentInteractionConfig[interaction].multi ? "Multi" : "") + interaction,
                    geometryName: featureProperties.find(({type}) => type === "geometry").key
                };

            if (interaction === "Point") {
                drawOptions.style = style;
            }
            drawInteraction = new Draw(drawOptions);
            modifyInteraction = new Modify({source: drawLayer.getSource()});
            drawLayer.setStyle(style);

            if (toggleLayer) {
                sourceLayer.setVisible(false);
            }

            drawInteraction.on("drawend", () => {
                if (Radio.request("ModelList", "getModelByAttributes", {id: currentLayerId}).get("isOutOfRange")) {
                    drawLayer.getSource().once("change", () => drawLayer.getSource().clear());
                    dispatch("Alerting/addSingleAlert", {
                        category: "Info",
                        displayClass: "info",
                        content: i18next.t("common:modules.tools.wfsTransaction.error.geometryOutOfRange"),
                        mustBeConfirmed: false
                    }, {root: true});
                    return;
                }
                dispatch("Maps/removeInteraction", drawInteraction, {root: true});
                dispatch("Maps/addInteraction", modifyInteraction, {root: true});
            });
            dispatch("Maps/addInteraction", drawInteraction, {root: true});
        }
        // TODO(roehlipa): key === edit
        //  ==> Update operation
        else if (interaction === "delete") {
            selectInteraction = new Select({
                layers: [sourceLayer]
            });
            selectInteraction.on("select", event => {
                dispatch("ConfirmAction/addSingleAction", {
                    actionConfirmedCallback: () => dispatch("sendTransaction", event.selected[0]),
                    confirmCaption: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.confirm"),
                    textContent: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.text"),
                    headline: i18next.t("common:modules.tools.wfsTransaction.deleteInteraction.headline")
                }, {root: true});
            });
            dispatch("Maps/addInteraction", selectInteraction, {root: true});
            // TODO(roehlipa): Add a trashcan next to the mouse (without bugs) -> see e.g. draw
        }
    },
    reset ({commit, dispatch, getters, rootGetters}) {
        commit("setSelectedInteraction", null);
        dispatch("Maps/removeInteraction", drawInteraction, {root: true});
        dispatch("Maps/removeInteraction", modifyInteraction, {root: true});
        dispatch("Maps/removeInteraction", selectInteraction, {root: true});
        commit("Maps/removeLayerFromMap", drawLayer, {root: true});
        drawInteraction = undefined;
        modifyInteraction = undefined;
        selectInteraction?.getFeatures().clear();
        selectInteraction = undefined;
        drawLayer = undefined;
        // NOTE: As this is a rootGetter, the naming scheme is used like this.
        // eslint-disable-next-line new-cap
        rootGetters["Maps/getLayerById"]({layerId: getters.currentLayerId})?.setVisible(true);
    },
    save ({dispatch, getters}) {
        // TODO(roehlipa): Form validation
        const {featureProperties, selectedInteraction} = getters,
            feature = drawLayer.getSource().getFeatures()[0],
            geometry = {key: null, value: null};

        if (feature === undefined) {
            // TODO(roelipa): Information to user
            console.warn("No features");
            return;
        }
        featureProperties.forEach(property => {
            if (property.type === "geometry") {
                // NOTE: The property of the geometry needs to be at the end of the feature inside the of the XML.
                geometry.key = property.key;
                geometry.value = feature.get(property.key);
                feature.unset(property.key);
                return;
            }
            if (property.value === "" || property.value === null) {
                if (property.required) {
                    // TODO(roehlipa): Somehow we got here, so show an error
                    return;
                }
                if (selectedInteraction === "insert") {
                    feature.unset(property.key);
                }
                else if (selectInteraction === "selectedUpdate") {
                    feature.set(property.key, null);
                }
            }
            else if (["integer", "int", "decimal"].includes(property.type)) {
                feature.set(property.key, Number(property.value));
            }
            // TODO(roehlipa): Is there a case needed for booleans?
            else {
                feature.set(property.key, property.value);
            }
        });
        feature.set(geometry.key, geometry.value);
        dispatch("sendTransaction", feature);
    },
    sendTransaction ({dispatch, getters, rootGetters}, feature) {
        const {currentLayerIndex, layerInformation, selectedInteraction} = getters,
            layer = layerInformation[currentLayerIndex];

        loader.show();
        axios({
            url: layer.url,
            data: writeTransaction(
                feature,
                layer,
                ["LineString", "Point", "Polygon"].includes(selectedInteraction)
                    ? "insert"
                    : selectedInteraction,
                rootGetters["Maps/projectionCode"]),
            method: "POST",
            withCredentials: layer.isSecured,
            headers: {"Content-Type": "text/xml"},
            responseType: "text/xml"
        })
            .then(() => {
                /*
                    TODO(roehlipa):
                        a) Give feedback on success
                        b) Throw error if transaction failed or something wonky (e.g. more than one inserted) happened => Read response XML
                 */
            })
            .catch(() => {
                // TODO(roehlipa): Show error or give feedback
            })
            .finally(() => {
                loader.hide();
                dispatch("reset");
                Radio.request("ModelList", "getModelByAttributes", {id: layer.id}).layer.getSource().refresh();
            });
    },
    setActive ({commit, dispatch, getters: {layerIds, layerInformation}}, active) {
        commit("setActive", active);

        if (active) {
            commit("setLayerInformation", getLayerInformation(layerIds));
            commit("setCurrentLayerIndex", layerInformation.findIndex(layer => layer.isSelected));
            dispatch("setFeatureProperties");
        }
        else {
            dispatch("reset");
        }
    },
    async setFeatureProperties ({commit, getters: {currentLayerIndex, layerInformation}}) {
        if (currentLayerIndex === -1) {
            commit("setFeatureProperties", "All layers not selected in tree");
            return;
        }
        const layer = layerInformation[currentLayerIndex];

        if (!Object.prototype.hasOwnProperty.call(layer, "featurePrefix")) {
            commit("setFeatureProperties", "Layer not correctly configured; might be missing 'featurePrefix'");
            return;
        }
        if (!layer.isSelected) {
            commit("setFeatureProperties", "Layer not selected in tree");
            return;
        }
        commit("setFeatureProperties", await prepareFeatureProperties(layer));
    }
};

export default actions;