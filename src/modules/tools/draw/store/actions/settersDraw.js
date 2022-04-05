/**
 * sets the styleSettings for the current drawType
 *
 * @param {Object} context the dipendencies
 * @param {Object} styleSettings the style to set
 * @returns {void}
 */
function setStyleSettings ({getters, commit}, styleSettings) {
    const stateKey = getters.drawType.id + "Settings",
        mutationKey = `set${stateKey[0].toUpperCase()}${stateKey.slice(1)}`;

    commit(mutationKey, styleSettings);
}

/**
 * Sets the active property of the state to the given value.
 * Also starts processes if the tool is be activated (active === true).
 *
 * @param {Object} context actions context object.
 * @param {Boolean} active Value deciding whether the tool gets activated or deactivated.
 * @returns {void}
 */
function setActive ({state, commit, dispatch, rootState}, active) {
    commit("setActive", active);

    if (active) {
        commit("setSymbol", state.iconList[0]);
        commit("setLayer", Radio.request("Map", "createLayerIfNotExists", "import_draw_layer"));
        commit("setImgPath", rootState?.configJs?.wfsImgPath);

        dispatch("createDrawInteractionAndAddToMap", {active: state.currentInteraction === "draw"});
        dispatch("createSelectInteractionAndAddToMap", state.currentInteraction === "delete");
        dispatch("createModifyInteractionAndAddToMap", state.currentInteraction === "modify");

        if (state.withoutGUI) {
            dispatch("toggleInteraction", "draw");
        }
    }
}

/**
 * Sets the inner radius for the circle of the current drawType.
 * @info the internal representation of circleRadius is always in meters
 * @param {Object} context actions context object.
 * @param {Number} radius the radius of the inner circle in meters
 * @returns {void}
 */
function setCircleRadius ({getters, commit, dispatch}, radius) {
    const {styleSettings} = getters;

    styleSettings.circleRadius = radius;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateCircleRadiusDuringModify", radius);
}

/**
 * Sets the method for drawing a circle of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the circleMethod.
 * @param {HTMLSelectElement} event.target The HTML select element for the circleMethod.
 * @returns {void}
 */
function setCircleMethod ({getters, commit}, {target}) {
    const circleMethod = target.options[target.selectedIndex].value,
        {styleSettings} = getters;

    styleSettings.circleMethod = circleMethod;

    setStyleSettings({getters, commit}, styleSettings);
}

/**
 * Sets the outer radius for the circle of the current drawType.
 * @info the internal representation of circleOuterRadius is always in meters
 * @param {Object} context actions context object.
 * @param {Number} radius the radius of the inner circle in meters
 * @returns {void}
 */
function setCircleOuterRadius ({getters, commit, dispatch}, radius) {
    const {styleSettings} = getters;

    styleSettings.circleOuterRadius = radius;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateCircleRadiusDuringModify", radius);
}

/**
 * Sets the color of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the color.
 * @param {HTMLSelectElement} event.target The HTML select element for the color.
 * @returns {void}
 */
