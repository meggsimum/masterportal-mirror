// needed for dev mode since parcel babels async/await
import "babel-polyfill";
import "ol/ol.css";

import {Style, Stroke, Fill} from "ol/style.js";

import * as mpapi from "../src";

import services from "./config/services.json";
import portalConfig from "./config/portal.json";
import localGeoJSON from "./config/localGeoJSON.js";

const hamburgServicesUrl = "http://geoportal-hamburg.de/lgv-config/services-internet.json";

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

//* SYNCHRONOUS EXAMPLE: layerConf is known
window.mpapi.map = mpapi.createMap({
    ...portalConfig,
    layerConf: services
});
["1001", "2001", "2002"].forEach(id =>
    window.mpapi.layers.push(mpapi.addLayer(id))
);
//*/

/* ASYNCHRONOUS EXAMPLE 1: work with layerConf callback
mpapi.rawLayerList.initializeLayerList(
    hamburgServicesUrl,
    conf => {
        window.mpapi.map = mpapi.createMap({
            ...portalConfig,
            layerConf: conf
        });
        ["6357", "6074"].forEach(id =>
            window.mpapi.layers.push(mpapi.addLayer(id))
        );
    }
);
//*/

/* ASYNCHRONOUS EXAMPLE 2: work with createMap callback
window.mpapi.map = mpapi.createMap(
    {...portalConfig, layerConf: hamburgServicesUrl},
    {
        callback: () =>
            ["6357", "6074"].forEach(id =>
                window.mpapi.layers.push(mpapi.addLayer(id))
            )
    }
);
//*/
