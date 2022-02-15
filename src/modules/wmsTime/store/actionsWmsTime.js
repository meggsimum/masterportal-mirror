import drawLayer from "../utils/drawLayer";
import getPosition from "../utils/getPosition";
import mapCollection from "../../../core/dataStorage/mapCollection.js";

const actions = {
    windowWidthChanged ({commit, dispatch, state, getters}) {
        commit("setWindowWidth");

        if (!getters.minWidth && state.layerSwiper.active) {
            dispatch("toggleSwiper", state.timeSlider.currentLayerId + state.layerAppendix);
        }
    },
    /**
     * Toggles the LayerSwiper.
     * If the LayerSwiper is deactivated, the second layer is deactivated and removed from the ModelList.
     *
     * @param {String} id Id of the Layer that should be toggled.
     * @fires Core#RadioTriggerUtilRefreshTree
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core.ModelList#RadioTriggerModelListRemoveModelsById
     * @fires Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     * @fires Core.ConfigLoader#RadioTriggerParserRemoveItem
     * @returns {void}
     */
    toggleSwiper ({commit, state}, id) {
        commit("setLayerSwiperActive", !state.layerSwiper.active);

        const secondId = id.endsWith(state.layerAppendix) ? id : id + state.layerAppendix,
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id: state.layerSwiper.active ? id : secondId});

        if (state.layerSwiper.active) {
            const {name, parentId, level, layers, url, version, time} = layerModel.attributes;

            Radio.trigger("Parser", "addLayer",
                name + "_second", secondId, parentId,
                level, layers, url, version,
                {transparent: false, isSelected: true, time}
            );
            Radio.trigger("ModelList", "addModelsByAttributes", {id: secondId});
        }
        else {
            // If the button of the "original" window is clicked, it is assumed, that the time value selected in the added window is desired to be further displayed.
            if (!id.endsWith(state.layerAppendix)) {
                const {TIME} = layerModel.get("layerSource").params_,
                    {transparency} = layerModel.attributes;

                layerModel.updateTime(id, TIME);
                Radio.trigger("ModelList", "setModelAttributesById", id, {transparency});
                commit("setTimeSliderDefaultValue", TIME);
            }
            mapCollection.getMap("ol", "2D").removeLayer(layerModel.get("layer"));
            Radio.trigger("ModelList", "removeModelsById", secondId);
            Radio.trigger("Parser", "removeItem", secondId);
        }
        Radio.trigger("Util", "refreshTree");
    },
    /**
     * Sets the postion of the layerSwiper to state according to the x-coordinate of the mousedown event
     * or adjusts it based on the direction of the key pressed by the state defined value.
     *
     * @param {KeyboardEvent.keydown | MouseEvent.mousemove} event DOM Event.
     * @returns {void}
     */
    moveSwiper ({state, commit, dispatch, getters}, event) {
        const position = getPosition(event, state.layerSwiper.valueX, getters.currentTimeSliderObject.keyboardMovement);

        commit("setLayerSwiperValueX", position);
        commit("setLayerSwiperStyleLeft", position);
        dispatch("updateMap");
    },
    /**
     * Updates the map so that the layer is displayed clipped again.
     *
     * @returns {void}
     */
    updateMap ({state, rootGetters}) {
        if (!state.timeSlider.playing) {
            mapCollection.getMap(rootGetters["Map/mapId"], rootGetters["Map/mapMode"]).render();
        }
        state.layerSwiper.targetLayer.once("prerender", renderEvent => drawLayer(mapCollection.getMap(rootGetters["Map/mapId"], rootGetters["Map/mapMode"]).getSize(), renderEvent, state.layerSwiper.valueX));
        state.layerSwiper.targetLayer.once("postrender", ({context}) => {
            context.restore();
        });
    }
};

export default actions;
