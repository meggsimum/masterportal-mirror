/**
 * User type definition
 * @typedef {Object} LayerSliderState
 * @property {Boolean} active If true, LayerSlider will rendered.
 * @property {String} id Id of the LayerSlider component.
 * @property {String} name "Name of the LayerSlider.
 * @property {String} icon "bi-film" Icon.
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param).
 * @property {Boolean} resizableWindow if true, window is resizable (config-param).
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param).
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param).
 * @property {String} title The title of the currently selected layer.
 * @property {Objet[]} layerIds The configured layer with their ids and titles.
 * @property {object} activeLayer The Active layer.
 * @property {Number} timeInterval Time interval.
 * @property {*} windowsInterval The Windows Interval used to iterate through the layers.
 * @property {Number} progressBarWidth The Width of the progress bar.
 * @property {String} currentProgressBarWidth The style of the progress bar.
 * @property {String} sliderType The Slidertype. "player" or "handle".
 * @property {String} dataSliderMin Data slider min. Used for slider input.
 * @property {String} dataSliderMax Data slider max. Used for slider input.
 * @property {String} dataSliderTicks Data slider ticks. Show the positions of the layers in the slider. Used for slider input.
 */
const state = {
    active: false,
    id: "layerSlider",
    name: "common:menu.tools.layerSlider",
    icon: "bi-film",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    title: "common:modules.tools.layerSlider.title",
    layerIds: [],
    activeLayer: {
        layerId: "",
        index: -1
    },

    timeInterval: 2000,
    windowsInterval: null,
    progressBarWidth: 0,
    currentProgressBarWidth: "width: 0%; margin-left: 0%",
    sliderType: "player",

    dataSliderMin: "0",
    dataSliderMax: "",
    dataSliderTicks: ""
};

export default state;
