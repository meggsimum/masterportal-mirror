/**
 * User type definition
 * @typedef {Object} FileImportState
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {String[]}   importedFileNames - list of names of successfully imported files
 * @property {Object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 */

export default {
    active: false,
    deactivateGFI: false,
    icon: "bi-cloud-download",
    id: "fileImport",
    name: "common:menu.tools.fileImport",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    selectedFiletype: "auto",
    importedFileNames: [],
    supportedFiletypes: {
        auto: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    }
};
