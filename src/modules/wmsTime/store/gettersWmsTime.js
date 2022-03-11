import {generateSimpleGetters} from "../../../app-store/utils/generators";
import initialState from "./stateWmsTime";
import findCurrentTimeSliderObject from "../utils/findCurrentTimeSliderObject";

const getters = {
    ...generateSimpleGetters(initialState),
    // TimeSlider getters
    currentTimeSliderObject ({timeSlider: {currentLayerId, objects}}) {
        return findCurrentTimeSliderObject(currentLayerId, objects);
    },
    defaultValue (_, {currentTimeSliderObject}) {
        return currentTimeSliderObject.defaultValue;
    },
    /**
     * Test whether the current width surpasses the mobileWidth
     * (Width with which the mobile view is triggered).
     *
     * @param {number} windowWidth Current width (window.innerWidth) of the window in px.
     * @returns {boolean} True, if the mobile view is not shown; false, else.
     */
    minWidth ({windowWidth}) {
        const mobileWidth = 800;

        return windowWidth > mobileWidth;
    },
    timeRange (_, {currentTimeSliderObject}) {
        return currentTimeSliderObject?.timeRange || [];
    }
};

export default getters;
