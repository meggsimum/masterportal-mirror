/**
 * User type definition
 * @typedef {Object} sessionTool
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Array}  isVisibleInMenu: if true, component can be activatet over menu
 */
const state = {
    active: false,
    deactivateGFI: true,
    icon: "bi-bullseye",
    id: "sessionTool",
    name: "common:menu.tools.sessionTool",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true
};

export default state;
