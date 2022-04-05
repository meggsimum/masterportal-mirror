import {generateSimpleMutations} from "../../../app-store/utils/generators";
import initialState from "./stateWmsTime";
import findCurrentTimeSliderObject from "../utils/findCurrentTimeSliderObject";
import Vue from "vue";

const mutations = {
    ...generateSimpleMutations(initialState),
    setWindowWidth (state) {
        state.windowWidth = window.innerWidth;
    },
    // TimeSlider mutations
    addTimeSliderObject (state, timeSliderObject) {
        state.timeSlider.objects = [
            ...state.timeSlider.objects,
            timeSliderObject
        ];
    },
    setTimeSliderActive ({timeSlider}, {active, currentLayerId, playbackDelay}) {
        timeSlider.active = active;
        timeSlider.currentLayerId = currentLayerId;
        timeSlider.playbackDelay = playbackDelay;
    },
    setTimeSliderDefaultValue ({timeSlider: {currentLayerId, objects}}, newValue) {
        const currentObject = findCurrentTimeSliderObject(currentLayerId, objects);

        // NOTE: This is needed when the LayerSwiper is closed and no new value was selected in the second
        // TimeSlider thus newValue would be the same as defaultValue and would not trigger the update Event.
        currentObject.defaultValue = currentObject.timeRange[0];
        Vue.nextTick(() => {
            currentObject.defaultValue = newValue;
        });
    },
    setTimeSliderPlaying ({timeSlider}, playing) {
        timeSlider.playing = playing;
    },
    // LayerSwiper mutations
    setLayerSwiperActive (state, active) {
        state.layerSwiper.active = active;
    },
    setLayerSwiperDomSwiper (state, target) {
        state.layerSwiper.swiper = target;
    },
    setLayerSwiperValueX (state, clientX) {
        state.layerSwiper.valueX = clientX;
    },
    setLayerSwiperStyleLeft (state, clientX) {
        state.layerSwiper.swiper.style.left = clientX + "px";
    },
    setLayerSwiperTargetLayer (state, layer) {
        state.layerSwiper.targetLayer = layer;
    }
};

export default mutations;
