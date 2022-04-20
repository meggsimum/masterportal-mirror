import {createGfiFeature} from "../../../api/gfi/getWmsFeaturesByMimeType";

export default {
    /**
     * Sets the config-params of this MouseHover into state.
     * Adds the overlay and eventListener for the map.
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    initialize ({state, commit, dispatch}, map) {
        const {numFeaturesToShow, infoText} = Config.mouseHover;
        let featuresAtPixel = [];

        commit("setMouseHoverLayers");
        commit("setMouseHoverInfos");

        if (numFeaturesToShow) {
            commit("setNumFeaturesToShow", numFeaturesToShow);
        }
        if (infoText) {
            commit("setInfoText", infoText);
        }
        map.on("pointermove", (evt) => {
            featuresAtPixel = [];
            commit("setHoverPosition", evt.coordinate);
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer?.getVisible() && layer?.get("gfiAttributes") && layer?.get("gfiAttributes") !== "ignore") {
                    if (feature.getProperties().features) {
                        feature.get("features").forEach(function (clusteredFeature) {
                            featuresAtPixel.push(createGfiFeature(
                                layer,
                                "",
                                clusteredFeature
                            ));
                        });
                    }
                    else {
                        featuresAtPixel.push(createGfiFeature(
                            layer,
                            "",
                            feature
                        ));
                    }
                }
            });
            state.overlay.setPosition(evt.coordinate);
            state.overlay.setElement(document.querySelector("#mousehover-overlay"));
            Radio.trigger("Map", "addOverlay", state.overlay);
            commit("setActive", true);
            return featuresAtPixel.length > 0 ? dispatch("filterInfos", featuresAtPixel) : commit("setInfoBox", null);
        });
    },
    /**
     * Filters the infos from each feature that should be displayed.
     * @param {Array} features array of hovered Features
     * @returns {void}
     */
    filterInfos ({state, commit, dispatch}, features) {
        const infoBox = [];

        if (features.length > 0) {
            features.forEach((feature) => {
                const configInfosForFeature = state.mouseHoverInfos.find(info => info.id === feature.getLayerId());

                if (configInfosForFeature) {
                    const featureProperties = feature.getProperties(),
                        featureInfos = typeof configInfosForFeature.mouseHoverField === "string" ? configInfosForFeature.mouseHoverField : configInfosForFeature.mouseHoverField.filter(key => Object.keys(featureProperties).includes(key)),
                        featureDetails = [];

                    if (Array.isArray(featureInfos)) {
                        featureInfos.forEach(info => {
                            featureDetails.push(featureProperties[info]);
                        });
                    }
                    else {
                        featureDetails.push(featureProperties[featureInfos]);
                    }
                    infoBox.push(featureDetails);
                    commit("setPleaseZoom", features.length > state.numFeaturesToShow);
                    commit("setInfoBox", infoBox.slice(0, state.numFeaturesToShow));
                    dispatch("setOffset");
                }
            });
        }
    },
    /**
     * Sets the offset for the mouseHover popup depending on its height.
     * It has to be an async function for the HTML Collection to be filled with
     * the expected div.
     * @returns {void}
     */
    async setOffset ({state}) {
        try {
            const htmlElement = await document.getElementsByClassName("mouseHover");

            state.overlay.setOffset([0, -htmlElement[0].offsetHeight]);
        }
        catch (error) {
            console.error(error);
        }
    }
};
