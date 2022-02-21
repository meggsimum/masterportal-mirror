import {WFS} from "ol/format.js";

const state = {
    ids: [],
    attribute: "flaechenid",
    imgLink: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg",
    wfsId: "4560",
    featureCenterList: [],
    format: new WFS(),
    features: [],
    anchor: {
        anchorX: 0.5,
        anchorY: 24,
        anchorXUnits: "fraction",
        anchorYUnits: "pixels"
    }, // @deprecated in version 3.0.0
    imageScale: 2, // @deprecated in version 3.0.0,
    useProxy: false
};

export default state;
