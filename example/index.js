// needed for dev mode since parcel babels async/await
import "babel-polyfill";
import "ol/ol.css";

import {Style, Stroke, Fill} from "ol/style.js";

import * as mpapi from "../src";
import abstractAPI from "../abstraction/api.js";

import services from "./config/services.json";
import portalConfig from "./config/portal.json";
import localGeoJSON from "./config/localGeoJSON.js";
import {load3DScript} from "../src/lib/load3DScript";

//* Add elements to window to play with API in console
window.mpapi = {
    ...mpapi,
    map2D: null,
    map: null
};
// */
//* Cleans up map before it is re-rendered (happens on every save during dev mode)
document.getElementById(portalConfig.target).innerHTML = "";
// add a click-listener to button, that creates a 3D-map on click
document.getElementById("enable").addEventListener("click", function (portalConfig) {
    if (window.mpapi.map2D === null) {
        window.mpapi.map2D = window.mpapi.map;
    }

    if (window.mpapi.map.mapMode === "3D") {
        window.mpapi.map.setEnabled(false);
        window.mpapi.map = window.mpapi.map2D;
    }
    else {
        const lib = portalConfig.cesiumLib ? portalConfig.cesiumLib : "https://geoportal-hamburg.de/mastercode/cesium/1_84/Cesium.js";

        load3DScript(lib, function Loaded3DCallback () {
            const settings3D = {
                    "map2D": window.mpapi.map2D
                },
                map3D = abstractAPI.map.createMap(settings3D, {}, "3D");

            window.mpapi.map = map3D;
            window.mpapi.map.setEnabled(true);
        });
    }
});

//* Fake service that holds client-side prepared geojson; also nice to test automatic transformation since data is in WGS 84
const hamburgServicesUrl = "http://geoportal-hamburg.de/lgv-config/services-internet.json",
    localService = {
        id: "2002",
        typ: "GeoJSON",
        features: localGeoJSON
    },
    config = {
        ...portalConfig,
        layerConf: services
    },
    map2D = abstractAPI.map.createMap(config, "2D");

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
window.mpapi.map = map2D;

["2001", "2002", "1002"].forEach(id => window.mpapi.map.addLayer(id));


// */

/* ASYNCHRONOUS EXAMPLE 1: work with layerConf callback
document.getElementById("enable").style.display = "none";
mpapi.rawLayerList.initializeLayerList(
    hamburgServicesUrl,
    conf => {
        window.mpapi.map = abstractAPI.map.createMap({
            ...portalConfig,
            layerConf: conf,
            layers: null
        });
        ["6357", "6074"].forEach(
            id => window.mpapi.map.addLayer(id)
        );
    }, "2D"
);
//*/

/* ASYNCHRONOUS EXAMPLE 2: work with createMap callback
document.getElementById("enable").style.display = "none";
window.mpapi.map = abstractAPI.map.createMap(
    {...portalConfig, layerConf: hamburgServicesUrl, layers: [
        { id: "6357" },
        { id: "453", transparency: 50 }
    ]},
    {
        callback: () =>
            ["6074"].forEach(
                id => window.mpapi.map.addLayer(id)
            )
    },
    "2D"
);
//*/

/* SEARCH FUNCTION EXAMPLE
// You may e.g. copy this code to the browser's console to run a search.

window.mpapi.search("Eiffe",  {
    map: window.mpapi.map,
    zoom: true,
    zoomToParams: {duration: 1000, maxZoom: 8},
    searchStreets: true
}).then(x => console.log(x)).catch(e => console.error(e))

window.mpapi.search("Mümmelmannsberg 72",  {
    map: window.mpapi.map,
    zoom: true,
    zoomToParams: {duration: 1000, maxZoom: 8},
    searchAddress: true
}).then(x => console.log(x)).catch(e => console.error(e))

//*/
