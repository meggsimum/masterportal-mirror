// needed for dev mode since parcel babels async/await
import "babel-polyfill";
import "ol/ol.css";

import {Style, Stroke, Fill} from "ol/style.js";

import * as mpapi from "../src";

import services from "./config/services.json";
import portalConfig from "./config/portal.json";
import localGeoJSON from "./config/localGeoJSON.js";

//* Add elements to window to play with API in console
window.mpapi = {
    ...mpapi,
    map: null,
    layers: []
};
// */

//* Cleans up map before it is re-rendered (happens on every save during dev mode)
document.getElementById(portalConfig.target).innerHTML = "";
// */

//* Fake service that holds client-side prepared geojson; also nice to test automatic transformation since data is in WGS 84
const localService = {
    id: "2002",
    typ: "GeoJSON",
    features: localGeoJSON
};
services.push(localService);
// */

//* geojson styling function call to override default styling
mpapi.geojson.setCustomStyles({
    MultiPolygon: new Style({
        stroke: new Stroke({
            width: 2,
            color: "#000000"
        }),
        fill: new Fill({
            color: "#FFFFFF55"
        })
    })
});
// */

const renderMap = (configuration, layerIds) => {
    window.mpapi.map = mpapi.createMap(configuration);
    layerIds.forEach(id =>
        window.mpapi.layers.push(mpapi.addLayer(id))
    );
}

//* SYNCHRONOUS EXAMPLE: layerConf is known
renderMap(
    {
        ...portalConfig,
        layerConf: services
    },
    [
        "1001",
        "2001",
        // fake local layer:
        "2002"
    ]
);
//*/

/* ASYNCHRONOUS EXAMPLE: layer Conf is loaded
initializeLayerList(
    "http://geoportal-hamburg.de/lgv-config/services-internet.json",
    conf => renderMap(
        {
            ...portalConfig,
            layerConf: conf
        },
        ["6357", "6074"]
    )
);
//*/
