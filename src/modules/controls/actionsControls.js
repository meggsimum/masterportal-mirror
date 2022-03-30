const actions = {

    /**
     * Adds a control dynamically to componentMap.
     * @param {Object} control control to be added
     * @returns {void}
     */
    addControl: ({commit}, control) => {
        const controlName = control.name !== undefined ? control.name.charAt(0).toLowerCase() + control.name.slice(1) : control.name;

        commit("registerModule", {name: controlName, control: control});
    }
};

export default actions;