function setColor ({getters, commit, dispatch}, {target}) {
    const color = target.options[target.selectedIndex].value.split(","),
        colorCopy = [],
        {styleSettings} = getters;

    color.forEach(val => {
        colorCopy.push(parseInt(val, 10));
    });
    colorCopy.push(styleSettings.opacity);

    styleSettings.color = colorCopy;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the color of the contours of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the colorContour.
 * @param {HTMLSelectElement} event.target The HTML select element for the colorContour.
 * @returns {void}
 */
function setColorContour ({getters, commit, dispatch}, {target}) {
    const color = target.options[target.selectedIndex].value.split(","),
        colorCopy = [],
        {styleSettings} = getters;

    color.forEach(val => {
        colorCopy.push(parseInt(val, 10));
    });
    colorCopy.push(styleSettings.opacityContour);

    styleSettings.colorContour = colorCopy;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}
/**
 * Sets the outer color of the contours of the drawType drawDoubleCircle.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the colorContour.
 * @param {HTMLSelectElement} event.target The HTML select element for the colorContour.
 * @returns {void}
 */
function setOuterColorContour ({getters, commit, dispatch}, {target}) {
    const color = target.options[target.selectedIndex].value.split(","),
        colorCopy = [],
        {styleSettings} = getters;

    color.forEach(val => {
        colorCopy.push(parseInt(val, 10));
    });
    colorCopy.push(styleSettings.opacityContour);

    styleSettings.outerColorContour = colorCopy;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the drawType and triggers other methods to add the new interactions
 * to the map and remove the old one.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the drawType.
 * @param {HTMLSelectElement} event.target The HTML select element for the drawTypes.
 * @returns {void}
 */
function setDrawType ({commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex];

    commit("setFreeHand", selectedElement.id === "drawCurve");
    commit("setDrawType", {id: selectedElement.id, geometry: selectedElement.value});

    dispatch("updateDrawInteraction");
}

/**
 * Sets the font for the text of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the font.
 * @param {HTMLSelectElement} event.target The HTML select element for the font.
 * @returns {void}
 */
function setFont ({getters, commit, dispatch}, {target}) {
    const font = target.options[target.selectedIndex].value,
        {styleSettings} = getters;

    styleSettings.font = font;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the font size for the text of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the fontSize.
 * @param {HTMLSelectElement} event.target The HTML select element for the fontSize.
 * @returns {void}
 */
function setFontSize ({getters, commit, dispatch}, {target}) {
    const fontSize = target.options[target.selectedIndex].value,
        {styleSettings} = getters;

    styleSettings.fontSize = fontSize;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the opacity of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the opacity.
 * @param {HTMLSelectElement} event.target The HTML select element for the opacity.
 * @returns {void}
 */
function setOpacity ({getters, commit, dispatch}, {target}) {
    const opacity = parseFloat(target.options[target.selectedIndex].value),
        {styleSettings} = getters;

    styleSettings.opacity = opacity;
    styleSettings.color[3] = opacity;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the opacity for the contours of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the opacityContour.
 * @param {HTMLSelectElement} event.target The HTML select element for the opacityContour.
 * @returns {void}
 */
function setOpacityContour ({getters, commit, dispatch}, {target}) {
    const opacityContour = parseFloat(target.options[target.selectedIndex].value),
        {styleSettings} = getters;

    styleSettings.opacityContour = opacityContour;
    styleSettings.colorContour[3] = opacityContour;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the size of the point.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the pointSize.
 * @param {HTMLSelectElement} event.target The HTML select element for the pointSize.
 * @returns {void}
 */
function setPointSize ({commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex];

    commit("setPointSize", parseInt(selectedElement.value, 10));
    dispatch("updateDrawInteraction");
}

/**
 * Sets the strokwidth of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the strokewidth.
 * @param {HTMLSelectElement} event.target The HTML select element for the strokewidth.
 * @returns {void}
 */
function setStrokeWidth ({getters, commit, dispatch}, {target}) {
    const strokeWidth = target.options[target.selectedIndex].value,
        {styleSettings} = getters;

    styleSettings.strokeWidth = parseInt(strokeWidth, 10);

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the symbol.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the symbol.
 * @param {HTMLSelectElement} event.target The HTML select element for the symbol.
 * @returns {void}
 */
function setSymbol ({state, commit, dispatch}, {target}) {
    const selectedElement = target.options[target.selectedIndex],
        iconList = Object.values(state.iconList);

    // Find the correct symbol
    // NOTE: caption is deprecated in 3.0.0
    commit("setSymbol", iconList.filter(icon => icon.id ? icon.id === selectedElement.value : icon.caption === selectedElement.value)[0]);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the text of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the text.
 * @param {HTMLInputElement} event.target The HTML input element for the text.
 * @returns {void}
 */
function setText ({getters, commit, dispatch}, {target}) {
    const text = target.value,
        {styleSettings} = getters;

    styleSettings.text = text;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

/**
 * Sets the unit for the radius of the circle of the current drawType.
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for the unit.
 * @param {HTMLSelectElement} event.target The HTML select element for the unit.
 * @returns {void}
 */
function setUnit ({getters, commit, dispatch}, {target}) {
    const unit = target.options[target.selectedIndex].value,
        {styleSettings} = getters;

    styleSettings.unit = unit;

    setStyleSettings({getters, commit}, styleSettings);
    dispatch("updateDrawInteraction");
}

export {
    setStyleSettings,
    setActive,
    setCircleRadius,
    setCircleMethod,
    setCircleOuterRadius,
    setColor,
    setColorContour,
    setOuterColorContour,
    setDrawType,
    setFont,
    setFontSize,
    setOpacity,
    setOpacityContour,
    setPointSize,
    setStrokeWidth,
    setSymbol,
    setText,
    setUnit
};
