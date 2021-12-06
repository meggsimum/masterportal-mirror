/**
 * User type definition
 * @typedef {Object} LayerClusterTogglerState
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String[]} clusterList - a list of layer ids to activate/deactivate with one single click
 */

export default {
    active: false,
    deactivateGFI: false,
    icon: "bi-list",
    id: "layerClusterToggler",
    name: "common:menu.tools.layerClusterToggler",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    clusterList: null
};
