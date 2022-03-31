export default {
    /**
     * Registers a new control element.
     * Can be called e.g. by an addon, if Store is globally accessible.
     * @param {Object} state current state
     * @param {String} name name of control in config.json
     * @param {Object} control Vue Component
     * @param {Boolean} [hiddenMobile=false] whether component is visible in mobile resolution
     * @param {Boolean} [bottomControlsFlag=false] whether component is to be shown at lower end of the page
     * @returns {void}
     */
    registerControl (state, {name, control, hiddenMobile = false, bottomControlsFlag = false}) {
        state.componentMap = {
            ...state.componentMap,
            [name]: control
        };
        if (hiddenMobile) {
            state.hiddenMobile = [
                ...state.hiddenMobile,
                name
            ];
        }
        if (bottomControlsFlag) {
            state.bottomControls = [
                ...state.bottomControls,
                name
            ];
        }
    },
    /**
     * Removes a control element.
     * @param {Object} state current state
     * @param {String} name name of control to remove from state
     * @returns {void}
     */
    unregisterControl (state, name) {
        const nextMap = {...state.componentMap};

        delete nextMap[name];

        state.componentMap = nextMap;
        state.hiddenMobile = state.hiddenMobile.filter(s => s !== name);
        state.bottomControls = state.bottomControls.filter(s => s !== name);
    }
};
