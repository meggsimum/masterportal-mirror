import {createMap, addLayer} from "./map";
import {createMapView} from "./mapView";
import * as crs from "./crs";
import * as rawLayerList from "./rawLayerList";
import * as wms from "./layer/wms";
import * as geojson from "./layer/geojson";
import * as layerLib from "./layer/lib";
import setBackgroundImage from "./lib/setBackgroundImage";

var lib = {
    setBackgroundImage
};

export {
    createMap,
    createMapView,
    addLayer,
    wms,
    geojson,
    layerLib,
    lib,
    rawLayerList,
    crs
};
