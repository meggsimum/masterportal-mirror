// needed for dev mode since parcel babels async/await
import "babel-polyfill";
import "ol/ol.css";

import {createMap, addLayer} from "../src/index.js";
import {initializeLayerList} from "../src/rawLayerList.js";
import services from "./config/services.json";
import portalConfig from "./config/portal.json";

//* Cleans up map before it is re-rendered (happens on every save during dev mode)
document.getElementById(portalConfig.target).innerHTML = "";
// */

let config, map, layerWMS, layerGeoJSON;

const log = () => {
    console.log("%c¯ log example state ¯", "background: #222; color: #bada55");
    console.log("config", config);
    console.log("map", map);
    console.log("layerWMS", layerWMS);
    console.log("layerGeoJSON", layerGeoJSON);
    console.log("%c_ /log example state _", "background: #222; color: #bada55");
};

const renderMap = ({ configuration, wmsLayerId, geoJsonLayerId }) => {
    config = configuration;
    map = createMap(config);
    layerWMS = addLayer(wmsLayerId);
    layerGeoJSON = addLayer(geoJsonLayerId);
    log();
}

/* SYNCHRONOUS EXAMPLE: layerConf is known
renderMap({
    configuration: { ...portalConfig, layerConf: services },
    wmsLayerId: "1001",
    geoJsonLayerId: "2001"
});
//*/

//* ASYNCHRONOUS EXAMPLE: layer Conf is loaded
initializeLayerList(
    "http://geoportal-hamburg.de/lgv-config/services-internet.json",
    conf => renderMap({
        configuration: { ...portalConfig, layerConf: conf },
        wmsLayerId: "6357",
        geoJsonLayerId: "6074"
    })
);
//*/
