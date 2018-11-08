// needed for dev mode since parcel babels async/await
import "babel-polyfill";
import "ol/ol.css";

import {createMap, addLayer} from "../src/index.js";
import services from "./config/services.json";
import portalConfig from "./config/portal.json";

//* Cleans up map before it is re-rendered (happens on every save during dev mode)
document.getElementById(portalConfig.target).innerHTML = "";
// */

// Put your test code here
const config = {
    ...portalConfig,
    layerConf: services
};
const map = createMap(config);
const layerWMS = addLayer("1001");
const layerGeoJSON = addLayer("2001");
// setTimeout(() => {
//     const layerWMS = addLayer("6357");
//     const layerGeoJSON = addLayer("6074");

    // logging for each execution
    console.log("%c example/index.js executed", "background: #222; color: #bada55");
    console.log("config", config);
    console.log("map", map);
    console.log("layerWMS", layerWMS);
    console.log("layerGeoJSON", layerGeoJSON);
// }, 5000);
