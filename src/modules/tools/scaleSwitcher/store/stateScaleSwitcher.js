/**
 * User type definition
 * @typedef {Object} ScaleSwitcherState
 * @property {Boolean} active if true, scaleSwitcher will rendered
 * @property {String} id id of the ScaleSwitcher component
 * @property {String} currentScale scale selected in ScaleSwitcher
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "scaleSwitcher",
    // defaults for config.json parameters
    name: "common:menu.tools.scaleSwitcher",
    icon: "bi-arrows-angle-contract",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
