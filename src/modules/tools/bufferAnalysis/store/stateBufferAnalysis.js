import * as jsts from "jsts/dist/jsts";
import {Fill, Stroke, Style} from "ol/style";
import {ResultType} from "./enums";

/**
 * User type definition
 * @typedef {Object} BufferAnalysisState
 * @property {Boolean} active if true, BufferAnalysis will rendered
 * @property {String} id id of the BufferAnalysis component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth initial width of the tool
 * @property {String} timerId timerId for debounce buffer radius input
 * @property {?Object} selectedSourceLayer data binding for source layer selection
 * @property {?Object} selectedTargetLayer data binding for target layer selection
 * @property {?String} savedUrl data binding for saved url field
 * @property {ResultType} resultType possible values: "OUTSIDE" or "WITHIN"
 * @property {Number} bufferRadius data binding for the buffer radius input
 * @property {Object} bufferLayer holds the layer with buffer features
 * @property {Object} resultLayer holds the layer with result features
 * @property {Object[]} selectOptions holds the options for layer select elements
 * @property {Object[]} intersections holds the intersection polygons after calculation
 * @property {Object[]} resultFeatures holds the result features before they are added to a new layerSource
 * @property {Object} jstsParser holds the JSTS parser
 * @property {Object} geoJSONWriter holds the JSTS geoJSON writer
 * @property {Object} bufferStyle holds the default style for buffer features
 */
const state = {
    active: false,
    id: "bufferAnalysis",
    name: "common:menu.tools.bufferAnalysis",
    icon: "bi-arrows-angle-expand",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    initialWidth: 500,
    timerId: null,
    selectedSourceLayer: null,
    selectedTargetLayer: null,
    savedUrl: null,
    resultType: ResultType.OUTSIDE,
    bufferRadius: 0,
    inputBufferRadius: 0,
    bufferLayer: {},
    resultLayer: {},
    selectOptions: [],
    intersections: [],
    resultFeatures: [],
    jstsParser: new jsts.io.OL3Parser(),
    geoJSONWriter: new jsts.io.GeoJSONWriter(),
    bufferStyle: new Style({
        fill: new Fill({
            color: ["255", "230", "65", "0.3"]
        }),
        stroke: new Stroke({
            color: ["255", "50", "0", "0.5"],
            width: 2
        })
    })
};

export default state;
